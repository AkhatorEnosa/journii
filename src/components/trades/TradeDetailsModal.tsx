'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { formatPnL, getPnLColor, formatDate, formatPrice, formatDateTime } from '@/lib/utils';
import { Calendar, Tag, FileText, TrendingUp, TrendingDown, X, Award, Edit, Trash2, Clock, ArrowRight, Timer, Play, Square } from 'lucide-react';
import { Trade } from '@/lib/types';
import { useUser } from '@clerk/nextjs';
import { tradeService } from '@/lib/store';
import { useQueryClient } from '@tanstack/react-query';
import { tradeKeys } from '@/lib/hooks/useTrades';
import TradeModal from './TradeModal';

interface TradeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  trade: Trade | null;
  onTradeMutation?: () => void;
  onRefresh?: () => void;
}

export default function TradeDetailsModal({ isOpen, onClose, trade, onTradeMutation, onRefresh }: TradeDetailsModalProps) {
  const { user, isSignedIn } = useUser();
  const queryClient = useQueryClient();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  if (!trade) return null;

  const isProfitable = trade.pnl > 0;
  const isLoss = trade.pnl < 0;

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleEditClose = () => {
    setIsEditModalOpen(false);
  };

  const handleEditSubmit = async (updatedTrade: any) => {
    if (!user || !trade) return;

    try {
      await tradeService.updateTrade(user.id, trade.id, updatedTrade);
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: tradeKeys.all });
      // Refresh the trade list if callback provided
      onRefresh?.();
      // Notify parent component to refresh its data
      onTradeMutation?.();
      setIsEditModalOpen(false);
      onClose();
    } catch (err) {
      console.error('Failed to update trade:', err);
    }
  };

  const handleDeleteClick = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteClose = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (!user || !trade) return;
    
    setIsDeleting(true);
    try {
      await tradeService.deleteTrade(user.id, trade.id);
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: tradeKeys.all });
      // Refresh the trade list if callback provided
      onRefresh?.();
      // Notify parent component to refresh its data
      onTradeMutation?.();
      setIsDeleteDialogOpen(false);
      onClose();
    } catch (err) {
      console.error('Failed to delete trade:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DialogTitle className="text-foreground text-xl md:text-2xl font-bold uppercase">{trade.symbol}</DialogTitle>
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
          </div>
          <DialogDescription className="text-muted-foreground flex items-center gap-2 mt-2">
            <Calendar className="w-4 h-4" />
            {formatDate(trade.date)}
            {trade.openDateTime && (
              <span className="text-xs ml-2">
                (Open: {formatDateTime(trade.openDateTime)})
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 mt-4 max-h-[50vh] overflow-y-auto">
          {/* Trade Timing (if available) */}
          {(trade.openDateTime || trade.closeDateTime) && (
            <div className="bg-linear-to-br from-muted/30 to-muted/10 rounded-xl p-5 border border-border/50">
              <div className="text-sm text-muted-foreground mb-4 flex items-center gap-2 font-medium">
                <Clock className="w-4 h-4" />
                Trade Timing
              </div>
              
              <div className="flex items-center justify-between gap-4">
                {/* Open Time */}
                {trade.openDateTime && (
                  <div className="flex-1">
                    <div className="flex items-center gap-1 mb-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Play className="w-3 h-3 text-emerald-500" />
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Opened</span>
                        <div className="text-xs font-semibold text-foreground tracking-tighter">
                          {formatDateTime(trade.openDateTime)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Timeline Connector */}
                {trade.openDateTime && trade.closeDateTime && (
                  <div className="flex flex-col items-center justify-center px-2">
                    {/* <div className="w-16 h-0.5 bg-gradient-to-r from-emerald-500/50 to-rose-500/50" /> */}
                    <div className="px-2 py-1 rounded-full bg-primary/10 border border-primary/20">
                      <span className="text-xs font-medium text-primary flex items-center gap-1">
                        <Timer className="w-3 h-3" />
                        {(() => {
                          const open = new Date(trade.openDateTime!);
                          const close = new Date(trade.closeDateTime!);
                          const diffMs = close.getTime() - open.getTime();
                          const diffMins = Math.floor(diffMs / 60000);
                          const hours = Math.floor(diffMins / 60);
                          const mins = diffMins % 60;
                          const days = Math.floor(hours / 24);
                          const remainingHours = hours % 24;
                          
                          const parts = [];
                          if (days > 0) parts.push(`${days}d`);
                          if (remainingHours > 0) parts.push(`${remainingHours}h`);
                          if (mins > 0) parts.push(`${mins}m`);
                          return parts.join(' ') || '<1m';
                        })()}
                      </span>
                    </div>
                    {/* <div className="w-16 h-0.5 bg-gradient-to-r from-emerald-500/50 to-rose-500/50" /> */}
                  </div>
                )}

                {/* Close Time */}
                {trade.closeDateTime && (
                  <div className="flex-1 text-right">
                    <div className="flex items-center justify-end gap-1 mb-2">
                      <div>
                        <span className="text-xs text-muted-foreground uppercase tracking-wide">Closed</span>
                        <div className="text-xs font-semibold text-foreground tracking-tighter">
                          {formatDateTime(trade.closeDateTime)}
                        </div>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-rose-500/20 flex items-center justify-center">
                        <Square className="w-3 h-3 text-rose-500" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

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
                <div className="rounded-lg p-4 text-foreground whitespace-pre-wrap bg-blue-500/10 border border-dashed border-blue-500/20">
                  {trade.notes}
                </div>
              </div>
            )}
          </div>
        </div>

            <div className="w-full flex justify-center items-center gap-1 border-t py-5">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleEditClick}
                className="text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                <Edit className="w-4 h-4" /> Edit Trade
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteClick}
                className="text-muted-foreground hover:text-rose-500 hover:bg-accent"
              >
                <Trash2 className="w-4 h-4" /> Delete Trade
              </Button>
              {/* <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </Button> */}
            </div>
      </DialogContent>

      {/* Edit Trade Modal */}
      <TradeModal
        isOpen={isEditModalOpen}
        onClose={handleEditClose}
        onSubmit={handleEditSubmit}
        trade={trade}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={handleDeleteClose}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Trade</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete this trade? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="text-muted-foreground hover:text-foreground" onClick={handleDeleteClose}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-rose-500 hover:bg-rose-600"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
