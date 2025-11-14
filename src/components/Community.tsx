import { Twitter, MessageCircle, Github } from "lucide-react";
import { Button } from "@/components/ui/button";

const Community = () => {
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

        <div className="max-w-2xl mx-auto">
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
        </div>
      </div>
    </section>
  );
};

export default Community;
