import Header from "@/components/Header";
import Hero from "@/components/Hero";
import SearchBar from "@/components/SearchBar";
import AnalyticsLive from "@/components/AnalyticsLive";
import HowItWorks from "@/components/HowItWorks";
import Community from "@/components/Community";
import Footer from "@/components/Footer";

const Index = () => {
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
