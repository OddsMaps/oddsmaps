import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, Activity, RefreshCw } from "lucide-react";
import { useMarkets, useFetchMarkets } from "@/hooks/useMarkets";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const MarketMapLive = () => {
  const { data: markets, isLoading, refetch } = useMarkets();
  const { fetchMarkets } = useFetchMarkets();
  const [hoveredMarket, setHoveredMarket] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(false);

  const handleFetchMarkets = async () => {
    setIsFetching(true);
    try {
      await fetchMarkets();
      toast.success("Market data updated successfully!");
      refetch();
    } catch (error) {
      toast.error("Failed to fetch market data");
      console.error(error);
    } finally {
      setIsFetching(false);
    }
  };

  // Auto-fetch on mount if no markets exist
  useEffect(() => {
    if (!isLoading && markets?.length === 0) {
      handleFetchMarkets();
    }
  }, [isLoading, markets?.length]);

  // Convert markets to bubble format
  const bubbles = markets?.slice(0, 10).map((market, index) => {
    const size = Math.min(150, Math.max(50, market.liquidity / 10000));
    const x = (index % 4) * 25 + 15;
    const y = Math.floor(index / 4) * 30 + 20;
    
    const colors = [
      "from-primary to-secondary",
      "from-secondary to-accent",
      "from-accent to-primary",
    ];
    
    return {
      ...market,
      size,
      x,
      y,
      color: colors[index % colors.length],
      change: ((market.yes_price - 0.5) * 100).toFixed(1),
    };
  }) || [];

  if (isLoading) {
    return (
      <section className="relative py-24 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-pulse">
            <div className="h-12 bg-muted rounded-lg w-64 mx-auto mb-8" />
            <div className="h-96 bg-muted rounded-3xl" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4 animate-slide-up">
          <h2 className="text-5xl font-bold">
            <span className="gradient-text">Live Market Map</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Real-time data from Kalshi and Polymarket. Each bubble represents a live prediction market.
          </p>
          <Button
            onClick={handleFetchMarkets}
            disabled={isFetching}
            className="glass-strong glow-gradient hover:scale-105 transition-all"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
            {isFetching ? 'Updating...' : 'Refresh Data'}
          </Button>
        </div>

        {/* Interactive Map Container */}
        <div className="relative glass-strong rounded-3xl p-8 min-h-[600px] overflow-hidden">
          {/* Grid Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'linear-gradient(rgba(236, 72, 153, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(236, 72, 153, 0.3) 1px, transparent 1px)',
              backgroundSize: '50px 50px'
            }} />
          </div>

          {/* Market Bubbles */}
          <div className="relative w-full h-full min-h-[550px]">
            {bubbles.map((market) => (
              <div
                key={market.id}
                className="absolute cursor-pointer transition-all duration-500 group"
                style={{
                  left: `${market.x}%`,
                  top: `${market.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseEnter={() => setHoveredMarket(market)}
                onMouseLeave={() => setHoveredMarket(null)}
              >
                <div
                  className={`rounded-full glass animate-float bg-gradient-to-br ${market.color} opacity-60 group-hover:opacity-90 group-hover:scale-110 transition-all duration-300`}
                  style={{
                    width: `${market.size}px`,
                    height: `${market.size}px`,
                    animationDuration: `${5 + market.volatility / 20}s`,
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white animate-pulse-glow" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Hover Info Panel */}
          {hoveredMarket && (
            <div className="absolute bottom-8 left-8 right-8 glass-strong p-6 rounded-2xl animate-fade-in border border-primary/30">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 glass rounded text-xs font-semibold uppercase">
                      {hoveredMarket.source}
                    </span>
                    {hoveredMarket.category && (
                      <span className="px-2 py-1 glass rounded text-xs">
                        {hoveredMarket.category}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold gradient-text mb-3">{hoveredMarket.title}</h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Volume (24h)</div>
                      <div className="text-xl font-semibold">${(hoveredMarket.volume_24h / 1000).toFixed(1)}K</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Volatility</div>
                      <div className="text-xl font-semibold">{hoveredMarket.volatility.toFixed(1)}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Yes Price</div>
                      <div className={`text-xl font-semibold flex items-center ${parseFloat(hoveredMarket.change) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {parseFloat(hoveredMarket.change) > 0 ? <TrendingUp className="w-5 h-5 mr-1" /> : <TrendingDown className="w-5 h-5 mr-1" />}
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
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass p-4 rounded-xl text-center">
            <div className="text-2xl font-bold gradient-text">{markets?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Total Markets</div>
          </div>
          <div className="glass p-4 rounded-xl text-center">
            <div className="text-2xl font-bold gradient-text">
              {markets?.filter(m => m.source === 'kalshi').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Kalshi</div>
          </div>
          <div className="glass p-4 rounded-xl text-center">
            <div className="text-2xl font-bold gradient-text">
              {markets?.filter(m => m.source === 'polymarket').length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Polymarket</div>
          </div>
          <div className="glass p-4 rounded-xl text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-glow" />
              <span className="text-sm text-muted-foreground">Live</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketMapLive;
