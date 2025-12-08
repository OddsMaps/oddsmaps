// This hook is no longer needed - we fetch data directly from Polymarket API
// Keeping empty implementation for backwards compatibility
export const usePolymarketSync = () => {
  // No-op: Data is fetched directly from Polymarket API, no sync needed
  return { syncPolymarketData: async () => {} };
};
