import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import logo from "@/assets/oddsmap-logo-new.png";

const Hero = () => {
  const navigate = useNavigate();
  
  // Fetch active markets count (created or updated today)
  const { data: activeMarketsCount } = useQuery({
    queryKey: ['active-markets-count'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { count, error } = await supabase
        .from('markets')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active')
        .gte('updated_at', today.toISOString());
      
      if (error) throw error;
      return count || 0;
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });
  
  // Fetch total volume for today
  const { data: totalVolume } = useQuery({
    queryKey: ['total-volume'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('amount')
        .gte('timestamp', today.toISOString());
      
      if (error) throw error;
      
      const sum = data?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
      return sum;
    },
    refetchInterval: 30000,
  });
  
  // Fetch live traders count (unique wallets that traded today)
  const { data: liveTraders } = useQuery({
    queryKey: ['live-traders'],
    queryFn: async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('wallet_address')
        .gte('timestamp', today.toISOString());
      
      if (error) throw error;
      
      // Count unique wallet addresses
      const uniqueWallets = new Set(data?.map(t => t.wallet_address) || []);
      return uniqueWallets.size;
    },
    refetchInterval: 30000,
  });
  
  // Format numbers for display
  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `$${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num.toString();
  };
  
  const formatVolume = (vol: number) => {
    if (vol >= 1000000) {
      return `$${(vol / 1000000).toFixed(1)}M`;
    } else if (vol >= 1000) {
      return `$${(vol / 1000).toFixed(1)}K`;
    }
    return `$${vol.toFixed(0)}`;
  };
  
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
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
      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-6 animate-fade-in">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
          <span className="gradient-text">Visual Intelligence</span>
          <br />
          <span className="text-foreground">for Prediction Markets</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Turn odds and transactions into intuitive visual maps — spot liquidity flows and market momentum in real time.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
          <Button 
            size="lg" 
            className="glass-strong glow-gradient hover:scale-105 transition-all duration-300 group px-6 py-4 text-base"
            onClick={() => navigate('/markets')}
          >
            Explore Live Maps
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="glass border-2 hover:glass-strong hover:scale-105 transition-all duration-300 group px-6 py-4 text-base"
            onClick={() => {
              navigate('/markets');
              setTimeout(() => {
                document.getElementById('trending')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }, 100);
            }}
          >
            <TrendingUp className="mr-2" />
            View Trending Bets
          </Button>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-12 max-w-3xl mx-auto">
          <div 
            className="glass p-4 rounded-2xl hover:glass-strong transition-all duration-300 hover:scale-105"
            style={{ animationDelay: '0s' }}
          >
            <div className="text-2xl font-bold gradient-text">
              {activeMarketsCount !== undefined ? formatNumber(activeMarketsCount) : '...'}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Active Markets</div>
          </div>
          
          <div 
            className="glass p-4 rounded-2xl hover:glass-strong transition-all duration-300 hover:scale-105"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="text-2xl font-bold gradient-text">
              {totalVolume !== undefined ? formatVolume(totalVolume) : '...'}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Total Volume</div>
          </div>
          
          <div 
            className="glass p-4 rounded-2xl hover:glass-strong transition-all duration-300 hover:scale-105"
            style={{ animationDelay: '0.4s' }}
          >
            <div className="text-2xl font-bold gradient-text">
              {liveTraders !== undefined ? formatNumber(liveTraders) : '...'}
            </div>
            <div className="text-sm text-muted-foreground mt-1">Live Traders</div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default Hero;
