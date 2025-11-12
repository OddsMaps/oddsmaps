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

  // Calculate trending markets (most active this hour)
  const trendingMarkets = useMemo(() => {
    if (!markets) return [];
    
    return markets
      .map(market => {
        const priceChange = priceChanges.get(market.id);
        const isActive = activeMarkets.has(market.id);
        
        return {
          id: market.id,
          event: market.title,
          odds: `${(market.yes_price * 100).toFixed(0)}%`,
          change: priceChange 
            ? `${priceChange.changePercent > 0 ? '+' : ''}${priceChange.changePercent.toFixed(1)}%`
            : `${((market.yes_price - 0.5) * 100).toFixed(1)}%`,
          isIncreasing: priceChange ? priceChange.isIncreasing : market.yes_price > 0.5,
          volatility: market.volatility,
          volume: market.volume_24h,
          trades: market.trades_24h,
          isActive,
        };
      })
      .sort((a, b) => b.trades - a.trades) // Sort by most trades (activity)
      .slice(0, 4);
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
          {/* Trending Now */}
          <div className="glass-strong rounded-3xl p-8 space-y-6 hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent glow-pink">
                <Zap className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold gradient-text">Trending Now</h3>
                <p className="text-sm text-muted-foreground">Most active markets this hour</p>
              </div>
            </div>

            <div className="space-y-4">
              {trendingMarkets.map((market, i) => (
                <div
                  key={market.id}
                  className={`glass p-5 rounded-xl hover:glass-strong transition-all duration-300 cursor-pointer group relative overflow-hidden ${
                    market.isActive ? 'animate-glow-pulse' : ''
                  }`}
                >
                  {/* Active indicator pulse */}
                  {market.isActive && (
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 animate-pulse pointer-events-none" />
                  )}
                  
                  <div className="relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-semibold mb-2 group-hover:gradient-text transition-all line-clamp-2">
                          {market.event}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold gradient-text">{market.odds}</span>
                          <span className={`text-sm font-semibold ${
                            market.isIncreasing ? 'text-green-400' : 'text-red-400'
                          } ${market.isActive ? 'animate-pulse' : ''}`}>
                            {market.change}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {market.trades} trades • ${(market.volume / 1000).toFixed(1)}K volume
                        </div>
                      </div>
                      <div className={`flex-shrink-0 w-16 h-16 rounded-full glass-strong flex items-center justify-center transition-transform ${
                        market.isActive ? 'scale-110' : 'group-hover:scale-110'
                      }`}>
                        <div className="text-xs text-center">
                          <div className="font-bold">#{ i + 1}</div>
                        </div>
                      </div>
                    </div>

                    {/* Activity Bar */}
                    <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div 
                        className={`h-full bg-gradient-to-r from-primary via-secondary to-accent ${
                          market.isActive ? 'animate-shimmer' : ''
                        }`}
                        style={{ 
                          width: market.odds,
                          backgroundSize: '200% 100%',
                        }}
                      />
                    </div>

                    {/* Live indicator */}
                    {market.isActive && (
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

            {/* Live Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">
                  {markets?.length || 0}
                </div>
                <div className="text-sm text-muted-foreground">Active Markets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">
                  ${((markets?.reduce((sum, m) => sum + m.volume_24h, 0) || 0) / 1000000).toFixed(1)}M
                </div>
                <div className="text-sm text-muted-foreground">24h Volume</div>
              </div>
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
