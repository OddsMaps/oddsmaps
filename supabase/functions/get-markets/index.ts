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

    // Parse query parameters
    const url = new URL(req.url);
    const source = url.searchParams.get('source');
    const category = url.searchParams.get('category');
    const limit = parseInt(url.searchParams.get('limit') || '200'); // Increased default limit

    // Build query
    let query = supabaseClient
      .from('markets')
      .select(`
        *,
        market_data (
          yes_price,
          no_price,
          volume_24h,
          liquidity,
          trades_24h,
          volatility,
          timestamp
        )
      `)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(limit);

    // Add filters
    if (source) {
      query = query.eq('source', source);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data: markets, error } = await query;

    if (error) {
      console.error('Error fetching markets:', error);
      throw error;
    }

    // Get the latest market data for each market
    const enhancedMarkets = markets?.map(market => {
      const latestData = market.market_data?.[0];
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
