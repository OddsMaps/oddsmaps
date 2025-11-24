import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, Wallet, TrendingUp, TrendingDown, Activity, DollarSign, Target, Award, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";

interface WalletProfile {
  wallet_address: string;
  total_volume: number;
  total_trades: number;
  total_markets: number;
  total_pnl: number;
  win_rate: number;
  first_seen: string;
  last_seen: string;
}

interface Position {
  id: string;
  side: 'yes' | 'no';
  position_size: number;
  avg_entry_price: number;
  current_price: number;
  pnl: number;
  trades_count: number;
  status: string;
  opened_at: string;
  markets: {
    id: string;
    title: string;
    source: string;
    category: string;
    status: string;
  };
}

interface Transaction {
  id: string;
  transaction_hash: string;
  side: string;
  amount: number;
  price: number;
  transaction_type: string;
  timestamp: string;
  markets: {
    id: string;
    market_id: string;
    title: string;
    source: string;
  };
}

const WalletProfile = () => {
  const { address } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<WalletProfile | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    if (!address) return;

    const fetchWalletProfile = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase.functions.invoke('get-wallet-profile', {
          body: { walletAddress: address }
        });

        if (error) throw error;

        setProfile(data.profile);
        setPositions(data.positions || []);
        setTransactions(data.transactions || []);
        setStats(data.stats);
      } catch (error) {
        console.error('Error fetching wallet profile:', error);
        toast({
          title: "Error",
          description: "Failed to load wallet profile",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchWalletProfile();
  }, [address, toast]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-16 px-6">
          <div className="max-w-7xl mx-auto flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-16 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Wallet not found</h1>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  const activePositions = positions.filter(p => p.status === 'active');
  const closedPositions = positions.filter(p => p.status === 'closed');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 glass hover:glass-strong"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {/* Wallet Header */}
          <div className="glass-strong rounded-3xl p-8 mb-8 animate-fade-in">
            <div className="flex items-start justify-between gap-6 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold gradient-text">Wallet Profile</h1>
                    <code className="text-sm text-muted-foreground font-mono">{address}</code>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`text-4xl font-bold mb-2 ${
                  stats?.totalPnL >= 0 ? "text-green-400" : "text-red-400"
                }`}>
                  {stats?.totalPnL >= 0 ? "+" : ""}${stats?.totalPnL?.toFixed(2) || "0.00"}
                </div>
                <div className="text-sm text-muted-foreground">Total P&L</div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Volume</span>
                </div>
                <div className="text-xl font-bold gradient-text">
                  ${(profile.total_volume / 1000).toFixed(1)}K
                </div>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-secondary" />
                  <span className="text-xs text-muted-foreground">Trades</span>
                </div>
                <div className="text-xl font-bold gradient-text">
                  {profile.total_trades}
                </div>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="w-4 h-4 text-accent" />
                  <span className="text-xs text-muted-foreground">Markets</span>
                </div>
                <div className="text-xl font-bold gradient-text">
                  {profile.total_markets}
                </div>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-muted-foreground">Win Rate</span>
                </div>
                <div className="text-xl font-bold text-green-400">
                  {stats?.winRate?.toFixed(1) || 0}%
                </div>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-xs text-muted-foreground">Wins</span>
                </div>
                <div className="text-xl font-bold text-green-400">
                  {stats?.winningTrades || 0}
                </div>
              </div>

              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-xs text-muted-foreground">Losses</span>
                </div>
                <div className="text-xl font-bold text-red-400">
                  {stats?.losingTrades || 0}
                </div>
              </div>
            </div>

            {/* Activity Dates */}
            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-border/50 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>First seen: {new Date(profile.first_seen).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Last active: {formatTimestamp(profile.last_seen)}</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="positions" className="space-y-6">
            <TabsList className="glass-strong p-1">
              <TabsTrigger value="positions">
                <Target className="w-4 h-4 mr-2" />
                Positions ({activePositions.length})
              </TabsTrigger>
              <TabsTrigger value="history">
                <Activity className="w-4 h-4 mr-2" />
                History ({transactions.length})
              </TabsTrigger>
            </TabsList>

            {/* Active Positions */}
            <TabsContent value="positions" className="space-y-4">
              <div className="glass-strong rounded-2xl p-6">
                <h3 className="text-xl font-bold gradient-text mb-6">Active Positions</h3>
                
                {activePositions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No active positions
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activePositions.map((position) => (
                      <div
                        key={position.id}
                        className="glass border border-border/50 rounded-xl p-5 hover:border-primary/50 transition-all duration-300 cursor-pointer"
                        onClick={() => navigate(`/market/${position.markets.id}`)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <span className="px-3 py-1 glass rounded-full text-xs font-semibold">
                                {position.markets.source}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                position.side === 'yes' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                              }`}>
                                {position.side.toUpperCase()}
                              </span>
                            </div>
                            <h4 className="font-semibold mb-2">{position.markets.title}</h4>
                            <div className="grid grid-cols-4 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground text-xs">Position</div>
                                <div className="font-semibold">${position.position_size.toFixed(2)}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground text-xs">Entry</div>
                                <div className="font-semibold">{(position.avg_entry_price * 100).toFixed(1)}¢</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground text-xs">Current</div>
                                <div className="font-semibold">{(position.current_price * 100).toFixed(1)}¢</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground text-xs">P&L</div>
                                <div className={`font-semibold ${position.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                  {position.pnl >= 0 ? '+' : ''}${position.pnl.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Transaction History */}
            <TabsContent value="history" className="space-y-4">
              <div className="glass-strong rounded-2xl p-6">
                <h3 className="text-xl font-bold gradient-text mb-6">Transaction History</h3>
                
                {transactions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No transactions found
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[800px] overflow-y-auto custom-scrollbar">
                    {transactions.map((tx) => (
                      <div
                        key={tx.id}
                        className="glass border border-border/50 rounded-xl p-4 hover:border-primary/50 transition-all duration-300"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                tx.side === 'buy' || tx.side === 'yes' 
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                                  : 'bg-red-500/20 text-red-400 border border-red-500/50'
                              }`}>
                                {tx.side.toUpperCase()}
                              </span>
                              <span className="px-2 py-1 glass rounded text-xs">
                                {tx.transaction_type}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatTimestamp(tx.timestamp)}
                              </span>
                            </div>
                            <div className="text-sm font-medium mb-1">{tx.markets?.title || 'Unknown Market'}</div>
                            <div className="text-xs text-muted-foreground">
                              {tx.markets?.source}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold gradient-text">
                              ${tx.amount.toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              @ {(tx.price * 100).toFixed(1)}¢
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default WalletProfile;
