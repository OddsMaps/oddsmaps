import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching markets from database...');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const { source, category, limit = 100 } = await req.json().catch(() => ({}));
    console.log('Request params:', { source, category, limit });

    // Build query - fetch markets only (prices are stored directly on markets now)
    let marketsQuery = supabaseClient
      .from('markets')
      .select('id, market_id, source, title, description, category, image_url, end_date, status, created_at, updated_at')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(Math.min(limit, 100)); // Cap at 100 for performance

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

    // Get only the LATEST market data entry per market (using a more efficient approach)
    const marketIds = markets?.map(m => m.id) || [];
    const latestDataMap = new Map();

    if (marketIds.length > 0) {
      // Use a simpler query - just get distinct on market_id ordered by timestamp
      // Process in small batches
      const BATCH_SIZE = 20;
      
      for (let i = 0; i < marketIds.length; i += BATCH_SIZE) {
        const batch = marketIds.slice(i, i + BATCH_SIZE);
        
        try {
          // Get just the most recent entry for each market using limit per market
          const { data: dataList, error: dataError } = await supabaseClient
            .from('market_data')
            .select('market_id, yes_price, no_price, total_volume, volume_24h, liquidity, trades_24h, volatility, timestamp')
            .in('market_id', batch)
            .order('timestamp', { ascending: false })
            .limit(batch.length * 2); // Get a bit more to ensure we have latest

          if (dataError) {
            console.warn('Error fetching market data batch:', dataError.message);
            continue;
          }

          // Take only the first (latest) entry per market
          dataList?.forEach(data => {
            if (!latestDataMap.has(data.market_id)) {
              latestDataMap.set(data.market_id, data);
            }
          });
        } catch (batchError) {
          console.warn('Batch fetch failed, continuing:', batchError);
          continue;
        }
      }
    }

    // Combine markets with their latest data
    const enhancedMarkets = markets?.map(market => {
      const latestData = latestDataMap.get(market.id);
      return {
        id: market.id,
        market_id: market.market_id,
        source: market.source,
        title: market.title,
        description: market.description,
        category: market.category,
        image_url: market.image_url,
        end_date: market.end_date,
        status: market.status,
        yes_price: latestData?.yes_price ?? 0.5,
        no_price: latestData?.no_price ?? 0.5,
        total_volume: latestData?.total_volume ?? 0,
        volume_24h: latestData?.volume_24h ?? 0,
        liquidity: latestData?.liquidity ?? 0,
        trades_24h: latestData?.trades_24h ?? 0,
        volatility: latestData?.volatility ?? 0,
        last_updated: latestData?.timestamp || market.updated_at,
      };
    }) || [];

    console.log(`Returning ${enhancedMarkets.length} markets`);

    return new Response(
      JSON.stringify({ markets: enhancedMarkets }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in get-markets function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('Error details:', errorMessage);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: JSON.stringify(error)
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});