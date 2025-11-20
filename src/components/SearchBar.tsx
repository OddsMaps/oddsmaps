import { useState } from "react";
import { Search } from "lucide-react";
import SearchModal from "./SearchModal";

const SearchBar = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const suggestions = [
    "Will Trump win 2028?",
    "BTC above $100k by year end?",
    "Fed rate cut in Q1?",
    "AI reaches AGI by 2025?",
  ];

  return (
    <>
      <section className="relative py-16 sm:py-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12 space-y-3 sm:space-y-4 animate-slide-up">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              <span className="gradient-text">Search Any Market</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
              Find prediction markets instantly. Type any event, question, or topic.
            </p>
          </div>

          {/* Search Input */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="relative group w-full touch-manipulation active:scale-[0.98] transition-transform"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity animate-glow-pulse" />
            
            <div className="relative glass-strong rounded-2xl p-2 sm:p-3 cursor-pointer">
              <div className="flex items-center gap-3 px-3 sm:px-4 py-4 sm:py-3 min-h-[56px]">
                <Search className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground flex-shrink-0" />
                <span className="text-base sm:text-lg text-muted-foreground/60 text-left flex-1 truncate">
                  Search markets...
                </span>
                <kbd className="hidden md:inline-flex px-2 py-1 text-xs rounded bg-muted/50 text-muted-foreground border border-border/50">
                  ⌘K
                </kbd>
              </div>
            </div>
          </button>

          {/* Quick Suggestions */}
          <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
            <div className="text-xs sm:text-sm text-muted-foreground text-center">Popular searches:</div>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setIsSearchOpen(true)}
                  className="glass px-3 sm:px-4 py-2.5 sm:py-2 rounded-full text-xs sm:text-sm hover:glass-strong hover:scale-105 active:scale-95 transition-all duration-300 group touch-manipulation min-h-[44px] sm:min-h-0"
                >
                  <span className="group-hover:gradient-text transition-all">{suggestion}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Indicator */}
          <div className="mt-12 flex items-center justify-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-glow" />
            <span className="text-muted-foreground">Live data from Polymarket</span>
          </div>
        </div>
      </section>

      {/* Search Modal */}
      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
};

export default SearchBar;
