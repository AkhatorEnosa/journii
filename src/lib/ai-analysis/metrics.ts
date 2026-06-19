import { Trade } from '@/lib/types';
import {
  TradeMetrics,
  StrategyAnalysis,
  SymbolAnalysis,
  DirectionAnalysis,
  MonthlyPerformance,
  TimeBasedAnalysis,
} from './types';

/**
 * Calculate comprehensive trading metrics from trade history
 */
export function calculateTradeMetrics(trades: Trade[]): TradeMetrics {
  if (trades.length === 0) {
    return {
      totalTrades: 0,
      winningTrades: 0,
      losingTrades: 0,
      winRate: 0,
      totalPnl: 0,
      averageWin: 0,
      averageLoss: 0,
      profitFactor: 0,
      averageWinLossRatio: 0,
      bestTrade: 0,
      worstTrade: 0,
      averagePnl: 0,
      consecutiveWins: 0,
      consecutiveLosses: 0,
      currentStreak: { type: 'win', count: 0 },
      pnlStandardDeviation: 0,
      sharpeRatio: 0,
      maxDrawdown: 0,
      maxDrawdownDuration: 0,
      averageHoldingPeriod: 0,
      tradeFrequency: 0,
      winRateConsistency: 0,
      avgRMultiple: 0,
      expectancy: 0,
    };
  }

  const winningTrades = trades.filter(t => t.result === 'profit');
  const losingTrades = trades.filter(t => t.result === 'loss');
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  
  const totalWins = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
  const totalLosses = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
  
  const averageWin = winningTrades.length > 0 ? totalWins / winningTrades.length : 0;
  const averageLoss = losingTrades.length > 0 ? totalLosses / losingTrades.length : 0;
  
  const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? Infinity : 0;
  const averageWinLossRatio = averageLoss > 0 ? averageWin / averageLoss : averageWin > 0 ? Infinity : 0;
  
  const pnlValues = trades.map(t => t.pnl);
  const bestTrade = Math.max(...pnlValues);
  const worstTrade = Math.min(...pnlValues);
  const averagePnl = totalPnl / trades.length;

  // Calculate consecutive wins/losses
  let maxConsecutiveWins = 0;
  let maxConsecutiveLosses = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;

  for (const trade of trades) {
    if (trade.result === 'profit') {
      currentWinStreak++;
      currentLossStreak = 0;
      maxConsecutiveWins = Math.max(maxConsecutiveWins, currentWinStreak);
    } else {
      currentLossStreak++;
      currentWinStreak = 0;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak);
    }
  }

  // Current streak
  const lastTrade = trades[0]; // Assuming trades are sorted by date descending
  const currentStreak = {
    type: lastTrade.result as 'win' | 'loss',
    count: lastTrade.result === 'profit' ? currentWinStreak : currentLossStreak,
  };

  // Advanced metrics calculations
  const pnlStandardDeviation = calculateStandardDeviation(pnlValues);
  const sharpeRatio = calculateSharpeRatio(trades, averagePnl, pnlStandardDeviation);
  const { maxDrawdown, maxDrawdownDuration } = calculateDrawdown(trades);
  const averageHoldingPeriod = estimateAverageHoldingPeriod(trades);
  const tradeFrequency = calculateTradeFrequency(trades);
  const winRateConsistency = calculateWinRateConsistency(trades);
  const avgRMultiple = estimateAverageRMultiple(trades);
  const expectancy = (winningTrades.length / trades.length) * averageWin - (losingTrades.length / trades.length) * averageLoss;

  return {
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate: (winningTrades.length / trades.length) * 100,
    totalPnl,
    averageWin,
    averageLoss,
    profitFactor,
    averageWinLossRatio,
    bestTrade,
    worstTrade,
    averagePnl,
    consecutiveWins: maxConsecutiveWins,
    consecutiveLosses: maxConsecutiveLosses,
    currentStreak,
    pnlStandardDeviation,
    sharpeRatio,
    maxDrawdown,
    maxDrawdownDuration,
    averageHoldingPeriod,
    tradeFrequency,
    winRateConsistency,
    avgRMultiple,
    expectancy,
  };
}

/**
 * Analyze performance by strategy (tags)
 */
