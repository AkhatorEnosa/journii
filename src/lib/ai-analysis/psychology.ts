import { Trade } from '@/lib/types';
import type { PsychologyProfile } from './types';

/**
 * Emotional keywords and their categories
 */
const EMOTIONAL_INDICATORS = {
  fear: ['scared', 'afraid', 'nervous', 'anxious', 'worried', 'panic', 'terrified', 'fearful', 'uneasy'],
  greed: ['greedy', 'more', 'want', 'need', 'chasing', 'FOMO', 'fomo', 'missed', 'opportunity'],
  confidence: ['confident', 'sure', 'certain', 'knew', 'obvious', 'easy', 'textbook', 'perfect'],
  frustration: ['frustrated', 'angry', 'annoyed', 'upset', 'mad', 'irritated', 'disappointed', 'devastated'],
  regret: ['should', 'could', 'would', 'wish', 'regret', 'mistake', 'error', 'wrong'],
  excitement: ['excited', 'thrilled', 'pumped', 'euphoric', 'happy', 'joy', 'elated'],
  hesitation: ['hesitant', 'unsure', 'doubtful', 'uncertain', 'questioning', 'second-guessing'],
  discipline: ['plan', 'rules', 'discipline', 'patient', 'waited', 'followed', 'system'],
  impulsiveness: ['impulsive', 'spontaneous', 'random', 'without', 'thinking', 'quickly', 'rushed'],
};

/**
 * Analyze trading psychology from trade notes and behavior patterns
 */
export function analyzeTradingPsychology(trades: Trade[]): PsychologyProfile | null {
  if (trades.length < 5) return null;
  
  // Analyze emotional content in notes
  const emotionalAnalysis = analyzeEmotionalContent(trades);
  
  // Analyze behavioral patterns
  const behavioralAnalysis = analyzeBehavioralPatterns(trades);
  
  // Calculate psychology scores
  const emotionalStability = calculateEmotionalStability(emotionalAnalysis, behavioralAnalysis);
  const disciplineScore = calculateDisciplineScore(trades, behavioralAnalysis);
  const riskTolerance = assessRiskTolerance(trades, behavioralAnalysis);
  
  // Identify common emotions and triggers
  const commonEmotions = identifyCommonEmotions(emotionalAnalysis);
  const triggers = identifyTriggers(trades, emotionalAnalysis);
  const copingMechanisms = identifyCopingMechanisms(trades, emotionalAnalysis);
  const improvementAreas = identifyImprovementAreas(emotionalAnalysis, behavioralAnalysis);
  
  return {
    emotionalStability: Math.round(emotionalStability * 10) / 10,
    disciplineScore: Math.round(disciplineScore * 10) / 10,
    riskTolerance,
    commonEmotions,
    triggers,
    copingMechanisms,
    improvementAreas,
  };
}

/**
 * Analyze emotional content in trade notes
 */
function analyzeEmotionalContent(trades: Trade[]): { emotions: Map<string, number>; totalNotes: number; notesWithEmotions: number } {
  const emotions = new Map<string, number>();
  let notesWithEmotions = 0;
  let totalNotes = 0;
  
  trades.forEach(trade => {
    if (trade.notes && trade.notes.trim()) {
      totalNotes++;
      const notesLower = trade.notes.toLowerCase();
      let tradeHasEmotion = false;
      
      Object.entries(EMOTIONAL_INDICATORS).forEach(([emotion, keywords]) => {
        const matches = keywords.filter(keyword => notesLower.includes(keyword));
        if (matches.length > 0) {
          emotions.set(emotion, (emotions.get(emotion) || 0) + matches.length);
          tradeHasEmotion = true;
        }
      });
      
      if (tradeHasEmotion) {
        notesWithEmotions++;
      }
    }
  });
  
  return { emotions, totalNotes, notesWithEmotions };
}

/**
 * Analyze behavioral patterns from trading data
 */
