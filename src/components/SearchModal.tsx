import { useState, useEffect, useCallback } from "react";
import { Search, Command, TrendingUp, TrendingDown, X, Activity, Filter, ArrowUpDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMarkets } from "@/hooks/useMarkets";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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
  const [walletFilter, setWalletFilter] = useState("");
  const [marketKeyword, setMarketKeyword] = useState("");
  const [betSideFilter, setBetSideFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<string>("time-desc");
  const [showFilters, setShowFilters] = useState(false);
  
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

  // Filter Polymarket markets based on all filters
  const filteredMarkets = markets?.filter(market => {
    if (market.source !== 'polymarket') return false;
    
    // Search query filter
    const matchesSearch = !searchQuery || 
      market.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.market_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Market keyword filter
    const matchesKeyword = !marketKeyword || 
      market.title.toLowerCase().includes(marketKeyword.toLowerCase()) ||
      market.description?.toLowerCase().includes(marketKeyword.toLowerCase());
    
    return matchesSearch && matchesKeyword;
  }).slice(0, 10) || [];

  // Filter Polymarket transactions/bets based on all filters
  let filteredTransactions = transactions?.filter(tx => {
    // Search query filter
    const matchesSearch = !searchQuery || 
      tx.market?.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.wallet_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.side.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.transaction_hash?.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Wallet address filter
    const matchesWallet = !walletFilter || 
      tx.wallet_address.toLowerCase().includes(walletFilter.toLowerCase());
    
    // Market keyword filter
    const matchesMarketKeyword = !marketKeyword || 
      tx.market?.title.toLowerCase().includes(marketKeyword.toLowerCase());
    
    // Bet side filter
    const matchesSide = betSideFilter === 'all' || 
      tx.side.toLowerCase() === betSideFilter.toLowerCase();
    
    // Date range filter
    const txDate = new Date(tx.timestamp);
    const matchesDateFrom = !dateFrom || txDate >= new Date(dateFrom);
    const matchesDateTo = !dateTo || txDate <= new Date(dateTo + 'T23:59:59');
    
    return matchesSearch && matchesWallet && matchesMarketKeyword && 
           matchesSide && matchesDateFrom && matchesDateTo;
  }) || [];

  // Sort filtered transactions
  filteredTransactions = filteredTransactions.sort((a, b) => {
    switch (sortBy) {
      case 'time-desc':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'time-asc':
        return new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      case 'amount-desc':
        return b.amount - a.amount;
      case 'amount-asc':
        return a.amount - b.amount;
      default:
        return 0;
    }
  }).slice(0, 20);

  // Reset search when modal closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setWalletFilter("");
      setMarketKeyword("");
      setBetSideFilter("all");
      setDateFrom("");
      setDateTo("");
      setSortBy("time-desc");
      setShowFilters(false);
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
      <DialogContent className="max-w-3xl p-0 gap-0 bg-background/95 backdrop-blur-xl border-border shadow-2xl">
        <DialogTitle className="sr-only">Search Markets and Bets</DialogTitle>
        <div className="rounded-2xl overflow-hidden">
          {/* Search Input */}
          <div className="p-4 border-b border-border/50 bg-background space-y-3">
            <div className="flex items-center gap-3">
              <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
              <Input
                placeholder="Search markets and bets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="bg-transparent border-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60 px-0"
                autoFocus
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="space-y-3 pt-3 border-t border-border/50">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Wallet Address</label>
                    <Input
                      placeholder="0x..."
                      value={walletFilter}
                      onChange={(e) => setWalletFilter(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Market Keyword</label>
                    <Input
                      placeholder="e.g., Trump, Bitcoin"
                      value={marketKeyword}
                      onChange={(e) => setMarketKeyword(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">Bet Side</label>
                    <Select value={betSideFilter} onValueChange={setBetSideFilter}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">From Date</label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                      className="h-9"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground">To Date</label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                      className="h-9"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 space-y-1.5">
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                      <ArrowUpDown className="w-3 h-3" />
                      Sort By
                    </label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="time-desc">Time (Newest First)</SelectItem>
                        <SelectItem value="time-asc">Time (Oldest First)</SelectItem>
                        <SelectItem value="amount-desc">Amount (High to Low)</SelectItem>
                        <SelectItem value="amount-asc">Amount (Low to High)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setWalletFilter("");
                      setMarketKeyword("");
                      setBetSideFilter("all");
                      setDateFrom("");
                      setDateTo("");
                      setSortBy("time-desc");
                    }}
                    className="mt-auto"
                  >
                    Clear Filters
                  </Button>
                </div>
              </div>
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
