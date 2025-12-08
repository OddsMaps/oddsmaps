import { useState, useMemo, useEffect } from "react";
import { TrendingUp, TrendingDown, Filter, Search } from "lucide-react";
import type { Market } from "@/hooks/useMarkets";
import { fetchMarketTransactions } from "@/lib/polymarket-api";
import { WalletProfileModal } from "./WalletProfileModal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

interface WalletBubbleMapProps {
  market?: Market;
}

interface WalletData {
  id: string;
  address: string;
  side: "yes" | "no";
  amount: number;
  size: number;
  tier: "small" | "medium" | "large" | "whale";
  x: number;
  y: number;
  color: string;
  glowColor: string;
  trades: number;
  avgPrice: number;
  profit: number;
  entryTime: Date;
}

const WalletBubbleMap = ({ market }: WalletBubbleMapProps) => {
  const [hoveredWallet, setHoveredWallet] = useState<WalletData | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<WalletData | null>(null);
  const [realWallets, setRealWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sideFilter, setSideFilter] = useState<"all" | "yes" | "no">("all");
  const [tierFilter, setTierFilter] = useState<"all" | "small" | "medium" | "large" | "whale">("all");
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch real wallet data from Polymarket API
  useEffect(() => {
    const fetchWalletData = async () => {
      // If no market is provided, we can't fetch (need market_id)
      const isPolymarket = market && market.source.toLowerCase() === 'polymarket';
      
      if (!isPolymarket || !market) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch transactions directly from Polymarket API
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

    // Refetch every 1 minute for updated data
    const interval = setInterval(fetchWalletData, 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [market?.market_id]);

  const getTier = (volume: number): WalletData['tier'] => {
    if (volume >= 5000) return 'whale';
    if (volume >= 1000) return 'large';
    if (volume >= 100) return 'medium';
    return 'small';
  };

  const getColor = (side: 'yes' | 'no', tier: string) => {
    if (side === 'yes') {
      switch (tier) {
        case 'whale': return 'from-bubble-yes-whale to-bubble-yes-large';
        case 'large': return 'from-bubble-yes-large to-bubble-yes-medium';
        case 'medium': return 'from-bubble-yes-medium to-bubble-yes-small';
        default: return 'from-bubble-yes-small to-bubble-yes-medium/50';
      }
    } else {
      switch (tier) {
        case 'whale': return 'from-bubble-no-whale to-bubble-no-large';
        case 'large': return 'from-bubble-no-large to-bubble-no-medium';
        case 'medium': return 'from-bubble-no-medium to-bubble-no-small';
        default: return 'from-bubble-no-small to-bubble-no-medium/50';
      }
    }
  };

  const getGlowColor = (side: 'yes' | 'no', tier: string) => {
    const baseColor = side === 'yes' ? '16, 185, 129' : '239, 68, 68';
    const intensity = tier === 'whale' ? 0.8 : tier === 'large' ? 0.6 : tier === 'medium' ? 0.4 : 0.2;
    return `0 0 ${tier === 'whale' ? '40' : tier === 'large' ? '30' : '20'}px rgba(${baseColor}, ${intensity})`;
  };

  const wallets = useMemo<WalletData[]>(() => {
    if (realWallets.length === 0) return [];

    const yesPrice = market?.yes_price || 0.5;
    const noPrice = market?.no_price || 0.5;

    // First pass: Create bubbles with initial positions
    const initialBubbles = realWallets.map((w, index) => {
      const tier = getTier(w.volume);
      const currentPrice = w.side === 'yes' ? yesPrice : noPrice;
      const pnl = (currentPrice - w.avgPrice) * w.volume;
      
      let size = 30;
      switch (tier) {
        case 'whale': size = 95; break;
        case 'large': size = 72; break;
        case 'medium': size = 52; break;
        default: size = 34;
      }

      // Y-axis positioning by tier (stratified layers)
      let yBase = 50;
      let ySpread = 20;
      switch (tier) {
        case 'whale': yBase = 22; ySpread = 12; break;
        case 'large': yBase = 48; ySpread = 16; break;
        case 'medium': yBase = 68; ySpread = 14; break;
        default: yBase = 86; ySpread = 8;
      }

      const offset = (Math.random() - 0.5) * ySpread;
      const y = yBase + offset;

      // X-axis: Strict side separation with clear boundaries
      // YES side: 10-40%, NO side: 60-90%
      let x;
      if (w.side === 'yes') {
        const tierBase = tier === 'whale' ? 18 : tier === 'large' ? 22 : tier === 'medium' ? 26 : 30;
        const tierWidth = tier === 'whale' ? 16 : tier === 'large' ? 14 : tier === 'medium' ? 12 : 8;
        x = tierBase + (Math.random() - 0.5) * tierWidth;
        x = Math.max(10, Math.min(40, x)); // Enforce YES boundary
      } else {
        const tierBase = tier === 'whale' ? 82 : tier === 'large' ? 78 : tier === 'medium' ? 74 : 70;
        const tierWidth = tier === 'whale' ? 16 : tier === 'large' ? 14 : tier === 'medium' ? 12 : 8;
        x = tierBase + (Math.random() - 0.5) * tierWidth;
        x = Math.max(60, Math.min(90, x)); // Enforce NO boundary
      }

      return {
        id: `${w.address}-${index}`,
        address: w.address,
        side: w.side,
        amount: w.volume,
        size,
        tier,
        x,
        y: Math.max(8, Math.min(92, y)),
        color: getColor(w.side, tier),
        glowColor: getGlowColor(w.side, tier),
        trades: w.trades,
        avgPrice: w.avgPrice,
        profit: pnl,
        entryTime: w.firstEntry,
      };
    });

    // Second pass: Collision detection with strict boundary enforcement
    const separateBubbles = (bubbles: WalletData[]): WalletData[] => {
      const maxIterations = 60;
      const minDistance = 1.35; // Minimum distance multiplier
      
      for (let iteration = 0; iteration < maxIterations; iteration++) {
        let moved = false;
        
        for (let i = 0; i < bubbles.length; i++) {
          for (let j = i + 1; j < bubbles.length; j++) {
            const b1 = bubbles[i];
            const b2 = bubbles[j];
            
            // Skip if bubbles are on different sides (no cross-side collision)
            if (b1.side !== b2.side) continue;
            
            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Calculate minimum distance needed
            const r1 = b1.size / 20;
            const r2 = b2.size / 20;
            const minDist = (r1 + r2) * minDistance;
            
            if (distance < minDist && distance > 0) {
              moved = true;
              
              // Calculate separation
              const overlap = minDist - distance;
              const force = overlap * 0.45;
              
              // Normalize direction
              const nx = dx / distance;
              const ny = dy / distance;
              
              // Weight by size (larger moves less)
              const totalSize = b1.size + b2.size;
              const w1 = b2.size / totalSize;
              const w2 = b1.size / totalSize;
              
              // Apply forces
              b1.x -= nx * force * w1;
              b1.y -= ny * force * w1;
              b2.x += nx * force * w2;
              b2.y += ny * force * w2;
              
              // Enforce strict side boundaries
              if (b1.side === 'yes') {
                b1.x = Math.max(10, Math.min(40, b1.x));
              } else {
                b1.x = Math.max(60, Math.min(90, b1.x));
              }
              
              if (b2.side === 'yes') {
                b2.x = Math.max(10, Math.min(40, b2.x));
              } else {
                b2.x = Math.max(60, Math.min(90, b2.x));
              }
              
              // Y bounds
              b1.y = Math.max(8, Math.min(92, b1.y));
              b2.y = Math.max(8, Math.min(92, b2.y));
            }
          }
        }
        
        if (!moved) break;
      }
      
      return bubbles;
    };

    return separateBubbles(initialBubbles);
  }, [realWallets, market]);

  const filteredWallets = useMemo(() => {
    return wallets.filter(wallet => {
      const sideMatch = sideFilter === "all" || wallet.side === sideFilter;
      const tierMatch = tierFilter === "all" || wallet.tier === tierFilter;
      const searchMatch = searchTerm === "" || wallet.address.toLowerCase().includes(searchTerm.toLowerCase());
      return sideMatch && tierMatch && searchMatch;
    });
  }, [wallets, sideFilter, tierFilter, searchTerm]);

  const stats = useMemo(() => {
    const yesVolume = wallets.filter(w => w.side === "yes").reduce((sum, w) => sum + w.amount, 0);
    const noVolume = wallets.filter(w => w.side === "no").reduce((sum, w) => sum + w.amount, 0);
    const totalVolume = yesVolume + noVolume;
    const yesPnL = wallets.filter(w => w.side === "yes").reduce((sum, w) => sum + w.profit, 0);
    const noPnL = wallets.filter(w => w.side === "no").reduce((sum, w) => sum + w.profit, 0);
    const totalWallets = wallets.length;
    const yesWallets = wallets.filter(w => w.side === "yes").length;
    const noWallets = wallets.filter(w => w.side === "no").length;
    
    return { yesVolume, noVolume, totalVolume, yesPnL, noPnL, totalWallets, yesWallets, noWallets };
  }, [wallets]);

  if (market && market.source.toLowerCase() !== 'polymarket') {
    return (
      <div className="w-full h-[600px] rounded-xl bg-gradient-to-br from-muted/20 to-muted/5 border border-border/30 flex items-center justify-center">
        <p className="text-muted-foreground">Live wallet distribution only available for Polymarket markets</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full h-[600px] rounded-xl bg-gradient-to-br from-primary/5 to-secondary/5 border border-border/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading wallet data...</p>
        </div>
      </div>
    );
  }

  if (error || wallets.length === 0) {
    return (
      <div className="w-full h-[600px] rounded-xl bg-gradient-to-br from-muted/20 to-muted/5 border border-border/30 flex items-center justify-center">
        <p className="text-muted-foreground">{error || 'No wallet data available yet'}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 sm:space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold gradient-text">
            {market ? 'Live Wallet Distribution' : 'Real-Time Whale Activity'}
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            {market 
              ? `Showing ${filteredWallets.length} of ${stats.totalWallets} wallets (${stats.yesWallets} YES, ${stats.noWallets} NO)`
              : `Tracking ${filteredWallets.length} of ${stats.totalWallets} active wallets across all markets`
            }
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {(sideFilter !== "all" || tierFilter !== "all" || searchTerm !== "") && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                setSideFilter("all");
                setTierFilter("all");
                setSearchTerm("");
              }}
              className="text-xs text-destructive border-destructive hover:bg-destructive/10"
            >
              Clear Filters
            </Button>
          )}
          <div className="flex gap-1 p-1 rounded-lg bg-muted/30">
            <Button
              size="sm"
              variant={sideFilter === "all" ? "default" : "ghost"}
              onClick={() => setSideFilter("all")}
              className="text-xs"
            >
              All
            </Button>
            <Button
              size="sm"
              variant={sideFilter === "yes" ? "default" : "ghost"}
              onClick={() => setSideFilter("yes")}
              className="text-xs"
            >
              YES
            </Button>
            <Button
              size="sm"
              variant={sideFilter === "no" ? "default" : "ghost"}
              onClick={() => setSideFilter("no")}
              className="text-xs"
            >
              NO
            </Button>
          </div>
          
          <div className="flex gap-1 p-1 rounded-lg bg-muted/30">
            <Button
              size="sm"
              variant={tierFilter === "all" ? "default" : "ghost"}
              onClick={() => setTierFilter("all")}
              className="text-xs"
            >
              <Filter className="w-3 h-3 mr-1" />
              All
            </Button>
            <Button
              size="sm"
              variant={tierFilter === "whale" ? "default" : "ghost"}
              onClick={() => setTierFilter("whale")}
              className="text-xs"
            >
              🐋
            </Button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-40 h-9 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
        <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-br from-bubble-yes-medium/20 to-bubble-yes-large/10 border border-bubble-yes-medium/30">
          <div className="text-xs text-muted-foreground mb-1">YES Volume</div>
          <div className="text-base sm:text-lg font-bold text-foreground">${stats.yesVolume.toLocaleString()}</div>
        </div>
        <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-br from-bubble-no-medium/20 to-bubble-no-large/10 border border-bubble-no-medium/30">
          <div className="text-xs text-muted-foreground mb-1">NO Volume</div>
          <div className="text-base sm:text-lg font-bold text-foreground">${stats.noVolume.toLocaleString()}</div>
        </div>
        <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30">
          <div className="text-xs text-muted-foreground mb-1">YES P&L</div>
          <div className={`text-base sm:text-lg font-bold ${stats.yesPnL >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {stats.yesPnL >= 0 ? '+' : ''}${stats.yesPnL.toLocaleString()}
          </div>
        </div>
        <div className="p-3 sm:p-4 rounded-lg bg-gradient-to-br from-secondary/10 to-destructive/10 border border-secondary/30">
          <div className="text-xs text-muted-foreground mb-1">NO P&L</div>
          <div className={`text-base sm:text-lg font-bold ${stats.noPnL >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {stats.noPnL >= 0 ? '+' : ''}${stats.noPnL.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Bubblemap */}
      <div className="relative w-full h-[500px] sm:h-[600px] md:h-[700px] rounded-xl overflow-hidden border border-border/30 bg-gradient-to-br from-background via-background to-muted/20">
        {/* Enhanced background with clean separation */}
        <div className="absolute inset-0">
          {/* YES side gradient (left) */}
          <div className="absolute left-0 top-0 bottom-0 w-[45%] bg-gradient-to-r from-bubble-yes-large/12 via-bubble-yes-medium/6 to-transparent" />
          
          {/* NO side gradient (right) */}
          <div className="absolute right-0 top-0 bottom-0 w-[45%] bg-gradient-to-l from-bubble-no-large/12 via-bubble-no-medium/6 to-transparent" />
          
          {/* Center neutral zone */}
          <div className="absolute left-[45%] right-[45%] top-0 bottom-0 bg-gradient-to-r from-transparent via-background/40 to-transparent" />
          
          {/* Tier zone highlights */}
          <div className="absolute left-0 right-0 top-[15%] h-[28%] bg-gradient-to-b from-transparent via-primary/4 to-transparent" />
          <div className="absolute left-0 right-0 top-[45%] h-[20%] bg-gradient-to-b from-transparent via-accent/2 to-transparent" />
        </div>
        
        {/* Tier labels */}
        <div className="absolute left-2 top-[29%] z-10">
          <div className="glass-premium rounded-lg px-3 py-1.5 text-xs font-black shadow-lg">
            🐋 WHALE<br/><span className="text-2xs text-muted-foreground">$5k+</span>
          </div>
        </div>
        <div className="absolute left-2 top-[55%] z-10">
          <div className="glass-strong rounded-lg px-3 py-1.5 text-xs font-bold shadow-md">
            LARGE<br/><span className="text-2xs text-muted-foreground">$1k-5k</span>
          </div>
        </div>
        <div className="absolute left-2 top-[74%] z-10">
          <div className="glass rounded-lg px-2.5 py-1 text-xs font-semibold shadow-sm">
            MED<br/><span className="text-2xs text-muted-foreground">$100-1k</span>
          </div>
        </div>
        <div className="absolute left-2 top-[89%] z-10">
          <div className="glass rounded-lg px-2.5 py-1 text-xs opacity-80">
            SMALL<br/><span className="text-2xs text-muted-foreground">$0-100</span>
          </div>
        </div>
        
        {/* Enhanced side labels */}
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-gradient-to-r from-bubble-yes-large to-bubble-yes-medium backdrop-blur-sm text-white border-none shadow-[0_0_20px_rgba(16,185,129,0.3)] px-4 py-2 font-black">
            <TrendingUp className="w-4 h-4 mr-2" />
            <span className="text-sm">YES BETS</span>
          </Badge>
        </div>
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-gradient-to-r from-bubble-no-medium to-bubble-no-large backdrop-blur-sm text-white border-none shadow-[0_0_20px_rgba(239,68,68,0.3)] px-4 py-2 font-black">
            <TrendingDown className="w-4 h-4 mr-2" />
            <span className="text-sm">NO BETS</span>
          </Badge>
        </div>

        {/* Premium center divider with double-line effect */}
        <div className="absolute left-1/2 top-0 bottom-0 transform -translate-x-1/2">
          <div className="absolute left-[-1px] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/50 to-transparent" />
          <div className="absolute left-[1px] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border/50 to-transparent" />
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-transparent via-primary to-transparent blur-sm opacity-50" />
        </div>

        {/* Wallet bubbles */}
        <div className="absolute inset-0">
          {filteredWallets.map((wallet, index) => (
            <div
              key={wallet.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer bubble-animate-in group"
              style={{
                left: `${wallet.x}%`,
                top: `${wallet.y}%`,
                width: `${wallet.size}px`,
                height: `${wallet.size}px`,
                animationDelay: `${index * 0.025}s`,
                transition: 'left 0.8s cubic-bezier(0.4, 0, 0.2, 1), top 0.8s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s ease-out, height 0.3s ease-out',
              }}
              onMouseEnter={() => setHoveredWallet(wallet)}
              onMouseLeave={() => setHoveredWallet(null)}
              onClick={() => setSelectedWallet(wallet)}
            >
              <div
                className={`w-full h-full rounded-full bg-gradient-to-br ${wallet.color} transition-all duration-500 ${
                  hoveredWallet?.id === wallet.id ? 'scale-110' : 'scale-100'
                } ${wallet.tier === 'whale' || wallet.tier === 'large' ? 'animate-pulse-glow' : ''}`}
                style={{
                  boxShadow: hoveredWallet?.id === wallet.id
                    ? wallet.glowColor
                    : wallet.tier === 'whale' || wallet.tier === 'large'
                    ? wallet.glowColor
                    : '0 4px 20px rgba(0, 0, 0, 0.4)',
                  border: wallet.tier === 'whale' 
                    ? '4px solid rgba(255, 255, 255, 0.4)' 
                    : wallet.tier === 'large' 
                    ? '3px solid rgba(255, 255, 255, 0.3)' 
                    : wallet.tier === 'medium'
                    ? '2px solid rgba(255, 255, 255, 0.2)'
                    : '1px solid rgba(255, 255, 255, 0.1)',
                }}
              >
                {/* Size indicator for large bets */}
                {(wallet.tier === 'whale' || wallet.tier === 'large') && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-bold drop-shadow-lg" style={{ fontSize: wallet.tier === 'whale' ? '11px' : '9px' }}>
                      ${(wallet.amount / 1000).toFixed(1)}k
                    </span>
                  </div>
                )}
              </div>
              
              {/* Hover tooltip */}
              {hoveredWallet?.id === wallet.id && (
                <div className="absolute left-1/2 -translate-x-1/2 -top-24 bg-card/95 backdrop-blur-xl border border-border/50 rounded-lg p-3 shadow-xl z-50 min-w-[180px] animate-fade-in">
                  <div className="text-xs space-y-1">
                    <div className="font-mono text-foreground">{wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}</div>
                    <div className="text-muted-foreground">Size: ${wallet.amount.toLocaleString()}</div>
                    <div className="text-muted-foreground">Trades: {wallet.trades}</div>
                    <div className={wallet.profit >= 0 ? 'text-primary' : 'text-destructive'}>
                      P&L: {wallet.profit >= 0 ? '+' : ''}${wallet.profit.toFixed(2)}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
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