function analyzeBehavioralPatterns(trades: Trade[]): {
  consistencyScore: number;
  reactionToLosses: 'healthy' | 'concerning' | 'dangerous';
  reactionToWins: 'healthy' | 'overconfident' | 'cautious';
  tradingFrequency: 'consistent' | 'erratic' | 'sporadic';
} {
  // Calculate consistency score
  const monthlyResults = new Map<string, number>();
  trades.forEach(trade => {
    const month = trade.date.substring(0, 7); // YYYY-MM
    if (!monthlyResults.has(month)) {
      monthlyResults.set(month, 0);
    }
    monthlyResults.set(month, monthlyResults.get(month)! + trade.pnl);
  });
  
  const monthlyPnls = Array.from(monthlyResults.values());
  const profitableMonths = monthlyPnls.filter(p => p > 0).length;
  const consistencyScore = monthlyPnls.length > 0 ? profitableMonths / monthlyPnls.length : 0.5;
  
  // Analyze reaction to losses
  let reactionToLosses: 'healthy' | 'concerning' | 'dangerous' = 'healthy';
  let consecutiveLossCount = 0;
  let maxConsecutiveLosses = 0;
  let pnlAfterLosses = 0;
  let tradesAfterLosses = 0;
  
  for (let i = 0; i < trades.length; i++) {
    if (trades[i].result === 'loss') {
      consecutiveLossCount++;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, consecutiveLossCount);
      
      // Check next trade after a loss
      if (i < trades.length - 1) {
        pnlAfterLosses += trades[i + 1].pnl;
        tradesAfterLosses++;
      }
    } else {
      consecutiveLossCount = 0;
    }
  }
  
  if (maxConsecutiveLosses >= 5) {
    reactionToLosses = 'dangerous';
  } else if (maxConsecutiveLosses >= 3 || (tradesAfterLosses > 0 && pnlAfterLosses < -Math.abs(pnlAfterLosses) * 0.5)) {
    reactionToLosses = 'concerning';
  }
  
  // Analyze reaction to wins
  let reactionToWins: 'healthy' | 'overconfident' | 'cautious' = 'healthy';
  let consecutiveWinCount = 0;
  let maxConsecutiveWins = 0;
  let pnlAfterWins = 0;
  let tradesAfterWins = 0;
  let avgWinSize = 0;
  let avgLossSize = 0;
  
  const winningTrades = trades.filter(t => t.result === 'profit');
  const losingTrades = trades.filter(t => t.result === 'loss');
  avgWinSize = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0;
  avgLossSize = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length) : 0;
  
  for (let i = 0; i < trades.length; i++) {
    if (trades[i].result === 'profit') {
      consecutiveWinCount++;
      maxConsecutiveWins = Math.max(maxConsecutiveWins, consecutiveWinCount);
      
      if (i < trades.length - 1) {
        pnlAfterWins += trades[i + 1].pnl;
        tradesAfterWins++;
      }
    } else {
      consecutiveWinCount = 0;
    }
  }
  
  if (maxConsecutiveWins >= 5 && tradesAfterWins > 0) {
    const avgPnlAfterWins = pnlAfterWins / tradesAfterWins;
    if (avgPnlAfterWins < -avgWinSize * 0.5) {
      reactionToWins = 'overconfident';
    }
  } else if (tradesAfterWins > 0) {
    const avgPnlAfterWins = pnlAfterWins / tradesAfterWins;
    if (avgPnlAfterWins < avgWinSize * 0.3) {
      reactionToWins = 'cautious';
    }
  }
  
  // Analyze trading frequency
  const tradesByMonth = new Map<string, number>();
  trades.forEach(trade => {
    const month = trade.date.substring(0, 7);
    if (!tradesByMonth.has(month)) {
      tradesByMonth.set(month, 0);
    }
    tradesByMonth.set(month, tradesByMonth.get(month)! + 1);
  });
  
  const monthlyCounts = Array.from(tradesByMonth.values());
  const avgMonthlyTrades = monthlyCounts.reduce((sum, c) => sum + c, 0) / monthlyCounts.length;
  const stdDev = Math.sqrt(monthlyCounts.reduce((sum, c) => sum + Math.pow(c - avgMonthlyTrades, 2), 0) / monthlyCounts.length);
  const coefficientOfVariation = avgMonthlyTrades > 0 ? stdDev / avgMonthlyTrades : 0;
  
  let tradingFrequency: 'consistent' | 'erratic' | 'sporadic';
  if (coefficientOfVariation < 0.3) {
    tradingFrequency = 'consistent';
  } else if (coefficientOfVariation < 0.6) {
    tradingFrequency = 'erratic';
  } else {
    tradingFrequency = 'sporadic';
  }
  
  return {
    consistencyScore,
    reactionToLosses,
    reactionToWins,
    tradingFrequency,
  };
}

