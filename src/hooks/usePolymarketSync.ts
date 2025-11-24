import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/utils';

export const usePolymarketSync = () => {
  const queryClient = useQueryClient();

  const syncPolymarketData = useCallback(async () => {
    try {
      logger.log('Syncing Polymarket data...');
      
      // Sync markets and transactions in parallel for better performance
      const [marketsResult, transactionsResult] = await Promise.allSettled([
        supabase.functions.invoke('fetch-polymarket-markets'),
        supabase.functions.invoke('fetch-polymarket-transactions')
      ]);

      if (marketsResult.status === 'fulfilled' && !marketsResult.value.error) {
        logger.log('Markets synced:', marketsResult.value.data);
        // Invalidate markets cache to trigger refetch
        queryClient.invalidateQueries({ queryKey: ['markets'] });
      } else {
        logger.error('Markets sync failed:', marketsResult);
      }

      if (transactionsResult.status === 'fulfilled' && !transactionsResult.value.error) {
        logger.log('Transactions synced:', transactionsResult.value.data);
      } else {
        logger.error('Transactions sync failed:', transactionsResult);
      }
    } catch (error) {
      logger.error('Failed to sync Polymarket data:', error);
    }
  }, [queryClient]);

  useEffect(() => {
    // Initial sync on mount
    syncPolymarketData();

    // Sync every 30 seconds for real-time data
    const interval = setInterval(syncPolymarketData, 30 * 1000);

    return () => clearInterval(interval);
  }, [syncPolymarketData]);

  return { syncPolymarketData };
};
