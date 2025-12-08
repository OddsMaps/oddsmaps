import { useQuery } from "@tanstack/react-query";
import { fetchMarkets, type Market } from "@/lib/polymarket-api";

export type { Market };

export const useMarkets = (source?: string, category?: string) => {
  return useQuery({
    queryKey: ["markets", source, category],
    queryFn: async () => {
      return await fetchMarkets(source, category);
    },
    staleTime: 30 * 1000, // Data is fresh for 30 seconds
    refetchInterval: 60 * 1000, // Refetch every 1 minute
    refetchIntervalInBackground: false, // Don't refetch when tab is in background
    refetchOnWindowFocus: true, // Refetch when user returns to tab
    refetchOnMount: false, // Don't refetch on mount if data is fresh (uses cache)
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
  });
};
