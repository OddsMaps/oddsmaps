// Direct API calls to Polymarket using CORS proxy

interface PolymarketMarket {
  condition_id?: string;
  conditionId?: string;
  id?: string;
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
  volumeClob?: string | number;
  volume24hrClob?: string | number;
  liquidity?: string | number;
  liquidityClob?: string | number;
  outcomePrices?: string;
  lastTradePrice?: string | number;
  trades24hr?: string | number;
}

interface PolymarketTrade {
  proxyWallet: string;
  side: "BUY" | "SELL";
  asset: string;
  conditionId: string;
  size: number;
  price: number;
  timestamp: number;
  transactionHash: string;
  outcome: string;
  outcomeIndex: number;
}

function toNumber(v: unknown, fallback = 0): number {
  const n =
    typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : fallback;
}

function getYesNoPrices(m: PolymarketMarket, pricesMap: any) {
  let yes = 0.5;
  let no = 0.5;

  // Use outcomePrices if available (comma-separated string from Gamma API)
  if (m.outcomePrices) {
    const pricesStr = m.outcomePrices;
    if (typeof pricesStr === "string") {
      const parsed = pricesStr
        .split(",")
        .map((p: string) => parseFloat(p.trim()));
      if (parsed.length >= 2 && !isNaN(parsed[0]) && !isNaN(parsed[1])) {
        yes = parsed[0];
        no = parsed[1];
        return { yes_price: yes, no_price: no };
      }
    }
  }

  // Try lastTradePrice if available
  const lastPrice = toNumber(m.lastTradePrice);
  if (lastPrice > 0 && lastPrice < 1) {
    yes = lastPrice;
    no = 1 - lastPrice;
    return { yes_price: yes, no_price: no };
  }

  return { yes_price: yes, no_price: no };
}

export interface Market {
  id: string;
  market_id: string;
  source: string;
  title: string;
  description: string | null;
  category: string | null;
  end_date: string | null;
  status: string;
  yes_price: number;
  no_price: number;
  total_volume: number;
  volume_24h: number;
  liquidity: number;
  trades_24h: number;
  volatility: number;
  last_updated: string;
}

export interface Transaction {
  id: string;
  hash: string;
  address: string;
  amount: number;
  price: number;
  timestamp: string;
  blockNumber: number;
  side: "yes" | "no";
  type: "market" | "limit";
  transaction_hash?: string;
  wallet_address?: string;
  transaction_type?: string;
}

/**
 * Helper to fetch with CORS proxy
 * Uses proxy services since Polymarket APIs block direct browser requests
 */
async function fetchWithProxy(url: string, retries = 1): Promise<Response> {
  // Use corsproxy.io - the only working proxy
  const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout
  
  try {
    const response = await fetch(proxyUrl, {
      headers: { 
        Accept: "application/json",
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    // If timeout error (408), retry once if we have retries left
    if (response.status === 408 && retries > 0) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
      return fetchWithProxy(url, retries - 1);
    }
    
    // Return response even if not ok - let caller handle it
    // This allows graceful degradation (e.g., continue without prices)
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      // Retry once if we have retries left
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return fetchWithProxy(url, retries - 1);
      }
      throw new Error("Proxy request timed out after 15 seconds");
    }
    throw error;
  }
}

/**
 * Alternative: Fetch from The Graph Subgraph (GraphQL)
 * This is more reliable than CORS proxies and provides indexed blockchain data
 * 
 * To use: Get API key from https://thegraph.com/studio/
 * Free tier: 100k queries/month
 */
async function fetchFromTheGraph(query: string, variables?: any): Promise<any> {
  // You'll need to get an API key from The Graph Studio
  // For now, we'll use the public endpoint (may have rate limits)
  const THE_GRAPH_ENDPOINT = "https://api.thegraph.com/subgraphs/name/polymarket/polymarket";
  
  // Alternative: Use hosted service endpoint if available
  // const THE_GRAPH_ENDPOINT = "https://gateway.thegraph.com/api/[YOUR_API_KEY]/subgraphs/id/[SUBGRAPH_ID]";
  
  try {
    const response = await fetch(THE_GRAPH_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      throw new Error(`The Graph API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(result.errors)}`);
    }

    return result.data;
  } catch (error) {
    console.error("The Graph fetch error:", error);
    throw error;
  }
}

/**
 * Fetch markets directly from Polymarket API
 */
