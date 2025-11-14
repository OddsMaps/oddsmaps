import { useParams, useNavigate } from "react-router-dom";
import { memo, useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMarkets } from "@/hooks/useMarkets";
import { LiveWalletDistributionSection } from "@/components/LiveWalletDistributionSection";
import TransactionTimeline from "@/components/TransactionTimeline";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const MarketHeader = memo(({ market, isPositive, change, onBack }: any) => (
  <>
    <Button
      variant="ghost"
      onClick={onBack}
      className="mb-6 glass hover:glass-strong"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to Markets
    </Button>

    <div className="glass-strong rounded-2xl p-8 mb-8 animate-fade-in border border-border/50">
      <div className="flex items-start justify-between gap-6 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1.5 rounded-lg bg-primary/20 border border-primary/30 text-sm font-bold uppercase tracking-wide">
              {market.source}
            </span>
            {market.category && (
              <span className="px-3 py-1 glass rounded-lg text-sm">
                {market.category}
              </span>
            )}
            <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
              market.status === 'active' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {market.status}
            </span>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">
            {market.title}
          </h1>
          
          {market.description && (
            <p className="text-lg text-muted-foreground">
              {market.description}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-4">
          <div className={`flex items-center gap-2 text-5xl font-bold ${
            isPositive ? "text-green-400" : "text-red-400"
          }`}>
            {isPositive ? (
              <TrendingUp className="w-10 h-10" />
            ) : (
              <TrendingDown className="w-10 h-10" />
            )}
            <span>{(market.yes_price * 100).toFixed(1)}¢</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Yes price
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-border/50">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">24h Volume</div>
          <div className="text-2xl font-bold gradient-text">
            ${(market.volume_24h / 1000).toFixed(1)}K
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Liquidity</div>
          <div className="text-2xl font-bold gradient-text">
            ${(market.liquidity / 1000).toFixed(1)}K
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">24h Trades</div>
          <div className="text-2xl font-bold gradient-text">
            {market.trades_24h.toLocaleString()}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Volatility</div>
          <div className="text-2xl font-bold gradient-text">
            {market.volatility.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  </>
));

MarketHeader.displayName = 'MarketHeader';

interface WhaleTransaction {
  id: string;
  wallet_address: string;
  amount: number;
  price: number;
  side: string;
  timestamp: string;
  transaction_hash: string;
}

const MarketWhaleTransactions = ({ marketId }: { marketId: string }) => {
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();

    const channel = supabase
      .channel(`whale-transactions-${marketId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallet_transactions',
          filter: `market_id=eq.${marketId}`
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [marketId]);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('market_id', marketId)
        .gte('amount', 10000)
        .order('timestamp', { ascending: false })
        .limit(20);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: string) => {
    const now = new Date().getTime();
    const txTime = new Date(timestamp).getTime();
    const diff = Math.floor((now - txTime) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  };

  const getSideIcon = (side: string) => {
    return side === 'yes' ? (
      <TrendingUp className="h-4 w-4" />
    ) : (
      <TrendingDown className="h-4 w-4" />
    );
  };

  const getSideColor = (side: string) => {
    return side === 'yes' 
      ? 'text-green-500 bg-green-500/10 border-green-500/20' 
      : 'text-red-500 bg-red-500/10 border-red-500/20';
  };

  if (loading || transactions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Whale Activity 🐋</h2>
          <p className="text-muted-foreground">Real-time bets over $10,000 on this market</p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Activity className="h-3 w-3 animate-pulse text-green-500" />
          {transactions.length} Whales
        </Badge>
      </div>

      <div className="grid gap-3">
        {transactions.slice(0, 5).map((tx) => (
          <Card
            key={tx.id}
            className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => navigate(`/wallet/${tx.wallet_address}`)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 flex-1">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-semibold border ${getSideColor(tx.side)}`}>
                  {getSideIcon(tx.side)}
                  {tx.side.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-mono text-sm text-muted-foreground">
                    {tx.wallet_address.slice(0, 6)}...{tx.wallet_address.slice(-4)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="text-2xl font-bold gradient-text">
                    ${(tx.amount / 1000).toFixed(1)}K
                  </div>
                  <div className="text-sm text-muted-foreground">
                    @ {(tx.price * 100).toFixed(1)}¢
                  </div>
                </div>
                <div className="text-sm text-muted-foreground min-w-[80px] text-right">
                  {formatTime(tx.timestamp)}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const MarketDetail = () => {
  const { marketId } = useParams();
  const navigate = useNavigate();
  const { data: markets } = useMarkets('polymarket');
  const [walletNodes, setWalletNodes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const market = markets?.find(m => m.market_id === marketId);

  // Fetch wallet transactions and format as nodes
  useEffect(() => {
    if (!market) return;

    const fetchWalletData = async () => {
      try {
        const { data: transactions, error } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('market_id', market.id)
          .order('timestamp', { ascending: false });

        if (error) throw error;

        // Group by wallet and calculate positions
        const walletMap = new Map();
        
        transactions?.forEach(tx => {
          if (!walletMap.has(tx.wallet_address)) {
            walletMap.set(tx.wallet_address, {
              yesAmount: 0,
              noAmount: 0,
              firstTimestamp: tx.timestamp,
              walletAddress: tx.wallet_address
            });
          }
          
          const wallet = walletMap.get(tx.wallet_address);
          if (tx.side === 'yes') {
            wallet.yesAmount += tx.amount;
          } else {
            wallet.noAmount += tx.amount;
          }
          
          if (new Date(tx.timestamp) < new Date(wallet.firstTimestamp)) {
            wallet.firstTimestamp = tx.timestamp;
          }
        });

        // Convert to nodes
        const nodes = Array.from(walletMap.values()).map(wallet => {
          const netAmount = Math.abs(wallet.yesAmount - wallet.noAmount);
          const side = wallet.yesAmount > wallet.noAmount ? 'YES' : 'NO';
          
          const timeDiff = Date.now() - new Date(wallet.firstTimestamp).getTime();
          const hours = timeDiff / (1000 * 60 * 60);
          
          let entryTimeBucket: 'recent' | 'days' | 'weeks' | 'oldest';
          if (hours < 24) entryTimeBucket = 'recent';
          else if (hours < 168) entryTimeBucket = 'days';
          else if (hours < 720) entryTimeBucket = 'weeks';
          else entryTimeBucket = 'oldest';

          // Calculate profit
          const yesProfit = wallet.yesAmount * market.yes_price - wallet.yesAmount;
          const noProfit = wallet.noAmount * (1 - market.yes_price) - wallet.noAmount;
          const profit = yesProfit + noProfit;

          return {
            id: wallet.walletAddress,
            side,
            amount: netAmount,
            addressShort: `${wallet.walletAddress.slice(0, 6)}...${wallet.walletAddress.slice(-4)}`,
            entryTimeBucket,
            walletAddress: wallet.walletAddress,
            profit
          };
        }).filter(node => node.amount > 100); // Filter out dust

        setWalletNodes(nodes);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching wallet data:', error);
        setLoading(false);
      }
    };

    fetchWalletData();

    // Set up real-time subscription
    const channel = supabase
      .channel(`wallet-nodes-${market.id}`)
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
  }, [market]);

  // Auto-sync this market's transactions every 2 minutes
  useEffect(() => {
    if (!market) return;

    const syncMarket = async () => {
      try {
        await supabase.functions.invoke('sync-market-transactions', {
          body: { marketId: market.market_id }
        });
      } catch (error) {
        console.error('Auto-sync error:', error);
      }
    };

    // Initial sync
    syncMarket();

    // Sync every 2 minutes
    const interval = setInterval(syncMarket, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [market]);

  if (!market) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center glass-strong p-12 rounded-2xl">
          <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">Market not found</h1>
          <p className="text-muted-foreground mb-6">This Polymarket market doesn't exist or hasn't been synced yet.</p>
          <Button onClick={() => navigate("/")} className="glow-gradient">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  const change = ((market.yes_price - 0.5) * 100).toFixed(1);
  const isPositive = parseFloat(change) > 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          <MarketHeader 
            market={market} 
            isPositive={isPositive} 
            change={change}
            onBack={() => navigate("/")}
          />

          <MarketWhaleTransactions marketId={market.id} />

          <div className="space-y-8">
            {!loading && (
              <LiveWalletDistributionSection
                marketTitle={market.title}
                yesOdds={market.yes_price}
                noOdds={1 - market.yes_price}
                totalLiquidity={market.liquidity}
                volume24h={market.volume_24h}
                activeWallets={walletNodes.length}
                nodes={walletNodes}
              />
            )}
            <TransactionTimeline market={market} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDetail;
