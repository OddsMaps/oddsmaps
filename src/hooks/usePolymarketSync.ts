import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export const usePolymarketSync = () => {
  const queryClient = useQueryClient();

  const syncPolymarketData = useCallback(async () => {
    try {
      console.log('Syncing Polymarket data...');
      
      // Only sync transactions, markets are handled by realtime
      const result = await supabase.functions.invoke('fetch-polymarket-transactions');

      if (result.error) {
        console.error('Transactions sync failed:', result.error);
      } else {
        console.log('Transactions synced:', result.data);
      }
    } catch (error) {
      console.error('Failed to sync Polymarket data:', error);
    }
  }, [queryClient]);

  useEffect(() => {
    // Initial sync on mount
    syncPolymarketData();

    // Sync every 60 seconds (reduced from 30s for better performance)
    const interval = setInterval(syncPolymarketData, 60 * 1000);

    return () => clearInterval(interval);
  }, [syncPolymarketData]);

  return { syncPolymarketData };
};
