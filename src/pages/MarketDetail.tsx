import { useParams, useNavigate } from "react-router-dom";
import { memo } from "react";
import { ArrowLeft, TrendingUp, TrendingDown, Activity, AlertTriangle, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMarkets } from "@/hooks/useMarkets";
import WalletBubbleMap from "@/components/WalletBubbleMap";
import InsiderAnalysis from "@/components/InsiderAnalysis";
import TransactionTimeline from "@/components/TransactionTimeline";
import Header from "@/components/Header";

const MarketHeader = memo(({ market, isPositive, change, onBack }: any) => (
  <>
    <Button
      variant="ghost"
      onClick={onBack}
      className="mb-6 glass hover:glass-strong"
    >
      <ArrowLeft className="w-4 h-4 mr-2" />
      Back to Markets
    </Button>

    <div className="glass-strong rounded-2xl p-8 mb-8 animate-fade-in border border-border/50">
      <div className="flex items-start justify-between gap-6 mb-6">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1.5 rounded-lg bg-primary/20 border border-primary/30 text-sm font-bold uppercase tracking-wide">
              {market.source}
            </span>
            {market.category && (
              <span className="px-3 py-1 glass rounded-lg text-sm">
                {market.category}
              </span>
            )}
            <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
              market.status === 'active' 
                ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            }`}>
              {market.status}
            </span>
          </div>
          
          <h1 className="text-4xl font-bold mb-4">
            {market.title}
          </h1>
          
          {market.description && (
            <p className="text-lg text-muted-foreground">
              {market.description}
            </p>
          )}
        </div>

        <div className="flex flex-col items-end gap-4">
          <div className={`flex items-center gap-2 text-5xl font-bold ${
            isPositive ? "text-green-400" : "text-red-400"
          }`}>
            {isPositive ? (
              <TrendingUp className="w-10 h-10" />
            ) : (
              <TrendingDown className="w-10 h-10" />
            )}
            <span>{(market.yes_price * 100).toFixed(1)}¢</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Yes price
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 border-t border-border/50">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">24h Volume</div>
          <div className="text-2xl font-bold gradient-text">
            ${(market.volume_24h / 1000).toFixed(1)}K
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Liquidity</div>
          <div className="text-2xl font-bold gradient-text">
            ${(market.liquidity / 1000).toFixed(1)}K
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">24h Trades</div>
          <div className="text-2xl font-bold gradient-text">
            {market.trades_24h.toLocaleString()}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Volatility</div>
          <div className="text-2xl font-bold gradient-text">
            {market.volatility.toFixed(1)}%
          </div>
        </div>
      </div>
    </div>
  </>
));

MarketHeader.displayName = 'MarketHeader';

const MarketDetail = () => {
  const { marketId } = useParams();
  const navigate = useNavigate();
  // Only fetch Polymarket markets
  const { data: markets } = useMarkets('polymarket');
  
  const market = markets?.find(m => m.market_id === marketId);

  if (!market) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center glass-strong p-12 rounded-2xl">
          <Activity className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-4">Market not found</h1>
          <p className="text-muted-foreground mb-6">This Polymarket market doesn't exist or hasn't been synced yet.</p>
          <Button onClick={() => navigate("/")} className="glow-gradient">
            Back to Home
          </Button>
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
          <MarketHeader 
            market={market} 
            isPositive={isPositive} 
            change={change}
            onBack={() => navigate("/")}
          />

          <Tabs defaultValue="wallets" className="space-y-6">
            <TabsList className="glass-strong p-1.5 border border-border/50">
              <TabsTrigger 
                value="wallets" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Activity className="w-4 h-4 mr-2" />
                Wallet Analysis
              </TabsTrigger>
              <TabsTrigger 
                value="transactions" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <History className="w-4 h-4 mr-2" />
                Transactions
              </TabsTrigger>
              <TabsTrigger 
                value="insider" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Suspicious Activity
              </TabsTrigger>
            </TabsList>

            <TabsContent value="wallets" className="space-y-6">
              <WalletBubbleMap market={market} />
            </TabsContent>

            <TabsContent value="transactions" className="space-y-6">
              <TransactionTimeline market={market} />
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
