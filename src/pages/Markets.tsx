import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useMarkets } from "@/hooks/useMarkets";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUp, ArrowDown, ChevronRight, Bell, ChevronDown, TrendingUp, TrendingDown, Activity, Search } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const Markets = () => {
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState("breaking");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: markets, isLoading } = useMarkets("polymarket");

  const filteredMarkets = useMemo(() => {
    if (!markets) return [];
    return markets.filter(market =>
      (searchQuery === "" || 
       market.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       market.description?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      (selectedCategory === "All" || market.category === selectedCategory)
    );
  }, [markets, searchQuery, selectedCategory]);

  // Get top 6 trending markets by 24h volume
  const trendingMarkets = useMemo(() => {
    if (!markets) return [];
    return [...markets]
      .sort((a, b) => b.volume_24h - a.volume_24h)
      .slice(0, 6);
  }, [markets]);

  // Helper function to determine price change trend
  const getPriceChange = (market: any) => {
    // Simple heuristic: if yes_price > 0.5, it's bullish
    return (market.yes_price || 0) > 0.5 ? "bullish" : "bearish";
  };

  const formatVolume = (volume: number) => {
    if (volume >= 1000000) {
      return `$${(volume / 1000000).toFixed(1)}M`;
    }
    return `$${(volume / 1000).toFixed(0)}K`;
  };

  // Mock news items for sidebar
  const newsItems = [
    { type: "Breaking news", time: "Dec 1, 6:58 PM", text: "Major market movements detected in prediction markets." },
    { type: "New polymarket", time: "Dec 1, 5:06 PM", text: "New prediction market opened for 2025 events." },
    { type: "Breaking news", time: "Dec 1, 2:56 PM", text: "AI-related markets surge to new highs." },
  ];

  const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // Navigation tabs
  const mainTabs = [
    { id: "breaking", label: "Breaking" },
    { id: "trending", label: "Trending" },
    { id: "all", label: "All Markets" },
  ];

  // Navigation categories
  const navCategories = ["Politics", "Crypto", "Sports", "Entertainment"];

  // Filter categories
  const filterCategories = ["All", "Politics", "Crypto", "Sports", "Entertainment", "Technology", "Economics"];

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

              {/* Search */}
              <div className="relative max-w-2xl mx-auto mb-6">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search markets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 glass"
                />
              </div>

              {/* Stats */}
              {markets && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto mb-6">
                  <Card className="glass">
                    <CardHeader className="pb-2">
                      <CardDescription>Total Markets</CardDescription>
                      <CardTitle className="text-3xl gradient-text">{markets.length}</CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="glass">
                    <CardHeader className="pb-2">
                      <CardDescription>Total Volume</CardDescription>
                      <CardTitle className="text-3xl gradient-text">
                        {formatVolume(markets.reduce((sum, m) => sum + (m.total_volume || 0), 0))}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                  <Card className="glass">
                    <CardHeader className="pb-2">
                      <CardDescription>Active Now</CardDescription>
                      <CardTitle className="text-3xl gradient-text">
                        {markets.filter(m => m.status === 'active').length}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </div>
              )}

              {/* Markets Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Skeleton key={i} className="h-64 rounded-2xl" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMarkets?.map((market) => {
                const priceChange = getPriceChange(market);
                const yesPrice = ((market.yes_price || 0) * 100).toFixed(1);
                const noPrice = ((market.no_price || 0) * 100).toFixed(1);
                const yesPercentage = (market.yes_price || 0) * 100;
                
                return (
                  <Card
                    key={market.id}
                    className="glass hover:glass-strong transition-all duration-300 cursor-pointer hover:scale-[1.02] group relative"
                    onClick={() => navigate(`/market/${market.market_id}`)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Badge variant={priceChange === "bullish" ? "default" : "secondary"} className="shrink-0">
                          {priceChange === "bullish" ? (
                            <TrendingUp className="w-3 h-3 mr-1" />
                          ) : (
                            <TrendingDown className="w-3 h-3 mr-1" />
                          )}
                          {yesPrice}%
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {market.category || "Other"}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {market.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {market.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Yes/No Distribution Bar */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 text-green-500 font-medium">
                            <Activity className="w-3 h-3" />
                            YES {yesPrice}%
                          </span>
                          <span className="flex items-center gap-1 text-red-500 font-medium">
                            NO {noPrice}%
                            <Activity className="w-3 h-3" />
                          </span>
                        </div>
                        <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                          <div 
                            className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-green-400 transition-all duration-500"
                            style={{ width: `${yesPercentage}%` }}
                          />
                          <div 
                            className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-500 to-red-400 transition-all duration-500"
                            style={{ width: `${100 - yesPercentage}%` }}
                          />
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t border-border/50">
                        <div>
                          <div className="text-muted-foreground text-xs">Total Volume</div>
                          <div className="font-semibold">
                            {formatVolume(market.total_volume || 0)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-xs">24h Volume</div>
                          <div className="font-semibold">
                            {formatVolume(market.volume_24h || 0)}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors absolute top-4 right-4" />
                    </CardContent>
                  </Card>
                );
              })}
            </div>
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