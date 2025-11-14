import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type EntryTimeBucket = 'recent' | 'days' | 'weeks' | 'oldest';

type BetNode = {
  id: string;
  side: 'YES' | 'NO';
  amount: number;
  addressShort: string;
  entryTimeBucket: EntryTimeBucket;
  walletAddress: string;
  profit?: number;
};

interface LiveWalletDistributionSectionProps {
  marketTitle: string;
  yesOdds: number;
  noOdds: number;
  totalLiquidity: number;
  volume24h: number;
  activeWallets: number;
  nodes: BetNode[];
}

export const LiveWalletDistributionSection = ({
  marketTitle,
  yesOdds,
  noOdds,
  totalLiquidity,
  volume24h,
  activeWallets,
  nodes
}: LiveWalletDistributionSectionProps) => {
  const navigate = useNavigate();
  const [sideFilter, setSideFilter] = useState<'YES' | 'NO' | 'BOTH'>('BOTH');
  const [timeFilter, setTimeFilter] = useState<EntryTimeBucket | 'all'>('all');
  const [hoveredBubble, setHoveredBubble] = useState<BetNode | null>(null);
  const [selectedBubble, setSelectedBubble] = useState<BetNode | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const filteredNodes = useMemo(() => {
    let filtered = nodes;
    
    if (sideFilter !== 'BOTH') {
      filtered = filtered.filter(n => n.side === sideFilter);
    }
    
    if (timeFilter !== 'all') {
      filtered = filtered.filter(n => n.entryTimeBucket === timeFilter);
    }
    
    return filtered;
  }, [nodes, sideFilter, timeFilter]);

  const yesNodes = useMemo(() => 
    filteredNodes.filter(n => n.side === 'YES').sort((a, b) => a.amount - b.amount),
    [filteredNodes]
  );

  const noNodes = useMemo(() => 
    filteredNodes.filter(n => n.side === 'NO').sort((a, b) => a.amount - b.amount),
    [filteredNodes]
  );

  const getTimeBucketColor = (bucket: EntryTimeBucket, side: 'YES' | 'NO') => {
    const yesColors = {
      recent: 'hsl(168, 76%, 56%)',    // bright teal
      days: 'hsl(168, 66%, 48%)',      // teal
      weeks: 'hsl(168, 56%, 40%)',     // darker teal
      oldest: 'hsl(168, 46%, 32%)'     // darkest teal
    };
    
    const noColors = {
      recent: 'hsl(330, 76%, 56%)',    // bright pink
      days: 'hsl(330, 66%, 48%)',      // pink
      weeks: 'hsl(270, 56%, 50%)',     // purple
      oldest: 'hsl(270, 46%, 42%)'     // darker purple
    };
    
    return side === 'YES' ? yesColors[bucket] : noColors[bucket];
  };

  const positionBubbles = (nodeList: BetNode[], side: 'YES' | 'NO') => {
    const maxRadius = 40;
    const minRadius = 8;
    const maxAmount = Math.max(...nodes.map(n => n.amount));
    
    return nodeList.map((node, index) => {
      const radius = minRadius + (node.amount / maxAmount) * (maxRadius - minRadius);
      const totalNodes = nodeList.length;
      const angle = (index / totalNodes) * Math.PI * 1.5 - Math.PI * 0.75;
      const distance = 150 + (index / totalNodes) * 180;
      
      const baseX = side === 'YES' ? 35 : 65;
      const x = baseX + (side === 'YES' ? -1 : 1) * Math.cos(angle) * distance / 8;
      const y = 50 + Math.sin(angle) * distance / 6;
      
      return {
        ...node,
        x,
        y,
        radius
      };
    });
  };

  const positionedYes = positionBubbles(yesNodes, 'YES');
  const positionedNo = positionBubbles(noNodes, 'NO');
  const allPositioned = [...positionedYes, ...positionedNo];

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <section className="space-y-6">
      {/* Market Header */}
      <Card className="glass-strong p-6 border-border/50">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <h2 className="text-xl font-bold">{marketTitle}</h2>
          <div className="flex gap-3">
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              YES {(yesOdds * 100).toFixed(0)}%
            </Badge>
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
              NO {(noOdds * 100).toFixed(0)}%
            </Badge>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-muted-foreground">Total Liquidity</div>
            <div className="text-2xl font-bold gradient-text">
              ${(totalLiquidity / 1000).toFixed(1)}K
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">24h Volume</div>
            <div className="text-2xl font-bold gradient-text">
              ${(volume24h / 1000).toFixed(1)}K
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Active Wallets</div>
            <div className="text-2xl font-bold gradient-text">
              {activeWallets}
            </div>
          </div>
        </div>
      </Card>

      {/* Controls Bar */}
      <Card className="glass-strong p-4 border-border/50">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold">Live Wallet Distribution</h3>
            <Badge variant="outline" className="gap-2">
              <Activity className="h-3 w-3 animate-pulse text-green-500" />
              Real-time
            </Badge>
          </div>
          
          <div className="flex items-center gap-4 flex-wrap">
            {/* Side Filter */}
            <div className="flex gap-1 glass rounded-lg p-1">
              {(['YES', 'NO', 'BOTH'] as const).map((side) => (
                <button
                  key={side}
                  onClick={() => setSideFilter(side)}
                  className={`px-4 py-1.5 rounded-md text-sm font-semibold transition-all ${
                    sideFilter === side
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {side}
                </button>
              ))}
            </div>

            {/* Time Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Entry Time:</span>
              <div className="flex gap-1 glass rounded-lg p-1">
                {([
                  { value: 'all', label: 'All' },
                  { value: 'recent', label: 'Recent' },
                  { value: 'days', label: 'Days' },
                  { value: 'weeks', label: 'Weeks' },
                  { value: 'oldest', label: 'Oldest' }
                ] as const).map((time) => (
                  <button
                    key={time.value}
                    onClick={() => setTimeFilter(time.value as any)}
                    className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                      timeFilter === time.value
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {time.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Bubble Map */}
      <Card className="glass-strong border-border/50 overflow-hidden">
        <div 
          className="relative w-full h-[600px]"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredBubble(null)}
        >
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/20 via-blue-500/20 to-purple-500/20" />
          
          {/* Center Divider */}
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
          
          {/* Side Labels */}
          <div className="absolute left-8 top-8 text-2xl font-bold text-green-400">
            YES
          </div>
          <div className="absolute right-8 top-8 text-2xl font-bold text-red-400">
            NO
          </div>

          {/* SVG Bubbles */}
          <svg className="w-full h-full">
            {allPositioned.map((bubble) => (
              <g key={bubble.id}>
                <circle
                  cx={`${bubble.x}%`}
                  cy={`${bubble.y}%`}
                  r={bubble.radius}
                  fill={getTimeBucketColor(bubble.entryTimeBucket, bubble.side)}
                  opacity={hoveredBubble?.id === bubble.id ? 0.9 : 0.7}
                  className="cursor-pointer transition-all duration-200 hover:opacity-100"
                  style={{
                    filter: hoveredBubble?.id === bubble.id 
                      ? 'drop-shadow(0 0 8px currentColor)' 
                      : 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
                    animation: 'fade-in 0.6s ease-out'
                  }}
                  onMouseEnter={() => setHoveredBubble(bubble)}
                  onClick={() => setSelectedBubble(bubble)}
                />
              </g>
            ))}
          </svg>

          {/* Tooltip */}
          {hoveredBubble && (
            <div
              className="absolute pointer-events-none glass-strong p-3 rounded-lg border border-border/50 z-10 animate-fade-in"
              style={{
                left: `${mousePos.x + 10}px`,
                top: `${mousePos.y + 10}px`
              }}
            >
              <div className="text-sm font-mono mb-1">{hoveredBubble.addressShort}</div>
              <div className="text-xs text-muted-foreground mb-1">
                <span className={hoveredBubble.side === 'YES' ? 'text-green-400' : 'text-red-400'}>
                  {hoveredBubble.side}
                </span> • {hoveredBubble.entryTimeBucket}
              </div>
              <div className="text-lg font-bold gradient-text">
                ${(hoveredBubble.amount / 1000).toFixed(1)}K
              </div>
              {hoveredBubble.profit !== undefined && (
                <div className={`text-sm ${hoveredBubble.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {hoveredBubble.profit >= 0 ? '+' : ''}{(hoveredBubble.profit / 1000).toFixed(1)}K P&L
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Info Drawer */}
      {selectedBubble && (
        <Card className="glass-strong p-6 border-border/50 animate-fade-in">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Wallet Address</div>
              <div className="text-xl font-mono font-bold">{selectedBubble.addressShort}</div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedBubble(null)}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-sm text-muted-foreground">Position</div>
              <div className={`text-2xl font-bold ${
                selectedBubble.side === 'YES' ? 'text-green-400' : 'text-red-400'
              }`}>
                {selectedBubble.side}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Amount</div>
              <div className="text-2xl font-bold gradient-text">
                ${(selectedBubble.amount / 1000).toFixed(1)}K
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Entry Time</div>
              <div className="text-2xl font-bold">
                {selectedBubble.entryTimeBucket}
              </div>
            </div>
          </div>

          {selectedBubble.profit !== undefined && (
            <div className="mb-4">
              <div className="text-sm text-muted-foreground">Current P&L</div>
              <div className={`text-3xl font-bold ${
                selectedBubble.profit >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {selectedBubble.profit >= 0 ? '+' : ''}${(selectedBubble.profit / 1000).toFixed(1)}K
              </div>
            </div>
          )}

          <Button 
            className="w-full glow-gradient"
            onClick={() => navigate(`/wallet/${selectedBubble.walletAddress}`)}
          >
            View Full Wallet Details
          </Button>
        </Card>
      )}
    </section>
  );
};
