'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, DollarSign, Target, Calendar } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useUser } from '@clerk/nextjs';
import { formatPnL, getPnLColor, formatPrice } from '@/lib/utils';
import { tradeService } from '@/lib/store';

const COLORS = ['#10b981', '#f43f5e', '#6366f1', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const [data, setData] = useState({
    dailyPnL: [] as { date: string; pnl: number }[],
    symbolPerformance: [] as { symbol: string; totalPnl: number; count: number }[],
    directionPerformance: [] as { direction: string; totalPnl: number; count: number; wins: number; winRate: number }[],
    winRateByDay: [] as { day: string; winRate: number }[],
    topSymbols: [] as { symbol: string; totalPnl: number; count: number }[],
  });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
      return;
    }
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

      const dailyPnL = Array.from(dailyPnLMap.entries())
        .map(([date, pnl]) => ({
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          pnl: Math.round(pnl * 100) / 100,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

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

  if (!user) {
    return null;
  }

  const totalPnL = data.dailyPnL.reduce((sum, d) => sum + d.pnl, 0);
  const totalTrades = data.symbolPerformance.reduce((sum, s) => sum + s.count, 0);
  const filteredTrades = [] as any[]; // This would be from the actual data
  const winningTrades = filteredTrades.filter(t => t.pnl > 0).length;
  const winRate = totalTrades > 0 ? Math.round((data.directionPerformance.reduce((sum, d) => sum + (d.winRate * d.count / 100), 0) / (data.directionPerformance.reduce((sum, d) => sum + d.count, 0))) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.push('/dashboard')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Analytics</h1>
              <p className="text-sm text-slate-400">Track your trading performance</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant={timeframe === '7d' ? 'default' : 'outline'}
              onClick={() => setTimeframe('7d')}
              className={timeframe === '7d' ? 'bg-emerald-600' : 'border-slate-700'}
            >
              7 Days
            </Button>
            <Button
              variant={timeframe === '30d' ? 'default' : 'outline'}
              onClick={() => setTimeframe('30d')}
              className={timeframe === '30d' ? 'bg-emerald-600' : 'border-slate-700'}
            >
              30 Days
            </Button>
            <Button
              variant={timeframe === '90d' ? 'default' : 'outline'}
              onClick={() => setTimeframe('90d')}
              className={timeframe === '90d' ? 'bg-emerald-600' : 'border-slate-700'}
            >
              90 Days
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Total PnL</CardDescription>
              <CardTitle className={`text-2xl ${getPnLColor(totalPnL)}`}>
                {formatPnL(totalPnL)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500">Cumulative profit/loss</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Total Trades</CardDescription>
              <CardTitle className="text-2xl text-slate-100">{totalTrades}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500">Executed trades</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Win Rate</CardDescription>
              <CardTitle className="text-2xl text-slate-100">{winRate}%</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500">Successful trades</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400">Avg PnL/Trade</CardDescription>
              <CardTitle className={`text-2xl ${getPnLColor(totalPnL / (totalTrades || 1))}`}>
                {formatPnL(totalPnL / (totalTrades || 1))}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-500">Per trade average</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily PnL Chart */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100">Daily PnL</CardTitle>
              <CardDescription className="text-slate-400">
                Profit and loss over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.dailyPnL}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#f8fafc',
                      }}
                      formatter={(value) => [formatPnL(Number(value) || 0), 'PnL']}
                    />
                    <Line
                      type="monotone"
                      dataKey="pnl"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={{ fill: '#10b981', strokeWidth: 2 }}
                      activeDot={{ r: 6, fill: '#34d399' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Symbol Performance */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100">Symbol Performance</CardTitle>
              <CardDescription className="text-slate-400">
                PnL by trading symbol
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.symbolPerformance.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="symbol" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#f8fafc',
                      }}
                      formatter={(value) => [formatPnL(Number(value) || 0), 'PnL']}
                    />
                    <Bar
                      dataKey="totalPnl"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Direction Performance */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100">Direction Performance</CardTitle>
              <CardDescription className="text-slate-400">
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
                      label={({ name, percent }) => name ? `${name}: ${Math.round((percent || 0) * 100)}%` : ''}
                    >
                      {data.directionPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f43f5e'} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#f8fafc',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Win Rate by Day */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100">Win Rate by Day</CardTitle>
              <CardDescription className="text-slate-400">
                Performance by day of week
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.winRateByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} domain={[0, 100]} unit="%" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1f2937',
                        border: '1px solid #374151',
                        borderRadius: '8px',
                        color: '#f8fafc',
                      }}
                      formatter={(value) => [`${value}%`, 'Win Rate']}
                    />
                    <Bar
                      dataKey="winRate"
                      fill="#6366f1"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Top Symbols */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100">Top Symbols</CardTitle>
              <CardDescription className="text-slate-400">
                Most traded symbols
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {data.topSymbols.map((symbol, index) => (
                  <div key={symbol.symbol} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${symbol.totalPnl > 0 ? 'bg-emerald-500/10' : symbol.totalPnl < 0 ? 'bg-rose-500/10' : 'bg-slate-500/10'}`}>
                        <span className={`text-sm font-bold ${getPnLColor(symbol.totalPnl)}`}>
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-slate-100">{symbol.symbol}</p>
                        <p className="text-sm text-slate-500">{symbol.count} trades</p>
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
    </div>
  );
}