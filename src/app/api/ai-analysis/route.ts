import { NextRequest, NextResponse } from 'next/server';
import { getTrades } from '@/lib/server/trades';
import {
  generateAnalysisContext,
  prepareTradesForAI,
  type AIAnalysisResponse,
  type TradeMetrics,
  type TradePattern,
  type BehavioralPattern,
} from '@/lib/ai-analysis';
import { detectBehavioralPatterns, generateStatisticalPatterns } from '@/lib/ai-analysis/patterns';
import { analyzeTradingPsychology, generatePsychologicalInsights } from '@/lib/ai-analysis/psychology';

// Cache configuration (in-memory for now, could be Redis in production)
const analysisCache = new Map<
  string,
  { analysis: AIAnalysisResponse; metrics: TradeMetrics; timestamp: number }
>();

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Stage 1: Data Enrichment - Calculate all metrics and patterns
 */
function enrichTradeData(trades: any[], context: ReturnType<typeof generateAnalysisContext>) {
  const behavioralPatterns = detectBehavioralPatterns(trades);
  const statisticalPatterns = generateStatisticalPatterns(trades);
  const psychologyProfile = analyzeTradingPsychology(trades);
  const psychologicalInsights = generatePsychologicalInsights(trades);
  
  return {
    ...context,
    behavioralPatterns,
    statisticalPatterns,
    psychologyProfile,
    psychologicalInsights,
  };
}

/**
 * Stage 2: Generate AI Analysis using OpenAI
 */
