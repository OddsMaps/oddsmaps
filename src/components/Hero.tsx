import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
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
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-8 animate-fade-in">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
          <span className="gradient-text">Visual Intelligence</span>
          <br />
          <span className="text-foreground">for Prediction Markets</span>
        </h1>
        
        <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
          Turn odds and transactions into intuitive visual maps — spot liquidity flows and market momentum in real time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8 px-4">
          <Button 
            size="lg" 
            className="glass-strong glow-gradient hover:scale-105 active:scale-95 transition-all duration-300 group w-full sm:w-auto px-8 py-7 text-lg font-semibold touch-manipulation min-h-[56px]"
            onClick={() => navigate('/markets')}
          >
            Explore Live Maps
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="glass border-2 hover:glass-strong hover:scale-105 active:scale-95 transition-all duration-300 group w-full sm:w-auto px-8 py-7 text-lg font-semibold touch-manipulation min-h-[56px]"
            onClick={() => {
              navigate('/markets');
              setTimeout(() => {
                document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
          >
            <TrendingUp className="mr-2 w-5 h-5" />
            View Trending Bets
          </Button>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
