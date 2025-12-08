import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { TrendingUp, TrendingDown, Users } from "lucide-react";
import type { Market } from "@/hooks/useMarkets";
import { fetchMarketTransactions } from "@/lib/polymarket-api";
import { WalletProfileModal } from "./WalletProfileModal";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "framer-motion";

interface WalletBubbleMapProps {
  market?: Market;
}

interface WalletData {
  id: string;
  address: string;
  side: "yes" | "no";
  amount: number;
  size: number;
  tier: "whale" | "large" | "medium" | "small";
  trades: number;
  avgPrice: number;
  profit: number;
  entryTime: Date;
}

interface BubblePosition {
  x: number;
  y: number;
}

const WalletBubbleMap = ({ market }: WalletBubbleMapProps) => {
  const [hoveredWallet, setHoveredWallet] = useState<WalletData | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [realWallets, setRealWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [draggedWallet, setDraggedWallet] = useState<string | null>(null);
  const [positions, setPositions] = useState<Map<string, BubblePosition>>(new Map());
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch real wallet data from Polymarket API
  useEffect(() => {
    const fetchWalletData = async () => {
      const isPolymarket = market && market.source.toLowerCase() === 'polymarket';
      
      if (!isPolymarket || !market) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const transactions = await fetchMarketTransactions(market.market_id, 1000);

        if (transactions && transactions.length > 0) {
          const walletMap = new Map<string, {
            address: string;
            volume: number;
            trades: number;
            side: 'yes' | 'no';
            avgPrice: number;
            totalCost: number;
            firstEntry: Date;
          }>();

          transactions.forEach((tx) => {
            const walletAddress = tx.address || tx.wallet_address || '';
            const existing = walletMap.get(walletAddress);
            const txDate = new Date(tx.timestamp);
            
            if (existing) {
              existing.volume += Number(tx.amount);
              existing.trades += 1;
              existing.totalCost += Number(tx.amount) * Number(tx.price);
              if (txDate < existing.firstEntry) {
                existing.firstEntry = txDate;
              }
            } else {
              walletMap.set(walletAddress, {
                address: walletAddress,
                volume: Number(tx.amount),
                trades: 1,
                side: tx.side as 'yes' | 'no',
                avgPrice: Number(tx.price),
                totalCost: Number(tx.amount) * Number(tx.price),
                firstEntry: txDate
              });
            }
          });

          const walletsArray = Array.from(walletMap.values()).map(w => ({
            ...w,
            avgPrice: w.totalCost / w.volume
          }));

          setRealWallets(walletsArray);
        } else {
          setError('No transaction data available yet');
        }
      } catch (err: any) {
        console.error('Error fetching wallet data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWalletData();
    const interval = setInterval(fetchWalletData, 60 * 1000);
    return () => clearInterval(interval);
  }, [market?.market_id]);

  const getTier = (volume: number): WalletData['tier'] => {
    if (volume >= 10000) return 'whale';
    if (volume >= 1000) return 'large';
    if (volume >= 100) return 'medium';
    return 'small';
  };

  const getSize = (amount: number, tier: string): number => {
    // Smaller, cleaner bubble sizes
    if (tier === 'whale') {
      const normalized = Math.min(amount / 50000, 1);
      return 45 + normalized * 35; // 45-80px
    }
    if (tier === 'large') {
      const normalized = Math.min((amount - 1000) / 9000, 1);
      return 32 + normalized * 18; // 32-50px
    }
    if (tier === 'medium') {
      const normalized = Math.min((amount - 100) / 900, 1);
      return 22 + normalized * 12; // 22-34px
    }
    return 14 + Math.min(amount / 100, 1) * 8; // 14-22px
  };

  const wallets = useMemo<WalletData[]>(() => {
    if (realWallets.length === 0) return [];

    const yesPrice = market?.yes_price || 0.5;
    const noPrice = market?.no_price || 0.5;

    return realWallets.map((w, index) => {
      const tier = getTier(w.volume);
      const currentPrice = w.side === 'yes' ? yesPrice : noPrice;
      const pnl = (currentPrice - w.avgPrice) * w.volume;
      const size = getSize(w.volume, tier);

      return {
        id: `${w.address}-${index}`,
        address: w.address,
        side: w.side,
        amount: w.volume,
        size,
        tier,
        trades: w.trades,
        avgPrice: w.avgPrice,
        profit: pnl,
        entryTime: w.firstEntry,
      };
    }).sort((a, b) => b.amount - a.amount);
  }, [realWallets, market]);

  // Organize wallets into quadrants
  const organizedWallets = useMemo(() => {
    const yesWhales = wallets.filter(w => w.side === 'yes' && (w.tier === 'whale' || w.tier === 'large')).sort((a, b) => b.amount - a.amount);
    const yesSmall = wallets.filter(w => w.side === 'yes' && (w.tier === 'medium' || w.tier === 'small')).sort((a, b) => b.amount - a.amount);
    const noWhales = wallets.filter(w => w.side === 'no' && (w.tier === 'whale' || w.tier === 'large')).sort((a, b) => b.amount - a.amount);
    const noSmall = wallets.filter(w => w.side === 'no' && (w.tier === 'medium' || w.tier === 'small')).sort((a, b) => b.amount - a.amount);

    return { yesWhales, yesSmall, noWhales, noSmall };
  }, [wallets]);

  // Grid-based organized positioning algorithm - no overlaps
  const calculateOrganizedPositions = useCallback((
    bubbles: WalletData[],
    containerWidth: number,
    containerHeight: number,
    offsetX: number = 0,
    offsetY: number = 0
  ): Map<string, BubblePosition> => {
    const newPositions = new Map<string, BubblePosition>();
    if (bubbles.length === 0) return newPositions;

    const sorted = [...bubbles].sort((a, b) => b.size - a.size);
    const minPadding = 12; // Minimum space between bubbles
    
    // Calculate total area needed and determine grid layout
    const totalBubbles = sorted.length;
    
    // Use a force-directed layout with strong separation
    const placed: { id: string; x: number; y: number; r: number; size: number }[] = [];
    
    // Calculate rows based on container aspect ratio
    const aspectRatio = containerWidth / containerHeight;
    const cols = Math.ceil(Math.sqrt(totalBubbles * aspectRatio));
    const rows = Math.ceil(totalBubbles / cols);
    
    // Calculate cell sizes with generous padding
    const cellWidth = containerWidth / cols;
    const cellHeight = containerHeight / rows;
    
    // Place bubbles in a grid pattern, largest first
    sorted.forEach((bubble, index) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      
      // Center each bubble in its cell
      const cellCenterX = cellWidth * (col + 0.5);
      const cellCenterY = cellHeight * (row + 0.5);
      
      // Add slight offset for visual interest (honeycomb effect)
      const honeycombOffset = row % 2 === 0 ? 0 : cellWidth * 0.15;
      
      const x = Math.max(bubble.size / 2 + minPadding, 
                Math.min(containerWidth - bubble.size / 2 - minPadding, 
                cellCenterX + honeycombOffset));
      const y = Math.max(bubble.size / 2 + minPadding,
                Math.min(containerHeight - bubble.size / 2 - minPadding,
                cellCenterY));
      
      placed.push({ 
        id: bubble.id, 
        x, 
        y, 
        r: bubble.size / 2,
        size: bubble.size
      });
    });
    
    // Force-directed separation to ensure no overlaps
    for (let iteration = 0; iteration < 100; iteration++) {
      let maxOverlap = 0;
      
      for (let i = 0; i < placed.length; i++) {
        const p1 = placed[i];
        let fx = 0, fy = 0;
        
        for (let j = 0; j < placed.length; j++) {
          if (i === j) continue;
          const p2 = placed[j];
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDist = p1.r + p2.r + minPadding;
          
          if (distance < minDist) {
            const overlap = minDist - distance;
            maxOverlap = Math.max(maxOverlap, overlap);
            
            if (distance > 0.1) {
              // Push bubbles apart proportionally
              const force = overlap * 0.5;
              fx += (dx / distance) * force;
              fy += (dy / distance) * force;
            } else {
              // If bubbles are at same position, push in random direction
              const angle = Math.random() * Math.PI * 2;
              fx += Math.cos(angle) * minDist * 0.5;
              fy += Math.sin(angle) * minDist * 0.5;
            }
          }
        }
        
        // Apply forces
        p1.x += fx;
        p1.y += fy;
        
        // Keep strictly in bounds
        p1.x = Math.max(p1.r + minPadding, Math.min(containerWidth - p1.r - minPadding, p1.x));
        p1.y = Math.max(p1.r + minPadding, Math.min(containerHeight - p1.r - minPadding, p1.y));
      }
      
      // Stop if no significant overlaps remain
      if (maxOverlap < 1) break;
    }
    
    // Set final positions
    placed.forEach(p => {
      newPositions.set(p.id, { x: p.x + offsetX, y: p.y + offsetY });
    });

    return newPositions;
  }, []);

  // Calculate positions for all quadrants
  useEffect(() => {
    if (!containerRef.current || wallets.length === 0) return;

    const rect = containerRef.current.getBoundingClientRect();
    const halfWidth = rect.width / 2 - 2;
    const halfHeight = rect.height / 2 - 20;

    const allPositions = new Map<string, BubblePosition>();

    // YES Whales - Top Left
    const yesWhalePos = calculateOrganizedPositions(
      organizedWallets.yesWhales,
      halfWidth - 20,
      halfHeight - 20,
      10,
      30
    );
    yesWhalePos.forEach((v, k) => allPositions.set(k, v));

    // NO Whales - Top Right
    const noWhalePos = calculateOrganizedPositions(
      organizedWallets.noWhales,
      halfWidth - 20,
      halfHeight - 20,
      halfWidth + 10,
      30
    );
    noWhalePos.forEach((v, k) => allPositions.set(k, v));

    // YES Small - Bottom Left
    const yesSmallPos = calculateOrganizedPositions(
      organizedWallets.yesSmall.slice(0, 30),
      halfWidth - 20,
      halfHeight - 20,
      10,
      halfHeight + 30
    );
    yesSmallPos.forEach((v, k) => allPositions.set(k, v));

    // NO Small - Bottom Right
    const noSmallPos = calculateOrganizedPositions(
      organizedWallets.noSmall.slice(0, 30),
      halfWidth - 20,
      halfHeight - 20,
      halfWidth + 10,
      halfHeight + 30
    );
    noSmallPos.forEach((v, k) => allPositions.set(k, v));

    setPositions(allPositions);
  }, [wallets, organizedWallets, calculateOrganizedPositions]);

  const stats = useMemo(() => {
    const yesVolume = wallets.filter(w => w.side === "yes").reduce((sum, w) => sum + w.amount, 0);
    const noVolume = wallets.filter(w => w.side === "no").reduce((sum, w) => sum + w.amount, 0);
    const yesWallets = wallets.filter(w => w.side === "yes").length;
    const noWallets = wallets.filter(w => w.side === "no").length;
    const whaleCount = wallets.filter(w => w.tier === 'whale').length;
    
    return { yesVolume, noVolume, yesWallets, noWallets, whaleCount };
  }, [wallets]);

  const handleDrag = useCallback((walletId: string, x: number, y: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    
    setPositions(prev => {
      const newPositions = new Map(prev);
      newPositions.set(walletId, {
        x: Math.max(20, Math.min(rect.width - 20, x)),
        y: Math.max(20, Math.min(rect.height - 20, y))
      });
      return newPositions;
    });
  }, []);

  const formatAmount = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(amount >= 10000 ? 0 : 1)}k`;
    }
    return `$${amount.toFixed(0)}`;
  };

  if (market && market.source.toLowerCase() !== 'polymarket') {
    return (
      <div className="w-full h-[700px] rounded-2xl bg-gradient-to-br from-muted/20 to-muted/5 border border-border/30 flex items-center justify-center">
        <p className="text-muted-foreground">Live wallet distribution only available for Polymarket markets</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-[700px] rounded-2xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-border/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  if (error || wallets.length === 0) {
    return (
      <div className="w-full h-[700px] rounded-2xl bg-gradient-to-br from-muted/20 to-muted/5 border border-border/30 flex items-center justify-center">
        <p className="text-muted-foreground">{error || 'No wallet data available yet'}</p>
      </div>
    );
  }

  const allDisplayedWallets = [
    ...organizedWallets.yesWhales,
    ...organizedWallets.noWhales,
    ...organizedWallets.yesSmall.slice(0, 30),
    ...organizedWallets.noSmall.slice(0, 30)
  ];

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-foreground">
            Live Wallet Distribution
          </h2>
          <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
            <Users className="w-4 h-4" />
            {wallets.length} wallets • {stats.whaleCount} whales
            <span className="text-primary ml-2">●</span> {stats.yesWallets} YES
            <span className="text-secondary ml-2">●</span> {stats.noWallets} NO
          </p>
        </div>
      </div>

      {/* Main Bubble Map */}
      <div 
        ref={containerRef}
        className="relative w-full h-[700px] rounded-2xl overflow-hidden border border-border/20"
        style={{
          background: 'linear-gradient(135deg, hsl(224 71% 4%) 0%, hsl(224 71% 6%) 100%)'
        }}
      >
        {/* Background with quadrant gradients */}
        <div className="absolute inset-0 pointer-events-none">
          {/* YES side (left) - Green gradient */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-1/2"
            style={{
              background: 'radial-gradient(ellipse 80% 80% at 20% 50%, hsla(142, 76%, 42%, 0.15) 0%, transparent 70%)'
            }}
          />
          
          {/* NO side (right) - Red gradient */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-1/2"
            style={{
              background: 'radial-gradient(ellipse 80% 80% at 80% 50%, hsla(0, 72%, 51%, 0.15) 0%, transparent 70%)'
            }}
          />

          {/* Subtle stars/particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white/20"
              style={{
                width: Math.random() * 2 + 1,
                height: Math.random() * 2 + 1,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>

        {/* Center divider */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/50 to-transparent transform -translate-x-1/2" />

        {/* Horizontal divider */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-gradient-to-r from-transparent via-border/30 to-transparent transform -translate-y-1/2" />

        {/* Side Labels */}
        <div className="absolute top-4 left-4 z-20">
          <span 
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ 
              color: 'hsl(142, 76%, 42%)',
              textShadow: '0 0 30px hsla(142, 76%, 42%, 0.5)'
            }}
          >
            YES
          </span>
        </div>
        <div className="absolute top-4 right-4 z-20">
          <span 
            className="text-2xl sm:text-3xl font-black tracking-tight"
            style={{ 
              color: 'hsl(0, 72%, 51%)',
              textShadow: '0 0 30px hsla(0, 72%, 51%, 0.5)'
            }}
          >
            NO
          </span>
        </div>

        {/* Tier Labels */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 pointer-events-none">
          <div className="text-center">
            <div className="absolute -top-[calc(50%-40px)] left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <span className="text-sm font-semibold text-foreground/60 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full border border-border/30">
                $10,000+
              </span>
            </div>
            <div className="absolute top-[calc(50%-20px)] left-1/2 transform -translate-x-1/2 whitespace-nowrap">
              <span className="text-xs font-medium text-muted-foreground bg-background/60 backdrop-blur-sm px-3 py-1 rounded-full border border-border/20">
                $1,000-$10,000
              </span>
            </div>
          </div>
        </div>

        {/* Wallet Bubbles */}
        <AnimatePresence>
          {allDisplayedWallets.map((wallet, index) => {
            const pos = positions.get(wallet.id);
            if (!pos) return null;

            const isYes = wallet.side === 'yes';
            const baseColor = isYes ? 'hsl(142, 76%, 42%)' : 'hsl(0, 72%, 51%)';
            const glowColor = isYes ? 'hsla(142, 76%, 42%, 0.6)' : 'hsla(0, 72%, 51%, 0.6)';
            const isWhale = wallet.tier === 'whale' || wallet.tier === 'large';
            const isHovered = hoveredWallet?.id === wallet.id;
            const isDragging = draggedWallet === wallet.id;

            return (
              <motion.div
                key={wallet.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: isDragging ? 1.1 : isHovered ? 1.08 : 1,
                  x: pos.x - wallet.size / 2,
                  y: pos.y - wallet.size / 2,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ 
                  type: 'spring',
                  stiffness: 300,
                  damping: 25,
                  delay: index * 0.02
                }}
                drag
                dragMomentum={false}
                onDragStart={() => setDraggedWallet(wallet.id)}
                onDrag={(_, info) => {
                  handleDrag(wallet.id, info.point.x - (containerRef.current?.getBoundingClientRect().left || 0), info.point.y - (containerRef.current?.getBoundingClientRect().top || 0));
                }}
                onDragEnd={() => setDraggedWallet(null)}
                onMouseEnter={() => setHoveredWallet(wallet)}
                onMouseLeave={() => setHoveredWallet(null)}
                onClick={() => setSelectedWallet(wallet)}
                className="absolute cursor-grab active:cursor-grabbing select-none"
                style={{
                  width: wallet.size,
                  height: wallet.size,
                  zIndex: isDragging ? 100 : isHovered ? 50 : isWhale ? 20 : 10,
                }}
              >
                {/* Outer glow */}
                <div
                  className="absolute inset-0 rounded-full transition-all duration-300"
                  style={{
                    background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                    transform: isHovered || isDragging ? 'scale(1.5)' : 'scale(1.2)',
                    opacity: isWhale ? 0.8 : 0.4,
                  }}
                />

                {/* Main bubble */}
                <div
                  className="absolute inset-0 rounded-full transition-all duration-300"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, ${isYes ? 'hsla(142, 80%, 60%, 0.9)' : 'hsla(0, 80%, 65%, 0.9)'} 0%, ${baseColor} 50%, ${isYes ? 'hsl(142, 76%, 30%)' : 'hsl(0, 72%, 35%)'} 100%)`,
                    boxShadow: `
                      inset 0 -2px 10px rgba(0,0,0,0.3),
                      inset 0 2px 10px ${isYes ? 'rgba(142, 255, 142, 0.3)' : 'rgba(255, 142, 142, 0.3)'},
                      0 0 ${isWhale ? '40px' : '20px'} ${glowColor}
                    `,
                    border: `${isWhale ? '3px' : '2px'} solid ${isYes ? 'rgba(142, 255, 142, 0.4)' : 'rgba(255, 142, 142, 0.4)'}`,
                  }}
                >
                  {/* Amount label */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span 
                      className="font-bold text-white drop-shadow-lg text-center leading-none"
                      style={{ 
                        fontSize: wallet.size > 80 ? '14px' : wallet.size > 50 ? '11px' : wallet.size > 35 ? '9px' : '7px',
                        textShadow: '0 1px 3px rgba(0,0,0,0.5)'
                      }}
                    >
                      {formatAmount(wallet.amount)}
                    </span>
                  </div>
                </div>

                {/* Connection lines for whales (decorative) */}
                {isWhale && (
                  <svg 
                    className="absolute pointer-events-none opacity-30"
                    style={{
                      width: wallet.size * 2,
                      height: wallet.size * 2,
                      left: -wallet.size / 2,
                      top: -wallet.size / 2,
                    }}
                  >
                    <circle
                      cx={wallet.size}
                      cy={wallet.size}
                      r={wallet.size * 0.8}
                      fill="none"
                      stroke={baseColor}
                      strokeWidth="0.5"
                      strokeDasharray="4 4"
                    />
                  </svg>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Hover Tooltip */}
        <AnimatePresence>
          {hoveredWallet && !draggedWallet && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="fixed z-[200] pointer-events-none"
              style={{
                left: (positions.get(hoveredWallet.id)?.x || 0) + (containerRef.current?.getBoundingClientRect().left || 0),
                top: (positions.get(hoveredWallet.id)?.y || 0) + (containerRef.current?.getBoundingClientRect().top || 0) - hoveredWallet.size / 2 - 80,
              }}
            >
              <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl p-3 shadow-2xl min-w-[180px] transform -translate-x-1/2">
                <div className="text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-foreground/80">
                      {hoveredWallet.address.slice(0, 6)}...{hoveredWallet.address.slice(-4)}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] ${hoveredWallet.side === 'yes' ? 'border-primary text-primary' : 'border-secondary text-secondary'}`}
                    >
                      {hoveredWallet.side.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 pt-1 border-t border-border/30">
                    <div className="text-muted-foreground">Position</div>
                    <div className="text-right font-medium">${hoveredWallet.amount.toLocaleString()}</div>
                    <div className="text-muted-foreground">Trades</div>
                    <div className="text-right font-medium">{hoveredWallet.trades}</div>
                    <div className="text-muted-foreground">P&L</div>
                    <div className={`text-right font-medium ${hoveredWallet.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      {hoveredWallet.profit >= 0 ? '+' : ''}{hoveredWallet.profit.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
          <div className="flex items-center gap-2 text-primary mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs font-medium">YES Volume</span>
          </div>
          <div className="text-xl font-bold text-foreground">${stats.yesVolume.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
          <div className="flex items-center gap-2 text-secondary mb-1">
            <TrendingDown className="w-4 h-4" />
            <span className="text-xs font-medium">NO Volume</span>
          </div>
          <div className="text-xl font-bold text-foreground">${stats.noVolume.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-transparent border border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium">YES Wallets</span>
          </div>
          <div className="text-xl font-bold text-foreground">{stats.yesWallets}</div>
        </div>
        <div className="p-4 rounded-xl bg-gradient-to-br from-secondary/10 to-transparent border border-border/30">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Users className="w-4 h-4" />
            <span className="text-xs font-medium">NO Wallets</span>
          </div>
          <div className="text-xl font-bold text-foreground">{stats.noWallets}</div>
        </div>
      </div>

      <WalletProfileModal
        isOpen={!!selectedWallet}
        onClose={() => setSelectedWallet(null)}
        wallet={selectedWallet}
      />
    </div>
  );
};

export default WalletBubbleMap;
