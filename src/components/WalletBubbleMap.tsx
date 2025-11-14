import { useState, useMemo, useEffect } from "react";
import { TrendingUp, TrendingDown, Wallet, DollarSign, ExternalLink, Clock, Activity } from "lucide-react";
import type { Market } from "@/hooks/useMarkets";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface WalletBubbleMapProps {
  market: Market;
}

interface WalletData {
  id: string;
  address: string;
  side: "yes" | "no";
  amount: number;
  size: number;
  x: number;
  y: number;
  color: string;
  trades: number;
  avgPrice: number;
  profit: number;
  entryTime: Date;
  timeColor: string;
}

const WalletBubbleMap = ({ market }: WalletBubbleMapProps) => {
  const navigate = useNavigate();
  const [hoveredWallet, setHoveredWallet] = useState<WalletData | null>(null);
  const [realWallets, setRealWallets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch real wallet data from database for Polymarket markets
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
        
        // Fetch all transactions for this market from the database
        const { data: transactions, error: txError } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('market_id', market.id)
          .order('timestamp', { ascending: false });

        if (txError) throw txError;

        if (transactions && transactions.length > 0) {
          // Aggregate transactions by wallet address and track first entry time
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
              // Track earliest entry
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

          // Convert to array and calculate averages
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

    // Set up realtime subscription for new transactions
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
          // Refetch when new transactions arrive
          fetchWalletData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [market.id, market.source]);

  // Generate wallet data from real Polymarket data only
  const wallets = useMemo(() => {
    if (realWallets.length === 0) return [];

    const yesTraders: WalletData[] = [];
    const noTraders: WalletData[] = [];

    // Find earliest and latest entry times for color mapping
    const now = new Date();
    const times = realWallets.map(w => w.firstEntry.getTime());
    const oldestTime = Math.min(...times);
    const newestTime = Math.max(...times);
    const timeRange = newestTime - oldestTime || 1;

    // Function to get time-based color (blue=recent, purple=older, pink=oldest)
    const getTimeColor = (entryTime: Date): string => {
      const age = now.getTime() - entryTime.getTime();
      const normalizedAge = Math.min(1, age / timeRange);
      
      // Color gradient: blue (recent) -> cyan -> purple -> pink (old)
      if (normalizedAge < 0.25) return "from-blue-500 to-blue-600";
      if (normalizedAge < 0.5) return "from-cyan-500 to-cyan-600";
      if (normalizedAge < 0.75) return "from-purple-500 to-purple-600";
      return "from-pink-500 to-pink-600";
    };

    // Calculate profit based on current price vs entry price
    const calculateProfit = (wallet: any, isYes: boolean): number => {
      const currentPrice = isYes ? market.yes_price : market.no_price;
      const entryPrice = wallet.avgPrice;
      return wallet.volume * (currentPrice - entryPrice);
    };

    // Separate and sort YES and NO wallets by volume (smallest first for center placement)
    const yesWallets = realWallets.filter(w => w.side === 'yes').sort((a, b) => a.volume - b.volume);
    const noWallets = realWallets.filter(w => w.side === 'no').sort((a, b) => a.volume - b.volume);
    
    // Function to position wallets in an organic flowing pattern from center outward
    const positionWallets = (wallets: any[], side: 'yes' | 'no') => {
      const traders: WalletData[] = [];
      const totalWallets = wallets.length;
      
      wallets.forEach((wallet, i) => {
        const size = Math.min(140, Math.max(40, Math.sqrt(wallet.volume) * 2.5));
        
        // Calculate organic position: SMALL bets near center, LARGE bets at edges
        const progress = i / Math.max(1, totalWallets - 1); // 0 to 1
        
        // Create expanding spiral/organic flow pattern
        const spiralTurns = 2.5;
        const angle = progress * Math.PI * spiralTurns + (side === 'yes' ? Math.PI : 0);
        const radius = Math.pow(progress, 0.8) * 40; // Exponential growth for more space at edges
        
        // Add organic variation to make it look more natural
        const variation = Math.sin(i * 2.3) * 5 + Math.cos(i * 1.7) * 5;
        
        // Calculate position based on side
        const centerX = side === 'yes' ? 30 : 70; // Starting position for each side
        const centerY = 50;
        const x = centerX + Math.cos(angle) * radius * (side === 'yes' ? -1 : 1) + variation;
        const y = centerY + Math.sin(angle) * radius * 0.8 + Math.sin(i * 0.5) * 8;
        
        const walletData: WalletData = {
          id: `${wallet.address}-${i}`,
          address: wallet.address,
          side,
          amount: wallet.volume,
          size,
          x: Math.max(2, Math.min(98, x)), // Keep within bounds with more space
          y: Math.max(5, Math.min(95, y)),
          color: side === 'yes' ? "from-green-500 to-green-600" : "from-red-500 to-red-600",
          trades: wallet.trades,
          avgPrice: wallet.avgPrice,
          profit: calculateProfit(wallet, side === 'yes'),
          entryTime: wallet.firstEntry,
          timeColor: getTimeColor(wallet.firstEntry),
        };
        
        traders.push(walletData);
      });
      
      return traders;
    };
    
    // Position YES and NO wallets separately
    yesTraders.push(...positionWallets(yesWallets, 'yes'));
    noTraders.push(...positionWallets(noWallets, 'no'));

    return [...yesTraders, ...noTraders];
  }, [market, realWallets]);

  const isPolymarket = market.source.toLowerCase() === 'polymarket';
  const hasRealData = realWallets.length > 0;

  const yesTotal = wallets.filter(w => w.side === "yes").reduce((sum, w) => sum + w.amount, 0);
  const noTotal = wallets.filter(w => w.side === "no").reduce((sum, w) => sum + w.amount, 0);
  const totalProfit = wallets.reduce((sum, w) => sum + w.profit, 0);

  // Show loading or no data message for non-Polymarket or empty data
  if (!isPolymarket) {
    return (
      <div className="glass-strong rounded-3xl p-12 text-center">
        <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">Blockchain Data Unavailable</h3>
        <p className="text-muted-foreground">
          Wallet distribution is only available for Polymarket markets with on-chain transaction data.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="glass-strong rounded-3xl p-12 text-center">
        <Activity className="w-16 h-16 mx-auto mb-4 text-primary animate-pulse" />
        <h3 className="text-xl font-semibold mb-2">Loading Real-Time Data</h3>
        <p className="text-muted-foreground">Fetching Polymarket transactions...</p>
      </div>
    );
  }

  if (!hasRealData) {
    return (
      <div className="glass-strong rounded-3xl p-12 text-center">
        <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Transaction Data</h3>
        <p className="text-muted-foreground">
          {error || "No wallet transactions have been recorded for this market yet. Check back soon!"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-strong rounded-xl p-5 border border-green-500/20 hover:border-green-500/40 transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-green-500/20">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">YES Volume</div>
              <div className="text-xl font-bold text-green-400">
                ${(yesTotal / 1000).toFixed(1)}K
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {wallets.filter(w => w.side === "yes").length} wallets
          </div>
        </div>

        <div className="glass-strong rounded-xl p-5 border border-red-500/20 hover:border-red-500/40 transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-red-500/20">
              <TrendingDown className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">NO Volume</div>
              <div className="text-xl font-bold text-red-400">
                ${(noTotal / 1000).toFixed(1)}K
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {wallets.filter(w => w.side === "no").length} wallets
          </div>
        </div>

        <div className="glass-strong rounded-xl p-5 border border-primary/20 hover:border-primary/40 transition-all duration-300">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 rounded-lg bg-primary/20">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Volume</div>
              <div className="text-xl font-bold gradient-text">
                ${((yesTotal + noTotal) / 1000).toFixed(1)}K
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            {wallets.length} total wallets
          </div>
        </div>

        <div className={`glass-strong rounded-xl p-5 border transition-all duration-300 ${
          totalProfit >= 0 ? 'border-green-500/20 hover:border-green-500/40' : 'border-red-500/20 hover:border-red-500/40'
        }`}>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2.5 rounded-lg ${totalProfit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
              <Activity className={`w-5 h-5 ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} />
            </div>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">Total P&L</div>
              <div className={`text-xl font-bold ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {totalProfit >= 0 ? '+' : ''}${(totalProfit / 1000).toFixed(1)}K
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Live unrealized
          </div>
        </div>
      </div>

      {/* Bubble Map */}
      <div className="glass-strong rounded-2xl overflow-hidden border border-border/50">
        <div className="bg-gradient-to-r from-background/80 to-background/40 p-6 border-b border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold">Live Wallet Distribution</h3>
                <div className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs font-semibold text-green-400">LIVE</span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                Real-time Polymarket transaction data • Updated every 2 minutes
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 text-xs">
                <span className="text-muted-foreground font-medium">Position:</span>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-green-400" />
                  <span>YES</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full border-2 border-red-400" />
                  <span>NO</span>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="text-muted-foreground font-medium">Entry Time:</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-600" />
                  <span>Recent</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600" />
                  <span>Days</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-purple-500 to-purple-600" />
                  <span>Weeks</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-pink-500 to-pink-600" />
                  <span>Oldest</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative min-h-[700px] overflow-hidden">
          {/* Split Background Gradients */}
          <div className="absolute inset-0">
            <div className="absolute inset-y-0 left-0 right-1/2 bg-gradient-to-r from-green-950/20 via-green-900/10 to-transparent" />
            <div className="absolute inset-y-0 left-1/2 right-0 bg-gradient-to-l from-red-950/20 via-red-900/10 to-transparent" />
          </div>
          
          {/* Side Labels */}
          <div className="absolute top-8 left-8 px-5 py-3 rounded-xl bg-green-500/15 border border-green-500/40 backdrop-blur-sm z-10 shadow-lg">
            <div className="text-base font-bold text-green-400 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              YES SIDE
            </div>
          </div>
          <div className="absolute top-8 right-8 px-5 py-3 rounded-xl bg-red-500/15 border border-red-500/40 backdrop-blur-sm z-10 shadow-lg">
            <div className="text-base font-bold text-red-400 flex items-center gap-2">
              NO SIDE
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>

          {/* Center Divider */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-[3px] bg-gradient-to-b from-transparent via-white/30 to-transparent shadow-lg" />

          {/* Wallet Bubbles */}
          <div className="relative w-full h-full min-h-[700px] p-8">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="absolute cursor-pointer group transition-all duration-300"
                style={{
                  left: `${wallet.x}%`,
                  top: `${wallet.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: hoveredWallet?.id === wallet.id ? 50 : 1,
                }}
                onMouseEnter={() => setHoveredWallet(wallet)}
                onMouseLeave={() => setHoveredWallet(null)}
                onClick={() => navigate(`/wallet/${wallet.address}`)}
              >
                <div
                  className={`rounded-full bg-gradient-to-br ${wallet.timeColor} 
                    flex items-center justify-center 
                    border-[4px] transition-all duration-300 ease-out
                    ${wallet.side === 'yes' 
                      ? 'border-green-400/50 group-hover:border-green-400 group-hover:shadow-[0_0_30px_rgba(34,197,94,0.4)]' 
                      : 'border-red-400/50 group-hover:border-red-400 group-hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                    }
                    group-hover:scale-125 shadow-xl backdrop-blur-sm
                    animate-fade-in hover:z-50`}
                  style={{
                    width: `${wallet.size}px`,
                    height: `${wallet.size}px`,
                    opacity: hoveredWallet?.id === wallet.id ? 1 : 0.9,
                  }}
                >
                  <Wallet className="w-4 h-4 text-white drop-shadow-lg" />
                </div>
                {/* Pulse ring on hover */}
                {hoveredWallet?.id === wallet.id && (
                  <div 
                    className={`absolute inset-0 rounded-full border-2 animate-ping ${
                      wallet.side === 'yes' ? 'border-green-400' : 'border-red-400'
                    }`}
                    style={{
                      width: `${wallet.size}px`,
                      height: `${wallet.size}px`,
                    }}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Hover Info Card */}
          {hoveredWallet && (
            <div className="absolute bottom-6 left-6 right-6 glass-strong p-6 rounded-xl animate-fade-in border-2 border-primary/50 shadow-2xl z-20 backdrop-blur-xl">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`p-2 rounded-lg ${
                      hoveredWallet.side === "yes" ? "bg-green-500/20" : "bg-red-500/20"
                    }`}>
                      <Wallet className={`w-4 h-4 ${
                        hoveredWallet.side === "yes" ? "text-green-400" : "text-red-400"
                      }`} />
                    </div>
                    <code className="text-base font-mono font-semibold">{hoveredWallet.address}</code>
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold tracking-wide ${
                      hoveredWallet.side === "yes" 
                        ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                        : "bg-red-500/20 text-red-400 border border-red-500/30"
                    }`}>
                      {hoveredWallet.side.toUpperCase()}
                    </span>
                    <button
                      onClick={() => navigate(`/wallet/${hoveredWallet.address}`)}
                      className="ml-auto flex items-center gap-2 px-4 py-2 bg-primary/20 hover:bg-primary/30 border border-primary/30 hover:border-primary/50 rounded-lg transition-all duration-300 text-sm font-medium"
                    >
                      View Profile
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-5 gap-5">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-1.5">
                        <DollarSign className="w-3 h-3" />
                        Position
                      </div>
                      <div className="text-xl font-bold">${(hoveredWallet.amount / 1000).toFixed(2)}K</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-1.5">
                        <Activity className="w-3 h-3" />
                        Trades
                      </div>
                      <div className="text-xl font-bold">{hoveredWallet.trades}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        Entry
                      </div>
                      <div className="text-xl font-bold">
                        {formatDistanceToNow(hoveredWallet.entryTime, { addSuffix: true })}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Avg Price</div>
                      <div className="text-xl font-bold">{(hoveredWallet.avgPrice * 100).toFixed(1)}¢</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
                        Unrealized P&L
                      </div>
                      <div className={`text-xl font-bold flex items-center gap-1 ${
                        hoveredWallet.profit >= 0 ? "text-green-400" : "text-red-400"
                      }`}>
                        {hoveredWallet.profit >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {hoveredWallet.profit >= 0 ? "+" : ""}${(hoveredWallet.profit / 1000).toFixed(2)}K
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletBubbleMap;
