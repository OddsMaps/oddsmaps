import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useMarkets } from "@/hooks/useMarkets";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, TrendingUp, TrendingDown, ChevronRight, Flame, Zap, Clock } from "lucide-react";

const Markets = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { data: markets, isLoading } = useMarkets("polymarket");

  // Main navigation tabs (like Polymarket's top nav)
  const mainTabs = [
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "breaking", label: "Breaking", icon: Zap },
    { id: "new", label: "New", icon: Clock },
  ];

  // Category filters (like Polymarket's category pills)
  const categories = [
    "All",
    "Politics",
    "World",
    "Science & Tech",
    "Climate",
    "General"
  ];

  // Map UI category names to database category names
  const categoryMap: Record<string, string | null> = {
    "All": null,
    "Politics": "Politics",
    "World": "World",
    "Science & Tech": "Science and Technology",
    "Climate": "Climate and Weather",
    "General": "General"
  };

  const filteredMarkets = markets?.filter(market => {
    const matchesSearch = market.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      market.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedCategory === "All") {
      return matchesSearch;
    }
    
    const dbCategory = categoryMap[selectedCategory];
    const matchesCategory = market.category === dbCategory;
    return matchesSearch && matchesCategory;
  })?.sort((a, b) => b.volume_24h - a.volume_24h);

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    }
    return `$${(volume / 1000).toFixed(0)}K`;
  };

  // Generate mock price change (in real app this would come from data)
  const getPriceChange = (market: any) => {
    const change = Math.floor(Math.random() * 50) + 5;
    return change;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-20 pb-12">
        {/* Main Tab Navigation */}
        <div className="border-b border-border/50 mb-8">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground border-b-2 border-transparent hover:border-primary/50 transition-all whitespace-nowrap"
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
            <div className="h-6 w-px bg-border mx-2" />
            {["Politics", "Sports", "Finance", "Crypto", "Tech", "Culture", "World", "Economy"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === "Tech" ? "Science & Tech" : cat)}
                className={`px-4 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                  selectedCategory === cat || (cat === "Tech" && selectedCategory === "Science & Tech")
                    ? "text-foreground border-primary"
                    : "text-muted-foreground hover:text-foreground border-transparent hover:border-primary/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-5xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 p-6 sm:p-8">
            <div className="relative z-10">
              <p className="text-sm text-muted-foreground mb-2">
                {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Live Markets
              </h1>
              <p className="text-muted-foreground max-w-md">
                See the markets that moved the most in the last 24 hours
              </p>
            </div>
            {/* Decorative arrows */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 flex gap-4 opacity-60">
              <div className="w-16 h-16 rounded-xl bg-red-500/20 flex items-center justify-center">
                <TrendingDown className="w-8 h-8 text-red-400" />
              </div>
              <div className="w-16 h-16 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-emerald-400" />
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search markets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 bg-muted/50 border-border/50"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Markets List */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedCategory}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="divide-y divide-border/50"
              >
                {filteredMarkets?.map((market, index) => {
                  const yesPrice = Math.round((market.yes_price || 0) * 100);
                  const priceChange = getPriceChange(market);
                  const isPositive = yesPrice >= 50;
                  
                  return (
                    <motion.div
                      key={market.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2, delay: index * 0.03 }}
                      onClick={() => navigate(`/market/${market.market_id}`)}
                      className="flex items-center gap-4 py-4 cursor-pointer hover:bg-muted/30 -mx-4 px-4 transition-colors group"
                    >
                      {/* Rank */}
                      <span className="text-sm text-muted-foreground font-medium w-6 text-center shrink-0">
                        {index + 1}
                      </span>

                      {/* Market Icon */}
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center shrink-0">
                        <Flame className="w-5 h-5 text-primary" />
                      </div>

                      {/* Title and Price */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {market.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-bold">
                            {yesPrice}%
                          </span>
                          <span className={`text-sm font-medium flex items-center gap-0.5 ${
                            isPositive ? "text-emerald-400" : "text-red-400"
                          }`}>
                            {isPositive ? "↑" : "↓"}{priceChange}%
                          </span>
                        </div>
                      </div>

                      {/* Mini Chart Placeholder */}
                      <div className="hidden sm:flex items-center gap-4">
                        <div className="w-20 h-8">
                          <svg viewBox="0 0 80 32" className="w-full h-full">
                            <path
                              d={`M0,${isPositive ? 28 : 4} Q20,${isPositive ? 20 : 12} 40,${isPositive ? 16 : 16} T80,${isPositive ? 4 : 28}`}
                              fill="none"
                              stroke={isPositive ? "#34d399" : "#f87171"}
                              strokeWidth="2"
                              className="opacity-60"
                            />
                          </svg>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>
          )}

          {filteredMarkets?.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No markets found matching your criteria.</p>
            </div>
          )}

          {/* Stats Summary */}
          {markets && (
            <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border/50">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold gradient-text-premium">{markets.length}</p>
                <p className="text-sm text-muted-foreground">Total Markets</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold gradient-text-premium">
                  {formatVolume(markets.reduce((sum, m) => sum + (m.total_volume || 0), 0))}
                </p>
                <p className="text-sm text-muted-foreground">Total Volume</p>
              </div>
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold gradient-text-premium">
                  {markets.filter(m => m.status === 'active').length}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Markets;
