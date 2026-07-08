'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trade } from '@/lib/types';
import { AlertTriangle, ArrowUp, ArrowDown } from 'lucide-react';
import { formatPnL, getPnLColor, formatDate } from '@/lib/utils';

interface DuplicateWarningDialogProps {
  isOpen: boolean;
  duplicateTrade: Trade | null;
  onEditTrade: () => void;
  onCancel: () => void;
}

export default function DuplicateWarningDialog({
  isOpen,
  duplicateTrade,
  onEditTrade,
  onCancel,
}: DuplicateWarningDialogProps) {
  if (!duplicateTrade) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="bg-card border-border">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <AlertDialogTitle className="text-foreground">
              Similar Trade Found
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-muted-foreground pt-2">
            A trade with these details already exists. Would you like to edit this trade instead?
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Existing Trade Details */}
        <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border">
          <div className="space-y-3">
            {/* Symbol and Direction */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground uppercase">
                {duplicateTrade.symbol}
              </span>
              <Badge
                variant="secondary"
                className={`text-xs ${
                  duplicateTrade.direction === 'long'
                    ? 'bg-emerald-400/10 text-emerald-400 border-emerald-500/20'
                    : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                }`}
              >
                {duplicateTrade.direction === 'long' ? (
                  <ArrowUp className="w-3 h-3 mr-1" />
                ) : (
                  <ArrowDown className="w-3 h-3 mr-1" />
                )}
                {duplicateTrade.direction.toUpperCase()}
              </Badge>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">Entry Price</div>
                <div className="text-sm font-semibold text-foreground">
                  ${duplicateTrade.entryPrice.toFixed(2)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Exit Price</div>
                <div className="text-sm font-semibold text-foreground">
                  ${duplicateTrade.exitPrice.toFixed(2)}
                </div>
              </div>
            </div>

            {/* PnL and Result */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-muted-foreground">PnL</div>
                <div className={`text-sm font-bold ${getPnLColor(duplicateTrade.pnl)}`}>
                  {formatPnL(duplicateTrade.pnl)}
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Result</div>
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    duplicateTrade.result === 'profit'
                      ? 'bg-emerald-400/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                  }`}
                >
                  {duplicateTrade.result?.toUpperCase() || '—'}
                </Badge>
              </div>
            </div>

            {/* Date */}
            <div>
              <div className="text-xs text-muted-foreground">Date</div>
              <div className="text-sm text-foreground">
                {formatDate(duplicateTrade.date)}
              </div>
            </div>

            {/* Tags if any */}
            {duplicateTrade.tags && duplicateTrade.tags.length > 0 && (
              <div>
                <div className="text-xs text-muted-foreground mb-2">Tags</div>
                <div className="flex flex-wrap gap-1">
                  {duplicateTrade.tags.map((tag, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-xs border-border text-muted-foreground"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <AlertDialogFooter className="mt-6">
          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={onEditTrade}
            className="bg-primary hover:bg-primary/90"
          >
            Edit Trade
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}