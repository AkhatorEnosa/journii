'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatPnL, getPnLColor, formatDate } from '@/lib/utils';
import { tradeService } from '@/lib/store';
import { useUser } from '@clerk/nextjs';
import { Calendar, Edit, Trash2, AlertCircle } from 'lucide-react';
import TradeModal from './TradeModal';

interface TradeListProps {
  selectedDate?: string;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export default function TradeList({ selectedDate, isOpen: controlledOpen, onOpenChange }: TradeListProps) {
  const [trades, setTrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [internalOpen, setInternalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user, isLoaded, isSignedIn } = useUser();
  const router = useRouter();

  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = (open: boolean) => {
    if (!isControlled) {
      setInternalOpen(open);
    }
    onOpenChange?.(open);
  };

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
      return;
    }
    if (isLoaded && isSignedIn) {
      loadTrades();
    }
  }, [selectedDate, router, isLoaded, isSignedIn, isOpen]);

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

  const handleEditTrade = (trade: any) => {
    setEditingTrade(trade);
    setIsEditModalOpen(true);
  };

  const handleEditSubmit = async (updatedTrade: any) => {
    if (!user || !editingTrade) return;

    try {
      await tradeService.updateTrade(user.id, editingTrade.id, updatedTrade);
      await loadTrades();
      setIsEditModalOpen(false);
      setEditingTrade(null);
    } catch (err) {
      console.error('Failed to update trade:', err);
    }
  };

  const isFutureDate = (dateStr: string) => {
    const selected = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selected.setHours(0, 0, 0, 0);
    return selected > today;
  };

  const totalPnL = trades.reduce((sum, trade) => sum + trade.pnl, 0);
  const winRate = trades.length > 0 
    ? Math.round((trades.filter(t => t.pnl > 0).length / trades.length) * 100)
    : 0;

  return (
    <div>
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        {/* <SheetTrigger>
          <Button variant="outline" className="w-full border-border text-foreground hover:bg-accent">
            <Calendar className="w-4 h-4 mr-2" />
            Trade List
          </Button>
        </SheetTrigger> */}
        <SheetContent className="bg-card border-border w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="text-foreground">
              {selectedDate ? `Trades for ${formatDate(selectedDate)}` : 'All Trades'}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              View and manage your trades
            </SheetDescription>
          </SheetHeader>

          {/* Stats Summary */}
          {trades.length > 0 && (
            <div className="grid grid-cols-3 gap-4 mb-6 pt-4">
              <div className="bg-muted/20 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">Total Trades</div>
                <div className="text-lg font-bold text-foreground">{trades.length}</div>
              </div>
              <div className="bg-muted/20 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">Total PnL</div>
                <div className={`text-lg font-bold ${getPnLColor(totalPnL)}`}>
                  {formatPnL(totalPnL)}
                </div>
              </div>
              <div className="bg-muted/20 rounded-lg p-3">
                <div className="text-sm text-muted-foreground">Win Rate</div>
                <div className="text-lg font-bold text-foreground">{winRate}%</div>
              </div>
            </div>
          )}

          {/* Future Date Warning */}
          {selectedDate && isFutureDate(selectedDate) && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <div className="flex items-center gap-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Cannot add trades for future dates</span>
              </div>
            </div>
          )}

          {/* Trade Table */}
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : trades.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No trades found
            </div>
          ) : (
            <div className="space-y-4">
              <div className="overflow-hidden rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/20 hover:bg-muted/20">
                      <TableHead className="text-foreground">Symbol</TableHead>
                      <TableHead className="text-foreground">PnL</TableHead>
                      <TableHead className="text-foreground">Direction</TableHead>
                      <TableHead className="text-foreground">Date</TableHead>
                      <TableHead className="text-foreground">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trades.map((trade) => (
                      <TableRow key={trade.id} className="border-border hover:bg-accent/50">
                        <TableCell className="font-medium text-foreground">
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
                                ? 'bg-emerald-400/10 text-emerald-400 border-emerald-500/20' 
                                : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            }`}
                          >
                            {trade.direction.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(trade.date)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-foreground hover:bg-accent"
                              onClick={() => handleEditTrade(trade)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-muted-foreground hover:text-destructive hover:bg-accent"
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

      {/* Edit Trade Modal */}
      <TradeModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingTrade(null);
        }}
        onSubmit={handleEditSubmit}
        isLoading={isLoading}
        trade={editingTrade}
      />
    </div>
  );
}
