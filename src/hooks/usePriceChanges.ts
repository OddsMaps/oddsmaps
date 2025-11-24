import { useState, useEffect, useRef } from 'react';

interface Market {
  id: string;
  market_id: string;
  title: string;
  yes_price: number;
  no_price: number;
  volatility: number;
  volume_24h: number;
}

interface PriceChange {
  marketId: string;
  oldPrice: number;
  newPrice: number;
  change: number;
  changePercent: number;
  timestamp: number;
  isIncreasing: boolean;
}

export const usePriceChanges = (markets: Market[] | undefined) => {
  const [priceChanges, setPriceChanges] = useState<Map<string, PriceChange>>(new Map());
  const previousPrices = useRef<Map<string, number>>(new Map());
  const [activeMarkets, setActiveMarkets] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!markets) return;

    const newChanges = new Map<string, PriceChange>();
    const newActiveMarkets = new Set<string>();

    markets.forEach(market => {
      const currentPrice = market.yes_price;
      const previousPrice = previousPrices.current.get(market.id);

      if (previousPrice !== undefined && previousPrice !== currentPrice) {
        const change = currentPrice - previousPrice;
        const changePercent = (change / previousPrice) * 100;

        newChanges.set(market.id, {
          marketId: market.id,
          oldPrice: previousPrice,
          newPrice: currentPrice,
          change,
          changePercent,
          timestamp: Date.now(),
          isIncreasing: change > 0,
        });

        // Mark as active if change is significant (>0.5%)
        if (Math.abs(changePercent) > 0.5) {
          newActiveMarkets.add(market.id);
        }
      }

      // Update previous price
      previousPrices.current.set(market.id, currentPrice);
    });

    if (newChanges.size > 0) {
      setPriceChanges(newChanges);
      setActiveMarkets(newActiveMarkets);

      // Clear active markets after animation duration
      const timeoutId = setTimeout(() => {
        setActiveMarkets(new Set());
      }, 3000);

      // Cleanup timeout on unmount or when markets change
      return () => {
        clearTimeout(timeoutId);
      };
    }
  }, [markets]);

  return { priceChanges, activeMarkets };
};
