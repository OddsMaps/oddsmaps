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
  const [selectedTab, setSelectedTab] = useState("trending");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: markets, isLoading } = useMarkets("polymarket");

  // Helper to normalize category - uses keyword matching on both category and title
  const normalizeCategory = (category: string | undefined, title?: string): string => {
    const lower = (category || "").toLowerCase();
    const titleLower = (title || "").toLowerCase();
    const combined = `${lower} ${titleLower}`;
    
    // Crypto keywords
    if (/bitcoin|ethereum|crypto|blockchain|defi|token|solana|eth\b|btc\b|dogecoin|doge\b|xrp|cardano|polygon|avalanche|chainlink|uniswap|binance|coinbase|nft|web3|marketcap|market cap|fdv\b|airdrop|staking|altcoin|memecoin|meme coin|shib|pepe\b|bonk|sui\b|apt\b|aptos|arb\b|arbitrum|op\b|optimism|matic|avax|atom|cosmos|polkadot|dot\b|near\b|ftx|luna|terra|usdt|usdc|stablecoin|tether|ledger|wallet|mining|halving|hodl|bull run|bear market|pump|dump|whale|liquidity|dex|cex|exchange|kraken|gemini|kucoin|okx|bybit|layer 2|l2\b|zk\b|rollup|bridge|swap|yield|apr\b|apy\b/.test(combined)) {
      return "Crypto";
    }
    
    // Politics keywords - politicians, parties, government
    if (/trump|biden|obama|harris|desantis|pence|pelosi|mcconnell|aoc|sanders|warren|newsom|republican|democrat|gop|dnc|rnc|congress|senate|house of rep|white house|supreme court|scotus|governor|mayor|primary|midterm|impeach|pardon|indictment|cabinet|secretary of/.test(combined)) {
      return "Politics";
    }
    
    // Sports keywords - leagues, teams, events
    if (/nfl|nba|mlb|nhl|mls|ufc|wwe|pga|nascar|f1|formula 1|super bowl|world series|stanley cup|playoffs|championship|mvp|patriots|chiefs|eagles|cowboys|49ers|packers|bills|ravens|dolphins|jets|giants|bears|lions|vikings|commanders|saints|buccaneers|falcons|panthers|seahawks|rams|cardinals|broncos|raiders|chargers|bengals|browns|steelers|texans|colts|titans|jaguars|lakers|celtics|warriors|nets|knicks|heat|bucks|76ers|suns|mavericks|clippers|nuggets|grizzlies|yankees|dodgers|mets|red sox|cubs|braves|phillies|astros|rangers|padres|mariners|orioles|twins|guardians|royals|tigers|white sox|athletics|angels|diamondbacks|rockies|marlins|nationals|reds|brewers|pirates|cardinals|tennis|golf|soccer|football|basketball|baseball|hockey|boxing|mma|olympic|world cup|premier league|la liga|bundesliga|serie a|champions league|uefa|fifa|espn/.test(combined)) {
      return "Sports";
    }
    
    // Tech keywords
    if (/tech|science|ai\b|artificial intelligence|openai|chatgpt|gpt-|claude|gemini|llm|machine learning|neural|software|apple|google|microsoft|amazon|meta|nvidia|tesla|spacex|starlink|robot|quantum|semiconductor|chip|iphone|android|startup|silicon valley|vc\b|venture capital/.test(combined)) {
      return "Tech";
    }
    
    // Finance keywords
    if (/stock|nasdaq|dow jones|s&p 500|nyse|ipo|merger|acquisition|hedge fund|wall street|fed rate|treasury|bond|forex|commodit|gold price|oil price|earnings call/.test(combined)) {
      return "Finance";
    }
    
    // Earnings keywords
    if (/earning|revenue|profit|quarterly|q1|q2|q3|q4|fiscal|guidance|eps\b|beat estimates|miss estimates|will .* beat|beat .* earnings|miss .* earnings|report .* earnings|earnings .* report/.test(combined)) {
      return "Earnings";
    }
    
    // Geopolitics keywords
    if (/geopolitic|international|foreign policy|diplomacy|war\b|conflict|nato|united nations|sanction|treaty|alliance|military|invasion|ukraine|russia|china|taiwan|israel|gaza|iran|north korea|syria|middle east|eu\b|european union|brexit/.test(combined)) {
      return "Geopolitics";
    }
    
    // Culture keywords
    if (/culture|entertainment|celebrity|movie|film|music|tv\b|television|award|grammy|oscar|emmy|golden globe|billboard|netflix|disney|hbo|streaming|concert|tour|album|box office|hollywood|viral|tiktok|instagram|youtube|influencer|kardashian|swift|beyonce|drake|kanye|rihanna/.test(combined)) {
      return "Culture";
    }
    
    // Economy keywords
    if (/economy|economic|fed\b|federal reserve|inflation|interest rate|gdp\b|recession|unemployment|jobs report|cpi\b|ppi\b|monetary policy|fiscal policy|stimulus|debt ceiling|deficit/.test(combined)) {
      return "Economy";
    }
    
    // Elections keywords (more specific than general politics)
    if (/election|electoral|vote|voting|ballot|poll\b|polling|swing state|battleground|2024 election|2025 election|2026 election|primary election|general election|runoff/.test(combined)) {
      return "Elections";
    }
    
    // World/General
    if (/climate|weather|environment|hurricane|earthquake|wildfire|flood|drought|pandemic|covid|virus|outbreak|health|who\b|cdc\b/.test(combined)) {
      return "World";
    }
    
    return "World"; // Default fallback
  };

  // Helper to get category badge color
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      "Crypto": "bg-orange-500/20 text-orange-400 border-orange-500/30",
      "Politics": "bg-blue-500/20 text-blue-400 border-blue-500/30",
      "Sports": "bg-green-500/20 text-green-400 border-green-500/30",
      "Tech": "bg-purple-500/20 text-purple-400 border-purple-500/30",
      "Finance": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      "Earnings": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      "Geopolitics": "bg-red-500/20 text-red-400 border-red-500/30",
      "Culture": "bg-pink-500/20 text-pink-400 border-pink-500/30",
      "Economy": "bg-teal-500/20 text-teal-400 border-teal-500/30",
      "Elections": "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
      "World": "bg-slate-500/20 text-slate-400 border-slate-500/30",
    };
    return colors[category] || colors["World"];
  };

  const filteredMarkets = useMemo(() => {
    if (!markets) return [];
    return markets.filter(market => {
      const matchesSearch = searchQuery === "" || 
        market.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        market.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (selectedCategory === "All") return matchesSearch;
      
      const normalizedMarketCategory = normalizeCategory(market.category, market.title);
      return matchesSearch && normalizedMarketCategory === selectedCategory;
    });
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

  // Navigation tabs - matching Polymarket
  const mainTabs = [
    { id: "trending", label: "Trending" },
    { id: "breaking", label: "Breaking" },
    { id: "new", label: "New" },
  ];

  // Navigation categories - matching Polymarket exactly
  const navCategories = ["Politics", "Sports", "Finance", "Crypto", "Geopolitics", "Earnings", "Tech", "Culture", "World", "Economy", "Elections"];

  // Filter categories for pills
  const filterCategories = ["All", ...navCategories];

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
                    <Skeleton key={i} className="h-20 rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredMarkets?.map((market, index) => {
                    const yesPrice = ((market.yes_price || 0) * 100).toFixed(0);
                    const yesPercentage = (market.yes_price || 0) * 100;
                    
                    return (
                      <div
                        key={market.id}
                        className="flex items-center gap-4 py-4 px-2 hover:bg-muted/30 rounded-lg transition-colors cursor-pointer group border-b border-border/30 last:border-0"
                        onClick={() => navigate(`/market/${market.market_id}`)}
                      >
                        {/* Rank Number */}
                        <span className="text-muted-foreground text-sm w-6 shrink-0">{index + 1}</span>
                        
                        {/* Market Image */}
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-muted shrink-0">
                          {market.image_url ? (
                            <img 
                              src={market.image_url} 
                              alt={market.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                              <span className="text-xs font-bold text-muted-foreground">
                                {market.title.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Market Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                              {market.title}
                            </h3>
                            <Badge variant="outline" className={`shrink-0 text-xs px-2 py-0.5 border ${getCategoryColor(normalizeCategory(market.category, market.title))}`}>
                              {normalizeCategory(market.category, market.title)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-semibold text-foreground">{yesPrice}%</span>
                            <span className="text-sm text-primary flex items-center gap-0.5">
                              <TrendingUp className="w-3 h-3" />
                              0%
                            </span>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="hidden md:flex items-center gap-3 w-32">
                          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary rounded-full transition-all duration-500"
                              style={{ width: `${yesPercentage}%` }}
                            />
                          </div>
                        </div>
                        
                        {/* Arrow */}
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors shrink-0" />
                      </div>
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