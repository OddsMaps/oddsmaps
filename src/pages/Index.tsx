import Hero from "@/components/Hero";
import MarketMap from "@/components/MarketMap";
import SearchBar from "@/components/SearchBar";
import Analytics from "@/components/Analytics";
import HowItWorks from "@/components/HowItWorks";
import Community from "@/components/Community";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Hero />
      <MarketMap />
      <SearchBar />
      <Analytics />
      <HowItWorks />
      <Community />
      <Footer />
    </div>
  );
};

export default Index;
