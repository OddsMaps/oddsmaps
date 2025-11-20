import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import logo from "@/assets/oddsmap-logo-new.png";

const CORRECT_PASSWORD = "Dyaski99";
const STORAGE_KEY = "site_authenticated";

interface PasswordGateProps {
  children: React.ReactNode;
}

const PasswordGate = ({ children }: PasswordGateProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const authenticated = sessionStorage.getItem(STORAGE_KEY);
    if (authenticated === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password === CORRECT_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password");
      setPassword("");
    }
  };

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 overflow-hidden animate-fade-in">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/5 to-transparent pointer-events-none animate-pulse" 
           style={{ animationDuration: '4s' }} />
      
      {/* Floating glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-float" 
           style={{ animationDuration: '8s', animationDelay: '0s' }} />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-float" 
           style={{ animationDuration: '10s', animationDelay: '2s' }} />
      
      <div className="glass-strong p-8 rounded-2xl max-w-md w-full space-y-6 relative animate-slide-up glow-gradient">
        <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="flex justify-center mb-2">
            <img 
              src={logo} 
              alt="OddsMap Logo" 
              className="h-16 w-auto animate-logo-glow"
              style={{ animation: 'logo-illuminate 4s ease-in-out infinite' }}
            />
          </div>
          
          <h1 className="text-3xl font-bold gradient-text font-glacial">
            Protected Access
          </h1>
          
          <p className="text-muted-foreground">
            This site is currently password protected. Enter the password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full transition-all duration-300 focus:scale-105 focus:glow-green"
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive animate-fade-in">
                {error}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full bg-gradient-to-r from-primary via-accent to-secondary text-primary-foreground transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Unlock Site
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center animate-fade-in" style={{ animationDelay: '0.6s' }}>
          Access is restricted during development
        </p>
      </div>
    </div>
  );
};

export default PasswordGate;
