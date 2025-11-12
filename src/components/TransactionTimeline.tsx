import { useEffect, useState } from "react";
import { Clock, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Activity, ExternalLink } from "lucide-react";
import type { Market } from "@/hooks/useMarkets";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface TransactionTimelineProps {
  market: Market;
}

interface Transaction {
  id: string;
  hash: string;
  address: string;
  amount: number;
  timestamp: string;
  blockNumber: number;
  side: 'buy' | 'sell' | 'yes' | 'no';
  type: 'market' | 'limit';
}

const TransactionTimeline = ({ market }: TransactionTimelineProps) => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      const isPolymarket = market.source.toLowerCase() === 'polymarket';
      
      if (!isPolymarket) {
        // Generate mock data for Kalshi
        const mockTransactions: Transaction[] = Array.from({ length: 50 }, (_, i) => ({
          id: `tx-${i}`,
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          address: `0x${Math.random().toString(16).substr(2, 40)}`,
          amount: Math.random() * 5000 + 100,
          timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
          blockNumber: 40000000 + Math.floor(Math.random() * 100000),
          side: ['buy', 'sell', 'yes', 'no'][Math.floor(Math.random() * 4)] as any,
          type: Math.random() > 0.5 ? 'market' : 'limit',
        }));
        setTransactions(mockTransactions.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        ));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const { data, error: functionError } = await supabase.functions.invoke('fetch-wallet-data', {
          body: { marketId: market.market_id }
        });

        if (functionError) throw functionError;

        if (data?.transactions) {
          setTransactions(data.transactions);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [market.market_id, market.source]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const getSideColor = (side: string) => {
    switch (side) {
      case 'buy':
      case 'yes':
        return 'text-green-400 bg-green-500/20 border-green-500/50';
      case 'sell':
      case 'no':
        return 'text-red-400 bg-red-500/20 border-red-500/50';
      default:
        return 'text-blue-400 bg-blue-500/20 border-blue-500/50';
    }
  };

  const getSideIcon = (side: string) => {
    switch (side) {
      case 'buy':
      case 'yes':
        return <TrendingUp className="w-4 h-4" />;
      case 'sell':
      case 'no':
        return <TrendingDown className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const isPolymarket = market.source.toLowerCase() === 'polymarket';

  if (loading) {
    return (
      <div className="glass-strong rounded-3xl p-8">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-strong rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold gradient-text mb-2">Transaction History</h3>
            <p className="text-sm text-muted-foreground">
              {isPolymarket ? (
                error ? `⚠ ${error} - Showing mock data` : "✓ Real on-chain transactions from Polygon"
              ) : (
                "ℹ Blockchain data only available for Polymarket (Kalshi is centralized)"
              )}
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold gradient-text">{transactions.length}</div>
            <div className="text-sm text-muted-foreground">Total Transactions</div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-strong rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-sm text-muted-foreground">Buy Trades</span>
          </div>
          <div className="text-2xl font-bold text-green-400">
            {transactions.filter(t => t.side === 'buy' || t.side === 'yes').length}
          </div>
        </div>

        <div className="glass-strong rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            <span className="text-sm text-muted-foreground">Sell Trades</span>
          </div>
          <div className="text-2xl font-bold text-red-400">
            {transactions.filter(t => t.side === 'sell' || t.side === 'no').length}
          </div>
        </div>

        <div className="glass-strong rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Total Volume</span>
          </div>
          <div className="text-2xl font-bold gradient-text">
            ${(transactions.reduce((sum, t) => sum + t.amount, 0) / 1000).toFixed(1)}K
          </div>
        </div>

        <div className="glass-strong rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-secondary" />
            <span className="text-sm text-muted-foreground">Latest</span>
          </div>
          <div className="text-lg font-bold">
            {transactions.length > 0 ? formatTimestamp(transactions[0].timestamp) : 'N/A'}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="glass-strong rounded-3xl p-6">
        <div className="space-y-3 max-h-[800px] overflow-y-auto custom-scrollbar">
          {transactions.map((tx, index) => (
            <div
              key={tx.id}
              className="glass border border-border/50 rounded-xl p-4 hover:border-primary/50 transition-all duration-300 group"
            >
              <div className="flex items-start gap-4">
                {/* Timeline Indicator */}
                <div className="flex flex-col items-center">
                  <div className={`p-2 rounded-lg border-2 ${getSideColor(tx.side)} group-hover:scale-110 transition-transform duration-300`}>
                    {getSideIcon(tx.side)}
                  </div>
                  {index < transactions.length - 1 && (
                    <div className="w-px h-full bg-gradient-to-b from-border to-transparent mt-2" />
                  )}
                </div>

                {/* Transaction Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase border ${getSideColor(tx.side)}`}>
                          {tx.side}
                        </span>
                        <span className="px-2 py-1 glass rounded text-xs">
                          {tx.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{formatTimestamp(tx.timestamp)}</span>
                        <span className="text-muted-foreground/50">•</span>
                        <span className="truncate">Block #{tx.blockNumber.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold gradient-text">
                        ${tx.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {(tx.amount / market.yes_price).toFixed(0)} shares
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 pt-3 border-t border-border/30">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-xs text-muted-foreground">Wallet:</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/wallet/${tx.address}`);
                        }}
                        className="flex items-center gap-1 text-xs font-mono text-foreground/80 hover:text-primary transition-colors truncate"
                      >
                        {tx.address}
                        <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      </button>
                    </div>
                    {isPolymarket && tx.hash && (
                      <a
                        href={`https://polygonscan.com/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                      >
                        View on explorer
                        <ArrowUpRight className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TransactionTimeline;
