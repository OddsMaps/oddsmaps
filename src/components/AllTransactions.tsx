import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
          *,
          market:markets!inner(title, market_id, source)
        `)
        .eq('market.source', 'polymarket')
        .order('timestamp', { ascending: false })
        .limit(100);

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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">All Polymarket Transactions</h2>
          <p className="text-muted-foreground">Real-time feed of every bet placed</p>
        </div>
        <Badge variant="outline" className="gap-2">
          <Activity className="h-3 w-3 animate-pulse text-green-500" />
          {transactions.length} Live
        </Badge>
      </div>

      <div className="grid gap-3">
        {transactions.map((tx) => (
          <Card
            key={tx.id}
            className="p-4 hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => navigate(`/wallet/${tx.wallet_address}`)}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Badge className={`${getSideColor(tx.side)} border`}>
                  <span className="flex items-center gap-1">
                    {getSideIcon(tx.side)}
                    {tx.side.toUpperCase()}
                  </span>
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{tx.market?.title}</p>
                  <p className="text-sm text-muted-foreground truncate">
                    {tx.wallet_address.slice(0, 6)}...{tx.wallet_address.slice(-4)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold">${tx.amount.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">
                  @ ${tx.price.toFixed(2)}
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground whitespace-nowrap">
                {formatTime(tx.timestamp)}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