/**
 * Calculate emotional stability score (1-10)
 */
function calculateEmotionalStability(
  emotionalAnalysis: { emotions: Map<string, number>; totalNotes: number; notesWithEmotions: number },
  behavioralAnalysis: { consistencyScore: number; reactionToLosses: string; reactionToWins: string; tradingFrequency: string }
): number {
  let score = 5; // Base score
  
  // Factor in emotional content in notes
  const emotionRatio = emotionalAnalysis.totalNotes > 0 
    ? emotionalAnalysis.notesWithEmotions / emotionalAnalysis.totalNotes 
    : 0;
  
  // Too many emotional notes might indicate instability
  if (emotionRatio > 0.7) {
    score -= 1;
  } else if (emotionRatio < 0.3) {
    score += 0.5;
  }
  
  // Check for negative emotions
  const fearCount = emotionalAnalysis.emotions.get('fear') || 0;
  const frustrationCount = emotionalAnalysis.emotions.get('frustration') || 0;
  const regretCount = emotionalAnalysis.emotions.get('regret') || 0;
  const negativeEmotionCount = fearCount + frustrationCount + regretCount;
  
  const confidenceCount = emotionalAnalysis.emotions.get('confidence') || 0;
  const disciplineCount = emotionalAnalysis.emotions.get('discipline') || 0;
  const positiveEmotionCount = confidenceCount + disciplineCount;
  
  if (negativeEmotionCount > positiveEmotionCount * 2) {
    score -= 1.5;
  } else if (positiveEmotionCount > negativeEmotionCount) {
    score += 1;
  }
  
  // Factor in behavioral patterns
  score += (behavioralAnalysis.consistencyScore - 0.5) * 2;
  
  if (behavioralAnalysis.reactionToLosses === 'dangerous') {
    score -= 2;
  } else if (behavioralAnalysis.reactionToLosses === 'concerning') {
    score -= 1;
  }
  
  if (behavioralAnalysis.reactionToWins === 'overconfident') {
    score -= 1;
  }
  
  if (behavioralAnalysis.tradingFrequency === 'consistent') {
    score += 0.5;
  } else if (behavioralAnalysis.tradingFrequency === 'erratic') {
    score -= 0.5;
  }
  
  return Math.max(1, Math.min(10, score));
}

/**
 * Calculate discipline score (1-10)
 */
function calculateDisciplineScore(
  trades: Trade[],
  behavioralAnalysis: { consistencyScore: number; reactionToLosses: string; reactionToWins: string; tradingFrequency: string }
): number {
  let score = 5; // Base score
  
  // Check for consistency in trading
  score += (behavioralAnalysis.consistencyScore - 0.5) * 3;
  
  // Check if trader follows their own patterns
  const strategyMap = new Map<string, { wins: number; total: number }>();
  trades.forEach(trade => {
    trade.tags.forEach(tag => {
      if (!strategyMap.has(tag)) {
        strategyMap.set(tag, { wins: 0, total: 0 });
      }
      const data = strategyMap.get(tag)!;
      data.total++;
      if (trade.result === 'profit') data.wins++;
    });
  });
  
  // Check if trader sticks to winning strategies
  let strategyAdherence = 0;
  strategyMap.forEach((data, strategy) => {
    if (data.total >= 3) {
      const winRate = data.wins / data.total;
      if (winRate > 0.6) {
        strategyAdherence += data.total; // Reward for sticking with winning strategies
      }
    }
  });
  
  const totalTrades = trades.length;
  const strategyAdherenceRatio = totalTrades > 0 ? strategyAdherence / totalTrades : 0;
  score += strategyAdherenceRatio * 2;
  
  // Penalize for poor reactions to losses
  if (behavioralAnalysis.reactionToLosses === 'dangerous') {
    score -= 2;
  } else if (behavioralAnalysis.reactionToLosses === 'concerning') {
    score -= 1;
  }
  
  // Reward for consistent trading frequency
  if (behavioralAnalysis.tradingFrequency === 'consistent') {
    score += 1;
  } else if (behavioralAnalysis.tradingFrequency === 'erratic') {
    score -= 1;
  }
  
  return Math.max(1, Math.min(10, score));
}

