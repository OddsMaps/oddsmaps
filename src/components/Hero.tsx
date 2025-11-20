import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 px-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-primary/30 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-40 right-32 w-80 h-80 bg-secondary/30 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-accent/20 rounded-full blur-[140px] animate-pulse-glow" />
        
        {/* Animated Bubbles */}
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full glass animate-morph hidden md:block"
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
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-10 animate-fade-in">
        <div className="inline-block glass-premium px-6 py-3 rounded-full mb-4 animate-pulse-glow">
          <span className="text-sm font-semibold gradient-text-premium uppercase tracking-wider">
            🚀 Real-time Market Intelligence
          </span>
        </div>
        
        <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-display font-black leading-[0.95] tracking-tight">
          <span className="gradient-text-premium block mb-2">Visual Intelligence</span>
          <span className="text-foreground/90 block">for Prediction Markets</span>
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl text-foreground/70 max-w-3xl mx-auto leading-relaxed px-2 font-medium">
          Transform complex market data into <span className="text-primary font-bold">actionable insights</span>. 
          Track liquidity flows, analyze whale movements, and spot opportunities before they happen.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 px-4">
          <Button 
            size="lg" 
            className="glow-gradient hover:scale-105 active:scale-95 transition-all duration-500 group w-full sm:w-auto px-10 py-8 text-lg font-bold touch-manipulation min-h-[64px] rounded-2xl shadow-2xl"
            onClick={() => navigate('/markets')}
          >
            Explore Live Maps
            <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform duration-300" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="glass-strong border-2 border-white/20 hover:glass-premium hover:scale-105 hover:border-primary/50 active:scale-95 transition-all duration-500 group w-full sm:w-auto px-10 py-8 text-lg font-bold touch-manipulation min-h-[64px] rounded-2xl"
            onClick={() => {
              navigate('/markets');
              setTimeout(() => {
                document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
          >
            <TrendingUp className="mr-3 w-6 h-6 group-hover:scale-110 transition-transform duration-300" />
            View Trending Bets
          </Button>
        </div>
        
        <div className="flex items-center justify-center gap-8 pt-12 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="font-mono">Live Data</span>
          </div>
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="font-mono">Real-time Updates</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="font-mono">Smart Analytics</span>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
