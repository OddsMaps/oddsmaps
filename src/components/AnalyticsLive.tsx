import { TrendingUp, TrendingDown, Activity, Zap } from "lucide-react";
import { useMarkets } from "@/hooks/useMarkets";
import { usePolymarketSync } from "@/hooks/usePolymarketSync";
import { usePriceChanges } from "@/hooks/usePriceChanges";
import { useMemo } from "react";

const AnalyticsLive = () => {
  const { data: markets } = useMarkets();
  const { priceChanges, activeMarkets } = usePriceChanges(markets);
  
  // Sync Polymarket data on mount and periodically
  usePolymarketSync();

  // Calculate top movers based on volatility and price change
  const topMovers = useMemo(() => {
    if (!markets) return [];
    
    return markets
      .map(market => {
        const priceChange = priceChanges.get(market.id);
        const isActive = activeMarkets.has(market.id);
        
        return {
          id: market.id,
          name: market.title,
          change: priceChange 
            ? `${priceChange.changePercent > 0 ? '+' : ''}${priceChange.changePercent.toFixed(1)}%`
            : `${((market.yes_price - 0.5) * 100).toFixed(1)}%`,
          direction: priceChange 
            ? (priceChange.isIncreasing ? 'up' : 'down')
            : (market.yes_price > 0.5 ? 'up' : 'down'),
          volume: `$${(market.volume_24h / 1000).toFixed(1)}K`,
          volatility: market.volatility,
          currentPrice: market.yes_price,
          priceChange: priceChange?.changePercent || 0,
          isActive,
        };
      })
      .sort((a, b) => Math.abs(b.priceChange) - Math.abs(a.priceChange))
      .slice(0, 5);
  }, [markets, priceChanges, activeMarkets]);

  // Calculate liquidity flows by category
  const liquidityFlows = useMemo(() => {
    if (!markets) return [];

    const categoryTotals: Record<string, { liquidity: number; count: number }> = {};
    markets.forEach(market => {
      const category = market.category || 'General';
      if (!categoryTotals[category]) {
        categoryTotals[category] = { liquidity: 0, count: 0 };
      }
      categoryTotals[category].liquidity += market.liquidity || 0;
      categoryTotals[category].count += 1;
    });

    return Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b.liquidity - a.liquidity)
      .slice(0, 5)
      .map(([category, data]) => ({
        category: category.charAt(0).toUpperCase() + category.slice(1),
        liquidity: data.liquidity,
        amount: `$${(data.liquidity / 1000).toFixed(1)}K`,
        markets: data.count,
        percentage: 0, // Will calculate after
      }));
  }, [markets]);

  // Calculate percentages for liquidity
  const liquidityFlowsWithPercentage = useMemo(() => {
    const total = liquidityFlows.reduce((sum, flow) => sum + flow.liquidity, 0);
    return liquidityFlows.map(flow => ({
      ...flow,
      percentage: total > 0 ? Math.round((flow.liquidity / total) * 100) : 0,
    }));
  }, [liquidityFlows]);

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
                  key={mover.id} 
                  className={`glass p-4 rounded-xl hover:glass-strong transition-all duration-300 group cursor-pointer relative overflow-hidden ${
                    mover.isActive ? 'animate-glow-pulse' : ''
                  }`}
                >
                  {/* Active indicator pulse */}
                  {mover.isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse pointer-events-none" />
                  )}
                  
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex-1 pr-4">
                        <div className="font-semibold text-lg mb-1 line-clamp-1">{mover.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Volume: {mover.volume} • Price: ${mover.currentPrice.toFixed(3)}
                        </div>
                      </div>
                      <div className={`flex items-center gap-2 font-bold text-xl transition-all duration-300 ${
                        mover.direction === 'up' ? 'text-green-400' : 'text-red-400'
                      } ${mover.isActive ? 'scale-110' : ''}`}>
                        {mover.direction === 'up' ? (
                          <TrendingUp className={`w-6 h-6 ${mover.isActive ? 'animate-bounce' : ''}`} />
                        ) : (
                          <TrendingDown className={`w-6 h-6 ${mover.isActive ? 'animate-bounce' : ''}`} />
                        )}
                        <span className={mover.isActive ? 'animate-pulse' : ''}>{mover.change}</span>
                      </div>
                    </div>
                    
                    {/* Volatility bar */}
                    <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r transition-all duration-500 ${
                          mover.direction === 'up' 
                            ? 'from-green-400 to-green-600' 
                            : 'from-red-400 to-red-600'
                        } ${mover.isActive ? 'animate-shimmer' : ''}`}
                        style={{ 
                          width: `${Math.min(100, mover.volatility)}%`,
                          backgroundSize: '200% 100%',
                        }}
                      />
                    </div>
                    
                    {/* Live indicator */}
                    {mover.isActive && (
                      <div className="absolute top-2 right-2">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-primary/20 backdrop-blur-sm">
                          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                          <span className="text-xs font-semibold text-primary">LIVE</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Liquidity by Category */}
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

            <div className="space-y-4">
              {liquidityFlowsWithPercentage.map((flow, i) => (
                <div key={i} className="glass p-4 rounded-xl hover:glass-strong transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{flow.category}</div>
                      <div className="text-sm text-muted-foreground">{flow.markets} markets</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold gradient-text text-xl">{flow.amount}</div>
                      <div className="text-sm text-muted-foreground">{flow.percentage}%</div>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-secondary to-accent animate-shimmer transition-all duration-500"
                      style={{ 
                        width: `${flow.percentage}%`,
                        backgroundSize: '200% 100%',
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
