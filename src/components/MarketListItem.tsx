import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, TrendingUp, Star, Trash2 } from "lucide-react";
import MiniSparkline from "@/components/MiniSparkline";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { formatVolume } from "@/lib/utils";
import type { Market } from "@/lib/polymarket-api";

interface MarketListItemProps {
  market: Market;
  index: number;
  onSwipeEnd: (marketId: string, info: PanInfo) => void;
  onChartClick: (market: Market) => void;
  getCategoryColor: (category: string) => string;
  normalizeCategory: (category: string | undefined, title?: string) => string;
}

const MarketListItem = ({
  market,
  index,
  onSwipeEnd,
  onChartClick,
  getCategoryColor,
  normalizeCategory,
}: MarketListItemProps) => {
  const navigate = useNavigate();
  const yesPrice = ((market.yes_price || 0) * 100).toFixed(0);
  
  // These hooks are now at the top level of this component, not in a loop
  const x = useMotionValue(0);
  const leftOpacity = useTransform(x, [0, 60], [0, 1]);
  const rightOpacity = useTransform(x, [-60, 0], [1, 0]);

  return (
    <div className="relative overflow-hidden">
      {/* Swipe action indicators - only visible during swipe */}
      <motion.div 
        style={{ opacity: leftOpacity }}
        className="md:hidden absolute inset-y-0 left-0 w-16 flex items-center justify-center bg-primary/20 pointer-events-none"
      >
        <Star className="w-5 h-5 text-primary" />
      </motion.div>
      <motion.div 
        style={{ opacity: rightOpacity }}
        className="md:hidden absolute inset-y-0 right-0 w-16 flex items-center justify-center bg-destructive/20 pointer-events-none"
      >
        <Trash2 className="w-5 h-5 text-destructive" />
      </motion.div>
      
      <motion.div
        style={{ x }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragEnd={(_, info) => onSwipeEnd(market.id, info)}
        className="flex items-start md:items-center gap-3 py-3.5 px-1 md:px-2 active:bg-muted/40 md:hover:bg-muted/30 rounded-lg transition-colors cursor-pointer group border-b border-border/30 last:border-0 bg-background relative z-10 md:!transform-none"
        onClick={() => navigate(`/market/${market.market_id}`)}
      >
        {/* Rank Number - Hidden on mobile */}
        <span className="hidden md:block text-muted-foreground text-sm w-6 shrink-0">{index + 1}</span>
        
        {/* Market Image */}
        <div className="w-11 h-11 md:w-12 md:h-12 rounded-full overflow-hidden bg-muted shrink-0 mt-0.5 md:mt-0">
          {market.image_url ? (
            <img 
              src={market.image_url} 
              alt={market.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground">
                {market.title.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        {/* Market Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-foreground text-sm md:text-base line-clamp-2 md:line-clamp-1 group-hover:text-primary transition-colors leading-snug">
            {market.title}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className={`shrink-0 text-[10px] md:text-xs px-1.5 md:px-2 py-0 md:py-0.5 border ${getCategoryColor(normalizeCategory(market.category, market.title))}`}>
              {normalizeCategory(market.category, market.title)}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {formatVolume(market.volume_24h || 0)} vol
            </span>
          </div>
        </div>
        
        {/* Price & Arrow */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="text-right">
            <span className="text-lg md:text-xl font-bold text-foreground">{yesPrice}%</span>
            <div className="text-xs text-primary flex items-center justify-end gap-0.5">
              <TrendingUp className="w-3 h-3" />
              <span>Yes</span>
            </div>
          </div>
          
          {/* Price Sparkline - Desktop only */}
          <div 
            className="hidden md:flex items-center w-20 cursor-pointer group/chart relative"
            onClick={(e) => {
              e.stopPropagation();
              onChartClick(market);
            }}
            title="Click to view full chart"
          >
            <div className="relative p-1 rounded-lg hover:bg-muted/50 transition-all border border-transparent hover:border-border/50">
              <MiniSparkline 
                currentPrice={market.yes_price || 0.5}
                priceChange={market.price_change_24h || 0}
                tokenId={market.clob_token_ids?.[0]}
                width={64}
                height={24}
              />
            </div>
          </div>
          
          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </motion.div>
    </div>
  );
};

export default MarketListItem;
