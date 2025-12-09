import { memo, useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { useMarkets } from "@/hooks/useMarkets";
import { useNavigate } from "react-router-dom";

const MarketMapLive = memo(() => {
  const navigate = useNavigate();
  // Only fetch Polymarket markets for better performance
  const { data: allMarkets, isLoading } = useMarkets('polymarket');
  const [hoveredMarket, setHoveredMarket] = useState<any>(null);

  // Memoize bubble calculations with collision detection
  const bubbles = useMemo(() => {
    if (!allMarkets) return [];
    
    const markets = allMarkets.slice(0, 12).map((market, index) => {
      const size = Math.min(140, Math.max(60, Math.sqrt(market.liquidity) / 50));
      const isPositive = market.yes_price > 0.5;
      
      // Distribute on left (positive) or right (negative) side
      const sideIndex = Math.floor(index / 2);
      const baseX = isPositive 
        ? 15 + (sideIndex % 3) * 12  // Left side: 15-39%
        : 61 + (sideIndex % 3) * 12; // Right side: 61-85%
      const baseY = 20 + (index % 6) * 13;
      
      const color = isPositive
        ? index % 2 === 0 ? "from-emerald-500 to-green-600" : "from-green-500 to-emerald-600"
        : index % 2 === 0 ? "from-rose-500 to-red-600" : "from-red-500 to-rose-600";
      
      return {
        ...market,
        size,
        x: baseX + Math.random() * 3 - 1.5,
        y: baseY + Math.random() * 3 - 1.5,
        color,
        change: ((market.yes_price - 0.5) * 100).toFixed(1),
        isPositive,
      };
    });

    // Collision detection and separation
    const separateBubbles = (bubbles: any[], maxIterations = 50) => {
      for (let iter = 0; iter < maxIterations; iter++) {
        let moved = false;
        
        for (let i = 0; i < bubbles.length; i++) {
          for (let j = i + 1; j < bubbles.length; j++) {
            const a = bubbles[i];
            const b = bubbles[j];
            
            // Only separate bubbles on the same side
            if (a.isPositive !== b.isPositive) continue;
            
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minDistance = ((a.size + b.size) / 2) * 0.013; // Convert to percentage space with padding
            
            if (distance < minDistance && distance > 0) {
              const angle = Math.atan2(dy, dx);
              const targetDistance = minDistance;
              const force = (targetDistance - distance) / 2;
              
              const moveX = Math.cos(angle) * force;
              const moveY = Math.sin(angle) * force;
              
              // Weight movement by size (larger bubbles move less)
              const weightA = b.size / (a.size + b.size);
              const weightB = a.size / (a.size + b.size);
              
              a.x -= moveX * weightA;
              a.y -= moveY * weightA;
              b.x += moveX * weightB;
              b.y += moveY * weightB;
              
              // Keep within side boundaries
              if (a.isPositive) {
                a.x = Math.max(10, Math.min(40, a.x));
              } else {
                a.x = Math.max(60, Math.min(90, a.x));
              }
              if (b.isPositive) {
                b.x = Math.max(10, Math.min(40, b.x));
              } else {
                b.x = Math.max(60, Math.min(90, b.x));
              }
              
              a.y = Math.max(15, Math.min(85, a.y));
              b.y = Math.max(15, Math.min(85, b.y));
              
              moved = true;
            }
          }
        }
        
        if (!moved) break;
      }
      return bubbles;
    };

    return separateBubbles(markets);
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
    <section className="relative py-12 sm:py-24 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4 animate-fade-in">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
            <span className="gradient-text">Live Polymarket Feed</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2">
            Real-time data from Polymarket. Tap any market to see detailed wallet analytics.
          </p>
        </div>

        {/* Interactive Map Container */}
        <div className="relative glass-strong rounded-xl sm:rounded-2xl overflow-hidden border border-border/50">
          <div className="bg-gradient-to-r from-background/80 to-background/40 p-3 sm:p-4 border-b border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold text-green-400">LIVE</span>
              <span className="text-xs sm:text-sm text-muted-foreground">•</span>
              <span className="text-xs sm:text-sm text-muted-foreground">{bubbles.length} Markets</span>
            </div>
          </div>

          {/* Market Bubbles with Enhanced Background */}
          <div className="relative w-full min-h-[400px] sm:min-h-[500px] md:min-h-[600px] p-4 sm:p-6 md:p-8">
            {/* Background Zones */}
            <div className="absolute inset-0">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-background/50 to-rose-500/5" />
              <div className="absolute left-0 top-0 bottom-0 w-1/2 bg-gradient-to-r from-emerald-500/10 to-transparent" />
              <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-rose-500/10 to-transparent" />
            </div>

            {/* Center Divider */}
            <div className="absolute left-1/2 top-0 bottom-0 -translate-x-1/2 w-px">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-border to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/20 to-transparent blur-sm" />
            </div>

            {/* Side Labels */}
            <div className="absolute left-2 sm:left-4 md:left-8 top-2 sm:top-4 md:top-8 z-10">
              <div className="bg-gradient-to-r from-emerald-500/20 to-emerald-500/10 backdrop-blur-sm px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-md sm:rounded-lg border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                <span className="text-[10px] sm:text-xs md:text-sm font-bold text-emerald-400">YES</span>
              </div>
            </div>
            <div className="absolute right-2 sm:right-4 md:right-8 top-2 sm:top-4 md:top-8 z-10">
              <div className="bg-gradient-to-l from-rose-500/20 to-rose-500/10 backdrop-blur-sm px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 md:py-2 rounded-md sm:rounded-lg border border-rose-500/30 shadow-lg shadow-rose-500/10">
                <span className="text-[10px] sm:text-xs md:text-sm font-bold text-rose-400">NO</span>
              </div>
            </div>
            {bubbles.map((market) => (
              <div
                key={market.id}
                className="absolute cursor-pointer group touch-manipulation"
                style={{
                  left: `${market.x}%`,
                  top: `${market.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: hoveredMarket?.id === market.id ? 20 : 10,
                  transition: 'left 0.8s cubic-bezier(0.4, 0, 0.2, 1), top 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.3s ease-out, z-index 0s',
                }}
                onMouseEnter={() => setHoveredMarket(market)}
                onMouseLeave={() => setHoveredMarket(null)}
                onTouchStart={() => setHoveredMarket(market)}
                onClick={() => navigate(`/market/${market.market_id}`)}
              >
                <div
                  className={`rounded-full bg-gradient-to-br ${market.color} 
                    flex items-center justify-center shadow-lg
                    transition-all duration-300 ease-out
                    group-hover:scale-110 active:scale-95 group-hover:shadow-2xl
                    border-2 border-white/20 group-hover:border-white/50
                    animate-fade-in backdrop-blur-sm`}
                  style={{
                    width: `${Math.max(40, market.size * 0.7)}px`,
                    height: `${Math.max(40, market.size * 0.7)}px`,
                    boxShadow: hoveredMarket?.id === market.id 
                      ? `0 0 40px ${market.isPositive ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`
                      : `0 0 20px ${market.isPositive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)'}`,
                    opacity: hoveredMarket?.id === market.id ? 1 : 0.85,
                  }}
                >
                  <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-white drop-shadow-lg" />
                </div>
              </div>
            ))}
          </div>

          {/* Hover Info Panel - Mobile Optimized */}
          {hoveredMarket && (
            <div className="absolute bottom-2 sm:bottom-4 md:bottom-6 left-2 sm:left-4 md:left-6 right-2 sm:right-4 md:right-6 glass-strong p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl animate-fade-in border-2 border-primary/50 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 sm:mb-3 flex-wrap">
                    <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg bg-primary/20 border border-primary/30 text-[10px] sm:text-xs font-bold uppercase">
                      Polymarket
                    </span>
                    {hoveredMarket.category && (
                      <span className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-lg glass text-[10px] sm:text-xs">
                        {hoveredMarket.category}
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm sm:text-base md:text-xl font-bold mb-3 sm:mb-4 line-clamp-2">{hoveredMarket.title}</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
                    <div className="space-y-0.5 sm:space-y-1">
                      <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">24h Vol</div>
                      <div className="text-sm sm:text-base md:text-lg font-bold">${(hoveredMarket.volume_24h / 1000).toFixed(1)}K</div>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Liquidity</div>
                      <div className="text-sm sm:text-base md:text-lg font-bold">${(hoveredMarket.liquidity / 1000).toFixed(1)}K</div>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Volatility</div>
                      <div className="text-sm sm:text-base md:text-lg font-bold">{hoveredMarket.volatility.toFixed(1)}%</div>
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                      <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wide">Yes Price</div>
                      <div className={`text-sm sm:text-base md:text-lg font-bold flex items-center gap-1 ${
                        parseFloat(hoveredMarket.change) > 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {parseFloat(hoveredMarket.change) > 0 ? (
                          <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                        ) : (
                          <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
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
        <div className="mt-4 sm:mt-6 md:mt-8 grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          <div className="glass-strong rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 text-center border border-border/50">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">{bubbles.length}</div>
            <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1">Active Markets</div>
          </div>
          <div className="glass-strong rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 text-center border border-border/50">
            <div className="text-xl sm:text-2xl md:text-3xl font-bold gradient-text">
              ${((allMarkets?.reduce((sum, m) => sum + m.volume_24h, 0) || 0) / 1000000).toFixed(1)}M
            </div>
            <div className="text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-0.5 sm:mt-1">24h Volume</div>
          </div>
          <div className="glass-strong rounded-lg sm:rounded-xl p-3 sm:p-4 md:p-5 text-center border border-green-500/20">
            <div className="flex items-center justify-center gap-1 sm:gap-2">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] sm:text-xs md:text-sm font-semibold text-green-400">LIVE</span>
            </div>
            <div className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">Updates every sec</div>
          </div>
        </div>
      </div>
    </section>
  );
});

MarketMapLive.displayName = 'MarketMapLive';

export default MarketMapLive;
