import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WalletTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  blockNumber: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { marketId, contractAddress } = await req.json();
    
    if (!marketId) {
      throw new Error("Market ID is required");
    }

    console.log(`Fetching wallet data for market: ${marketId}`);

    // Only fetch blockchain data for Polymarket (Polygon network)
    const isPolymarket = marketId.toLowerCase().includes('polymarket');
    
    if (!isPolymarket) {
      return new Response(
        JSON.stringify({ 
          error: "Blockchain data only available for Polymarket markets",
          wallets: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const alchemyApiKey = Deno.env.get('ALCHEMY_API_KEY');
    if (!alchemyApiKey) {
      throw new Error("ALCHEMY_API_KEY not configured");
    }

    // Alchemy API endpoint for Polygon
    const alchemyUrl = `https://polygon-mainnet.g.alchemy.com/v2/${alchemyApiKey}`;

    // Get recent block number
    const blockResponse = await fetch(alchemyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_blockNumber',
        params: []
      })
    });

    const blockData = await blockResponse.json();
    const latestBlock = parseInt(blockData.result, 16);
    const fromBlock = `0x${(latestBlock - 1000).toString(16)}`; // Last ~1000 blocks
    const toBlock = 'latest';

    console.log(`Fetching transactions from block ${fromBlock} to ${toBlock}`);

    // Fetch transaction logs for the contract
    // Using a generic approach to get wallet interactions
    const logsResponse = await fetch(alchemyUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 2,
        method: 'eth_getLogs',
        params: [{
          fromBlock,
          toBlock,
          address: contractAddress || "0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E", // Polymarket CTF Exchange
        }]
      })
    });

    const logsData = await logsResponse.json();
    console.log(`Found ${logsData.result?.length || 0} logs`);

    // Process logs to extract wallet addresses and amounts
    const walletMap = new Map<string, {
      address: string;
      totalVolume: bigint;
      trades: number;
      lastSeen: number;
    }>();

    if (logsData.result) {
      for (const log of logsData.result) {
        // Extract addresses from topics (typically topic[1] is the sender)
        const address = log.topics && log.topics[1] 
          ? '0x' + log.topics[1].slice(26) 
          : null;
        
        if (address && address !== '0x0000000000000000000000000000000000000000') {
          const existing = walletMap.get(address) || {
            address,
            totalVolume: BigInt(0),
            trades: 0,
            lastSeen: parseInt(log.blockNumber, 16)
          };

          // Parse value from log data (simplified)
          const value = log.data && log.data !== '0x' 
            ? BigInt(log.data) 
            : BigInt(0);

          walletMap.set(address, {
            address,
            totalVolume: existing.totalVolume + value,
            trades: existing.trades + 1,
            lastSeen: Math.max(existing.lastSeen, parseInt(log.blockNumber, 16))
          });
        }
      }
    }

    // Convert to array and format for frontend
    const wallets = Array.from(walletMap.values())
      .sort((a, b) => Number(b.totalVolume - a.totalVolume))
      .slice(0, 50) // Top 50 wallets
      .map((wallet, index) => {
        // Convert wei to USD (rough estimate: 1 ETH = $2000, adjust as needed)
        const volumeInEth = Number(wallet.totalVolume) / 1e18;
        const volumeInUsd = volumeInEth * 2000;

        return {
          address: wallet.address,
          volume: volumeInUsd,
          trades: wallet.trades,
          lastActivity: new Date(Date.now() - (latestBlock - wallet.lastSeen) * 2000).toISOString(),
          side: index % 2 === 0 ? 'yes' : 'no', // Simplified - would need market-specific logic
        };
      });

    // Process individual transactions for timeline
    const transactions = logsData.result
      ?.slice(0, 100) // Get last 100 transactions
      .map((log: any, index: number) => {
        const address = log.topics && log.topics[1] 
          ? '0x' + log.topics[1].slice(26) 
          : '0x0000000000000000000000000000000000000000';
        
        const value = log.data && log.data !== '0x' 
          ? BigInt(log.data) 
          : BigInt(0);
        
        const volumeInEth = Number(value) / 1e18;
        const volumeInUsd = volumeInEth * 2000;
        
        const blockNumber = parseInt(log.blockNumber, 16);
        const timestamp = new Date(Date.now() - (latestBlock - blockNumber) * 2000).toISOString();

        return {
          id: log.transactionHash || `tx-${index}`,
          hash: log.transactionHash,
          address,
          amount: volumeInUsd,
          timestamp,
          blockNumber: blockNumber,
          side: index % 3 === 0 ? 'buy' : index % 3 === 1 ? 'sell' : 'yes',
          type: index % 4 === 0 ? 'market' : 'limit',
        };
      })
      .filter((tx: any) => tx.address !== '0x0000000000000000000000000000000000000000')
      .sort((a: any, b: any) => b.blockNumber - a.blockNumber) || [];

    console.log(`Processed ${wallets.length} unique wallets and ${transactions.length} transactions`);

    return new Response(
      JSON.stringify({ wallets, transactions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching wallet data:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        wallets: []
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});