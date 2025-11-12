import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePolymarketSync = () => {
  useEffect(() => {
    const syncPolymarketData = async () => {
      try {
        console.log('Syncing Polymarket data...');
        
        // Sync markets
        const { data: marketsData, error: marketsError } = await supabase.functions.invoke('fetch-polymarket-markets');
        
        if (marketsError) {
          console.error('Error syncing Polymarket markets:', marketsError);
        } else {
          console.log('Polymarket markets synced successfully:', marketsData);
        }

        // Sync transactions
        const { data: transactionsData, error: transactionsError } = await supabase.functions.invoke('fetch-polymarket-transactions');
        
        if (transactionsError) {
          console.error('Error syncing Polymarket transactions:', transactionsError);
        } else {
          console.log('Polymarket transactions synced successfully:', transactionsData);
        }
      } catch (error) {
        console.error('Failed to sync Polymarket data:', error);
      }
    };

    // Sync immediately on mount
    syncPolymarketData();

    // Set up periodic sync every 2 minutes for real-time updates
    const interval = setInterval(syncPolymarketData, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};
