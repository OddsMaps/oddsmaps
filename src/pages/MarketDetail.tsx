import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMarkets } from "@/hooks/useMarkets";
import WalletBubbleMap from "@/components/WalletBubbleMap";
import InsiderAnalysis from "@/components/InsiderAnalysis";
import Header from "@/components/Header";

const MarketDetail = () => {
  const { marketId } = useParams();
  const navigate = useNavigate();
  const { data: markets } = useMarkets();
  
  const market = markets?.find(m => m.market_id === marketId);

  if (!market) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Market not found</h1>
          <Button onClick={() => navigate("/")}>Back to Home</Button>
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
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate("/")}
            className="mb-6 glass hover:glass-strong"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Markets
          </Button>

          {/* Market Header */}
          <div className="glass-strong rounded-3xl p-8 mb-8 animate-fade-in">
            <div className="flex items-start justify-between gap-6 mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 glass rounded-full text-sm font-semibold uppercase">
                    {market.source}
                  </span>
                  {market.category && (
                    <span className="px-3 py-1 glass rounded-full text-sm">
                      {market.category}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                    market.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {market.status}
                  </span>
                </div>
                
                <h1 className="text-4xl font-bold gradient-text mb-4">
                  {market.title}
                </h1>
                
                {market.description && (
                  <p className="text-lg text-muted-foreground">
                    {market.description}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-4">
                <div className={`flex items-center gap-2 text-4xl font-bold ${
                  isPositive ? "text-green-400" : "text-red-400"
                }`}>
                  {isPositive ? (
                    <TrendingUp className="w-8 h-8" />
                  ) : (
                    <TrendingDown className="w-8 h-8" />
                  )}
                  <span>{(market.yes_price * 100).toFixed(1)}¢</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Yes price
                </div>
              </div>
            </div>

            {/* Market Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-border/50">
              <div>
                <div className="text-sm text-muted-foreground mb-1">24h Volume</div>
                <div className="text-2xl font-bold gradient-text">
                  ${(market.volume_24h / 1000).toFixed(1)}K
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Liquidity</div>
                <div className="text-2xl font-bold gradient-text">
                  ${(market.liquidity / 1000).toFixed(1)}K
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">24h Trades</div>
                <div className="text-2xl font-bold gradient-text">
                  {market.trades_24h.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Volatility</div>
                <div className="text-2xl font-bold gradient-text">
                  {market.volatility.toFixed(1)}%
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="wallets" className="space-y-6">
            <TabsList className="glass-strong p-1">
              <TabsTrigger value="wallets" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary">
                <Activity className="w-4 h-4 mr-2" />
                Wallet Analysis
              </TabsTrigger>
              <TabsTrigger value="insider" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-secondary">
                <AlertTriangle className="w-4 h-4 mr-2" />
                Suspicious Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wallets" className="space-y-6">
              <WalletBubbleMap market={market} />
            </TabsContent>

            <TabsContent value="insider" className="space-y-6">
              <InsiderAnalysis market={market} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MarketDetail;
