import { useState, useMemo, useEffect } from "react";
import { TrendingUp, TrendingDown, Filter, Search } from "lucide-react";
import type { Market } from "@/hooks/useMarkets";
import { supabase } from "@/integrations/supabase/client";
import { WalletProfileModal } from "./WalletProfileModal";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";

interface WalletBubbleMapProps {
  market: Market;
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

  // Fetch real wallet data from database
  useEffect(() => {
    const fetchWalletData = async () => {
      const isPolymarket = market.source.toLowerCase() === 'polymarket';
      
      if (!isPolymarket) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const { data: transactions, error: txError } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('market_id', market.id)
          .order('timestamp', { ascending: false });

        if (txError) throw txError;

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

          transactions.forEach(tx => {
            const existing = walletMap.get(tx.wallet_address);
            const txDate = new Date(tx.timestamp);
            
            if (existing) {
              existing.volume += Number(tx.amount);
              existing.trades += 1;
              existing.totalCost += Number(tx.amount) * Number(tx.price);
              if (txDate < existing.firstEntry) {
                existing.firstEntry = txDate;
              }
            } else {
              walletMap.set(tx.wallet_address, {
                address: tx.wallet_address,
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

    const channel = supabase
      .channel('wallet-transactions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallet_transactions',
          filter: `market_id=eq.${market.id}`
        },
        () => {
          fetchWalletData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [market.id, market.source]);

  // Categorize wallet by tier
  const getTier = (amount: number): "small" | "medium" | "large" | "whale" => {
    if (amount >= 5000) return "whale";
    if (amount >= 1000) return "large";
    if (amount >= 100) return "medium";
    return "small";
  };

  // Get color based on side and tier
  const getColor = (side: "yes" | "no", tier: string) => {
    if (side === "yes") {
      switch (tier) {
        case "whale": return "from-bubble-yes-whale to-bubble-yes-large";
        case "large": return "from-bubble-yes-large to-bubble-yes-medium";
        case "medium": return "from-bubble-yes-medium to-bubble-yes-small";
        default: return "from-bubble-yes-small to-cyan-400";
      }
    } else {
      switch (tier) {
        case "whale": return "from-bubble-no-whale to-bubble-no-large";
        case "large": return "from-bubble-no-large to-bubble-no-medium";
        case "medium": return "from-bubble-no-medium to-bubble-no-small";
        default: return "from-bubble-no-small to-pink-400";
      }
    }
  };

  // Get glow color
  const getGlowColor = (side: "yes" | "no", tier: string) => {
    if (side === "yes") {
      return tier === "whale" || tier === "large" 
        ? "0 0 30px rgba(16, 185, 129, 0.8), 0 0 60px rgba(16, 185, 129, 0.4)"
        : "0 0 15px rgba(52, 211, 153, 0.6), 0 0 30px rgba(52, 211, 153, 0.3)";
    } else {
      return tier === "whale" || tier === "large"
        ? "0 0 30px rgba(239, 68, 68, 0.8), 0 0 60px rgba(239, 68, 68, 0.4)"
        : "0 0 15px rgba(251, 113, 133, 0.6), 0 0 30px rgba(251, 113, 133, 0.3)";
    }
  };

  // Generate wallet data
  const wallets = useMemo(() => {
    if (realWallets.length === 0) return [];

    const processedWallets: WalletData[] = [];
    const yesWallets = realWallets.filter(w => w.side === 'yes').sort((a, b) => a.volume - b.volume);
    const noWallets = realWallets.filter(w => w.side === 'no').sort((a, b) => a.volume - b.volume);
    
    const positionWallets = (wallets: any[], side: 'yes' | 'no') => {
      const traders: WalletData[] = [];
      const totalWallets = wallets.length;
      
      wallets.forEach((wallet, i) => {
        const tier = getTier(wallet.volume);
        const baseSize = tier === "whale" ? 120 : tier === "large" ? 90 : tier === "medium" ? 65 : 45;
        const size = Math.min(140, baseSize + Math.sqrt(wallet.volume) * 0.5);
        
        const progress = i / Math.max(1, totalWallets - 1);
        
        // Organic spiral pattern
        const spiralTurns = 2.5;
        const angle = progress * Math.PI * spiralTurns + Math.sin(i * 1.2) * 0.4;
        
        // Distance from center based on size
        const maxRadius = 42;
        const radius = Math.pow(progress, 0.7) * maxRadius;
        
        let x: number;
        if (side === 'yes') {
          x = 48 - radius;
        } else {
          x = 52 + radius;
        }
        
        const centerY = 50;
        const verticalSpread = 38;
        const y = centerY + Math.sin(angle) * verticalSpread + Math.cos(i * 0.7) * 10;
        
        const currentPrice = side === 'yes' ? market.yes_price : market.no_price;
        const profit = wallet.volume * (currentPrice - wallet.avgPrice);
        
        traders.push({
          id: `${wallet.address}-${i}`,
          address: wallet.address,
          side,
          amount: wallet.volume,
          size,
          tier,
          x: Math.max(2, Math.min(98, x)),
          y: Math.max(10, Math.min(90, y)),
          color: getColor(side, tier),
          glowColor: getGlowColor(side, tier),
          trades: wallet.trades,
          avgPrice: wallet.avgPrice,
          profit,
          entryTime: wallet.firstEntry
        });
      });
      
      return traders;
    };
    
    processedWallets.push(...positionWallets(yesWallets, 'yes'));
    processedWallets.push(...positionWallets(noWallets, 'no'));
    
    return processedWallets;
  }, [realWallets, market.yes_price, market.no_price]);

  // Apply filters
  const filteredWallets = useMemo(() => {
    return wallets.filter(w => {
      if (sideFilter !== "all" && w.side !== sideFilter) return false;
      if (tierFilter !== "all" && w.tier !== tierFilter) return false;
      if (searchTerm && !w.address.toLowerCase().includes(searchTerm.toLowerCase())) return false;
      return true;
    });
  }, [wallets, sideFilter, tierFilter, searchTerm]);

  // Calculate stats
  const stats = useMemo(() => {
    const yesVolume = wallets.filter(w => w.side === "yes").reduce((sum, w) => sum + w.amount, 0);
    const noVolume = wallets.filter(w => w.side === "no").reduce((sum, w) => sum + w.amount, 0);
    const totalVolume = yesVolume + noVolume;
    const yesPnL = wallets.filter(w => w.side === "yes").reduce((sum, w) => sum + w.profit, 0);
    const noPnL = wallets.filter(w => w.side === "no").reduce((sum, w) => sum + w.profit, 0);
    
    return { yesVolume, noVolume, totalVolume, yesPnL, noPnL };
  }, [wallets]);

  if (market.source.toLowerCase() !== 'polymarket') {
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
    <div className="w-full space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold gradient-text">Live Wallet Distribution</h2>
          <p className="text-sm text-muted-foreground mt-1">Real-time prediction market activity</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 rounded-lg bg-gradient-to-br from-bubble-yes-medium/20 to-bubble-yes-large/10 border border-bubble-yes-medium/30">
          <div className="text-xs text-muted-foreground mb-1">YES Volume</div>
          <div className="text-lg font-bold text-foreground">${stats.yesVolume.toLocaleString()}</div>
        </div>
        <div className="p-3 rounded-lg bg-gradient-to-br from-bubble-no-medium/20 to-bubble-no-large/10 border border-bubble-no-medium/30">
          <div className="text-xs text-muted-foreground mb-1">NO Volume</div>
          <div className="text-lg font-bold text-foreground">${stats.noVolume.toLocaleString()}</div>
        </div>
        <div className="p-3 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/30">
          <div className="text-xs text-muted-foreground mb-1">YES P&L</div>
          <div className={`text-lg font-bold ${stats.yesPnL >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {stats.yesPnL >= 0 ? '+' : ''}${stats.yesPnL.toLocaleString()}
          </div>
        </div>
        <div className="p-3 rounded-lg bg-gradient-to-br from-secondary/10 to-destructive/10 border border-secondary/30">
          <div className="text-xs text-muted-foreground mb-1">NO P&L</div>
          <div className={`text-lg font-bold ${stats.noPnL >= 0 ? 'text-primary' : 'text-destructive'}`}>
            {stats.noPnL >= 0 ? '+' : ''}${stats.noPnL.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Bubblemap */}
      <div className="relative w-full h-[600px] rounded-xl overflow-hidden border border-border/30 bg-gradient-to-br from-background via-background to-muted/20">
        {/* Background gradient zones */}
        <div className="absolute inset-0 bg-gradient-to-r from-bubble-yes-medium/5 via-background to-bubble-no-medium/5" />
        
        {/* Side labels */}
        <div className="absolute top-4 left-4 z-10">
          <Badge className="bg-bubble-yes-medium/80 backdrop-blur-sm text-white border-none">
            <TrendingUp className="w-3 h-3 mr-1" />
            YES
          </Badge>
        </div>
        <div className="absolute top-4 right-4 z-10">
          <Badge className="bg-bubble-no-medium/80 backdrop-blur-sm text-white border-none">
            <TrendingDown className="w-3 h-3 mr-1" />
            NO
          </Badge>
        </div>

        {/* Center divider with glow */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-border to-transparent transform -translate-x-1/2" 
             style={{ boxShadow: '0 0 20px rgba(255, 255, 255, 0.1)' }} />

        {/* Wallet bubbles */}
        <div className="absolute inset-0">
          {filteredWallets.map((wallet, index) => (
            <div
              key={wallet.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 cursor-pointer animate-float bubble-animate-in"
              style={{
                left: `${wallet.x}%`,
                top: `${wallet.y}%`,
                width: `${wallet.size}px`,
                height: `${wallet.size}px`,
                animationDelay: `${index * 0.02}s`,
                animationDuration: `${6 + (index % 3)}s`,
              }}
              onMouseEnter={() => setHoveredWallet(wallet)}
              onMouseLeave={() => setHoveredWallet(null)}
              onClick={() => setSelectedWallet(wallet)}
            >
              <div
                className={`w-full h-full rounded-full bg-gradient-to-br ${wallet.color} transition-all duration-300 ${
                  hoveredWallet?.id === wallet.id ? 'scale-125' : 'scale-100'
                } ${wallet.tier === 'whale' || wallet.tier === 'large' ? 'animate-pulse-glow' : ''}`}
                style={{
                  boxShadow: hoveredWallet?.id === wallet.id
                    ? wallet.glowColor
                    : wallet.tier === 'whale' || wallet.tier === 'large'
                    ? wallet.glowColor
                    : '0 0 10px rgba(0, 0, 0, 0.3)',
                  border: wallet.tier === 'whale' ? '3px solid rgba(255, 255, 255, 0.3)' : wallet.tier === 'large' ? '2px solid rgba(255, 255, 255, 0.2)' : 'none',
                }}
              />
              
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
