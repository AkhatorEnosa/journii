'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, DollarSign, Target, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useUser } from '@clerk/nextjs';
import { formatPnL, getPnLColor, formatPrice } from '@/lib/utils';
import { tradeService } from '@/lib/store';
import DashboardHeader from '../sections/DashboardHeader';
import Footer from '../sections/Footer';
import CurrencyPieChart from '@/components/charts/CurrencyPieChart';
import PnLPieChart from '@/components/charts/PnLPieChart';

// const COLORS = ['var(--color-positive)', 'var(--color-negative)', '#6366f1', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [data, setData] = useState({
    dailyPnL: [] as { date: string; pnl: number }[],
    cumulativePnL: [] as { date: string; cumulative: number }[],
    symbolPerformance: [] as { symbol: string; totalPnl: number; count: number }[],
    directionPerformance: [] as { direction: string; totalPnl: number; count: number; wins: number; winRate: number }[],
    winRateByDay: [] as { day: string; winRate: number }[],
    topSymbols: [] as { symbol: string; totalPnl: number; count: number }[],
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
      
      // Get days based on timeframe
      const days = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 90;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Filter trades by timeframe
      const filteredTrades = trades.filter(t => new Date(t.date) >= startDate);

      // Daily PnL
      const dailyPnLMap = new Map();
      filteredTrades.forEach(trade => {
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
      filteredTrades.forEach(trade => {
        if (!symbolMap.has(trade.symbol)) {
          symbolMap.set(trade.symbol, { symbol: trade.symbol, totalPnl: 0, count: 0 });
        }
        const data = symbolMap.get(trade.symbol);
        data.totalPnl += trade.pnl;
        data.count += 1;
        data.totalPnl = Math.round(data.totalPnl * 100) / 100;
      });

      const symbolPerformance = Array.from(symbolMap.values())
        .sort((a, b) => b.totalPnl - a.totalPnl);

      // Direction Performance
      const directionMap = new Map();
      filteredTrades.forEach(trade => {
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
      filteredTrades.forEach(trade => {
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

      setData({
        dailyPnL,
        cumulativePnL,
        symbolPerformance,
        directionPerformance,
        winRateByDay,
        topSymbols,
      });
    } catch (err) {
      console.error('Failed to load analytics data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate currency distribution data for pie chart
  const currencyChartData = useMemo(() => {
    const allTrades = data.symbolPerformance;
    if (allTrades.length === 0) return [];

    return allTrades.map(item => ({
      name: item.symbol,
      value: Math.abs(item.totalPnl),
      count: item.count,
    })).sort((a, b) => b.value - a.value).slice(0, 10); // Top 10 currencies
  }, [data.symbolPerformance]);

  // Calculate PnL distribution data for pie chart
  const pnlChartData = useMemo(() => {
    if (data.symbolPerformance.length === 0) return [];

    let profitTotal = 0;
    let lossTotal = 0;
    let profitCount = 0;
    let lossCount = 0;

    data.symbolPerformance.forEach(item => {
      if (item.totalPnl > 0) {
        profitTotal += item.totalPnl;
        profitCount += item.count;
      } else if (item.totalPnl < 0) {
        lossTotal += item.totalPnl; // Keep negative value
        lossCount += item.count;
      }
    });

    const chartData = [];
    if (profitTotal > 0) {
      chartData.push({
        name: 'Profit',
        value: profitTotal, // Positive value
        count: profitCount,
      });
    }
    if (lossTotal < 0) {
      chartData.push({
        name: 'Loss',
        value: lossTotal, // Negative value
        count: lossCount,
      });
    }

    return chartData;
  }, [data.symbolPerformance]);


  const totalPnL = data.dailyPnL.reduce((sum, d) => sum + d.pnl, 0);
  const totalTrades = data.symbolPerformance.reduce((sum, s) => sum + s.count, 0);
  const winRate = totalTrades > 0 ? Math.round((data.directionPerformance.reduce((sum, d) => sum + (d.winRate * d.count / 100), 0) / (data.directionPerformance.reduce((sum, d) => sum + d.count, 0))) * 100) : 0;

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
      <div className='container mx-auto px-4'>
        <Button variant="ghost" onClick={() => router.push('/dashboard')} className="py-8 mt-10 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
      {/* Header */}
      <header className="py-4 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">Analytics</h1>
              <p className="text-sm text-muted-foreground">Track your trading performance</p>
            </div>
          </div>
          <div className="flex gap-2">
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
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardDescription className="text-muted-foreground">Total PnL</CardDescription>
              <CardTitle className={`text-2xl ${getPnLColor(totalPnL)}`}>
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
              <CardTitle className="text-2xl text-foreground">{totalTrades}</CardTitle>
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
              <CardTitle className="text-2xl text-foreground">{winRate}%</CardTitle>
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
              <CardTitle className={`text-2xl ${getPnLColor(totalPnL / (totalTrades || 1))}`}>
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