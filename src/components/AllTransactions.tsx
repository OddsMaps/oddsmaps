import { useEffect, useState, useMemo } from "react";
import { useMarkets } from "@/hooks/useMarkets";
import { fetchMarketTransactions } from "@/lib/polymarket-api";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { TrendingUp, TrendingDown, Activity, ChevronRight, Waves, DollarSign, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { formatVolume } from "@/lib/utils";

interface Transaction {
  id: string;
  wallet_address: string;
  amount: number;
  price: number;
  side: string;
  timestamp: string;
  transaction_hash: string;
  market: {
    title: string;
    market_id: string;
    image_url?: string;
  };
}

export const AllTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const navigate = useNavigate();
  const { data: markets } = useMarkets("polymarket");

  useEffect(() => {
    if (markets && markets.length > 0) {
      fetchTransactions();
    }

    const interval = setInterval(() => {
      if (markets && markets.length > 0) {
        fetchTransactions();
      }
    }, 60 * 1000);

    return () => clearInterval(interval);
  }, [markets]);

  const fetchTransactions = async () => {
    if (!markets || markets.length === 0) return;

    try {
      setLoading(true);
      const topMarkets = [...markets]
        .sort((a, b) => b.volume_24h - a.volume_24h)
        .slice(0, 10);

      const transactionPromises = topMarkets.map(async (market) => {
        try {
          const transactions = await fetchMarketTransactions(market.market_id, 100);
          return transactions
            .filter((tx) => Number(tx.amount) >= 10000)
            .map((tx) => ({
              id: tx.id,
              wallet_address: tx.address || tx.wallet_address || "",
              amount: Number(tx.amount),
              price: Number(tx.price),
              side: tx.side,
              timestamp: tx.timestamp,
              transaction_hash: tx.hash || tx.transaction_hash || "",
              market: {
                title: market.title,
                market_id: market.market_id,
                image_url: market.image_url,
              },
            }));
        } catch {
          return [];
        }
      });

      const allTransactions = await Promise.all(transactionPromises);
      const flattened = allTransactions.flat();
      const sorted = flattened
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 100);

      setTransactions(sorted);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const displayedTransactions = showAll ? transactions : transactions.slice(0, 6);

  const formatTime = (timestamp: string) => {
    const now = new Date().getTime();
    const txTime = new Date(timestamp).getTime();
    const diff = Math.floor((now - txTime) / 1000);

    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
    return `${Math.floor(diff / 86400)}d`;
  };

  const totalVolume = useMemo(() => 
    transactions.reduce((sum, tx) => sum + tx.amount, 0), 
    [transactions]
  );

  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-card via-card to-card/50 border border-border/50 p-8">
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 animate-pulse" />
            <Waves className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-foreground">Scanning for whales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 mb-6"
        >
          <Waves className="w-4 h-4 text-cyan-400" />
          <span className="text-sm font-bold text-cyan-400 uppercase tracking-wider">
            Whale Watcher
          </span>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-display text-4xl md:text-5xl font-black tracking-tight mb-4"
        >
          <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            Big Money Moves
          </span>
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="text-lg text-muted-foreground max-w-xl mx-auto"
        >
          Track $10,000+ bets in real-time from the biggest traders
        </motion.p>
      </div>

      {/* Stats Badge */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex justify-center mb-8"
      >
        <div className="inline-flex items-center gap-3 bg-card/50 backdrop-blur-sm border border-border/50 rounded-full px-6 py-3">
          <div className="flex items-center gap-2">
            <Waves className="w-5 h-5 text-cyan-400" />
            <span className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              {transactions.length}
            </span>
            <span className="text-muted-foreground font-medium">Whales Tracked</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
      </motion.div>

      {/* Transactions List */}
      <div className="space-y-3">
        <AnimatePresence>
          {displayedTransactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => navigate(`/market/${tx.market.market_id}`)}
              className="group relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4 cursor-pointer hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)]"
            >
              <div className="flex items-center gap-4">
                {/* Market Image */}
                <div className="relative shrink-0">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden bg-muted">
                    {tx.market.image_url ? (
                      <img 
                        src={tx.market.image_url} 
                        alt={tx.market.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <span className="text-lg font-bold text-muted-foreground">
                          {tx.market.title.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Side Badge Overlay */}
                  <div className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center ${
                    tx.side === "yes" 
                      ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" 
                      : "bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"
                  }`}>
                    {tx.side === "yes" ? (
                      <TrendingUp className="w-3.5 h-3.5 text-white" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 text-white" />
                    )}
                  </div>
                </div>

                {/* Market Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-sm md:text-base line-clamp-1 group-hover:text-primary transition-colors">
                    {tx.market.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-muted-foreground font-mono">
                      {tx.wallet_address.slice(0, 6)}...{tx.wallet_address.slice(-4)}
                    </span>
                    <span className="text-xs text-muted-foreground">•</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatTime(tx.timestamp)} ago
                    </span>
                  </div>
                </div>

                {/* Amount & Price */}
                <div className="text-right shrink-0">
                  <div className="text-lg md:text-xl font-black bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    {formatVolume(tx.amount)}
                  </div>
                  <div className={`text-sm font-bold ${
                    tx.side === "yes" ? "text-emerald-400" : "text-rose-400"
                  }`}>
                    {tx.side.toUpperCase()} @ {(tx.price * 100).toFixed(0)}¢
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Show More Button */}
      {transactions.length > 6 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center pt-8"
        >
          <Button
            variant="outline"
            size="lg"
            onClick={() => setShowAll(!showAll)}
            className="gap-2 rounded-full px-8 border-cyan-500/30 hover:border-cyan-500/50 hover:bg-cyan-500/10"
          >
            {showAll ? (
              <>
                Show Less
                <TrendingUp className="w-4 h-4 rotate-180" />
              </>
            ) : (
              <>
                View {transactions.length - 6} More Whales
                <TrendingDown className="w-4 h-4 rotate-180" />
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
};