export async function fetchMarkets(
  source?: string,
  category?: string,
  limit = 200
): Promise<Market[]> {
  // Only support Polymarket for now
  if (source && source !== "polymarket") {
    return [];
  }

  const finalLimit = Math.min(limit, 200);

  try {
    // Fetch from Gamma API for market metadata
    const gammaUrl =
      "https://gamma-api.polymarket.com/markets?limit=200&active=true&closed=false&order=volume24hr&ascending=false";
    const gammaResp = await fetchWithProxy(gammaUrl);

    if (!gammaResp.ok) {
      throw new Error("Gamma API failed: " + gammaResp.status);
    }

    let g: any;
    try {
      const text = await gammaResp.text();
      g = JSON.parse(text);
    } catch {
      // If already parsed or different format, try json() again
      const cloned = gammaResp.clone();
      g = await cloned.json();
    }
    const marketsRaw: PolymarketMarket[] = Array.isArray(g)
      ? g
      : Array.isArray((g as any)?.data)
      ? (g as any).data
      : Array.isArray((g as any)?.markets)
      ? (g as any).markets
      : [];

    if (!marketsRaw || marketsRaw.length === 0) {
      return [];
    }

    // Skip CLOB prices API - markets already have outcomePrices from Gamma API
    // The CLOB /prices endpoint doesn't work well with the proxy
    // We use outcomePrices from Gamma API instead (which is already in the market data)
    const pricesMap: any = {};

    // Process markets
    let processed = marketsRaw
      .filter((m) => {
        const vol24h = toNumber(m.volume24hr ?? m.volume24hrClob);
        const isActive = m.closed !== true && m.active === true && vol24h > 0;

        // Filter by category if specified
        if (category) {
          const marketCategory =
            m.category || (m.tags && m.tags[0]) || "General";
          return (
            isActive && marketCategory.toLowerCase() === category.toLowerCase()
          );
        }

        return isActive;
      })
      .slice(0, finalLimit)
      .map((m) => {
        const conditionId = m.condition_id || m.conditionId || m.id || "";
        const title = m.question || m.title || m.name || "Polymarket Market";
        const description = m.description || "";
        const marketCategory = m.category || (m.tags && m.tags[0]) || "General";

        const endRaw = m.end_date_iso || m.endDate || m.endTime;
        const endDate = endRaw ? new Date(endRaw as any).toISOString() : null;

        const { yes_price, no_price } = getYesNoPrices(m, pricesMap);
        const totalVolume = toNumber(
          m.volumeClob ?? (m as any).volumeNum ?? m.volume,
          0
        );
        const volume_24h = toNumber(m.volume24hrClob ?? m.volume24hr, 0);
        const liquidity = toNumber(
          m.liquidityClob ?? (m as any).liquidityNum ?? m.liquidity,
          0
        );
        const trades_24h = toNumber(m.trades24hr, 0);
        const volatility = Math.abs(yes_price - 0.5) * 100;

        return {
          id: `polymarket-${conditionId}`,
          market_id: `polymarket-${conditionId}`,
          source: "polymarket",
          title,
          description,
          category: marketCategory,
          end_date: endDate,
          status: "active",
          yes_price,
          no_price,
          total_volume: totalVolume,
          volume_24h,
          liquidity,
          trades_24h,
          volatility,
          last_updated: new Date().toISOString(),
        };
      });

    return processed;
  } catch (error) {
    console.error("Error fetching markets:", error);
    // Return empty array instead of throwing to prevent UI breakage
    return [];
  }
}

/**
 * Fetch transactions directly from Polymarket API using CORS proxy
 */
