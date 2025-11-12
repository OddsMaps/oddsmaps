import { useState } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

interface Market {
  id: number;
  name: string;
  size: number;
  x: number;
  y: number;
  color: string;
  volatility: number;
  volume: string;
  change: number;
}

const mockMarkets: Market[] = [
  { id: 1, name: "BTC $100k by 2025", size: 120, x: 25, y: 30, color: "from-primary to-secondary", volatility: 85, volume: "$2.3M", change: 12.5 },
  { id: 2, name: "Trump 2024 Election", size: 150, x: 55, y: 45, color: "from-secondary to-accent", volatility: 92, volume: "$5.1M", change: -3.2 },
  { id: 3, name: "ETH $5k by March", size: 90, x: 70, y: 25, color: "from-accent to-primary", volatility: 78, volume: "$1.8M", change: 8.7 },
  { id: 4, name: "Fed Rate Cut", size: 110, x: 40, y: 60, color: "from-primary to-accent", volatility: 65, volume: "$3.2M", change: 5.3 },
  { id: 5, name: "AI Chip Shortage", size: 80, x: 15, y: 70, color: "from-secondary to-primary", volatility: 55, volume: "$987K", change: -1.8 },
  { id: 6, name: "Tesla $500 EOY", size: 95, x: 80, y: 55, color: "from-accent to-secondary", volatility: 70, volume: "$1.5M", change: 15.2 },
];

const MarketMap = () => {
  const [hoveredMarket, setHoveredMarket] = useState<Market | null>(null);

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4 animate-slide-up">
          <h2 className="text-5xl font-bold">
            <span className="gradient-text">Live Market Map</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Each bubble represents a live prediction market. Size shows liquidity, color shows volatility, motion shows activity.
          </p>
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
            {mockMarkets.map((market) => (
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
                    animationDelay: `${market.id * 0.3}s`,
                  }}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Activity className="w-6 h-6 text-white animate-pulse-glow" />
                  </div>
                </div>

                {/* Connection Lines */}
                {market.id < mockMarkets.length && (
                  <svg className="absolute top-0 left-0 w-screen h-screen pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
                    <line
                      x1={0}
                      y1={0}
                      x2={mockMarkets[market.id]?.x ? (mockMarkets[market.id].x - market.x) * 10 : 0}
                      y2={mockMarkets[market.id]?.y ? (mockMarkets[market.id].y - market.y) * 10 : 0}
                      stroke="url(#gradient)"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgb(236, 72, 153)" />
                        <stop offset="100%" stopColor="rgb(59, 130, 246)" />
                      </linearGradient>
                    </defs>
                  </svg>
                )}
              </div>
            ))}
          </div>

          {/* Hover Info Panel */}
          {hoveredMarket && (
            <div className="absolute bottom-8 left-8 right-8 glass-strong p-6 rounded-2xl animate-fade-in border border-primary/30">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold gradient-text mb-3">{hoveredMarket.name}</h3>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Volume</div>
                      <div className="text-xl font-semibold">{hoveredMarket.volume}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Volatility</div>
                      <div className="text-xl font-semibold">{hoveredMarket.volatility}%</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">24h Change</div>
                      <div className={`text-xl font-semibold flex items-center ${hoveredMarket.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {hoveredMarket.change > 0 ? <TrendingUp className="w-5 h-5 mr-1" /> : <TrendingDown className="w-5 h-5 mr-1" />}
                        {Math.abs(hoveredMarket.change)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary" />
            <span>High Volatility</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gradient-to-r from-accent to-primary" />
            <span>Medium Volume</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-r from-secondary to-accent" />
            <span>Lower Activity</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MarketMap;
