import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface PricePoint {
  yes_price: number;
  no_price: number;
  timestamp: string;
}

interface MarketPriceHistory {
  [marketId: string]: PricePoint[];
}

export const usePriceHistory = (marketIds: string[]) => {
  return useQuery({
    queryKey: ["price-history", marketIds.slice(0, 20).join(",")],
    queryFn: async () => {
      if (!marketIds.length) return {};

      // Fetch last 10 price points for each market (limit to first 20 markets for performance)
      const limitedIds = marketIds.slice(0, 20);
      
      const { data, error } = await supabase
        .from("market_data")
        .select("market_id, yes_price, no_price, timestamp")
        .in("market_id", limitedIds)
        .order("timestamp", { ascending: false })
        .limit(200); // 10 points per market * 20 markets

      if (error) {
        console.error("Error fetching price history:", error);
        return {};
      }

      // Group by market_id and take last 10 points for each
      const grouped: MarketPriceHistory = {};
      
      data?.forEach((point) => {
        if (!point.market_id) return;
        
        if (!grouped[point.market_id]) {
          grouped[point.market_id] = [];
        }
        
        // Only keep 10 most recent points per market
        if (grouped[point.market_id].length < 10) {
          grouped[point.market_id].push({
            yes_price: point.yes_price ?? 0,
            no_price: point.no_price ?? 0,
            timestamp: point.timestamp ?? "",
          });
        }
      });

      // Reverse to get chronological order (oldest first for sparkline)
      Object.keys(grouped).forEach((key) => {
        grouped[key] = grouped[key].reverse();
      });

      return grouped;
    },
    enabled: marketIds.length > 0,
    staleTime: 30000, // 30 seconds
    refetchInterval: 30000,
  });
};

// Generate SVG path from price history
export const generateSparklinePath = (
  history: PricePoint[] | undefined,
  width: number = 60,
  height: number = 30
): { path: string; isPositive: boolean } => {
  if (!history || history.length < 2) {
    // Return flat line if no history
    return { path: `M0,${height / 2} L${width},${height / 2}`, isPositive: true };
  }

  const prices = history.map((p) => p.yes_price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceRange = maxPrice - minPrice || 0.01; // Avoid division by zero

  const padding = 4;
  const chartHeight = height - padding * 2;
  const chartWidth = width;

  const points = prices.map((price, i) => {
    const x = (i / (prices.length - 1)) * chartWidth;
    const y = padding + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
    return { x, y };
  });

  // Create smooth curve using quadratic bezier
  let path = `M${points[0].x},${points[0].y}`;
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1];
    const curr = points[i];
    const midX = (prev.x + curr.x) / 2;
    path += ` Q${prev.x + (midX - prev.x) / 2},${prev.y} ${midX},${(prev.y + curr.y) / 2}`;
    path += ` T${curr.x},${curr.y}`;
  }

  const isPositive = prices[prices.length - 1] >= prices[0];

  return { path, isPositive };
};