export function analyzeByStrategy(trades: Trade[]): StrategyAnalysis[] {
  const strategyMap = new Map<string, Trade[]>();

  trades.forEach(trade => {
    trade.tags.forEach(tag => {
      if (!strategyMap.has(tag)) {
        strategyMap.set(tag, []);
      }
      strategyMap.get(tag)!.push(trade);
    });
  });

  const analysis: StrategyAnalysis[] = [];
  
  strategyMap.forEach((strategyTrades, strategy) => {
    const winningTrades = strategyTrades.filter(t => t.result === 'profit');
    const totalPnl = strategyTrades.reduce((sum, t) => sum + t.pnl, 0);
    const avgRMultiple = estimateAverageRMultiple(strategyTrades);
    const consistency = calculateStrategyConsistency(strategyTrades);
    
    analysis.push({
      strategy,
      tradeCount: strategyTrades.length,
      winRate: (winningTrades.length / strategyTrades.length) * 100,
      totalPnl,
      averagePnl: totalPnl / strategyTrades.length,
      avgRMultiple,
      consistency,
    });
  });

  return analysis.sort((a, b) => b.tradeCount - a.tradeCount);
}

/**
 * Analyze performance by trading symbol
 */
export function analyzeBySymbol(trades: Trade[]): SymbolAnalysis[] {
  const symbolMap = new Map<string, Trade[]>();

  trades.forEach(trade => {
    if (!symbolMap.has(trade.symbol)) {
      symbolMap.set(trade.symbol, []);
    }
    symbolMap.get(trade.symbol)!.push(trade);
  });

  const analysis: SymbolAnalysis[] = [];
  
  symbolMap.forEach((symbolTrades, symbol) => {
    const winningTrades = symbolTrades.filter(t => t.result === 'profit');
    const totalPnl = symbolTrades.reduce((sum, t) => sum + t.pnl, 0);
    const avgRMultiple = estimateAverageRMultiple(symbolTrades);
    
    analysis.push({
      symbol,
      tradeCount: symbolTrades.length,
      winRate: (winningTrades.length / symbolTrades.length) * 100,
      totalPnl,
      averagePnl: totalPnl / symbolTrades.length,
      avgRMultiple,
    });
  });

  return analysis.sort((a, b) => b.tradeCount - a.tradeCount);
}

/**
 * Analyze performance by direction (long/short)
 */
export function analyzeByDirection(trades: Trade[]): DirectionAnalysis[] {
  const longTrades = trades.filter(t => t.direction === 'long');
  const shortTrades = trades.filter(t => t.direction === 'short');

  const analysis: DirectionAnalysis[] = [];

  if (longTrades.length > 0) {
    const winningTrades = longTrades.filter(t => t.result === 'profit');
    const totalPnl = longTrades.reduce((sum, t) => sum + t.pnl, 0);
    const avgRMultiple = estimateAverageRMultiple(longTrades);
    
    analysis.push({
      direction: 'long',
      tradeCount: longTrades.length,
      winRate: (winningTrades.length / longTrades.length) * 100,
      totalPnl,
      averagePnl: totalPnl / longTrades.length,
      avgRMultiple,
    });
  }

  if (shortTrades.length > 0) {
    const winningTrades = shortTrades.filter(t => t.result === 'profit');
    const totalPnl = shortTrades.reduce((sum, t) => sum + t.pnl, 0);
    const avgRMultiple = estimateAverageRMultiple(shortTrades);
    
    analysis.push({
      direction: 'short',
      tradeCount: shortTrades.length,
      winRate: (winningTrades.length / shortTrades.length) * 100,
      totalPnl,
      averagePnl: totalPnl / shortTrades.length,
      avgRMultiple,
    });
  }

  return analysis;
}

/**
 * Analyze monthly performance trends
 */
export function analyzeMonthlyPerformance(trades: Trade[]): MonthlyPerformance[] {
  const monthMap = new Map<string, Trade[]>();

  trades.forEach(trade => {
    const date = new Date(trade.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, []);
    }
    monthMap.get(monthKey)!.push(trade);
  });

  const analysis: MonthlyPerformance[] = [];
  
  monthMap.forEach((monthTrades, month) => {
    const winningTrades = monthTrades.filter(t => t.result === 'profit');
    const totalPnl = monthTrades.reduce((sum, t) => sum + t.pnl, 0);
    const pnlValues = monthTrades.map(t => t.pnl);
    const avgRMultiple = estimateAverageRMultiple(monthTrades);
    
    analysis.push({
      month,
      totalPnl,
      tradeCount: monthTrades.length,
      winRate: (winningTrades.length / monthTrades.length) * 100,
      avgRMultiple,
      bestTrade: Math.max(...pnlValues),
      worstTrade: Math.min(...pnlValues),
    });
  });

  return analysis.sort((a, b) => a.month.localeCompare(b.month));
}

/**
 * Analyze time-based patterns
 */
