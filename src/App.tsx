import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PasswordGate from "./components/PasswordGate";
import Index from "./pages/Index";
import Markets from "./pages/Markets";
import MarketDetail from "./pages/MarketDetail";
import WalletProfile from "./pages/WalletProfile";
import BetDetail from "./pages/BetDetail";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import Blog from "./pages/Blog";
import Careers from "./pages/Careers";
import Contact from "./pages/Contact";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Security from "./pages/Security";
import Cookies from "./pages/Cookies";
import HelpCenter from "./pages/HelpCenter";
import CommunityPage from "./pages/Community";
import Partners from "./pages/Partners";
import Status from "./pages/Status";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PasswordGate>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/markets" element={<Markets />} />
            <Route path="/market/:marketId" element={<MarketDetail />} />
            <Route path="/wallet/:address" element={<WalletProfile />} />
            <Route path="/bet/:txId" element={<BetDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/security" element={<Security />} />
            <Route path="/cookies" element={<Cookies />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/partners" element={<Partners />} />
            <Route path="/status" element={<Status />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </PasswordGate>
      </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );

export default App;
