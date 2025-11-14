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
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { marketId } = await req.json();
    console.log('Syncing transactions for market:', marketId);

    if (!marketId) {
      return new Response(
        JSON.stringify({ error: 'marketId is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch the market from database
    const { data: market, error: marketError } = await supabaseClient
      .from('markets')
      .select('id, market_id, title')
      .eq('market_id', marketId)
      .single();

    if (marketError || !market) {
      console.error('Market not found:', marketError);
      return new Response(
        JSON.stringify({ error: 'Market not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const conditionId = market.market_id.replace('polymarket-', '');
    console.log('Fetching trades for condition ID:', conditionId);

    // Fetch trades from Polymarket API
    const tradesResponse = await fetch(
      `https://data-api.polymarket.com/trades?market=${conditionId}&limit=1000&takerOnly=false`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!tradesResponse.ok) {
      console.error(`Failed to fetch trades: ${tradesResponse.status}`);
      return new Response(
        JSON.stringify({ 
          error: `Failed to fetch trades from Polymarket API: ${tradesResponse.status}`,
          marketId: market.market_id
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const trades: PolymarketTrade[] = await tradesResponse.json();
    console.log(`Fetched ${trades.length} trades for market: ${market.title}`);

    if (trades.length === 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          processed: 0, 
          fetched: 0,
          message: 'No trades found for this market'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    let processedCount = 0;

    // Process and store transactions
    for (const trade of trades) {
      const walletAddress = trade.proxyWallet;
      const side = trade.side === 'BUY' 
        ? (trade.outcome.toLowerCase() === 'yes' ? 'yes' : 'no') 
        : (trade.outcome.toLowerCase() === 'yes' ? 'no' : 'yes');
      const amount = trade.size;
      const price = trade.price;

      // Check if transaction already exists
      const { data: existingTx } = await supabaseClient
        .from('wallet_transactions')
        .select('id')
        .eq('transaction_hash', trade.transactionHash)
        .maybeSingle();

      if (!existingTx) {
        // Insert new transaction
        const { error: insertError } = await supabaseClient
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

        if (insertError) {
          console.error('Error inserting transaction:', insertError);
        } else {
          processedCount++;
        }

        // Update or create wallet profile
        const { data: profile } = await supabaseClient
          .from('wallet_profiles')
          .select('*')
          .eq('wallet_address', walletAddress)
          .maybeSingle();

        if (profile) {
          // Update existing profile
          await supabaseClient
            .from('wallet_profiles')
            .update({
              total_volume: Number(profile.total_volume) + amount,
              total_trades: Number(profile.total_trades) + 1,
              last_seen: new Date(trade.timestamp * 1000).toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq('wallet_address', walletAddress);
        } else {
          // Create new profile
          await supabaseClient
            .from('wallet_profiles')
            .insert({
              wallet_address: walletAddress,
              total_volume: amount,
              total_trades: 1,
              first_seen: new Date(trade.timestamp * 1000).toISOString(),
              last_seen: new Date(trade.timestamp * 1000).toISOString(),
            });
        }
      }
    }

    console.log(`Processed ${processedCount} new transactions out of ${trades.length} total`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedCount, 
        fetched: trades.length,
        marketTitle: market.title
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error syncing market transactions:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
