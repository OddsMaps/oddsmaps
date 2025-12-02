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
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Parse request body
    const { source, category, limit = 200 } = await req.json().catch(() => ({}));
    console.log('Request params:', { source, category, limit });

    // Build query - fetch markets and their latest data separately for better performance
    let marketsQuery = supabaseClient
      .from('markets')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

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

    // Fetch only the latest market data for each market using efficient query
    const marketIds = markets?.map(m => m.id) || [];
    
    const latestDataMap = new Map();

    // Only fetch data if we have market IDs - use RPC or optimized query
    if (marketIds.length > 0) {
      // Batch process in chunks to avoid overwhelming the database
      const CHUNK_SIZE = 50;
      for (let i = 0; i < marketIds.length; i += CHUNK_SIZE) {
        const chunk = marketIds.slice(i, i + CHUNK_SIZE);
        
        // Get latest market_data for this chunk
        const { data: dataList, error: dataError } = await supabaseClient
          .from('market_data')
          .select('market_id, yes_price, no_price, total_volume, volume_24h, liquidity, trades_24h, volatility, timestamp')
          .in('market_id', chunk)
          .order('timestamp', { ascending: false })
          .limit(chunk.length); // Only get one per market in this chunk

        if (dataError) {
          console.error('Error fetching market data chunk:', dataError);
          continue; // Skip this chunk but continue with others
        }

        // Map the latest data (first occurrence due to ordering)
        dataList?.forEach(data => {
          if (!latestDataMap.has(data.market_id)) {
            latestDataMap.set(data.market_id, data);
          }
        });
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
        yes_price: latestData?.yes_price || 0.5,
        no_price: latestData?.no_price || 0.5,
        total_volume: latestData?.total_volume || 0,
        volume_24h: latestData?.volume_24h || 0,
        liquidity: latestData?.liquidity || 0,
        trades_24h: latestData?.trades_24h || 0,
        volatility: latestData?.volatility || 0,
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
    const errorDetails = error instanceof Error ? error.stack : JSON.stringify(error);
    console.error('Error details:', errorDetails);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        details: errorDetails
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
