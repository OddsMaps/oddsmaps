import { useEffect, useState } from "react";
import { Clock, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Activity, ExternalLink } from "lucide-react";
import type { Market } from "@/hooks/useMarkets";
import { fetchMarketTransactions } from "@/lib/polymarket-api";
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
        
        // Fetch transactions directly from Polymarket API
        const transactions = await fetchMarketTransactions(market.market_id, 1000);

        if (transactions && transactions.length > 0) {
          const formattedTxs = transactions.map((tx) => ({
            id: tx.id,
            hash: tx.hash || tx.transaction_hash || '',
            address: tx.address || tx.wallet_address || '',
            amount: Number(tx.amount),
            timestamp: tx.timestamp,
            blockNumber: Number(tx.blockNumber) || 0,
            side: tx.side as 'buy' | 'sell' | 'yes' | 'no',
            type: (tx.type || tx.transaction_type || 'market') as 'market' | 'limit',
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

    // Refetch every 1 minute for updated data
    const interval = setInterval(fetchTransactions, 60 * 1000);

    return () => {
      clearInterval(interval);
    };
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
      <div className="glass-strong rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-xl sm:text-2xl font-bold gradient-text mb-2">Transaction History</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              ✓ Real on-chain transactions from Polygon
            </p>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-2xl sm:text-3xl font-bold gradient-text">{transactions.length}</div>
            <div className="text-xs sm:text-sm text-muted-foreground">Total Transactions</div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="glass-strong rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-green-400 shrink-0" />
            <span className="text-xs sm:text-sm text-muted-foreground">Buy Trades</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-green-400">
            {transactions.filter(t => t.side === 'buy' || t.side === 'yes').length}
          </div>
        </div>

        <div className="glass-strong rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-red-400 shrink-0" />
            <span className="text-xs sm:text-sm text-muted-foreground">Sell Trades</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold text-red-400">
            {transactions.filter(t => t.side === 'sell' || t.side === 'no').length}
          </div>
        </div>

        <div className="glass-strong rounded-xl p-3 sm:p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-3 h-3 sm:w-4 sm:h-4 text-primary shrink-0" />
            <span className="text-xs sm:text-sm text-muted-foreground">Total Volume</span>
          </div>
          <div className="text-xl sm:text-2xl font-bold gradient-text break-words">
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
        <div className="glass-strong rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6 border-2 border-primary/30">
          <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Activity className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-primary-foreground" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg md:text-xl font-bold gradient-text">Whale Transactions</h3>
              <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">Trades ≥ $10,000</p>
            </div>
          </div>
          <div className="space-y-2 sm:space-y-3 max-h-[300px] sm:max-h-[400px] overflow-y-auto custom-scrollbar">
            {whaleTransactions.map((tx, index) => (
              <div
                key={tx.id}
                className="glass border-2 border-primary/30 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-primary/60 transition-all duration-300 group touch-manipulation"
              >
                <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                  {/* Timeline Indicator */}
                  <div className="flex flex-col items-center">
                    <div className={`p-1.5 sm:p-2 rounded-lg border-2 ${getSideColor(tx.side)} group-hover:scale-110 transition-transform duration-300`}>
                      {getSideIcon(tx.side)}
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2 sm:mb-3">
                      <div className="flex-1 min-w-0">
                        <div 
                          className="font-mono text-[10px] sm:text-xs md:text-sm text-muted-foreground hover:text-primary cursor-pointer transition-colors truncate"
                          onClick={() => navigate(`/wallet/${tx.address}`)}
                          title={tx.address}
                        >
                          {tx.address.slice(0, 6)}...{tx.address.slice(-4)}
                        </div>
                        <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">{formatTimestamp(tx.timestamp)}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg sm:text-xl md:text-2xl font-bold gradient-text">${(tx.amount / 1000).toFixed(1)}K</div>
                        <div className={`text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded ${getSideColor(tx.side)}`}>
                          {tx.side.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-muted-foreground">
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
                          <span className="hidden sm:inline">Polygonscan</span>
                          <span className="sm:hidden">View</span>
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
      <div className="glass-strong rounded-xl sm:rounded-2xl md:rounded-3xl p-4 sm:p-5 md:p-6">
        <h3 className="text-base sm:text-lg md:text-xl font-bold mb-3 sm:mb-4">All Transactions</h3>
        <div className="space-y-2 sm:space-y-3 max-h-[400px] sm:max-h-[600px] md:max-h-[800px] overflow-y-auto custom-scrollbar">
          {transactions.map((tx, index) => (
            <div
              key={tx.id}
              className="glass border border-border/50 rounded-lg sm:rounded-xl p-3 sm:p-4 hover:border-primary/50 transition-all duration-300 group touch-manipulation"
            >
              <div className="flex items-start gap-2 sm:gap-3 md:gap-4">
                {/* Timeline Indicator */}
                <div className="flex flex-col items-center">
                  <div className={`p-1.5 sm:p-2 rounded-lg border-2 ${getSideColor(tx.side)} group-hover:scale-110 transition-transform duration-300`}>
                    {getSideIcon(tx.side)}
                  </div>
                  {index < transactions.length - 1 && (
                    <div className="w-px h-full bg-gradient-to-b from-border to-transparent mt-2 hidden sm:block" />
                  )}
                </div>

                {/* Transaction Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2 sm:mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 flex-wrap">
                        <span className={`px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold uppercase border ${getSideColor(tx.side)}`}>
                          {tx.side}
                        </span>
                        <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 glass rounded text-[10px] sm:text-xs">
                          {tx.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs md:text-sm text-muted-foreground flex-wrap">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                        <span>{formatTimestamp(tx.timestamp)}</span>
                        <span className="text-muted-foreground/50 hidden sm:inline">•</span>
                        <span className="truncate hidden sm:inline">Block #{tx.blockNumber.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-base sm:text-lg md:text-xl font-bold gradient-text">
                        ${tx.amount.toFixed(0)}
                      </div>
                      <div className="text-[10px] sm:text-xs text-muted-foreground">
                        {(tx.amount / market.yes_price).toFixed(0)} shares
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 sm:gap-4 pt-2 sm:pt-3 border-t border-border/30">
                    <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                      <span className="text-[10px] sm:text-xs text-muted-foreground hidden sm:inline">Wallet:</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/wallet/${tx.address}`);
                        }}
                        className="flex items-center gap-1 text-[10px] sm:text-xs font-mono text-foreground/80 hover:text-primary transition-colors truncate"
                      >
                        <span className="truncate max-w-[80px] sm:max-w-none">{tx.address.slice(0, 6)}...{tx.address.slice(-4)}</span>
                        <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                      </button>
                    </div>
                    {isPolymarket && tx.hash && (
                      <a
                        href={`https://polygonscan.com/tx/${tx.hash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] sm:text-xs text-primary hover:text-primary/80 transition-colors shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="hidden sm:inline">View</span>
                        <ArrowUpRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
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
