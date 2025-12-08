
// Configuration - Use Etherscan API V2 (unified multichain API)
// Get your API key from https://etherscan.io/apis (works for all chains including Polygon)
// In Vite, use import.meta.env instead of process.env
// Read dynamically to ensure it's available at runtime
const getPolygonScanApiKey = () => import.meta.env.VITE_POLYGONSCAN_API_KEY || "";
// Etherscan API V2 unified endpoint - supports Polygon with chainid=137
const ETHERSCAN_API_V2_URL = "https://api.etherscan.io/v2/api";
const POLYGON_CHAIN_ID = "137"; // Polygon mainnet chain ID

// Known Polymarket contract addresses on Polygon
const POLYMARKET_CONTRACTS = [
  "0x4bfb41d5b3570df0d1fc1563c4c89b227fb3d4cf", // Polymarket CLOB
  "0x89c5cc945dd550bcffb72e42c0e6e52f8a3f5c0e", // Polymarket Conditional Tokens
  "0x4d97dcd97ec945f40cf65f87097ace5ea0476045", // Polymarket CLOB Proxy (found in transaction data)
  "0xa238cbeb142c10ef7ad8442c6d1f9e89e07e7761", // Polymarket contract (found in transaction data)
  "0xbbbfd134e9b44bfb5123898ba36b01de7ab93d98", // Polymarket contract (found in transaction data)
];

// USDC on Polygon (used by Polymarket)
const USDC_POLYGON = "0x2791bca1f2de4661ed88a30c99a7a9449aa84174";

// Helper to check if a transaction interacts with Polymarket contracts
function isPolymarketTransaction(tx: PolygonScanTransaction): boolean {
  // Direct interaction with Polymarket contracts
  const directInteraction = POLYMARKET_CONTRACTS.some(
    (contract) =>
      tx.to?.toLowerCase() === contract.toLowerCase() ||
      tx.contractAddress?.toLowerCase() === contract.toLowerCase()
  );

  // Check if transaction data contains Polymarket contract addresses
  const inputData = tx.input?.toLowerCase() || "";
  const hasPolymarketInData = POLYMARKET_CONTRACTS.some((contract) =>
    inputData.includes(contract.toLowerCase().slice(2)) // Remove 0x prefix
  );

  // Check for USDC transfers (Polymarket uses USDC)
  const hasUSDC = inputData.includes(USDC_POLYGON.toLowerCase().slice(2));

  return directInteraction || hasPolymarketInData || hasUSDC;
}

interface PolygonScanTransaction {
  blockNumber: string;
  timeStamp: string;
  hash: string;
  from: string;
  to: string;
  value: string;
  contractAddress: string;
  input: string;
  type: string;
  gas: string;
  gasUsed: string;
  isError: string;
  errCode: string;
}

interface PolygonScanResponse {
  status: string;
  message: string;
  result: PolygonScanTransaction[] | string;
}

/**
 * Fetch transactions for a wallet address using PolygonScan API
 */
export async function fetchWalletTransactionsFromPolygon(
  walletAddress: string,
  startBlock = 0,
  endBlock = 99999999
): Promise<PolygonScanTransaction[]> {
  // Read API key dynamically
  const apiKey = getPolygonScanApiKey();
  
  if (!apiKey) {
    console.warn("Etherscan API key not configured. Set VITE_POLYGONSCAN_API_KEY in your .env file.");
    console.warn("Note: Use an Etherscan API key (from https://etherscan.io/apis) for API V2 multichain support.");
    console.warn("Current env value:", import.meta.env.VITE_POLYGONSCAN_API_KEY ? "exists but empty" : "not found");
    console.warn("All env vars:", Object.keys(import.meta.env).filter(k => k.includes('POLYGON')));
    throw new Error("Etherscan API key required for API V2");
  }

  try {
    // Etherscan API V2 format - use chainid=137 for Polygon
    const url = `${ETHERSCAN_API_V2_URL}?chainid=${POLYGON_CHAIN_ID}&module=account&action=txlist&address=${walletAddress}&startblock=${startBlock}&endblock=${endBlock}&sort=desc&apikey=${apiKey}`;
    
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error(`PolygonScan API HTTP error ${response.status}:`, errorText);
      throw new Error(`PolygonScan API error: ${response.status} - ${errorText.substring(0, 200)}`);
    }

    const data: PolygonScanResponse = await response.json();

    if (data.status === "0" || data.message !== "OK") {
      const errorMsg = typeof data.result === "string" ? data.result : data.message;
      console.error("PolygonScan API error:", errorMsg);
      throw new Error(`PolygonScan API error: ${errorMsg}`);
    }

    if (typeof data.result === "string") {
      // API returned error message as string
      throw new Error(`PolygonScan API error: ${data.result}`);
    }

    return data.result.filter((tx) => tx.isError === "0"); // Filter out failed transactions
  } catch (error) {
    console.error("Error fetching transactions from PolygonScan:", error);
    throw error;
  }
}

