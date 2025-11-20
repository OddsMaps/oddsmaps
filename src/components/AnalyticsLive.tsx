import { memo, useMemo } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useMarkets } from "@/hooks/useMarkets";
import { usePriceChanges } from "@/hooks/usePriceChanges";

const AnalyticsLive = memo(() => {
  const navigate = useNavigate();
  
  // Only fetch Polymarket markets for better performance
  const { data: markets } = useMarkets('polymarket');
  const { priceChanges, activeMarkets } = usePriceChanges(markets);

  // Calculate top markets (by volume)
  const topMarkets = useMemo(() => {
    if (!markets) return [];
    
    return markets
      .sort((a, b) => b.volume_24h - a.volume_24h)
      .slice(0, 6);
  }, [markets]);


  if (!markets || markets.length === 0) {
    return null;
  }

  return (
    <section id="trending" className="py-12 sm:py-16 md:py-24 px-4 relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        <div className="text-center mb-10 sm:mb-14 space-y-4 sm:space-y-6">
          <div className="inline-block glass-premium px-5 py-2 rounded-full">
            <span className="text-xs sm:text-sm font-bold gradient-text-premium uppercase tracking-wider">
              📊 Market Intelligence
            </span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
            <span className="gradient-text-premium">Trending Markets</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-foreground/70 max-w-2xl mx-auto px-2 font-medium">
            Discover the most active prediction markets with <span className="text-primary font-bold">real-time</span> volume tracking
          </p>
        </div>

        <div className="grid gap-5 sm:gap-6">
          {topMarkets.map((market, index) => {
            const isActive = activeMarkets.has(market.id);
            const priceChange = priceChanges.get(market.id);
            const changePercent = priceChange?.changePercent || 0;
            const isIncreasing = priceChange?.isIncreasing ?? false;
            
            return (
              <div
                key={market.id}
                onClick={() => navigate(`/market/${market.id}`)}
                className={`data-card cursor-pointer transition-all duration-500 touch-manipulation active:scale-[0.98] ${
                  isActive 
                    ? 'border-primary shadow-[0_0_40px_rgba(16,185,129,0.4)] scale-[1.02]' 
                    : 'hover:scale-[1.02]'
                }`}
                style={{
                  animation: isActive ? 'pulse-glow 2s ease-in-out' : undefined,
                }}
              >
                <div className="flex items-start justify-between gap-4 sm:gap-6 mb-4 sm:mb-5">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge 
                        variant="outline" 
                        className="bg-gradient-to-r from-primary/20 to-accent/20 border-primary/40 text-primary text-xs sm:text-sm px-3 py-1 font-black uppercase tracking-wider shrink-0"
                      >
                        #{index + 1}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className="glass-strong text-xs sm:text-sm px-3 py-1 font-semibold shrink-0"
                      >
                        {market.source}
                      </Badge>
                    </div>
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-2 break-words line-clamp-2 leading-tight">
                      {market.title}
                    </h3>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="metric-highlight">
                      {(market.yes_price * 100).toFixed(1)}¢
                    </div>
                    {Math.abs(changePercent) > 0 && (
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-xs sm:text-sm ${
                        isIncreasing 
                          ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                          : "bg-red-500/20 text-red-400 border border-red-500/30"
                      }`}>
                        {isIncreasing ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span className="whitespace-nowrap font-mono">{Math.abs(changePercent).toFixed(2)}%</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5 pt-4 sm:pt-5 border-t border-border/30">
                  <div className="space-y-2">
                    <div className="text-xs sm:text-sm text-muted-foreground font-medium whitespace-nowrap">Volume 24h</div>
                    <div className="text-lg sm:text-xl md:text-2xl font-black gradient-text-premium whitespace-nowrap font-mono">
                      ${(market.volume_24h / 1000).toFixed(1)}K
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs sm:text-sm text-muted-foreground font-medium whitespace-nowrap">Trades 24h</div>
                    <div className="text-lg sm:text-xl md:text-2xl font-black gradient-text-premium whitespace-nowrap font-mono">
                      {market.trades_24h.toLocaleString()}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs sm:text-sm text-muted-foreground font-medium">Liquidity</div>
                    <div className="text-lg sm:text-xl md:text-2xl font-black gradient-text-premium font-mono">
                      ${(market.liquidity / 1000).toFixed(1)}K
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs sm:text-sm text-muted-foreground font-medium">Volatility</div>
                    <div className="text-lg sm:text-xl md:text-2xl font-black gradient-text-premium font-mono">
                      {market.volatility.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
});

AnalyticsLive.displayName = 'AnalyticsLive';

export default AnalyticsLive;
