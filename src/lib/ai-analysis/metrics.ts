import { Trade } from '@/lib/types';
import {
  TradeMetrics,
  StrategyAnalysis,
  SymbolAnalysis,
  DirectionAnalysis,
  MonthlyPerformance,
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
    
    analysis.push({
      strategy,
      tradeCount: strategyTrades.length,
      winRate: (winningTrades.length / strategyTrades.length) * 100,
      totalPnl,
      averagePnl: totalPnl / strategyTrades.length,
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
    
    analysis.push({
      symbol,
      tradeCount: symbolTrades.length,
      winRate: (winningTrades.length / symbolTrades.length) * 100,
      totalPnl,
      averagePnl: totalPnl / symbolTrades.length,
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
    
    analysis.push({
      direction: 'long',
      tradeCount: longTrades.length,
      winRate: (winningTrades.length / longTrades.length) * 100,
      totalPnl,
      averagePnl: totalPnl / longTrades.length,
    });
  }

  if (shortTrades.length > 0) {
    const winningTrades = shortTrades.filter(t => t.result === 'profit');
    const totalPnl = shortTrades.reduce((sum, t) => sum + t.pnl, 0);
    
    analysis.push({
      direction: 'short',
      tradeCount: shortTrades.length,
      winRate: (winningTrades.length / shortTrades.length) * 100,
      totalPnl,
      averagePnl: totalPnl / shortTrades.length,
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
    
    analysis.push({
      month,
      totalPnl,
      tradeCount: monthTrades.length,
      winRate: (winningTrades.length / monthTrades.length) * 100,
    });
  });

  return analysis.sort((a, b) => a.month.localeCompare(b.month));
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
  };
}