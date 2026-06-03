'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Brain,
  RefreshCw,
  Star,
  CheckCircle,
  Clock,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import type { AIAnalysisResponse, TradeMetrics } from '@/lib/ai-analysis';

interface AIInsightsDashboardProps {
  analysis: AIAnalysisResponse | null;
  metrics: TradeMetrics | null;
  isLoading: boolean;
  onRefresh: () => void;
  lastUpdated?: string;
}

export function AIInsightsDashboard({
  analysis,
  metrics,
  isLoading,
  onRefresh,
  lastUpdated,
}: AIInsightsDashboardProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Analyzing your trades...</p>
          <p className="text-sm text-muted-foreground mt-2">
            This may take a moment as we process all your trading data
          </p>
        </div>
      </div>
    );
  }

  if (!analysis || !metrics) {
    return null;
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'high':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-red-500 border-red-500';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500';
      case 'low':
        return 'bg-green-500/10 text-green-500 border-green-500';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive':
        return <ArrowUpRight className="h-4 w-4 text-green-500" />;
      case 'negative':
        return <ArrowDownRight className="h-4 w-4 text-red-500" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Trading Analysis</h2>
          <p className="text-muted-foreground">
            Expert insights and recommendations based on your trading history
          </p>
        </div>
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Updated {lastUpdated}</span>
            </div>
          )}
          <Button onClick={onRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Analysis
          </Button>
        </div>
      </div>

      {/* Overall Rating */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Overall Trading Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-5xl font-bold">{analysis.overallRating}/10</div>
              <p className="text-muted-foreground mt-2">{analysis.summary}</p>
            </div>
            <div className="flex gap-1">
              {[...Array(10)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-6 w-6 ${
                    i < analysis.overallRating
                      ? 'text-yellow-500 fill-yellow-500'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.winRate.toFixed(1)}%</div>
            <div className="mt-2">
              <Progress value={metrics.winRate} className="h-2" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.winningTrades} wins / {metrics.losingTrades} losses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit Factor</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.profitFactor.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              ${metrics.averageWin.toFixed(2)} avg win / ${metrics.averageLoss.toFixed(2)} avg loss
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${metrics.totalPnl.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalTrades} total trades
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.currentStreak.count} {metrics.currentStreak.type === 'win' ? 'W' : 'L'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Best: {metrics.consecutiveWins}W | Worst: {metrics.consecutiveLosses}L
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Strengths and Weaknesses */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Strengths
            </CardTitle>
            <CardDescription>What you're doing well</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.strengths.map((strength, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span className="text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Weaknesses
            </CardTitle>
            <CardDescription>Areas for improvement</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.weaknesses.map((weakness, index) => (
                <li key={index} className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <span className="text-sm">{weakness}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Patterns */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Detected Patterns
          </CardTitle>
          <CardDescription>Recurring themes in your trading</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.patterns.map((pattern, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
                <div className="shrink-0">{getImpactIcon(pattern.impact)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{pattern.pattern}</h4>
                    <Badge variant="outline" className="text-xs">
                      {Math.round(pattern.confidence * 100)}% confidence
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{pattern.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Assessment
          </CardTitle>
          <CardDescription>Evaluation of your risk management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-start gap-4">
            <div className={`shrink-0 w-3 h-3 rounded-full ${getRiskColor(analysis.riskAssessment.level)} mt-2`} />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-semibold capitalize">{analysis.riskAssessment.level} Risk</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{analysis.riskAssessment.description}</p>
              <div className="space-y-2">
                {analysis.riskAssessment.recommendations.map((rec, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Plan */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Action Plan
          </CardTitle>
          <CardDescription>Specific steps to improve your trading</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analysis.actionPlan.map((action, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getPriorityColor(action.priority)}`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full border currentColor">
                    <span className="text-xs font-bold">{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{action.step}</h4>
                      <Badge variant="outline" className={`text-xs ${getPriorityColor(action.priority)}`}>
                        {action.priority} priority
                      </Badge>
                    </div>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {analysis.trends.improving ? (
              <TrendingUp className="h-5 w-5 text-green-500" />
            ) : (
              <TrendingDown className="h-5 w-5 text-red-500" />
            )}
            Performance Trends
          </CardTitle>
          <CardDescription>Direction of your trading performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className={`shrink-0 px-4 py-2 rounded-full ${
              analysis.trends.improving ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
            }`}>
              {analysis.trends.improving ? (
                <TrendingUp className="h-6 w-6" />
              ) : (
                <TrendingDown className="h-6 w-6" />
              )}
            </div>
            <div>
              <p className="font-semibold">
                {analysis.trends.improving ? 'Improving' : 'Needs Attention'}
              </p>
              <p className="text-sm text-muted-foreground">{analysis.trends.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Psychological Insights */}
      {analysis.psychologicalInsights && analysis.psychologicalInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Psychological Insights
            </CardTitle>
            <CardDescription>Mental and emotional aspects of your trading</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysis.psychologicalInsights.map((insight, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Brain className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-sm">{insight}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}