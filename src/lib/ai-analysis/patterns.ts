import { Trade } from '@/lib/types';
import type { BehavioralPattern, TradePattern } from './types';

/**
 * Detect behavioral patterns in trading activity
 */
export function detectBehavioralPatterns(trades: Trade[]): BehavioralPattern[] {
  const patterns: BehavioralPattern[] = [];
  
  // Detect revenge trading
  const revengeTrading = detectRevengeTrading(trades);
  if (revengeTrading) patterns.push(revengeTrading);
  
  // Detect overtrading
  const overtrading = detectOvertrading(trades);
  if (overtrading) patterns.push(overtrading);
  
  // Detect FOMO patterns
  const fomo = detectFOMOPatterns(trades);
  if (fomo) patterns.push(fomo);
  
  // Detect hesitation patterns
  const hesitation = detectHesitationPatterns(trades);
  if (hesitation) patterns.push(hesitation);
  
  // Detect panic selling
  const panicSelling = detectPanicSelling(trades);
  if (panicSelling) patterns.push(panicSelling);
  
  // Detect greed patterns
  const greed = detectGreedPatterns(trades);
  if (greed) patterns.push(greed);
  
  // Detect consistency patterns
  const consistency = detectConsistencyPatterns(trades);
  if (consistency) patterns.push(consistency);
  
  return patterns;
}

/**
 * Calculate hours between two trades using datetime if available, otherwise date
 */
function getHoursBetweenTrades(trade1: Trade, trade2: Trade): { hours: number; hasTimeData: boolean } {
  // Try to use closeDateTime/openDateTime first
  if (trade1.closeDateTime && trade2.openDateTime) {
    const closeTime = new Date(trade1.closeDateTime);
    const openTime = new Date(trade2.openDateTime);
    if (!isNaN(closeTime.getTime()) && !isNaN(openTime.getTime())) {
      const hoursDiff = (openTime.getTime() - closeTime.getTime()) / (1000 * 60 * 60);
      return { hours: hoursDiff, hasTimeData: true };
    }
  }
  
  // Fall back to date-only comparison
  const date1 = new Date(trade1.date);
  const date2 = new Date(trade2.date);
  const hoursDiff = (date2.getTime() - date1.getTime()) / (1000 * 60 * 60);
  return { hours: hoursDiff, hasTimeData: false };
}

/**
 * Detect revenge trading patterns (trading immediately after losses)
 */
function detectRevengeTrading(trades: Trade[]): BehavioralPattern | null {
  if (trades.length < 5) return null;
  
  let revengeTradeCount = 0;
  const evidence: string[] = [];
  
  for (let i = 0; i < trades.length - 1; i++) {
    if (trades[i].result === 'loss') {
      const { hours: hoursDiff, hasTimeData } = getHoursBetweenTrades(trades[i], trades[i + 1]);
      
      // Only consider trades with datetime data for accurate time-based analysis
      // For trades without datetime, we can't accurately determine if it's revenge trading
      if (hasTimeData && hoursDiff <= 24 && trades[i + 1].result === 'loss') {
        revengeTradeCount++;
        if (evidence.length < 3) {
          const timeDesc = hoursDiff < 1 
            ? `${Math.round(hoursDiff * 60)} minutes` 
            : `${Math.round(hoursDiff)} hours`;
          evidence.push(`Loss on ${trades[i].date} followed by another loss on ${trades[i + 1].date} (${timeDesc} apart)`);
        }
      } else if (!hasTimeData && trades[i + 1].result === 'loss') {
        // For trades without time data, check if it's the same day or next day
        const date1 = new Date(trades[i].date);
        const date2 = new Date(trades[i + 1].date);
        const daysDiff = (date2.getTime() - date1.getTime()) / (1000 * 60 * 60 * 24);
        
        if (daysDiff <= 1) {
          revengeTradeCount++;
          if (evidence.length < 3) {
            evidence.push(`Loss on ${trades[i].date} followed by another loss on ${trades[i + 1].date} (same/next day, no time data)`);
          }
        }
      }
    }
  }
  
  const revengeRate = revengeTradeCount / Math.max(1, trades.filter(t => t.result === 'loss').length);
  
  if (revengeRate > 0.3 && revengeTradeCount >= 2) {
    return {
      type: 'revenge_trading',
      description: `Revenge trading detected in ${Math.round(revengeRate * 100)}% of losing trades. You tend to enter new trades quickly after losses, often leading to compounded losses.`,
      severity: revengeRate > 0.5 ? 'high' : 'medium',
      confidence: Math.min(0.9, 0.5 + revengeRate * 0.4),
      evidence,
      impact: 'negative',
      recommendations: [
        'Implement a mandatory cooling-off period of at least 2-4 hours after any losing trade',
        'Set a maximum daily loss limit and stop trading when reached',
        'Review each loss objectively before entering the next trade',
        'Consider journaling emotions after losses to identify triggers',
      ],
    };
  }
  
  return null;
}

