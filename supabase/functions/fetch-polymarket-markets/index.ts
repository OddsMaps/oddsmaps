import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PolymarketMarket {
  condition_id: string;
  question: string;
  description: string;
  category: string;
  end_date_iso: string;
  active: boolean;
  closed: boolean;
  tokens: Array<{
    token_id: string;
    outcome: string;
    price: string;
  }>;
  volume: string;
  liquidity: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching markets from Polymarket API...');

    // Fetch from Polymarket CLOB API - using a different endpoint that returns active markets
    const polymarketResponse = await fetch('https://gamma-api.polymarket.com/markets?limit=100', {
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!polymarketResponse.ok) {
      throw new Error(`Polymarket API error: ${polymarketResponse.status}`);
    }

    const responseData = await polymarketResponse.json();
    console.log('Polymarket API response type:', typeof responseData);
    
    // Handle both array and object responses
    let polymarketData: PolymarketMarket[] = [];
    if (Array.isArray(responseData)) {
      polymarketData = responseData;
    } else if (responseData && Array.isArray(responseData.data)) {
      polymarketData = responseData.data;
    } else {
      console.error('Unexpected response format from Polymarket API:', responseData);
      throw new Error('Unexpected response format from Polymarket API');
    }

    console.log(`Fetched ${polymarketData.length} markets from Polymarket`);

    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Process and store markets - be more lenient with filtering
    const processedMarkets = polymarketData
      .filter(market => {
        // Accept if not explicitly closed
        const isActive = market.active !== false && market.closed !== true;
        return isActive;
      })
      .slice(0, 100)
      .map(market => {
        const yesToken = market.tokens?.find(t => t.outcome === 'Yes');
        const noToken = market.tokens?.find(t => t.outcome === 'No');

        return {
          market_id: `polymarket-${market.condition_id}`,
          source: 'polymarket',
          title: market.question,
          description: market.description || '',
          category: market.category || 'General',
          end_date: market.end_date_iso ? new Date(market.end_date_iso).toISOString() : null,
          status: 'active',
          yes_price: yesToken ? parseFloat(yesToken.price) : 0.5,
          no_price: noToken ? parseFloat(noToken.price) : 0.5,
          volume_24h: parseFloat(market.volume) || 0,
          liquidity: parseFloat(market.liquidity) || 0,
          trades_24h: 0,
          volatility: Math.abs((yesToken ? parseFloat(yesToken.price) : 0.5) - 0.5) * 100,
        };
      });

    console.log(`Processing ${processedMarkets.length} active markets`);

    // Upsert markets
    for (const market of processedMarkets) {
      // Check if market exists
      const { data: existingMarket } = await supabaseClient
        .from('markets')
        .select('id')
        .eq('market_id', market.market_id)
        .single();

      if (existingMarket) {
        // Update existing market
        await supabaseClient
          .from('markets')
          .update({
            title: market.title,
            description: market.description,
            category: market.category,
            end_date: market.end_date,
            status: market.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingMarket.id);

        // Insert new market data snapshot
        await supabaseClient
          .from('market_data')
          .insert({
            market_id: existingMarket.id,
            yes_price: market.yes_price,
            no_price: market.no_price,
            volume_24h: market.volume_24h,
            liquidity: market.liquidity,
            trades_24h: 0, // Polymarket doesn't provide this directly
            volatility: Math.abs(market.yes_price - 0.5) * 100,
          });
      } else {
        // Insert new market
        const { data: newMarket, error: marketError } = await supabaseClient
          .from('markets')
          .insert({
            market_id: market.market_id,
            source: market.source,
            title: market.title,
            description: market.description,
            category: market.category,
            end_date: market.end_date,
            status: market.status,
          })
          .select()
          .single();

        if (marketError) {
          console.error('Error inserting market:', marketError);
          continue;
        }

        // Insert initial market data
        await supabaseClient
          .from('market_data')
          .insert({
            market_id: newMarket.id,
            yes_price: market.yes_price,
            no_price: market.no_price,
            volume_24h: market.volume_24h,
            liquidity: market.liquidity,
            trades_24h: market.trades_24h,
            volatility: market.volatility,
          });
      }
    }

    console.log('Successfully synced Polymarket data');

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: processedMarkets.length,
        message: 'Polymarket data synced successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-polymarket-markets:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
