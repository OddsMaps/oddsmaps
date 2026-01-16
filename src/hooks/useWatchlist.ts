import { useState, useEffect, useCallback } from "react";

const WATCHLIST_KEY = "oddsmap_watchlist";

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem(WATCHLIST_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(watchlist));
  }, [watchlist]);

  const addToWatchlist = useCallback((marketId: string) => {
    setWatchlist((prev) => {
      if (prev.includes(marketId)) return prev;
      return [...prev, marketId];
    });
  }, []);

  const removeFromWatchlist = useCallback((marketId: string) => {
    setWatchlist((prev) => prev.filter((id) => id !== marketId));
  }, []);

  const toggleWatchlist = useCallback((marketId: string) => {
    setWatchlist((prev) => {
      if (prev.includes(marketId)) {
        return prev.filter((id) => id !== marketId);
      }
      return [...prev, marketId];
    });
  }, []);

  const isInWatchlist = useCallback(
    (marketId: string) => watchlist.includes(marketId),
    [watchlist]
  );

  return {
    watchlist,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    isInWatchlist,
  };
};
