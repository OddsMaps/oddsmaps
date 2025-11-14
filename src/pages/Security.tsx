import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Lock, Eye, AlertTriangle } from "lucide-react";

const Security = () => {
  const practices = [
    {
      icon: Shield,
      title: "Data Encryption",
      description: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption."
    },
    {
      icon: Lock,
      title: "Access Controls",
      description: "Strict access controls and authentication mechanisms protect your account and data."
    },
    {
      icon: Eye,
      title: "Privacy First",
      description: "We collect only necessary data and never sell your personal information to third parties."
    },
    {
      icon: AlertTriangle,
      title: "Incident Response",
      description: "24/7 monitoring and rapid response protocols to address any security concerns."
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
              Security at OddsMap
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your security and privacy are our top priorities. Learn how we protect your data.
            </p>
          </div>
        </div>
      </section>

      {/* Security Practices */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-6">
            {practices.map((practice, index) => (
              <div
                key={index}
                className="glass p-8 rounded-xl hover:glass-strong transition-all duration-300 space-y-4 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                  <practice.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-2xl font-semibold">{practice.title}</h3>
                <p className="text-muted-foreground">{practice.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Detailed Information */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto glass p-12 rounded-2xl space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold gradient-text">Infrastructure Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our infrastructure is hosted on enterprise-grade cloud platforms with built-in security features, regular security audits, and compliance certifications. We implement multi-layered security controls including firewalls, intrusion detection systems, and DDoS protection.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold gradient-text">Application Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We follow secure development practices including:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Regular security testing and code reviews</li>
                <li>Dependency scanning and updates</li>
                <li>Input validation and sanitization</li>
                <li>Protection against common vulnerabilities (OWASP Top 10)</li>
                <li>Rate limiting and abuse prevention</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold gradient-text">Data Protection</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your data is protected through:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>End-to-end encryption for sensitive data</li>
                <li>Regular automated backups</li>
                <li>Secure data deletion procedures</li>
                <li>Minimal data retention policies</li>
                <li>Anonymization of analytics data</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold gradient-text">Compliance & Certifications</h2>
              <p className="text-muted-foreground leading-relaxed">
                We maintain compliance with industry standards and regulations including GDPR, CCPA, and SOC 2. Our security practices are regularly audited by independent third parties.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold gradient-text">Responsible Disclosure</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you discover a security vulnerability, please report it to security@oddsmap.io. We appreciate responsible disclosure and will work with you to address any issues promptly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto glass-strong p-12 rounded-2xl text-center space-y-6 animate-fade-in">
            <h2 className="text-3xl font-bold gradient-text">Questions About Security?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our security team is here to help. Contact us for more information.
            </p>
            <a
              href="/contact"
              className="inline-block px-8 py-3 bg-gradient-to-r from-primary to-secondary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Contact Security Team
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Security;