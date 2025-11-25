import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

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
    refetchInterval: 5000, // Refetch every 5 seconds to reduce load
    staleTime: 0, // Always consider data stale for immediate updates
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
