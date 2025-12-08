import { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { fetchPriceHistory, type PriceHistoryPoint } from "@/lib/polymarket-api";

type TimeInterval = '1h' | '6h' | '1d' | '1w' | '1m' | 'max';

interface PriceChartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  market: {
    title: string;
    yes_price: number;
    price_change_24h: number;
    volume_24h: number;
    image_url?: string | null;
    clob_token_ids?: string[] | null;
  } | null;
}

const PriceChartModal = ({ open, onOpenChange, market }: PriceChartModalProps) => {
  const [selectedInterval, setSelectedInterval] = useState<TimeInterval>('1d');
  const [priceHistory, setPriceHistory] = useState<PriceHistoryPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const intervals: { id: TimeInterval; label: string }[] = [
    { id: '1h', label: '1H' },
    { id: '1d', label: '24H' },
    { id: '1w', label: '7D' },
    { id: '1m', label: '1M' },
  ];

  // Fetch price history when modal opens or interval changes
  useEffect(() => {
    if (!open || !market?.clob_token_ids?.[0]) {
      setPriceHistory([]);
      return;
    }

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Use the first token ID (Yes outcome)
        const tokenId = market.clob_token_ids![0];
        const history = await fetchPriceHistory(tokenId, selectedInterval);
        setPriceHistory(history);
      } catch (error) {
        console.error('Error fetching price history:', error);
        setPriceHistory([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [open, market?.clob_token_ids, selectedInterval]);

  // Format chart data
  const chartData = useMemo(() => {
    if (priceHistory.length === 0) return [];
    
    return priceHistory.map((point) => {
      const date = new Date(point.timestamp * 1000);
      let timeLabel: string;
      
      if (selectedInterval === '1h' || selectedInterval === '6h') {
        timeLabel = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else if (selectedInterval === '1d') {
        timeLabel = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      } else if (selectedInterval === '1w') {
        timeLabel = date.toLocaleDateString('en-US', { weekday: 'short', hour: '2-digit' });
      } else {
        timeLabel = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
      
      return {
        time: timeLabel,
        timestamp: point.timestamp,
        price: point.price * 100, // Convert to percentage
      };
    });
  }, [priceHistory, selectedInterval]);

  // Calculate stats from real data
  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return { high: 0, low: 0, change: 0 };
    }
    
    const prices = chartData.map(d => d.price);
    const high = Math.max(...prices);
    const low = Math.min(...prices);
    const firstPrice = chartData[0]?.price || 0;
    const lastPrice = chartData[chartData.length - 1]?.price || 0;
    const change = lastPrice - firstPrice;
    
    return { high, low, change };
  }, [chartData]);

  if (!market) return null;

  const isPositive = stats.change >= 0 || market.price_change_24h >= 0;

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
            <span className="text-sm text-muted-foreground">
              Price History {isLoading && <Loader2 className="w-3 h-3 inline ml-1 animate-spin" />}
            </span>
            <div className="flex gap-2">
              {intervals.map((interval) => (
                <button
                  key={interval.id}
                  onClick={() => setSelectedInterval(interval.id)}
                  className={`px-3 py-1 text-xs rounded-full transition-colors ${
                    selectedInterval === interval.id 
                      ? 'bg-foreground text-background' 
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {interval.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="h-64 w-full">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                No price data available
              </div>
            ) : (
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
                    interval="preserveStartEnd"
                    minTickGap={50}
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
                    formatter={(value: number) => [`${value.toFixed(2)}%`, 'Price']}
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
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground">Period High</p>
            <p className="text-sm font-medium">
              {stats.high > 0 ? `${stats.high.toFixed(1)}%` : '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Period Low</p>
            <p className="text-sm font-medium">
              {stats.low > 0 ? `${stats.low.toFixed(1)}%` : '-'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Period Change</p>
            <p className={`text-sm font-medium ${stats.change >= 0 ? 'text-primary' : 'text-secondary'}`}>
              {stats.change !== 0 ? `${stats.change >= 0 ? '+' : ''}${stats.change.toFixed(2)}%` : '-'}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PriceChartModal;