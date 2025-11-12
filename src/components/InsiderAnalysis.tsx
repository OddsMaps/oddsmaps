import { AlertTriangle, Shield, TrendingUp, Clock, DollarSign, Activity } from "lucide-react";
import type { Market } from "@/hooks/useMarkets";
import { useMemo } from "react";

interface InsiderAnalysisProps {
  market: Market;
}

interface SuspiciousActivity {
  id: string;
  type: string;
  severity: "low" | "medium" | "high";
  wallet: string;
  amount: number;
  timestamp: string;
  description: string;
  confidence: number;
}

const InsiderAnalysis = ({ market }: InsiderAnalysisProps) => {
  // Generate mock suspicious activity data
  const suspiciousActivities = useMemo(() => {
    const activities: SuspiciousActivity[] = [];
    
    // Generate 5-8 suspicious activities
    const types = [
      { type: "Large Position Before News", severity: "high", desc: "Unusual large position taken 24h before major news event" },
      { type: "Coordinated Trading", severity: "high", desc: "Multiple wallets executing similar trades within minutes" },
      { type: "Whale Movement", severity: "medium", desc: "Single wallet moved significant capital into position" },
      { type: "Bot Activity Detected", severity: "medium", desc: "Algorithmic trading pattern with high frequency" },
      { type: "Unusual Timing", severity: "low", desc: "Trade executed during off-peak hours with high volume" },
      { type: "Connected Wallets", severity: "high", desc: "Multiple wallets with shared transaction history trading together" },
    ];

    for (let i = 0; i < 6; i++) {
      const typeData = types[i % types.length];
      activities.push({
        id: `activity-${i}`,
        type: typeData.type,
        severity: typeData.severity as "low" | "medium" | "high",
        wallet: `0x${Math.random().toString(16).substr(2, 8)}`,
        amount: Math.random() * 50000 + 10000,
        timestamp: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
        description: typeData.desc,
        confidence: Math.random() * 30 + 70,
      });
    }

    return activities.sort((a, b) => {
      const severityOrder = { high: 3, medium: 2, low: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });
  }, [market]);

  const highRiskCount = suspiciousActivities.filter(a => a.severity === "high").length;
  const totalSuspiciousVolume = suspiciousActivities.reduce((sum, a) => sum + a.amount, 0);
  const avgConfidence = suspiciousActivities.reduce((sum, a) => sum + a.confidence, 0) / suspiciousActivities.length;

  return (
    <div className="space-y-6">
      {/* Alert Summary */}
      <div className={`glass-strong rounded-2xl p-6 border-2 ${
        highRiskCount > 2 ? "border-red-500/50" : highRiskCount > 0 ? "border-yellow-500/50" : "border-green-500/50"
      }`}>
        <div className="flex items-start gap-4">
          <div className={`p-4 rounded-xl ${
            highRiskCount > 2 ? "bg-red-500/20" : highRiskCount > 0 ? "bg-yellow-500/20" : "bg-green-500/20"
          }`}>
            {highRiskCount > 2 ? (
              <AlertTriangle className="w-8 h-8 text-red-400" />
            ) : highRiskCount > 0 ? (
              <AlertTriangle className="w-8 h-8 text-yellow-400" />
            ) : (
              <Shield className="w-8 h-8 text-green-400" />
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold mb-2">
              {highRiskCount > 2 ? (
                <span className="text-red-400">High Risk Detected</span>
              ) : highRiskCount > 0 ? (
                <span className="text-yellow-400">Moderate Risk</span>
              ) : (
                <span className="text-green-400">Low Risk</span>
              )}
            </h3>
            <p className="text-muted-foreground mb-4">
              {highRiskCount > 2 
                ? "Multiple high-severity suspicious activities detected. Exercise caution."
                : highRiskCount > 0
                ? "Some suspicious activities detected. Review details before trading."
                : "No significant suspicious activities detected in this market."
              }
            </p>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Alerts</div>
                <div className="text-xl font-bold gradient-text">{suspiciousActivities.length}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Suspicious Volume</div>
                <div className="text-xl font-bold gradient-text">${(totalSuspiciousVolume / 1000).toFixed(1)}K</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Avg Confidence</div>
                <div className="text-xl font-bold gradient-text">{avgConfidence.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Suspicious Activities List */}
      <div className="glass-strong rounded-2xl p-6">
        <h3 className="text-xl font-bold gradient-text mb-6">Detected Activities</h3>
        <div className="space-y-4">
          {suspiciousActivities.map((activity) => {
            const severityColors = {
              high: "border-red-500/50 bg-red-500/10",
              medium: "border-yellow-500/50 bg-yellow-500/10",
              low: "border-blue-500/50 bg-blue-500/10",
            };

            const severityBadgeColors = {
              high: "bg-red-500/20 text-red-400",
              medium: "bg-yellow-500/20 text-yellow-400",
              low: "bg-blue-500/20 text-blue-400",
            };

            return (
              <div
                key={activity.id}
                className={`glass border-2 ${severityColors[activity.severity]} rounded-xl p-5 hover:scale-[1.01] transition-all duration-300`}
              >
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-lg">{activity.type}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${severityBadgeColors[activity.severity]}`}>
                        {activity.severity} Risk
                      </span>
                      <span className="px-3 py-1 glass rounded-full text-xs">
                        {activity.confidence.toFixed(0)}% Confidence
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      {activity.description}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-muted-foreground text-xs">Wallet</div>
                      <code className="font-mono">{activity.wallet}</code>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-muted-foreground text-xs">Amount</div>
                      <div className="font-semibold">${(activity.amount / 1000).toFixed(2)}K</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <div className="text-muted-foreground text-xs">Detected</div>
                      <div className="font-semibold">
                        {new Date(activity.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="mt-4 pt-4 border-t border-border/50">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <span>Detection Confidence</span>
                    <span>{activity.confidence.toFixed(0)}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${
                        activity.severity === "high"
                          ? "from-red-400 to-red-600"
                          : activity.severity === "medium"
                          ? "from-yellow-400 to-yellow-600"
                          : "from-blue-400 to-blue-600"
                      } transition-all duration-500`}
                      style={{ width: `${activity.confidence}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="glass rounded-xl p-4 border border-border/50">
        <div className="flex items-start gap-3">
          <Shield className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <strong>Disclaimer:</strong> This analysis uses algorithmic detection and is provided for informational purposes only. 
            It should not be considered as financial advice. Always conduct your own research before trading.
          </div>
        </div>
      </div>
    </div>
  );
};

export default InsiderAnalysis;
