import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

interface PriceChartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  market: {
    title: string;
    yes_price: number;
    price_change_24h: number;
    volume_24h: number;
    image_url?: string | null;
  } | null;
}

const PriceChartModal = ({ open, onOpenChange, market }: PriceChartModalProps) => {
  // Generate synthetic price history data
  const chartData = useMemo(() => {
    if (!market) return [];
    
    const numPoints = 48; // 48 data points for 24 hours (every 30 min)
    const data: { time: string; price: number; hour: number }[] = [];
    
    const startPrice = market.yes_price - market.price_change_24h;
    const now = new Date();
    
    for (let i = 0; i < numPoints; i++) {
      const progress = i / (numPoints - 1);
      // Add realistic price movement with some volatility
      const noise = (Math.sin(i * 2.5) * 0.03 + Math.cos(i * 1.7) * 0.02 + Math.sin(i * 0.8) * 0.015) * (1 - progress * 0.5);
      const price = startPrice + (market.price_change_24h * progress) + noise;
      
      const pointTime = new Date(now.getTime() - (numPoints - 1 - i) * 30 * 60 * 1000);
      const hour = pointTime.getHours();
      const minutes = pointTime.getMinutes();
      
      data.push({
        time: `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`,
        price: Math.max(0, Math.min(1, price)) * 100,
        hour: i,
      });
    }
    
    return data;
  }, [market]);

  if (!market) return null;

  const isPositive = market.price_change_24h >= 0;
  const priceChangePercent = ((market.price_change_24h / (market.yes_price - market.price_change_24h)) * 100) || 0;

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    }
    return `$${(volume / 1000).toFixed(0)}K`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-start gap-4">
            {market.image_url && (
              <img 
                src={market.image_url} 
                alt={market.title}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold line-clamp-2">
                {market.title}
              </DialogTitle>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">
                    {(market.yes_price * 100).toFixed(1)}%
                  </span>
                  <Badge 
                    variant="outline" 
                    className={`${isPositive ? 'bg-primary/20 text-primary border-primary/30' : 'bg-secondary/20 text-secondary border-secondary/30'}`}
                  >
                    {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
                    {isPositive ? '+' : ''}{(market.price_change_24h * 100).toFixed(1)}%
                  </Badge>
                </div>
                <span className="text-sm text-muted-foreground">
                  Vol: {formatVolume(market.volume_24h)}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>
        
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">Price History (24h)</span>
            <div className="flex gap-2">
              {['1H', '24H', '7D', '1M'].map((period) => (
                <button
                  key={period}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    period === '24H' 
                      ? 'bg-foreground text-background' 
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop 
                      offset="0%" 
                      stopColor={isPositive ? "hsl(var(--primary))" : "hsl(var(--secondary))"} 
                      stopOpacity={0.3} 
                    />
                    <stop 
                      offset="100%" 
                      stopColor={isPositive ? "hsl(var(--primary))" : "hsl(var(--secondary))"} 
                      stopOpacity={0} 
                    />
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  interval={11}
                />
                <YAxis 
                  domain={['dataMin - 2', 'dataMax + 2']}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                  tickFormatter={(value) => `${value.toFixed(0)}%`}
                  width={45}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Price']}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Area
                  type="monotone"
                  dataKey="price"
                  stroke={isPositive ? "hsl(var(--primary))" : "hsl(var(--secondary))"}
                  strokeWidth={2}
                  fill="url(#priceGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">24h High</p>
            <p className="text-sm font-medium">
              {(Math.max(...chartData.map(d => d.price))).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">24h Low</p>
            <p className="text-sm font-medium">
              {(Math.min(...chartData.map(d => d.price))).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">24h Change</p>
            <p className={`text-sm font-medium ${isPositive ? 'text-primary' : 'text-secondary'}`}>
              {isPositive ? '+' : ''}{(market.price_change_24h * 100).toFixed(2)}%
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PriceChartModal;