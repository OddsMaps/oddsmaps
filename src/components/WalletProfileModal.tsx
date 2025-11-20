import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ExternalLink, TrendingUp, Activity, Clock, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WalletProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallet: {
    address: string;
    amount: number;
    side: "yes" | "no";
    trades: number;
    avgPrice: number;
    profit: number;
    entryTime: Date;
  } | null;
}

export const WalletProfileModal = ({ isOpen, onClose, wallet }: WalletProfileModalProps) => {
  if (!wallet) return null;

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  const formatCurrency = (val: number) => `$${Math.abs(val).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${Math.floor(diff / (1000 * 60))}m ago`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="gradient-text text-xl font-bold">Wallet Profile</span>
            <Badge variant={wallet.side === "yes" ? "default" : "destructive"} className="text-sm">
              {wallet.side.toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Address */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/30">
            <span className="text-sm text-muted-foreground">Wallet Address</span>
            <a
              href={`https://polygonscan.com/address/${wallet.address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-foreground hover:text-primary transition-colors"
            >
              <span className="font-mono text-sm">{formatAddress(wallet.address)}</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-primary" />
                <span className="text-xs text-muted-foreground">Position Size</span>
              </div>
              <p className="text-xl font-bold text-foreground">{formatCurrency(wallet.amount)}</p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-secondary/10 to-destructive/10 border border-secondary/20">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-secondary" />
                <span className="text-xs text-muted-foreground">P&L</span>
              </div>
              <p className={`text-xl font-bold ${wallet.profit >= 0 ? 'text-primary' : 'text-destructive'}`}>
                {wallet.profit >= 0 ? '+' : ''}{formatCurrency(wallet.profit)}
              </p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-accent/10 to-primary/10 border border-accent/20">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-accent" />
                <span className="text-xs text-muted-foreground">Total Trades</span>
              </div>
              <p className="text-xl font-bold text-foreground">{wallet.trades}</p>
            </div>

            <div className="p-4 rounded-lg bg-gradient-to-br from-muted/30 to-muted/10 border border-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">First Entry</span>
              </div>
              <p className="text-xl font-bold text-foreground">{formatTime(wallet.entryTime)}</p>
            </div>
          </div>

          {/* Avg Entry Price */}
          <div className="p-4 rounded-lg bg-muted/20 border border-border/30">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Average Entry Price</span>
              <span className="text-lg font-bold text-foreground">
                {(wallet.avgPrice * 100).toFixed(1)}¢
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