/**
 * Fetch ERC-20 token transfers for a wallet (includes Polymarket tokens)
 */
export async function fetchTokenTransfersFromPolygon(
  walletAddress: string,
  contractAddress?: string
): Promise<any[]> {
  // Read API key dynamically
  const apiKey = getPolygonScanApiKey();
  
  if (!apiKey) {
    console.warn("Etherscan API key not configured");
    throw new Error("Etherscan API key required for API V2");
  }

  try {
    // Etherscan API V2 format - use chainid=137 for Polygon
    let url = `${ETHERSCAN_API_V2_URL}?chainid=${POLYGON_CHAIN_ID}&module=account&action=tokentx&address=${walletAddress}&sort=desc&apikey=${apiKey}`;
    
    if (contractAddress) {
      url += `&contractaddress=${contractAddress}`;
    }

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`PolygonScan API error: ${response.status}`);
    }

    const data: PolygonScanResponse = await response.json();

    if (data.status === "0" || data.message !== "OK") {
      throw new Error(`PolygonScan API error: ${data.message}`);
    }

    if (typeof data.result === "string") {
      throw new Error(`PolygonScan API error: ${data.result}`);
    }

    return data.result;
  } catch (error) {
    console.error("Error fetching token transfers from PolygonScan:", error);
    throw error;
  }
}

/**
 * Filter transactions related to Polymarket contracts
 */
export function filterPolymarketTransactions(
  transactions: PolygonScanTransaction[]
): PolygonScanTransaction[] {
  return transactions.filter((tx) => isPolymarketTransaction(tx));
}

/**
 * Fetch wallet profile using only PolygonScan API
 * Converts PolygonScan transaction data to wallet profile format
 */
