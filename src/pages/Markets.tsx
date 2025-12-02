import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useMarkets } from "@/hooks/useMarkets";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, TrendingUp, Zap, Clock, Bookmark, Share2 } from "lucide-react";

const Markets = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { data: markets, isLoading } = useMarkets("polymarket");

  // Main navigation tabs
  const mainTabs = [
    { id: "trending", label: "Trending", icon: TrendingUp },
    { id: "breaking", label: "Breaking", icon: Zap },
    { id: "new", label: "New", icon: Clock },
  ];

  // Category filters
  const categories = ["All", "Politics", "World", "Science & Tech", "Climate", "General"];

  // Topic tags
  const topicTags = ["All", "Trump", "Ukraine", "Fed", "Elections", "Bitcoin", "AI", "Markets"];

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
    
    if (selectedCategory === "All") return matchesSearch;
    
    const dbCategory = categoryMap[selectedCategory];
    return matchesSearch && market.category === dbCategory;
  })?.sort((a, b) => b.volume_24h - a.volume_24h);

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) return `$${(volume / 1000000).toFixed(0)}m`;
    if (volume >= 1000) return `$${(volume / 1000).toFixed(0)}k`;
    return `$${volume.toFixed(0)}`;
  };

  // Get market image - use real image_url or fallback
  const getMarketImage = (market: any) => {
    if (market.image_url) {
      return market.image_url;
    }
    // Fallback to UI avatars based on title
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(market.title.slice(0, 2))}&background=random&size=100`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 md:pt-28 pb-12">
        {/* Main Tab Navigation */}
        <div className="border-b border-border/50 mb-6">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {mainTabs.map((tab) => (
              <button
                key={tab.id}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                  tab.id === "trending" 
                    ? "text-foreground border-primary" 
                    : "text-muted-foreground hover:text-foreground border-transparent hover:border-primary/50"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
            <div className="h-5 w-px bg-border/60 mx-3 shrink-0" />
            {["Politics", "Sports", "Finance", "Crypto", "Geopolitics", "Earnings", "Tech", "Culture", "World", "Economy", "Elections", "Mentions"].map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  if (cat === "Tech") setSelectedCategory("Science & Tech");
                  else if (["Politics", "World"].includes(cat)) setSelectedCategory(cat);
                  else setSelectedCategory("All");
                }}
                className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-all whitespace-nowrap border-b-2 border-transparent hover:border-primary/50"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-7xl mx-auto space-y-6">
          {/* Search and Filter Row */}
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative w-48">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 bg-muted/30 border-border/50 text-sm"
              />
            </div>
            
            {/* Topic Tags */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1">
              {topicTags.map((tag) => (
                <button
                  key={tag}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                    tag === "All"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Markets Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-48 rounded-xl" />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedCategory}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {filteredMarkets?.map((market, index) => {
                  const yesPrice = Math.round((market.yes_price || 0) * 100);
                  const noPrice = Math.round((market.no_price || 0) * 100);
                  
                  return (
                    <motion.div
                      key={market.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      onClick={() => navigate(`/market/${market.market_id}`)}
                      className="bg-card border border-border/50 rounded-xl p-4 cursor-pointer hover:border-primary/50 hover:bg-card/80 transition-all group"
                    >
                      {/* Header with Image and Title */}
                      <div className="flex items-start gap-3 mb-4">
                        <img 
                          src={getMarketImage(market)} 
                          alt=""
                          className="w-10 h-10 rounded-lg object-cover shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(market.title.slice(0, 2))}&background=random&size=100`;
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm text-foreground line-clamp-2 group-hover:text-primary transition-colors leading-tight">
                            {market.title}
                          </h3>
                        </div>
                        {/* Percentage Circle */}
                        <div className="shrink-0 w-12 h-12 rounded-full bg-muted/50 border border-border/50 flex flex-col items-center justify-center">
                          <span className="text-sm font-bold">{yesPrice}%</span>
                          <span className="text-[10px] text-muted-foreground">chance</span>
                        </div>
                      </div>

                      {/* Yes/No Buttons */}
                      <div className="flex gap-2 mb-3">
                        <button className="flex-1 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors">
                          Yes
                        </button>
                        <button className="flex-1 py-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm font-medium hover:bg-rose-500/20 transition-colors">
                          No
                        </button>
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{formatVolume(market.volume_24h)} Vol.</span>
                        <div className="flex items-center gap-2">
                          <button 
                            className="p-1 hover:text-foreground transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Share2 className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            className="p-1 hover:text-foreground transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <Bookmark className="w-3.5 h-3.5" />
                          </button>
                        </div>
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
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Markets;