export async function fetchMarketTransactions(
  marketId: string,
  limit = 100
): Promise<Transaction[]> {
  try {
    // Extract condition ID from market_id (format: polymarket-{conditionId})
    const conditionId = marketId.replace("polymarket-", "");
    const finalLimit = Math.min(limit, 100);
    
    // Reduce limit to avoid timeout (proxy can be slow)
    const safeLimit = Math.min(finalLimit, 100);

    // Fetch trades directly from Polymarket API (with CORS proxy fallback)
    const tradesUrl = `https://data-api.polymarket.com/trades?market=${conditionId}&limit=${safeLimit}&takerOnly=false`;
    const tradesResponse = await fetchWithProxy(tradesUrl);

    if (!tradesResponse.ok) {
      console.error(`Failed to fetch trades: ${tradesResponse.status}`);
      return [];
    }

    const trades: PolymarketTrade[] = await tradesResponse.json();

    // Transform trades to match our transaction format
    const transactions = trades.map((trade) => {
      const side =
        trade.side === "BUY"
          ? trade.outcome.toLowerCase() === "yes"
            ? "yes"
            : "no"
          : trade.outcome.toLowerCase() === "yes"
          ? "no"
          : "yes";

      return {
        id: trade.transactionHash + "-" + trade.timestamp,
        hash: trade.transactionHash,
        address: trade.proxyWallet,
        amount: trade.size,
        price: trade.price,
        timestamp: new Date(trade.timestamp * 1000).toISOString(),
        blockNumber: 0,
        side: side as "yes" | "no",
        type: "market" as const,
        transaction_hash: trade.transactionHash,
        wallet_address: trade.proxyWallet,
        transaction_type: "market",
      };
    });

    // Sort by timestamp descending (most recent first)
    transactions.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return transactions;
  } catch (err: any) {
    // If fetch fails, log and return empty array instead of crashing
    if (err.message?.includes("timeout") || err.message?.includes("Timeout")) {
      console.warn(`Timeout fetching transactions for market ${marketId}, returning empty array`);
      return [];
    }
    console.error(`Error fetching transactions for market ${marketId}:`, err);
    return [];
  }
}

/**
 * Fetch wallet profile data directly from Polymarket API
 * Aggregates transactions across all markets for a specific wallet
 */
