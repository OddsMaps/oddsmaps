import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import MarketMapLive from "@/components/MarketMapLive";
import AnalyticsLive from "@/components/AnalyticsLive";
import WalletBubbleMap from "@/components/WalletBubbleMap";
import { AllTransactions } from "@/components/AllTransactions";
import HowItWorks from "@/components/HowItWorks";
import Community from "@/components/Community";
import Footer from "@/components/Footer";
import { usePolymarketSync } from "@/hooks/usePolymarketSync";

const Index = () => {
  // Initialize Polymarket data sync
  usePolymarketSync();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Header />
      <div id="home">
        <Hero />
      </div>
      <SearchBar />
      <div id="trending-markets">
        <MarketMapLive />
      </div>
      <div id="analytics">
        <AnalyticsLive />
      </div>
      <div id="whale-activity">
        <WalletBubbleMap />
      </div>
      <div className="container mx-auto px-4 py-16">
        <AllTransactions />
      </div>
      <div id="how-it-works">
        <HowItWorks />
      </div>
      <div id="community">
        <Community />
      </div>
      <Footer />
    </div>
  );
};

export default Index;
