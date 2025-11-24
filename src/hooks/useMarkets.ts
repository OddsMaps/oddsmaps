import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface Market {
  id: string;
  market_id: string;
  source: string;
  title: string;
  description: string | null;
  category: string | null;
  end_date: string | null;
  status: string;
  yes_price: number;
  no_price: number;
  total_volume: number;
  volume_24h: number;
  liquidity: number;
  trades_24h: number;
  volatility: number;
  last_updated: string;
}

interface GetMarketsResponse {
  markets: Market[];
}

export const useMarkets = (source?: string, category?: string) => {
  const queryClient = useQueryClient();

  // Set up realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('markets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'markets'
        },
        () => {
          // Invalidate and refetch when markets change
          queryClient.invalidateQueries({ queryKey: ["markets"] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_data'
        },
        () => {
          // Invalidate and refetch when market data changes
          queryClient.invalidateQueries({ queryKey: ["markets"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return useQuery({
    queryKey: ["markets", source, category],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<GetMarketsResponse>("get-markets", {
        body: { source, category },
      });

      if (error) throw error;
      return data?.markets || [];
    },
    refetchInterval: 10000, // Refetch every 10 seconds (reduced from 5s for better performance)
    staleTime: 8000, // Data is fresh for 8 seconds (reduced unnecessary refetches)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
};

// Hook to fetch a single market by market_id (more efficient than fetching all)
export const useMarket = (marketId?: string) => {
  const queryClient = useQueryClient();
  
  return useQuery({
    queryKey: ["market", marketId],
    queryFn: async () => {
      if (!marketId) throw new Error("Market ID is required");

      // First try to get from cache if we have markets list
      const cachedMarkets = queryClient.getQueryData<Market[]>(["markets", "polymarket"]);
      
      if (cachedMarkets) {
        const cachedMarket = cachedMarkets.find(m => m.market_id === marketId);
        if (cachedMarket) {
          return cachedMarket;
        }
      }

      // If not in cache, fetch all markets (will use cache if available)
      const { data, error } = await supabase.functions.invoke<GetMarketsResponse>("get-markets", {
        body: { source: "polymarket" },
      });

      if (error) throw error;
      const market = data?.markets?.find(m => m.market_id === marketId);
      if (!market) throw new Error("Market not found");
      return market;
    },
    enabled: !!marketId,
    staleTime: 10 * 1000, // Cache for 10 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
  });
};

export const useFetchMarkets = () => {
  const fetchMarkets = async () => {
    const { data, error } = await supabase.functions.invoke("fetch-markets");
    if (error) throw error;
    return data;
  };

  return { fetchMarkets };
};
