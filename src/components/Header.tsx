import { useState, useEffect } from "react";
import { Search, Menu, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "@/assets/oddsmap-logo-new.png";
import SearchModal from "./SearchModal";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

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

  const navItems: Array<{ label: string; href: string; isRoute: boolean }> = [];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-background/95 backdrop-blur-xl border-b border-border/50' : 'bg-transparent'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-0">
          <div className="flex items-center justify-between h-16 md:h-auto">
            {/* Logo */}
            <a 
              href="/"
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
              className="flex items-center gap-3 group cursor-pointer flex-shrink-0"
            >
              <img 
                src={logo} 
                alt="OddsMap" 
                className="h-12 md:h-24 w-auto transition-transform duration-300 group-hover:scale-105"
              />
              <span className="font-glacial text-2xl md:text-4xl text-foreground">
                OddsMaps
              </span>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-8">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    if (item.isRoute) {
                      navigate(item.href);
                    } else {
                      scrollToSection(item.href);
                    }
                  }}
                  className="text-sm font-medium text-foreground/80 hover:text-foreground transition-colors cursor-pointer"
                >
                  {item.label}
                </a>
              ))}
            </nav>

            {/* Desktop Search Bar */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className={`hidden md:flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-300 group min-w-[300px] ${
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

            {/* Mobile Menu */}
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="flex-shrink-0">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-6 mt-8">
                  {/* Search in mobile menu */}
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      setIsSearchOpen(true);
                    }}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors w-full text-left"
                  >
                    <Search className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      Search markets...
                    </span>
                  </button>

                  {/* Navigation items */}
                  {navItems.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      onClick={(e) => {
                        e.preventDefault();
                        setIsMobileMenuOpen(false);
                        if (item.isRoute) {
                          navigate(item.href);
                        } else {
                          scrollToSection(item.href);
                        }
                      }}
                      className="text-lg font-medium text-foreground/80 hover:text-foreground transition-colors cursor-pointer px-4 py-2"
                    >
                      {item.label}
                    </a>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal open={isSearchOpen} onOpenChange={setIsSearchOpen} />
    </>
  );
};

export default Header;
