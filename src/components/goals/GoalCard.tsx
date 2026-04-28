'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GoalProgress, GoalStatus } from '@/lib/types';
import { formatPnL, getPnLColor } from '@/lib/utils';
import { Target, TrendingUp, Calendar, CheckCircle2, XCircle, Clock, Trash2 } from 'lucide-react';

interface GoalCardProps {
  progress: GoalProgress;
  onDelete?: () => void;
  showActions?: boolean;
}

export default function GoalCard({ progress, onDelete, showActions = false }: GoalCardProps) {
  const { goal, currentAmount, percentage, daysRemaining, isAchieved, tradeCount } = progress;

  const getStatusBadge = () => {
    switch (goal.status) {
      case 'active':
        return (
          <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            <Clock className="w-3 h-3 mr-1" />
            {daysRemaining === 0 ? 'Ends Today' : `${daysRemaining} days left`}
          </Badge>
        );
      case 'completed':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Not Achieved
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="secondary" className="text-muted-foreground">
            Cancelled
          </Badge>
        );
    }
  };

  const getProgressBarColor = () => {
    if (goal.status === 'completed' || isAchieved) return 'bg-emerald-500';
    if (goal.status === 'failed') return 'bg-rose-500';
    return 'bg-primary';
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Check for required data
  if (!goal) {
    console.error('GoalCard: goal is undefined');
    return (
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <p className="text-destructive">Error: Goal data is missing</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm hover:border-primary/50 transition-colors w-full max-w-2xl mx-auto">
      <div className="flex items-start justify-between gap-2 mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground truncate flex items-center gap-2">
            <Target className="w-4 h-4 shrink-0" />
            {goal.title}
          </h3>
          {goal.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {goal.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {getStatusBadge()}
          {showActions && onDelete && goal.status === 'active' && (
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-rose-500 hover:bg-accent h-7 px-2"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className={`font-semibold ${getPnLColor(currentAmount)}`}>
              {percentage.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${getProgressBarColor()}`}
              style={{ width: `${Math.min(100, percentage)}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/20 rounded-lg p-2 text-center">
            <div className="text-xs text-muted-foreground mb-1">Target</div>
            <div className="font-semibold text-foreground">
              {formatPnL(goal.targetAmount)}
            </div>
          </div>
          <div className="bg-muted/20 rounded-lg p-2 text-center">
            <div className="text-xs text-muted-foreground mb-1">Current</div>
            <div className={`font-semibold ${getPnLColor(currentAmount)}`}>
              {formatPnL(currentAmount)}
            </div>
          </div>
          <div className="bg-muted/20 rounded-lg p-2 text-center">
            <div className="text-xs text-muted-foreground mb-1">Trades</div>
            <div className="font-semibold text-foreground">{tradeCount}</div>
          </div>
        </div>

        {/* Date Range */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(goal.startDate)} - {formatDate(goal.endDate)}</span>
          </div>
          {isAchieved && goal.status === 'active' && (
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-xs">
              <TrendingUp className="w-3 h-3 mr-1" />
              On Track
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}