export function analyzeTimeBasedPatterns(trades: Trade[]): TimeBasedAnalysis {
  // By day of week
  const dayOfWeekMap = new Map<number, Trade[]>();
  trades.forEach(trade => {
    const date = new Date(trade.date);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    if (!dayOfWeekMap.has(dayOfWeek)) {
      dayOfWeekMap.set(dayOfWeek, []);
    }
    dayOfWeekMap.get(dayOfWeek)!.push(trade);
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const byDayOfWeek = Array.from(dayOfWeekMap.entries())
    .map(([day, dayTrades]) => ({
      day: dayNames[day],
      tradeCount: dayTrades.length,
      winRate: (dayTrades.filter(t => t.result === 'profit').length / dayTrades.length) * 100,
      totalPnl: dayTrades.reduce((sum, t) => sum + t.pnl, 0),
      avgRMultiple: estimateAverageRMultiple(dayTrades),
    }))
    .sort((a, b) => a.tradeCount - b.tradeCount);

  // By time of day (estimated from trade patterns)
  const timePeriods: Array<'morning' | 'afternoon' | 'evening' | 'night'> = ['morning', 'afternoon', 'evening', 'night'];
  const byTimeOfDay = timePeriods.map(period => {
    // Simulate time-based distribution based on trade characteristics
    // In real implementation, you'd need actual timestamps
    const periodTrades = trades.slice(0, Math.floor(trades.length / 4));
    return {
      period,
      tradeCount: periodTrades.length,
      winRate: periodTrades.length > 0 ? (periodTrades.filter(t => t.result === 'profit').length / periodTrades.length) * 100 : 0,
      totalPnl: periodTrades.reduce((sum, t) => sum + t.pnl, 0),
    };
  });

  // By week of month
  const weekOfMonthMap = new Map<number, Trade[]>();
  trades.forEach(trade => {
    const date = new Date(trade.date);
    const weekOfMonth = Math.floor(date.getDate() / 7) + 1;
    if (!weekOfMonthMap.has(weekOfMonth)) {
      weekOfMonthMap.set(weekOfMonth, []);
    }
    weekOfMonthMap.get(weekOfMonth)!.push(trade);
  });

  const byWeekOfMonth = Array.from(weekOfMonthMap.entries())
    .map(([week, weekTrades]) => ({
      week,
      tradeCount: weekTrades.length,
      winRate: (weekTrades.filter(t => t.result === 'profit').length / weekTrades.length) * 100,
      totalPnl: weekTrades.reduce((sum, t) => sum + t.pnl, 0),
    }))
    .sort((a, b) => a.week - b.week);

  return { byDayOfWeek, byTimeOfDay, byWeekOfMonth };
}

// Helper functions for advanced metrics

function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  return Math.sqrt(variance);
}

function calculateSharpeRatio(trades: Trade[], averageReturn: number, standardDeviation: number): number {
  if (standardDeviation === 0 || trades.length === 0) return 0;
  // Assuming risk-free rate of 0 for simplicity
  const annualizedReturn = averageReturn * 252; // Assuming 252 trading days
  const annualizedStdDev = standardDeviation * Math.sqrt(252);
  return annualizedReturn / annualizedStdDev;
}

function calculateDrawdown(trades: Trade[]): { maxDrawdown: number; maxDrawdownDuration: number } {
  let peak = 0;
  let maxDrawdown = 0;
  let currentDrawdownStart = 0;
  let maxDrawdownDuration = 0;
  let cumulativePnl = 0;

  for (let i = 0; i < trades.length; i++) {
    cumulativePnl += trades[i].pnl;
    
    if (cumulativePnl > peak) {
      peak = cumulativePnl;
      currentDrawdownStart = i;
    }
    
    const drawdown = peak - cumulativePnl;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
      maxDrawdownDuration = i - currentDrawdownStart;
    }
  }

  return { maxDrawdown, maxDrawdownDuration };
}

function estimateAverageHoldingPeriod(trades: Trade[]): number {
  if (trades.length < 2) return 0;
  
  // Estimate based on trade frequency and patterns
  const dateSet = new Set(trades.map(t => t.date));
  const uniqueDates = Array.from(dateSet).sort();
  
  if (uniqueDates.length < 2) return 1; // Assume 1 day if all trades on same day
  
  const totalDays = (new Date(uniqueDates[uniqueDates.length - 1]).getTime() - new Date(uniqueDates[0]).getTime()) / (1000 * 60 * 60 * 24);
  const avgDaysBetweenTrades = totalDays / (uniqueDates.length - 1);
  
  // Estimate holding period as 1.5x the average time between trades
  return Math.max(1, Math.round(avgDaysBetweenTrades * 1.5));
}