/**
 * Assess risk tolerance
 */
function assessRiskTolerance(
  trades: Trade[],
  behavioralAnalysis: { consistencyScore: number; reactionToLosses: string; reactionToWins: string; tradingFrequency: string }
): 'conservative' | 'moderate' | 'aggressive' {
  // Calculate average win/loss ratio
  const winningTrades = trades.filter(t => t.result === 'profit');
  const losingTrades = trades.filter(t => t.result === 'loss');
  
  const avgWin = winningTrades.length > 0 ? winningTrades.reduce((sum, t) => sum + t.pnl, 0) / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0) / losingTrades.length) : 0;
  
  // Calculate position sizing consistency (inferred from P&L variance)
  const pnlValues = trades.map(t => t.pnl);
  const avgPnl = pnlValues.reduce((sum, val) => sum + val, 0) / pnlValues.length;
  const pnlVariance = pnlValues.reduce((sum, val) => sum + Math.pow(val - avgPnl, 2), 0) / pnlValues.length;
  const pnlStdDev = Math.sqrt(pnlVariance);
  const coefficientOfVariation = avgPnl !== 0 ? pnlStdDev / Math.abs(avgPnl) : 0;
  
  // Determine risk tolerance based on multiple factors
  let riskScore = 0;
  
  // Higher average wins relative to losses suggest more risk
  if (avgWin > avgLoss * 2) {
    riskScore += 2;
  } else if (avgWin < avgLoss * 0.5) {
    riskScore -= 2;
  }
  
  // High variance in P&L suggests aggressive positioning
  if (coefficientOfVariation > 2) {
    riskScore += 2;
  } else if (coefficientOfVariation < 1) {
    riskScore -= 1;
  }
  
  // Reaction to losses
  if (behavioralAnalysis.reactionToLosses === 'dangerous') {
    riskScore += 2; // Often leads to more risk
  } else if (behavioralAnalysis.reactionToLosses === 'concerning') {
    riskScore += 1;
  }
  
  // Trading frequency
  if (behavioralAnalysis.tradingFrequency === 'erratic') {
    riskScore += 1;
  }
  
  if (riskScore >= 3) {
    return 'aggressive';
  } else if (riskScore <= -1) {
    return 'conservative';
  } else {
    return 'moderate';
  }
}

/**
 * Identify common emotions from trade notes
 */
function identifyCommonEmotions(emotionalAnalysis: { emotions: Map<string, number>; totalNotes: number; notesWithEmotions: number }): string[] {
  const emotions: string[] = [];
  const threshold = 2; // Minimum occurrences to be considered common
  
  const sortedEmotions = Array.from(emotionalAnalysis.emotions.entries())
    .sort((a, b) => b[1] - a[1]);
  
  sortedEmotions.forEach(([emotion, count]) => {
    if (count >= threshold) {
      emotions.push(emotion.charAt(0).toUpperCase() + emotion.slice(1));
    }
  });
  
  return emotions.length > 0 ? emotions : ['Neutral/Analytical'];
}

/**
 * Identify emotional triggers
 */
