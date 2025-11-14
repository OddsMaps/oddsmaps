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
              Help us build the future of prediction market intelligence. We're looking for talented individuals who are passionate about data, design, and innovation.
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
                    
                    <button className="flex items-center gap-2 text-primary hover:gap-3 transition-all">
                      Apply
                      <ArrowRight className="w-4 h-4" />
                    </button>
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

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto glass-strong p-12 rounded-2xl text-center space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold gradient-text">Don't See a Perfect Match?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're always looking for talented people. Send us your resume and tell us why you'd be a great fit for OddsMap.
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity">
              Send General Application
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Careers;