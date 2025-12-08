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
    const { source, category, limit = 50 } = await req.json().catch(() => ({}));
    console.log('Request params:', { source, category, limit });

    // Simple query - just fetch markets without joining market_data to avoid timeout
    let marketsQuery = supabaseClient
      .from('markets')
      .select('id, market_id, source, title, description, category, image_url, end_date, status, created_at, updated_at')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(Math.min(limit, 50)); // Lower limit for faster response

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

    // Return markets with default pricing - skip market_data query for now to avoid timeout
    const enhancedMarkets = markets?.map(market => ({
      id: market.id,
      market_id: market.market_id,
      source: market.source,
      title: market.title,
      description: market.description,
      category: market.category,
      image_url: market.image_url,
      end_date: market.end_date,
      status: market.status,
      yes_price: 0.5,
      no_price: 0.5,
      total_volume: 0,
      volume_24h: 0,
      liquidity: 0,
      trades_24h: 0,
      volatility: 0,
      last_updated: market.updated_at,
    })) || [];

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
