import { Twitter, MessageCircle, Github, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const Community = () => {
  const trendingBets = [
    { event: "BTC hits $100k before 2025", odds: "72%", change: "+5%" },
    { event: "AI reaches human-level reasoning", odds: "34%", change: "+12%" },
    { event: "Trump wins GOP nomination", odds: "88%", change: "-2%" },
    { event: "Fed cuts rates in Q1 2024", odds: "45%", change: "+8%" },
  ];

  return (
    <section className="relative py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 space-y-4 animate-slide-up">
          <h2 className="text-5xl font-bold">
            <span className="gradient-text">Join the Community</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Connect with traders, share insights, and stay updated on market movements
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Social Links */}
          <div className="glass-strong rounded-3xl p-8 space-y-6">
            <h3 className="text-2xl font-bold gradient-text mb-6">Connect With Us</h3>
            
            <div className="space-y-4">
              {[
                { icon: Twitter, name: "Twitter", handle: "@OddsMap", color: "from-primary to-secondary" },
                { icon: MessageCircle, name: "Discord", handle: "Join Server", color: "from-secondary to-accent" },
                { icon: Github, name: "GitHub", handle: "View Code", color: "from-accent to-primary" },
              ].map((social, i) => (
                <Button
                  key={i}
                  className={`w-full glass hover:glass-strong group h-auto py-6 transition-all duration-300 hover:scale-105`}
                  variant="outline"
                >
                  <div className="flex items-center gap-4 w-full">
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${social.color} group-hover:scale-110 transition-transform`}>
                      <social.icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-bold text-lg">{social.name}</div>
                      <div className="text-sm text-muted-foreground">{social.handle}</div>
                    </div>
                    <div className="text-primary">→</div>
                  </div>
                </Button>
              ))}
            </div>

            {/* Newsletter */}
            <div className="mt-8 glass p-6 rounded-2xl space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-glow" />
                <span className="font-semibold">Market Pulse Newsletter</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Get weekly insights, trending bets, and liquidity flows delivered to your inbox
              </p>
              <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity">
                Subscribe Now
              </Button>
            </div>
          </div>

          {/* Trending Now */}
          <div className="glass-strong rounded-3xl p-8 space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent glow-pink">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-bold gradient-text">Trending Now</h3>
                <p className="text-sm text-muted-foreground">Most active markets this hour</p>
              </div>
            </div>

            <div className="space-y-4">
              {trendingBets.map((bet, i) => (
                <div
                  key={i}
                  className="glass p-5 rounded-xl hover:glass-strong transition-all duration-300 cursor-pointer group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="font-semibold mb-2 group-hover:gradient-text transition-all">
                        {bet.event}
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold gradient-text">{bet.odds}</span>
                        <span className={`text-sm ${bet.change.startsWith('+') ? 'text-green-400' : 'text-red-400'} font-semibold`}>
                          {bet.change}
                        </span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 w-16 h-16 rounded-full glass-strong flex items-center justify-center group-hover:scale-110 transition-transform">
                      <div className="text-xs text-center">
                        <div className="font-bold">#{ i + 1}</div>
                      </div>
                    </div>
                  </div>

                  {/* Activity Bar */}
                  <div className="mt-3 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary via-secondary to-accent animate-shimmer"
                      style={{ width: bet.odds }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t border-border">
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">12,847</div>
                <div className="text-sm text-muted-foreground">Active Traders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold gradient-text">$18.2M</div>
                <div className="text-sm text-muted-foreground">24h Volume</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Community;
