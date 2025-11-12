import { memo, useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useMarkets } from "@/hooks/useMarkets";
import { useNavigate } from "react-router-dom";

const MarketMapLive = memo(() => {
  const navigate = useNavigate();
  // Only fetch Polymarket markets for better performance
  const { data: allMarkets, isLoading } = useMarkets('polymarket');
  const [hoveredMarket, setHoveredMarket] = useState<any>(null);

  // Memoize bubble calculations for performance
  const bubbles = useMemo(() => {
    if (!allMarkets) return [];
    
    return allMarkets.slice(0, 12).map((market, index) => {
      const size = Math.min(140, Math.max(60, Math.sqrt(market.liquidity) / 50));
      const x = (index % 4) * 25 + 12;
      const y = Math.floor(index / 4) * 33 + 15;
      
      const colors = [
        "from-blue-500 to-purple-600",
        "from-purple-500 to-pink-600",
        "from-pink-500 to-red-600",
        "from-cyan-500 to-blue-600",
      ];
      
      return {
        ...market,
        size,
        x,
        y,
        color: colors[index % colors.length],
        change: ((market.yes_price - 0.5) * 100).toFixed(1),
      };
    });
  }, [allMarkets]);

  if (isLoading) {
    return (
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-muted/50 rounded-lg w-64 mx-auto" />
            <div className="h-[600px] bg-muted/30 rounded-3xl" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 space-y-4 animate-fade-in">
          <h2 className="text-5xl font-bold">
            <span className="gradient-text">Live Polymarket Feed</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-time data from Polymarket. Click any market to see detailed wallet analytics.
          </p>
        </div>

        {/* Interactive Map Container */}
        <div className="relative glass-strong rounded-2xl overflow-hidden border border-border/50">
          <div className="bg-gradient-to-r from-background/80 to-background/40 p-4 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-green-400">LIVE</span>
              <span className="text-sm text-muted-foreground">•</span>
              <span className="text-sm text-muted-foreground">{bubbles.length} Markets</span>
            </div>
          </div>

          {/* Market Bubbles */}
          <div className="relative w-full bg-background/30 min-h-[600px] p-8">
            {bubbles.map((market) => (
              <div
                key={market.id}
                className="absolute cursor-pointer group"
                style={{
                  left: `${market.x}%`,
                  top: `${market.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseEnter={() => setHoveredMarket(market)}
                onMouseLeave={() => setHoveredMarket(null)}
                onClick={() => navigate(`/market/${market.market_id}`)}
              >
                <div
                  className={`rounded-full bg-gradient-to-br ${market.color} 
                    flex items-center justify-center shadow-lg
                    transition-all duration-300 ease-out
                    group-hover:scale-110 group-hover:shadow-2xl
                    border-2 border-white/20 group-hover:border-white/40
                    animate-fade-in backdrop-blur-sm`}
                  style={{
                    width: `${market.size}px`,
                    height: `${market.size}px`,
                    opacity: hoveredMarket?.id === market.id ? 1 : 0.85,
                  }}
                >
                  <Activity className="w-5 h-5 text-white drop-shadow-lg" />
                </div>
              </div>
            ))}
          </div>

          {/* Hover Info Panel */}
          {hoveredMarket && (
            <div className="absolute bottom-6 left-6 right-6 glass-strong p-6 rounded-xl animate-fade-in border-2 border-primary/50 backdrop-blur-xl">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-3 py-1 rounded-lg bg-primary/20 border border-primary/30 text-xs font-bold uppercase">
                      Polymarket
                    </span>
                    {hoveredMarket.category && (
                      <span className="px-3 py-1 rounded-lg glass text-xs">
                        {hoveredMarket.category}
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-bold mb-4">{hoveredMarket.title}</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">24h Volume</div>
                      <div className="text-lg font-bold">${(hoveredMarket.volume_24h / 1000).toFixed(1)}K</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Liquidity</div>
                      <div className="text-lg font-bold">${(hoveredMarket.liquidity / 1000).toFixed(1)}K</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Volatility</div>
                      <div className="text-lg font-bold">{hoveredMarket.volatility.toFixed(1)}%</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground uppercase tracking-wide">Yes Price</div>
                      <div className={`text-lg font-bold flex items-center gap-1 ${
                        parseFloat(hoveredMarket.change) > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {parseFloat(hoveredMarket.change) > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {(hoveredMarket.yes_price * 100).toFixed(1)}¢
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="glass-strong rounded-xl p-5 text-center border border-border/50">
            <div className="text-3xl font-bold gradient-text">{bubbles.length}</div>
            <div className="text-sm text-muted-foreground mt-1">Active Markets</div>
          </div>
          <div className="glass-strong rounded-xl p-5 text-center border border-border/50">
            <div className="text-3xl font-bold gradient-text">
              ${((allMarkets?.reduce((sum, m) => sum + m.volume_24h, 0) || 0) / 1000000).toFixed(1)}M
            </div>
            <div className="text-sm text-muted-foreground mt-1">24h Volume</div>
          </div>
          <div className="glass-strong rounded-xl p-5 text-center border border-green-500/20">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-semibold text-green-400">LIVE DATA</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">Updates every 5min</div>
          </div>
        </div>
      </div>
    </section>
  );
});

MarketMapLive.displayName = 'MarketMapLive';

export default MarketMapLive;
