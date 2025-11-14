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
      <section className="relative py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 space-y-4 animate-slide-up">
            <h2 className="text-5xl font-bold">
              <span className="gradient-text">Search Any Market</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Find prediction markets instantly. Type any event, question, or topic.
            </p>
          </div>

          {/* Search Input */}
          <button 
            onClick={() => setIsSearchOpen(true)}
            className="relative group w-full"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity animate-glow-pulse" />
            
            <div className="relative glass-strong rounded-2xl p-2 cursor-pointer">
              <div className="flex items-center gap-3 px-4 py-3">
                <Search className="w-6 h-6 text-muted-foreground" />
                <span className="text-lg text-muted-foreground/60 text-left flex-1">
                  Search markets... (e.g., 'Will Trump win 2028?')
                </span>
                <kbd className="hidden md:inline-flex px-2 py-1 text-xs rounded bg-muted/50 text-muted-foreground border border-border/50">
                  ⌘K
                </kbd>
              </div>
            </div>
          </button>

          {/* Quick Suggestions */}
          <div className="mt-8 space-y-3">
            <div className="text-sm text-muted-foreground text-center">Popular searches:</div>
            <div className="flex flex-wrap justify-center gap-3">
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => setIsSearchOpen(true)}
                  className="glass px-4 py-2 rounded-full text-sm hover:glass-strong hover:scale-105 transition-all duration-300 group"
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
