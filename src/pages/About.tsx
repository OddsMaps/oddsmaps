import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Users, Target, Zap, Award } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Target,
      title: "Mission Driven",
      description: "We believe prediction markets should be accessible and understandable for everyone."
    },
    {
      icon: Zap,
      title: "Innovation First",
      description: "Pushing the boundaries of data visualization and market intelligence."
    },
    {
      icon: Users,
      title: "Community Focused",
      description: "Building tools that empower traders and enthusiasts alike."
    },
    {
      icon: Award,
      title: "Excellence",
      description: "Committed to delivering the highest quality insights and user experience."
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
              About OddsMap
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Transforming prediction market data into visual intelligence that empowers smarter trading decisions.
            </p>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto glass p-12 rounded-2xl space-y-8 animate-fade-in">
            <h2 className="text-3xl font-bold gradient-text">Our Story</h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>
                OddsMap was born from a simple observation: prediction markets generate vast amounts of valuable data, 
                but traditional interfaces make it difficult to see the bigger picture. Traders and analysts needed a 
                better way to visualize market movements, track wallet activity, and identify trends.
              </p>
              <p>
                We set out to create a platform that transforms raw market data into intuitive, beautiful visualizations. 
                By combining advanced data processing with cutting-edge design, we've built tools that make complex 
                market dynamics accessible to everyone—from casual bettors to professional traders.
              </p>
              <p>
                Today, OddsMap serves thousands of users across multiple prediction market platforms, providing 
                real-time insights and analytics that drive better decision-making. We're just getting started.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl font-bold gradient-text mb-4">Our Values</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="glass p-8 rounded-xl hover:glass-strong transition-all duration-300 animate-fade-in group"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <value.icon className="w-12 h-12 text-primary mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="text-xl font-semibold mb-2">{value.title}</h3>
                <p className="text-muted-foreground text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto glass-strong p-12 rounded-2xl text-center space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold gradient-text">Join Us on Our Journey</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're building the future of prediction market intelligence. Be part of our community.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <a
                href="/careers"
                className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
              >
                View Careers
              </a>
              <a
                href="/contact"
                className="px-8 py-3 border-2 border-border bg-transparent hover:bg-muted/50 rounded-lg font-semibold transition-colors"
              >
                Get in Touch
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;