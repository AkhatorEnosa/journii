'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Goal, Trade } from '@/lib/types';
import { formatPnL, getPnLColor } from '@/lib/utils';
import { Calendar, TrendingUp, TrendingDown, Activity, XCircle, CheckCircle2 } from 'lucide-react';

interface GoalTradesModalProps {
  isOpen: boolean;
  onClose: () => void;
  goal: Goal | null;
  trades: Trade[];
}

export default function GoalTradesModal({ isOpen, onClose, goal, trades }: GoalTradesModalProps) {
  if (!goal) return null;

  // Filter trades within the goal's date range
  const goalTrades = trades.filter(trade => {
    return trade.date >= goal.startDate && trade.date <= goal.endDate;
  });

  // Calculate summary statistics
  const totalPnl = goalTrades.reduce((sum, trade) => sum + trade.pnl, 0);
  const winningTrades = goalTrades.filter(trade => trade.pnl > 0);
  const losingTrades = goalTrades.filter(trade => trade.pnl < 0);
  const winRate = goalTrades.length > 0 ? (winningTrades.length / goalTrades.length) * 100 : 0;
  const totalProfit = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0);
  const totalLoss = losingTrades.reduce((sum, trade) => sum + trade.pnl, 0);
  const avgWin = winningTrades.length > 0 ? totalProfit / winningTrades.length : 0;
  const avgLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;

  // Helper functions
  const formatDate = (dateStr: string) => { // Format date as "MMM D, YYYY"
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Direction badge with icons
  const getDirectionBadge = (direction: 'long' | 'short') => {
    const isLong = direction === 'long';
    return (
      <Badge 
        className={`text-xs ${isLong ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
      >
        {isLong ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {direction.toUpperCase()}
      </Badge>
    );
  };

  // Result badge with icons
  const getResultBadge = (result: 'profit' | 'loss' | null) => {
    if (result === 'profit') {
      return (
        <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Profit
        </Badge>
      );
    } else if (result === 'loss') {
      return (
        <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-xs">
          <XCircle className="w-3 h-3 mr-1" />
          Loss
        </Badge>
      );
    }
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl bg-card border-border max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Trades for: {goal.title}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {formatDate(goal.startDate)} - {formatDate(goal.endDate)}
          </DialogDescription>
        </DialogHeader>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-muted/20 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Total Trades</div>
            <div className="font-semibold text-foreground">{goalTrades.length}</div>
          </div>
          <div className="bg-muted/20 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Total PnL</div>
            <div className={`font-semibold ${getPnLColor(totalPnl)}`}>
              {formatPnL(totalPnl)}
            </div>
          </div>
          <div className="bg-muted/20 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Win Rate</div>
            <div className="font-semibold text-foreground">{winRate.toFixed(1)}%</div>
          </div>
          <div className="bg-muted/20 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Avg Win / Loss</div>
            <div className="font-semibold text-emerald-500 text-xs">{formatPnL(avgWin)}</div>
            <div className="font-semibold text-rose-500 text-xs">{formatPnL(avgLoss)}</div>
          </div>
        </div>

        {/* Trades List */}
        <div className="flex-1 overflow-y-auto">
          {goalTrades.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No trades found during this goal period</p>
            </div>
          ) : (
            <div className="space-y-2">
              {goalTrades.map((trade) => (
                <div
                  key={trade.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border  transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <div className="font-medium text-foreground uppercase">{trade.symbol}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        {formatDate(trade.date)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {getDirectionBadge(trade.direction)}
                    {getResultBadge(trade.result)}
                    <div className={`font-semibold ${getPnLColor(trade.pnl)}`}>
                      {formatPnL(trade.pnl)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}