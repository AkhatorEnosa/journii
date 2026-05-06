'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, TrendingUp, TrendingDown, DollarSign, Target, Download, FileSpreadsheet, FileText } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import { formatPnL, getPnLColor, getPnLBgColor, getPnLBorderColor } from '@/lib/utils';
import { useCreateTrade } from '@/lib/hooks/useTrades';
import { tradeService } from '@/lib/store';
import { Trade } from '@/lib/types';
import { exportTradesToCSV, exportTradesToPDF, exportAnalyticsSummaryToPDF } from '@/lib/export';
import TradeModal from '@/components/trades/TradeModal';
import TradeList from '@/components/trades/TradeList';
import DashboardHeader from '../sections/DashboardHeader';
import Footer from '../sections/Footer';

type TimeFilter = 'all' | 'year' | 'month' | 'week';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTradeListOpen, setIsTradeListOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dailyTotals, setDailyTotals] = useState<any[]>([]);
  const [isLoadingTotals, setIsLoadingTotals] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('all');
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

  // Calculate date range based on time filter
  const getDateRange = () => {
    const now = new Date();
    let startDate: string;
    let endDate: string;
    let displayMonth: Date | null = null;

    switch (timeFilter) {
      case 'week':
        // Get start of current week (Sunday)
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startDate = startOfWeek.toLocaleDateString('en-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        endDate = now.toLocaleDateString('en-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        displayMonth = startOfWeek;
        break;
      case 'month':
        // Current month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        startDate = startOfMonth.toLocaleDateString('en-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        endDate = now.toLocaleDateString('en-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        displayMonth = startOfMonth;
        break;
      case 'year':
        // Current year
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        startDate = startOfYear.toLocaleDateString('en-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        endDate = now.toLocaleDateString('en-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        displayMonth = startOfYear;
        break;
      case 'all':
      default:
        // All time - use a very early date
        startDate = '2000-01-01';
        endDate = now.toLocaleDateString('en-CA', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit'
        });
        displayMonth = null;
        break;
    }

    return { startDate, endDate, displayMonth };
  };

  // Load trades based on time filter
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      loadTradesForTimeFilter();
    }
  }, [user, isLoaded, isSignedIn, timeFilter]);

  const loadTradesForTimeFilter = async () => {
    if (!user) return;
    
    setIsLoadingTotals(true);
    setLoadError(null);
    try {
      const { startDate, endDate, displayMonth } = getDateRange();
      
      console.log('[Dashboard] Loading trades for time filter:', { 
        userId: user.id, 
        timeFilter,
        startDate, 
        endDate 
      });
      
      // Fetch trades for the time range
      const trades = await tradeService.getTradesByTimeRange(user.id, startDate, endDate);
      
      console.log('[Dashboard] Trades loaded:', trades);
      
      // Convert trades to daily totals for calendar display
      const dailyMap = new Map<string, Trade[]>();
      trades.forEach((trade) => {
        const normalizedDate = trade.date;
        if (!dailyMap.has(normalizedDate)) {
          dailyMap.set(normalizedDate, []);
        }
        dailyMap.get(normalizedDate)!.push(trade);
      });

      const dailyTotalsData: any[] = [];
      dailyMap.forEach((trades, date) => {
        const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
        dailyTotalsData.push({
          date,
          totalPnl,
          tradeCount: trades.length,
          trades,
        });
      });

      setDailyTotals(dailyTotalsData);
      
      // Update calendar view to show the relevant period
      if (displayMonth) {
        setCurrentMonth(displayMonth);
      }
    } catch (err) {
      console.error('[Dashboard] Failed to load trades:', err);
      setLoadError('Failed to load trade data. Please try refreshing the page.');
    } finally {
      setIsLoadingTotals(false);
    }
  };

  const createTradeMutation = useCreateTrade();

  // Calculate stats from daily totals
  const stats = useMemo(() => {
    const allTrades = dailyTotals.flatMap(d => d.trades);
    const totalTrades = allTrades.length;
    const totalPnL = allTrades.reduce((sum, t) => sum + t.pnl, 0);
    const winningTrades = allTrades.filter(t => t.pnl > 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    const avgPnL = totalTrades > 0 ? totalPnL / totalTrades : 0;

    return {
      totalTrades,
      totalPnL,
      winRate,
      avgPnL,
    };
  }, [dailyTotals]);

  const handleDateClick = (date: Date) => {
    // Prevent clicking on future dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate > today) {
      return; // Do nothing for future dates
    }

    // Use local date formatting to avoid timezone issues
    const dateStr = date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    setSelectedDate(dateStr);
    setIsTradeListOpen(true);
  };

  const handleTradeSubmit = async (tradeData: any) => {
    if (!user) return;

    try {
      await createTradeMutation.mutateAsync({
        ...tradeData,
        userId: user.id,
      });
      setIsModalOpen(false);
      setSelectedDate('');
      // Refresh daily totals after creating a trade
      await loadTradesForTimeFilter();
    } catch (err) {
      console.error('Failed to create trade:', err);
    }
  };

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));

    const days = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  const getDailyTotalForDate = (date: Date) => {
    // Use local date formatting to avoid timezone issues
    const dateStr = date.toLocaleDateString('en-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    return dailyTotals.find(d => d.date === dateStr);
  };

  const handlePrevMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  // Redirect to home page if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

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
      {/* Header */}
      <DashboardHeader />
      {isLoadingTotals &&
            <div className="fixed top-0 left-0 flex w-screen h-screen bg-background/50 backdrop-blur-sm justify-center items-center py-8 z-100">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
      }
      <header className="py-4 mt-10 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-bold text-foreground">Dashboard</h1>
              <p className="text-sm text-muted-foreground">Welcome back, {user.fullName || user.emailAddresses[0]?.emailAddress}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Export Menu */}
            <div className="relative">
              <Button
                variant="outline"
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="border-border text-foreground hover:bg-accent"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              
              {isExportMenuOpen && (
                <>
                  {/* Backdrop to close menu */}
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsExportMenuOpen(false)}
                  />
                  
                  {/* Dropdown menu */}
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-lg z-50">
                    <div className="p-2">
                      <div className="text-xs font-semibold text-muted-foreground px-3 py-2">
                        Export Trade Data
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-foreground hover:bg-accent"
                        onClick={() => {
                          const allTrades = dailyTotals.flatMap(d => d.trades);
                          if (allTrades.length > 0) {
                            exportTradesToCSV(allTrades);
                          }
                          setIsExportMenuOpen(false);
                        }}
                      >
                        <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-500" />
                        Export as CSV
                      </Button>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-foreground hover:bg-accent"
                        onClick={() => {
                          const allTrades = dailyTotals.flatMap(d => d.trades);
                          if (allTrades.length > 0) {
                            exportTradesToPDF(allTrades, stats, timeFilter);
                          }
                          setIsExportMenuOpen(false);
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2 text-rose-500" />
                        Export as PDF
                      </Button>
                      
                      <div className="border-t border-border my-2" />
                      
                      <div className="text-xs font-semibold text-muted-foreground px-3 py-2">
                        Export Analytics Summary
                      </div>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-foreground hover:bg-accent"
                        onClick={() => {
                          exportAnalyticsSummaryToPDF(stats, timeFilter);
                          setIsExportMenuOpen(false);
                        }}
                      >
                        <FileText className="w-4 h-4 mr-2 text-blue-500" />
                        Summary Report (PDF)
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <Button
              onClick={() => setIsModalOpen(true)}
              className="bg-primary hover:bg-primary/90"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Trade
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {loadError && (
          <Card className="bg-rose-500/10 border-rose-500/20 mb-8">
            <CardContent className="py-4">
              <p className="text-rose-500 text-sm">
                {loadError}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Time Filter */}
        <div className="mb-6">
          <div className="flex items-center justify-end gap-2">
            <span className="text-sm text-muted-foreground mr-2 font-semibold">Period:</span>
            {(['all', 'year', 'month', 'week'] as TimeFilter[]).map((filter) => (
              <Button
                key={filter}
                variant={timeFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeFilter(filter)}
                className={
                  timeFilter === filter
                    ? 'bg-primary hover:bg-primary/90'
                    : 'border-border text-foreground hover:bg-accent'
                }
              >
                {filter === 'all' ? 'All Time' : filter.charAt(0).toUpperCase() + filter.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Total Trades</CardTitle>
              <CardDescription className="text-muted-foreground">
                {timeFilter === 'all' ? 'All time' : timeFilter === 'year' ? 'This year' : timeFilter === 'month' ? 'This month' : 'This week'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.totalTrades}</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Total PnL</CardTitle>
              <CardDescription className="text-muted-foreground">
                {timeFilter === 'all' ? 'All time' : timeFilter === 'year' ? 'This year' : timeFilter === 'month' ? 'This month' : 'This week'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getPnLColor(stats.totalPnL)}`}>
                {formatPnL(stats.totalPnL)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Win Rate</CardTitle>
              <CardDescription className="text-muted-foreground">
                {timeFilter === 'all' ? 'All time' : timeFilter === 'year' ? 'This year' : timeFilter === 'month' ? 'This month' : 'This week'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stats.winRate.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Avg PnL</CardTitle>
              <CardDescription className="text-muted-foreground">Per trade</CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getPnLColor(stats.avgPnL)}`}>
                {formatPnL(stats.avgPnL)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Calendar View */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-foreground">Trade Calendar</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Click on a day to view trades
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                      <TrendingUp className="w-3 h-3 mr-1" />
                      Profit
                    </Badge>
                    <Badge variant="secondary" className="bg-rose-500/10 text-rose-500 border-rose-500/20">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      Loss
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="calendar-container">
                  <div className="space-y-4">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-foreground">
                        {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePrevMonth}
                          className="border-border text-foreground hover:bg-accent"
                        >
                          Previous
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleToday}
                          className="border-border text-foreground hover:bg-accent"
                        >
                          Today
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleNextMonth}
                          className="border-border text-foreground hover:bg-accent"
                        >
                          Next
                        </Button>
                      </div>
                    </div>

                    {/* Week Days Header */}
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground font-medium">
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className="p-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-1">
                      {getCalendarDays().map((day, index) => {
                        const dailyTotal = getDailyTotalForDate(day);
                        const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                        const isToday = day.toDateString() === new Date().toDateString();
                        const isWeekend = day.getDay() === 0 || day.getDay() === 6;

                        return (
                          <div
                            key={index}
                            className={`min-h-20 p-2 border border-border rounded-sm cursor-pointer transition-colors hover:bg-accent 
                              ${!isCurrentMonth ? 'opacity-50' : ''} 
                              ${isToday && !dailyTotal ? 'ring-2 ring-primary' : ''}
                              ${dailyTotal ? `${getPnLBgColor(dailyTotal.totalPnl)} ${getPnLBorderColor(dailyTotal.totalPnl)}` : ''}
                            `}
                            onClick={() => handleDateClick(day)}
                          >
                            <div className={`text-right text-xs ${
                              isCurrentMonth ? 'text-foreground' : 'text-muted-foreground'
                            } ${isWeekend ? 'font-medium' : ''}`}>
                              {day.getDate()}
                            </div>
                            {dailyTotal && (
                              <div className="text-center space-y-1">
                                <div className={`text-xs font-bold ${getPnLColor(dailyTotal.totalPnl)}`}>
                                  {formatPnL(dailyTotal.totalPnl)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {dailyTotal.tradeCount} trade{dailyTotal.tradeCount !== 1 ? 's' : ''}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500/20 border border-emerald-500/40 rounded" />
                        <span>Profit Day</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-rose-500/20 border border-rose-500/40 rounded" />
                        <span>Loss Day</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-muted/20 border border-slate-500/20 rounded" />
                        <span>No Trades</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 sticky top-10">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Quick Actions</CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage your trades
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Trade
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/analytics')}
                  className="w-full border-border text-foreground hover:bg-accent"
                >
                  <DollarSign className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
                <Button
                  variant="outline"
                  onClick={() => router.push('/goals')}
                  className="w-full border-border text-foreground hover:bg-accent"
                >
                  <Target className="w-4 h-4 mr-2" />
                  Goals & Challenges
                </Button>
                <TradeList 
                  selectedDate={selectedDate} 
                  isOpen={isTradeListOpen} 
                  onOpenChange={setIsTradeListOpen}
                  onTradeMutation={loadTradesForTimeFilter}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Trade Modal */}
      <TradeModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedDate('');
        }}
        onSubmit={handleTradeSubmit}
        isLoading={createTradeMutation.isPending}
        trade={selectedDate ? { date: selectedDate } as any : undefined}
      />
      <Footer />
    </div>
  );
}