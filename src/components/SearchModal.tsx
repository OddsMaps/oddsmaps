import { useState, useEffect, useCallback } from "react";
import { Search, Command, TrendingUp, TrendingDown, X, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMarkets } from "@/hooks/useMarkets";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Transaction {
  id: string;
  wallet_address: string;
  amount: number;
  price: number;
  side: string;
  timestamp: string;
  transaction_hash?: string;
  market: {
    title: string;
    market_id: string;
  };
}

const SearchModal = ({ open, onOpenChange }: SearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: markets } = useMarkets();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const navigate = useNavigate();

  // Fetch ALL transactions for search
  useEffect(() => {
    const fetchTransactions = async () => {
      // Try DB first
      const { data } = await supabase
        .from('wallet_transactions')
        .select(`
          *,
          market:markets!inner(title, market_id, source)
        `)
        .eq('market.source', 'polymarket')
        .order('timestamp', { ascending: false })
        .limit(5000);
      
      if (data && data.length > 0) {
        setTransactions(data as any);
        console.log(`Loaded ${data.length} Polymarket transactions from DB for search`);
        return;
      }

      // Fallback: live fetch from blockchain logs if DB is empty
      try {
        const { data: live } = await supabase.functions.invoke('fetch-wallet-data', {
          body: { marketId: 'polymarket', contractAddress: '0x4bFb41d5B3570DeFd03C39a9A4D8dE6Bd8B8982E' }
        });

        const mapped: Transaction[] = (live?.transactions || []).map((t: any) => ({
          id: t.id,
          wallet_address: t.address,
          amount: t.amount,
          price: 0, // unknown from logs
          side: t.side || 'yes',
          timestamp: t.timestamp,
          transaction_hash: t.hash,
          market: { title: 'Polymarket Trade', market_id: 'polymarket' },
        }));

        setTransactions(mapped);
        console.log(`Loaded ${mapped.length} live Polymarket transactions (fallback)`);
      } catch (e) {
        console.error('Fallback live fetch failed', e);
        setTransactions([]);
      }
    };

    if (open) {
      fetchTransactions();
    }
  }, [open]);

  // Filter Polymarket markets based on search query
  const filteredMarkets = markets?.filter(market => 
    market.source === 'polymarket' && (
      market.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.market_id.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ).slice(0, 10) || [];

  // Filter Polymarket transactions/bets based on search query
  const filteredTransactions = transactions?.filter(tx => 
    tx.market?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.wallet_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.side.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.transaction_hash?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 20) || [];

  // Reset search when modal closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  // Keyboard navigation
  const [selectedIndex, setSelectedIndex] = useState(0);

  const allResults = [...filteredMarkets, ...filteredTransactions];

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, allResults.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && allResults[selectedIndex]) {
      e.preventDefault();
      const result = allResults[selectedIndex];
      if ('wallet_address' in result) {
        navigate(`/wallet/${result.wallet_address}`);
      } else {
        handleSelectMarket(result);
      }
      onOpenChange(false);
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  }, [allResults, selectedIndex, onOpenChange, navigate]);

  const handleSelectMarket = (market: any) => {
    navigate(`/market/${market.market_id}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-background/95 backdrop-blur-xl border-border shadow-2xl">
        <DialogTitle className="sr-only">Search Markets and Bets</DialogTitle>
        <div className="rounded-2xl overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 p-4 border-b border-border/50 bg-background">
            <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <Input
              placeholder="Search markets... (e.g., 'Trump', 'Bitcoin', 'Fed')"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 px-0"
              autoFocus
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <X className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
          </div>

          {/* Search Results */}
          <div className="max-h-[500px] overflow-y-auto bg-background">
            {searchQuery ? (
              allResults.length > 0 ? (
                <div className="p-2">
                  {/* Transactions - Show First */}
                  {filteredTransactions.length > 0 && (
                    <div className="mb-4">
                      <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase flex items-center gap-2">
                        <Activity className="w-3 h-3" />
                        Polymarket Bets ({filteredTransactions.length})
                      </div>
                      {filteredTransactions.map((tx, txIndex) => {
                        return (
                          <button
                            key={tx.id}
                            onClick={() => {
                              navigate(`/wallet/${tx.wallet_address}`);
                              onOpenChange(false);
                            }}
                            className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                              txIndex === selectedIndex
                                ? "bg-muted scale-[1.02]"
                                : "hover:bg-muted/30"
                            }`}
                            onMouseEnter={() => setSelectedIndex(txIndex)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge className={`text-xs ${
                                    tx.side === 'yes' 
                                      ? 'bg-green-500/20 text-green-500 border-green-500/20' 
                                      : 'bg-red-500/20 text-red-500 border-red-500/20'
                                  }`}>
                                    {tx.side.toUpperCase()} BET
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(tx.timestamp).toLocaleDateString()}
                                  </span>
                                </div>
                                <h3 className="font-semibold mb-1 line-clamp-1 text-sm">
                                  {tx.market?.title}
                                </h3>
                                <p className="text-xs text-muted-foreground font-mono">
                                  {tx.wallet_address.slice(0, 8)}...{tx.wallet_address.slice(-6)}
                                </p>
                              </div>
                              
                              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                <div className="font-bold text-sm">
                                  ${tx.amount.toLocaleString()}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  @ ${tx.price.toFixed(2)}
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Markets */}
                  {filteredMarkets.length > 0 && (
                    <div>
                      <div className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase">
                        Polymarket Markets ({filteredMarkets.length})
                      </div>
                      {filteredMarkets.map((market, marketIndex) => {
                    const index = filteredTransactions.length + marketIndex;
                    const change = ((market.yes_price - 0.5) * 100).toFixed(1);
                    const isPositive = parseFloat(change) > 0;
                    
                    return (
                      <button
                        key={market.id}
                        onClick={() => handleSelectMarket(market)}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-200 ${
                          index === selectedIndex
                            ? "bg-muted scale-[1.02]"
                            : "hover:bg-muted/30"
                        }`}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs uppercase">
                                POLYMARKET
                              </Badge>
                              {market.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {market.category}
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-semibold mb-1 line-clamp-2">
                              {market.title}
                            </h3>
                            {market.description && (
                              <p className="text-sm text-muted-foreground line-clamp-1">
                                {market.description}
                              </p>
                            )}
                          </div>
                          
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <div className={`flex items-center gap-1 font-bold ${
                              isPositive ? "text-green-400" : "text-red-400"
                            }`}>
                              {isPositive ? (
                                <TrendingUp className="w-4 h-4" />
                              ) : (
                                <TrendingDown className="w-4 h-4" />
                              )}
                              <span>{(market.yes_price * 100).toFixed(1)}¢</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              ${(market.volume_24h / 1000).toFixed(1)}K vol
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 text-center">
                  <p className="text-muted-foreground mb-2">No markets found</p>
                  <p className="text-sm text-muted-foreground/60">
                    Try searching for different keywords
                  </p>
                </div>
              )
            ) : (
              <div className="p-12 text-center">
                <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground/30" />
                <p className="text-muted-foreground mb-2">Search Polymarket Bets & Markets</p>
                <p className="text-sm text-muted-foreground/60">
                  Search {transactions.length.toLocaleString()}+ live bets from Polymarket
                </p>
                <p className="text-xs text-muted-foreground/40 mt-2">
                  Try searching by market name, wallet address, or bet type
                </p>
              </div>
            )}
          </div>

          {/* Footer with shortcuts */}
          <div className="flex items-center justify-between gap-4 p-3 border-t border-border/50 text-xs text-muted-foreground bg-muted/20">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 rounded bg-muted text-foreground font-mono">↑</kbd>
                <kbd className="px-2 py-1 rounded bg-muted text-foreground font-mono">↓</kbd>
                <span>to navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 rounded bg-muted text-foreground font-mono">Enter</kbd>
                <span>to select</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-2 py-1 rounded bg-muted text-foreground font-mono">Esc</kbd>
                <span>to close</span>
              </div>
            </div>
            <div className="text-muted-foreground/60">
              {allResults.length} {allResults.length === 1 ? 'result' : 'results'}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
