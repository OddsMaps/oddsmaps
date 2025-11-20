import { usePolymarketSync } from "@/hooks/usePolymarketSync";
import { useRealtimeMarkets } from "@/hooks/useRealtimeMarkets";

export const DataSync = () => {
  usePolymarketSync();
  useRealtimeMarkets();
  return null;
};
