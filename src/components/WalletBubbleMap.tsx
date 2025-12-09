import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { TrendingUp, TrendingDown, Users, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
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

type TierFilter = 'all' | 'whale' | 'large' | 'small';  // $10k+, $1k-10k, $0-1k

const WalletBubbleMap = ({ market }: WalletBubbleMapProps) => {
  const [hoveredWallet, setHoveredWallet] = useState<WalletData | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [realWallets, setRealWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [positions, setPositions] = useState<Map<string, BubblePosition>>(new Map());
  const [tierFilter, setTierFilter] = useState<TierFilter>('all');
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  
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

  // 3 tiers: $10k+ (whale), $1k-10k (large), $0-1k (small)
  const getTier = (volume: number): WalletData['tier'] => {
    if (volume >= 10000) return 'whale';    // $10k+
    if (volume >= 1000) return 'large';     // $1k-10k
    return 'small';                          // $0-1k
  };

  // Dynamic sizing based on amount - 3 tier system
  const getSize = (amount: number, tier: string, maxAmount: number): number => {
    // Size range based on 3 tiers
    if (tier === 'whale') {  // $10k+
      const normalized = Math.min(amount / Math.max(maxAmount, 10000), 1);
      return 55 + normalized * 35; // 55-90px
    }
    if (tier === 'large') {  // $1k-10k
      const normalized = (amount - 1000) / 9000;
      return 30 + normalized * 25; // 30-55px
    }
    // small: $0-1k
    const normalized = amount / 1000;
    return 16 + normalized * 14; // 16-30px
  };

  const wallets = useMemo<WalletData[]>(() => {
    if (realWallets.length === 0) return [];

    const yesPrice = market?.yes_price || 0.5;
    const noPrice = market?.no_price || 0.5;
    
    // Find max amount for normalization
    const maxAmount = Math.max(...realWallets.map(w => w.volume));

    return realWallets.map((w, index) => {
      const tier = getTier(w.volume);
      const currentPrice = w.side === 'yes' ? yesPrice : noPrice;
      const pnl = (currentPrice - w.avgPrice) * w.volume;
      const size = getSize(w.volume, tier, maxAmount);

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

  // Separate YES and NO wallets - take top 100 each, apply tier filter
  const { yesWallets, noWallets } = useMemo(() => {
    const filterByTier = (w: WalletData) => tierFilter === 'all' || w.tier === tierFilter;
    const yes = wallets.filter(w => w.side === 'yes' && filterByTier(w)).slice(0, 100);
    const no = wallets.filter(w => w.side === 'no' && filterByTier(w)).slice(0, 100);
    return { yesWallets: yes, noWallets: no };
  }, [wallets, tierFilter]);

  // Perfect radial positioning: 3-tier zones ($0-1k center, $1k-10k middle, $10k+ outer)
  const calculateRadialPositions = useCallback((
    bubbles: WalletData[],
    centerX: number,
    centerY: number,
    maxRadius: number,
    side: 'left' | 'right'
  ): Map<string, BubblePosition> => {
    const newPositions = new Map<string, BubblePosition>();
    if (bubbles.length === 0) return newPositions;

    // Sort by amount ASCENDING - smallest first (center), largest last (outside)
    const sorted = [...bubbles].sort((a, b) => a.amount - b.amount);
    
    const placed: { id: string; x: number; y: number; r: number; targetRadius: number }[] = [];
    const padding = 6;

    // Place bubbles based on their tier in the correct zone
    sorted.forEach((bubble) => {
      const r = bubble.size / 2;
      
      // Calculate target radius based on 3-tier zones
      let targetRadius: number;
      if (bubble.tier === 'small') {
        // $0-1k: center zone (0-33% of max radius)
        const normalized = bubble.amount / 1000;
        targetRadius = normalized * maxRadius * 0.32;
      } else if (bubble.tier === 'large') {
        // $1k-10k: middle zone (33-66% of max radius)
        const normalized = (bubble.amount - 1000) / 9000;
        targetRadius = maxRadius * 0.33 + normalized * maxRadius * 0.33;
      } else {
        // $10k+ (whale): outer zone (66-100% of max radius)
        const normalized = Math.min((bubble.amount - 10000) / 40000, 1);
        targetRadius = maxRadius * 0.66 + normalized * maxRadius * 0.34;
      }
      
      // Full circle for each side
      const angleRange = side === 'left' 
        ? { min: Math.PI * 0.55, max: Math.PI * 1.45 }  // Left semicircle
        : { min: -Math.PI * 0.45, max: Math.PI * 0.45 }; // Right semicircle
      
      // Find best position on the target ring
      let bestPos = { x: centerX, y: centerY };
      let minOverlap = Infinity;
      
      // Try many angles at the target radius
      const attempts = 120;
      for (let attempt = 0; attempt < attempts; attempt++) {
        // Distribute angles evenly with some randomness
        const baseAngle = angleRange.min + (attempt / attempts) * (angleRange.max - angleRange.min);
        const angle = baseAngle + (Math.random() - 0.5) * 0.15;
        
        // Keep close to target radius
        const radiusJitter = (Math.random() - 0.5) * 15;
        const actualRadius = Math.max(0, targetRadius + radiusJitter);
        
        const testX = centerX + Math.cos(angle) * actualRadius;
        const testY = centerY + Math.sin(angle) * actualRadius;
        
        // Check overlap with all placed bubbles
        let totalOverlap = 0;
        for (const p of placed) {
          const dx = testX - p.x;
          const dy = testY - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = r + p.r + padding;
          if (dist < minDist) {
            totalOverlap += (minDist - dist) * 2;
          }
        }
        
        // Penalize deviation from target radius to maintain radial structure
        const radiusDeviation = Math.abs(actualRadius - targetRadius) * 0.1;
        totalOverlap += radiusDeviation;
        
        if (totalOverlap < minOverlap) {
          minOverlap = totalOverlap;
          bestPos = { x: testX, y: testY };
          if (totalOverlap < 0.5) break;
        }
      }
      
      placed.push({ id: bubble.id, x: bestPos.x, y: bestPos.y, r, targetRadius });
    });

    // Force-directed refinement - preserve radial structure
    for (let iteration = 0; iteration < 100; iteration++) {
      let maxOverlap = 0;
      
      for (let i = 0; i < placed.length; i++) {
        const p1 = placed[i];
        let fx = 0, fy = 0;
        
        // Separation from other bubbles
        for (let j = 0; j < placed.length; j++) {
          if (i === j) continue;
          const p2 = placed[j];
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const minDist = p1.r + p2.r + padding;
          
          if (distance < minDist && distance > 0.1) {
            const overlap = minDist - distance;
            maxOverlap = Math.max(maxOverlap, overlap);
            // Push apart along connection line
            const force = overlap * 0.35;
            fx += (dx / distance) * force;
            fy += (dy / distance) * force;
          }
        }
        
        // Gentle pull toward target radius to maintain radial structure
        const currentRadius = Math.sqrt(Math.pow(p1.x - centerX, 2) + Math.pow(p1.y - centerY, 2));
        if (currentRadius > 0.1) {
          const radiusDiff = p1.targetRadius - currentRadius;
          const pullStrength = radiusDiff * 0.05;
          fx += ((p1.x - centerX) / currentRadius) * pullStrength;
          fy += ((p1.y - centerY) / currentRadius) * pullStrength;
        }
        
        // Apply forces
        p1.x += fx;
        p1.y += fy;
        
        // Keep within bounds
        const containerWidth = containerRef.current?.getBoundingClientRect().width || 800;
        const containerHeight = containerRef.current?.getBoundingClientRect().height || 600;
        const minX = p1.r + 15;
        const maxX = containerWidth - p1.r - 15;
        const minY = p1.r + 55;
        const maxY = containerHeight - p1.r - 15;
        
        p1.x = Math.max(minX, Math.min(maxX, p1.x));
        p1.y = Math.max(minY, Math.min(maxY, p1.y));
      }
      
      if (maxOverlap < 0.3) break;
    }

    placed.forEach(p => {
      newPositions.set(p.id, { x: p.x, y: p.y });
    });

    return newPositions;
  }, []);

  // Calculate positions for both sides
  useEffect(() => {
    if (!containerRef.current || wallets.length === 0) return;

    const rect = containerRef.current.getBoundingClientRect();
    const halfWidth = rect.width / 2;
    const height = rect.height;
    
    const allPositions = new Map<string, BubblePosition>();

    // YES side - left, center point in middle of left half
    const yesCenterX = halfWidth * 0.5;
    const yesCenterY = height * 0.5;
    const yesMaxRadius = Math.min(halfWidth * 0.45, height * 0.4);
    
    const yesPos = calculateRadialPositions(yesWallets, yesCenterX, yesCenterY, yesMaxRadius, 'left');
    yesPos.forEach((v, k) => allPositions.set(k, v));

    // NO side - right, center point in middle of right half
    const noCenterX = halfWidth * 1.5;
    const noCenterY = height * 0.5;
    const noMaxRadius = Math.min(halfWidth * 0.45, height * 0.4);
    
    const noPos = calculateRadialPositions(noWallets, noCenterX, noCenterY, noMaxRadius, 'right');
    noPos.forEach((v, k) => allPositions.set(k, v));

    setPositions(allPositions);
  }, [wallets, yesWallets, noWallets, calculateRadialPositions]);

  const stats = useMemo(() => {
    const yesVolume = wallets.filter(w => w.side === "yes").reduce((sum, w) => sum + w.amount, 0);
    const noVolume = wallets.filter(w => w.side === "no").reduce((sum, w) => sum + w.amount, 0);
    const yesCount = wallets.filter(w => w.side === "yes").length;
    const noCount = wallets.filter(w => w.side === "no").length;
    const whaleCount = wallets.filter(w => w.tier === 'whale').length;
    
    return { yesVolume, noVolume, yesWallets: yesCount, noWallets: noCount, whaleCount };
  }, [wallets]);

  const formatAmount = (amount: number) => {
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(amount >= 10000 ? 0 : 1)}k`;
    }
    return `$${amount.toFixed(0)}`;
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => { setZoom(1); setPan({ x: 0, y: 0 }); };

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning && zoom > 1) {
      setPan({ x: e.clientX - panStart.x, y: e.clientY - panStart.y });
    }
  };

  const handleMouseUp = () => setIsPanning(false);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    setZoom(prev => Math.max(0.5, Math.min(3, prev + delta)));
  };

  if (market && market.source.toLowerCase() !== 'polymarket') {
    return (
      <div className="w-full h-[600px] rounded-2xl bg-gradient-to-br from-muted/20 to-muted/5 border border-border/30 flex items-center justify-center">
        <p className="text-muted-foreground">Live wallet distribution only available for Polymarket markets</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-[600px] rounded-2xl bg-gradient-to-br from-background to-muted/5 border border-border/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  if (error || wallets.length === 0) {
    return (
      <div className="w-full h-[600px] rounded-2xl bg-gradient-to-br from-muted/20 to-muted/5 border border-border/30 flex items-center justify-center">
        <p className="text-muted-foreground">{error || 'No wallet data available yet'}</p>
      </div>
    );
  }

  const allDisplayedWallets = [...yesWallets, ...noWallets];

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
        className="relative w-full h-[600px] rounded-2xl overflow-hidden border border-border/20 cursor-grab active:cursor-grabbing"
        style={{
          background: 'linear-gradient(180deg, hsl(224 71% 3%) 0%, hsl(224 71% 6%) 50%, hsl(224 71% 4%) 100%)'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
      >
        {/* Zoom Controls */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-30 flex items-center gap-2">
          <div 
            className="flex items-center gap-1 px-2 py-1 rounded-full backdrop-blur-md border border-border/30"
            style={{ background: 'rgba(10, 10, 15, 0.9)' }}
          >
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-all"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-xs text-muted-foreground min-w-[3rem] text-center font-medium">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-all"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-4 bg-border/30 mx-1" />
            <button
              onClick={handleResetZoom}
              className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-foreground/10 transition-all"
              title="Reset zoom"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {/* Zoomable Content Container */}
        <div 
          className="absolute inset-0 transition-transform duration-150 ease-out"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center center',
          }}
        >
          {/* Background gradients */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* YES side glow - green */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-1/2"
            style={{
              background: 'radial-gradient(ellipse 100% 100% at 30% 50%, hsla(142, 76%, 36%, 0.2) 0%, hsla(142, 76%, 36%, 0.05) 40%, transparent 70%)'
            }}
          />
          
          {/* NO side glow - red */}
          <div 
            className="absolute right-0 top-0 bottom-0 w-1/2"
            style={{
              background: 'radial-gradient(ellipse 100% 100% at 70% 50%, hsla(0, 72%, 45%, 0.2) 0%, hsla(0, 72%, 45%, 0.05) 40%, transparent 70%)'
            }}
          />

          {/* Stars/particles for depth */}
          {[...Array(40)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() * 2 + 0.5,
                height: Math.random() * 2 + 0.5,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                background: `rgba(255, 255, 255, ${Math.random() * 0.3 + 0.1})`,
              }}
            />
          ))}
          
          {/* Subtle grid lines */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        {/* Concentric ring guides - YES side - 3 zones */}
        <svg className="absolute left-0 top-0 w-1/2 h-full pointer-events-none" style={{ overflow: 'visible' }}>
          <defs>
            <radialGradient id="yesRingGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(142, 76%, 42%)" stopOpacity="0" />
              <stop offset="100%" stopColor="hsl(142, 76%, 42%)" stopOpacity="0.15" />
            </radialGradient>
          </defs>
          {/* Zone 1: $0-1k (center) */}
          <circle
            cx="50%"
            cy="50%"
            r="13%"
            fill="none"
            stroke="hsla(142, 76%, 42%, 0.2)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <text x="50%" y="52%" textAnchor="middle" fill="hsla(142, 76%, 50%, 0.5)" fontSize="9" fontWeight="600">$0-1k</text>
          
          {/* Zone 2: $1k-10k (middle) */}
          <circle
            cx="50%"
            cy="50%"
            r="27%"
            fill="none"
            stroke="hsla(142, 76%, 42%, 0.2)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <text x="50%" y="35%" textAnchor="middle" fill="hsla(142, 76%, 50%, 0.45)" fontSize="9" fontWeight="600">$1k-10k</text>
          
          {/* Zone 3: $10k+ outer pulsing ring */}
          <circle
            cx="50%"
            cy="50%"
            r="40%"
            fill="none"
            stroke="hsla(142, 76%, 42%, 0.3)"
            strokeWidth="2"
            className="animate-[pulse_2s_ease-in-out_infinite]"
          />
          <circle
            cx="50%"
            cy="50%"
            r="40%"
            fill="none"
            stroke="hsla(142, 76%, 50%, 0.15)"
            strokeWidth="8"
            className="animate-[pulse_2s_ease-in-out_infinite_0.5s]"
            style={{ filter: 'blur(4px)' }}
          />
          <text x="50%" y="8%" textAnchor="middle" fill="hsla(142, 76%, 50%, 0.6)" fontSize="10" fontWeight="700">$10k+ 🐋</text>
        </svg>

        {/* Concentric ring guides - NO side - 3 zones */}
        <svg className="absolute right-0 top-0 w-1/2 h-full pointer-events-none" style={{ overflow: 'visible' }}>
          <defs>
            <radialGradient id="noRingGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(0, 72%, 51%)" stopOpacity="0" />
              <stop offset="100%" stopColor="hsl(0, 72%, 51%)" stopOpacity="0.15" />
            </radialGradient>
          </defs>
          {/* Zone 1: $0-1k (center) */}
          <circle
            cx="50%"
            cy="50%"
            r="13%"
            fill="none"
            stroke="hsla(0, 72%, 51%, 0.2)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <text x="50%" y="52%" textAnchor="middle" fill="hsla(0, 72%, 60%, 0.5)" fontSize="9" fontWeight="600">$0-1k</text>
          
          {/* Zone 2: $1k-10k (middle) */}
          <circle
            cx="50%"
            cy="50%"
            r="27%"
            fill="none"
            stroke="hsla(0, 72%, 51%, 0.2)"
            strokeWidth="1"
            strokeDasharray="4 6"
          />
          <text x="50%" y="35%" textAnchor="middle" fill="hsla(0, 72%, 60%, 0.45)" fontSize="9" fontWeight="600">$1k-10k</text>
          
          {/* Zone 3: $10k+ outer pulsing ring */}
          <circle
            cx="50%"
            cy="50%"
            r="40%"
            fill="none"
            stroke="hsla(0, 72%, 51%, 0.3)"
            strokeWidth="2"
            className="animate-[pulse_2s_ease-in-out_infinite]"
          />
          <circle
            cx="50%"
            cy="50%"
            r="40%"
            fill="none"
            stroke="hsla(0, 72%, 60%, 0.15)"
            strokeWidth="8"
            className="animate-[pulse_2s_ease-in-out_infinite_0.5s]"
            style={{ filter: 'blur(4px)' }}
          />
          <text x="50%" y="8%" textAnchor="middle" fill="hsla(0, 72%, 60%, 0.6)" fontSize="10" fontWeight="700">$10k+ 🐋</text>
        </svg>


        {/* Center divider */}
        <div className="absolute left-1/2 top-8 bottom-8 w-px transform -translate-x-1/2 z-10"
          style={{
            background: 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.2), rgba(255,255,255,0.3), rgba(255,255,255,0.2), transparent)'
          }}
        />

        {/* YES Label */}
        <div className="absolute top-4 left-6 z-20">
          <span 
            className="text-3xl sm:text-4xl font-black tracking-tight"
            style={{ 
              color: 'hsl(142, 76%, 42%)',
              textShadow: '0 0 40px hsla(142, 76%, 42%, 0.6), 0 0 80px hsla(142, 76%, 42%, 0.3)'
            }}
          >
            YES
          </span>
        </div>
        
        {/* NO Label */}
        <div className="absolute top-4 right-6 z-20">
          <span 
            className="text-3xl sm:text-4xl font-black tracking-tight"
            style={{ 
              color: 'hsl(0, 72%, 51%)',
              textShadow: '0 0 40px hsla(0, 72%, 51%, 0.6), 0 0 80px hsla(0, 72%, 51%, 0.3)'
            }}
          >
            NO
          </span>
        </div>

        {/* Wallet Bubbles */}
        <AnimatePresence>
          {allDisplayedWallets.map((wallet, index) => {
            const pos = positions.get(wallet.id);
            if (!pos) return null;

            const isYes = wallet.side === 'yes';
            const baseColor = isYes ? 'hsl(142, 70%, 40%)' : 'hsl(0, 70%, 48%)';
            const lightColor = isYes ? 'hsl(142, 80%, 55%)' : 'hsl(0, 80%, 60%)';
            const darkColor = isYes ? 'hsl(142, 70%, 25%)' : 'hsl(0, 70%, 30%)';
            const glowColor = isYes ? 'hsla(142, 76%, 42%, 0.5)' : 'hsla(0, 72%, 51%, 0.5)';
            const isHovered = hoveredWallet?.id === wallet.id;
            const isWhale = wallet.tier === 'whale';
            const isLarge = wallet.tier === 'large';

            return (
              <motion.div
                key={wallet.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: isHovered ? 1.15 : 1,
                  x: pos.x - wallet.size / 2,
                  y: pos.y - wallet.size / 2,
                }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ 
                  type: 'spring',
                  stiffness: 200,
                  damping: 20,
                  delay: Math.min(index * 0.008, 0.8)
                }}
                onMouseEnter={() => setHoveredWallet(wallet)}
                onMouseLeave={() => setHoveredWallet(null)}
                onClick={() => setSelectedWallet(wallet)}
                className="absolute cursor-pointer select-none"
                style={{
                  width: wallet.size,
                  height: wallet.size,
                  zIndex: isHovered ? 100 : isWhale ? 30 : isLarge ? 20 : 10,
                }}
              >
                {/* Outer glow ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  animate={{
                    scale: isHovered ? 1.6 : 1.3,
                    opacity: isHovered ? 0.8 : (isWhale ? 0.5 : isLarge ? 0.3 : 0.15)
                  }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: `radial-gradient(circle, ${glowColor} 0%, transparent 70%)`,
                  }}
                />

                {/* Main bubble with 3D effect */}
                <motion.div
                  className="absolute inset-0 rounded-full overflow-hidden"
                  animate={{
                    boxShadow: isHovered 
                      ? `0 0 ${wallet.size}px ${glowColor}, inset 0 -4px 20px rgba(0,0,0,0.4), inset 0 4px 15px ${lightColor}`
                      : `0 0 ${isWhale ? 30 : isLarge ? 20 : 10}px ${glowColor}, inset 0 -2px 10px rgba(0,0,0,0.3), inset 0 2px 10px ${lightColor}`
                  }}
                  transition={{ duration: 0.2 }}
                  style={{
                    background: `radial-gradient(circle at 35% 30%, ${lightColor} 0%, ${baseColor} 40%, ${darkColor} 100%)`,
                    border: `${isWhale ? 2 : 1}px solid ${isYes ? 'rgba(134, 239, 172, 0.4)' : 'rgba(252, 165, 165, 0.4)'}`,
                  }}
                >
                  {/* Highlight shine */}
                  <div 
                    className="absolute rounded-full opacity-60"
                    style={{
                      width: '40%',
                      height: '25%',
                      top: '10%',
                      left: '15%',
                      background: `radial-gradient(ellipse, rgba(255,255,255,0.6) 0%, transparent 70%)`,
                    }}
                  />

                  {/* Amount label */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span 
                      className="font-bold text-white text-center leading-none"
                      style={{ 
                        fontSize: wallet.size > 70 ? '13px' : wallet.size > 50 ? '11px' : wallet.size > 35 ? '9px' : wallet.size > 25 ? '7px' : '6px',
                        textShadow: '0 1px 4px rgba(0,0,0,0.7), 0 0 10px rgba(0,0,0,0.5)',
                        letterSpacing: '-0.02em'
                      }}
                    >
                      {formatAmount(wallet.amount)}
                    </span>
                  </div>
                </motion.div>

                {/* Decorative orbit ring for whales */}
                {(isWhale || isLarge) && (
                  <svg 
                    className="absolute pointer-events-none"
                    style={{
                      width: wallet.size * 1.4,
                      height: wallet.size * 1.4,
                      left: -wallet.size * 0.2,
                      top: -wallet.size * 0.2,
                      opacity: isHovered ? 0.5 : 0.2,
                      transition: 'opacity 0.3s'
                    }}
                  >
                    <circle
                      cx={wallet.size * 0.7}
                      cy={wallet.size * 0.7}
                      r={wallet.size * 0.6}
                      fill="none"
                      stroke={baseColor}
                      strokeWidth="0.5"
                      strokeDasharray="3 6"
                      className="animate-[spin_20s_linear_infinite]"
                    />
                  </svg>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
        </div>
        {/* End of Zoomable Content Container */}

        {/* Hover Tooltip */}
        <AnimatePresence>
          {hoveredWallet && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.9 }}
              className="fixed z-[200] pointer-events-none"
              style={{
                left: Math.min(
                  Math.max((positions.get(hoveredWallet.id)?.x || 0) + (containerRef.current?.getBoundingClientRect().left || 0), 100),
                  window.innerWidth - 220
                ),
                top: (positions.get(hoveredWallet.id)?.y || 0) + (containerRef.current?.getBoundingClientRect().top || 0) - hoveredWallet.size / 2 - 90,
              }}
            >
              <div 
                className="backdrop-blur-xl border rounded-xl p-3.5 shadow-2xl min-w-[200px] transform -translate-x-1/2"
                style={{
                  background: 'rgba(15, 15, 20, 0.95)',
                  borderColor: hoveredWallet.side === 'yes' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(239, 68, 68, 0.3)'
                }}
              >
                <div className="text-xs space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-mono text-foreground/80">
                      {hoveredWallet.address.slice(0, 6)}...{hoveredWallet.address.slice(-4)}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-[10px] px-2 ${hoveredWallet.side === 'yes' ? 'border-primary/50 text-primary bg-primary/10' : 'border-secondary/50 text-secondary bg-secondary/10'}`}
                    >
                      {hoveredWallet.side.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-2 border-t border-border/30">
                    <div className="text-muted-foreground">Position</div>
                    <div className="text-right font-semibold text-foreground">${hoveredWallet.amount.toLocaleString()}</div>
                    <div className="text-muted-foreground">Trades</div>
                    <div className="text-right font-medium text-foreground">{hoveredWallet.trades}</div>
                    <div className="text-muted-foreground">Avg Entry</div>
                    <div className="text-right font-medium text-foreground">{(hoveredWallet.avgPrice * 100).toFixed(1)}¢</div>
                    <div className="text-muted-foreground">P&L</div>
                    <div className={`text-right font-semibold ${hoveredWallet.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                      {hoveredWallet.profit >= 0 ? '+' : ''}{hoveredWallet.profit.toFixed(2)}
                    </div>
                  </div>
                  <div className="pt-2 border-t border-border/30 text-center text-muted-foreground text-[10px]">
                    Click to view full profile
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