function identifyTriggers(trades: Trade[], emotionalAnalysis: { emotions: Map<string, number>; totalNotes: number; notesWithEmotions: number }): string[] {
  const triggers: string[] = [];
  
  // Check for loss-related triggers
  const lossesWithFear = trades.filter(t => 
    t.result === 'loss' && 
    t.notes && 
    (t.notes.toLowerCase().includes('scared') || t.notes.toLowerCase().includes('nervous') || t.notes.toLowerCase().includes('worried'))
  ).length;
  
  if (lossesWithFear > 0) {
    triggers.push('Losses triggering fear/anxiety');
  }
  
  // Check for missed opportunity triggers
  const fomoTrades = trades.filter(t => 
    t.notes && 
    (t.notes.toLowerCase().includes('fomo') || t.notes.toLowerCase().includes('missed') || t.notes.toLowerCase().includes('chasing'))
  ).length;
  
  if (fomoTrades > 0) {
    triggers.push('Missing opportunities (FOMO)');
  }
  
  // Check for consecutive loss triggers
  let maxConsecutiveLosses = 0;
  let currentLossStreak = 0;
  trades.forEach(t => {
    if (t.result === 'loss') {
      currentLossStreak++;
      maxConsecutiveLosses = Math.max(maxConsecutiveLosses, currentLossStreak);
    } else {
      currentLossStreak = 0;
    }
  });
  
  if (maxConsecutiveLosses >= 3) {
    triggers.push('Consecutive losses leading to emotional decisions');
  }
  
  // Check for overconfidence triggers
  const overconfidentWins = trades.filter(t => 
    t.result === 'profit' && 
    t.notes && 
    (t.notes.toLowerCase().includes('easy') || t.notes.toLowerCase().includes('obvious') || t.notes.toLowerCase().includes('knew'))
  ).length;
  
  if (overconfidentWins > 0) {
    triggers.push('Wins leading to overconfidence');
  }
  
  return triggers.length > 0 ? triggers : ['No clear emotional triggers detected'];
}

/**
 * Identify coping mechanisms
 */
function identifyCopingMechanisms(trades: Trade[], emotionalAnalysis: { emotions: Map<string, number>; totalNotes: number; notesWithEmotions: number }): string[] {
  const mechanisms: string[] = [];
  
  // Check for planning/discipline mentions
  const planningMentions = trades.filter(t => 
    t.notes && 
    (t.notes.toLowerCase().includes('plan') || t.notes.toLowerCase().includes('rules') || t.notes.toLowerCase().includes('discipline'))
  ).length;
  
  if (planningMentions > 0) {
    mechanisms.push('References to trading plan/rules');
  }
  
  // Check for self-reflection
  const reflectionMentions = trades.filter(t => 
    t.notes && 
    (t.notes.toLowerCase().includes('learn') || t.notes.toLowerCase().includes('improve') || t.notes.toLowerCase().includes('review'))
  ).length;
  
  if (reflectionMentions > 0) {
    mechanisms.push('Self-reflection and learning focus');
  }
  
  // Check for patience mentions
  const patienceMentions = trades.filter(t => 
    t.notes && 
    (t.notes.toLowerCase().includes('wait') || t.notes.toLowerCase().includes('patient') || t.notes.toLowerCase().includes('patience'))
  ).length;
  
  if (patienceMentions > 0) {
    mechanisms.push('Emphasis on patience');
  }
  
  // Check for breaks/taking time off
  const breakPatterns = analyzeBreakPatterns(trades);
  if (breakPatterns.hasHealthyBreaks) {
    mechanisms.push('Takes breaks after difficult periods');
  }
  
  return mechanisms.length > 0 ? mechanisms : ['Limited coping mechanisms identified in trade notes'];
}

/**
 * Analyze break patterns in trading
 */
function analyzeBreakPatterns(trades: Trade[]): { hasHealthyBreaks: boolean; avgBreakAfterLosses: number } {
  let hasHealthyBreaks = false;
  let totalBreakTime = 0;
  let breakCount = 0;
  
  for (let i = 0; i < trades.length - 1; i++) {
    if (trades[i].result === 'loss') {
      const currentDate = new Date(trades[i].date);
      const nextDate = new Date(trades[i + 1].date);
      const daysDiff = (nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysDiff >= 2) { // Consider 2+ days as a meaningful break
        totalBreakTime += daysDiff;
        breakCount++;
        
        if (daysDiff >= 3) {
          hasHealthyBreaks = true;
        }
      }
    }
  }
  
  return {
    hasHealthyBreaks,
    avgBreakAfterLosses: breakCount > 0 ? totalBreakTime / breakCount : 0,
  };
}

/**
 * Identify areas for psychological improvement
 */
