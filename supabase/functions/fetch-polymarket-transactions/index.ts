import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PolymarketTrade {
  proxyWallet: string;
  side: 'BUY' | 'SELL';
  asset: string;
  conditionId: string;
  size: number;
  price: number;
  timestamp: number;
  transactionHash: string;
  outcome: string;
  outcomeIndex: number;
  title?: string;
  slug?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching transactions from Polymarket API...');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch markets to get condition IDs - fetch all active markets
    const { data: markets } = await supabaseClient
      .from('markets')
      .select('id, market_id, title')
      .eq('source', 'polymarket')
      .eq('status', 'active')
      .limit(500); // Increased limit to capture more markets

    if (!markets || markets.length === 0) {
      console.log('No Polymarket markets found');
      return new Response(
        JSON.stringify({ success: true, processed: 0, totalFetched: 0, marketsProcessed: 0, message: 'No markets to fetch transactions for' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let totalProcessed = 0;
    let totalFetched = 0;

    // Fetch trades for each market (process in batches to avoid timeout)
    for (const market of markets) {
      const conditionId = market.market_id.replace('polymarket-', '');
      
      try {
        // Fetch recent trades from Polymarket Data API
        // Use the correct endpoint with condition_id as market parameter
        const tradesResponse = await fetch(
          `https://data-api.polymarket.com/trades?market=${conditionId}&limit=1000&takerOnly=false`,
          {
            headers: {
              'Accept': 'application/json',
            },
          }
        );

        if (!tradesResponse.ok) {
          console.log(`Failed to fetch trades for market ${market.market_id}: ${tradesResponse.status}`);
          continue;
        }

        const trades: PolymarketTrade[] = await tradesResponse.json();
        totalFetched += trades.length;
        console.log(`Fetched ${trades.length} trades for market: ${market.title}`);

        // Process and store transactions
        for (const trade of trades) {
          const walletAddress = trade.proxyWallet;
          const side = trade.side === 'BUY' ? (trade.outcome.toLowerCase() === 'yes' ? 'yes' : 'no') : (trade.outcome.toLowerCase() === 'yes' ? 'no' : 'yes');
          const amount = trade.size;
          const price = trade.price;

          // Check if transaction already exists
          const { data: existingTx } = await supabaseClient
            .from('wallet_transactions')
            .select('id')
            .eq('transaction_hash', trade.transactionHash)
            .single();

          if (!existingTx) {
            // Insert new transaction
            await supabaseClient
              .from('wallet_transactions')
              .insert({
                wallet_address: walletAddress,
                market_id: market.id,
                amount: amount,
                price: price,
                side: side,
                transaction_type: 'market',
                transaction_hash: trade.transactionHash,
                timestamp: new Date(trade.timestamp * 1000).toISOString(),
                block_number: null,
              });

            totalProcessed++;

            // Update or create wallet profile
            const { data: profile } = await supabaseClient
              .from('wallet_profiles')
              .select('*')
              .eq('wallet_address', walletAddress)
              .single();

            if (profile) {
              await supabaseClient
                .from('wallet_profiles')
                .update({
                  total_trades: profile.total_trades + 1,
                  total_volume: profile.total_volume + amount,
                  last_seen: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .eq('wallet_address', walletAddress);
            } else {
              await supabaseClient
                .from('wallet_profiles')
                .insert({
                  wallet_address: walletAddress,
                  total_trades: 1,
                  total_volume: amount,
                  total_markets: 1,
                  first_seen: new Date(trade.timestamp * 1000).toISOString(),
                  last_seen: new Date().toISOString(),
                });
            }
          }
        }
      } catch (error) {
        console.error(`Error processing market ${market.market_id}:`, error);
      }
    }

    console.log(`Successfully processed ${totalProcessed} new transactions from ${totalFetched} total trades`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: totalProcessed,
        totalFetched: totalFetched,
        marketsProcessed: markets.length,
        message: 'Polymarket transactions synced successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-polymarket-transactions:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
