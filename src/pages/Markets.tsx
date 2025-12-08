import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useMarkets } from "@/hooks/useMarkets";
import { usePriceChanges } from "@/hooks/usePriceChanges";
import { usePriceHistory, generateSparklinePath } from "@/hooks/usePriceHistory";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, ChevronRight, Bell, ChevronDown } from "lucide-react";

const Markets = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("breaking");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { data: markets, isLoading } = useMarkets("polymarket");
  const { priceChanges } = usePriceChanges(markets || []);

  // Main navigation tabs
  const mainTabs = [
    { id: "trending", label: "Trending" },
    { id: "breaking", label: "Breaking" },
    { id: "new", label: "New" },
  ];

  // Category tabs in the nav - match actual Polymarket categories
  const navCategories = ["Politics", "World", "Science & Tech", "Climate"];

  // Filter category pills - match actual Polymarket categories from database
  const filterCategories = ["All", "Politics", "World", "Science & Tech", "Climate"];

  // Map filter labels to actual database category values
  const categoryMap: Record<string, string[]> = {
    "All": [],
    "Politics": ["Politics"],
    "World": ["World", "General"],
    "Science & Tech": ["Science and Technology"],
    "Climate": ["Climate and Weather"],
  };

  const filteredMarkets = markets?.filter(market => {
    if (selectedCategory === "All") return true;
    const allowedCategories = categoryMap[selectedCategory] || [];
    // Match if market category is in the allowed list (case-insensitive)
    return allowedCategories.some(cat => 
      market.category?.toLowerCase() === cat.toLowerCase()
    );
  })?.sort((a, b) => {
    // Sort by price change for "breaking" tab
    if (selectedTab === "breaking") {
      const changeA = Math.abs(priceChanges[a.id]?.change || 0);
      const changeB = Math.abs(priceChanges[b.id]?.change || 0);
      return changeB - changeA;
    }
    return b.volume_24h - a.volume_24h;
  });

  // Get market IDs for price history
  const marketIds = useMemo(() => 
    filteredMarkets?.slice(0, 20).map(m => m.id) || [], 
    [filteredMarkets]
  );

  // Fetch real price history for sparklines
  const { data: priceHistory } = usePriceHistory(marketIds);

  // Get market image
  const getMarketImage = (market: any) => {
    if (market.image_url) return market.image_url;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(market.title.slice(0, 2))}&background=random&size=100`;
  };

  // Mock news items for sidebar
  const newsItems = [
    { type: "Breaking news", time: "Dec 1, 6:58 PM", text: "Major market movements detected in prediction markets." },
    { type: "New polymarket", time: "Dec 1, 5:06 PM", text: "New prediction market opened for 2025 events." },
    { type: "Breaking news", time: "Dec 1, 2:56 PM", text: "AI-related markets surge to new highs." },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 md:pt-28">
        {/* Top Navigation Tabs */}
        <div className="border-b border-border/50">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
              {mainTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                    selectedTab === tab.id 
                      ? "text-foreground border-primary" 
                      : "text-muted-foreground hover:text-foreground border-transparent"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
              <div className="h-5 w-px bg-border/60 mx-2 shrink-0" />
              {navCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-3 text-sm font-medium transition-all whitespace-nowrap border-b-2 ${
                    selectedCategory === cat
                      ? "text-foreground border-primary"
                      : "text-muted-foreground hover:text-foreground border-transparent"
                  }`}
                >
                  {cat}
                </button>
              ))}
              <button className="px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-all whitespace-nowrap flex items-center gap-1">
                More <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6">
          <div className="flex gap-8">
            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Hero Banner */}
              <div className="relative rounded-xl overflow-hidden mb-6 bg-gradient-to-br from-muted/80 via-card to-muted/60 border border-border/50">
                <div className="p-6 md:p-8 relative z-10">
                  <p className="text-sm text-muted-foreground mb-1">{currentDate}</p>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Breaking News</h1>
                  <p className="text-muted-foreground text-sm md:text-base">
                    See the markets that moved the most in the last 24 hours
                  </p>
                </div>
                {/* Decorative arrows */}
                <div className="absolute right-4 md:right-12 top-1/2 -translate-y-1/2 flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl bg-secondary/40 blur-xl scale-150" />
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl bg-secondary/20 border border-secondary/30 flex items-center justify-center rotate-12 shadow-[0_0_30px_rgba(239,68,68,0.3)]">
                      <ArrowDown className="w-8 h-8 md:w-10 md:h-10 text-secondary" />
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-0 rounded-xl bg-primary/40 blur-xl scale-150" />
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center -rotate-12 shadow-[0_0_30px_rgba(34,197,94,0.3)]">
                      <ArrowUp className="w-8 h-8 md:w-10 md:h-10 text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-2 mb-6 overflow-x-auto scrollbar-hide pb-2">
                {filterCategories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border ${
                      selectedCategory === cat
                        ? "bg-foreground text-background border-foreground"
                        : "bg-transparent text-muted-foreground border-border hover:border-foreground/50 hover:text-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Markets List */}
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-20 rounded-lg" />
                  ))}
                </div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={selectedCategory + selectedTab}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-2"
                  >
                    {filteredMarkets?.slice(0, 20).map((market, index) => {
                      const yesPrice = Math.round((market.yes_price || 0) * 100);
                      const history = priceHistory?.[market.id];
                      const { path: sparklinePath, isPositive: sparklinePositive } = generateSparklinePath(history);
                      
                      // Calculate price change from history
                      let priceChange = 0;
                      if (history && history.length >= 2) {
                        const oldPrice = history[0].yes_price;
                        const newPrice = history[history.length - 1].yes_price;
                        priceChange = Math.round((newPrice - oldPrice) * 100);
                      }

                      return (
                        <motion.div
                          key={market.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.03 }}
                          onClick={() => navigate(`/market/${market.market_id}`)}
                          className="flex items-center gap-4 p-4 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer group"
                        >
                          {/* Rank */}
                          <span className="text-muted-foreground text-sm w-4 shrink-0">{index + 1}</span>
                          
                          {/* Image */}
                          <img
                            src={getMarketImage(market)}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(market.title.slice(0, 2))}&background=random&size=100`;
                            }}
                          />

                          {/* Title & Price */}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                              {market.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-lg font-bold">{yesPrice}%</span>
                              <span className={`text-sm flex items-center gap-0.5 ${priceChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {priceChange >= 0 ? '↗' : '↘'} {Math.abs(priceChange)}%
                              </span>
                            </div>
                          </div>

                          {/* Sparkline */}
                          <div className="hidden sm:block shrink-0">
                            <svg width="60" height="30" className="overflow-visible">
                              <path
                                d={sparklinePath}
                                fill="none"
                                stroke={sparklinePositive ? "#34d399" : "#f87171"}
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>

                          {/* Arrow */}
                          <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
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

            {/* Right Sidebar */}
            <div className="hidden lg:block w-80 shrink-0 space-y-6">
              {/* Email Signup Card */}
              <div className="bg-card border border-border/50 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <Bell className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Get daily updates</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      We'll send you an email every day with what's moving on prediction markets
                    </p>
                  </div>
                </div>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="mb-3 bg-muted/30 border-border/50"
                />
                <button className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors">
                  Get updates
                </button>
              </div>

              {/* Live Feed */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Live from @polymarket</span>
                  <button className="px-3 py-1.5 rounded-full border border-border text-sm font-medium hover:bg-muted/50 transition-colors">
                    Follow on X
                  </button>
                </div>

                <div className="space-y-4">
                  {newsItems.map((item, i) => (
                    <div key={i} className="border-l-2 border-border pl-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className={`${item.type === "Breaking news" ? "text-rose-400" : "text-muted-foreground"}`}>
                          {item.type === "Breaking news" && "🔴 "}{item.type}
                        </span>
                        <span className="text-muted-foreground">{item.time}</span>
                      </div>
                      <p className="text-sm text-foreground">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Markets;