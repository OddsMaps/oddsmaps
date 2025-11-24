import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { logger } from '@/lib/utils';

interface Transaction {
  id: string;
  wallet_address: string;
  amount: number;
  price: number;
  side: string;
  timestamp: string;
  transaction_hash: string;
  market: {
    title: string;
    market_id: string;
  };
}

export const AllTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallet_transactions',
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select(`
          id,
          wallet_address,
          amount,
          price,
          side,
          timestamp,
          transaction_hash,
          market_id,
          markets!inner (
            title,
            market_id,
            source
          )
        `)
        .eq('markets.source', 'polymarket')
        .gte('amount', 10000)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      // Transform data to match Transaction interface
      const transformedData = (data || []).map((item: any) => ({
        id: item.id,
        wallet_address: item.wallet_address,
        amount: item.amount,
        price: item.price,
        side: item.side,
        timestamp: item.timestamp,
        transaction_hash: item.transaction_hash,
        market: {
          title: item.markets.title,
          market_id: item.markets.market_id,
        }
      }));
      
      logger.log('Fetched whale transactions:', transformedData.length);
      setTransactions(transformedData);
    } catch (error) {
      logger.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Show only 5 by default, or all if showAll is true
  const displayedTransactions = showAll ? transactions : transactions.slice(0, 5);

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

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-12">
          <Activity className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold">Whale Activity 🐋</h2>
          <p className="text-sm sm:text-base text-muted-foreground">Real-time bets over $10,000 on Polymarket</p>
        </div>
        <Badge variant="outline" className="gap-2 self-start sm:self-auto">
          <Activity className="h-3 w-3 animate-pulse text-green-500" />
          {transactions.length} Whales
        </Badge>
      </div>

      <div className="grid gap-3">
        {displayedTransactions.map((tx) => (
          <Card
            key={tx.id}
            className="p-3 sm:p-4 hover:bg-accent/50 transition-colors cursor-pointer touch-manipulation active:scale-[0.98]"
            onClick={() => navigate(`/wallet/${tx.wallet_address}`)}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
              {/* Mobile: Badge and Market Info Stacked */}
              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                <Badge className={`${getSideColor(tx.side)} border shrink-0 text-xs`}>
                  <span className="flex items-center gap-1">
                    {getSideIcon(tx.side)}
                    <span className="hidden xs:inline">{tx.side.toUpperCase()}</span>
                  </span>
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base line-clamp-2 sm:truncate break-words">{tx.market?.title}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {tx.wallet_address.slice(0, 6)}...{tx.wallet_address.slice(-4)}
                  </p>
                </div>
              </div>
              
              {/* Mobile: Amount and Time in Row */}
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 sm:shrink-0">
                <div className="text-left sm:text-right">
                  <p className="font-bold text-base sm:text-lg gradient-text-premium">
                    ${tx.amount.toLocaleString()}
                  </p>
                  <p className={`text-sm sm:text-base font-bold ${getSideColor(tx.side).split(' ')[0]}`}>
                    {tx.side.toUpperCase()} @ {(tx.price * 100).toFixed(1)}¢
                  </p>
                </div>
                <div className="text-right text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                  {formatTime(tx.timestamp)}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Show More Button */}
      {transactions.length > 5 && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
            className="gap-2"
          >
            {showAll ? 'Show Less' : `Show More (${transactions.length - 5} more)`}
            {showAll ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />}
          </Button>
        </div>
      )}
    </div>
  );
};
