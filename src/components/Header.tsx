import { useState, useEffect } from "react";
import logo from "@/assets/oddsmap-logo.png";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll to change header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Markets", href: "#markets" },
    { label: "Analytics", href: "#analytics" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Community", href: "#community" },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-xl border-b border-border/50' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-6 py-0">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a 
              href="#home"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('#home');
              }}
              className="flex items-center gap-2 group cursor-pointer"
            >
              <img 
                src={logo} 
                alt="OddsMap" 
                className="h-24 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </a>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.href);
                  }}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Launch App Button */}
            <button className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 text-white font-semibold hover:from-pink-600 hover:to-rose-600 transition-all duration-300 hover:scale-105 shadow-lg shadow-pink-500/30 text-xs uppercase tracking-wider">
              Launch App
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
