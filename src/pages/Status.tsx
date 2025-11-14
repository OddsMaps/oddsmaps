import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CheckCircle2, AlertCircle, Clock } from "lucide-react";

const Status = () => {
  const services = [
    {
      name: "API Services",
      status: "operational",
      uptime: "99.99%",
      responseTime: "45ms"
    },
    {
      name: "Web Application",
      status: "operational",
      uptime: "99.98%",
      responseTime: "120ms"
    },
    {
      name: "Data Processing",
      status: "operational",
      uptime: "99.95%",
      responseTime: "200ms"
    },
    {
      name: "Real-time Updates",
      status: "operational",
      uptime: "99.97%",
      responseTime: "80ms"
    },
    {
      name: "Database",
      status: "operational",
      uptime: "99.99%",
      responseTime: "15ms"
    }
  ];

  const recentIncidents = [
    {
      date: "Dec 10, 2024",
      title: "Database Maintenance",
      status: "resolved",
      description: "Scheduled maintenance completed successfully. All services restored."
    },
    {
      date: "Dec 1, 2024",
      title: "API Rate Limiting",
      status: "resolved",
      description: "Temporary rate limiting adjustments. Services operating normally."
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "operational":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "degraded":
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case "down":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "operational":
        return "text-green-500";
      case "degraded":
        return "text-yellow-500";
      case "down":
        return "text-red-500";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
            <div className="inline-flex items-center gap-3 px-6 py-3 glass rounded-full">
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <span className="font-semibold">All Systems Operational</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold gradient-text">
              System Status
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Real-time status and performance metrics for all OddsMap services
            </p>
          </div>
        </div>
      </section>

      {/* Services Status */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold gradient-text mb-8 animate-fade-in">
              Service Status
            </h2>
            
            <div className="space-y-3">
              {services.map((service, index) => (
                <div
                  key={index}
                  className="glass p-6 rounded-xl hover:glass-strong transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="flex items-center gap-3 flex-1">
                      {getStatusIcon(service.status)}
                      <span className="font-semibold">{service.name}</span>
                    </div>
                    
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Uptime</div>
                        <div className="font-semibold text-green-500">{service.uptime}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-muted-foreground mb-1">Response</div>
                        <div className="font-semibold">{service.responseTime}</div>
                      </div>
                      <div className={`font-semibold capitalize ${getStatusColor(service.status)}`}>
                        {service.status}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Performance Metrics */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold gradient-text mb-8 animate-fade-in">
              Performance Metrics
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { label: "Average Uptime", value: "99.98%", sublabel: "Last 30 days" },
                { label: "API Response Time", value: "45ms", sublabel: "Average" },
                { label: "Data Latency", value: "< 1s", sublabel: "Real-time updates" }
              ].map((metric, index) => (
                <div
                  key={index}
                  className="glass p-8 rounded-xl text-center space-y-2 hover:glass-strong transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                  <div className="text-4xl font-bold gradient-text">{metric.value}</div>
                  <div className="text-xs text-muted-foreground">{metric.sublabel}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Recent Incidents */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold gradient-text mb-8 animate-fade-in">
              Recent Incidents
            </h2>
            
            {recentIncidents.length > 0 ? (
              <div className="space-y-4">
                {recentIncidents.map((incident, index) => (
                  <div
                    key={index}
                    className="glass p-6 rounded-xl hover:glass-strong transition-all duration-300 space-y-3 animate-fade-in"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                          <h3 className="font-semibold">{incident.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground ml-8">{incident.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">{incident.date}</div>
                        <div className="text-xs text-green-500 capitalize mt-1">{incident.status}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="glass p-12 rounded-xl text-center">
                <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
                <p className="text-muted-foreground">No incidents reported in the last 30 days</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Subscribe to Updates */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto glass-strong p-12 rounded-2xl text-center space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold gradient-text">Get Status Updates</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Subscribe to receive notifications about system status and planned maintenance
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

export default Status;