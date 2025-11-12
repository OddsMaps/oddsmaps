import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KalshiMarket {
  ticker: string;
  title: string;
  category: string;
  close_time: string;
  status: string;
  yes_bid: number;
  yes_ask: number;
  volume: number;
  open_interest: number;
}

interface PolymarketMarket {
  id: string;
  question: string;
  description: string;
  end_date_iso: string;
  active: boolean;
  outcome_prices: string[];
  volume: string;
  liquidity: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting market data fetch...');

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch from Kalshi API (using public events endpoint)
    console.log('Fetching Kalshi markets...');
    let kalshiMarkets: any[] = [];
    try {
      const kalshiResponse = await fetch('https://api.elections.kalshi.com/trade-api/v2/events', {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (kalshiResponse.ok) {
        const kalshiData = await kalshiResponse.json();
        kalshiMarkets = kalshiData.events?.slice(0, 10) || [];
        console.log(`Fetched ${kalshiMarkets.length} Kalshi markets`);
      } else {
        console.warn('Kalshi API returned non-OK status:', kalshiResponse.status);
      }
    } catch (error) {
      console.error('Error fetching Kalshi data:', error);
    }

    // Fetch from Polymarket API (using public CLOB API)
    console.log('Fetching Polymarket markets...');
    let polymarkets: any[] = [];
    try {
      const polyResponse = await fetch('https://clob.polymarket.com/markets', {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (polyResponse.ok) {
        const polyData = await polyResponse.json();
        polymarkets = polyData.slice(0, 10) || [];
        console.log(`Fetched ${polymarkets.length} Polymarket markets`);
      } else {
        console.warn('Polymarket API returned non-OK status:', polyResponse.status);
      }
    } catch (error) {
      console.error('Error fetching Polymarket data:', error);
    }

    // Process and store Kalshi markets
    for (const market of kalshiMarkets) {
      try {
        const marketId = `kalshi-${market.event_ticker || market.ticker}`;
        
        // Upsert market
        const { data: existingMarket, error: selectError } = await supabaseClient
          .from('markets')
          .select('id')
          .eq('market_id', marketId)
          .maybeSingle();

        if (selectError) {
          console.error('Error checking existing market:', selectError);
          continue;
        }

        let dbMarketId: string;

        if (existingMarket) {
          dbMarketId = existingMarket.id;
          await supabaseClient
            .from('markets')
            .update({
              title: market.title || market.event_ticker,
              category: market.category || 'general',
              status: market.status || 'active',
              updated_at: new Date().toISOString(),
            })
            .eq('id', dbMarketId);
        } else {
          const { data: newMarket, error: insertError } = await supabaseClient
            .from('markets')
            .insert({
              market_id: marketId,
              source: 'kalshi',
              title: market.title || market.event_ticker,
              description: market.subtitle || '',
              category: market.category || 'general',
              end_date: market.close_time,
              status: market.status || 'active',
            })
            .select('id')
            .single();

          if (insertError) {
            console.error('Error inserting Kalshi market:', insertError);
            continue;
          }
          dbMarketId = newMarket.id;
        }

        // Insert market data snapshot
        const yesPrice = market.yes_ask || 0.5;
        await supabaseClient.from('market_data').insert({
          market_id: dbMarketId,
          yes_price: yesPrice,
          no_price: 1 - yesPrice,
          volume_24h: market.volume || 0,
          liquidity: market.open_interest || 0,
          trades_24h: Math.floor(Math.random() * 1000), // Mock data
          volatility: Math.random() * 100,
        });

        console.log(`Processed Kalshi market: ${marketId}`);
      } catch (error) {
        console.error('Error processing Kalshi market:', error);
      }
    }

    // Process and store Polymarket markets
    for (const market of polymarkets) {
      try {
        const marketId = `polymarket-${market.condition_id || market.id}`;
        
        // Upsert market
        const { data: existingMarket, error: selectError } = await supabaseClient
          .from('markets')
          .select('id')
          .eq('market_id', marketId)
          .maybeSingle();

        if (selectError) {
          console.error('Error checking existing market:', selectError);
          continue;
        }

        let dbMarketId: string;

        if (existingMarket) {
          dbMarketId = existingMarket.id;
          await supabaseClient
            .from('markets')
            .update({
              title: market.question,
              description: market.description || '',
              status: market.active ? 'active' : 'closed',
              updated_at: new Date().toISOString(),
            })
            .eq('id', dbMarketId);
        } else {
          const { data: newMarket, error: insertError } = await supabaseClient
            .from('markets')
            .insert({
              market_id: marketId,
              source: 'polymarket',
              title: market.question,
              description: market.description || '',
              category: market.tags?.[0] || 'general',
              end_date: market.end_date_iso,
              status: market.active ? 'active' : 'closed',
            })
            .select('id')
            .single();

          if (insertError) {
            console.error('Error inserting Polymarket market:', insertError);
            continue;
          }
          dbMarketId = newMarket.id;
        }

        // Insert market data snapshot
        const yesPrice = market.outcome_prices ? parseFloat(market.outcome_prices[0]) : 0.5;
        await supabaseClient.from('market_data').insert({
          market_id: dbMarketId,
          yes_price: yesPrice,
          no_price: 1 - yesPrice,
          volume_24h: parseFloat(market.volume || '0'),
          liquidity: parseFloat(market.liquidity || '0'),
          trades_24h: Math.floor(Math.random() * 1000), // Mock data
          volatility: Math.random() * 100,
        });

        console.log(`Processed Polymarket market: ${marketId}`);
      } catch (error) {
        console.error('Error processing Polymarket market:', error);
      }
    }

    console.log('Market data fetch completed successfully');

    return new Response(
      JSON.stringify({
        success: true,
        kalshiCount: kalshiMarkets.length,
        polymarketCount: polymarkets.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-markets function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
