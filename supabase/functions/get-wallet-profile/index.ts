import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { walletAddress } = await req.json();
    
    if (!walletAddress) {
      throw new Error("Wallet address is required");
    }

    console.log(`Fetching profile for wallet: ${walletAddress}`);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch wallet profile
    const { data: profile } = await supabase
      .from('wallet_profiles')
      .select('*')
      .eq('wallet_address', walletAddress)
      .maybeSingle();

    // Fetch active positions with market details
    const { data: positions } = await supabase
      .from('wallet_positions')
      .select(`
        *,
        markets (
          id,
          title,
          source,
          category,
          status,
          yes_price,
          no_price
        )
      `)
      .eq('wallet_address', walletAddress)
      .order('opened_at', { ascending: false });

    // Fetch transaction history
    const { data: transactions } = await supabase
      .from('wallet_transactions')
      .select(`
        *,
        markets (
          id,
          market_id,
          title,
          source
        )
      `)
      .eq('wallet_address', walletAddress)
      .order('timestamp', { ascending: false })
      .limit(100);

    // If no profile exists, create mock data based on transactions
    let profileData = profile;
    if (!profileData && transactions && transactions.length > 0) {
      const totalVolume = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
      const uniqueMarkets = new Set(transactions.map(tx => tx.market_id)).size;
      
      profileData = {
        wallet_address: walletAddress,
        total_volume: totalVolume,
        total_trades: transactions.length,
        total_markets: uniqueMarkets,
        total_pnl: 0,
        win_rate: 0,
        first_seen: transactions[transactions.length - 1]?.timestamp || new Date().toISOString(),
        last_seen: transactions[0]?.timestamp || new Date().toISOString(),
      };
    }

    // Calculate P&L for positions
    const positionsWithPnL = positions?.map(pos => {
      const currentPrice = pos.side === 'yes' 
        ? pos.markets?.yes_price || 0.5 
        : pos.markets?.no_price || 0.5;
      
      const pnl = (currentPrice - pos.avg_entry_price) * pos.position_size;
      
      return {
        ...pos,
        current_price: currentPrice,
        pnl,
      };
    }) || [];

    // Calculate aggregate stats
    const totalPnL = positionsWithPnL.reduce((sum, pos) => sum + Number(pos.pnl), 0);
    const winningTrades = positionsWithPnL.filter(pos => Number(pos.pnl) > 0).length;
    const totalPositions = positionsWithPnL.length;
    const winRate = totalPositions > 0 ? (winningTrades / totalPositions) * 100 : 0;

    // Get P&L history (aggregate by day)
    const pnlHistory = transactions
      ?.reduce((acc: any[], tx) => {
        const date = new Date(tx.timestamp).toISOString().split('T')[0];
        const existing = acc.find(item => item.date === date);
        
        if (existing) {
          existing.volume += Number(tx.amount);
          existing.trades += 1;
        } else {
          acc.push({
            date,
            volume: Number(tx.amount),
            trades: 1,
            pnl: 0, // Simplified - would need market outcome data
          });
        }
        
        return acc;
      }, [])
      .sort((a, b) => a.date.localeCompare(b.date)) || [];

    return new Response(
      JSON.stringify({
        profile: profileData || {
          wallet_address: walletAddress,
          total_volume: 0,
          total_trades: 0,
          total_markets: 0,
          total_pnl: totalPnL,
          win_rate: winRate,
          first_seen: new Date().toISOString(),
          last_seen: new Date().toISOString(),
        },
        positions: positionsWithPnL,
        transactions: transactions || [],
        pnlHistory,
        stats: {
          totalPnL,
          winRate,
          totalPositions,
          winningTrades,
          losingTrades: totalPositions - winningTrades,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching wallet profile:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});