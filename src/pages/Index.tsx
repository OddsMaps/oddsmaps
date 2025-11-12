import Hero from "@/components/Hero";
import MarketMapLive from "@/components/MarketMapLive";
import SearchBar from "@/components/SearchBar";
import AnalyticsLive from "@/components/AnalyticsLive";
import HowItWorks from "@/components/HowItWorks";
import Community from "@/components/Community";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Hero />
      <MarketMapLive />
      <SearchBar />
      <AnalyticsLive />
      <HowItWorks />
      <Community />
      <Footer />
    </div>
  );
};

export default Index;
