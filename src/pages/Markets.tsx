import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useMarkets } from "@/hooks/useMarkets";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Search, TrendingUp, TrendingDown, Activity } from "lucide-react";

const Markets = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: markets, isLoading } = useMarkets("polymarket");

  const filteredMarkets = markets?.filter(market =>
    market.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    market.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get top 6 trending markets by 24h volume
  const trendingMarkets = [...(markets || [])]
    .sort((a, b) => b.volume_24h - a.volume_24h)
    .slice(0, 6);

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    }
    return `$${(volume / 1000).toFixed(0)}K`;
  };

  const getPriceChange = (market: any) => {
    const yesPrice = market.yes_price || 0;
    return yesPrice >= 0.5 ? "bullish" : "bearish";
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="text-4xl md:text-5xl font-bold">
                <span className="gradient-text">Live Prediction Markets</span>
              </h1>
              <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-500">LIVE</span>
              </div>
            </div>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Real-time data from Polymarket. All prices and volumes update automatically.
            </p>
          </div>

          {/* Trending Markets */}
          {!isLoading && trendingMarkets.length > 0 && (
            <div id="trending" className="space-y-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-primary" />
                <h2 className="text-2xl font-bold gradient-text">Trending Now on Polymarket</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trendingMarkets.map((market) => (
                  <Card
                    key={market.id}
                    className="glass-card cursor-pointer hover:scale-[1.02] transition-all duration-300 border-primary/30"
                    onClick={() => navigate(`/market/${market.market_id}`)}
                  >
                    <CardHeader className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg line-clamp-2 flex-1">
                          {market.title}
                        </CardTitle>
                        <Badge variant="secondary" className="shrink-0 bg-primary/20 text-primary border-primary/30">
                          <TrendingUp className="w-3 h-3 mr-1" />
                          HOT
                        </Badge>
                      </div>
                      <CardDescription className="line-clamp-2">
                        {market.description || "No description available"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-sm font-medium">
                          <span className="flex items-center gap-1.5 text-green-500">
                            <Activity className="w-4 h-4" />
                            YES {(market.yes_price * 100).toFixed(1)}%
                          </span>
                          <span className="flex items-center gap-1.5 text-red-500">
                            <Activity className="w-4 h-4" />
                            NO {(market.no_price * 100).toFixed(1)}%
                          </span>
                        </div>
                        <Progress value={market.yes_price * 100} className="h-2.5" />
                      </div>
                      <div className="flex justify-between items-center pt-2 border-t border-border/50">
                        <div>
                          <p className="text-xs text-muted-foreground">24h Volume</p>
                          <p className="font-bold text-foreground">
                            {formatVolume(market.volume_24h)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Total Volume</p>
                          <p className="font-bold text-foreground">
                            {formatVolume(market.total_volume)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Search */}
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 glass"
            />
          </div>

          {/* Stats */}
          {markets && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardDescription>Total Markets</CardDescription>
                  <CardTitle className="text-3xl gradient-text">{markets.length}</CardTitle>
                </CardHeader>
              </Card>
              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardDescription>Total Volume</CardDescription>
                  <CardTitle className="text-3xl gradient-text">
                    {formatVolume(markets.reduce((sum, m) => sum + (m.total_volume || 0), 0))}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardDescription>Active Now</CardDescription>
                  <CardTitle className="text-3xl gradient-text">
                    {markets.filter(m => m.status === 'active').length}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
          )}

          {/* Markets Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMarkets?.map((market) => {
                const priceChange = getPriceChange(market);
                const yesPrice = ((market.yes_price || 0) * 100).toFixed(1);
                const noPrice = ((market.no_price || 0) * 100).toFixed(1);
                const yesPercentage = (market.yes_price || 0) * 100;
                
                return (
                  <Card
                    key={market.id}
                    className="glass hover:glass-strong transition-all duration-300 cursor-pointer hover:scale-[1.02] group"
                    onClick={() => navigate(`/market/${market.market_id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant={priceChange === "bullish" ? "default" : "secondary"} className="shrink-0">
                          {priceChange === "bullish" ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {yesPrice}%
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {market.category || "Other"}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {market.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {market.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Yes/No Distribution Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 text-green-500 font-medium">
                            <Activity className="w-3 h-3" />
                            YES {yesPrice}%
                          </span>
                          <span className="flex items-center gap-1 text-red-500 font-medium">
                            NO {noPrice}%
                            <Activity className="w-3 h-3" />
                          </span>
                        </div>
                        <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                            style={{ width: `${yesPercentage}%` }}
                          />
                          <div 
                            className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-500 to-red-400 transition-all duration-500"
                            style={{ width: `${100 - yesPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-border/50">
                        <div>
                          <div className="text-muted-foreground text-xs">Total Volume</div>
                          <div className="font-semibold">
                            {formatVolume(market.total_volume || 0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs">24h Volume</div>
                          <div className="font-semibold">
                            {formatVolume(market.volume_24h || 0)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {filteredMarkets?.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No markets found matching your search.</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Markets;
