import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Check } from "lucide-react";

const Pricing = () => {
  const plans = [
    {
      name: "Free",
      price: "0",
      description: "Perfect for getting started",
      features: [
        "Basic market analytics",
        "Up to 10 saved markets",
        "Daily market summaries",
        "Community support",
        "Basic wallet tracking"
      ],
      cta: "Get Started",
      highlighted: false
    },
    {
      name: "Pro",
      price: "29",
      description: "For serious traders",
      features: [
        "Everything in Free",
        "Unlimited saved markets",
        "Real-time alerts",
        "Advanced wallet analytics",
        "Whale movement tracking",
        "Priority support",
        "Export data & reports",
        "Custom dashboards"
      ],
      cta: "Start Free Trial",
      highlighted: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "For teams and institutions",
      features: [
        "Everything in Pro",
        "Dedicated account manager",
        "Custom integrations",
        "API access",
        "Team collaboration tools",
        "Advanced security",
        "SLA guarantee",
        "Custom training"
      ],
      cta: "Contact Sales",
      highlighted: false
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
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that's right for you. All plans include a 14-day free trial.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`rounded-2xl p-8 space-y-6 animate-fade-in transition-all duration-300 ${
                  plan.highlighted
                    ? 'glass-strong border-2 border-primary scale-105 hover:scale-110'
                    : 'glass hover:glass-strong'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {plan.highlighted && (
                  <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-primary to-secondary text-primary-foreground text-xs font-semibold">
                    Most Popular
                  </div>
                )}
                
                <div>
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </div>
                
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold gradient-text">
                    {plan.price === "Custom" ? plan.price : `$${plan.price}`}
                  </span>
                  {plan.price !== "Custom" && (
                    <span className="text-muted-foreground">/month</span>
                  )}
                </div>
                
                <button
                  className={`w-full py-3 rounded-lg font-semibold transition-all ${
                    plan.highlighted
                      ? 'bg-gradient-to-r from-primary to-secondary text-primary-foreground hover:opacity-90'
                      : 'border-2 border-border hover:bg-muted/50'
                  }`}
                >
                  {plan.cta}
                </button>
                
                <div className="space-y-3 pt-4">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold gradient-text mb-12 text-center animate-fade-in">
              Frequently Asked Questions
            </h2>
            
            <div className="space-y-4">
              {[
                {
                  q: "Can I change plans later?",
                  a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately."
                },
                {
                  q: "What payment methods do you accept?",
                  a: "We accept all major credit cards, PayPal, and wire transfers for enterprise plans."
                },
                {
                  q: "Is there a long-term commitment?",
                  a: "No. All plans are month-to-month. You can cancel anytime with no penalties."
                },
                {
                  q: "Do you offer refunds?",
                  a: "Yes. We offer a 30-day money-back guarantee for all paid plans."
                }
              ].map((faq, index) => (
                <div
                  key={index}
                  className="glass p-6 rounded-xl hover:glass-strong transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <h3 className="font-semibold mb-2">{faq.q}</h3>
                  <p className="text-muted-foreground text-sm">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Pricing;