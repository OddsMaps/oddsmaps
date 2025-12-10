import { memo, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMarkets } from "@/hooks/useMarkets";
import { formatVolume } from "@/lib/utils";
import { TrendingUp, ChevronRight, Flame, BarChart3 } from "lucide-react";
import { motion } from "framer-motion";

const AnalyticsLive = memo(() => {
  const navigate = useNavigate();
  const { data: markets } = useMarkets('polymarket');

  const topMarkets = useMemo(() => {
    if (!markets) return [];
    return markets
      .sort((a, b) => b.volume_24h - a.volume_24h)
      .slice(0, 6);
  }, [markets]);

  if (!markets || markets.length === 0) {
    return null;
  }

  return (
    <section id="trending" className="py-16 md:py-24 px-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto max-w-7xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/30 mb-6"
          >
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-sm font-bold text-orange-400 uppercase tracking-wider">
              Hot Right Now
            </span>
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4"
          >
            <span className="bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent">
              Trending Markets
            </span>
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-xl mx-auto"
          >
            The most active prediction markets right now
          </motion.p>
        </div>

        {/* Markets Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {topMarkets.map((market, index) => (
            <motion.div
              key={market.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => navigate(`/market/${market.market_id}`)}
              className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_40px_rgba(34,197,94,0.15)]"
            >
              {/* Rank Badge */}
              <div className="absolute top-4 left-4 z-20">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                  index === 0 ? 'bg-gradient-to-br from-yellow-400 to-orange-500 text-black' :
                  index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-400 text-black' :
                  index === 2 ? 'bg-gradient-to-br from-orange-600 to-orange-700 text-white' :
                  'bg-muted/80 text-muted-foreground'
                }`}>
                  {index + 1}
                </div>
              </div>

              {/* Market Image */}
              <div className="relative h-32 md:h-40 overflow-hidden">
                {market.image_url ? (
                  <img 
                    src={market.image_url} 
                    alt={market.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-secondary/20 flex items-center justify-center">
                    <BarChart3 className="w-12 h-12 text-muted-foreground/30" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-4 md:p-5 -mt-8 relative z-10">
                <h3 className="font-bold text-base md:text-lg leading-tight line-clamp-2 mb-4 group-hover:text-primary transition-colors">
                  {market.title}
                </h3>

                {/* Price Display */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3 text-center">
                    <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Yes</div>
                    <div className="text-xl md:text-2xl font-black text-emerald-400 font-mono">
                      {Math.round(market.yes_price * 100)}¢
                    </div>
                  </div>
                  <div className="flex-1 bg-rose-500/10 border border-rose-500/30 rounded-xl p-3 text-center">
                    <div className="text-[10px] font-bold text-rose-400 uppercase tracking-wider mb-1">No</div>
                    <div className="text-xl md:text-2xl font-black text-rose-400 font-mono">
                      {Math.round(market.no_price * 100)}¢
                    </div>
                  </div>
                </div>

                {/* Stats Row */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-muted-foreground">Vol: </span>
                      <span className="font-bold text-foreground">{formatVolume(market.volume_24h)}</span>
                    </div>
                    <div className="hidden sm:block">
                      <span className="text-muted-foreground">Trades: </span>
                      <span className="font-bold text-foreground">{market.trades_24h.toLocaleString()}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All Button */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex justify-center mt-10"
        >
          <button
            onClick={() => navigate('/markets')}
            className="group flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-primary to-emerald-400 text-primary-foreground font-bold text-lg shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_50px_rgba(34,197,94,0.5)] transition-all duration-300 hover:scale-105"
          >
            <TrendingUp className="w-5 h-5" />
            View All Markets
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </section>
  );
});

AnalyticsLive.displayName = 'AnalyticsLive';

export default AnalyticsLive;
