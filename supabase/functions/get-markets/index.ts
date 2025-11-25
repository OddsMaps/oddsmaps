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

    // Fetch latest market data for each market (limit to one per market)
    const marketIds = markets?.map(m => m.id) || [];
    
    let marketDataList: any[] = [];

    // Only fetch data if we have market IDs
    if (marketIds.length > 0) {
      // Use a more efficient query to get only the latest data per market
      const { data: dataList, error: dataError } = await supabaseClient
        .from('market_data')
        .select('market_id, yes_price, no_price, total_volume, volume_24h, liquidity, trades_24h, volatility, timestamp')
        .in('market_id', marketIds)
        .order('timestamp', { ascending: false });

      if (dataError) {
        console.error('Error fetching market data:', dataError);
        throw dataError;
      }

      marketDataList = dataList || [];
    }

    // Create a map of latest market data by market_id
    const latestDataMap = new Map();
    marketDataList.forEach(data => {
      if (!latestDataMap.has(data.market_id)) {
        latestDataMap.set(data.market_id, data);
      }
    });

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
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
