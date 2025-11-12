import { TrendingUp, TrendingDown, Activity, Zap } from "lucide-react";
import { useMarkets } from "@/hooks/useMarkets";
import { useMemo } from "react";

const AnalyticsLive = () => {
  const { data: markets } = useMarkets();

  // Calculate top movers based on volatility and price change
  const topMovers = useMemo(() => {
    if (!markets) return [];
    
    return markets
      .map(market => ({
        name: market.title,
        change: `${((market.yes_price - 0.5) * 100).toFixed(1)}%`,
        direction: market.yes_price > 0.5 ? 'up' : 'down',
        volume: `$${(market.volume_24h / 1000).toFixed(1)}K`,
        volatility: market.volatility,
      }))
      .sort((a, b) => b.volatility - a.volatility)
      .slice(0, 3);
  }, [markets]);

  // Calculate liquidity flows by category
  const liquidityFlows = useMemo(() => {
    if (!markets) return [];

    const categoryTotals: Record<string, number> = {};
    markets.forEach(market => {
      const category = market.category || 'general';
      categoryTotals[category] = (categoryTotals[category] || 0) + market.liquidity;
    });

    const sortedCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3);

    return sortedCategories.map(([category, amount], index, array) => {
      const nextCategory = array[(index + 1) % array.length];
      return {
        from: category.charAt(0).toUpperCase() + category.slice(1),
        to: nextCategory[0].charAt(0).toUpperCase() + nextCategory[0].slice(1),
        amount: `$${(amount / 1000).toFixed(1)}K`,
        color: ['from-primary to-secondary', 'from-secondary to-accent', 'from-accent to-primary'][index % 3],
      };
    });
  }, [markets]);

  // Calculate sentiment by category
  const sentimentData = useMemo(() => {
    if (!markets) return [];

    const categoryData: Record<string, { bullish: number; bearish: number; total: number }> = {};
    
    markets.forEach(market => {
      const category = market.category || 'general';
      if (!categoryData[category]) {
        categoryData[category] = { bullish: 0, bearish: 0, total: 0 };
      }
      
      if (market.yes_price > 0.5) {
        categoryData[category].bullish++;
      } else {
        categoryData[category].bearish++;
      }
      categoryData[category].total++;
    });

    return Object.entries(categoryData)
      .slice(0, 4)
      .map(([category, data]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        bullish: Math.round((data.bullish / data.total) * 100),
        bearish: Math.round((data.bearish / data.total) * 100),
      }));
  }, [markets]);

  if (!markets || markets.length === 0) {
    return null;
  }

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4 animate-slide-up">
          <h2 className="text-5xl font-bold">
            <span className="gradient-text">Real-Time Analytics</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Live market movements, liquidity flows, and trader sentiment from Kalshi & Polymarket.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Movers */}
          <div className="glass-strong rounded-3xl p-8 space-y-6 hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary glow-pink">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold gradient-text">Top Movers</h3>
                <p className="text-sm text-muted-foreground">Fastest changing odds</p>
              </div>
            </div>

            <div className="space-y-4">
              {topMovers.map((mover, i) => (
                <div 
                  key={i} 
                  className="glass p-4 rounded-xl hover:glass-strong transition-all duration-300 group cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 pr-4">
                      <div className="font-semibold text-lg mb-1 line-clamp-1">{mover.name}</div>
                      <div className="text-sm text-muted-foreground">Volume: {mover.volume}</div>
                    </div>
                    <div className={`flex items-center gap-2 font-bold text-xl ${mover.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                      {mover.direction === 'up' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      {mover.change}
                    </div>
                  </div>
                  <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${mover.direction === 'up' ? 'from-green-400 to-green-600' : 'from-red-400 to-red-600'} animate-shimmer`}
                      style={{ width: `${Math.min(100, mover.volatility)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Liquidity Flow */}
          <div className="glass-strong rounded-3xl p-8 space-y-6 hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-secondary to-accent glow-purple">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold gradient-text">Liquidity by Category</h3>
                <p className="text-sm text-muted-foreground">Capital distribution</p>
              </div>
            </div>

            <div className="space-y-6">
              {liquidityFlows.map((flow, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{flow.from}</span>
                    <span className="font-bold gradient-text">{flow.amount}</span>
                  </div>
                  <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`absolute inset-0 bg-gradient-to-r ${flow.color} animate-shimmer`}
                      style={{ 
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 2s linear infinite'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sentiment Waves */}
          <div className="lg:col-span-2 glass-strong rounded-3xl p-8 hover:scale-[1.01] transition-all duration-300">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 rounded-xl bg-gradient-to-br from-accent to-primary glow-blue">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold gradient-text">Sentiment by Category</h3>
                <p className="text-sm text-muted-foreground">Market positioning across categories</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {sentimentData.map((sentiment, i) => (
                <div key={i} className="text-center space-y-4">
                  <div className="font-semibold text-lg">{sentiment.category}</div>
                  <div className="relative h-32">
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full">
                      <div className="flex gap-2 items-end justify-center h-24">
                        <div 
                          className="w-1/2 bg-gradient-to-t from-green-400 to-green-600 rounded-t-lg transition-all duration-500 hover:scale-105"
                          style={{ height: `${sentiment.bullish}%` }}
                        />
                        <div 
                          className="w-1/2 bg-gradient-to-t from-red-400 to-red-600 rounded-t-lg transition-all duration-500 hover:scale-105"
                          style={{ height: `${sentiment.bearish}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>{sentiment.bullish}%</span>
                        <span>{sentiment.bearish}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AnalyticsLive;
