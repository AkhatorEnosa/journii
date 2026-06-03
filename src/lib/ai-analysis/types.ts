// AI Analysis types for trade insights

export interface TradeMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnl: number;
  averageWin: number;
  averageLoss: number;
  profitFactor: number;
  averageWinLossRatio: number;
  bestTrade: number;
  worstTrade: number;
  averagePnl: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  currentStreak: { type: 'win' | 'loss'; count: number };
}

export interface StrategyAnalysis {
  strategy: string;
  tradeCount: number;
  winRate: number;
  totalPnl: number;
  averagePnl: number;
}

export interface SymbolAnalysis {
  symbol: string;
  tradeCount: number;
  winRate: number;
  totalPnl: number;
  averagePnl: number;
}

export interface DirectionAnalysis {
  direction: 'long' | 'short';
  tradeCount: number;
  winRate: number;
  totalPnl: number;
  averagePnl: number;
}

export interface MonthlyPerformance {
  month: string;
  totalPnl: number;
  tradeCount: number;
  winRate: number;
}

export interface TradePattern {
  pattern: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface AIAnalysisRequest {
  userId: string;
  trades: Array<{
    id: string;
    symbol: string;
    entryPrice: number;
    exitPrice: number;
    pnl: number;
    direction: 'long' | 'short';
    result: 'profit' | 'loss';
    notes: string;
    tags: string[];
    date: string;
  }>;
}

export interface AIAnalysisResponse {
  // Executive summary
  summary: string;
  
  // Key strengths identified
  strengths: string[];
  
  // Critical weaknesses to address
  weaknesses: string[];
  
  // Pattern analysis
  patterns: TradePattern[];
  
  // Risk assessment
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    description: string;
    recommendations: string[];
  };
  
  // Action plan - specific steps to improve
  actionPlan: Array<{
    step: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
  }>;
  
  // Performance trends
  trends: {
    improving: boolean;
    description: string;
    metrics: string[];
  };
  
  // Psychological insights (if notes contain emotional data)
  psychologicalInsights?: string[];
  
  // Overall rating (1-10)
  overallRating: number;
}

export interface CachedAnalysis {
  userId: string;
  analysis: AIAnalysisResponse;
  metrics: TradeMetrics;
  timestamp: string;
  expiresAt: string;
}