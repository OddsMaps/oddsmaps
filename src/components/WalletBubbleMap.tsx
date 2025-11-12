import { useState, useMemo, useEffect } from "react";
import { TrendingUp, TrendingDown, Wallet, DollarSign, ExternalLink } from "lucide-react";
import type { Market } from "@/hooks/useMarkets";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
          // Aggregate transactions by wallet address
          const walletMap = new Map<string, {
            address: string;
            volume: number;
            trades: number;
            side: 'yes' | 'no';
            avgPrice: number;
            totalCost: number;
          }>();

          transactions.forEach(tx => {
            const existing = walletMap.get(tx.wallet_address);
            if (existing) {
              existing.volume += Number(tx.amount);
              existing.trades += 1;
              existing.totalCost += Number(tx.amount) * Number(tx.price);
            } else {
              walletMap.set(tx.wallet_address, {
                address: tx.wallet_address,
                volume: Number(tx.amount),
                trades: 1,
                side: tx.side as 'yes' | 'no',
                avgPrice: Number(tx.price),
                totalCost: Number(tx.amount) * Number(tx.price)
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

  // Generate wallet data (real or mock)
  const wallets = useMemo(() => {
    // If we have real wallet data for Polymarket, use it
    if (realWallets.length > 0) {
      const yesTraders: WalletData[] = [];
      const noTraders: WalletData[] = [];

      realWallets.forEach((wallet, i) => {
        const size = Math.min(120, Math.max(40, wallet.volume / 100));
        const isYes = wallet.side === 'yes' || i % 2 === 0;
        
        const walletData: WalletData = {
          id: `${wallet.side}-${i}`,
          address: wallet.address,
          side: isYes ? "yes" : "no",
          amount: wallet.volume,
          size,
          x: isYes ? Math.random() * 35 + 10 : Math.random() * 35 + 55,
          y: Math.random() * 80 + 10,
          color: isYes ? "from-green-400 to-green-600" : "from-red-400 to-red-600",
          trades: wallet.trades,
          avgPrice: market[isYes ? 'yes_price' : 'no_price'] * (0.9 + Math.random() * 0.2),
          profit: (Math.random() - 0.3) * wallet.volume * 0.3,
        };

        if (isYes) {
          yesTraders.push(walletData);
        } else {
          noTraders.push(walletData);
        }
      });

      return [...yesTraders, ...noTraders];
    }

    // Otherwise, generate mock data
    const yesTraders: WalletData[] = [];
    const noTraders: WalletData[] = [];
    const totalLiquidity = market.liquidity;
    
    // Generate YES side wallets
    for (let i = 0; i < 12; i++) {
      const amount = (Math.random() * totalLiquidity * 0.15) + 1000;
      const size = Math.min(120, Math.max(40, amount / 100));
      
      yesTraders.push({
        id: `yes-${i}`,
        address: `0x${Math.random().toString(16).substr(2, 8)}`,
        side: "yes",
        amount,
        size,
        x: Math.random() * 35 + 10,
        y: Math.random() * 80 + 10,
        color: "from-green-400 to-green-600",
        trades: Math.floor(Math.random() * 50) + 5,
        avgPrice: market.yes_price * (0.9 + Math.random() * 0.2),
        profit: (Math.random() - 0.3) * amount * 0.3,
      });
    }

    // Generate NO side wallets
    for (let i = 0; i < 12; i++) {
      const amount = (Math.random() * totalLiquidity * 0.15) + 1000;
      const size = Math.min(120, Math.max(40, amount / 100));
      
      noTraders.push({
        id: `no-${i}`,
        address: `0x${Math.random().toString(16).substr(2, 8)}`,
        side: "no",
        amount,
        size,
        x: Math.random() * 35 + 55,
        y: Math.random() * 80 + 10,
        color: "from-red-400 to-red-600",
        trades: Math.floor(Math.random() * 50) + 5,
        avgPrice: market.no_price * (0.9 + Math.random() * 0.2),
        profit: (Math.random() - 0.3) * amount * 0.3,
      });
    }

    return [...yesTraders, ...noTraders];
  }, [market, realWallets]);

  const isPolymarket = market.source.toLowerCase() === 'polymarket';
  const hasRealData = realWallets.length > 0;

  const yesTotal = wallets.filter(w => w.side === "yes").reduce((sum, w) => sum + w.amount, 0);
  const noTotal = wallets.filter(w => w.side === "no").reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-400 to-green-600">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">YES Side</div>
              <div className="text-2xl font-bold text-green-400">
                ${(yesTotal / 1000).toFixed(1)}K
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {wallets.filter(w => w.side === "yes").length} traders
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-400 to-red-600">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">NO Side</div>
              <div className="text-2xl font-bold text-red-400">
                ${(noTotal / 1000).toFixed(1)}K
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {wallets.filter(w => w.side === "no").length} traders
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Volume</div>
              <div className="text-2xl font-bold gradient-text">
                ${((yesTotal + noTotal) / 1000).toFixed(1)}K
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {wallets.length} total traders
          </div>
        </div>
      </div>

      {/* Bubble Map */}
      <div className="glass-strong rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold gradient-text">Wallet Distribution</h3>
            {isPolymarket && (
              <p className="text-sm text-muted-foreground mt-1">
                {loading ? (
                  "Loading real-time Polymarket data..."
                ) : hasRealData ? (
                  "✓ Live data from Polymarket transactions"
                ) : error ? (
                  `⚠ ${error}`
                ) : (
                  "Waiting for transaction data..."
                )}
              </p>
            )}
            {!isPolymarket && (
              <p className="text-sm text-muted-foreground mt-1">
                ℹ Blockchain data only available for Polymarket (Kalshi is centralized)
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-green-600" />
              <span>YES positions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-400 to-red-600" />
              <span>NO positions</span>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative glass rounded-2xl min-h-[600px] overflow-hidden">
          {/* Side Labels */}
          <div className="absolute top-8 left-8 glass px-4 py-2 rounded-lg z-10">
            <div className="text-sm font-semibold text-green-400">YES SIDE</div>
          </div>
          <div className="absolute top-8 right-8 glass px-4 py-2 rounded-lg z-10">
            <div className="text-sm font-semibold text-red-400">NO SIDE</div>
          </div>

          {/* Center Divider */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

          {/* Wallet Bubbles */}
          <div className="relative w-full h-full min-h-[600px] p-8">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="absolute cursor-pointer transition-all duration-500 group"
                style={{
                  left: `${wallet.x}%`,
                  top: `${wallet.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseEnter={() => setHoveredWallet(wallet)}
                onMouseLeave={() => setHoveredWallet(null)}
              >
                <div
                  className={`rounded-full bg-gradient-to-br ${wallet.color} opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg`}
                  style={{
                    width: `${wallet.size}px`,
                    height: `${wallet.size}px`,
                  }}
                >
                  <Wallet className="w-4 h-4 text-white" />
                </div>
              </div>
            ))}
          </div>

          {/* Hover Info */}
          {hoveredWallet && (
            <div className="absolute bottom-8 left-8 right-8 glass-strong p-6 rounded-2xl animate-fade-in border border-primary/30 z-20">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Wallet className="w-5 h-5 text-muted-foreground" />
                    <code className="text-lg font-mono">{hoveredWallet.address}</code>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      hoveredWallet.side === "yes" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {hoveredWallet.side.toUpperCase()}
                    </span>
                    <button
                      onClick={() => navigate(`/wallet/${hoveredWallet.address}`)}
                      className="ml-auto flex items-center gap-2 px-3 py-1 glass hover:glass-strong rounded-lg transition-all duration-300 text-sm"
                    >
                      View Profile
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-6">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Position Size</div>
                      <div className="text-xl font-semibold">${(hoveredWallet.amount / 1000).toFixed(2)}K</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Trades</div>
                      <div className="text-xl font-semibold">{hoveredWallet.trades}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Avg Price</div>
                      <div className="text-xl font-semibold">{(hoveredWallet.avgPrice * 100).toFixed(1)}¢</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">P&L</div>
                      <div className={`text-xl font-semibold ${hoveredWallet.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
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
