'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, DollarSign, Target, Calendar, Activity, Award, TrendingDown, Zap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useUser } from '@clerk/nextjs';
import { formatPnL, getPnLColor } from '@/lib/utils';
import { tradeService } from '@/lib/store';
import DashboardHeader from '../sections/DashboardHeader';
import Footer from '../sections/Footer';
import CurrencyPieChart from '@/components/charts/CurrencyPieChart';
import PnLPieChart from '@/components/charts/PnLPieChart';
import TopBottomCurrenciesChart from '@/components/charts/TopBottomCurrenciesChart';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d' | 'all'>('all');
  const [streakData, setStreakData] = useState({
    current: { type: 'win' as 'win' | 'loss', count: 0 },
    best: { type: 'win' as 'win' | 'loss', count: 0 },
    worst: { type: 'loss' as 'win' | 'loss', count: 0 },
  });
  const [data, setData] = useState({
    dailyPnL: [] as { date: string; pnl: number }[],
    cumulativePnL: [] as { date: string; cumulative: number }[],
    symbolPerformance: [] as { symbol: string; totalPnl: number; count: number; wins: number; winRate: number }[],
    directionPerformance: [] as { direction: string; totalPnl: number; count: number; wins: number; winRate: number }[],
    winRateByDay: [] as { day: string; winRate: number }[],
    topSymbols: [] as { symbol: string; totalPnl: number; count: number }[],
    filteredTrades: [] as { pnl: number }[],
    winRateBySymbol: [] as { symbol: string; winRate: number; count: number }[],
  });

  // Redirect to home page if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  // Load analytics data when authenticated
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      loadAnalyticsData();
    }
  }, [router, timeframe, isLoaded, isSignedIn]);

  const loadAnalyticsData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const trades = await tradeService.getTrades(user.id);
      
      // Filter trades by timeframe
      let filteredTradesData = trades;
      if (timeframe !== 'all') {
        const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        filteredTradesData = trades.filter(t => new Date(t.date) >= startDate);
      }

      // Daily PnL
      const dailyPnLMap = new Map();

      // Aggregate PnL by day
      filteredTradesData.forEach(trade => {
        const date = trade.date;
        if (!dailyPnLMap.has(date)) {
          dailyPnLMap.set(date, 0);
        }
        dailyPnLMap.set(date, dailyPnLMap.get(date) + trade.pnl);
      });

      const dailyPnLUnsorted = Array.from(dailyPnLMap.entries())
        .map(([date, pnl]) => ({
          date,
          pnl: Math.round(pnl * 100) / 100,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const dailyPnL = dailyPnLUnsorted.map(d => ({
        date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        pnl: d.pnl,
      }));

      // Cumulative PnL (running total)
      let runningTotal = 0;
      const cumulativePnL = dailyPnLUnsorted.map((d, index) => {
        runningTotal += d.pnl;
        return {
          date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          cumulative: Math.round(runningTotal * 100) / 100,
        };
      });

      // Symbol Performance
      const symbolMap = new Map();
      filteredTradesData.forEach(trade => {
        if (!symbolMap.has(trade.symbol)) {
          symbolMap.set(trade.symbol, { symbol: trade.symbol, totalPnl: 0, count: 0, wins: 0 });
        }
        const data = symbolMap.get(trade.symbol);
        data.totalPnl += trade.pnl;
        data.count += 1;
        if (trade.pnl > 0) data.wins += 1;
        data.totalPnl = Math.round(data.totalPnl * 100) / 100;
      });

      const symbolPerformance = Array.from(symbolMap.values()).map(d => ({
        ...d,
        winRate: d.count > 0 ? Math.round((d.wins / d.count) * 100) : 0,
      })).sort((a, b) => b.totalPnl - a.totalPnl);

      // Win Rate by Symbol
      const winRateBySymbol = [...symbolPerformance].map(s => ({
        symbol: s.symbol,
        winRate: s.winRate,
        count: s.count,
      })).sort((a, b) => b.winRate - a.winRate);

      // Direction Performance
      const directionMap = new Map();
      filteredTradesData.forEach(trade => {
        if (!directionMap.has(trade.direction)) {
          directionMap.set(trade.direction, { direction: trade.direction, totalPnl: 0, count: 0, wins: 0 });
        }
        const data = directionMap.get(trade.direction);
        data.totalPnl += trade.pnl;
        data.count += 1;
        if (trade.pnl > 0) data.wins += 1;
        data.totalPnl = Math.round(data.totalPnl * 100) / 100;
      });

      const directionPerformance = Array.from(directionMap.values()).map(d => ({
        ...d,
        winRate: d.count > 0 ? Math.round((d.wins / d.count) * 100) : 0,
      }));

      // Win Rate by Day
      const winRateByDayMap = new Map();
      filteredTradesData.forEach(trade => {
        const day = new Date(trade.date).toLocaleDateString('en-US', { weekday: 'short' });
        if (!winRateByDayMap.has(day)) {
          winRateByDayMap.set(day, { day, total: 0, wins: 0 });
        }
        const data = winRateByDayMap.get(day);
        data.total += 1;
        if (trade.pnl > 0) data.wins += 1;
      });

      const winRateByDay = Array.from(winRateByDayMap.values()).map(d => ({
        day: d.day,
        winRate: d.total > 0 ? Math.round((d.wins / d.total) * 100) : 0,
      }));

      // Top Symbols by Trade Count
      const topSymbols = [...symbolPerformance]
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate filtered trades for PnL distribution
      const filteredTradesForPnL = filteredTradesData.map(t => ({ pnl: t.pnl }));

      // Sort trades chronologically for streak calculation
      const sortedTrades = [...filteredTradesData].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      // Calculate streaks
      let currentStreak = { type: 'win' as 'win' | 'loss', count: 0 };
      let bestStreak = { type: 'win' as 'win' | 'loss', count: 0 };
      let worstStreak = { type: 'win' as 'win' | 'loss', count: 0 };
      let currentWinStreak = 0;
      let currentLossStreak = 0;

      sortedTrades.forEach(trade => {
        if (trade.pnl > 0) {
          currentWinStreak++;
          currentLossStreak = 0;
          if (currentWinStreak > bestStreak.count) {
            bestStreak = { type: 'win', count: currentWinStreak };
          }
        } else if (trade.pnl < 0) {
          currentLossStreak++;
          currentWinStreak = 0;
          if (currentLossStreak > worstStreak.count) {
            worstStreak = { type: 'loss', count: currentLossStreak };
          }
        } else {
          // Break-even trade breaks streaks
          currentWinStreak = 0;
          currentLossStreak = 0;
        }
      });

      // Set current streak
      const lastTrade = sortedTrades[sortedTrades.length - 1];
      if (lastTrade) {
        currentStreak = {
          type: lastTrade.pnl >= 0 ? 'win' : 'loss',
          count: lastTrade.pnl >= 0 ? currentWinStreak : currentLossStreak,
        };
      }

      setData({
        dailyPnL,
        cumulativePnL,
        symbolPerformance,
        directionPerformance,
        winRateByDay,
        topSymbols,
        filteredTrades: filteredTradesForPnL,
        winRateBySymbol,
      });

      // Store streak data in state
      setStreakData({ current: currentStreak, best: bestStreak, worst: worstStreak });
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate currency distribution data for chart
  const currencyChartData = useMemo(() => {
    const allTrades = data.symbolPerformance;
    if (allTrades.length === 0) return [];

    return allTrades.map(item => ({
      name: item.symbol,
      value: item.totalPnl,
      count: item.count,
    })).sort((a, b) => b.value - a.value).slice(0, 10); // Top 10 currencies by magnitude
  }, [data.symbolPerformance]);

      // Calculate PnL distribution data for pie chart
      const pnlChartData = useMemo(() => {
        if (data.filteredTrades.length === 0) return [];

        let profitTotal = 0;
        let lossTotal = 0;
        let profitCount = 0;
        let lossCount = 0;

        // Calculate directly from individual trades to get accurate profit/loss totals
        data.filteredTrades.forEach(trade => {
          if (trade.pnl > 0) {
            profitTotal += trade.pnl;
            profitCount += 1;
          } else if (trade.pnl < 0) {
            lossTotal += trade.pnl; // Keep negative value
            lossCount += 1;
          }
        });

        const chartData = [];
        if (profitTotal > 0) {
          chartData.push({
            name: 'Profit',
            value: Math.round(profitTotal * 100) / 100, // Positive value
            count: profitCount,
          });
        }
        if (lossTotal < 0) {
          chartData.push({
            name: 'Loss',
            value: Math.round(lossTotal * 100) / 100, // Negative value
            count: lossCount,
          });
        }

        return chartData;
      }, [data.filteredTrades]);


  const totalPnL = data.dailyPnL.reduce((sum, d) => sum + d.pnl, 0);
  const totalTrades = data.symbolPerformance.reduce((sum, s) => sum + s.count, 0);
  // Calculate win rate from filtered trades directly for accuracy
  const totalWins = data.filteredTrades.filter(t => t.pnl > 0).length;
  const winRate = totalTrades > 0 ? Math.round((totalWins / totalTrades) * 100) : 0;

  // Calculate advanced metrics
  const winningTrades = data.filteredTrades.filter(t => t.pnl > 0);
  const losingTrades = data.filteredTrades.filter(t => t.pnl < 0);
  
  const totalProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
  const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
  
  const averageWin = winningTrades.length > 0 ? totalProfit / winningTrades.length : 0;
  const averageLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;
  
  const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;
  const averageWinLossRatio = averageLoss > 0 ? averageWin / averageLoss : averageWin > 0 ? Infinity : 0;
  
  const pnlValues = data.filteredTrades.map(t => t.pnl);
  const bestTrade = pnlValues.length > 0 ? Math.max(...pnlValues) : 0;
  const worstTrade = pnlValues.length > 0 ? Math.min(...pnlValues) : 0;

  // Calculate PnL distribution for histogram
  const pnlDistribution = useMemo(() => {
    if (data.filteredTrades.length === 0) return [];
    
    const ranges = [
      { label: '< -$100', min: -Infinity, max: -100, count: 0 },
      { label: '-$100 to -$50', min: -100, max: -50, count: 0 },
      { label: '-$50 to -$25', min: -50, max: -25, count: 0 },
      { label: '-$25 to $0', min: -25, max: 0, count: 0 },
      { label: '$0 to $25', min: 0, max: 25, count: 0 },
      { label: '$25 to $50', min: 25, max: 50, count: 0 },
      { label: '$50 to $100', min: 50, max: 100, count: 0 },
      { label: '> $100', min: 100, max: Infinity, count: 0 },
    ];

    data.filteredTrades.forEach(trade => {
      const range = ranges.find(r => trade.pnl >= r.min && trade.pnl < r.max);
      if (range) range.count++;
    });

    return ranges;
  }, [data.filteredTrades]);

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Return null if not signed in (will redirect via useEffect)
  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {isLoading &&
        <div className="fixed top-0 left-0 flex w-screen h-screen bg-background/50 backdrop-blur-sm justify-center items-center py-8 z-100">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
      <DashboardHeader />
      {/* Header */}
      <header className="md:py-4 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row md:items-center justify-between group">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/dashboard')} className="text-muted-foreground hover:text-foreground scale-0 group-hover:scale-100 group-hover:flex">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Analytics</h1>
              <p className="text-sm text-muted-foreground">Track your trading performance</p>
            </div>
          </div>
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button
              variant={timeframe === 'all' ? 'default' : 'outline'}
              onClick={() => setTimeframe('all')}
              className={timeframe === 'all' ? 'bg-primary hover:bg-primary/90' : 'border-border text-foreground hover:bg-accent'}
            >
              All Time
            </Button>
            <Button
              variant={timeframe === '7d' ? 'default' : 'outline'}
              onClick={() => setTimeframe('7d')}
              className={timeframe === '7d' ? 'bg-primary hover:bg-primary/90' : 'border-border text-foreground hover:bg-accent'}
            >
              7 Days
            </Button>
            <Button
              variant={timeframe === '30d' ? 'default' : 'outline'}
              onClick={() => setTimeframe('30d')}
              className={timeframe === '30d' ? 'bg-primary hover:bg-primary/90' : 'border-border text-foreground hover:bg-accent'}
            >
              30 Days
            </Button>
            <Button
              variant={timeframe === '90d' ? 'default' : 'outline'}
              onClick={() => setTimeframe('90d')}
              className={timeframe === '90d' ? 'bg-primary hover:bg-primary/90' : 'border-border text-foreground hover:bg-accent'}
            >
              90 Days
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Summary Stats - Row 1 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground">Total PnL</CardDescription>
              <CardTitle className={`text-2xl font-bold ${getPnLColor(totalPnL)}`}>
                {formatPnL(totalPnL)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Cumulative profit/loss</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground">Total Trades</CardDescription>
              <CardTitle className="text-2xl text-foreground font-bold">{totalTrades}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Executed trades</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground">Win Rate</CardDescription>
              <CardTitle className="text-2xl text-foreground font-bold">{winRate}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Successful trades</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground">Avg PnL/Trade</CardDescription>
              <CardTitle className={`text-2xl font-bold ${getPnLColor(totalPnL / (totalTrades || 1))}`}>
                {formatPnL(totalPnL / (totalTrades || 1))}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Per trade average</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary Stats - Row 2 (Advanced Metrics) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground">Profit Factor</CardDescription>
              <CardTitle className={`text-2xl font-bold ${profitFactor >= 2 ? 'text-green-500' : profitFactor >= 1 ? 'text-yellow-500' : 'text-red-500'}`}>
                {profitFactor === Infinity ? '∞' : profitFactor.toFixed(2)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Gross profit/loss ratio</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground">Avg Win / Avg Loss</CardDescription>
              <CardTitle className="text-2xl font-bold overflow-hidden text-wrap">
                <span className={`${getPnLColor(averageWin)}`}>{formatPnL(averageWin)}</span>
                <span className="text-muted-foreground mx-1"> / </span>
                <span className={`${getPnLColor(-averageLoss)}`}>{formatPnL(-averageLoss)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Risk-reward ratio: {averageWinLossRatio === Infinity ? '∞' : averageWinLossRatio.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground">Best / Worst Trade</CardDescription>
              <CardTitle className="text-2xl font-bold overflow-hidden text-wrap">
                <span className={`${getPnLColor(bestTrade)} `}>{formatPnL(bestTrade)}</span>
                <span className="text-muted-foreground mx-1"> / </span>
                <span className={`${getPnLColor(worstTrade)}`}>{formatPnL(worstTrade)}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Trade extremes</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground">Current Streak</CardDescription>
              <CardTitle className={`text-2xl font-bold ${streakData.current.type === 'win' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {streakData.current.count} {streakData.current.type === 'win' ? 'W' : 'L'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Best: {streakData.best.count}W | Worst: {streakData.worst.count}L</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily PnL Chart */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Daily PnL</CardTitle>
              <CardDescription className="text-muted-foreground">
                Profit and loss over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.dailyPnL}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        color: 'var(--color-foreground)',
                      }}
                      formatter={(value) => [formatPnL(Number(value) || 0), 'PnL']}
                    />
                    <Line
                      type="bump"
                      dataKey="pnl"
                      stroke={totalPnL >= 0 ? 'var(--color-positive)' : 'var(--color-negative)'}
                      strokeWidth={2}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        const color = payload.pnl >= 0 ? 'var(--color-positive)' : 'var(--color-negative)';
                        return (
                          <circle
                            cx={cx}
                            cy={cy}
                            r={4}
                            fill={color}
                            stroke={color}
                            strokeWidth={2}
                          />
                        );
                      }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Symbol Performance */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Symbol Performance</CardTitle>
              <CardDescription className="text-muted-foreground">
                PnL by trading symbol
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.symbolPerformance.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="symbol" stroke="var(--color-muted-foreground)" fontSize={12} style={{ textTransform: 'uppercase' }} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                    <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      color: 'var(--color-foreground)',
                    }}
                    itemStyle={{ 
                      display: 'flex', 
                      gap: '4px',           // Controls the space between "PnL" and the value
                      textAlign: 'left', 
                      justifyContent: 'flex-start',
                      flexDirection: 'row-reverse' // This moves the Value to the left of the Name
                    }}
                    labelClassName="uppercase"
                    // Keep the label color neutral
                    labelStyle={{ color: 'var(--color-muted-foreground)' }} 
                    cursor={{ fill: 'var(--color-muted)', opacity: 0.2 }}
                    
                    // Use the formatter to dynamically color the specific value being hovered
                    formatter={(value) => {
                      const pnlValue = Number(value) || 0;
                      const color = pnlValue > 0 ? 'var(--color-positive)' : pnlValue < 0 ? 'var(--color-negative)' : 'var(--color-foreground)';
                      
                      return [
                        <span style={{ color }}>{formatPnL(pnlValue)}</span>,
                        'PnL'
                      ];
                    }}
                  />
                    <Bar
                      dataKey="totalPnl"
                      radius={[4, 4, 0, 0]}
                    >
                      {data.symbolPerformance.slice(0, 8).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.totalPnl >= 0 ? 'var(--color-positive)' : 'var(--color-negative)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Total PnL Chart (Full Width) */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground">Total PnL</CardTitle>
            <CardDescription className="text-muted-foreground">
              Cumulative profit and loss over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.cumulativePnL}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" stroke="var(--color-muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      color: 'var(--color-foreground)',
                    }}
                    formatter={(value) => [formatPnL(Number(value) || 0), 'Total PnL']}
                  />
                  <Line
                    type="bump"
                    dataKey="cumulative"
                    stroke={totalPnL >= 0 ? 'var(--color-positive)' : 'var(--color-negative)'}
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Currency and PnL Distribution Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <CurrencyPieChart 
            data={currencyChartData}
            title="Currency Distribution"
            description="Trades by currency pair (by PnL volume)"
          />
          <PnLPieChart 
            data={pnlChartData}
            title="Profit & Loss Distribution"
            description="Breakdown of profits and losses"
          />
        </div>

        {/* Top & Bottom Performing Currencies */}
        <div className="mb-8">
          <TopBottomCurrenciesChart 
            data={data.symbolPerformance.map(item => ({
              name: item.symbol,
              value: item.totalPnl,
              count: item.count,
              winRate: item.winRate,
            }))}
            title="Best & Worst Performing Currencies"
            description="Toggle between top 10 best and worst performing currency pairs"
          />
        </div>

        {/* PnL Distribution Histogram */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground">PnL Distribution</CardTitle>
            <CardDescription className="text-muted-foreground">
              Frequency of trades by profit/loss ranges
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pnlDistribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="label" stroke="var(--color-muted-foreground)" fontSize={10} angle={-45} textAnchor="end" height={60} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
                  <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        color: 'var(--color-foreground)',
                      }}
                      labelStyle={{ color: 'var(--color-foreground)' }}
                      itemStyle={{ color: 'var(--color-muted-foreground)' }}
                      cursor={{ fill: 'var(--color-border)', opacity: 0.2 }}
                    formatter={(value) => [value, 'Trades']}
                  />
                  <Bar
                    dataKey="count"
                    radius={[4, 4, 0, 0]}
                  >
                    {pnlDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.count > 0 ? (entry.min >= 0 ? 'var(--color-positive)' : 'var(--color-negative)') : 'var(--color-muted)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Win Rate by Symbol */}
        <Card className="bg-card border-border mb-8">
          <CardHeader>
            <CardTitle className="text-foreground">Win Rate by Symbol</CardTitle>
            <CardDescription className="text-muted-foreground">
              Success rate for each trading instrument
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.winRateBySymbol.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="symbol" stroke="var(--color-muted-foreground)" fontSize={12} style={{ textTransform: 'uppercase' }} />
                  <YAxis stroke="var(--color-muted-foreground)" fontSize={12} domain={[0, 100]} unit="%" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-card)',
                      border: '1px solid var(--color-border)',
                      borderRadius: '8px',
                      color: 'var(--color-foreground)',
                    }}
                    labelStyle={{ color: 'var(--color-foreground)', textTransform: 'uppercase' }}
                    itemStyle={{ color: 'var(--color-muted-foreground)' }}
                    cursor={{ fill: 'var(--color-border)', opacity: 0.2 }}
                    formatter={(value) => [`${value}%`, 'Win Rate']}
                  />
                  <Bar
                    dataKey="winRate"
                    radius={[4, 4, 0, 0]}
                    name="Win Rate"
                  >
                    {data.winRateBySymbol.slice(0, 10).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.winRate >= 50 ? 'var(--color-positive)' : 'var(--color-negative)'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Direction Performance */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Direction Performance</CardTitle>
              <CardDescription className="text-muted-foreground">
                Long vs Short performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.directionPerformance}
                      dataKey="count"
                      nameKey="direction"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      // stroke='none'
                      style={{
                        textTransform: 'capitalize'
                      }}
                      label={({ name, percent }) => name ? `${name}: ${Math.round((percent || 0) * 100)}%` : ''}
                    >
                      {data.directionPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.direction.toLowerCase() === 'long' ? 'var(--color-positive)' : 'var(--color-negative)'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        color: 'var(--color-foreground)',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Win Rate by Day */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Win Rate by Day</CardTitle>
              <CardDescription className="text-muted-foreground">
                Performance by day of week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.winRateByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                    <XAxis dataKey="day" stroke="var(--color-muted-foreground)" fontSize={12} />
                    <YAxis stroke="var(--color-muted-foreground)" fontSize={12} domain={[0, 100]} unit="%" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'var(--color-card)',
                        border: '1px solid var(--color-border)',
                        borderRadius: '8px',
                        color: 'var(--color-foreground)',
                      }}
                      labelStyle={{ color: 'var(--color-foreground)' }}
                      itemStyle={{ color: 'var(--color-muted-foreground)' }}
                      cursor={{ fill: 'var(--color-border)', opacity: 0.2 }}
                      formatter={(value) => [`${value}%`, "Win Rate"]}
                    />
                    <Bar
                      dataKey="winRate"
                      radius={[4, 4, 0, 0]}
                    >
                      {data.winRateByDay.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.winRate >= 50 ? 'var(--color-positive)' : 'var(--color-negative)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Symbols */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Top Symbols</CardTitle>
              <CardDescription className="text-muted-foreground">
                Most traded symbols
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topSymbols.map((symbol, index) => (
                  <div key={symbol.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${symbol.totalPnl > 0 ? 'bg-emerald-400/10' : symbol.totalPnl < 0 ? 'bg-rose-500/10' : 'bg-muted/20'}`}>
                        <span className={`text-sm font-bold ${getPnLColor(symbol.totalPnl)}`}>
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground uppercase">{symbol.symbol}</p>
                        <p className="text-sm text-muted-foreground">{symbol.count} trades</p>
                      </div>
                    </div>
                    <span className={`font-semibold ${getPnLColor(symbol.totalPnl)}`}>
                      {formatPnL(symbol.totalPnl)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}