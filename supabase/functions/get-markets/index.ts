import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper to batch array into chunks
const batchArray = <T,>(array: T[], batchSize: number): T[][] => {
  const batches: T[][] = [];
  for (let i = 0; i < array.length; i += batchSize) {
    batches.push(array.slice(i, i + batchSize));
  }
  return batches;
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching markets from database...');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Parse request body
    const { source, category, limit = 100 } = await req.json().catch(() => ({}));
    console.log('Request params:', { source, category, limit });

    // Reduced default limit to 100 for better performance
    const finalLimit = Math.min(limit, 100);

    // Build query - fetch markets
    let marketsQuery = supabaseClient
      .from('markets')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(finalLimit);

    // Add filters
    if (source) {
      marketsQuery = marketsQuery.eq('source', source);
    }
    if (category) {
      marketsQuery = marketsQuery.eq('category', category);
    }

    const { data: markets, error: marketsError } = await marketsQuery;

    if (marketsError) {
      console.error('Error fetching markets:', marketsError);
      throw marketsError;
    }

    if (!markets || markets.length === 0) {
      console.log('No markets found');
      return new Response(
        JSON.stringify({ markets: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const marketIds = markets.map((m: any) => m.id);
    
    let marketDataList: any[] = [];
    let tradesCountMap = new Map();

    // Process market IDs in smaller batches to avoid connection issues
    const BATCH_SIZE = 25;
    const marketIdBatches = batchArray(marketIds, BATCH_SIZE);

    // Fetch market data in batches
    for (const batch of marketIdBatches) {
      try {
        const { data: dataList, error: dataError } = await supabaseClient
          .from('market_data')
          .select('market_id, yes_price, no_price, total_volume, volume_24h, liquidity, trades_24h, volatility, timestamp')
          .in('market_id', batch)
          .order('timestamp', { ascending: false });

        if (dataError) {
          console.error('Error fetching market data batch:', dataError);
          // Continue with other batches even if one fails
          continue;
        }

        if (dataList) {
          marketDataList.push(...dataList);
        }
      } catch (error) {
        console.error('Error processing market data batch:', error);
        // Continue with other batches
      }
    }

    // Fetch trade counts in batches (optional - skip if causing issues)
    try {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      for (const batch of marketIdBatches) {
        const { data: trades } = await supabaseClient
          .from('wallet_transactions')
          .select('market_id')
          .in('market_id', batch)
          .gte('timestamp', twentyFourHoursAgo);

        if (trades) {
          trades.forEach((trade: any) => {
            const count = tradesCountMap.get(trade.market_id) || 0;
            tradesCountMap.set(trade.market_id, count + 1);
          });
        }
      }
    } catch (error) {
      console.error('Error fetching trade counts (non-critical):', error);
      // Trade counts are optional, continue without them
    }

    // Create a map of latest market data by market_id
    const latestDataMap = new Map();
    marketDataList.forEach(data => {
      if (!latestDataMap.has(data.market_id)) {
        latestDataMap.set(data.market_id, data);
      }
    });

    // Combine markets with their latest data
    const enhancedMarkets = markets.map((market: any) => {
      const latestData = latestDataMap.get(market.id);
      const actualTrades24h = tradesCountMap.get(market.id) || 0;
      return {
        id: market.id,
        market_id: market.market_id,
        source: market.source,
        title: market.title,
        description: market.description,
        category: market.category,
        end_date: market.end_date,
        status: market.status,
        yes_price: latestData?.yes_price || 0.5,
        no_price: latestData?.no_price || 0.5,
        total_volume: latestData?.total_volume || 0,
        volume_24h: latestData?.volume_24h || 0,
        liquidity: latestData?.liquidity || 0,
        trades_24h: actualTrades24h || latestData?.trades_24h || 0,
        volatility: latestData?.volatility || 0,
        last_updated: latestData?.timestamp || market.updated_at,
      };
    });

    console.log(`Returning ${enhancedMarkets.length} markets`);

    return new Response(
      JSON.stringify({ markets: enhancedMarkets }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-markets function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage, details: error instanceof Error ? error.stack : '' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
