'use client';

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPnL, getPnLColor, formatDate, formatPrice } from '@/lib/utils';
import { Calendar, Tag, FileText, TrendingUp, TrendingDown, X, Award } from 'lucide-react';
import { TradeFormData } from '@/lib/types';

interface TradeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trade: TradeFormData | null;
}

export default function TradeDetailsModal({ isOpen, onClose, trade }: TradeDetailsModalProps) {
  if (!trade) return null;

  const isProfitable = trade.pnl > 0;
  const isLoss = trade.pnl < 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-foreground text-xl">{trade.symbol}</DialogTitle>
              <Badge 
                variant="secondary" 
                className={`text-sm px-3 py-1 ${
                  trade.direction === 'long' 
                    ? 'bg-emerald-400/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                }`}
              >
                {trade.direction === 'long' ? (
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Long
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <TrendingDown className="w-3 h-3" />
                    Short
                  </span>
                )}
              </Badge>
            </div>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </Button> */}
          </div>
          <DialogDescription className="text-muted-foreground flex items-center gap-2 mt-2">
            <Calendar className="w-4 h-4" />
            {formatDate(trade.date)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* PnL Display */}
          <div className={`rounded-xl p-4 ${
            isProfitable 
              ? 'bg-emerald-500/10 border border-emerald-500/20' 
              : isLoss 
                ? 'bg-rose-500/10 border border-rose-500/20'
                : 'bg-muted/20 border border-border'
          }`}>
            <div className="flex items-center gap-1 text-sm text-muted-foreground font-semibold mb-1">
              <Award className="size-3" />
              <span>{trade.result === 'profit' ? 'Profit' : 'Loss'}</span>
            </div>
            <div className={`text-3xl font-bold ${getPnLColor(trade.pnl)}`}>
              {formatPnL(trade.pnl)}
            </div>
          </div>

          {/* Result Badge */}
          {/* {trade.result && (
            <div className="flex items-center gap-3">
              <div className="text-sm text-muted-foreground">Result</div>
              <Badge 
                variant="secondary" 
                className={`text-sm px-3 py-1 ${
                  trade.result === 'profit'
                    ? 'bg-emerald-400/10 text-emerald-400 border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                }`}
              >
                <Award className="w-3 h-3 mr-1" />
                {trade.result === 'profit' ? 'Profit' : 'Loss'}
              </Badge>
            </div>
          )} */}

          {/* Trade Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/20 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Entry Price</div>
              <div className="text-lg font-semibold text-foreground">
                {formatPrice(trade.entryPrice)}
              </div>
            </div>
            <div className="bg-muted/20 rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Exit Price</div>
              <div className="text-lg font-semibold text-foreground">
                {formatPrice(trade.exitPrice)}
              </div>
            </div>
          </div>

          {/* Tags */}
          {trade.tags && trade.tags.length > 0 && (
            <div>
              <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <Tag className="w-4 h-4" />
                Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {trade.tags.map((tag, idx) => (
                  <Badge
                    key={idx}
                    variant="outline"
                    className="border-border text-muted-foreground"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {trade.notes && (
            <div>
              <div className="text-sm text-muted-foreground mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Notes
              </div>
              <div className="bg-muted/20 rounded-lg p-4 text-foreground whitespace-pre-wrap">
                {trade.notes}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}