/**
 * Detect overtrading patterns (too many trades in short periods)
 */
function detectOvertrading(trades: Trade[]): BehavioralPattern | null {
  if (trades.length < 10) return null;
  
  // Group trades by week
  const weeklyTrades = new Map<string, Trade[]>();
  trades.forEach(trade => {
    const date = new Date(trade.date);
    const weekNum = Math.floor(date.getDate() / 7) + 1;
    const weekKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-W${weekNum}`;
    if (!weeklyTrades.has(weekKey)) {
      weeklyTrades.set(weekKey, []);
    }
    weeklyTrades.get(weekKey)!.push(trade);
  });
  
  const avgTradesPerWeek = trades.length / (weeklyTrades.size || 1);
  const peakWeeks = Array.from(weeklyTrades.entries())
    .filter(([_, weekTrades]) => weekTrades.length > avgTradesPerWeek * 2)
    .map(([week, weekTrades]) => ({
      week,
      count: weekTrades.length,
      winRate: (weekTrades.filter(t => t.result === 'profit').length / weekTrades.length) * 100,
    }));
  
  if (peakWeeks.length > 0 && avgTradesPerWeek > 5) {
    const avgWinRateInPeakWeeks = peakWeeks.reduce((sum, w) => sum + w.winRate, 0) / peakWeeks.length;
    const evidence = peakWeeks.slice(0, 3).map(w => 
      `Week ${w.week}: ${w.count} trades with ${w.winRate.toFixed(1)}% win rate`
    );
    
    return {
      type: 'overtrading',
      description: `Overtrading detected during peak periods. Average ${avgTradesPerWeek.toFixed(1)} trades per week, with peak weeks showing ${avgWinRateInPeakWeeks.toFixed(1)}% win rate vs your normal performance.`,
      severity: avgTradesPerWeek > 10 ? 'high' : 'medium',
      confidence: Math.min(0.85, 0.4 + (avgTradesPerWeek / 20) * 0.45),
      evidence,
      impact: 'negative',
      recommendations: [
        'Set a maximum number of trades per day/week based on your strategy',
        'Focus on quality over quantity - only take A+ setups',
        'Track your win rate during high-frequency periods to see the impact',
        'Implement a trade review process before entering each position',
      ],
    };
  }
  
  return null;
}

/**
 * Detect FOMO (Fear of Missing Out) patterns
 */
function detectFOMOPatterns(trades: Trade[]): BehavioralPattern | null {
  if (trades.length < 8) return null;
  
  // Look for patterns of entering trades after missing opportunities
  // This is indicated by rapid entries after a series of no trades, or chasing moves
  let fomoCount = 0;
  const evidence: string[] = [];
  
  for (let i = 0; i < trades.length - 2; i++) {
    // Check for gaps in trading followed by rapid entries
    const currentDate = new Date(trades[i].date);
    const prevDate = i > 0 ? new Date(trades[i - 1].date) : null;
    
    if (prevDate) {
      const daysGap = (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      
      // If there was a gap of 3+ days followed by multiple trades in 1-2 days
      if (daysGap >= 3) {
        const nextTrades = trades.slice(i, Math.min(i + 3, trades.length));
        const lastTrade = nextTrades[nextTrades.length - 1];
        const lastDate = new Date(lastTrade.date);
        const rapidFireDays = (lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
        
        if (rapidFireDays <= 2 && nextTrades.length >= 2) {
          fomoCount++;
          if (evidence.length < 3) {
            evidence.push(`${daysGap.toFixed(0)} day gap followed by ${nextTrades.length} trades in ${rapidFireDays.toFixed(0)} days starting ${trades[i].date}`);
          }
        }
      }
    }
  }
  
  if (fomoCount >= 2) {
    return {
      type: 'fomo',
      description: `FOMO trading pattern detected ${fomoCount} times. You tend to jump back into trading aggressively after breaks, potentially chasing missed opportunities.`,
      severity: fomoCount > 3 ? 'high' : 'medium',
      confidence: Math.min(0.8, 0.3 + fomoCount * 0.15),
      evidence,
      impact: 'negative',
      recommendations: [
        'Plan your re-entry strategy before taking breaks from trading',
        'Wait for your best setups rather than chasing the market',
        'Start with smaller position sizes when returning from a break',
        'Review what caused the break and ensure you\'re not trying to "make up" for lost time',
      ],
    };
  }
  
  return null;
}

/**
 * Detect hesitation patterns (missing good setups)
 */
function detectHesitationPatterns(trades: Trade[]): BehavioralPattern | null {
  if (trades.length < 10) return null;
  
  // Look for patterns where user has winning strategies but low trade count
  const strategyMap = new Map<string, Trade[]>();
  trades.forEach(trade => {
    trade.tags.forEach(tag => {
      if (!strategyMap.has(tag)) {
        strategyMap.set(tag, []);
      }
      strategyMap.get(tag)!.push(trade);
    });
  });
  
  const hesitantStrategies: string[] = [];
  strategyMap.forEach((strategyTrades, strategy) => {
    const winRate = (strategyTrades.filter(t => t.result === 'profit').length / strategyTrades.length) * 100;
    // If a strategy has high win rate but low trade count, might indicate hesitation
    if (winRate > 65 && strategyTrades.length < 5) {
      hesitantStrategies.push(`${strategy} (${winRate.toFixed(0)}% win rate, only ${strategyTrades.length} trades)`);
    }
  });
  
  if (hesitantStrategies.length > 0) {
    return {
      type: 'hesitation',
      description: `Hesitation detected in executing proven strategies. You have strategies with ${hesitantStrategies.length > 1 ? '65%+ win rates' : 'high win rates'} but are not trading them frequently enough.`,
      severity: 'medium',
      confidence: 0.7,
      evidence: hesitantStrategies.slice(0, 3),
      impact: 'negative',
      recommendations: [
        'Review your trading plan and trust your backtested strategies',
        'Start with smaller positions to build confidence in execution',
        'Set alerts for your high-probability setups to avoid missing them',
        'Work on the psychological barriers preventing you from taking valid signals',
      ],
    };
  }
  
  return null;
}

/**
 * Detect panic selling patterns
 */
function detectPanicSelling(trades: Trade[]): BehavioralPattern | null {
  if (trades.length < 8) return null;
  
  // Look for patterns of exiting trades quickly at small losses after a series of losses
  let panicCount = 0;
  const evidence: string[] = [];
  
  let lossStreak = 0;
  for (let i = 0; i < trades.length; i++) {
    if (trades[i].result === 'loss') {
      lossStreak++;
      
      // After 2+ consecutive losses, check if next trade is exited very quickly
      if (lossStreak >= 2 && i < trades.length - 1) {
        // Check if the next trade is also a loss and likely exited quickly
        // We infer this from the trade notes or pattern
        const nextTrade = trades[i + 1];
        if (nextTrade.result === 'loss' && nextTrade.pnl < -Math.abs(trades[i].pnl) * 0.5) {
          panicCount++;
          if (evidence.length < 3) {
            evidence.push(`After ${lossStreak} consecutive losses, next trade also resulted in loss on ${nextTrade.date}`);
          }
        }
      }
    } else {
      lossStreak = 0;
    }
  }
  
  if (panicCount >= 2) {
    return {
      type: 'panic_selling',
      description: `Panic selling detected after ${panicCount} instances of compounding losses. You tend to make poor decisions during drawdown periods.`,
      severity: panicCount > 3 ? 'high' : 'medium',
      confidence: Math.min(0.8, 0.4 + panicCount * 0.1),
      evidence,
      impact: 'negative',
      recommendations: [
        'Implement a maximum daily loss limit and stick to it',
        'Use predetermined stop losses for every trade',
        'Take a break after 2 consecutive losses to reset emotionally',
        'Review your worst trades to identify panic exit patterns',
      ],
    };
  }
  
  return null;
}

/**
 * Detect greed patterns (holding winners too long, oversized positions)
 */
function detectGreedPatterns(trades: Trade[]): BehavioralPattern | null {
  if (trades.length < 10) return null;
  
  // Look for patterns where winning trades turn into losses or give back significant gains
  let greedCount = 0;
  const evidence: string[] = [];
  
  // Check for trades where the exit price is much worse than the best available price
  // We infer this from trades that had potential but ended with small wins or losses
  const winningTrades = trades.filter(t => t.result === 'profit');
  const losingTrades = trades.filter(t => t.result === 'loss');
  
  const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length) : 0;
  
  // If average win is much smaller than average loss despite high win rate, might indicate greed
  const winRate = (winningTrades.length / trades.length) * 100;
  
  if (winRate > 60 && avgWin < avgLoss * 0.5) {
    greedCount++;
    evidence.push(`High win rate (${winRate.toFixed(0)}%) but average win ($${avgWin.toFixed(2)}) is less than half of average loss ($${avgLoss.toFixed(2)})`);
  }
  
  // Check for trades that might have been held too long
  const largeLossTrades = losingTrades.filter(t => t.pnl < -avgLoss * 2);
  if (largeLossTrades.length >= 2) {
    greedCount++;
    evidence.push(`${largeLossTrades.length} trades with losses more than 2x your average loss, suggesting positions held too long`);
  }
  
  if (greedCount >= 1) {
    return {
      type: 'greed',
      description: `Potential greed patterns detected. ${evidence.length > 0 ? 'Your risk/reward ratios suggest you may be holding winners too briefly while letting losses run.' : 'Analysis indicates possible greed-driven decision making.'}`,
      severity: greedCount > 1 ? 'high' : 'medium',
      confidence: Math.min(0.75, 0.3 + greedCount * 0.2),
      evidence,
      impact: 'negative',
      recommendations: [
        'Set clear profit targets before entering trades and stick to them',
        'Use trailing stops to lock in profits while letting winners run',
        'Focus on risk/reward ratios of at least 1:2 for every trade',
        'Review your best winning trades to understand optimal exit timing',
      ],
    };
  }
  
  return null;
}

/**
 * Detect consistency patterns (positive or negative)
 */
function detectConsistencyPatterns(trades: Trade[]): BehavioralPattern | null {
  if (trades.length < 15) return null;
  
  // Analyze monthly performance consistency
  const monthlyResults = new Map<string, { trades: number; pnl: number; winRate: number }>();
  
  trades.forEach(trade => {
    const date = new Date(trade.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!monthlyResults.has(monthKey)) {
      monthlyResults.set(monthKey, { trades: 0, pnl: 0, winRate: 0 });
    }
    const monthData = monthlyResults.get(monthKey)!;
    monthData.trades++;
    monthData.pnl += trade.pnl;
  });
  
  // Calculate win rates for each month
  monthlyResults.forEach((data, month) => {
    const monthTrades = trades.filter(t => t.date.startsWith(month));
    data.winRate = (monthTrades.filter(t => t.result === 'profit').length / monthTrades.length) * 100;
  });
  
  const monthlyPnls = Array.from(monthlyResults.values()).map(d => d.pnl);
  const profitableMonths = monthlyPnls.filter(p => p > 0).length;
  const consistency = profitableMonths / Math.max(1, monthlyPnls.length);
  
  if (consistency >= 0.7 && trades.length >= 20) {
    return {
      type: 'consistency',
      description: `Strong consistency detected! ${Math.round(consistency * 100)}% of months were profitable (${profitableMonths}/${monthlyPnls.length} months). This indicates disciplined trading and good risk management.`,
      severity: 'low',
      confidence: Math.min(0.9, 0.5 + consistency * 0.4),
      evidence: Array.from(monthlyResults.entries()).slice(0, 5).map(([month, data]) => 
        `${month}: ${data.trades} trades, $${data.pnl.toFixed(2)} P&L, ${data.winRate.toFixed(0)}% win rate`
      ),
      impact: 'positive',
      recommendations: [
        'Continue following your current approach and risk management rules',
        'Document what\'s working well to reinforce good habits',
        'Consider gradually increasing position sizes while maintaining consistency',
        'Share your successful strategies with your trading journal for future reference',
      ],
    };
  }
  
  return null;
}

/**
 * Generate statistical trade patterns
 */
export function generateStatisticalPatterns(trades: Trade[]): TradePattern[] {
  const patterns: TradePattern[] = [];
  
  // Day of week patterns
  const dayPatterns = analyzeDayOfWeekPatterns(trades);
  patterns.push(...dayPatterns);
  
  // Strategy performance patterns
  const strategyPatterns = analyzeStrategyPatterns(trades);
  patterns.push(...strategyPatterns);
  
  // Win/loss streak patterns
  const streakPatterns = analyzeStreakPatterns(trades);
  patterns.push(...streakPatterns);
  
  // Symbol performance patterns
  const symbolPatterns = analyzeSymbolPatterns(trades);
  patterns.push(...symbolPatterns);
  
  return patterns;
}

function analyzeDayOfWeekPatterns(trades: Trade[]): TradePattern[] {
  const patterns: TradePattern[] = [];
  
  const dayPerformance = new Map<number, { wins: number; losses: number; pnl: number }>();
  
  trades.forEach(trade => {
    const dayOfWeek = new Date(trade.date).getDay();
    if (!dayPerformance.has(dayOfWeek)) {
      dayPerformance.set(dayOfWeek, { wins: 0, losses: 0, pnl: 0 });
    }
    const dayData = dayPerformance.get(dayOfWeek)!;
    if (trade.result === 'profit') dayData.wins++;
    else dayData.losses++;
    dayData.pnl += trade.pnl;
  });
  
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  dayPerformance.forEach((data, day) => {
    const total = data.wins + data.losses;
    if (total >= 3) { // Only consider days with enough data
      const winRate = (data.wins / total) * 100;
      const overallWinRate = (trades.filter(t => t.result === 'profit').length / trades.length) * 100;
      
      if (Math.abs(winRate - overallWinRate) > 15) {
        patterns.push({
          pattern: `${dayNames[day]} Performance Anomaly`,
          description: `Trades on ${dayNames[day]} show ${winRate.toFixed(1)}% win rate vs your overall ${overallWinRate.toFixed(1)}% win rate across ${total} trades with total P&L of $${data.pnl.toFixed(2)}`,
          impact: winRate > overallWinRate ? 'positive' : 'negative',
          confidence: Math.min(0.8, 0.3 + (total / 10) * 0.5),
          category: 'temporal',
          actionable: true,
          metrics: {
            winRateImpact: winRate - overallWinRate,
            pnlImpact: data.pnl,
            frequency: total,
          },
        });
      }
    }
  });
  
  return patterns;
}

function analyzeStrategyPatterns(trades: Trade[]): TradePattern[] {
  const patterns: TradePattern[] = [];
  
  const strategyMap = new Map<string, Trade[]>();
  trades.forEach(trade => {
    trade.tags.forEach(tag => {
      if (!strategyMap.has(tag)) {
        strategyMap.set(tag, []);
      }
      strategyMap.get(tag)!.push(trade);
    });
  });
  
  const overallWinRate = (trades.filter(t => t.result === 'profit').length / trades.length) * 100;
  
  strategyMap.forEach((strategyTrades, strategy) => {
    if (strategyTrades.length >= 3) {
      const winRate = (strategyTrades.filter(t => t.result === 'profit').length / strategyTrades.length) * 100;
      const totalPnl = strategyTrades.reduce((sum, t) => sum + t.pnl, 0);
      
      if (Math.abs(winRate - overallWinRate) > 20) {
        patterns.push({
          pattern: `Strategy "${strategy}" Performance`,
          description: `This strategy shows ${winRate.toFixed(1)}% win rate vs your overall ${overallWinRate.toFixed(1)}% across ${strategyTrades.length} trades with total P&L of $${totalPnl.toFixed(2)}`,
          impact: winRate > overallWinRate ? 'positive' : 'negative',
          confidence: Math.min(0.85, 0.4 + (strategyTrades.length / 10) * 0.45),
          category: 'strategic',
          actionable: true,
          metrics: {
            winRateImpact: winRate - overallWinRate,
            pnlImpact: totalPnl,
            frequency: strategyTrades.length,
          },
        });
      }
    }
  });
  
  return patterns;
}

function analyzeStreakPatterns(trades: Trade[]): TradePattern[] {
  const patterns: TradePattern[] = [];
  
  // Analyze what happens after streaks
  let currentStreak = 0;
  let streakType: 'win' | 'loss' | null = null;
  let streakStartIndex = 0;
  
  const streakEnds: Array<{ type: 'win' | 'loss'; length: number; nextTradeResult: string; nextTradePnl: number }> = [];
  
  for (let i = 0; i < trades.length; i++) {
    const result = trades[i].result as 'win' | 'loss';
    
    if (streakType === null) {
      streakType = result;
      currentStreak = 1;
      streakStartIndex = i;
    } else if (result === streakType) {
      currentStreak++;
    } else {
      // Streak ended
      if (i < trades.length - 1 && currentStreak >= 3) {
        streakEnds.push({
          type: streakType,
          length: currentStreak,
          nextTradeResult: trades[i].result,
          nextTradePnl: trades[i].pnl,
        });
      }
      streakType = result;
      currentStreak = 1;
      streakStartIndex = i;
    }
  }
  
  // Analyze patterns after streaks
  const winStreakEnds = streakEnds.filter(s => s.type === 'win');
  const lossStreakEnds = streakEnds.filter(s => s.type === 'loss');
  
  if (winStreakEnds.length >= 2) {
    const nextWinRate = (winStreakEnds.filter(s => s.nextTradeResult === 'win').length / winStreakEnds.length) * 100;
    if (nextWinRate < 40 || nextWinRate > 80) {
      patterns.push({
        pattern: 'Post-Win-Streak Performance',
        description: `After ${winStreakEnds.length} winning streaks (3+ wins), the next trade has a ${nextWinRate.toFixed(0)}% win rate, suggesting ${nextWinRate < 40 ? 'overconfidence leads to poor decisions' : 'momentum tends to continue'}`,
        impact: nextWinRate > 50 ? 'positive' : 'negative',
        confidence: Math.min(0.7, 0.3 + winStreakEnds.length * 0.1),
        category: 'behavioral',
        actionable: true,
        metrics: {
          winRateImpact: nextWinRate - 50,
          frequency: winStreakEnds.length,
        },
      });
    }
  }
  
  if (lossStreakEnds.length >= 2) {
    const nextWinRate = (lossStreakEnds.filter(s => s.nextTradeResult === 'win').length / lossStreakEnds.length) * 100;
    if (nextWinRate < 30 || nextWinRate > 70) {
      patterns.push({
        pattern: 'Post-Loss-Streak Performance',
        description: `After ${lossStreakEnds.length} losing streaks (3+ losses), the next trade has a ${nextWinRate.toFixed(0)}% win rate, suggesting ${nextWinRate < 30 ? 'emotional trading continues the downward spiral' : 'strong mean reversion after losses'}`,
        impact: nextWinRate > 50 ? 'positive' : 'negative',
        confidence: Math.min(0.7, 0.3 + lossStreakEnds.length * 0.1),
        category: 'behavioral',
        actionable: true,
        metrics: {
          winRateImpact: nextWinRate - 50,
          frequency: lossStreakEnds.length,
        },
      });
    }
  }
  
  return patterns;
}

function analyzeSymbolPatterns(trades: Trade[]): TradePattern[] {
  const patterns: TradePattern[] = [];
  
  const symbolMap = new Map<string, Trade[]>();
  trades.forEach(trade => {
    if (!symbolMap.has(trade.symbol)) {
      symbolMap.set(trade.symbol, []);
    }
    symbolMap.get(trade.symbol)!.push(trade);
  });
  
  const overallWinRate = (trades.filter(t => t.result === 'profit').length / trades.length) * 100;
  
  symbolMap.forEach((symbolTrades, symbol) => {
    if (symbolTrades.length >= 3) {
      const winRate = (symbolTrades.filter(t => t.result === 'profit').length / symbolTrades.length) * 100;
      const totalPnl = symbolTrades.reduce((sum, t) => sum + t.pnl, 0);
      
      if (Math.abs(winRate - overallWinRate) > 25 && symbolTrades.length >= 5) {
        patterns.push({
          pattern: `Symbol "${symbol}" Performance`,
          description: `Trading ${symbol} shows ${winRate.toFixed(1)}% win rate vs your overall ${overallWinRate.toFixed(1)}% across ${symbolTrades.length} trades with total P&L of $${totalPnl.toFixed(2)}`,
          impact: winRate > overallWinRate ? 'positive' : 'negative',
          confidence: Math.min(0.8, 0.4 + (symbolTrades.length / 10) * 0.4),
          category: 'statistical',
          actionable: true,
          metrics: {
            winRateImpact: winRate - overallWinRate,
            pnlImpact: totalPnl,
            frequency: symbolTrades.length,
          },
        });
      }
    }
  });
  
  return patterns;
}