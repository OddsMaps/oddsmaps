import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Calendar, Clock, ArrowRight } from "lucide-react";

const Blog = () => {
  const posts = [
    {
      title: "Understanding Prediction Market Dynamics",
      excerpt: "A deep dive into how prediction markets work and what drives price movements in real-time betting scenarios.",
      category: "Education",
      date: "Dec 15, 2024",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop"
    },
    {
      title: "Wallet Tracking: The Ultimate Guide",
      excerpt: "Learn how to track and analyze wallet behavior to identify market trends and make smarter betting decisions.",
      category: "Tutorial",
      date: "Dec 10, 2024",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=400&fit=crop"
    },
    {
      title: "Market Visualization Best Practices",
      excerpt: "Discover the principles behind effective data visualization and how to interpret complex market signals.",
      category: "Design",
      date: "Dec 5, 2024",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=400&fit=crop"
    },
    {
      title: "Real-Time Analytics Architecture",
      excerpt: "Behind the scenes: how we process millions of transactions to deliver instant market insights.",
      category: "Technical",
      date: "Nov 28, 2024",
      readTime: "10 min read",
      image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=400&fit=crop"
    },
    {
      title: "The Future of Prediction Markets",
      excerpt: "Exploring emerging trends and technologies shaping the next generation of betting platforms.",
      category: "Industry",
      date: "Nov 20, 2024",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?w=800&h=400&fit=crop"
    },
    {
      title: "Advanced Trading Strategies",
      excerpt: "Professional tips and techniques for maximizing returns in prediction markets.",
      category: "Strategy",
      date: "Nov 15, 2024",
      readTime: "12 min read",
      image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&h=400&fit=crop"
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
              Blog & Insights
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Expert analysis, tutorials, and industry insights from the OddsMap team
            </p>
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto glass-strong rounded-2xl overflow-hidden hover:glow-blue transition-all duration-300 animate-fade-in">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="h-64 md:h-auto bg-gradient-to-br from-primary/20 to-secondary/20" />
              <div className="p-8 md:p-12 flex flex-col justify-center space-y-4">
                <span className="text-primary text-sm font-semibold">Featured Post</span>
                <h2 className="text-3xl font-bold">Understanding Prediction Market Dynamics</h2>
                <p className="text-muted-foreground">
                  A comprehensive guide to how prediction markets work, including market mechanics, 
                  price discovery, and the psychology of betting.
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Dec 15, 2024
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    8 min read
                  </span>
                </div>
                <button className="flex items-center gap-2 text-primary hover:gap-3 transition-all group">
                  Read Article
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, index) => (
              <article
                key={index}
                className="glass rounded-xl overflow-hidden hover:glass-strong transition-all duration-300 group animate-fade-in cursor-pointer"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="h-48 bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <span className="text-xs font-semibold text-primary">{post.category}</span>
                  <h3 className="text-xl font-semibold group-hover:gradient-text transition-all">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground pt-2">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {post.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.readTime}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto glass-strong p-12 rounded-2xl text-center space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold gradient-text">Stay Updated</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get the latest insights, tutorials, and market analysis delivered to your inbox.
            </p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg bg-background/50 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="px-6 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;