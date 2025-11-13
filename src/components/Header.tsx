import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import logo from "@/assets/oddsmap-logo-new.png";
import SearchModal from "./SearchModal";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Handle scroll to change header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard shortcut for search (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems = [
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

            {/* Search Bar */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 group min-w-[300px] ${
                isScrolled ? 'bg-muted/50 hover:bg-muted' : 'bg-background/20 hover:bg-background/40'
              }`}
            >
              <Search className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors flex-1 text-left">
                Search markets...
              </span>
              <kbd className="px-2 py-0.5 text-xs rounded bg-muted/50 text-muted-foreground border border-border/50">
                ⌘K
              </kbd>
            </button>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
};

export default Header;
