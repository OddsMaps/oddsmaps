import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Market {
  id: string;
  market_id: string;
  source: string;
  title: string;
  description: string | null;
  category: string | null;
  image_url: string | null;
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
  return useQuery({
    queryKey: ["markets", source, category],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke<GetMarketsResponse>("get-markets", {
        body: { source, category },
      });

      if (error) throw error;
      return data?.markets || [];
    },
    refetchInterval: 60000, // Refetch every 60 seconds to reduce database load
    staleTime: 30000, // Cache for 30 seconds
    retry: 1, // Only retry once on failure
    retryDelay: 3000, // Wait 3 seconds before retry
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
