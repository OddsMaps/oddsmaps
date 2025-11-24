import { useEffect, useState, useRef, useCallback } from 'react';
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
  targetX?: number;
  targetY?: number;
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

interface LiveWalletDistributionProps {
  marketId: string;
}

export const LiveWalletDistribution = ({ marketId }: LiveWalletDistributionProps) => {
  const [bubbles, setBubbles] = useState<Map<string, WalletBubble[]>>(new Map());
  const [hoveredBubble, setHoveredBubble] = useState<string | null>(null);
  const [selectedWallet, setSelectedWallet] = useState<WalletDetails | null>(null);
  const animationRef = useRef<number>();
  const lastUpdateRef = useRef<number>(Date.now());

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
        .eq('market_id', marketId)
        .gte('amount', 1000)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching wallets:', error);
        return;
      }

      // Group by wallet and side
      const walletMap = new Map<string, WalletBubble>();
      
      (data || []).forEach((tx: any) => {
        const key = `${tx.wallet_address}-${tx.side}`;
        const existing = walletMap.get(key);
        
        if (existing) {
          existing.amount += tx.amount;
        } else {
          // Determine quadrant for initial position
          const isYes = tx.side === 'yes';
          const isWhale = tx.amount >= 10000;
          
          const quadrantWidth = 350;
          const quadrantHeight = 350;
          const padding = 80;
          
          walletMap.set(key, {
            id: tx.id,
            wallet_address: tx.wallet_address,
            amount: tx.amount,
            side: tx.side,
            timestamp: tx.timestamp,
            x: (isYes ? padding : quadrantWidth + padding) + Math.random() * quadrantWidth,
            y: (isWhale ? padding : quadrantHeight + padding) + Math.random() * quadrantHeight,
            vx: 0,
            vy: 0,
            radius: Math.min(Math.max(Math.sqrt(tx.amount / 80), 20), 100),
            market_title: tx.markets.title,
          });
        }
      });

      // Separate into quadrants
      const newBubbles = new Map<string, WalletBubble[]>();
      newBubbles.set('yes-whale', []);
      newBubbles.set('no-whale', []);
      newBubbles.set('yes-mid', []);
      newBubbles.set('no-mid', []);

      Array.from(walletMap.values()).forEach(bubble => {
        const isWhale = bubble.amount >= 10000;
        const quadrant = `${bubble.side}-${isWhale ? 'whale' : 'mid'}`;
        newBubbles.get(quadrant)?.push(bubble);
      });

      setBubbles(newBubbles);
    };

    fetchWallets();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`wallet-updates-${marketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'wallet_transactions',
          filter: `market_id=eq.${marketId}`
        },
        () => {
          fetchWallets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [marketId]);

  // Smooth physics simulation with collision detection
  const updatePhysics = useCallback(() => {
    const now = Date.now();
    const deltaTime = Math.min((now - lastUpdateRef.current) / 1000, 0.1);
    lastUpdateRef.current = now;

    setBubbles(prev => {
      const newBubbles = new Map<string, WalletBubble[]>();
      
      prev.forEach((quadrantBubbles, quadrant) => {
        const updated = quadrantBubbles.map(bubble => {
          let { x, y, vx, vy, radius } = bubble;
          
          // Determine quadrant boundaries
          const isYes = quadrant.startsWith('yes');
          const isWhale = quadrant.includes('whale');
          const quadrantWidth = 350;
          const quadrantHeight = 350;
          const padding = 80;
          
          const minX = (isYes ? padding : quadrantWidth + padding) + radius;
          const maxX = (isYes ? quadrantWidth + padding : quadrantWidth * 2 + padding) - radius;
          const minY = (isWhale ? padding : quadrantHeight + padding) + radius;
          const maxY = (isWhale ? quadrantHeight + padding : quadrantHeight * 2 + padding) - radius;
          
          // Apply gentle drift force toward center of quadrant
          const centerX = (minX + maxX) / 2;
          const centerY = (minY + maxY) / 2;
          const driftForce = 0.3;
          vx += (centerX - x) * driftForce * deltaTime;
          vy += (centerY - y) * driftForce * deltaTime;
          
          // Apply velocity with damping
          const damping = 0.95;
          vx *= damping;
          vy *= damping;
          
          x += vx * deltaTime * 60;
          y += vy * deltaTime * 60;
          
          // Bounce off edges with energy loss
          if (x < minX) {
            x = minX;
            vx = Math.abs(vx) * 0.7;
          } else if (x > maxX) {
            x = maxX;
            vx = -Math.abs(vx) * 0.7;
          }
          
          if (y < minY) {
            y = minY;
            vy = Math.abs(vy) * 0.7;
          } else if (y > maxY) {
            y = maxY;
            vy = -Math.abs(vy) * 0.7;
          }
          
          return { ...bubble, x, y, vx, vy };
        });
        
        // Collision detection within quadrant
        for (let i = 0; i < updated.length; i++) {
          for (let j = i + 1; j < updated.length; j++) {
            const b1 = updated[i];
            const b2 = updated[j];
            
            const dx = b2.x - b1.x;
            const dy = b2.y - b1.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = b1.radius + b2.radius;
            
            if (dist < minDist && dist > 0) {
              // Separate bubbles
              const angle = Math.atan2(dy, dx);
              const overlap = minDist - dist;
              const separateX = Math.cos(angle) * overlap * 0.5;
              const separateY = Math.sin(angle) * overlap * 0.5;
              
              b1.x -= separateX;
              b1.y -= separateY;
              b2.x += separateX;
              b2.y += separateY;
              
              // Transfer momentum
              const dvx = (b1.vx - b2.vx) * 0.5;
              const dvy = (b1.vy - b2.vy) * 0.5;
              b1.vx -= dvx;
              b1.vy -= dvy;
              b2.vx += dvx;
              b2.vy += dvy;
            }
          }
        }
        
        newBubbles.set(quadrant, updated);
      });
      
      return newBubbles;
    });
  }, []);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      updatePhysics();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [updatePhysics]);

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
    quadrantKey: string,
    title: string,
    subtitle: string,
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  ) => {
    const quadrantBubbles = bubbles.get(quadrantKey) || [];
    const isYes = quadrantKey.startsWith('yes');
    const isTop = position.includes('top');
    const isLeft = position.includes('left');

    return (
      <div className={`relative p-8 overflow-visible ${isTop ? '' : 'pt-12'}`}>
        {/* Title */}
        <div className={`absolute ${isTop ? 'top-8' : 'top-4'} ${isLeft ? 'left-8' : 'right-8'} z-10 ${isLeft ? '' : 'text-right'}`}>
          {isTop && (
            <h3 
              className={`text-6xl font-black mb-2 ${isYes ? 'text-[#00FF82]' : 'text-[#FF3A3A]'}`}
              style={{ 
                textShadow: isYes 
                  ? '0 0 40px rgba(0, 255, 130, 0.8), 0 0 80px rgba(0, 255, 130, 0.4)' 
                  : '0 0 40px rgba(255, 58, 58, 0.8), 0 0 80px rgba(255, 58, 58, 0.4)',
                letterSpacing: '0.05em',
              }}
            >
              {title}
            </h3>
          )}
          <p className="text-xl text-white font-bold tracking-wide">{subtitle}</p>
        </div>

        {/* Bubbles container */}
        <div className="relative h-[400px]">
          {/* Connection lines */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
            {quadrantBubbles.map((bubble, i) => 
              quadrantBubbles.slice(i + 1, i + 4).map((other, j) => {
                const dx = other.x - bubble.x;
                const dy = other.y - bubble.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 180) {
                  const opacity = Math.max(0, 1 - distance / 180) * 0.15;
                  return (
                    <line
                      key={`${i}-${j}`}
                      x1={bubble.x}
                      y1={bubble.y}
                      x2={other.x}
                      y2={other.y}
                      stroke={isYes ? 'rgba(0, 255, 130, 1)' : 'rgba(255, 58, 58, 1)'}
                      strokeWidth="1"
                      opacity={opacity}
                      style={{ mixBlendMode: 'screen' }}
                    />
                  );
                }
                return null;
              })
            )}
          </svg>

          {/* Bubbles */}
          {quadrantBubbles.map((bubble) => (
            <div
              key={bubble.id}
              className="absolute cursor-pointer transition-transform duration-100"
              style={{
                left: `${bubble.x}px`,
                top: `${bubble.y}px`,
                width: `${bubble.radius * 2}px`,
                height: `${bubble.radius * 2}px`,
                transform: `translate(-50%, -50%) ${hoveredBubble === bubble.id ? 'scale(1.15)' : 'scale(1)'}`,
                zIndex: hoveredBubble === bubble.id ? 100 : 2,
                willChange: 'transform',
              }}
              onMouseEnter={() => setHoveredBubble(bubble.id)}
              onMouseLeave={() => setHoveredBubble(null)}
              onClick={() => handleBubbleClick(bubble)}
            >
              {/* Outer glow */}
              <div
                className="absolute inset-0 rounded-full blur-xl"
                style={{
                  background: isYes 
                    ? 'radial-gradient(circle, rgba(0, 255, 130, 0.4) 0%, rgba(0, 255, 130, 0) 70%)'
                    : 'radial-gradient(circle, rgba(255, 58, 58, 0.4) 0%, rgba(255, 58, 58, 0) 70%)',
                  transform: hoveredBubble === bubble.id ? 'scale(1.4)' : 'scale(1)',
                  transition: 'transform 0.3s ease',
                }}
              />
              
              {/* Main bubble */}
              <div
                className="absolute inset-0 rounded-full flex items-center justify-center font-bold text-white"
                style={{
                  background: isYes 
                    ? 'radial-gradient(circle at 30% 30%, rgba(0, 255, 130, 0.5), rgba(0, 255, 130, 0.15) 60%, rgba(0, 255, 130, 0.05))'
                    : 'radial-gradient(circle at 30% 30%, rgba(255, 58, 58, 0.5), rgba(255, 58, 58, 0.15) 60%, rgba(255, 58, 58, 0.05))',
                  boxShadow: hoveredBubble === bubble.id
                    ? isYes
                      ? '0 0 60px rgba(0, 255, 130, 0.9), inset 0 0 30px rgba(0, 255, 130, 0.4)'
                      : '0 0 60px rgba(255, 58, 58, 0.9), inset 0 0 30px rgba(255, 58, 58, 0.4)'
                    : isYes
                      ? '0 0 30px rgba(0, 255, 130, 0.6), inset 0 0 20px rgba(0, 255, 130, 0.25)'
                      : '0 0 30px rgba(255, 58, 58, 0.6), inset 0 0 20px rgba(255, 58, 58, 0.25)',
                  border: isYes 
                    ? '2px solid rgba(0, 255, 130, 0.6)' 
                    : '2px solid rgba(255, 58, 58, 0.6)',
                  backdropFilter: 'blur(4px)',
                  transition: 'box-shadow 0.3s ease',
                }}
              >
                {/* Shine effect */}
                <div 
                  className="absolute inset-0 rounded-full opacity-40"
                  style={{
                    background: 'radial-gradient(circle at 25% 25%, rgba(255, 255, 255, 0.4) 0%, transparent 50%)',
                  }}
                />
                
                <span 
                  className="relative z-10 drop-shadow-lg font-black tracking-tight"
                  style={{ 
                    fontSize: `${Math.max(12, Math.min(bubble.radius / 2.5, 28))}px`,
                    textShadow: '0 2px 8px rgba(0, 0, 0, 0.5)',
                  }}
                >
                  ${bubble.amount >= 1000 ? `${(bubble.amount / 1000).toFixed(bubble.amount >= 10000 ? 0 : 1)}k` : bubble.amount.toFixed(0)}
                </span>
              </div>
              
              {hoveredBubble === bubble.id && (
                <div 
                  className="absolute top-full left-1/2 transform -translate-x-1/2 mt-3 bg-black/90 border border-white/20 rounded-lg p-3 text-xs whitespace-nowrap z-50 backdrop-blur-xl"
                  style={{
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
                  }}
                >
                  <div className="font-mono text-primary font-bold">{bubble.wallet_address.slice(0, 8)}...</div>
                  <div className="text-white/70 mt-1">{formatDistanceToNow(new Date(bubble.timestamp), { addSuffix: true })}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="relative w-full py-12 overflow-hidden">
      {/* Enhanced starfield background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#05010d] via-[#0a0118] to-[#0d0221]">
        {/* Large stars */}
        {[...Array(60)].map((_, i) => (
          <div
            key={`star-${i}`}
            className="absolute rounded-full bg-white"
            style={{
              width: Math.random() * 2.5 + 0.5 + 'px',
              height: Math.random() * 2.5 + 0.5 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              opacity: Math.random() * 0.7 + 0.3,
              animation: `twinkle ${Math.random() * 4 + 2}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 4}s`,
            }}
          />
        ))}
        
        {/* Ambient glow particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={`glow-${i}`}
            className="absolute rounded-full blur-xl"
            style={{
              width: Math.random() * 200 + 100 + 'px',
              height: Math.random() * 200 + 100 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              background: i % 2 === 0 
                ? 'radial-gradient(circle, rgba(0, 255, 130, 0.03) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(255, 58, 58, 0.03) 0%, transparent 70%)',
              animation: `float ${Math.random() * 20 + 15}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 10}s`,
            }}
          />
        ))}
      </div>

      {/* Vignette overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-black/70" />

      <div className="relative container mx-auto px-4">
        <h2 className="text-5xl font-black text-center mb-16 bg-gradient-to-r from-[#00FF82] via-white to-[#FF3A3A] bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
          Live Wallet Distribution
        </h2>

        <div className="relative mx-auto" style={{ maxWidth: '900px', height: '900px' }}>
          {/* Glowing vertical divider */}
          <div 
            className="absolute left-1/2 top-0 bottom-0 w-[2px] transform -translate-x-1/2 z-20"
            style={{
              background: 'linear-gradient(to bottom, transparent 0%, rgba(255, 255, 255, 0.6) 20%, rgba(255, 255, 255, 0.6) 80%, transparent 100%)',
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)',
            }}
          />
          
          {/* Glowing horizontal divider */}
          <div 
            className="absolute top-1/2 left-0 right-0 h-[2px] transform -translate-y-1/2 z-20"
            style={{
              background: 'linear-gradient(to right, transparent 0%, rgba(255, 255, 255, 0.6) 20%, rgba(255, 255, 255, 0.6) 80%, transparent 100%)',
              boxShadow: '0 0 20px rgba(255, 255, 255, 0.5), 0 0 40px rgba(255, 255, 255, 0.3)',
            }}
          />

          <div className="grid grid-cols-2 grid-rows-2 gap-0 h-full">
            {renderQuadrant('yes-whale', 'YES', '$10,000+', 'top-left')}
            {renderQuadrant('no-whale', 'NO', '$10,000+', 'top-right')}
            {renderQuadrant('yes-mid', '', '$1,000-$10,000', 'bottom-left')}
            {renderQuadrant('no-mid', '', '$1,000-$10,000', 'bottom-right')}
          </div>
        </div>
      </div>

      {/* Wallet details panel */}
      {selectedWallet && (
        <div className="fixed right-0 top-0 bottom-0 w-96 bg-black/95 backdrop-blur-2xl border-l border-white/10 shadow-2xl z-50 overflow-y-auto animate-slide-in-right">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">Wallet Details</h3>
              <button
                onClick={() => setSelectedWallet(null)}
                className="text-white/60 hover:text-white transition-colors text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-white/50 mb-1">Wallet Address</p>
                <p className="font-mono text-sm break-all text-white/90">{selectedWallet.wallet_address}</p>
              </div>

              <div>
                <p className="text-sm text-white/50 mb-1">Total Amount</p>
                <p className="text-3xl font-black bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
                  ${selectedWallet.total_amount.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-white/50 mb-3">Recent Trades</p>
                <div className="space-y-2">
                  {selectedWallet.trades.map((trade, i) => (
                    <Card key={i} className="p-3 bg-white/5 border-white/10">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className={`text-xs font-bold ${trade.side === 'yes' ? 'text-[#00FF82]' : 'text-[#FF3A3A]'}`}>
                            {trade.side.toUpperCase()}
                          </span>
                          <p className="text-sm mt-1 text-white">${trade.amount.toLocaleString()}</p>
                          <p className="text-xs text-white/50">
                            {formatDistanceToNow(new Date(trade.timestamp), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/50">Price</p>
                          <p className="text-sm text-white">${trade.price.toFixed(2)}</p>
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
                  className="block w-full py-3 px-4 bg-primary text-primary-foreground rounded-lg text-center font-bold hover:opacity-90 transition-opacity shadow-lg"
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
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          33% { transform: translate(30px, -30px); }
          66% { transform: translate(-30px, 30px); }
        }
        
        @keyframes slide-in-right {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
