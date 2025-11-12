import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export const usePolymarketSync = () => {
  const queryClient = useQueryClient();

  const syncPolymarketData = useCallback(async () => {
    try {
      console.log('Syncing Polymarket data...');
      
      // Sync markets and transactions in parallel for better performance
      const [marketsResult, transactionsResult] = await Promise.allSettled([
        supabase.functions.invoke('fetch-polymarket-markets'),
        supabase.functions.invoke('fetch-polymarket-transactions')
      ]);

      if (marketsResult.status === 'fulfilled' && !marketsResult.value.error) {
        console.log('Markets synced:', marketsResult.value.data);
        // Invalidate markets cache to trigger refetch
        queryClient.invalidateQueries({ queryKey: ['markets'] });
      } else {
        console.error('Markets sync failed:', marketsResult);
      }

      if (transactionsResult.status === 'fulfilled' && !transactionsResult.value.error) {
        console.log('Transactions synced:', transactionsResult.value.data);
      } else {
        console.error('Transactions sync failed:', transactionsResult);
      }
    } catch (error) {
      console.error('Failed to sync Polymarket data:', error);
    }
  }, [queryClient]);

  useEffect(() => {
    // Initial sync on mount
    syncPolymarketData();

    // Optimized sync every 5 minutes (reduced from 2 minutes for better performance)
    const interval = setInterval(syncPolymarketData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [syncPolymarketData]);

  return { syncPolymarketData };
};
