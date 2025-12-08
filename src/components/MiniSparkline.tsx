import { useMemo } from "react";

interface MiniSparklineProps {
  currentPrice: number;
  priceChange: number;
  width?: number;
  height?: number;
  className?: string;
}

const MiniSparkline = ({ 
  currentPrice, 
  priceChange, 
  width = 80, 
  height = 32,
  className = "" 
}: MiniSparklineProps) => {
  // Generate a synthetic price history based on current price and 24h change
  const points = useMemo(() => {
    const numPoints = 20;
    const data: number[] = [];
    
    // Start price (24h ago)
    const startPrice = currentPrice - priceChange;
    
    // Generate realistic-looking price movement
    for (let i = 0; i < numPoints; i++) {
      const progress = i / (numPoints - 1);
      // Add some randomness but trend towards current price
      const noise = (Math.sin(i * 2.5) * 0.02 + Math.cos(i * 1.7) * 0.015) * (1 - progress);
      const price = startPrice + (priceChange * progress) + noise;
      data.push(Math.max(0, Math.min(1, price)));
    }
    
    return data;
  }, [currentPrice, priceChange]);

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

  // Determine color based on price change
  const isPositive = priceChange >= 0;
  const strokeColor = isPositive ? "hsl(var(--primary))" : "hsl(var(--secondary))";
  const gradientId = `gradient-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <svg 
      width={width} 
      height={height} 
      className={className}
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