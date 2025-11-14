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
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch transactions directly from database
        const { data, error: txError } = await supabase
          .from('wallet_transactions')
          .select('*')
          .eq('market_id', market.id)
          .order('timestamp', { ascending: false });

        if (txError) throw txError;

        if (data && data.length > 0) {
          const formattedTxs = data.map(tx => ({
            id: tx.id,
            hash: tx.transaction_hash || '',
            address: tx.wallet_address,
            amount: Number(tx.amount),
            timestamp: tx.timestamp,
            blockNumber: Number(tx.block_number) || 0,
            side: tx.side as 'buy' | 'sell' | 'yes' | 'no',
            type: tx.transaction_type as 'market' | 'limit',
          }));
          setTransactions(formattedTxs);
        } else {
          setTransactions([]);
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();

    // Set up realtime subscription
    const channel = supabase
      .channel(`transactions-${market.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallet_transactions',
          filter: `market_id=eq.${market.id}`,
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [market.id, market.source]);

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

  const whaleTransactions = transactions.filter(tx => tx.amount >= 10000);
  const regularTransactions = transactions.filter(tx => tx.amount < 10000);

  if (!isPolymarket) {
    return (
      <div className="glass-strong rounded-3xl p-12 text-center">
        <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">Blockchain Data Unavailable</h3>
        <p className="text-muted-foreground">
          Transaction data is only available for Polymarket markets with on-chain data.
        </p>
      </div>
    );
  }

  if (transactions.length === 0 && !loading) {
    return (
      <div className="glass-strong rounded-3xl p-12 text-center">
        <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-xl font-semibold mb-2">No Transactions Yet</h3>
        <p className="text-muted-foreground">
          No wallet transactions have been recorded for this market. Transactions are synced every 30 minutes.
        </p>
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
              ✓ Real on-chain transactions from Polygon
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

      {/* Whale Transactions Section */}
      {whaleTransactions.length > 0 && (
        <div className="glass-strong rounded-3xl p-6 border-2 border-primary/30">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Activity className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-xl font-bold gradient-text">Whale Transactions</h3>
              <p className="text-sm text-muted-foreground">Trades ≥ $10,000</p>
            </div>
          </div>
          <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
            {whaleTransactions.map((tx, index) => (
              <div
                key={tx.id}
                className="glass border-2 border-primary/30 rounded-xl p-4 hover:border-primary/60 transition-all duration-300 group"
              >
                <div className="flex items-start gap-4">
                  {/* Timeline Indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`p-2 rounded-lg border-2 ${getSideColor(tx.side)} group-hover:scale-110 transition-transform duration-300`}>
                      {getSideIcon(tx.side)}
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div 
                          className="font-mono text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors truncate"
                          onClick={() => navigate(`/wallet/${tx.address}`)}
                          title={tx.address}
                        >
                          {tx.address.slice(0, 6)}...{tx.address.slice(-4)}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">{formatTimestamp(tx.timestamp)}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold gradient-text">${(tx.amount / 1000).toFixed(1)}K</div>
                        <div className={`text-xs font-semibold px-2 py-1 rounded ${getSideColor(tx.side)}`}>
                          {tx.side.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span className="opacity-60">Type:</span>
                        <span className="capitalize">{tx.type}</span>
                      </div>
                      {tx.hash && (
                        <a
                          href={`https://polygonscan.com/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-primary transition-colors"
                        >
                          <span>View on Polygonscan</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Transactions Timeline */}
      <div className="glass-strong rounded-3xl p-6">
        <h3 className="text-xl font-bold mb-4">All Transactions</h3>
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
