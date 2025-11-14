import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Flexible type to handle different market shapes from Polymarket APIs
interface AnyMarket {
  id?: string;
  condition_id?: string; // snake_case
  conditionId?: string;  // camelCase
  question?: string;
  title?: string;
  name?: string;
  description?: string;
  category?: string;
  tags?: string[];
  active?: boolean;
  closed?: boolean;
  end_date_iso?: string;
  endDate?: string | number;
  endTime?: string | number;
  volume?: string | number;
  volume24hr?: string | number;
  liquidity?: string | number;
  outcomes?: Array<{ name?: string; price?: string | number }>;
  tokens?: Array<{ outcome?: string; price?: string | number }>;
}

function toNumber(v: unknown, fallback = 0): number {
  const n = typeof v === 'string' ? parseFloat(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function getYesNoPrices(m: AnyMarket) {
  let yes = 0.5;
  let no = 0.5;

  // Gamma API format - outcomePrices is a comma-separated string
  if ((m as any).outcomePrices) {
    const pricesStr = (m as any).outcomePrices;
    if (typeof pricesStr === 'string') {
      const parsed = pricesStr.split(',').map((p: string) => parseFloat(p.trim()));
      if (parsed.length >= 2 && !isNaN(parsed[0]) && !isNaN(parsed[1])) {
        yes = parsed[0];
        no = parsed[1];
        return { yes_price: yes, no_price: no };
      }
    }
  }

  // CLOB API format - tokens array with outcome and price
  const tokens = m.tokens || [];
  const fromTokensYes = tokens.find(t => (t.outcome || '').toLowerCase() === 'yes');
  const fromTokensNo = tokens.find(t => (t.outcome || '').toLowerCase() === 'no');
  if (fromTokensYes?.price) yes = toNumber(fromTokensYes.price, yes);
  if (fromTokensNo?.price) no = toNumber(fromTokensNo.price, no);

  // Fallback: outcomes array
  const outcomes = m.outcomes || [];
  if (yes === 0.5 && no === 0.5 && outcomes.length >= 2) {
    yes = toNumber(outcomes[0]?.price, yes);
    no = toNumber(outcomes[1]?.price, no);
  }

  return { yes_price: yes, no_price: no };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Fetching markets from Polymarket CLOB API...');

    // Prefer CLOB markets endpoint; fall back to gamma if needed
    const clobResp = await fetch('https://clob.polymarket.com/markets?limit=200', {
      headers: { Accept: 'application/json' },
    });

    let marketsRaw: AnyMarket[] = [];

    if (clobResp.ok) {
      const body = await clobResp.json();
      marketsRaw = Array.isArray(body) ? body : Array.isArray((body as any)?.markets) ? (body as any).markets : [];
      console.log('CLOB markets fetched:', marketsRaw.length);
    }

    // Fallback to gamma if CLOB returned none or failed
    if (!clobResp.ok || marketsRaw.length === 0) {
      console.log('Falling back to Gamma markets API...');
      const gammaResp = await fetch('https://gamma-api.polymarket.com/markets?limit=200&active=true&closed=false&archived=false', {
        headers: { Accept: 'application/json' },
      });
      if (!gammaResp.ok) throw new Error('Gamma API failed: ' + gammaResp.status);
      const g = await gammaResp.json();
      marketsRaw = Array.isArray(g)
        ? g
        : Array.isArray((g as any)?.data)
        ? (g as any).data
        : Array.isArray((g as any)?.markets)
        ? (g as any).markets
        : [];
      console.log('Gamma markets fetched:', marketsRaw.length);
    }

    if (!marketsRaw || marketsRaw.length === 0) {
      return new Response(
        JSON.stringify({ success: true, processed: 0, message: 'No markets returned from Polymarket' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Log first raw market to understand structure
    if (marketsRaw.length > 0) {
      console.log('Sample raw market structure:', JSON.stringify(marketsRaw[0], null, 2));
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Very permissive include: exclude only explicitly closed if present
    const processed = marketsRaw
      .filter((m) => m.closed !== true)
      .slice(0, 200)
      .map((m) => {
        const conditionId = m.condition_id || m.conditionId || m.id || '';
        const title = m.question || m.title || m.name || 'Polymarket Market';
        const description = m.description || '';
        const category = m.category || (m.tags && m.tags[0]) || 'General';

        const endRaw = m.end_date_iso || m.endDate || m.endTime;
        const endDate = endRaw ? new Date(endRaw as any).toISOString() : null;

        const { yes_price, no_price } = getYesNoPrices(m);
        // Use total CLOB volume (most accurate) or fall back to total volume or volumeNum
        const totalVolume = toNumber((m as any).volumeClob ?? (m as any).volumeNum ?? (m as any).volume, 0);
        const volume_24h = toNumber((m as any).volume24hrClob ?? (m as any).volume24hr, 0);
        const liquidity = toNumber((m as any).liquidityClob ?? (m as any).liquidityNum ?? (m as any).liquidity, 0);
        const trades_24h = toNumber((m as any).trades24hr, 0);
        const volatility = Math.abs(yes_price - 0.5) * 100;

        return {
          market_id: `polymarket-${conditionId}`,
          source: 'polymarket',
          title,
          description,
          category,
          end_date: endDate,
          status: 'active',
          yes_price,
          no_price,
          total_volume: totalVolume,
          volume_24h,
          liquidity,
          trades_24h,
          volatility,
        };
      });

    // Log first 3 markets' volume data for debugging
    console.log('Sample market data from first 3 markets:');
    processed.slice(0, 3).forEach((m, i) => {
      console.log(`  Market ${i + 1}: ${m.title.substring(0, 40)}...`);
      console.log(`    prices: yes=${m.yes_price}, no=${m.no_price}`);
      console.log(`    total_volume: ${m.total_volume}, volume_24h: ${m.volume_24h}`);
    });

    let upserts = 0;

    for (const m of processed) {
      if (!m.market_id || m.market_id === 'polymarket-') continue;

      // Find existing market
      const { data: existing } = await supabase
        .from('markets')
        .select('id')
        .eq('market_id', m.market_id)
        .single();

      if (existing) {
        // Update core info
        await supabase
          .from('markets')
          .update({
            title: m.title,
            description: m.description,
            category: m.category,
            end_date: m.end_date,
            status: m.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        // Insert a new data snapshot
        await supabase.from('market_data').insert({
          market_id: existing.id,
          yes_price: m.yes_price,
          no_price: m.no_price,
          total_volume: m.total_volume,
          volume_24h: m.volume_24h,
          liquidity: m.liquidity,
          trades_24h: m.trades_24h,
          volatility: m.volatility,
        });
      } else {
        // Insert market then snapshot
        const { data: newM, error: marketErr } = await supabase
          .from('markets')
          .insert({
            market_id: m.market_id,
            source: m.source,
            title: m.title,
            description: m.description,
            category: m.category,
            end_date: m.end_date,
            status: m.status,
          })
          .select()
          .single();

        if (marketErr || !newM) continue;

        await supabase.from('market_data').insert({
          market_id: newM.id,
          yes_price: m.yes_price,
          no_price: m.no_price,
          total_volume: m.total_volume,
          volume_24h: m.volume_24h,
          liquidity: m.liquidity,
          trades_24h: m.trades_24h,
          volatility: m.volatility,
        });
      }

      upserts++;
    }

    console.log('Polymarket markets upserts:', upserts);

    return new Response(
      JSON.stringify({ success: true, processed: upserts, message: 'Polymarket markets synced' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in fetch-polymarket-markets:', error);
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
