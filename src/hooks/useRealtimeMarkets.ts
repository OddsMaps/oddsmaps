import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useRealtimeMarkets = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log('Setting up realtime subscriptions...');

    // Subscribe to market changes
    const marketsChannel = supabase
      .channel('markets-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'markets'
        },
        (payload) => {
          console.log('Market change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['markets'] });
        }
      )
      .subscribe();

    // Subscribe to market data changes
    const marketDataChannel = supabase
      .channel('market-data-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'market_data'
        },
        (payload) => {
          console.log('Market data change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['markets'] });
        }
      )
      .subscribe();

    // Subscribe to wallet transaction changes
    const transactionsChannel = supabase
      .channel('transactions-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wallet_transactions'
        },
        (payload) => {
          console.log('New transaction detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['transactions'] });
          queryClient.invalidateQueries({ queryKey: ['wallet-profile'] });
        }
      )
      .subscribe();

    // Subscribe to wallet profile changes
    const profilesChannel = supabase
      .channel('profiles-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallet_profiles'
        },
        (payload) => {
          console.log('Wallet profile change detected:', payload);
          queryClient.invalidateQueries({ queryKey: ['wallet-profile'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(marketsChannel);
      supabase.removeChannel(marketDataChannel);
      supabase.removeChannel(transactionsChannel);
      supabase.removeChannel(profilesChannel);
      console.log('Realtime subscriptions cleaned up');
    };
  }, [queryClient]);
};