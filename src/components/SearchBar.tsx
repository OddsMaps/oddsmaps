import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const SearchBar = () => {
  const suggestions = [
    "Will Trump win 2028?",
    "BTC above $100k by year end?",
    "Fed rate cut in Q1?",
    "AI reaches AGI by 2025?",
  ];

  return (
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
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-secondary to-accent rounded-3xl blur-xl opacity-40 group-hover:opacity-60 transition-opacity animate-glow-pulse" />
          
          <div className="relative glass-strong rounded-2xl p-2">
            <div className="flex items-center gap-3 px-4">
              <Search className="w-6 h-6 text-muted-foreground" />
              <Input
                placeholder="Search markets... (e.g., 'Will Trump win 2028?')"
                className="bg-transparent border-0 text-lg focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/60"
              />
            </div>
          </div>
        </div>

        {/* Quick Suggestions */}
        <div className="mt-8 space-y-3">
          <div className="text-sm text-muted-foreground text-center">Popular searches:</div>
          <div className="flex flex-wrap justify-center gap-3">
            {suggestions.map((suggestion, i) => (
              <button
                key={i}
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
          <span className="text-muted-foreground">Live data from Kalshi & Polymarket</span>
        </div>
      </div>
    </section>
  );
};

export default SearchBar;