function identifyImprovementAreas(
  emotionalAnalysis: { emotions: Map<string, number>; totalNotes: number; notesWithEmotions: number },
  behavioralAnalysis: { consistencyScore: number; reactionToLosses: string; reactionToWins: string; tradingFrequency: string }
): string[] {
  const areas: string[] = [];
  
  // Check for negative emotion dominance
  const fearCount = emotionalAnalysis.emotions.get('fear') || 0;
  const frustrationCount = emotionalAnalysis.emotions.get('frustration') || 0;
  const totalNegative = fearCount + frustrationCount;
  
  if (totalNegative > 3) {
    areas.push('Managing negative emotions during trading');
  }
  
  // Check for poor loss reaction
  if (behavioralAnalysis.reactionToLosses === 'dangerous' || behavioralAnalysis.reactionToLosses === 'concerning') {
    areas.push('Developing healthier responses to losses');
  }
  
  // Check for overconfidence
  if (behavioralAnalysis.reactionToWins === 'overconfident') {
    areas.push('Maintaining humility after winning trades');
  }
  
  // Check for inconsistency
  if (behavioralAnalysis.consistencyScore < 0.5) {
    areas.push('Building more consistent trading habits');
  }
  
  // Check for erratic trading
  if (behavioralAnalysis.tradingFrequency === 'erratic' || behavioralAnalysis.tradingFrequency === 'sporadic') {
    areas.push('Establishing regular trading routine');
  }
  
  // Check for lack of discipline mentions
  const disciplineCount = emotionalAnalysis.emotions.get('discipline') || 0;
  if (disciplineCount === 0 && emotionalAnalysis.totalNotes > 0) {
    areas.push('Strengthening focus on trading discipline');
  }
  
  return areas.length > 0 ? areas : ['Continue current psychological approach'];
}

/**
 * Generate psychological insights for AI analysis
 */
export function generatePsychologicalInsights(trades: Trade[]): string[] {
  const insights: string[] = [];
  const profile = analyzeTradingPsychology(trades);
  
  if (!profile) return ['Insufficient data for psychological analysis'];
  
  // Generate insights based on profile
  if (profile.emotionalStability < 5) {
    insights.push(`Your emotional stability score is ${profile.emotionalStability}/10, suggesting emotions may be impacting your trading decisions. Consider implementing mindfulness techniques or taking breaks when feeling stressed.`);
  } else if (profile.emotionalStability >= 8) {
    insights.push(`Excellent emotional stability (${profile.emotionalStability}/10). You maintain composure well during both winning and losing periods.`);
  }
  
  if (profile.disciplineScore < 5) {
    insights.push(`Your discipline score is ${profile.disciplineScore}/10. Focus on following your trading plan consistently and avoiding impulsive decisions.`);
  } else if (profile.disciplineScore >= 7) {
    insights.push(`Strong discipline (${profile.disciplineScore}/10). You generally stick to your rules and trading plan.`);
  }
  
  if (profile.riskTolerance === 'aggressive') {
    insights.push('Your trading patterns suggest an aggressive risk tolerance. Ensure your position sizing aligns with your overall risk management rules.');
  } else if (profile.riskTolerance === 'conservative') {
    insights.push('You show conservative risk tendencies. While this protects capital, ensure you\'re not missing quality opportunities due to excessive caution.');
  }
  
  if (profile.commonEmotions.includes('Fear')) {
    insights.push('Fear appears frequently in your trade notes. This may cause you to exit winning trades too early or hesitate on valid setups.');
  }
  
  if (profile.triggers.includes('Consecutive losses leading to emotional decisions')) {
    insights.push('Consecutive losses appear to trigger emotional decision-making. Implement a rule to take a break after 2-3 consecutive losses.');
  }
  
  if (profile.improvementAreas.length > 0 && profile.improvementAreas[0] !== 'Continue current psychological approach') {
    insights.push(`Key areas for psychological improvement: ${profile.improvementAreas.slice(0, 2).join(', ')}.`);
  }
  
  return insights.length > 0 ? insights : ['Your psychological approach to trading appears well-balanced. Continue your current practices.'];
}