export async function fetchWalletProfileFromPolygon(
  walletAddress: string
): Promise<{
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
    side: "yes" | "no";
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
    // Fetch all transactions and token transfers
    // Focus more on token transfers as they're more relevant for Polymarket activity
    const [normalTransactions, tokenTransfers] = await Promise.all([
      fetchWalletTransactionsFromPolygon(walletAddress).catch(() => []),
      fetchTokenTransfersFromPolygon(walletAddress).catch(() => []),
    ]);

    // Filter Polymarket-related transactions from normal transactions
    const polymarketTxs = filterPolymarketTransactions(normalTransactions);
    
    // Filter token transfers related to Polymarket (USDC transfers are likely Polymarket trades)
    const polymarketTokenTransfers = tokenTransfers.filter((transfer: any) => {
      const tokenAddress = transfer.contractAddress?.toLowerCase() || transfer.tokenAddress?.toLowerCase() || "";
      // USDC is the main token used by Polymarket
      return tokenAddress === USDC_POLYGON.toLowerCase() || 
             POLYMARKET_CONTRACTS.some(c => tokenAddress === c.toLowerCase());
    });
    
    // Combine filtered transactions (prioritize token transfers as they're more relevant)
    const allTransactions = [...polymarketTokenTransfers, ...polymarketTxs];

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

    // Sort by timestamp (most recent first)
    allTransactions.sort((a, b) => {
      const timeA = parseInt(a.timeStamp || "0");
      const timeB = parseInt(b.timeStamp || "0");
      return timeB - timeA;
    });

    // Calculate basic stats
    const totalTrades = allTransactions.length;
    const totalVolume = allTransactions.reduce((sum, tx: any) => {
      // For token transfers, use token value; for normal transactions, use MATIC value
      if (tx.value && tx.tokenDecimal) {
        // Token transfer - convert using token decimals
        const decimals = parseInt(tx.tokenDecimal || "18");
        const value = parseFloat(tx.value || "0") / Math.pow(10, decimals);
        return sum + value;
      } else {
        // Normal transaction - convert from wei to MATIC (18 decimals)
        const value = parseFloat(tx.value || "0") / 1e18;
        return sum + value;
      }
    }, 0);

    // Get unique contracts/markets (we'll use contract addresses as market IDs)
    const uniqueMarkets = new Set(
      allTransactions
        .map((tx: any) => tx.to || tx.contractAddress || tx.tokenAddress || "")
        .filter((addr: string) => {
          if (!addr) return false;
          const addrLower = addr.toLowerCase();
          return POLYMARKET_CONTRACTS.includes(addrLower) || addrLower === USDC_POLYGON.toLowerCase();
        })
    );

    const firstSeen =
      allTransactions.length > 0
        ? new Date(parseInt(allTransactions[allTransactions.length - 1].timeStamp) * 1000).toISOString()
        : new Date().toISOString();
    const lastSeen =
      allTransactions.length > 0
        ? new Date(parseInt(allTransactions[0].timeStamp) * 1000).toISOString()
        : new Date().toISOString();

    // Format transactions
    const formattedTransactions = allTransactions.slice(0, 100).map((tx: any, index) => {
      // Handle both token transfers and normal transactions
      let value = 0;
      if (tx.value && tx.tokenDecimal) {
        // Token transfer
        const decimals = parseInt(tx.tokenDecimal || "18");
        value = parseFloat(tx.value || "0") / Math.pow(10, decimals);
      } else {
        // Normal transaction
        value = parseFloat(tx.value || "0") / 1e18;
      }
      
      const contractAddress = tx.to || tx.contractAddress || tx.tokenAddress || "";
      const isUSDC = contractAddress.toLowerCase() === USDC_POLYGON.toLowerCase();

      return {
        id: tx.hash || tx.transactionHash || `tx-${index}`,
        transaction_hash: tx.hash || tx.transactionHash || "",
        side: "yes", // Default - PolygonScan doesn't have this info
        amount: value,
        price: 0.5, // Default - PolygonScan doesn't have price info
        transaction_type: tx.type === "2" ? "market" : "limit",
        timestamp: new Date(parseInt(tx.timeStamp || tx.timestamp || "0") * 1000).toISOString(),
        markets: {
          id: contractAddress || "unknown",
          market_id: contractAddress || "unknown",
          title: isUSDC 
            ? "Polymarket Trade (USDC)" 
            : contractAddress 
            ? `Polymarket Contract ${contractAddress.slice(0, 8)}...`
            : "Polymarket Transaction",
          source: "polymarket",
        },
      };
    });

    // Group by contract to create positions (simplified)
    const positions: any[] = [];
    const contractsMap = new Map<string, any[]>();
    
    allTransactions.forEach((tx: any) => {
      const contract = tx.to || tx.contractAddress || tx.tokenAddress || "";
      const contractLower = contract.toLowerCase();
      
      // Include USDC transfers and Polymarket contracts
      if (contractLower === USDC_POLYGON.toLowerCase() || 
          POLYMARKET_CONTRACTS.some((c) => c.toLowerCase() === contractLower)) {
        if (!contractsMap.has(contract)) {
          contractsMap.set(contract, []);
        }
        contractsMap.get(contract)!.push(tx);
      }
    });

    contractsMap.forEach((txs, contract) => {
      const totalValue = txs.reduce((sum, tx: any) => {
        if (tx.value && tx.tokenDecimal) {
          // Token transfer
          const decimals = parseInt(tx.tokenDecimal || "18");
          return sum + parseFloat(tx.value || "0") / Math.pow(10, decimals);
        } else {
          // Normal transaction
          return sum + parseFloat(tx.value || "0") / 1e18;
        }
      }, 0);
      
      if (totalValue > 0) {
        const contractLower = contract.toLowerCase();
        const isUSDC = contractLower === USDC_POLYGON.toLowerCase();
        
        positions.push({
          id: `${contract}-position`,
          side: "yes" as const,
          position_size: totalValue,
          avg_entry_price: 0.5, // PolygonScan doesn't have price data
          current_price: 0.5,
          pnl: 0, // Can't calculate without price data
          trades_count: txs.length,
          status: "active",
          opened_at: new Date(parseInt(txs[txs.length - 1].timeStamp || txs[txs.length - 1].timestamp || "0") * 1000).toISOString(),
          markets: {
            id: contract,
            title: isUSDC 
              ? "Polymarket USDC Activity" 
              : `Polymarket Contract ${contract.slice(0, 8)}...`,
            source: "polymarket",
            category: "General",
            status: "active",
          },
        });
      }
    });

    return {
      profile: {
        wallet_address: walletAddress,
        total_volume: totalVolume,
        total_trades: totalTrades,
        total_markets: uniqueMarkets.size,
        total_pnl: 0, // Can't calculate without market prices
        win_rate: 0, // Can't calculate without market outcomes
        first_seen: firstSeen,
        last_seen: lastSeen,
      },
      positions,
      transactions: formattedTransactions,
      stats: {
        totalPnL: 0,
        winRate: 0,
        winningTrades: 0,
        losingTrades: 0,
      },
    };
  } catch (error) {
    console.error("Error fetching wallet profile from PolygonScan:", error);
    throw error;
  }
}

