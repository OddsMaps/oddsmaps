import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, TrendingUp, TrendingDown, Activity, DollarSign, Clock, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";
import { useMarkets } from "@/hooks/useMarkets";
import { fetchMarketTransactions } from "@/lib/polymarket-api";
import WalletBubbleMap from "@/components/WalletBubbleMap";

interface BetDetails {
  id: string;
  wallet_address: string;
  amount: number;
  price: number;
  side: string;
  transaction_type: string;
  timestamp: string;
  transaction_hash: string;
  block_number: number | null;
  market: {
    id: string;
    market_id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    source: string;
  };
}

interface SimilarBet {
  id: string;
  wallet_address: string;
  amount: number;
  price: number;
  side: string;
  timestamp: string;
}

const BetDetail = () => {
  const { txId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [bet, setBet] = useState<BetDetails | null>(null);
  const [similarBets, setSimilarBets] = useState<SimilarBet[]>([]);
  const { data: markets } = useMarkets();

  useEffect(() => {
    if (!txId || !markets || markets.length === 0) return;

    const fetchBetDetails = async () => {
      try {
        setLoading(true);
        
        // Try to find transaction by searching through markets
        // txId could be a transaction hash (starts with 0x) or Supabase ID
        let foundBet: any = null;
        let foundMarket: any = null;

        // Search through markets to find the transaction
        for (const market of markets.slice(0, 20)) { // Limit to top 20 markets for performance
          try {
            const transactions = await fetchMarketTransactions(market.market_id, 1000);

            // Check if txId matches transaction hash or ID
            const transaction = transactions.find((tx) => 
              tx.hash === txId || 
              tx.transaction_hash === txId || 
              tx.id === txId
            );

            if (transaction) {
              foundBet = {
                ...transaction,
                wallet_address: transaction.address || transaction.wallet_address || '',
                amount: Number(transaction.amount),
                price: Number(transaction.price),
                transaction_type: transaction.type || 'market',
                block_number: transaction.blockNumber || null,
                market: {
                  id: market.id,
                  market_id: market.market_id,
                  title: market.title,
                  description: market.description,
                  category: market.category,
                  status: market.status,
                  source: market.source,
                }
              };
              foundMarket = market;
              break;
            }
          } catch (error) {
            console.error(`Error searching market ${market.market_id}:`, error);
            continue;
          }
        }

        if (!foundBet) {
          throw new Error('Transaction not found');
        }

        setBet(foundBet);

        // Fetch similar bets on the same market
        if (foundMarket) {
          try {
            const transactions = await fetchMarketTransactions(foundMarket.market_id, 100);

            const similar = transactions
              .filter((tx) => 
                (tx.hash !== txId && tx.transaction_hash !== txId && tx.id !== txId) &&
                (tx.address || tx.wallet_address) === foundBet.wallet_address
              )
              .slice(0, 10)
              .map((tx) => ({
                id: tx.id,
                wallet_address: tx.address || tx.wallet_address || '',
                amount: Number(tx.amount),
                price: Number(tx.price),
                side: tx.side,
                timestamp: tx.timestamp,
              }));
            
            setSimilarBets(similar);
          } catch (error) {
            console.error('Error fetching similar bets:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching bet details:', error);
        toast({
          title: "Error",
          description: "Failed to load bet details. Transaction may not be available.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBetDetails();

    // Refetch every 1 minute for updated data
    const interval = setInterval(fetchBetDetails, 60 * 1000);

    return () => {
      clearInterval(interval);
    };
  }, [txId, markets, toast]);

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  // Get current market data
  const currentMarket = markets?.find(m => m.market_id === bet?.market.market_id);

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

  if (!bet) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-16 px-6">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Bet not found</h1>
            <Button onClick={() => navigate(-1)} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              className="rounded-full"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold gradient-text">Bet Details</h1>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-sm text-muted-foreground">Live</span>
                </div>
              </div>
              <p className="text-muted-foreground mt-1">Real-time bet information and market data</p>
            </div>
          </div>

          {/* Main Bet Card */}
          <Card className="glass-strong">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-2xl mb-2">{bet.market.title}</CardTitle>
                  <CardDescription className="text-base">{bet.market.description}</CardDescription>
                </div>
                <Badge className={`${
                  bet.side === 'yes' 
                    ? 'bg-green-500/20 text-green-500 border-green-500/20' 
                    : 'bg-red-500/20 text-red-500 border-red-500/20'
                } text-lg px-4 py-2`}>
                  {bet.side.toUpperCase()} BET
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Bet Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="glass">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="w-4 h-4" />
                  <CardDescription>Bet Amount</CardDescription>
                </div>
                <CardTitle className="text-2xl gradient-text">
                  ${bet.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="glass">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Target className="w-4 h-4" />
                  <CardDescription>Entry Price</CardDescription>
                </div>
                <CardTitle className="text-2xl gradient-text">
                  {(bet.price * 100).toFixed(1)}%
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="glass">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Activity className="w-4 h-4" />
                  <CardDescription>Current Price</CardDescription>
                </div>
                <CardTitle className="text-2xl">
                  {currentMarket ? (
                    <span className={
                      bet.side === 'yes' 
                        ? currentMarket.yes_price > bet.price ? 'text-green-500' : 'text-red-500'
                        : currentMarket.no_price > bet.price ? 'text-green-500' : 'text-red-500'
                    }>
                      {bet.side === 'yes' 
                        ? (currentMarket.yes_price * 100).toFixed(1)
                        : (currentMarket.no_price * 100).toFixed(1)}%
                      {bet.side === 'yes' 
                        ? currentMarket.yes_price > bet.price 
                          ? <TrendingUp className="w-4 h-4 inline ml-1" />
                          : <TrendingDown className="w-4 h-4 inline ml-1" />
                        : currentMarket.no_price > bet.price
                          ? <TrendingUp className="w-4 h-4 inline ml-1" />
                          : <TrendingDown className="w-4 h-4 inline ml-1" />
                      }
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </CardTitle>
              </CardHeader>
            </Card>

            <Card className="glass">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Clock className="w-4 h-4" />
                  <CardDescription>Time Placed</CardDescription>
                </div>
                <CardTitle className="text-lg">
                  {formatTimeAgo(bet.timestamp)}
                </CardTitle>
                <p className="text-xs text-muted-foreground">{formatTimestamp(bet.timestamp)}</p>
              </CardHeader>
            </Card>
          </div>

          {/* Wallet Bubble Map */}
          {currentMarket && (
            <WalletBubbleMap market={currentMarket} />
          )}

          {/* Market Info */}
          {currentMarket && (
            <Card className="glass">
              <CardHeader>
                <CardTitle>Live Market Data</CardTitle>
                <CardDescription>Real-time market statistics from Polymarket</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Total Volume</div>
                    <div className="font-semibold">${(currentMarket.total_volume / 1000).toFixed(1)}K</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">24h Volume</div>
                    <div className="font-semibold">${(currentMarket.volume_24h / 1000).toFixed(1)}K</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Liquidity</div>
                    <div className="font-semibold">${(currentMarket.liquidity / 1000).toFixed(1)}K</div>
                  </div>
                </div>
                <Button
                  className="w-full mt-4"
                  variant="outline"
                  onClick={() => navigate(`/market/${bet.market.market_id}`)}
                >
                  View Full Market Details
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Similar Bets */}
          {similarBets.length > 0 && (
            <Card className="glass">
              <CardHeader>
                <CardTitle>Recent Bets on This Market</CardTitle>
                <CardDescription>Other traders betting on the same market</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {similarBets.map((similarBet) => (
                    <div
                      key={similarBet.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/bet/${similarBet.id}`)}
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <Badge className={`text-xs ${
                          similarBet.side === 'yes' 
                            ? 'bg-green-500/20 text-green-500 border-green-500/20' 
                            : 'bg-red-500/20 text-red-500 border-red-500/20'
                        }`}>
                          {similarBet.side.toUpperCase()}
                        </Badge>
                        <span className="font-mono text-xs text-muted-foreground truncate">
                          {similarBet.wallet_address.slice(0, 6)}...{similarBet.wallet_address.slice(-4)}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">${similarBet.amount.toFixed(2)}</div>
                        <div className="text-xs text-muted-foreground">{formatTimeAgo(similarBet.timestamp)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default BetDetail;