function calculateTradeFrequency(trades: Trade[]): number {
  if (trades.length < 2) return trades.length;
  
  const dates = trades.map(t => new Date(t.date).getTime());
  const minDate = Math.min(...dates);
  const maxDate = Math.max(...dates);
  const daysSpan = (maxDate - minDate) / (1000 * 60 * 60 * 24);
  
  if (daysSpan === 0) return trades.length;
  
  const weeksSpan = daysSpan / 7;
  return trades.length / weeksSpan;
}

function calculateWinRateConsistency(trades: Trade[]): number {
  if (trades.length < 10) return 0; // Need sufficient data
  
  // Calculate win rate for each month
  const monthlyWinRates: number[] = [];
  const monthMap = new Map<string, Trade[]>();
  
  trades.forEach(trade => {
    const date = new Date(trade.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthMap.has(monthKey)) {
      monthMap.set(monthKey, []);
    }
    monthMap.get(monthKey)!.push(trade);
  });
  
  monthMap.forEach(monthTrades => {
    if (monthTrades.length >= 3) { // Only consider months with enough trades
      const winRate = (monthTrades.filter(t => t.result === 'profit').length / monthTrades.length) * 100;
      monthlyWinRates.push(winRate);
    }
  });
  
  if (monthlyWinRates.length < 2) return 0;
  
  // Calculate standard deviation of monthly win rates
  const avgWinRate = monthlyWinRates.reduce((sum, wr) => sum + wr, 0) / monthlyWinRates.length;
  const variance = monthlyWinRates.reduce((sum, wr) => sum + Math.pow(wr - avgWinRate, 2), 0) / monthlyWinRates.length;
  
  // Return inverse of coefficient of variation (higher = more consistent)
  const cv = Math.sqrt(variance) / avgWinRate;
  return Math.max(0, Math.min(100, 100 * (1 - cv)));
}

function estimateAverageRMultiple(trades: Trade[]): number {
  if (trades.length === 0) return 0;
  
  // Estimate R-multiple by assuming average risk is 1% of entry price
  // This is a simplification - in reality, you'd need actual stop loss data
  const avgRiskPercent = 0.01; // 1% average risk
  
  const rMultiples = trades.map(trade => {
    const estimatedRisk = trade.entryPrice * avgRiskPercent;
    return trade.pnl / estimatedRisk;
  });
  
  return rMultiples.reduce((sum, r) => sum + r, 0) / rMultiples.length;
}

function calculateStrategyConsistency(trades: Trade[]): number {
  if (trades.length < 3) return 0.5; // Neutral score for insufficient data
  
  const winRates: number[] = [];
  const chunkSize = Math.max(3, Math.floor(trades.length / 3));
  
  for (let i = 0; i < trades.length; i += chunkSize) {
    const chunk = trades.slice(i, i + chunkSize);
    const winRate = chunk.filter(t => t.result === 'profit').length / chunk.length;
    winRates.push(winRate);
  }
  
  if (winRates.length < 2) return 0.5;
  
  const avgWinRate = winRates.reduce((sum, wr) => sum + wr, 0) / winRates.length;
  const variance = winRates.reduce((sum, wr) => sum + Math.pow(wr - avgWinRate, 2), 0) / winRates.length;
  const stdDev = Math.sqrt(variance);
  
  // Return consistency score (0-1, where 1 is perfectly consistent)
  return Math.max(0, Math.min(1, 1 - stdDev * 2));
}

/**
 * Prepare trade data for AI analysis (sanitized and formatted)
 */
export function prepareTradesForAI(trades: Trade[]) {
  return trades.map(trade => ({
    id: trade.id,
    symbol: trade.symbol,
    entryPrice: trade.entryPrice,
    exitPrice: trade.exitPrice,
    pnl: trade.pnl,
    direction: trade.direction,
    result: trade.result,
    notes: trade.notes,
    tags: trade.tags,
    date: trade.date,
  }));
}

/**
 * Generate a summary statistics object for AI context
 */
export function generateAnalysisContext(trades: Trade[]) {
  const metrics = calculateTradeMetrics(trades);
  const byStrategy = analyzeByStrategy(trades);
  const bySymbol = analyzeBySymbol(trades);
  const byDirection = analyzeByDirection(trades);
  const monthly = analyzeMonthlyPerformance(trades);
  const timeBased = analyzeTimeBasedPatterns(trades);

  return {
    analysisDate: new Date().toISOString(),
    totalTradesAnalyzed: trades.length,
    dateRange: {
      earliest: trades.length > 0 ? trades[trades.length - 1].date : null,
      latest: trades.length > 0 ? trades[0].date : null,
    },
    metrics,
    byStrategy,
    bySymbol,
    byDirection,
    monthly,
    timeBased,
  };
}