export async function fetchWalletProfile(walletAddress: string): Promise<{
  profile: {
    wallet_address: string;
    total_volume: number;
    total_trades: number;
    total_markets: number;
    total_pnl: number;
    win_rate: number;
    first_seen: string;
    last_seen: string;
  };
  positions: Array<{
    id: string;
    side: 'yes' | 'no';
    position_size: number;
    avg_entry_price: number;
    current_price: number;
    pnl: number;
    trades_count: number;
    status: string;
    opened_at: string;
    markets: {
      id: string;
      title: string;
      source: string;
      category: string;
      status: string;
    };
  }>;
  transactions: Array<{
    id: string;
    transaction_hash: string;
    side: string;
    amount: number;
    price: number;
    transaction_type: string;
    timestamp: string;
    markets: {
      id: string;
      market_id: string;
      title: string;
      source: string;
    };
  }>;
  stats: {
    totalPnL: number;
    winRate: number;
    winningTrades: number;
    losingTrades: number;
  };
}> {
  try {
    // Get markets - limit to top 50 by volume to avoid too many requests
    const allMarkets = await fetchMarkets('polymarket');
    const markets = allMarkets.slice(0, 50); // Only process top 50 markets
    
    // Fetch transactions from markets for this wallet
    const allTransactions: Transaction[] = [];
    const walletLower = walletAddress.toLowerCase();
    
    // Process markets sequentially with delays to avoid proxy timeouts
    // Limit to 30 markets max to prevent excessive load
    const maxMarkets = Math.min(markets.length, 30);
    for (let i = 0; i < maxMarkets; i++) {
      const market = markets[i];
      
      try {
        // Reduce limit per market to avoid timeouts (100 instead of 500)
        const transactions = await fetchMarketTransactions(market.market_id, 100);
        const walletTransactions = transactions.filter(tx => 
          (tx.address || tx.wallet_address || '').toLowerCase() === walletLower
        );
        
        if (walletTransactions.length > 0) {
          // Store market info with transactions for later matching
          walletTransactions.forEach(tx => {
            (tx as any).marketId = market.market_id;
            (tx as any).market = market;
          });
          allTransactions.push(...walletTransactions);
        }
        
        // Add delay between requests to avoid overwhelming the proxy
        if (i < maxMarkets - 1) {
          await new Promise(resolve => setTimeout(resolve, 500)); // 500ms delay
        }
      } catch (error) {
        console.warn(`Failed to fetch transactions for market ${market.market_id}:`, error);
        // Continue to next market instead of failing completely
        continue;
      }
      
      // Stop early if we have enough transactions
      if (allTransactions.length >= 200) {
        break;
      }
    }

    if (allTransactions.length === 0) {
      // Return empty profile if no transactions found
      return {
        profile: {
          wallet_address: walletAddress,
          total_volume: 0,
          total_trades: 0,
          total_markets: 0,
          total_pnl: 0,
          win_rate: 0,
          first_seen: new Date().toISOString(),
          last_seen: new Date().toISOString(),
        },
        positions: [],
        transactions: [],
        stats: {
          totalPnL: 0,
          winRate: 0,
          winningTrades: 0,
          losingTrades: 0,
        },
      };
    }

    // Sort transactions by timestamp
    allTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Calculate profile stats
    const totalVolume = allTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    const totalTrades = allTransactions.length;
    
    // Group by market_id (we stored it in the transaction)
    const marketMap = new Map<string, Market>();
    markets.forEach(m => marketMap.set(m.market_id, m));
    
    const transactionsByMarket = new Map<string, Transaction[]>();
    allTransactions.forEach(tx => {
      // Use stored marketId from transaction
      const marketId = (tx as any).marketId || '';
      const market = (tx as any).market;
      
      if (marketId && market) {
        if (!transactionsByMarket.has(marketId)) {
          transactionsByMarket.set(marketId, []);
        }
        transactionsByMarket.get(marketId)!.push(tx);
      }
    });

    const uniqueMarkets = transactionsByMarket.size;

    const firstSeen = allTransactions[allTransactions.length - 1]?.timestamp || new Date().toISOString();
    const lastSeen = allTransactions[0]?.timestamp || new Date().toISOString();

    // Calculate positions
    const positions: any[] = [];
    transactionsByMarket.forEach((txs, marketId) => {
      const market = marketMap.get(marketId);
      if (!market) return;

      // Calculate position for this market
      let yesVolume = 0;
      let noVolume = 0;
      let yesCost = 0;
      let noCost = 0;
      let yesTrades = 0;
      let noTrades = 0;

      txs.forEach(tx => {
        if (tx.side === 'yes') {
          yesVolume += tx.amount;
          yesCost += tx.amount * tx.price;
          yesTrades++;
        } else {
          noVolume += tx.amount;
          noCost += tx.amount * tx.price;
          noTrades++;
        }
      });

      const yesAvgPrice = yesVolume > 0 ? yesCost / yesVolume : 0;
      const noAvgPrice = noVolume > 0 ? noCost / noVolume : 0;
      const yesPnL = yesVolume > 0 ? (market.yes_price - yesAvgPrice) * yesVolume : 0;
      const noPnL = noVolume > 0 ? (market.no_price - noAvgPrice) * noVolume : 0;

      if (yesVolume > 0) {
        positions.push({
          id: `${marketId}-yes`,
          side: 'yes' as const,
          position_size: yesVolume,
          avg_entry_price: yesAvgPrice,
          current_price: market.yes_price,
          pnl: yesPnL,
          trades_count: yesTrades,
          status: 'active',
          opened_at: txs[txs.length - 1]?.timestamp || new Date().toISOString(),
          markets: {
            id: market.id,
            title: market.title,
            source: market.source,
            category: market.category || 'General',
            status: market.status,
          },
        });
      }

      if (noVolume > 0) {
        positions.push({
          id: `${marketId}-no`,
          side: 'no' as const,
          position_size: noVolume,
          avg_entry_price: noAvgPrice,
          current_price: market.no_price,
          pnl: noPnL,
          trades_count: noTrades,
          status: 'active',
          opened_at: txs[txs.length - 1]?.timestamp || new Date().toISOString(),
          markets: {
            id: market.id,
            title: market.title,
            source: market.source,
            category: market.category || 'General',
            status: market.status,
          },
        });
      }
    });

    // Calculate P&L and win rate
    const totalPnL = positions.reduce((sum, pos) => sum + pos.pnl, 0);
    const winningTrades = positions.filter(pos => pos.pnl > 0).length;
    const losingTrades = positions.filter(pos => pos.pnl < 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;

    // Format transactions with market info
    const formattedTransactions = allTransactions.slice(0, 100).map(tx => {
      // Use stored market from transaction
      const market: Market | undefined = (tx as any).market;

      return {
        id: tx.id,
        transaction_hash: tx.hash || tx.transaction_hash || '',
        side: tx.side,
        amount: tx.amount,
        price: tx.price,
        transaction_type: tx.type || 'market',
        timestamp: tx.timestamp,
        markets: {
          id: market?.id || '',
          market_id: market?.market_id || '',
          title: market?.title || 'Unknown Market',
          source: market?.source || 'polymarket',
        },
      };
    });

    return {
      profile: {
        wallet_address: walletAddress,
        total_volume: totalVolume,
        total_trades: totalTrades,
        total_markets: uniqueMarkets,
        total_pnl: totalPnL,
        win_rate: winRate,
        first_seen: firstSeen,
        last_seen: lastSeen,
      },
      positions,
      transactions: formattedTransactions,
      stats: {
        totalPnL,
        winRate,
        winningTrades,
        losingTrades,
      },
    };
  } catch (error) {
    console.error('Error fetching wallet profile:', error);
    throw error;
  }
}
