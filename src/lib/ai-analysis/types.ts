// AI Analysis types for trade insights - Enhanced with advanced metrics

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
  
  // Advanced metrics
  pnlStandardDeviation: number;
  sharpeRatio: number;
  maxDrawdown: number;
  maxDrawdownDuration: number; // in days
  averageHoldingPeriod: number; // estimated in days
  tradeFrequency: number; // trades per week
  winRateConsistency: number; // standard deviation of win rate over time
  avgRMultiple: number; // average R-multiple (estimated)
  expectancy: number; // (winRate * avgWin) - (lossRate * avgLoss)
}

export interface StrategyAnalysis {
  strategy: string;
  tradeCount: number;
  winRate: number;
  totalPnl: number;
  averagePnl: number;
  avgRMultiple: number;
  consistency: number; // 0-1 score of how consistent this strategy is
}

export interface SymbolAnalysis {
  symbol: string;
  tradeCount: number;
  winRate: number;
  totalPnl: number;
  averagePnl: number;
  avgRMultiple: number;
}

export interface DirectionAnalysis {
  direction: 'long' | 'short';
  tradeCount: number;
  winRate: number;
  totalPnl: number;
  averagePnl: number;
  avgRMultiple: number;
}

export interface MonthlyPerformance {
  month: string;
  totalPnl: number;
  tradeCount: number;
  winRate: number;
  avgRMultiple: number;
  bestTrade: number;
  worstTrade: number;
}

// New: Time-based analysis
export interface TimeBasedAnalysis {
  byDayOfWeek: {
    day: string;
    tradeCount: number;
    winRate: number;
    totalPnl: number;
    avgRMultiple: number;
  }[];
  byTimeOfDay: {
    period: 'morning' | 'afternoon' | 'evening' | 'night';
    tradeCount: number;
    winRate: number;
    totalPnl: number;
  }[];
  byWeekOfMonth: {
    week: number;
    tradeCount: number;
    winRate: number;
    totalPnl: number;
  }[];
}

// New: Behavioral patterns
export interface BehavioralPattern {
  type: 'revenge_trading' | 'overtrading' | 'hesitation' | 'fomo' | 'panic_selling' | 'greed' | 'consistency';
  description: string;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
  evidence: string[];
  impact: 'positive' | 'negative' | 'neutral';
  recommendations: string[];
}

// New: Psychology profile
export interface PsychologyProfile {
  emotionalStability: number; // 1-10
  disciplineScore: number; // 1-10
  riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  commonEmotions: string[];
  triggers: string[];
  copingMechanisms: string[];
  improvementAreas: string[];
}

// Enhanced TradePattern
export interface TradePattern {
  pattern: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  category: 'statistical' | 'behavioral' | 'temporal' | 'strategic';
  actionable: boolean;
  metrics: {
    winRateImpact?: number;
    pnlImpact?: number;
    frequency?: number;
  };
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
    openDateTime?: string; // ISO datetime string (YYYY-MM-DDTHH:MM) - when trade was opened
    closeDateTime?: string; // ISO datetime string (YYYY-MM-DDTHH:MM) - when trade was closed
  }>;
}

export interface AIAnalysisResponse {
  // Executive summary
  summary: string;
  
  // Key strengths identified
  strengths: string[];
  
  // Critical weaknesses to address
  weaknesses: string[];
  
  // Enhanced pattern analysis
  patterns: TradePattern[];
  
  // Behavioral analysis
  behavioralPatterns: BehavioralPattern[];
  
  // Psychology profile
  psychologyProfile?: PsychologyProfile;
  
  // Time-based insights
  timeBasedInsights?: {
    bestDayOfWeek: string;
    worstDayOfWeek: string;
    bestTimeOfDay: string;
    tradingRhythm: string;
  };
  
  // Risk assessment
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    description: string;
    recommendations: string[];
    quantitativeScore: number; // 1-10
    maxDrawdownRisk: number;
    positionSizingScore: number;
  };
  
  // Action plan - specific steps to improve
  actionPlan: Array<{
    step: string;
    priority: 'high' | 'medium' | 'low';
    description: string;
    expectedImpact: string;
    timeline: string;
    successMetrics: string[];
  }>;
  
  // Performance trends
  trends: {
    improving: boolean;
    description: string;
    metrics: string[];
    momentum: 'accelerating' | 'stable' | 'decelerating';
    trajectory: 'upward' | 'sideways' | 'downward';
  };
  
  // Psychological insights (if notes contain emotional data)
  psychologicalInsights?: string[];
  
  // Strategy recommendations
  strategyRecommendations: Array<{
    strategy: string;
    action: 'focus' | 'reduce' | 'eliminate' | 'modify';
    reasoning: string;
    expectedImprovement: number;
  }>;
  
  // Overall rating (1-10)
  overallRating: number;
  
  // Confidence score in this analysis (1-10)
  analysisConfidence: number;
}

export interface CachedAnalysis {
  userId: string;
  analysis: AIAnalysisResponse;
  metrics: TradeMetrics;
  timestamp: string;
  expiresAt: string;
}