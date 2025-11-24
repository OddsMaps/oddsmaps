import { useParams, useNavigate } from "react-router-dom";
import { memo, useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, AlertTriangle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMarkets } from "@/hooks/useMarkets";
import WalletBubbleMap from "@/components/WalletBubbleMap";
import TransactionTimeline from "@/components/TransactionTimeline";
import { LiveWalletDistribution } from "@/components/LiveWalletDistribution";
import Header from "@/components/Header";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const MarketHeader = memo(({ market, isPositive, change, onBack }: any) => (
  <>
    <Button
      variant="ghost"
      onClick={onBack}
      className="mb-4 sm:mb-6 glass hover:glass-strong touch-manipulation"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to Markets
    </Button>

    <div className="data-card mb-6 sm:mb-8 animate-fade-in">
      <div className="flex flex-col lg:flex-row items-start gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="flex-1 w-full">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <span className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg bg-primary/20 border border-primary/30 text-xs sm:text-sm font-bold uppercase tracking-wide">
              {market.source}
            </span>
            {market.category && (
              <span className="px-2 sm:px-3 py-1 glass rounded-lg text-xs sm:text-sm">
                {market.category}
              </span>
            )}
            <span className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm font-semibold ${
              market.status === 'active' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {market.status}
            </span>
          </div>
          
          <h1 className="font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black mb-3 sm:mb-4 break-words leading-tight tracking-tight">
            {market.title}
          </h1>
          
          {market.description && (
            <p className="text-sm sm:text-base lg:text-lg text-muted-foreground break-words">
              {market.description}
            </p>
          )}
        </div>

        <div className="flex lg:flex-col items-center lg:items-end gap-3 sm:gap-4 w-full lg:w-auto justify-center lg:justify-start glass-premium rounded-2xl p-4 sm:p-6">
          <div className="text-center lg:text-right">
            <div className={`flex items-center justify-center lg:justify-end gap-3 text-4xl sm:text-5xl lg:text-6xl font-black font-mono ${
              isPositive ? "text-green-400" : "text-red-400"
            }`}>
              {isPositive ? (
                <TrendingUp className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
              ) : (
                <TrendingDown className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
              )}
              <span>{(market.yes_price * 100).toFixed(1)}¢</span>
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground mt-2 font-medium uppercase tracking-wider">
              Yes Price
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:gap-5 md:gap-6 pt-5 sm:pt-6 border-t border-border/30">
        <div className="space-y-2">
          <div className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">24h Volume</div>
          <div className="text-lg sm:text-2xl md:text-3xl font-black gradient-text-premium break-words font-mono">
            ${(market.volume_24h / 1000).toFixed(1)}K
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">Liquidity</div>
          <div className="text-lg sm:text-2xl md:text-3xl font-black gradient-text-premium break-words font-mono">
            ${(market.liquidity / 1000).toFixed(1)}K
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-wider">Volatility</div>
          <div className="text-lg sm:text-2xl md:text-3xl font-black gradient-text-premium break-words font-mono">
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
  
  const market = markets?.find(m => m.market_id === marketId);

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

          <LiveWalletDistribution marketId={market.id} />

          <div className="space-y-8 mb-8">
            <WalletBubbleMap market={market} />
          </div>

          <MarketWhaleTransactions marketId={market.id} />

          <div className="space-y-8">
            <TransactionTimeline market={market} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDetail;
