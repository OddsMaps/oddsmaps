import { useState, useEffect, useMemo } from "react";
import { fetchPriceHistory, type PriceHistoryPoint } from "@/lib/polymarket-api";

interface MiniSparklineProps {
  currentPrice: number;
  priceChange: number;
  tokenId?: string | null;
  width?: number;
  height?: number;
  className?: string;
}

// Simple in-memory cache for sparkline data
const sparklineCache = new Map<string, { data: number[]; timestamp: number }>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

const MiniSparkline = ({ 
  currentPrice, 
  priceChange,
  tokenId,
  width = 80, 
  height = 32,
  className = "" 
}: MiniSparklineProps) => {
  const [realPrices, setRealPrices] = useState<number[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real price data if tokenId is provided
  useEffect(() => {
    if (!tokenId) {
      setRealPrices(null);
      return;
    }

    const cacheKey = tokenId;
    const cached = sparklineCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setRealPrices(cached.data);
      return;
    }

    // Debounce to avoid too many requests
    const timeoutId = setTimeout(async () => {
      setIsLoading(true);
      try {
        // Use 1 week interval for sparklines to show more history
        const history = await fetchPriceHistory(tokenId, '1w');
        
        if (history.length > 0) {
          // Sample down to ~20 points for smooth sparkline
          const step = Math.max(1, Math.floor(history.length / 20));
          const sampled = history
            .filter((_, i) => i % step === 0 || i === history.length - 1)
            .map(p => p.price);
          
          setRealPrices(sampled);
          sparklineCache.set(cacheKey, { data: sampled, timestamp: Date.now() });
        }
      } catch (error) {
        console.warn('Failed to fetch sparkline data:', error);
      } finally {
        setIsLoading(false);
      }
    }, Math.random() * 500); // Stagger requests

    return () => clearTimeout(timeoutId);
  }, [tokenId]);

  // Use real prices if available, otherwise generate synthetic
  const points = useMemo(() => {
    if (realPrices && realPrices.length > 2) {
      return realPrices;
    }

    // Fallback: Generate synthetic price history
    const numPoints = 20;
    const data: number[] = [];
    
    const startPrice = currentPrice - priceChange;
    
    for (let i = 0; i < numPoints; i++) {
      const progress = i / (numPoints - 1);
      const noise = (Math.sin(i * 2.5) * 0.02 + Math.cos(i * 1.7) * 0.015) * (1 - progress);
      const price = startPrice + (priceChange * progress) + noise;
      data.push(Math.max(0, Math.min(1, price)));
    }
    
    return data;
  }, [currentPrice, priceChange, realPrices]);

  // Calculate SVG path
  const path = useMemo(() => {
    if (points.length === 0) return "";
    
    const minPrice = Math.min(...points);
    const maxPrice = Math.max(...points);
    const range = maxPrice - minPrice || 0.01;
    
    const padding = 2;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    const pathData = points.map((price, i) => {
      const x = padding + (i / (points.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((price - minPrice) / range) * chartHeight;
      return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
    
    return pathData;
  }, [points, width, height]);

  // Determine color based on price trend (first vs last point)
  const isPositive = points.length >= 2 ? points[points.length - 1] >= points[0] : priceChange >= 0;
  const strokeColor = isPositive ? "hsl(var(--primary))" : "hsl(var(--secondary))";
  const gradientId = `gradient-${tokenId || Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg 
      width={width} 
      height={height} 
      className={`${className} ${isLoading ? 'opacity-50' : ''}`}
      viewBox={`0 0 ${width} ${height}`}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      
      {/* Area fill */}
      <path
        d={`${path} L ${width - 2} ${height - 2} L 2 ${height - 2} Z`}
        fill={`url(#${gradientId})`}
      />
      
      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default MiniSparkline;