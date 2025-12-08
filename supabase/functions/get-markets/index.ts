import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Retry helper with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 500
): Promise<T> {
  let lastError: Error | null = null;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.warn(`Attempt ${i + 1} failed, retrying in ${baseDelay * Math.pow(2, i)}ms...`);
      await new Promise(resolve => setTimeout(resolve, baseDelay * Math.pow(2, i)));
    }
  }
  throw lastError;
}

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
    const { source, category, limit = 30 } = await req.json().catch(() => ({}));
    console.log('Request params:', { source, category, limit });

    // Fetch markets with retry logic
    const markets = await withRetry(async () => {
      let query = supabaseClient
        .from('markets')
        .select('id, market_id, source, title, description, category, image_url, end_date, status, updated_at')
        .eq('status', 'active')
        .order('updated_at', { ascending: false })
        .limit(Math.min(limit, 30)); // Reduced limit for stability

      if (source) {
        query = query.eq('source', source);
      }
      if (category) {
        query = query.eq('category', category);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    });

    // Return markets with default pricing
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
      JSON.stringify({ error: errorMessage, markets: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
