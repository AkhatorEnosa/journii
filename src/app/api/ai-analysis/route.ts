import { NextRequest, NextResponse } from 'next/server';
import { getTrades } from '@/lib/server/trades';
import {
  generateAnalysisContext,
  prepareTradesForAI,
  type AIAnalysisResponse,
  type TradeMetrics,
} from '@/lib/ai-analysis';

// Cache configuration (in-memory for now, could be Redis in production)
const analysisCache = new Map<
  string,
  { analysis: AIAnalysisResponse; metrics: TradeMetrics; timestamp: number }
>();

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

// Generate AI analysis using OpenAI API
async function generateAIAnalysis(
  trades: any[],
  context: ReturnType<typeof generateAnalysisContext>
): Promise<AIAnalysisResponse> {
  const { metrics, byStrategy, bySymbol, byDirection, monthly } = context;

  // Check if OpenAI API key is configured
  const openaiApiKey = process.env.OPENAI_API_KEY;
  
  if (!openaiApiKey) {
    // Return a simulated analysis if no API key is configured
    return generateSimulatedAnalysis(trades, context);
  }

  // Prepare the prompt for OpenAI
  const prompt = `You are an expert trading analyst. Analyze the following trading data and provide detailed insights.

## Trading Metrics Summary
- Total Trades: ${metrics.totalTrades}
- Win Rate: ${metrics.winRate.toFixed(1)}%
- Total P&L: $${metrics.totalPnl.toFixed(2)}
- Average Win: $${metrics.averageWin.toFixed(2)}
- Average Loss: $${metrics.averageLoss.toFixed(2)}
- Profit Factor: ${metrics.profitFactor.toFixed(2)}
- Win/Loss Ratio: ${metrics.averageWinLossRatio.toFixed(2)}
- Best Trade: $${metrics.bestTrade.toFixed(2)}
- Worst Trade: $${metrics.worstTrade.toFixed(2)}
- Current Streak: ${metrics.currentStreak.count} ${metrics.currentStreak.type}s

## Performance by Strategy
${byStrategy.map(s => `- ${s.strategy}: ${s.tradeCount} trades, ${s.winRate.toFixed(1)}% win rate, $${s.totalPnl.toFixed(2)} total P&L`).join('\n')}

## Performance by Symbol
${bySymbol.slice(0, 5).map(s => `- ${s.symbol}: ${s.tradeCount} trades, ${s.winRate.toFixed(1)}% win rate, $${s.totalPnl.toFixed(2)} total P&L`).join('\n')}

## Performance by Direction
${byDirection.map(d => `- ${d.direction}: ${d.tradeCount} trades, ${d.winRate.toFixed(1)}% win rate, $${d.totalPnl.toFixed(2)} total P&L`).join('\n')}

## Monthly Performance
${monthly.slice(-6).map(m => `- ${m.month}: ${m.tradeCount} trades, ${m.winRate.toFixed(1)}% win rate, $${m.totalPnl.toFixed(2)} total P&L`).join('\n')}

## Recent Trades (sample)
${trades.slice(0, 10).map(t => `- ${t.date}: ${t.symbol} (${t.direction}) - P&L: $${t.pnl.toFixed(2)}, Notes: ${t.notes || 'None'}`).join('\n')}

Please provide a comprehensive analysis including:
1. Executive summary of trading performance
2. Key strengths (what the trader is doing well)
3. Critical weaknesses (areas that need improvement)
4. Pattern analysis (recurring themes in wins and losses)
5. Risk assessment with specific recommendations
6. Action plan with 3-5 specific steps to improve
7. Performance trends (improving or declining)
8. Psychological insights based on trade notes
9. Overall rating from 1-10

Format the response as JSON with the following structure:
{
  "summary": "string",
  "strengths": ["string"],
  "weaknesses": ["string"],
  "patterns": [{"pattern": "string", "description": "string", "impact": "positive|negative|neutral", "confidence": number}],
  "riskAssessment": {"level": "low|medium|high", "description": "string", "recommendations": ["string"]},
  "actionPlan": [{"step": "string", "priority": "high|medium|low", "description": "string"}],
  "trends": {"improving": boolean, "description": "string", "metrics": ["string"]},
  "psychologicalInsights": ["string"],
  "overallRating": number
}`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiApiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert trading analyst and coach. You provide detailed, actionable insights to help traders improve their performance. You analyze trading data objectively and provide constructive feedback.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
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
    // Fall back to simulated analysis
    return generateSimulatedAnalysis(trades, context);
  }
}

/**
 * Generate a simulated analysis when AI is not available
 * This provides basic insights based on the metrics
 */
