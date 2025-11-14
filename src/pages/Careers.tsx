import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { MapPin, Clock, Briefcase, ArrowRight } from "lucide-react";

const Careers = () => {
  const openings = [
    {
      title: "Senior Full Stack Engineer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      description: "Build scalable data pipelines and beautiful visualizations for prediction markets."
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      description: "Craft intuitive user experiences that make complex data accessible to everyone."
    },
    {
      title: "Data Scientist",
      department: "Analytics",
      location: "Remote / Hybrid",
      type: "Full-time",
      description: "Develop predictive models and analytics to surface market insights."
    },
    {
      title: "Developer Relations Engineer",
      department: "Community",
      location: "Remote",
      type: "Full-time",
      description: "Build relationships with our developer community and create technical content."
    },
    {
      title: "Marketing Manager",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
      description: "Drive growth strategies and build brand awareness in the prediction market space."
    }
  ];

  const benefits = [
    "Competitive salary & equity",
    "Health, dental & vision insurance",
    "Unlimited PTO",
    "Remote-first culture",
    "Learning & development budget",
    "Latest tech & equipment",
    "Flexible working hours",
    "Team retreats & events"
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
              Join Our Team
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We don't accept applications. You must be referred by someone on the team or find a creative way to prove you belong here. Think of it as your first challenge.
            </p>
          </div>
        </div>
      </section>

      {/* Why Join Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold gradient-text mb-12 text-center animate-fade-in">
              Why OddsMap?
            </h2>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="glass p-8 rounded-xl space-y-4 animate-fade-in hover:glass-strong transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-2xl">🚀</span>
                </div>
                <h3 className="text-xl font-semibold">Impact</h3>
                <p className="text-muted-foreground text-sm">
                  Work on products used by thousands of traders daily. Your code will directly shape how people interact with prediction markets.
                </p>
              </div>

              <div className="glass p-8 rounded-xl space-y-4 animate-fade-in hover:glass-strong transition-all duration-300" style={{ animationDelay: '0.1s' }}>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-2xl">🌱</span>
                </div>
                <h3 className="text-xl font-semibold">Growth</h3>
                <p className="text-muted-foreground text-sm">
                  Learn from industry experts, work with cutting-edge technologies, and grow your career in a supportive environment.
                </p>
              </div>

              <div className="glass p-8 rounded-xl space-y-4 animate-fade-in hover:glass-strong transition-all duration-300" style={{ animationDelay: '0.2s' }}>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-semibold">Culture</h3>
                <p className="text-muted-foreground text-sm">
                  Join a diverse, collaborative team that values transparency, innovation, and work-life balance.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold gradient-text mb-12 text-center animate-fade-in">
              Open Positions
            </h2>
            
            <div className="space-y-4">
              {openings.map((job, index) => (
                <div
                  key={index}
                  className="glass p-6 rounded-xl hover:glass-strong transition-all duration-300 group cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-xl font-semibold group-hover:gradient-text transition-all">
                          {job.title}
                        </h3>
                        <span className="text-xs px-3 py-1 rounded-full bg-primary/20 text-primary">
                          {job.department}
                        </span>
                      </div>
                      
                      <p className="text-muted-foreground text-sm">{job.description}</p>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {job.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {job.department}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <span className="px-3 py-1 rounded-full bg-muted/50 border border-border">
                        Referral Required
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold gradient-text mb-12 text-center animate-fade-in">
              Benefits & Perks
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="glass p-6 rounded-xl flex items-center gap-3 hover:glass-strong transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How to Get In Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto space-y-12">
            <div className="glass-strong p-12 rounded-2xl text-center space-y-6 animate-fade-in">
              <h2 className="text-3xl font-bold gradient-text">How to Get In</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We believe in earned opportunities, not open applications. Here's how you can join our team:
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="glass p-8 rounded-xl space-y-4 animate-fade-in hover:glass-strong transition-all duration-300">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-2xl">🤝</span>
                </div>
                <h3 className="text-xl font-semibold">Get Referred</h3>
                <p className="text-muted-foreground text-sm">
                  Know someone on our team? Ask them for a referral. Our team members know what it takes to succeed here and can vouch for your skills.
                </p>
              </div>

              <div className="glass p-8 rounded-xl space-y-4 animate-fade-in hover:glass-strong transition-all duration-300" style={{ animationDelay: '0.1s' }}>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-xl font-semibold">Build Something</h3>
                <p className="text-muted-foreground text-sm">
                  Create something remarkable using our data or APIs. Show us you understand prediction markets and can build innovative solutions.
                </p>
              </div>

              <div className="glass p-8 rounded-xl space-y-4 animate-fade-in hover:glass-strong transition-all duration-300" style={{ animationDelay: '0.2s' }}>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-2xl">✍️</span>
                </div>
                <h3 className="text-xl font-semibold">Contribute Value</h3>
                <p className="text-muted-foreground text-sm">
                  Write insightful analysis, contribute to our community, or share valuable market insights. Demonstrate expertise that catches our attention.
                </p>
              </div>

              <div className="glass p-8 rounded-xl space-y-4 animate-fade-in hover:glass-strong transition-all duration-300" style={{ animationDelay: '0.3s' }}>
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <span className="text-2xl">💡</span>
                </div>
                <h3 className="text-xl font-semibold">Be Creative</h3>
                <p className="text-muted-foreground text-sm">
                  Find a unique way to stand out. Solve a problem we have, identify an opportunity we're missing, or show initiative that impresses us.
                </p>
              </div>
            </div>

            <div className="glass p-8 rounded-xl text-center space-y-4 animate-fade-in">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Remember:</span> We're not looking for people who can fill out a form. 
                We're looking for people who can figure things out, take initiative, and earn their way in.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;