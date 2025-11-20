import { memo, useMemo } from "react";
import { TrendingUp, Activity, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useMarkets } from "@/hooks/useMarkets";
import { usePriceChanges } from "@/hooks/usePriceChanges";

const AnalyticsLive = memo(() => {
  const navigate = useNavigate();
  
  // Only fetch Polymarket markets for better performance
  const { data: markets } = useMarkets('polymarket');
  const { priceChanges, activeMarkets } = usePriceChanges(markets);

  // Calculate trending markets (most active by 24h volume - matches Polymarket trending)
  const trendingMarkets = useMemo(() => {
    if (!markets) return [];
    
    return markets
      .map(market => {
        const priceChange = priceChanges.get(market.id);
        const isActive = activeMarkets.has(market.id);
        
        return {
          id: market.market_id, // Use market_id for navigation
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
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 4);
  }, [markets, priceChanges, activeMarkets]);


  if (!markets || markets.length === 0) {
    return null;
  }

  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 space-y-3 animate-fade-in px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold gradient-text">
            Trending Markets
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Most active markets by 24h volume
          </p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs sm:text-sm text-muted-foreground">
              {markets.length} markets • Updates every 30min
            </span>
          </div>
        </div>

        {/* Trending Markets Grid */}
        <div className="max-w-5xl mx-auto px-4 sm:px-0">
          <div className="glass-strong rounded-2xl p-3 sm:p-6 border border-border/50">
            <div className="space-y-3">
              {trendingMarkets.map((market, i) => (
                <div
                  key={market.id}
                  onClick={() => navigate(`/market/${market.id}`)}
                  className={`group relative p-4 sm:p-6 rounded-xl bg-background/50 hover:bg-background/80 border border-border/50 hover:border-primary/30 transition-all duration-300 cursor-pointer touch-manipulation active:scale-[0.98] ${
                    market.isActive ? 'border-primary/30 bg-primary/5' : ''
                  }`}
                >
                  {/* Rank Badge */}
                  <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-xs sm:text-sm font-bold text-muted-foreground">#{i + 1}</span>
                    </div>
                  </div>

                  {/* Live Badge */}
                  {market.isActive && (
                    <div className="absolute top-3 sm:top-4 right-3 sm:right-4">
                      <div className="flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg bg-primary/20 border border-primary/30">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] sm:text-xs font-semibold text-primary">LIVE</span>
                      </div>
                    </div>
                  )}

                  <div className="ml-12">
                    {/* Market Title */}
                    <h3 className="font-semibold text-base sm:text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors break-words">
                      {market.event}
                    </h3>

                    {/* Stats Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl sm:text-3xl font-bold gradient-text">{market.odds}</span>
                        <span className={`text-xs sm:text-sm font-semibold px-2 py-1 rounded ${
                          market.isIncreasing ? 'text-green-400 bg-green-400/10' : 'text-red-400 bg-red-400/10'
                        }`}>
                          {market.change}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                        <span className="whitespace-nowrap">{market.trades.toLocaleString()} trades</span>
                        <span className="text-muted-foreground/50">•</span>
                        <span className="whitespace-nowrap">${(market.volume / 1000).toFixed(1)}K vol</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-1 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-500"
                        style={{ width: market.odds }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 gap-4 sm:gap-6 mt-6 sm:mt-8 pt-6 border-t border-border/50">
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">
                  {markets.length}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">Active Markets</div>
              </div>
              <div className="text-center">
                <div className="text-2xl sm:text-3xl font-bold gradient-text mb-1">
                  ${((markets.reduce((sum, m) => sum + m.volume_24h, 0)) / 1000000).toFixed(1)}M
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground">24h Volume</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
});

AnalyticsLive.displayName = 'AnalyticsLive';

export default AnalyticsLive;
