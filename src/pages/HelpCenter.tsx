import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Search, Book, MessageCircle, FileText, Video, Lightbulb } from "lucide-react";

const HelpCenter = () => {
  const categories = [
    {
      icon: Book,
      title: "Getting Started",
      description: "Learn the basics of using OddsMap",
      articles: 12
    },
    {
      icon: MessageCircle,
      title: "Account & Billing",
      description: "Manage your account and subscriptions",
      articles: 8
    },
    {
      icon: FileText,
      title: "Features & Tools",
      description: "Deep dive into our analytics tools",
      articles: 15
    },
    {
      icon: Video,
      title: "Video Tutorials",
      description: "Watch step-by-step guides",
      articles: 6
    },
    {
      icon: Lightbulb,
      title: "Tips & Tricks",
      description: "Pro tips for advanced users",
      articles: 10
    }
  ];

  const popularArticles = [
    "How to track a specific wallet",
    "Understanding bubble map visualizations",
    "Setting up price alerts",
    "Analyzing market trends",
    "Comparing multiple markets",
    "Exporting data and reports"
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
              Help Center
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find answers to your questions and learn how to get the most out of OddsMap
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mt-8">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search for help..."
                  className="w-full pl-12 pr-4 py-4 rounded-xl glass focus:glass-strong focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <div
                key={index}
                className="glass p-8 rounded-xl hover:glass-strong transition-all duration-300 cursor-pointer animate-fade-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <category.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2 group-hover:gradient-text transition-all">
                  {category.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">{category.description}</p>
                <span className="text-xs text-primary">{category.articles} articles</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold gradient-text mb-12 text-center animate-fade-in">
              Popular Articles
            </h2>
            
            <div className="space-y-3">
              {popularArticles.map((article, index) => (
                <div
                  key={index}
                  className="glass p-6 rounded-xl hover:glass-strong transition-all duration-300 cursor-pointer animate-fade-in flex items-center justify-between group"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <span className="text-muted-foreground group-hover:text-foreground group-hover:gradient-text transition-all">
                    {article}
                  </span>
                  <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto glass-strong p-12 rounded-2xl text-center space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold gradient-text">Still Need Help?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is ready to assist you.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="/contact"
                className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                Contact Support
              </a>
              <button className="px-8 py-3 border-2 border-border bg-transparent hover:bg-muted/50 rounded-lg font-semibold transition-colors">
                Join Community
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HelpCenter;