import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MessageSquare, Users, Heart, Award, TrendingUp, Zap } from "lucide-react";

const CommunityPage = () => {
  const stats = [
    { value: "10K+", label: "Active Users", icon: Users },
    { value: "50K+", label: "Markets Tracked", icon: TrendingUp },
    { value: "1M+", label: "Transactions Analyzed", icon: Zap },
    { value: "99%", label: "User Satisfaction", icon: Heart }
  ];

  const channels = [
    {
      icon: MessageSquare,
      name: "Discord Server",
      description: "Join our active community, get help, and discuss markets in real-time",
      members: "5,000+ members",
      link: "#"
    },
    {
      icon: Users,
      name: "Twitter Community",
      description: "Follow us for updates, tips, and engage with other traders",
      members: "10,000+ followers",
      link: "#"
    },
    {
      icon: Award,
      name: "Trading Forum",
      description: "Share strategies, insights, and learn from experienced traders",
      members: "3,000+ members",
      link: "#"
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
              Join Our Community
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Connect with thousands of traders, share insights, and learn from the best in prediction markets
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="glass p-6 rounded-xl text-center space-y-2 hover:glass-strong transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <stat.icon className="w-8 h-8 mx-auto text-primary" />
                <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community Channels */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold gradient-text mb-12 text-center animate-fade-in">
              Where to Find Us
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {channels.map((channel, index) => (
                <div
                  key={index}
                  className="glass p-8 rounded-xl hover:glass-strong transition-all duration-300 space-y-4 animate-fade-in group cursor-pointer"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <channel.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold group-hover:gradient-text transition-all">
                    {channel.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">{channel.description}</p>
                  <p className="text-xs text-primary">{channel.members}</p>
                  <button className="text-sm text-primary hover:underline">Join Now →</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Community Guidelines */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto glass p-12 rounded-2xl space-y-8 animate-fade-in">
            <h2 className="text-3xl font-bold gradient-text text-center">Community Guidelines</h2>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Be Respectful</h3>
                <p className="text-muted-foreground">
                  Treat all community members with respect. Harassment, hate speech, and discriminatory behavior will not be tolerated.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Share Knowledge</h3>
                <p className="text-muted-foreground">
                  Help others learn and grow. Share your insights, strategies, and experiences to benefit the entire community.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">Stay On Topic</h3>
                <p className="text-muted-foreground">
                  Keep discussions relevant to prediction markets, trading strategies, and OddsMap features.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-semibold">No Spam or Self-Promotion</h3>
                <p className="text-muted-foreground">
                  Avoid excessive self-promotion, spam, or unsolicited advertising. Share value, not sales pitches.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto glass-strong p-12 rounded-2xl text-center space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold gradient-text">Ready to Join?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Become part of the fastest-growing prediction market community
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Join Discord Community
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CommunityPage;