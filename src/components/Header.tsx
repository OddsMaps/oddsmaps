import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import logo from "@/assets/oddsmap-logo.png";
import SearchModal from "./SearchModal";

const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

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

  // Handle scroll to change header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'bg-background/95 backdrop-blur-xl shadow-lg' : 'bg-transparent'}`}>
        <div className="relative max-w-7xl mx-auto px-6 py-2">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <a 
              href="#home" 
              className="flex items-center group cursor-pointer"
            >
              <img 
                src={logo} 
                alt="OddsMap" 
                className="h-12 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </a>

            {/* Search Button */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg transition-all duration-300 group ${isScrolled ? 'bg-muted/50 hover:bg-muted' : 'bg-background/20 hover:bg-background/40'}`}
            >
              <Search className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors hidden sm:inline">
                Search
              </span>
              <kbd className="hidden lg:inline-flex px-2 py-0.5 text-xs rounded bg-muted/50 text-muted-foreground border border-border/50">
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
