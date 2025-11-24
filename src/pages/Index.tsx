import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import AnalyticsLive from "@/components/AnalyticsLive";
import { AllTransactions } from "@/components/AllTransactions";
import { LiveWalletDistribution } from "@/components/LiveWalletDistribution";
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
      <div id="analytics">
        <AnalyticsLive />
      </div>
      <div id="whale-activity" className="container mx-auto px-4 py-16">
        <AllTransactions />
      </div>
      <div id="wallet-distribution">
        <LiveWalletDistribution />
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
