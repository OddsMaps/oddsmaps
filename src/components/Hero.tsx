import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import logo from "@/assets/oddsmap-logo.png";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/30 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-40 right-32 w-80 h-80 bg-secondary/30 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/20 rounded-full blur-[140px] animate-pulse-glow" />
        
        {/* Animated Bubbles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full glass animate-morph"
            style={{
              width: `${Math.random() * 150 + 50}px`,
              height: `${Math.random() * 150 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${8 + i * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center space-y-8 animate-fade-in">
        <div className="flex justify-center mb-8">
          <img src={logo} alt="OddsMap" className="h-24 w-auto animate-float" />
        </div>
        
        <h1 className="text-6xl md:text-7xl lg:text-8xl font-bold leading-tight">
          <span className="gradient-text">Visual Intelligence</span>
          <br />
          <span className="text-foreground">for Prediction Markets</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Turn odds and transactions into intuitive visual maps — spot liquidity flows and market momentum in real time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
          <Button 
            size="lg" 
            className="glass-strong glow-gradient hover:scale-105 transition-all duration-300 group px-8 py-6 text-lg"
          >
            Explore Live Maps
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="glass border-2 hover:glass-strong hover:scale-105 transition-all duration-300 group px-8 py-6 text-lg"
          >
            <TrendingUp className="mr-2" />
            View Trending Bets
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 max-w-4xl mx-auto">
          {[
            { label: "Active Markets", value: "1,234+" },
            { label: "Total Volume", value: "$12.5M" },
            { label: "Live Traders", value: "8,432" },
          ].map((stat, i) => (
            <div 
              key={i} 
              className="glass p-6 rounded-2xl hover:glass-strong transition-all duration-300 hover:scale-105"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              <div className="text-3xl font-bold gradient-text">{stat.value}</div>
              <div className="text-sm text-muted-foreground mt-2">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
