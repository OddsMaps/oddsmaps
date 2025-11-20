import logo from "@/assets/oddsmap-logo-new.png";

const Footer = () => {
  const links = {
    Product: ["Features", "API", "Documentation"],
    Company: ["About", "Blog", "Careers", "Contact"],
    Legal: ["Privacy", "Terms", "Security", "Cookies"],
    Resources: ["Help Center", "Community", "Partners", "Status"],
  };

  return (
    <footer className="relative border-t border-border/50 mt-24">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2 space-y-4">
            <img src={logo} alt="OddsMap" className="h-12 w-auto" />
            <p className="text-muted-foreground max-w-xs">
              Visual intelligence for prediction markets. Transform odds into insights.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse-glow" />
              <span className="text-muted-foreground">Live on Kalshi & Polymarket</span>
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([category, items]) => (
            <div key={category}>
              <h3 className="font-semibold mb-4 gradient-text">{category}</h3>
              <ul className="space-y-3">
                {items.map((item) => {
                  const urlMap: Record<string, string> = {
                    "Features": "/features", "API": "#", "Documentation": "#",
                    "About": "/about", "Blog": "/blog", "Careers": "/careers", "Contact": "/contact",
                    "Privacy": "/privacy", "Terms": "/terms", "Security": "/security", "Cookies": "/cookies",
                    "Help Center": "/help", "Community": "/community", "Partners": "/partners", "Status": "/status"
                  };
                  return (
                    <li key={item}>
                      <a
                        href={urlMap[item] || "#"}
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200 text-sm hover:gradient-text"
                      >
                        {item}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="pt-8 border-t border-border/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              © 2024 OddsMap. All rights reserved.
            </div>
            
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:gradient-text transition-all">
                Twitter
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:gradient-text transition-all">
                Discord
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:gradient-text transition-all">
                GitHub
              </a>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
      </div>
    </footer>
  );
};

export default Footer;
