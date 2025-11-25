import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  
  return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 px-4">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Primary gradient orbs */}
        <div className="absolute top-20 left-10 sm:left-20 w-96 h-96 bg-primary/40 rounded-full blur-[150px] animate-float" />
        <div className="absolute bottom-20 right-10 sm:right-32 w-[500px] h-[500px] bg-accent/40 rounded-full blur-[150px] animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-secondary/30 rounded-full blur-[140px] animate-pulse-glow" style={{ animationDelay: '1s' }} />
        
        {/* Grid overlay for depth */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />
        
        {/* Animated particles */}
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full glass-premium animate-morph hidden lg:block"
            style={{
              width: `${Math.random() * 120 + 40}px`,
              height: `${Math.random() * 120 + 40}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${10 + i * 1.5}s`,
              opacity: 0.4,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-8 sm:space-y-12 animate-fade-in">
        <div className="space-y-6 sm:space-y-8">
          <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tighter">
            <span className="gradient-text-premium block mb-3 sm:mb-4">Visual Intelligence</span>
            <span className="text-foreground/90 block text-4xl sm:text-5xl md:text-6xl lg:text-7xl">for Prediction Markets</span>
          </h1>
          
          <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-foreground/60 max-w-4xl mx-auto leading-relaxed px-2 font-light">
            Turn odds and transactions into intuitive visual maps — spot <span className="gradient-text-premium font-bold">liquidity flows</span> and market momentum in real time
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-8 px-4">
          <Button 
            size="lg" 
            className="relative bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:via-primary/90 hover:to-primary/70 transition-all duration-300 group w-full sm:w-auto px-8 py-6 text-lg font-semibold rounded-xl shadow-[0_8px_0_rgb(0,0,0,0.1),0_15px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_0_rgb(0,0,0,0.1),0_12px_25px_rgba(0,0,0,0.2)] hover:translate-y-[2px] active:translate-y-[6px] active:shadow-[0_2px_0_rgb(0,0,0,0.1),0_5px_15px_rgba(0,0,0,0.2)] border-b-4 border-primary/50 before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-t before:from-black/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity"
            onClick={() => navigate('/markets')}
          >
            <span className="relative z-10">Explore Markets</span>
            <ArrowRight className="relative z-10 ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="glass-strong border-2 border-white/20 hover:glass-premium hover:scale-105 hover:border-primary/50 active:scale-95 transition-all duration-500 group w-full sm:w-auto px-12 py-8 text-xl font-black touch-manipulation min-h-[72px] rounded-2xl backdrop-blur-2xl"
            onClick={() => {
              navigate('/markets');
              setTimeout(() => {
                document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
          >
            <TrendingUp className="mr-3 w-7 h-7 group-hover:scale-110 transition-transform duration-300" />
            Trending Now
          </Button>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
