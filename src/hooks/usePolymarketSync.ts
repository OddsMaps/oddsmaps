import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const usePolymarketSync = () => {
  useEffect(() => {
    const syncPolymarketData = async () => {
      try {
        console.log('Syncing Polymarket data...');
        const { error } = await supabase.functions.invoke('fetch-polymarket-markets');
        
        if (error) {
          console.error('Error syncing Polymarket data:', error);
        } else {
          console.log('Polymarket data synced successfully');
        }
      } catch (error) {
        console.error('Failed to sync Polymarket data:', error);
      }
    };

    // Sync immediately on mount
    syncPolymarketData();

    // Set up periodic sync every 5 minutes
    const interval = setInterval(syncPolymarketData, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);
};
