'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { TradingPlan } from '@/lib/types';
import { 
  Eye, 
  TrendingUp, 
  Clock, 
  Target, 
  AlertTriangle, 
  Brain,
  Calendar,
  X
} from 'lucide-react';

interface TradingPlanDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: TradingPlan | null;
}

export default function TradingPlanDetailsModal({ isOpen, onClose, plan }: TradingPlanDetailsModalProps) {
  if (!plan) return null;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-foreground text-xl capitalize">
                {plan.name}
              </DialogTitle>
              {plan.description && (
                <DialogDescription className="text-muted-foreground mt-2">
                  {plan.description}
                </DialogDescription>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <Badge 
              variant={plan.status === 'active' ? 'default' : 'secondary'}
              className={plan.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : ''}
            >
              {plan.status}
            </Badge>
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Updated {formatDate(plan.updatedAt)}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-6 max-h-[60vh] overflow-y-auto">
          {/* Instruments & Sessions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Instruments */}
            <div className="bg-muted/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 font-medium">
                <TrendingUp className="w-4 h-4" />
                Instruments / Pairs
              </div>
              {plan.instruments.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {plan.instruments.map((inst) => (
                    <Badge key={inst} variant="outline" className="border-border text-xs">
                      {inst}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No instruments specified</p>
              )}
            </div>

            {/* Trading Sessions */}
            <div className="bg-muted/20 rounded-lg p-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3 font-medium">
                <Clock className="w-4 h-4" />
                Trading Sessions
              </div>
              {plan.tradingSessions ? (
                <p className="text-sm text-foreground">{plan.tradingSessions}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No session preferences specified</p>
              )}
            </div>
          </div>

          {/* Trading Rules */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Target className="w-4 h-4" />
              Trading Rules
            </div>

            {/* Entry Rules */}
            <div className="bg-emerald-500/5 rounded-lg p-4 border border-emerald-500/10">
              <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 mb-2 font-medium">
                <span className="text-lg">✓</span>
                Entry Rules
              </div>
              {plan.entryRules ? (
                <p className="text-sm text-foreground whitespace-pre-wrap">{plan.entryRules}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No entry rules specified</p>
              )}
            </div>

            {/* Exit Rules */}
            <div className="bg-rose-500/5 rounded-lg p-4 border border-rose-500/10">
              <div className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400 mb-2 font-medium">
                <span className="text-lg">✕</span>
                Exit Rules
              </div>
              {plan.exitRules ? (
                <p className="text-sm text-foreground whitespace-pre-wrap">{plan.exitRules}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No exit rules specified</p>
              )}
            </div>

            {/* Risk Management */}
            <div className="bg-blue-500/5 rounded-lg p-4 border border-blue-500/10">
              <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 mb-2 font-medium">
                <AlertTriangle className="w-4 h-4" />
                Risk Management
              </div>
              {plan.riskManagement ? (
                <p className="text-sm text-foreground whitespace-pre-wrap">{plan.riskManagement}</p>
              ) : (
                <p className="text-sm text-muted-foreground">No risk management rules specified</p>
              )}
            </div>
          </div>

          {/* Psychology Rules */}
          <div className="bg-purple-500/5 rounded-lg p-4 border border-purple-500/10">
            <div className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 mb-2 font-medium">
              <Brain className="w-4 h-4" />
              Psychology & Discipline
            </div>
            {plan.psychologyRules ? (
              <p className="text-sm text-foreground whitespace-pre-wrap">{plan.psychologyRules}</p>
            ) : (
              <p className="text-sm text-muted-foreground">No psychology rules specified</p>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-border text-muted-foreground hover:text-foreground"
          >
            <Eye className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}