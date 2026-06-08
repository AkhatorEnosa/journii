'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import DashboardHeader from '@/app/sections/DashboardHeader';
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
  Sparkles,
  Activity,
  Award,
  Lightbulb,
  Shield,
} from 'lucide-react';
import { motion } from 'motion/react';
import { FadeInUp } from '@/components/animations/FadeInUp';
import type { AIAnalysisResponse, TradeMetrics } from '@/lib/ai-analysis';
import Footer from '@/app/sections/Footer';

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
  const router = useRouter();
  const { user, isLoaded } = useUser();

  // Redirect to home if not authenticated
  if (isLoaded && !user) {
    router.push('/');
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-between bg-linear-to-br from-background via-background to-muted/20">
        <DashboardHeader />
        <div className="container mx-auto py-16 px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
              <div className="relative w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <Brain className="h-10 w-10 text-primary animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2">Analyzing Your Trades</h2>
            <p className="text-muted-foreground text-center max-w-md">
              Our AI is processing your trading data to generate personalized insights and recommendations
            </p>
            <div className="mt-8 w-full max-w-md">
              <div className="h-1 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 3, ease: 'easeInOut' }}
                />
              </div>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!analysis || !metrics) {
    return null;
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-emerald-500 bg-green-500/10';
      case 'medium':
        return 'text-yellow-500 bg-yellow-500/10';
      case 'high':
        return 'text-rose-500 bg-red-500/10';
      default:
        return 'text-gray-500 bg-gray-500/10';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-500/10 text-rose-500 border-red-500/30';
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
      case 'low':
        return 'bg-green-500/10 text-emerald-500 border-green-500/30';
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/30';
    }
  };

  const getImpactIcon = (impact: string) => {
    switch (impact) {
      case 'positive':
        return <ArrowUpRight className="h-4 w-4 text-emerald-500" />;
      case 'negative':
        return <ArrowDownRight className="h-4 w-4 text-rose-500" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-background via-background to-muted/20">
      <DashboardHeader />
      <div className="container mx-auto py-8 px-4 space-y-8">
        {/* Hero Section with Overall Rating */}
        <FadeInUp>
          <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-primary/5 via-primary/10 to-primary/5 border border-primary/20 p-8 md:p-12">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10 dark:border-[#d4af37] dark:text-[#d4af37] dark:bg-[#d4af37]/10">
                      <Brain className="h-5 w-5 text-[#d4af37] dark:text-[#d4af37]" />
                    </div>
                    <Badge variant="outline" className="border-[#d4af37] text-[#d4af37] bg-[#d4af37]/10 dark:border-[#d4af37] dark:text-[#d4af37] dark:bg-[#d4af37]/10">
                      AI-Powered Analysis
                    </Badge>
                  </div>
                  
                  <div>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">
                      Trading Performance Score
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-xl">
                      {analysis.summary}
                    </p>
                  </div>

                  <div className="flex items-center gap-4 pt-2">
                    <Button onClick={onRefresh} variant="outline" size="sm" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Refresh Analysis
                    </Button>
                    {lastUpdated && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>Updated {lastUpdated}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl" />
                    <div className="relative flex gap-2 text-center p-6">
                      <div className="text-7xl md:text-8xl font-bold tracking-tighter">
                        {analysis.overallRating}
                      </div>
                      <div className="text-xl text-muted-foreground">/ 10</div>
                    </div>
                  </div>
                  
                  <div className="flex gap-1 mt-4">
                    {[...Array(10)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 transition-all ${
                          i < analysis.overallRating
                            ? 'text-yellow-500 fill-yellow-500 scale-110'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </FadeInUp>

        {/* Key Metrics Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FadeInUp delay={0.1}>
            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
                <div className="p-2 rounded-lg bg-green-500/10">
                  <Target className="h-4 w-4 text-emerald-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{metrics.winRate.toFixed(1)}%</div>
                <div className="mt-3">
                  <Progress value={metrics.winRate} className="h-2" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  <span className="text-emerald-500 font-medium">{metrics.winningTrades}</span> wins /{' '}
                  <span className="text-rose-500 font-medium">{metrics.losingTrades}</span> losses
                </p>
              </CardContent>
            </Card>
          </FadeInUp>

          <FadeInUp delay={0.15}>
            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Profit Factor</CardTitle>
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">{metrics.profitFactor.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  ${metrics.averageWin.toFixed(2)} avg win / ${metrics.averageLoss.toFixed(2)} avg loss
                </p>
              </CardContent>
            </Card>
          </FadeInUp>

          <FadeInUp delay={0.2}>
            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
                <div className="p-2 rounded-lg bg-purple-500/10">
                  <Zap className="h-4 w-4 text-purple-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold tracking-tight ${metrics.totalPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {metrics.totalPnl >= 0 ? '+' : ''}${metrics.totalPnl.toFixed(2)}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {metrics.totalTrades} total trades analyzed
                </p>
              </CardContent>
            </Card>
          </FadeInUp>

          <FadeInUp delay={0.25}>
            <Card className="hover:shadow-lg transition-shadow duration-300 border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Current Streak</CardTitle>
                <div className="p-2 rounded-lg bg-orange-500/10">
                  <Activity className="h-4 w-4 text-orange-500" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold tracking-tight">
                  <span className={metrics.currentStreak.type === 'win' ? 'text-emerald-500' : 'text-rose-500'}>
                    {metrics.currentStreak.count}
                  </span>
                  <span className="text-lg text-muted-foreground ml-1">
                    {metrics.currentStreak.type === 'win' ? 'W' : 'L'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  Best: {metrics.consecutiveWins}W | Worst: {metrics.consecutiveLosses}L
                </p>
              </CardContent>
            </Card>
          </FadeInUp>
        </div>

        {/* Strengths and Weaknesses */}
        <div className="grid gap-6 md:grid-cols-2">
          <FadeInUp delay={0.3}>
            <Card className="h-full border-0 bg-card/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/10">
                    <Award className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div>
                    <CardTitle className="text-emerald-500">Your Strengths</CardTitle>
                    <CardDescription>What you're doing exceptionally well</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.strengths.map((strength, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-green-500/5 border border-green-500/10"
                    >
                      <CheckCircle className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{strength}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </FadeInUp>

          <FadeInUp delay={0.35}>
            <Card className="h-full border-0 bg-card/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10">
                    <Lightbulb className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                    <CardTitle className="text-orange-500">Areas for Improvement</CardTitle>
                    <CardDescription>Opportunities to enhance your trading</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {analysis.weaknesses.map((weakness, index) => (
                    <motion.li
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-start gap-3 p-3 rounded-lg bg-orange-500/5 border border-orange-500/10"
                    >
                      <AlertTriangle className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{weakness}</span>
                    </motion.li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </FadeInUp>
        </div>

        {/* Detected Patterns */}
        <FadeInUp delay={0.4}>
          <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <Brain className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <CardTitle>Detected Patterns</CardTitle>
                  <CardDescription>Recurring themes identified in your trading behavior</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.patterns.map((pattern, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-muted/30 border border-border/50 hover:border-primary/30 transition-colors"
                  >
                    <div className="shrink-0 mt-1">{getImpactIcon(pattern.impact)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h4 className="font-semibold">{pattern.pattern}</h4>
                        <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                          {Math.round(pattern.confidence * 100)}% confidence
                        </Badge>
                        {pattern.impact === 'positive' && (
                          <Badge className="text-xs bg-green-500/10 text-emerald-500 border-green-500/30">
                            Positive Impact
                          </Badge>
                        )}
                        {pattern.impact === 'negative' && (
                          <Badge className="text-xs bg-red-500/10 text-rose-500 border-red-500/30">
                            Negative Impact
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{pattern.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeInUp>

        {/* Risk Assessment */}
        <FadeInUp delay={0.45}>
          <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${getRiskColor(analysis.riskAssessment.level)}`}>
                  <Shield className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle>Risk Assessment</CardTitle>
                  <CardDescription>Evaluation of your risk management practices</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-6">
                <div className={`shrink-0 w-4 h-4 rounded-full ${
                  analysis.riskAssessment.level === 'low' ? 'bg-green-500' :
                  analysis.riskAssessment.level === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                } mt-1.5 animate-pulse`} />
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="font-semibold text-lg capitalize">{analysis.riskAssessment.level} Risk Level</h4>
                    <Badge className={`${getRiskColor(analysis.riskAssessment.level)} border-0`}>
                      {analysis.riskAssessment.level === 'low' ? 'Well Managed' :
                       analysis.riskAssessment.level === 'medium' ? 'Needs Attention' : 'Critical'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-6">{analysis.riskAssessment.description}</p>
                  <div className="space-y-2">
                    <h5 className="font-medium text-sm mb-3">Recommendations:</h5>
                    {analysis.riskAssessment.recommendations.map((rec, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05 * index }}
                        className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                          {index + 1}
                        </div>
                        <span>{rec}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeInUp>

        {/* Action Plan */}
        <FadeInUp delay={0.5}>
          <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Target className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Action Plan</CardTitle>
                  <CardDescription>Specific steps to improve your trading performance</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analysis.actionPlan.map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                    className={`p-4 rounded-xl border-2 ${getPriorityColor(action.priority)} transition-all hover:shadow-md`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-full border-2 currentColor font-bold text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h4 className="font-semibold">{action.step}</h4>
                          <Badge variant="outline" className={`${getPriorityColor(action.priority)} text-xs`}>
                            {action.priority} priority
                          </Badge>
                        </div>
                        <p className="text-sm opacity-90">{action.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </FadeInUp>

        {/* Performance Trends */}
        <FadeInUp delay={0.55}>
          <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${
                  analysis.trends.improving ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                  {analysis.trends.improving ? (
                    <TrendingUp className={`h-5 w-5 ${analysis.trends.improving ? 'text-emerald-500' : 'text-rose-500'}`} />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-rose-500" />
                  )}
                </div>
                <div>
                  <CardTitle>Performance Trends</CardTitle>
                  <CardDescription>Direction of your trading performance over time</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className={`shrink-0 p-4 rounded-2xl ${
                  analysis.trends.improving ? 'bg-green-500/10' : 'bg-red-500/10'
                }`}>
                  {analysis.trends.improving ? (
                    <TrendingUp className="h-10 w-10 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-10 w-10 text-rose-500" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={`${
                      analysis.trends.improving 
                        ? 'bg-green-500/10 text-emerald-500 border-green-500/30' 
                        : 'bg-red-500/10 text-rose-500 border-red-500/30'
                    }`}>
                      {analysis.trends.improving ? 'Improving' : 'Needs Attention'}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">{analysis.trends.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </FadeInUp>

        {/* Psychological Insights */}
        {analysis.psychologicalInsights && analysis.psychologicalInsights.length > 0 && (
          <FadeInUp delay={0.6}>
            <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10">
                    <Brain className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <CardTitle>Psychological Insights</CardTitle>
                    <CardDescription>Mental and emotional aspects of your trading behavior</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2">
                  {analysis.psychologicalInsights.map((insight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.05 * index }}
                      className="flex items-start gap-3 p-4 rounded-xl bg-purple-500/5 border border-purple-500/10"
                    >
                      <Brain className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                      <span className="text-sm">{insight}</span>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </FadeInUp>
        )}
      </div>
      <Footer />
    </div>
  );
}