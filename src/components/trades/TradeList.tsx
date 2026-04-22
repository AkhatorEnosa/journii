'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPnL, getPnLColor, formatDate } from '@/lib/utils';
import { tradeService } from '@/lib/store';
import { authStorage } from '@/lib/store';
import { Calendar, DollarSign, TrendingUp, TrendingDown, Edit, Trash2 } from 'lucide-react';

interface TradeListProps {
  selectedDate?: string;
}

export default function TradeList({ selectedDate }: TradeListProps) {
  const [trades, setTrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const router = useRouter();

  useEffect(() => {
    const userData = authStorage.getUser();
    if (!userData) {
      router.push('/');
      return;
    }
    setUser(userData);
    loadTrades();
  }, [selectedDate, router]);

  const loadTrades = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const tradesData = selectedDate 
        ? await tradeService.getTradesByDate(user.id, selectedDate)
        : await tradeService.getTrades(user.id);
      
      setTrades(tradesData);
    } catch (err) {
      console.error('Failed to load trades:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTrade = async (tradeId: string) => {
    if (!user) return;
    
    try {
      await tradeService.deleteTrade(user.id, tradeId);
      await loadTrades();
    } catch (err) {
      console.error('Failed to delete trade:', err);
    }
  };

  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const winRate = trades.length > 0 
    ? Math.round((trades.filter(t => t.pnl > 0).length / trades.length) * 100)
    : 0;

  return (
    <Sheet>
      <SheetTrigger>
        <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800">
          <Calendar className="w-4 h-4 mr-2" />
          Trade List
        </Button>
      </SheetTrigger>
      <SheetContent className="bg-slate-900 border-slate-800 w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-slate-100">
            {selectedDate ? `Trades for ${formatDate(selectedDate)}` : 'All Trades'}
          </SheetTitle>
          <SheetDescription className="text-slate-400">
            View and manage your trades
          </SheetDescription>
        </SheetHeader>

        {/* Stats Summary */}
        {trades.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-6 pt-4">
            <div className="bg-slate-800 rounded-lg p-3">
              <div className="text-sm text-slate-400">Total Trades</div>
              <div className="text-lg font-bold text-slate-100">{trades.length}</div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3">
              <div className="text-sm text-slate-400">Total PnL</div>
              <div className={`text-lg font-bold ${getPnLColor(totalPnL)}`}>
                {formatPnL(totalPnL)}
              </div>
            </div>
            <div className="bg-slate-800 rounded-lg p-3">
              <div className="text-sm text-slate-400">Win Rate</div>
              <div className="text-lg font-bold text-slate-100">{winRate}%</div>
            </div>
          </div>
        )}

        {/* Trade Table */}
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
          </div>
        ) : trades.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No trades found
          </div>
        ) : (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-lg border border-slate-800">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-800 hover:bg-slate-800">
                    <TableHead className="text-slate-300">Symbol</TableHead>
                    <TableHead className="text-slate-300">PnL</TableHead>
                    <TableHead className="text-slate-300">Direction</TableHead>
                    <TableHead className="text-slate-300">Date</TableHead>
                    <TableHead className="text-slate-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {trades.map((trade) => (
                    <TableRow key={trade.id} className="border-slate-800 hover:bg-slate-800/50">
                      <TableCell className="font-medium text-slate-100">
                        {trade.symbol}
                      </TableCell>
                      <TableCell>
                        <span className={`font-semibold ${getPnLColor(trade.pnl)}`}>
                          {formatPnL(trade.pnl)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant="secondary" 
                          className={`text-xs ${
                            trade.direction === 'long' 
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          }`}
                        >
                          {trade.direction.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-slate-300 text-sm">
                        {formatDate(trade.date)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-slate-400 hover:text-slate-100 hover:bg-slate-800"
                            onClick={() => handleDeleteTrade(trade.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}