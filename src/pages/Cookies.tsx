import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Cookies = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold gradient-text">
              Cookie Policy
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
              <h2 className="text-2xl font-bold gradient-text">What Are Cookies?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies are small text files that are placed on your device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our service.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold gradient-text">Types of Cookies We Use</h2>
              
              <div className="space-y-6 ml-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Essential Cookies</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    These cookies are necessary for the website to function properly. They enable core functionality such as security, network management, and accessibility. You cannot opt-out of these cookies.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Analytics Cookies</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our service.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Functional Cookies</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Performance Cookies</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    These cookies help us understand and improve the performance of our website by tracking page load times and other metrics.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold gradient-text">Managing Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                You can control and manage cookies in various ways:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Browser settings: Most browsers allow you to refuse or accept cookies</li>
                <li>Cookie preference center: Update your preferences through our settings</li>
                <li>Third-party tools: Use browser extensions to manage cookies</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Please note that disabling certain cookies may impact the functionality of our website.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold gradient-text">Third-Party Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may use third-party services that set cookies on your device. These include:
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                <li>Google Analytics for usage analytics</li>
                <li>Authentication providers for secure login</li>
                <li>Content delivery networks for performance</li>
              </ul>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold gradient-text">Cookie Duration</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies may be session cookies (deleted when you close your browser) or persistent cookies (stored for a set period). The duration varies based on the cookie's purpose.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold gradient-text">Updates to This Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update this Cookie Policy from time to time. Any changes will be posted on this page with an updated revision date.
              </p>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold gradient-text">Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have questions about our use of cookies, please contact us at privacy@oddsmap.io
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Cookies;