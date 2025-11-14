import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold gradient-text">
              Terms of Service
            </h1>
            <p className="text-xl text-muted-foreground">
              Last updated: December 2024
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto glass p-12 rounded-2xl space-y-8 animate-fade-in">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold gradient-text">Acceptance of Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing and using OddsMap, you accept and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our service.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold gradient-text">Description of Service</h2>
              <p className="text-muted-foreground leading-relaxed">
                OddsMap provides data visualization and analytics tools for prediction markets. We aggregate publicly available data from various prediction market platforms to help users make informed decisions.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold gradient-text">User Accounts</h2>
              <p className="text-muted-foreground leading-relaxed">
                When you create an account, you must provide accurate information. You are responsible for maintaining the confidentiality of your account and password. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Provide true, accurate, and complete information</li>
                <li>Maintain and update your information</li>
                <li>Keep your password secure</li>
                <li>Notify us immediately of unauthorized use</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold gradient-text">Acceptable Use</h2>
              <p className="text-muted-foreground leading-relaxed">
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Use the service for illegal purposes</li>
                <li>Attempt to gain unauthorized access</li>
                <li>Interfere with the service's operation</li>
                <li>Scrape or copy data without permission</li>
                <li>Impersonate others or misrepresent your identity</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold gradient-text">Intellectual Property</h2>
              <p className="text-muted-foreground leading-relaxed">
                All content, features, and functionality of OddsMap are owned by us or our licensors and are protected by international copyright, trademark, and other intellectual property laws.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold gradient-text">Disclaimer of Warranties</h2>
              <p className="text-muted-foreground leading-relaxed">
                OddsMap is provided "as is" without warranties of any kind. We do not guarantee the accuracy, completeness, or usefulness of any information on the platform. Use of prediction market data is at your own risk.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold gradient-text">Limitation of Liability</h2>
              <p className="text-muted-foreground leading-relaxed">
                To the maximum extent permitted by law, OddsMap shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold gradient-text">Changes to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of any material changes. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold gradient-text">Contact Information</h2>
              <p className="text-muted-foreground leading-relaxed">
                For questions about these Terms of Service, please contact us at legal@oddsmap.io
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;