import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing environment variables');
    return new Response(
      JSON.stringify({ error: 'Configuration error', markets: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    console.log('Starting get-markets...');

    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false },
      db: { schema: 'public' }
    });

    // Parse request body
    const body = await req.json().catch(() => ({}));
    const { source, category, limit = 20 } = body;
    console.log('Params:', { source, category, limit });

    // Simple query with minimal columns
    let query = supabaseClient
      .from('markets')
      .select('id, market_id, source, title, category, image_url, status, updated_at')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(Math.min(limit, 20));

    if (source) {
      query = query.eq('source', source);
    }
    if (category) {
      query = query.eq('category', category);
    }

    const { data: markets, error } = await query;

    if (error) {
      console.error('Query error:', error.message);
      return new Response(
        JSON.stringify({ error: error.message, markets: [] }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Found markets:', markets?.length || 0);

    // Map to expected format with defaults
    const result = (markets || []).map(m => ({
      id: m.id,
      market_id: m.market_id,
      source: m.source,
      title: m.title,
      description: null,
      category: m.category,
      image_url: m.image_url,
      end_date: null,
      status: m.status,
      yes_price: 0.5,
      no_price: 0.5,
      total_volume: 0,
      volume_24h: 0,
      liquidity: 0,
      trades_24h: 0,
      volatility: 0,
      last_updated: m.updated_at,
    }));

    return new Response(
      JSON.stringify({ markets: result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Unexpected error', markets: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
