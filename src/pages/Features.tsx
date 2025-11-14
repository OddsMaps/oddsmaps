import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Activity, Wallet, TrendingUp, Zap, Shield, BarChart3 } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Activity,
      title: "Real-Time Market Analytics",
      description: "Track live market movements, price changes, and trading volume across multiple prediction markets.",
      highlights: ["Live data streams", "Price alerts", "Volume tracking", "Market depth analysis"]
    },
    {
      icon: Wallet,
      title: "Wallet Intelligence",
      description: "Follow big players, identify patterns, and track wallet behavior with our advanced wallet analytics.",
      highlights: ["Whale tracking", "Transaction history", "Win/loss records", "Behavioral patterns"]
    },
    {
      icon: TrendingUp,
      title: "Trend Analysis",
      description: "Identify market trends early with our sophisticated data analysis and visualization tools.",
      highlights: ["Momentum indicators", "Sentiment analysis", "Historical comparisons", "Predictive insights"]
    },
    {
      icon: BarChart3,
      title: "Visual Data Explorer",
      description: "Transform complex market data into beautiful, intuitive visualizations that tell the story.",
      highlights: ["Interactive charts", "Bubble maps", "Heat maps", "Custom dashboards"]
    },
    {
      icon: Zap,
      title: "Instant Notifications",
      description: "Never miss important market movements with customizable alerts and notifications.",
      highlights: ["Price alerts", "Whale movement alerts", "Market updates", "Custom triggers"]
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade infrastructure ensuring your data is always safe and accessible.",
      highlights: ["99.9% uptime", "Data encryption", "Regular backups", "Privacy-first"]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold gradient-text">
              Powerful Features
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need to make smarter decisions in prediction markets
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="glass p-8 rounded-xl hover:glass-strong transition-all duration-300 space-y-6 animate-fade-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-semibold mb-2 group-hover:gradient-text transition-all">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {feature.highlights.map((highlight, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <span className="text-muted-foreground">{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto glass-strong p-12 rounded-2xl text-center space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold gradient-text">Ready to Get Started?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of traders using OddsMap to make better predictions
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="/"
                className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Explore Markets
              </a>
              <a
                href="/pricing"
                className="px-8 py-3 border-2 border-border bg-transparent hover:bg-muted/50 rounded-lg font-semibold transition-colors"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Features;