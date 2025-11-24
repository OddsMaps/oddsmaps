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

    // Build optimized query - use single query with join for best performance
    let marketsQuery = supabaseClient
      .from('markets')
      .select(`
        id,
        market_id,
        source,
        title,
        description,
        category,
        end_date,
        status,
        created_at,
        updated_at
      `)
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

    if (!markets || markets.length === 0) {
      console.log('No markets found');
      return new Response(
        JSON.stringify({ markets: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch latest market data for each market using optimized query
    const marketIds = markets.map(m => m.id);
    
    // Get the latest market data snapshot for each market
    const { data: marketDataList, error: dataError } = await supabaseClient
      .from('market_data')
      .select('*')
      .in('market_id', marketIds)
      .order('timestamp', { ascending: false });

    if (dataError) {
      console.error('Error fetching market data:', dataError);
      throw dataError;
    }

    // Create map of latest data per market
    const latestDataMap = new Map();
    (marketDataList || []).forEach(data => {
      if (!latestDataMap.has(data.market_id)) {
        latestDataMap.set(data.market_id, data);
      }
    });

    // Combine markets with their latest data
    const enhancedMarkets = markets.map(market => {
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
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
