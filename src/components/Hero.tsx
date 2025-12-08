import { Button } from "@/components/ui/button";
import { ArrowRight, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const Hero = () => {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
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
        
        {/* Branded floating bubbles with parallax and glow effects */}
        <div 
          className="absolute top-[15%] left-[8%] w-32 h-32 rounded-full bg-gradient-to-br from-primary/25 via-primary/10 to-transparent backdrop-blur-sm border border-primary/20 animate-float animate-bubble-glow shadow-[0_0_40px_rgba(34,197,94,0.25),inset_0_-10px_30px_rgba(0,0,0,0.1),inset_0_10px_20px_rgba(255,255,255,0.1)]" 
          style={{ animationDuration: '8s', transform: `translateY(${scrollY * 0.15}px)` }} 
        />
        <div 
          className="absolute top-[25%] right-[12%] w-24 h-24 rounded-full bg-gradient-to-br from-secondary/20 via-secondary/8 to-transparent backdrop-blur-sm border border-secondary/15 animate-float animate-bubble-glow shadow-[0_0_35px_rgba(239,68,68,0.2),inset_0_-8px_25px_rgba(0,0,0,0.1),inset_0_8px_15px_rgba(255,255,255,0.08)]" 
          style={{ animationDelay: '1s', animationDuration: '10s', transform: `translateY(${scrollY * -0.1}px)` }} 
        />
        <div 
          className="absolute bottom-[30%] left-[15%] w-20 h-20 rounded-full bg-gradient-to-br from-accent/20 via-accent/8 to-transparent backdrop-blur-sm border border-accent/15 animate-float animate-bubble-glow shadow-[0_0_30px_rgba(168,85,247,0.2),inset_0_-6px_20px_rgba(0,0,0,0.1),inset_0_6px_12px_rgba(255,255,255,0.08)]" 
          style={{ animationDelay: '2s', animationDuration: '9s', transform: `translateY(${scrollY * 0.2}px)` }} 
        />
        <div 
          className="absolute top-[45%] right-[25%] w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 via-primary/5 to-transparent backdrop-blur-sm border border-primary/12 animate-float animate-bubble-glow shadow-[0_0_25px_rgba(34,197,94,0.18),inset_0_-5px_15px_rgba(0,0,0,0.08),inset_0_5px_10px_rgba(255,255,255,0.06)]" 
          style={{ animationDelay: '0.5s', animationDuration: '11s', transform: `translateY(${scrollY * -0.08}px)` }} 
        />
        <div 
          className="absolute bottom-[20%] right-[8%] w-28 h-28 rounded-full bg-gradient-to-br from-secondary/18 via-secondary/6 to-transparent backdrop-blur-sm border border-secondary/12 animate-float animate-bubble-glow shadow-[0_0_45px_rgba(239,68,68,0.22),inset_0_-10px_30px_rgba(0,0,0,0.12),inset_0_10px_20px_rgba(255,255,255,0.1)]" 
          style={{ animationDelay: '3s', animationDuration: '12s', transform: `translateY(${scrollY * 0.12}px)` }} 
        />
        <div 
          className="absolute top-[60%] left-[5%] w-14 h-14 rounded-full bg-gradient-to-br from-primary/22 via-primary/8 to-transparent backdrop-blur-sm border border-primary/15 animate-float animate-bubble-glow shadow-[0_0_20px_rgba(34,197,94,0.2),inset_0_-4px_12px_rgba(0,0,0,0.08),inset_0_4px_8px_rgba(255,255,255,0.06)]" 
          style={{ animationDelay: '1.5s', animationDuration: '7s', transform: `translateY(${scrollY * -0.18}px)` }} 
        />
        <div 
          className="absolute top-[10%] left-[40%] w-12 h-12 rounded-full bg-gradient-to-br from-accent/18 via-accent/5 to-transparent backdrop-blur-sm border border-accent/10 animate-float animate-bubble-glow shadow-[0_0_18px_rgba(168,85,247,0.18),inset_0_-3px_10px_rgba(0,0,0,0.06),inset_0_3px_6px_rgba(255,255,255,0.05)]" 
          style={{ animationDelay: '2.5s', animationDuration: '13s', transform: `translateY(${scrollY * 0.25}px)` }} 
        />
        <div 
          className="absolute bottom-[40%] right-[18%] w-[72px] h-[72px] rounded-full bg-gradient-to-br from-secondary/15 via-secondary/4 to-transparent backdrop-blur-sm border border-secondary/10 animate-float animate-bubble-glow shadow-[0_0_22px_rgba(239,68,68,0.15),inset_0_-5px_15px_rgba(0,0,0,0.08),inset_0_5px_10px_rgba(255,255,255,0.06)]" 
          style={{ animationDelay: '4s', animationDuration: '10s', transform: `translateY(${scrollY * -0.05}px)` }} 
        />
        <div 
          className="absolute top-[35%] left-[30%] w-10 h-10 rounded-full bg-gradient-to-br from-primary/18 via-primary/5 to-transparent backdrop-blur-sm border border-primary/10 animate-float animate-bubble-glow shadow-[0_0_15px_rgba(34,197,94,0.15),inset_0_-2px_8px_rgba(0,0,0,0.06),inset_0_2px_5px_rgba(255,255,255,0.04)]" 
          style={{ animationDelay: '0.8s', animationDuration: '9s', transform: `translateY(${scrollY * 0.22}px)` }} 
        />
        <div 
          className="absolute bottom-[15%] left-[35%] w-[88px] h-[88px] rounded-full bg-gradient-to-br from-accent/15 via-accent/5 to-transparent backdrop-blur-sm border border-accent/10 animate-float animate-bubble-glow shadow-[0_0_28px_rgba(168,85,247,0.18),inset_0_-6px_18px_rgba(0,0,0,0.1),inset_0_6px_12px_rgba(255,255,255,0.08)]" 
          style={{ animationDelay: '3.5s', animationDuration: '11s', transform: `translateY(${scrollY * -0.15}px)` }} 
        />
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
            className="relative bg-gradient-to-br from-primary via-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:via-primary/90 hover:to-primary/70 transition-all duration-300 group w-full sm:w-[220px] h-[60px] px-6 text-lg font-semibold rounded-xl shadow-[0_8px_0_rgb(0,0,0,0.1),0_15px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_0_rgb(0,0,0,0.1),0_12px_25px_rgba(0,0,0,0.2)] hover:translate-y-[2px] active:translate-y-[6px] active:shadow-[0_2px_0_rgb(0,0,0,0.1),0_5px_15px_rgba(0,0,0,0.2)] border-b-4 border-primary/50 before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-t before:from-black/20 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity"
            onClick={() => navigate('/markets')}
          >
            <span className="relative z-10">Explore Markets</span>
            <ArrowRight className="relative z-10 ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="relative glass-strong border-2 border-white/20 hover:glass-premium hover:border-primary/50 transition-all duration-300 group w-full sm:w-[220px] h-[60px] px-6 text-lg font-semibold rounded-xl shadow-[0_8px_0_rgba(255,255,255,0.05),0_15px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_0_rgba(255,255,255,0.05),0_12px_25px_rgba(0,0,0,0.2)] hover:translate-y-[2px] active:translate-y-[6px] active:shadow-[0_2px_0_rgba(255,255,255,0.05),0_5px_15px_rgba(0,0,0,0.2)] backdrop-blur-2xl"
            onClick={() => {
              document.getElementById('whale-activity')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
          >
            <Activity className="relative z-10 mr-2 w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="relative z-10">Whale Watcher</span>
          </Button>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
