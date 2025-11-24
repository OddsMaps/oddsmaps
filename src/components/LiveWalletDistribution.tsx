import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface WalletBubble {
  id: string;
  wallet_address: string;
  amount: number;
  side: string;
  timestamp: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  market_title: string;
}

interface WalletDetails {
  wallet_address: string;
  total_amount: number;
  trades: Array<{
    amount: number;
    side: string;
    timestamp: string;
    price: number;
  }>;
  market_id: string;
}

export const LiveWalletDistribution = () => {
  const [bubbles, setBubbles] = useState<WalletBubble[]>([]);
  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<WalletDetails | null>(null);
  const animationRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Fetch wallet transactions
  useEffect(() => {
    const fetchWallets = async () => {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select(`
          id,
          wallet_address,
          amount,
          side,
          timestamp,
          price,
          markets!inner(title, market_id)
        `)
        .eq('markets.source', 'polymarket')
        .gte('amount', 1000)
        .order('timestamp', { ascending: false })
        .limit(200);

      if (error) {
        console.error('Error fetching wallets:', error);
        return;
      }

      // Group by wallet and calculate total amounts
      const walletMap = new Map<string, WalletBubble>();
      
      (data || []).forEach((tx: any) => {
        const key = `${tx.wallet_address}-${tx.side}`;
        const existing = walletMap.get(key);
        
        if (existing) {
          existing.amount += tx.amount;
        } else {
          walletMap.set(key, {
            id: tx.id,
            wallet_address: tx.wallet_address,
            amount: tx.amount,
            side: tx.side,
            timestamp: tx.timestamp,
            x: Math.random() * 400,
            y: Math.random() * 400,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.sqrt(tx.amount / 100),
            market_title: tx.markets.title,
          });
        }
      });

      setBubbles(Array.from(walletMap.values()));
    };

    fetchWallets();

    // Subscribe to real-time updates
    const channel = supabase
      .channel('wallet-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wallet_transactions',
        },
        () => {
          fetchWallets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Physics animation
  useEffect(() => {
    const animate = () => {
      setBubbles(prev => {
        return prev.map(bubble => {
          let { x, y, vx, vy } = bubble;
          
          // Apply velocity
          x += vx;
          y += vy;
          
          // Bounce off edges
          if (x < bubble.radius || x > 400 - bubble.radius) {
            vx *= -0.8;
            x = Math.max(bubble.radius, Math.min(400 - bubble.radius, x));
          }
          if (y < bubble.radius || y > 400 - bubble.radius) {
            vy *= -0.8;
            y = Math.max(bubble.radius, Math.min(400 - bubble.radius, y));
          }
          
          // Apply damping
          vx *= 0.99;
          vy *= 0.99;
          
          return { ...bubble, x, y, vx, vy };
        });
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleBubbleClick = async (bubble: WalletBubble) => {
    const { data, error } = await supabase
      .from('wallet_transactions')
      .select(`
        amount,
        side,
        timestamp,
        price,
        market_id,
        markets!inner(title, market_id)
      `)
      .eq('wallet_address', bubble.wallet_address)
      .order('timestamp', { ascending: false })
      .limit(20);

    if (!error && data) {
      setSelectedWallet({
        wallet_address: bubble.wallet_address,
        total_amount: data.reduce((sum, tx) => sum + tx.amount, 0),
        trades: data.map(tx => ({
          amount: tx.amount,
          side: tx.side,
          timestamp: tx.timestamp,
          price: tx.price,
        })),
        market_id: data[0]?.markets?.market_id || '',
      });
    }
  };

  const renderQuadrant = (
    side: 'yes' | 'no',
    minAmount: number,
    maxAmount: number,
    quadrantClass: string
  ) => {
    const filteredBubbles = bubbles.filter(
      b => b.side.toLowerCase() === side && 
      b.amount >= minAmount && 
      (maxAmount === Infinity || b.amount < maxAmount)
    );

    return (
      <div className={`relative ${quadrantClass}`}>
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {/* Connection lines */}
          {filteredBubbles.map((bubble, i) => 
            filteredBubbles.slice(i + 1).map((other, j) => {
              const distance = Math.sqrt(
                Math.pow(bubble.x - other.x, 2) + 
                Math.pow(bubble.y - other.y, 2)
              );
              if (distance < 150) {
                return (
                  <line
                    key={`${i}-${j}`}
                    x1={bubble.x}
                    y1={bubble.y}
                    x2={other.x}
                    y2={other.y}
                    stroke={side === 'yes' ? 'rgba(0, 255, 130, 0.1)' : 'rgba(255, 58, 58, 0.1)'}
                    strokeWidth="1"
                  />
                );
              }
              return null;
            })
          )}
        </svg>

        {filteredBubbles.map((bubble) => (
          <div
            key={bubble.id}
            className="absolute cursor-pointer transition-all duration-300"
            style={{
              left: `${bubble.x}px`,
              top: `${bubble.y}px`,
              width: `${bubble.radius * 2}px`,
              height: `${bubble.radius * 2}px`,
              transform: 'translate(-50%, -50%)',
            }}
            onMouseEnter={() => setHoveredBubble(bubble.id)}
            onMouseLeave={() => setHoveredBubble(null)}
            onClick={() => handleBubbleClick(bubble)}
          >
            <div
              className={`w-full h-full rounded-full flex items-center justify-center font-bold text-white relative ${
                hoveredBubble === bubble.id ? 'scale-110' : ''
              }`}
              style={{
                background: side === 'yes' 
                  ? 'radial-gradient(circle at 30% 30%, rgba(0, 255, 130, 0.4), rgba(0, 255, 130, 0.1))'
                  : 'radial-gradient(circle at 30% 30%, rgba(255, 58, 58, 0.4), rgba(255, 58, 58, 0.1))',
                boxShadow: hoveredBubble === bubble.id
                  ? side === 'yes'
                    ? '0 0 40px rgba(0, 255, 130, 0.8), inset 0 0 20px rgba(0, 255, 130, 0.3)'
                    : '0 0 40px rgba(255, 58, 58, 0.8), inset 0 0 20px rgba(255, 58, 58, 0.3)'
                  : side === 'yes'
                    ? '0 0 20px rgba(0, 255, 130, 0.5), inset 0 0 10px rgba(0, 255, 130, 0.2)'
                    : '0 0 20px rgba(255, 58, 58, 0.5), inset 0 0 10px rgba(255, 58, 58, 0.2)',
                border: side === 'yes' 
                  ? '2px solid rgba(0, 255, 130, 0.5)' 
                  : '2px solid rgba(255, 58, 58, 0.5)',
              }}
            >
              <span className="text-xs" style={{ fontSize: `${Math.max(10, bubble.radius / 3)}px` }}>
                ${(bubble.amount / 1000).toFixed(bubble.amount >= 10000 ? 0 : 1)}k
              </span>
            </div>
            
            {hoveredBubble === bubble.id && (
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 bg-background/95 border border-border rounded-lg p-2 text-xs whitespace-nowrap z-50 backdrop-blur-sm">
                <div className="font-mono text-primary">{bubble.wallet_address.slice(0, 8)}...</div>
                <div className="text-muted-foreground">{formatDistanceToNow(new Date(bubble.timestamp), { addSuffix: true })}</div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-br from-[#0a0118] via-[#0d0221] to-[#1a0b2e] overflow-hidden">
      {/* Starfield background */}
      <div className="absolute inset-0 opacity-40">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2 + 'px',
              height: Math.random() * 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animation: `twinkle ${Math.random() * 3 + 2}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/60" />

      <div className="relative container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold text-center mb-12 bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
          Live Wallet Distribution
        </h2>

        <div className="relative grid grid-cols-2 gap-0 mx-auto" style={{ maxWidth: '1400px', height: '900px' }}>
          {/* Vertical divider */}
          <div className="absolute left-1/2 top-0 bottom-0 w-[2px] bg-gradient-to-b from-transparent via-primary/50 to-transparent transform -translate-x-1/2 shadow-[0_0_20px_rgba(var(--primary),0.5)]" />
          
          {/* Horizontal divider */}
          <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent transform -translate-y-1/2 shadow-[0_0_20px_rgba(var(--primary),0.5)]" />

          {/* Top Left: YES $10,000+ */}
          <div className="relative p-8 overflow-hidden">
            <div className="mb-4">
              <h3 className="text-5xl font-bold text-[#00FF82] mb-2" style={{ textShadow: '0 0 30px rgba(0, 255, 130, 0.6)' }}>
                YES
              </h3>
              <p className="text-xl text-white font-semibold">$10,000+</p>
            </div>
            {renderQuadrant('yes', 10000, Infinity, 'h-[400px]')}
          </div>

          {/* Top Right: NO $10,000+ */}
          <div className="relative p-8 overflow-hidden">
            <div className="mb-4 text-right">
              <h3 className="text-5xl font-bold text-[#FF3A3A] mb-2" style={{ textShadow: '0 0 30px rgba(255, 58, 58, 0.6)' }}>
                NO
              </h3>
              <p className="text-xl text-white font-semibold">$10,000+</p>
            </div>
            {renderQuadrant('no', 10000, Infinity, 'h-[400px]')}
          </div>

          {/* Bottom Left: YES $1,000-$10,000 */}
          <div className="relative p-8 overflow-hidden">
            <div className="mb-4">
              <p className="text-xl text-white font-semibold">$1,000-$10,000</p>
            </div>
            {renderQuadrant('yes', 1000, 10000, 'h-[400px]')}
          </div>

          {/* Bottom Right: NO $1,000-$10,000 */}
          <div className="relative p-8 overflow-hidden">
            <div className="mb-4 text-right">
              <p className="text-xl text-white font-semibold">$1,000-$10,000</p>
            </div>
            {renderQuadrant('no', 1000, 10000, 'h-[400px]')}
          </div>
        </div>
      </div>

      {/* Wallet details panel */}
      {selectedWallet && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-background/95 backdrop-blur-xl border-l border-border shadow-2xl z-50 overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Wallet Details</h3>
              <button
                onClick={() => setSelectedWallet(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Wallet Address</p>
                <p className="font-mono text-sm break-all">{selectedWallet.wallet_address}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-primary">
                  ${selectedWallet.total_amount.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground mb-2">Recent Trades</p>
                <div className="space-y-2">
                  {selectedWallet.trades.map((trade, i) => (
                    <Card key={i} className="p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-xs font-bold ${trade.side === 'yes' ? 'text-[#00FF82]' : 'text-[#FF3A3A]'}`}>
                            {trade.side.toUpperCase()}
                          </span>
                          <p className="text-sm mt-1">${trade.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(trade.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">Price</p>
                          <p className="text-sm">${trade.price.toFixed(2)}</p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {selectedWallet.market_id && (
                <a
                  href={`https://polymarket.com/event/${selectedWallet.market_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full py-2 px-4 bg-primary text-primary-foreground rounded-lg text-center font-semibold hover:opacity-90 transition-opacity"
                >
                  View on Polymarket
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};
