import { TrendingUp, TrendingDown, Activity, Zap } from "lucide-react";

const Analytics = () => {
  const topMovers = [
    { name: "BTC $100k Target", change: "+24.5%", direction: "up", volume: "$3.2M" },
    { name: "Tesla Stock Rally", change: "+18.2%", direction: "up", volume: "$2.1M" },
    { name: "Fed Rate Decision", change: "-12.3%", direction: "down", volume: "$4.5M" },
  ];

  const liquidityFlows = [
    { from: "Crypto Markets", to: "Political Events", amount: "$1.2M", color: "from-primary to-secondary" },
    { from: "Tech Stocks", to: "Economic Data", amount: "$890K", color: "from-secondary to-accent" },
    { from: "Sports", to: "Entertainment", amount: "$650K", color: "from-accent to-primary" },
  ];

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4 animate-slide-up">
          <h2 className="text-5xl font-bold">
            <span className="gradient-text">Real-Time Analytics</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Track market movements, liquidity flows, and trader sentiment across all prediction markets.
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
                    <div className="flex-1">
                      <div className="font-semibold text-lg mb-1">{mover.name}</div>
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
                      style={{ width: `${Math.abs(parseFloat(mover.change))}%` }}
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
                <h3 className="text-2xl font-bold gradient-text">Liquidity Flow</h3>
                <p className="text-sm text-muted-foreground">Money moving between sectors</p>
              </div>
            </div>

            <div className="space-y-6">
              {liquidityFlows.map((flow, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{flow.from}</span>
                    <span className="font-bold gradient-text">{flow.amount}</span>
                    <span className="text-muted-foreground">{flow.to}</span>
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
                <h3 className="text-2xl font-bold gradient-text">Sentiment Waves</h3>
                <p className="text-sm text-muted-foreground">Trader positioning across categories</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { category: "Crypto", bullish: 72, bearish: 28 },
                { category: "Politics", bullish: 58, bearish: 42 },
                { category: "Sports", bullish: 65, bearish: 35 },
                { category: "Economy", bullish: 45, bearish: 55 },
              ].map((sentiment, i) => (
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

export default Analytics;
