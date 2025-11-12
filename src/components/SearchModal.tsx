import { useState, useEffect, useCallback } from "react";
import { Search, Command, TrendingUp, TrendingDown, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useMarkets } from "@/hooks/useMarkets";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchModal = ({ open, onOpenChange }: SearchModalProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: markets } = useMarkets();

  // Filter markets based on search query
  const filteredMarkets = markets?.filter(market => 
    market.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    market.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    market.category?.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 8) || [];

  // Reset search when modal closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
    }
  }, [open]);

  // Keyboard navigation
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, filteredMarkets.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && filteredMarkets[selectedIndex]) {
      e.preventDefault();
      handleSelectMarket(filteredMarkets[selectedIndex]);
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  }, [filteredMarkets, selectedIndex, onOpenChange]);

  const handleSelectMarket = (market: any) => {
    toast.success(`Selected: ${market.title}`, {
      description: `${market.source} • ${(market.yes_price * 100).toFixed(1)}¢`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 gap-0 bg-background/95 backdrop-blur-xl border-border shadow-2xl">
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
              filteredMarkets.length > 0 ? (
                <div className="p-2">
                  {filteredMarkets.map((market, index) => {
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
                                {market.source}
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
                <p className="text-muted-foreground mb-2">Search prediction markets</p>
                <p className="text-sm text-muted-foreground/60">
                  Start typing to find markets from Kalshi and Polymarket
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
              {filteredMarkets.length} {filteredMarkets.length === 1 ? 'result' : 'results'}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchModal;
