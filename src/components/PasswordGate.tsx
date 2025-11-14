import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import logo from "@/assets/oddsmap-logo-new.png";

const CORRECT_PASSWORD = "Dylaski99";
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
      
      <div className="glass-strong p-8 rounded-2xl max-w-md w-full space-y-6 relative animate-fade-in">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <img 
              src={logo} 
              alt="OddsMap Logo" 
              className="h-16 w-auto"
            />
          </div>
          
          <h1 className="text-3xl font-bold gradient-text">
            Protected Access
          </h1>
          
          <p className="text-muted-foreground">
            This site is currently password protected. Enter the password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full"
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
            className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground"
          >
            Unlock Site
          </Button>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Access is restricted during development
        </p>
      </div>
    </div>
  );
};

export default PasswordGate;
