import { useParams, useNavigate } from "react-router-dom";
import { memo, useState, useEffect } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMarkets } from "@/hooks/useMarkets";
import WalletBubbleMap from "@/components/WalletBubbleMap";
import TransactionTimeline from "@/components/TransactionTimeline";
import Header from "@/components/Header";
import { fetchMarketTransactions } from "@/lib/polymarket-api";
import { Button } from "@/components/ui/button";
import { formatVolume } from "@/lib/utils";

const MarketHeader = memo(({ market, onBack }: any) => {
  const getMarketImage = () => {
    if (market.image_url) return market.image_url;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(market.title.slice(0, 2))}&background=random&size=100`;
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="glass hover:glass-strong touch-manipulation"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Main Header Card */}
      <div className="data-card p-3 sm:p-4 md:p-5">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          {/* Image */}
          <img 
            src={getMarketImage()} 
            alt={market.title}
            className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl object-cover shrink-0 border border-border/50 self-start"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(market.title.slice(0, 2))}&background=random&size=100`;
            }}
          />
          
          {/* Title & Badges */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className="px-2 py-0.5 rounded bg-primary/20 border border-primary/30 text-[10px] sm:text-xs font-bold uppercase">
                {market.source}
              </span>
              {market.category && (
                <span className="px-2 py-0.5 glass rounded text-[10px] sm:text-xs">
                  {market.category}
                </span>
              )}
              <span className={`px-2 py-0.5 rounded text-[10px] sm:text-xs font-semibold ${
                market.status === 'active' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {market.status}
              </span>
            </div>
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold leading-tight line-clamp-3 sm:line-clamp-2">
              {market.title}
            </h1>
          </div>

          {/* YES/NO Prices */}
          <div className="flex gap-2 sm:gap-3 shrink-0 self-start sm:self-auto">
            <div className="text-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
              <div className="text-[9px] sm:text-[10px] text-emerald-400 font-medium uppercase">Yes</div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold font-mono text-emerald-400">
                {Math.round(market.yes_price * 100)}¢
              </div>
            </div>
            <div className="text-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg bg-rose-500/10 border border-rose-500/30">
              <div className="text-[9px] sm:text-[10px] text-rose-400 font-medium uppercase">No</div>
              <div className="text-lg sm:text-xl md:text-2xl font-bold font-mono text-rose-400">
                {Math.round(market.no_price * 100)}¢
              </div>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 md:gap-6 mt-3 sm:mt-4 pt-3 border-t border-border/30 text-xs sm:text-sm">
          <div>
            <span className="text-muted-foreground">24h Vol: </span>
            <span className="font-bold font-mono">{formatVolume(market.volume_24h)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Liq: </span>
            <span className="font-bold font-mono">{formatVolume(market.liquidity)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Vol: </span>
            <span className="font-bold font-mono">{market.volatility.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
});

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

    // Refetch every 1 minute for updated data
    const interval = setInterval(fetchTransactions, 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [marketId]);

  const fetchTransactions = async () => {
    try {
      // Fetch transactions directly from Polymarket API
      const allTransactions = await fetchMarketTransactions(marketId, 1000);

      // Filter for whale transactions (>= $10,000) and transform format
      const whaleTxs = allTransactions
        .filter((tx) => Number(tx.amount) >= 10000)
        .slice(0, 20)
        .map((tx) => ({
          id: tx.id,
          wallet_address: tx.address || tx.wallet_address || '',
          amount: Number(tx.amount),
          price: Number(tx.price),
          side: tx.side,
          timestamp: tx.timestamp,
          transaction_hash: tx.hash || tx.transaction_hash || '',
        }));

      setTransactions(whaleTxs);
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

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  if (loading || transactions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold flex items-center gap-2">
          🐋 Whale Activity
          <Badge variant="outline" className="text-xs">
            <Activity className="h-3 w-3 animate-pulse text-green-500 mr-1" />
            {transactions.length}
          </Badge>
        </h2>
      </div>

      <div className="grid gap-2">
        {transactions.slice(0, 5).map((tx) => (
          <Card
            key={tx.id}
            className="p-3 hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => navigate(`/wallet/${tx.wallet_address}`)}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`px-2 py-1 rounded text-xs font-bold ${
                  tx.side === 'yes' 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {tx.side.toUpperCase()}
                </div>
                <span className="font-mono text-xs text-muted-foreground">
                  {tx.wallet_address.slice(0, 6)}...{tx.wallet_address.slice(-4)}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className="font-bold">${(tx.amount / 1000).toFixed(1)}K</span>
                  <span className="text-xs text-muted-foreground ml-1">@ {(tx.price * 100).toFixed(0)}¢</span>
                </div>
                <span className="text-xs text-muted-foreground w-8">{formatTime(tx.timestamp)}</span>
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

  if (!market) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center glass-strong p-8 rounded-xl">
          <Activity className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <h1 className="text-xl font-bold mb-2">Market not found</h1>
          <p className="text-sm text-muted-foreground mb-4">This market doesn't exist or hasn't been synced.</p>
          <Button onClick={() => navigate("/markets")} size="sm">
            Back to Markets
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-16 sm:pt-20 pb-6 sm:pb-8 px-3 sm:px-4">
        <div className="max-w-6xl mx-auto space-y-3 sm:space-y-4">
          <MarketHeader market={market} onBack={() => navigate("/markets")} />

          {/* Mobile: Stack, Desktop: Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            <div className="lg:col-span-2 order-2 lg:order-1">
              <WalletBubbleMap market={market} />
            </div>
            <div className="order-1 lg:order-2">
              <MarketWhaleTransactions marketId={market.market_id} />
            </div>
          </div>

          <div className="mt-3 sm:mt-4">
            <TransactionTimeline market={market} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketDetail;
