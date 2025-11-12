import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Wallet, DollarSign } from "lucide-react";
import type { Market } from "@/hooks/useMarkets";

interface WalletBubbleMapProps {
  market: Market;
}

interface WalletData {
  id: string;
  address: string;
  side: "yes" | "no";
  amount: number;
  size: number;
  x: number;
  y: number;
  color: string;
  trades: number;
  avgPrice: number;
  profit: number;
}

const WalletBubbleMap = ({ market }: WalletBubbleMapProps) => {
  const [hoveredWallet, setHoveredWallet] = useState<WalletData | null>(null);

  // Generate mock wallet data based on market liquidity
  const wallets = useMemo(() => {
    const yesTraders: WalletData[] = [];
    const noTraders: WalletData[] = [];
    const totalLiquidity = market.liquidity;
    
    // Generate YES side wallets
    for (let i = 0; i < 12; i++) {
      const amount = (Math.random() * totalLiquidity * 0.15) + 1000;
      const size = Math.min(120, Math.max(40, amount / 100));
      
      yesTraders.push({
        id: `yes-${i}`,
        address: `0x${Math.random().toString(16).substr(2, 8)}`,
        side: "yes",
        amount,
        size,
        x: Math.random() * 35 + 10,
        y: Math.random() * 80 + 10,
        color: "from-green-400 to-green-600",
        trades: Math.floor(Math.random() * 50) + 5,
        avgPrice: market.yes_price * (0.9 + Math.random() * 0.2),
        profit: (Math.random() - 0.3) * amount * 0.3,
      });
    }

    // Generate NO side wallets
    for (let i = 0; i < 12; i++) {
      const amount = (Math.random() * totalLiquidity * 0.15) + 1000;
      const size = Math.min(120, Math.max(40, amount / 100));
      
      noTraders.push({
        id: `no-${i}`,
        address: `0x${Math.random().toString(16).substr(2, 8)}`,
        side: "no",
        amount,
        size,
        x: Math.random() * 35 + 55,
        y: Math.random() * 80 + 10,
        color: "from-red-400 to-red-600",
        trades: Math.floor(Math.random() * 50) + 5,
        avgPrice: market.no_price * (0.9 + Math.random() * 0.2),
        profit: (Math.random() - 0.3) * amount * 0.3,
      });
    }

    return [...yesTraders, ...noTraders];
  }, [market]);

  const yesTotal = wallets.filter(w => w.side === "yes").reduce((sum, w) => sum + w.amount, 0);
  const noTotal = wallets.filter(w => w.side === "no").reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-400 to-green-600">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">YES Side</div>
              <div className="text-2xl font-bold text-green-400">
                ${(yesTotal / 1000).toFixed(1)}K
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {wallets.filter(w => w.side === "yes").length} traders
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-400 to-red-600">
              <TrendingDown className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">NO Side</div>
              <div className="text-2xl font-bold text-red-400">
                ${(noTotal / 1000).toFixed(1)}K
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {wallets.filter(w => w.side === "no").length} traders
          </div>
        </div>

        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-secondary">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Total Volume</div>
              <div className="text-2xl font-bold gradient-text">
                ${((yesTotal + noTotal) / 1000).toFixed(1)}K
              </div>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {wallets.length} total traders
          </div>
        </div>
      </div>

      {/* Bubble Map */}
      <div className="glass-strong rounded-3xl p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-bold gradient-text">Wallet Distribution</h3>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-green-600" />
              <span>YES positions</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-gradient-to-r from-red-400 to-red-600" />
              <span>NO positions</span>
            </div>
          </div>
        </div>

        {/* Map Container */}
        <div className="relative glass rounded-2xl min-h-[600px] overflow-hidden">
          {/* Side Labels */}
          <div className="absolute top-8 left-8 glass px-4 py-2 rounded-lg z-10">
            <div className="text-sm font-semibold text-green-400">YES SIDE</div>
          </div>
          <div className="absolute top-8 right-8 glass px-4 py-2 rounded-lg z-10">
            <div className="text-sm font-semibold text-red-400">NO SIDE</div>
          </div>

          {/* Center Divider */}
          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-px bg-gradient-to-b from-transparent via-border to-transparent" />

          {/* Wallet Bubbles */}
          <div className="relative w-full h-full min-h-[600px] p-8">
            {wallets.map((wallet) => (
              <div
                key={wallet.id}
                className="absolute cursor-pointer transition-all duration-500 group"
                style={{
                  left: `${wallet.x}%`,
                  top: `${wallet.y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                onMouseEnter={() => setHoveredWallet(wallet)}
                onMouseLeave={() => setHoveredWallet(null)}
              >
                <div
                  className={`rounded-full bg-gradient-to-br ${wallet.color} opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 flex items-center justify-center shadow-lg`}
                  style={{
                    width: `${wallet.size}px`,
                    height: `${wallet.size}px`,
                  }}
                >
                  <Wallet className="w-4 h-4 text-white" />
                </div>
              </div>
            ))}
          </div>

          {/* Hover Info */}
          {hoveredWallet && (
            <div className="absolute bottom-8 left-8 right-8 glass-strong p-6 rounded-2xl animate-fade-in border border-primary/30 z-20">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <Wallet className="w-5 h-5 text-muted-foreground" />
                    <code className="text-lg font-mono">{hoveredWallet.address}</code>
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      hoveredWallet.side === "yes" ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
                    }`}>
                      {hoveredWallet.side.toUpperCase()}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-6">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Position Size</div>
                      <div className="text-xl font-semibold">${(hoveredWallet.amount / 1000).toFixed(2)}K</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Trades</div>
                      <div className="text-xl font-semibold">{hoveredWallet.trades}</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Avg Price</div>
                      <div className="text-xl font-semibold">{(hoveredWallet.avgPrice * 100).toFixed(1)}¢</div>
                    </div>
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">P&L</div>
                      <div className={`text-xl font-semibold ${hoveredWallet.profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                        {hoveredWallet.profit >= 0 ? "+" : ""}${(hoveredWallet.profit / 1000).toFixed(2)}K
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletBubbleMap;