function generateSimulatedAnalysis(
  trades: any[],
  context: ReturnType<typeof generateAnalysisContext>
): AIAnalysisResponse {
  const { metrics, byStrategy, byDirection, monthly } = context;

  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const actionPlan: Array<{ step: string; priority: 'high' | 'medium' | 'low'; description: string }> = [];

  // Analyze strengths
  if (metrics.winRate >= 60) {
    strengths.push(`Strong win rate of ${metrics.winRate.toFixed(1)}% - above the average threshold for profitable trading`);
  }
  if (metrics.profitFactor >= 1.5) {
    strengths.push(`Excellent profit factor of ${metrics.profitFactor.toFixed(2)} - indicating strong risk management`);
  }
  if (metrics.averageWinLossRatio >= 1.5) {
    strengths.push(`Good average win/loss ratio of ${metrics.averageWinLossRatio.toFixed(2)} - winners are significantly larger than losers`);
  }
  if (metrics.totalPnl > 0) {
    strengths.push(`Overall profitable with total P&L of $${metrics.totalPnl.toFixed(2)}`);
  }

  // Analyze weaknesses
  if (metrics.winRate < 50) {
    weaknesses.push(`Win rate of ${metrics.winRate.toFixed(1)}% is below 50% - focus on improving entry timing`);
  }
  if (metrics.profitFactor < 1.2 && metrics.profitFactor > 0) {
    weaknesses.push(`Profit factor of ${metrics.profitFactor.toFixed(2)} is low - review risk management and position sizing`);
  }
  if (metrics.consecutiveLosses >= 5) {
    weaknesses.push(`Maximum consecutive losses of ${metrics.consecutiveLosses} suggests potential emotional trading during drawdowns`);
  }

  // Generate action plan
  if (metrics.winRate < 55) {
    actionPlan.push({
      step: 'Improve Entry Strategy',
      priority: 'high',
      description: `Focus on refining entry criteria. Your current win rate of ${metrics.winRate.toFixed(1)}% suggests entries need improvement. Consider adding more confirmation signals before entering trades.`,
    });
  }

  if (metrics.averageWinLossRatio < 1.5) {
    actionPlan.push({
      step: 'Optimize Risk/Reward Ratio',
      priority: 'high',
      description: `Your current win/loss ratio is ${metrics.averageWinLossRatio.toFixed(2)}. Aim for at least 1.5:1 by setting clearer profit targets and tighter stop losses.`,
    });
  }

  actionPlan.push({
    step: 'Maintain Detailed Trade Journal',
    priority: 'medium',
    description: 'Continue documenting trade rationale, emotions, and market conditions. This data is invaluable for identifying patterns and improving decision-making.',
  });

  actionPlan.push({
    step: 'Review and Refine Strategy',
    priority: 'medium',
    description: `Analyze your best-performing ${byStrategy[0]?.strategy ? `strategy "${byStrategy[0].strategy}"` : 'strategies'} and identify common factors. Consider focusing more on what works.`,
  });

  // Determine risk level
  let riskLevel: 'low' | 'medium' | 'high' = 'medium';
  let riskDescription = 'Moderate risk profile detected.';
  
  if (metrics.profitFactor > 2 && metrics.winRate > 60) {
    riskLevel = 'low';
    riskDescription = 'Strong risk management practices observed.';
  } else if (metrics.profitFactor < 1 || metrics.winRate < 40) {
    riskLevel = 'high';
    riskDescription = 'Risk management needs immediate attention.';
  }

  // Determine trends
  const recentMonthly = monthly.slice(-3);
  const improving = recentMonthly.length >= 2 && 
    recentMonthly[recentMonthly.length - 1].totalPnl > recentMonthly[0].totalPnl;

  // Calculate overall rating
  let rating = 5; // Base rating
  if (metrics.winRate > 60) rating += 1;
  if (metrics.profitFactor > 1.5) rating += 1;
  if (metrics.totalPnl > 0) rating += 1;
  if (metrics.averageWinLossRatio > 1.5) rating += 1;
  if (improving) rating += 1;
  rating = Math.min(10, Math.max(1, rating));

  return {
    summary: `Analysis of ${metrics.totalTrades} trades shows a ${metrics.winRate.toFixed(1)}% win rate with total P&L of $${metrics.totalPnl.toFixed(2)}. ${metrics.totalPnl > 0 ? 'Overall performance is profitable.' : 'Focus needed on improving profitability.'} ${improving ? 'Recent trends show improvement.' : 'Performance has been inconsistent.'}`,
    strengths: strengths.length > 0 ? strengths : ['Consistent trade logging and journaling'],
    weaknesses: weaknesses.length > 0 ? weaknesses : ['No major weaknesses identified, but there is always room for improvement'],
    patterns: [
      {
        pattern: 'Strategy Performance Variation',
        description: byStrategy.length > 1 
          ? `Different strategies show varying success rates. Best performing: ${byStrategy[0]?.strategy || 'N/A'}` 
          : 'Limited strategy data for pattern analysis',
        impact: 'neutral',
        confidence: 0.7,
      },
    ],
    riskAssessment: {
      level: riskLevel,
      description: riskDescription,
      recommendations: [
        'Always use stop losses',
        'Risk no more than 1-2% per trade',
        'Review losing trades to identify patterns',
      ],
    },
    actionPlan,
    trends: {
      improving,
      description: improving 
        ? 'Recent performance shows positive momentum' 
        : 'Performance has been volatile - focus on consistency',
      metrics: ['winRate', 'profitFactor', 'monthlyPnl'],
    },
    psychologicalInsights: [
      'Continue maintaining emotional awareness during trading',
      trades.some(t => t.notes?.toLowerCase().includes('emotional') || t.notes?.toLowerCase().includes('frustrated'))
        ? 'Some trades indicate emotional decision-making - consider implementing a cooling-off period after losses'
        : 'Trade notes show good self-awareness and reflection',
    ],
    overallRating: rating,
  };
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cached = analysisCache.get(userId);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      return NextResponse.json({
        analysis: cached.analysis,
        metrics: cached.metrics,
        cached: true,
      });
    }

    // Fetch user's trades using server-side service
    const trades = await getTrades(userId);

    if (trades.length === 0) {
      return NextResponse.json(
        { error: 'No trades found for analysis. Start logging your trades first!' },
        { status: 404 }
      );
    }

    // Generate analysis context
    const context = generateAnalysisContext(trades);
    const preparedTrades = prepareTradesForAI(trades);

    // Generate AI analysis
    const analysis = await generateAIAnalysis(preparedTrades, context);

    // Cache the result
    analysisCache.set(userId, {
      analysis,
      metrics: context.metrics,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      analysis,
      metrics: context.metrics,
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