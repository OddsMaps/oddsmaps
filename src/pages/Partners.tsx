import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Handshake, Target, Zap, Trophy } from "lucide-react";

const Partners = () => {
  const benefits = [
    {
      icon: Handshake,
      title: "Strategic Collaboration",
      description: "Work closely with our team to create integrated solutions"
    },
    {
      icon: Target,
      title: "Market Access",
      description: "Reach thousands of active prediction market traders"
    },
    {
      icon: Zap,
      title: "Technical Support",
      description: "Get dedicated technical support and integration assistance"
    },
    {
      icon: Trophy,
      title: "Co-Marketing",
      description: "Joint marketing initiatives and promotional opportunities"
    }
  ];

  const partnerTypes = [
    {
      title: "Technology Partners",
      description: "Integrate your platform or service with OddsMap's ecosystem",
      examples: ["Prediction market platforms", "Wallet providers", "Data providers", "Analytics tools"]
    },
    {
      title: "Affiliate Partners",
      description: "Earn commissions by referring users to OddsMap",
      examples: ["Content creators", "Trading communities", "Financial bloggers", "Market analysts"]
    },
    {
      title: "Integration Partners",
      description: "Build custom integrations and tools using our API",
      examples: ["Trading bots", "Portfolio trackers", "News aggregators", "Social platforms"]
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
              Partner with OddsMap
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join our partner ecosystem and help shape the future of prediction market intelligence
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold gradient-text mb-12 text-center animate-fade-in">
              Partnership Benefits
            </h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="glass p-6 rounded-xl hover:glass-strong transition-all duration-300 text-center space-y-4 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-16 h-16 mx-auto rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <benefit.icon className="w-8 h-8 text-primary-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partner Types */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold gradient-text mb-12 text-center animate-fade-in">
              Partnership Opportunities
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              {partnerTypes.map((type, index) => (
                <div
                  key={index}
                  className="glass p-8 rounded-xl hover:glass-strong transition-all duration-300 space-y-4 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <h3 className="text-2xl font-semibold gradient-text">{type.title}</h3>
                  <p className="text-muted-foreground">{type.description}</p>
                  <div className="space-y-2 pt-4">
                    <p className="text-sm font-semibold">Examples:</p>
                    <ul className="space-y-2">
                      {type.examples.map((example, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {example}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Current Partners */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto glass p-12 rounded-2xl text-center space-y-8 animate-fade-in">
            <h2 className="text-3xl font-bold gradient-text">Trusted By Industry Leaders</h2>
            <p className="text-muted-foreground">
              We're proud to partner with the best in prediction markets and fintech
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-8">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="h-24 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center hover:scale-105 transition-transform duration-300"
                >
                  <span className="text-2xl font-bold text-muted-foreground/30">Logo</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Application Process */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold gradient-text mb-12 text-center animate-fade-in">
              How to Become a Partner
            </h2>
            
            <div className="space-y-6">
              {[
                { step: "1", title: "Submit Application", desc: "Fill out our partner application form" },
                { step: "2", title: "Initial Review", desc: "Our team will review your application within 5 business days" },
                { step: "3", title: "Partnership Discussion", desc: "Schedule a call to discuss opportunities and alignment" },
                { step: "4", title: "Agreement & Onboarding", desc: "Sign partnership agreement and get onboarded" }
              ].map((item, index) => (
                <div
                  key={index}
                  className="glass p-6 rounded-xl hover:glass-strong transition-all duration-300 flex items-start gap-4 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 font-bold text-xl text-primary-foreground">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-1">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto glass-strong p-12 rounded-2xl text-center space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold gradient-text">Ready to Partner?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Let's build the future of prediction markets together
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <button className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
                Apply Now
              </button>
              <a
                href="/contact"
                className="px-8 py-3 border-2 border-border bg-transparent hover:bg-muted/50 rounded-lg font-semibold transition-colors"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Partners;