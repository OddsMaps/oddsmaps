import { Sparkles, Eye, Lightbulb } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: Sparkles,
      title: "Connect",
      description: "Access live data from Kalshi and Polymarket prediction markets in real-time",
      gradient: "from-primary to-secondary",
    },
    {
      icon: Eye,
      title: "Visualize",
      description: "Transform complex odds and transactions into intuitive, interactive visual maps",
      gradient: "from-secondary to-accent",
    },
    {
      icon: Lightbulb,
      title: "Predict",
      description: "Spot trends, momentum shifts, and opportunities before the crowd does",
      gradient: "from-accent to-primary",
    },
  ];

  return (
    <section className="relative py-24 px-6 overflow-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-secondary/20 rounded-full blur-[200px]" />
      </div>

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4 animate-slide-up">
          <h2 className="text-5xl font-bold">
            <span className="gradient-text">How It Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Three simple steps to unlock visual intelligence for prediction markets
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div
              key={i}
              className="relative group"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              {/* Connection Line */}
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-24 left-full w-full h-0.5 bg-gradient-to-r from-primary/50 to-transparent -translate-x-1/2 z-0" />
              )}

              {/* Card */}
              <div className="relative glass-strong rounded-3xl p-8 hover:scale-105 transition-all duration-500 group cursor-pointer">
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-2xl font-bold glow-pink">
                  {i + 1}
                </div>

                {/* Icon with 3D effect */}
                <div className="relative mb-6">
                  <div className={`absolute inset-0 bg-gradient-to-br ${step.gradient} rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity animate-pulse-glow`} />
                  <div className={`relative w-24 h-24 mx-auto bg-gradient-to-br ${step.gradient} rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform duration-500`}>
                    <step.icon className="w-12 h-12 text-white" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-4 gradient-text text-center">
                  {step.title}
                </h3>
                <p className="text-muted-foreground text-center leading-relaxed">
                  {step.description}
                </p>

                {/* Decorative Elements */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>

        {/* Data Flow Animation */}
        <div className="mt-20 glass-strong rounded-3xl p-8 text-center">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="px-6 py-3 glass rounded-full font-semibold animate-fade-in">
              Kalshi API
            </div>
            <div className="text-primary animate-pulse-glow text-2xl">→</div>
            <div className="px-6 py-3 glass rounded-full font-semibold animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Polymarket API
            </div>
            <div className="text-secondary animate-pulse-glow text-2xl" style={{ animationDelay: '0.2s' }}>→</div>
            <div className="px-6 py-3 glass-strong rounded-full font-semibold gradient-text animate-fade-in glow-gradient" style={{ animationDelay: '0.4s' }}>
              OddsMap Intelligence
            </div>
            <div className="text-accent animate-pulse-glow text-2xl" style={{ animationDelay: '0.4s' }}>→</div>
            <div className="px-6 py-3 glass rounded-full font-semibold animate-fade-in" style={{ animationDelay: '0.6s' }}>
              Your Insights
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