async function generateAIAnalysis(
  trades: any[],
  enrichedContext: ReturnType<typeof enrichTradeData>
): Promise<AIAnalysisResponse> {
  const { metrics, byStrategy, bySymbol, byDirection, monthly, timeBased, 
          behavioralPatterns, statisticalPatterns, psychologyProfile } = enrichedContext;

  // Check if OpenAI API key is configured
  const openaiApiKey = process.env.OPENAI_API_KEY_JOURNII;
  
  if (!openaiApiKey) {
    return generateEnhancedSimulatedAnalysis(trades, enrichedContext);
  }

  // Build a comprehensive, multi-layered prompt
  const prompt = buildEnhancedPrompt(trades, enrichedContext);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo-preview', // Use more capable model
        messages: [
          {
            role: 'system',
            content: `You are a senior trading psychologist and performance analyst with 15+ years of experience working with professional traders. Your expertise includes:
- Statistical analysis of trading performance
- Behavioral finance and trading psychology
- Risk management and position sizing
- Pattern recognition in trading data
- Performance optimization strategies

Your analysis style is:
- Data-driven and evidence-based
- Specific and actionable, never generic
- Focused on root causes, not just symptoms
- Balanced between constructive criticism and positive reinforcement
- Tailored to the individual trader's patterns and psychology

You provide insights that help traders understand not just WHAT is happening in their trading, but WHY it's happening and HOW to improve it.`
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3, // Lower temperature for more focused analysis
        max_tokens: 3000,
        response_format: { type: 'json_mode' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    return JSON.parse(content) as AIAnalysisResponse;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    return generateEnhancedSimulatedAnalysis(trades, enrichedContext);
  }
}

/**
 * Build a comprehensive, multi-stage prompt for deeper analysis
 */
function buildEnhancedPrompt(trades: any[], context: any): string {
  const { metrics, byStrategy, bySymbol, byDirection, monthly, timeBased,
          behavioralPatterns, statisticalPatterns, psychologyProfile } = context;

  return `You are analyzing a trader's complete trading history. Provide a comprehensive, data-driven analysis.

## TRADER PROFILE & CONTEXT
- Analysis Date: ${new Date().toISOString().split('T')[0]}
- Total Trades Analyzed: ${metrics.totalTrades}
- Date Range: ${context.dateRange.earliest} to ${context.dateRange.latest}
- Trading Frequency: ${metrics.tradeFrequency.toFixed(1)} trades per week

## CORE PERFORMANCE METRICS
- Win Rate: ${metrics.winRate.toFixed(1)}% (${metrics.winningTrades}W / ${metrics.losingTrades}L)
- Total P&L: $${metrics.totalPnl.toFixed(2)}
- Average Win: $${metrics.averageWin.toFixed(2)} | Average Loss: $${metrics.averageLoss.toFixed(2)}
- Profit Factor: ${metrics.profitFactor.toFixed(2)}
- Win/Loss Ratio: ${metrics.averageWinLossRatio.toFixed(2)}
- Expectancy: $${metrics.expectancy.toFixed(2)} per trade
- Average R-Multiple: ${metrics.avgRMultiple.toFixed(2)}R
- Best Trade: $${metrics.bestTrade.toFixed(2)} | Worst Trade: $${metrics.worstTrade.toFixed(2)}
- Current Streak: ${metrics.currentStreak.count} ${metrics.currentStreak.type}s
- Max Consecutive Wins: ${metrics.consecutiveWins} | Max Consecutive Losses: ${metrics.consecutiveLosses}

## ADVANCED METRICS
- Sharpe Ratio: ${metrics.sharpeRatio.toFixed(2)}
- P&L Standard Deviation: $${metrics.pnlStandardDeviation.toFixed(2)}
- Max Drawdown: $${metrics.maxDrawdown.toFixed(2)} over ${metrics.maxDrawdownDuration} trades
- Win Rate Consistency: ${metrics.winRateConsistency.toFixed(0)}/100
- Estimated Holding Period: ${metrics.averageHoldingPeriod} days

## PERFORMANCE BREAKDOWN

### By Strategy
${byStrategy.map((s: { strategy: string; tradeCount: number; winRate: number; totalPnl: number; avgRMultiple: number; consistency: number }) => `- ${s.strategy}: ${s.tradeCount} trades, ${s.winRate.toFixed(1)}% WR, $${s.totalPnl.toFixed(2)} P&L, ${s.avgRMultiple.toFixed(2)}R avg, ${Math.round(s.consistency * 100)}% consistency`).join('\n')}

### By Direction
${byDirection.map((d: { direction: string; tradeCount: number; winRate: number; totalPnl: number; avgRMultiple: number }) => `- ${d.direction}: ${d.tradeCount} trades, ${d.winRate.toFixed(1)}% WR, $${d.totalPnl.toFixed(2)} P&L, ${d.avgRMultiple.toFixed(2)}R avg`).join('\n')}

### By Symbol (Top 5)
${bySymbol.slice(0, 5).map((s: { symbol: string; tradeCount: number; winRate: number; totalPnl: number; avgRMultiple: number }) => `- ${s.symbol}: ${s.tradeCount} trades, ${s.winRate.toFixed(1)}% WR, $${s.totalPnl.toFixed(2)} P&L, ${s.avgRMultiple.toFixed(2)}R avg`).join('\n')}

### Monthly Performance
${monthly.slice(-6).map((m: { month: string; tradeCount: number; winRate: number; totalPnl: number; avgRMultiple: number }) => `- ${m.month}: ${m.tradeCount} trades, ${m.winRate.toFixed(1)}% WR, $${m.totalPnl.toFixed(2)} P&L, ${m.avgRMultiple.toFixed(2)}R avg`).join('\n')}

### Time-Based Patterns
**By Day of Week:**
${timeBased.byDayOfWeek.map((d: { day: string; tradeCount: number; winRate: number; totalPnl: number }) => `- ${d.day}: ${d.tradeCount} trades, ${d.winRate.toFixed(1)}% WR, $${d.totalPnl.toFixed(2)} P&L`).join('\n')}

## DETECTED BEHAVIORAL PATTERNS
${behavioralPatterns.length > 0 ? behavioralPatterns.map((bp: { severity: string; type: string; description: string; confidence: number; evidence: string[] }) => `- [${bp.severity.toUpperCase()}] ${bp.type.replace(/_/g, ' ').toUpperCase()}: ${bp.description} (Confidence: ${Math.round(bp.confidence * 100)}%)
  Evidence: ${bp.evidence.slice(0, 2).join('; ')}`).join('\n\n') : '- No significant behavioral patterns detected'}

## STATISTICAL PATTERNS
${statisticalPatterns.length > 0 ? statisticalPatterns.map((sp: { impact: string; pattern: string; description: string; confidence: number }) => `- [${sp.impact.toUpperCase()}] ${sp.pattern}: ${sp.description} (Confidence: ${Math.round(sp.confidence * 100)}%)`).join('\n\n') : '- No significant statistical patterns detected'}

## PSYCHOLOGY PROFILE
${psychologyProfile ? `
- Emotional Stability: ${psychologyProfile.emotionalStability}/10
- Discipline Score: ${psychologyProfile.disciplineScore}/10
- Risk Tolerance: ${psychologyProfile.riskTolerance}
- Common Emotions: ${psychologyProfile.commonEmotions.join(', ')}
- Key Triggers: ${psychologyProfile.triggers.join(', ')}
- Coping Mechanisms: ${psychologyProfile.copingMechanisms.join(', ')}
- Improvement Areas: ${psychologyProfile.improvementAreas.join(', ')}` : '- Insufficient data for psychology profile'}

## RECENT TRADES SAMPLE
${trades.slice(0, 10).map(t => `- ${t.date}: ${t.symbol} (${t.direction}) - P&L: $${t.pnl.toFixed(2)}, Strategy: ${t.tags.join(', ')}, Notes: ${t.notes || 'None'}`).join('\n')}

---

## ANALYSIS REQUIREMENTS

Provide a comprehensive analysis in JSON format with the following structure:

{
  "summary": "A concise 2-3 sentence executive summary that captures the most important insights about this trader's performance, psychology, and key areas for improvement.",
  
  "strengths": [
    "Specific, evidence-based strengths with metrics. Example: 'Strong 65% win rate on momentum strategies with 2.1R average winner'",
    "Another specific strength...",
    "Focus on what the data shows, not generic praise"
  ],
  
  "weaknesses": [
    "Specific, data-backed weaknesses. Example: 'Win rate drops to 35% on Friday trades, suggesting end-of-week fatigue'",
    "Another specific weakness with evidence...",
    "Focus on patterns that can be improved"
  ],
  
  "patterns": [
    {
      "pattern": "Name of the pattern",
      "description": "Detailed description with specific data points",
      "impact": "positive|negative|neutral",
      "confidence": 0.0-1.0,
      "category": "statistical|behavioral|temporal|strategic",
      "actionable": true|false,
      "metrics": {
        "winRateImpact": number,
        "pnlImpact": number,
        "frequency": number
      }
    }
  ],
  
  "behavioralPatterns": [
    {
      "type": "revenge_trading|overtrading|hesitation|fomo|panic_selling|greed|consistency",
      "description": "Detailed description with evidence",
      "severity": "low|medium|high",
      "confidence": 0.0-1.0,
      "evidence": ["specific evidence 1", "specific evidence 2"],
      "impact": "positive|negative|neutral",
      "recommendations": ["specific recommendation 1", "specific recommendation 2"]
    }
  ],
  
  "psychologyProfile": {
    "emotionalStability": 1-10,
    "disciplineScore": 1-10,
    "riskTolerance": "conservative|moderate|aggressive",
    "commonEmotions": ["emotion1", "emotion2"],
    "triggers": ["trigger1", "trigger2"],
    "copingMechanisms": ["mechanism1", "mechanism2"],
    "improvementAreas": ["area1", "area2"]
  },
  
  "timeBasedInsights": {
    "bestDayOfWeek": "day name",
    "worstDayOfWeek": "day name",
    "bestTimeOfDay": "period",
    "tradingRhythm": "description of their optimal trading rhythm"
  },
  
  "riskAssessment": {
    "level": "low|medium|high",
    "description": "Comprehensive risk assessment based on drawdowns, position sizing consistency, and behavioral patterns",
    "recommendations": [
      "Specific risk management recommendations",
      "Position sizing suggestions",
      "Drawdown control measures"
    ],
    "quantitativeScore": 1-10,
    "maxDrawdownRisk": number,
    "positionSizingScore": 1-10
  },
  
  "actionPlan": [
    {
      "step": "Specific action item",
      "priority": "high|medium|low",
      "description": "Detailed explanation of why this is important and how to implement it",
      "expectedImpact": "Quantified expected improvement",
      "timeline": "When to implement and how long it should take",
      "successMetrics": ["metric1 to track", "metric2 to track"]
    }
  ],
  
  "trends": {
    "improving": true|false,
    "description": "Analysis of performance trajectory with specific metrics",
    "metrics": ["which metrics show the trend"],
    "momentum": "accelerating|stable|decelerating",
    "trajectory": "upward|sideways|downward"
  },
  
  "psychologicalInsights": [
    "Specific psychological insights based on the data",
    "Connections between emotions and trading performance",
    "Mental game recommendations"
  ],
  
  "strategyRecommendations": [
    {
      "strategy": "strategy name",
      "action": "focus|reduce|eliminate|modify",
      "reasoning": "Data-driven reasoning for this recommendation",
      "expectedImprovement": "Expected impact on overall performance"
    }
  ],
  
  "overallRating": 1-10,
  "analysisConfidence": 1-10
}`;
}

/**
 * Stage 3: Enhanced fallback analysis when AI is unavailable
 */
function generateEnhancedSimulatedAnalysis(
  trades: any[],
  enrichedContext: ReturnType<typeof enrichTradeData>
): AIAnalysisResponse {
  const { metrics, byStrategy, bySymbol, byDirection, monthly, timeBased,
          behavioralPatterns, statisticalPatterns, psychologyProfile } = enrichedContext;

  // Generate strengths based on data
  const strengths: string[] = [];
  
  if (metrics.winRate >= 60) {
    strengths.push(`Strong win rate of ${metrics.winRate.toFixed(1)}% - significantly above the 50% breakeven threshold`);
  }
  if (metrics.profitFactor >= 1.5) {
    strengths.push(`Excellent profit factor of ${metrics.profitFactor.toFixed(2)} - indicating strong risk management and profitable trading`);
  }
  if (metrics.avgRMultiple >= 1.5) {
    strengths.push(`Average R-multiple of ${metrics.avgRMultiple.toFixed(2)}R - winners are significantly larger than losers`);
  }
  if (metrics.totalPnl > 0) {
    strengths.push(`Overall profitable with total P&L of $${metrics.totalPnl.toFixed(2)} across ${metrics.totalTrades} trades`);
  }
  if (metrics.winRateConsistency >= 70) {
    strengths.push(`High win rate consistency (${metrics.winRateConsistency.toFixed(0)}%) - performance is stable across time periods`);
  }
  
  // Add strategy-specific strengths
  byStrategy.forEach(s => {
    if (s.tradeCount >= 3 && s.winRate >= 65) {
      strengths.push(`${s.strategy} strategy showing ${s.winRate.toFixed(1)}% win rate across ${s.tradeCount} trades`);
    }
  });

  // Generate weaknesses based on data
  const weaknesses: string[] = [];
  
  if (metrics.winRate < 50) {
    weaknesses.push(`Win rate of ${metrics.winRate.toFixed(1)}% is below 50% - focus on improving entry timing and setup selection`);
  }
  if (metrics.profitFactor < 1.2 && metrics.profitFactor > 0) {
    weaknesses.push(`Low profit factor of ${metrics.profitFactor.toFixed(2)} - review risk management and position sizing`);
  }
  if (metrics.consecutiveLosses >= 5) {
    weaknesses.push(`Maximum consecutive losses of ${metrics.consecutiveLosses} suggests potential emotional trading during drawdowns`);
  }
  if (metrics.maxDrawdown > Math.abs(metrics.totalPnl) * 0.5 && metrics.totalPnl > 0) {
    weaknesses.push(`Significant drawdown of $${metrics.maxDrawdown.toFixed(2)} - consider implementing stricter risk controls`);
  }
  
  // Add time-based weaknesses
  timeBased.byDayOfWeek.forEach(d => {
    if (d.tradeCount >= 3 && d.winRate < 40) {
      weaknesses.push(`Poor performance on ${d.day}s (${d.winRate.toFixed(1)}% win rate) - consider avoiding trades on this day`);
    }
  });

  // Generate action plan
  const actionPlan: Array<{ step: string; priority: 'high' | 'medium' | 'low'; description: string; expectedImpact: string; timeline: string; successMetrics: string[] }> = [];
  
  if (metrics.winRate < 55) {
    actionPlan.push({
      step: 'Improve Entry Strategy',
      priority: 'high',
      description: `Your current win rate of ${metrics.winRate.toFixed(1)}% suggests entries need refinement. Focus on higher-probability setups and add more confirmation signals before entering trades.`,
      expectedImpact: 'Potential 10-15% improvement in win rate',
      timeline: 'Implement over next 2-4 weeks',
      successMetrics: ['Win rate above 55%', 'Reduced losing trades']
    });
  }

  if (metrics.averageWinLossRatio < 1.5) {
    actionPlan.push({
      step: 'Optimize Risk/Reward Ratio',
      priority: 'high',
      description: `Current win/loss ratio is ${metrics.averageWinLossRatio.toFixed(2)}. Aim for at least 1.5:1 by setting clearer profit targets and tighter stop losses.`,
      expectedImpact: 'Improved expectancy and profitability',
      timeline: 'Implement immediately',
      successMetrics: ['Win/loss ratio above 1.5', 'Higher average R-multiple']
    });
  }

  if (behavioralPatterns.some(bp => bp.type === 'revenge_trading')) {
    actionPlan.push({
      step: 'Implement Cooling-Off Period',
      priority: 'high',
      description: 'After any losing trade, wait at least 2-4 hours before entering a new position. This prevents revenge trading and emotional decision-making.',
      expectedImpact: 'Reduced consecutive losses and improved decision quality',
      timeline: 'Start immediately, maintain for 30 days',
      successMetrics: ['Fewer consecutive losses', 'Better performance after losses']
    });
  }

  actionPlan.push({
    step: 'Maintain Detailed Trade Journal',
    priority: 'medium',
    description: 'Continue documenting trade rationale, emotions, and market conditions. Include pre-trade checklist and post-trade review for every position.',
    expectedImpact: 'Better pattern recognition and self-awareness',
    timeline: 'Ongoing daily practice',
    successMetrics: ['Consistent journaling', 'Improved pattern identification']
  });

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'medium';
  let riskDescription = 'Moderate risk profile detected.';
  let riskScore = 5;
  
  if (metrics.profitFactor > 2 && metrics.winRate > 60 && metrics.maxDrawdown < Math.abs(metrics.totalPnl) * 0.3) {
    riskLevel = 'low';
    riskDescription = 'Strong risk management practices observed with controlled drawdowns and consistent profitability.';
    riskScore = 8;
  } else if (metrics.profitFactor < 1 || metrics.winRate < 40 || metrics.maxDrawdown > Math.abs(metrics.totalPnl)) {
    riskLevel = 'high';
    riskDescription = 'Risk management needs immediate attention. Current patterns suggest potential for significant drawdowns.';
    riskScore = 3;
  }

  // Determine trends
  const recentMonthly = monthly.slice(-3);
  const improving = recentMonthly.length >= 2 && 
    recentMonthly[recentMonthly.length - 1].totalPnl > recentMonthly[0].totalPnl;
  
  const momentum = improving ? 
    (recentMonthly.length >= 3 && recentMonthly.every((m, i) => i === 0 || m.totalPnl > recentMonthly[i-1].totalPnl) ? 'accelerating' : 'stable') : 
    'decelerating';

  // Calculate overall rating
  let rating = 5; // Base rating
  if (metrics.winRate > 60) rating += 1;
  if (metrics.profitFactor > 1.5) rating += 1;
  if (metrics.totalPnl > 0) rating += 1;
  if (metrics.avgRMultiple > 1.5) rating += 1;
  if (improving) rating += 1;
  if (metrics.winRateConsistency > 70) rating += 0.5;
  rating = Math.min(10, Math.max(1, Math.round(rating)));

  // Generate patterns from data
  const patterns: TradePattern[] = [];
  
  // Add statistical patterns
  statisticalPatterns.slice(0, 3).forEach(sp => {
    patterns.push(sp);
  });

  // Add behavioral patterns
  behavioralPatterns.slice(0, 2).forEach(bp => {
    patterns.push({
      pattern: bp.type.replace(/_/g, ' ').charAt(0).toUpperCase() + bp.type.replace(/_/g, ' ').slice(1),
      description: bp.description,
      impact: bp.impact,
      confidence: bp.confidence,
      category: 'behavioral',
      actionable: true,
      metrics: {
        frequency: 1,
      }
    });
  });

  // Time-based insights
  const bestDay = timeBased.byDayOfWeek.reduce((a, b) => a.winRate > b.winRate ? a : b, timeBased.byDayOfWeek[0]);
  const worstDay = timeBased.byDayOfWeek.reduce((a, b) => a.winRate < b.winRate ? a : b, timeBased.byDayOfWeek[0]);

  // Strategy recommendations
  const strategyRecommendations = byStrategy.map(s => ({
    strategy: s.strategy,
    action: s.winRate > 60 ? 'focus' as const : s.winRate < 40 ? 'reduce' as const : 'modify' as const,
    reasoning: `${s.strategy} shows ${s.winRate.toFixed(1)}% win rate with ${s.tradeCount} trades`,
    expectedImprovement: s.winRate > 60 ? 0.1 : s.winRate < 40 ? -0.05 : 0.05
  }));

  return {
    summary: `Analysis of ${metrics.totalTrades} trades shows a ${metrics.winRate.toFixed(1)}% win rate with total P&L of $${metrics.totalPnl.toFixed(2)}. ${metrics.totalPnl > 0 ? 'Overall performance is profitable.' : 'Focus needed on improving profitability.'} ${improving ? 'Recent trends show improvement.' : 'Performance has been inconsistent.'} ${behavioralPatterns.length > 0 ? `Key behavioral patterns detected: ${behavioralPatterns.map(bp => bp.type.replace(/_/g, ' ')).join(', ')}.` : ''}`,
    strengths: strengths.length > 0 ? strengths : ['Consistent trade logging and journaling'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['No major weaknesses identified, but there is always room for improvement'],
    patterns,
    behavioralPatterns,
    psychologyProfile: psychologyProfile || undefined,
    timeBasedInsights: {
      bestDayOfWeek: bestDay?.day || 'N/A',
      worstDayOfWeek: worstDay?.day || 'N/A',
      bestTimeOfDay: 'Insufficient time data',
      tradingRhythm: `Based on ${metrics.tradeFrequency.toFixed(1)} trades per week, you maintain ${metrics.tradeFrequency > 10 ? 'high' : 'moderate'} trading activity.`,
    },
    riskAssessment: {
      level: riskLevel,
      description: riskDescription,
      recommendations: [
        'Always use stop losses on every trade',
        'Risk no more than 1-2% of capital per trade',
        'Review losing trades to identify patterns',
        'Implement a maximum daily loss limit',
      ],
      quantitativeScore: riskScore,
      maxDrawdownRisk: metrics.maxDrawdown,
      positionSizingScore: Math.min(10, Math.max(1, Math.round(riskScore * 1.2))),
    },
    actionPlan,
    trends: {
      improving,
      description: improving 
        ? 'Recent performance shows positive momentum with improving monthly results' 
        : 'Performance has been volatile - focus on consistency and process improvement',
      metrics: ['winRate', 'profitFactor', 'monthlyPnl'],
      momentum: momentum as 'accelerating' | 'stable' | 'decelerating',
      trajectory: improving ? 'upward' as const : 'sideways' as const,
    },
    psychologicalInsights: psychologyProfile ? generatePsychologicalInsights(trades) : ['Continue maintaining emotional awareness during trading'],
    strategyRecommendations,
    overallRating: rating,
    analysisConfidence: Math.min(8, Math.max(3, Math.round(metrics.totalTrades / 10))),
  };
}

export async function POST(request: NextRequest) {
  try {
    const { userId, currencies } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check cache first (use a cache key that includes currencies for proper caching)
    const cacheKey = currencies && currencies.length > 0 ? `${userId}-${currencies.sort().join(',')}` : userId;
    const cached = analysisCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      return NextResponse.json({
        analysis: cached.analysis,
        metrics: cached.metrics,
        cached: true,
      });
    }

    // Fetch user's trades using server-side service
    const trades = await getTrades(userId);

    // Apply currency filter if provided
    let filteredTrades = trades;
    if (currencies && currencies.length > 0) {
      filteredTrades = trades.filter(trade => currencies.includes(trade.symbol));
    }

    if (filteredTrades.length === 0) {
      return NextResponse.json(
        { error: 'No trades found for the selected currencies. Try selecting different currencies or "All Currencies".' },
        { status: 404 }
      );
    }

    // Stage 1: Data Enrichment
    const context = generateAnalysisContext(filteredTrades);
    const preparedTrades = prepareTradesForAI(filteredTrades);
    const enrichedContext = enrichTradeData(preparedTrades, context);

    // Stage 2: Generate AI Analysis (or fallback to Stage 3)
    const analysis = await generateAIAnalysis(preparedTrades, enrichedContext);

    // Cache the result
    analysisCache.set(cacheKey, {
      analysis,
      metrics: enrichedContext.metrics,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      analysis,
      metrics: enrichedContext.metrics,
      cached: false,
    });
  } catch (error) {
    console.error('Error in AI analysis API:', error);
    return NextResponse.json(
      { error: 'Failed to generate analysis' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'AI Analysis API - Send POST request with userId to generate analysis',
    endpoints: {
      analyze: 'POST /api/ai-analysis',
    },
  });
}