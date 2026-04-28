'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { formatPnL, formatPrice, getPnLColor, getPnLBgColor, getPnLBorderColor } from '@/lib/utils';
import { TradeFormData } from '@/lib/types';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TradeFormData) => void;
  trade?: TradeFormData;
  isLoading?: boolean;
  defaultDate?: string;
}

export default function TradeModal({ isOpen, onClose, onSubmit, trade, isLoading = false, defaultDate }: TradeModalProps) {
  const [formData, setFormData] = useState<TradeFormData>({
    symbol: trade?.symbol || '',
    entryPrice: trade?.entryPrice || 0,
    exitPrice: trade?.exitPrice || 0,
    pnl: trade?.pnl || 0,
    direction: trade?.direction || 'long',
    result: trade?.pnl !== undefined && trade.pnl < 0 ? 'loss' : 'profit',
    notes: trade?.notes || '',
    tags: trade?.tags || [],
    date: trade?.date || defaultDate || new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when trade prop changes (for editing)
  useEffect(() => {
    if (trade) {
      setFormData({
        symbol: trade.symbol || '',
        entryPrice: trade.entryPrice || 0,
        exitPrice: trade.exitPrice || 0,
        pnl: trade.pnl || 0,
        direction: trade.direction || 'long',
        result: trade.result || (trade.pnl !== undefined && trade.pnl < 0 ? 'loss' : 'profit'),
        notes: trade.notes || '',
        tags: trade.tags || [],
        date: trade.date || new Date().toISOString().split('T')[0],
      });
    } else {
      // Reset form for new trade
      setFormData({
        symbol: '',
        entryPrice: 0,
        exitPrice: 0,
        pnl: 0,
        direction: 'long',
        result: 'profit',
        notes: '',
        tags: [],
        date: defaultDate || new Date().toISOString().split('T')[0],
      });
    }
  }, [trade, defaultDate]);

  const handleInputChange = (field: keyof TradeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.symbol.trim()) {
      newErrors.symbol = 'Symbol is required';
    }

    if (!formData.entryPrice || formData.entryPrice <= 0) {
      newErrors.entryPrice = 'Entry price must be greater than 0';
    }

    if (!formData.exitPrice || formData.exitPrice <= 0) {
      newErrors.exitPrice = 'Exit price must be greater than 0';
    }

    if (!formData.pnl && formData.pnl !== 0) {
      newErrors.pnl = 'PnL is required';
    } else {
      // Validate PnL sign based on selected result
      const { result, pnl } = formData;
      
      if (result === 'profit' && pnl <= 0) {
        newErrors.pnl = 'PnL must be positive for profit trades';
      } else if (result === 'loss' && pnl >= 0) {
        newErrors.pnl = 'PnL must be negative for loss trades';
      }
    }

    // Validate price relationship based on direction and result
    if (formData.entryPrice > 0 && formData.exitPrice > 0) {
      const { direction, result, entryPrice, exitPrice } = formData;
      
      if (direction === 'long' && result === 'profit') {
        if (exitPrice <= entryPrice) {
          newErrors.exitPrice = 'Exit price must be greater than entry price for long profit trades';
        }
      } else if (direction === 'long' && result === 'loss') {
        if (exitPrice >= entryPrice) {
          newErrors.exitPrice = 'Exit price must be less than entry price for long loss trades';
        }
      } else if (direction === 'short' && result === 'profit') {
        if (exitPrice >= entryPrice) {
          newErrors.exitPrice = 'Exit price must be less than entry price for short profit trades';
        }
      } else if (direction === 'short' && result === 'loss') {
        if (exitPrice <= entryPrice) {
          newErrors.exitPrice = 'Exit price must be greater than entry price for short loss trades';
        }
      }
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      // Check if date is in the future
      const selectedDate = new Date(formData.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate > today) {
        newErrors.date = 'Cannot create trades for future dates';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit(formData);
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {trade ? 'Edit Trade' : 'Add New Trade'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Record your trade details to track your performance
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol" className="text-foreground">
                Symbol
              </Label>
              <Input
                id="symbol"
                placeholder="e.g., XAUUSD, BTCUSD"
                value={formData.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value)}
                className="bg-input border-border text-foreground uppercase"
                disabled={isLoading}
              />
              {errors.symbol && <p className="text-sm text-destructive">{errors.symbol}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="direction" className="text-foreground">
                Direction
              </Label>
              <Select
                value={formData.direction}
                onValueChange={(value) => handleInputChange('direction', value as 'long' | 'short')}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-input border-border text-foreground capitalize w-full">
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="result" className="text-foreground">
                Result
              </Label>
              <Select
                value={formData.result}
                onValueChange={(value) => handleInputChange('result', value as 'profit' | 'loss')}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-input border-border text-foreground capitalize w-full">
                  <SelectValue placeholder="Select result" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="profit" className="bg-emerald-500/10">Profit</SelectItem>
                  <SelectItem value="loss" className="bg-rose-500/10">Loss</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryPrice" className="text-foreground">
                Entry Price
              </Label>
              <Input
                id="entryPrice"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.entryPrice || ''}
                onChange={(e) => handleInputChange('entryPrice', parseFloat(e.target.value) || 0)}
                className="bg-input border-border text-foreground"
                disabled={isLoading}
              />
              {errors.entryPrice && <p className="text-sm text-destructive">{errors.entryPrice}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="exitPrice" className="text-foreground">
                Exit Price
              </Label>
              <Input
                id="exitPrice"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.exitPrice || ''}
                onChange={(e) => handleInputChange('exitPrice', parseFloat(e.target.value) || 0)}
                className="bg-input border-border text-foreground"
                disabled={isLoading}
              />
              {errors.exitPrice && <p className="text-sm text-destructive">{errors.exitPrice}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pnl" className="text-foreground">
                PnL
              </Label>
              <Input
                id="pnl"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.pnl || ''}
                onChange={(e) => handleInputChange('pnl', parseFloat(e.target.value) || 0)}
                className="bg-input border-border text-foreground"
                disabled={isLoading}
              />
              {errors.pnl && <p className="text-sm text-destructive">{errors.pnl}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-foreground">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="bg-input border-border text-foreground"
                disabled={isLoading || !!defaultDate}
              />
              {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-foreground">
                Tags
              </Label>
              <div className="flex gap-2">
                <Input
                  id="tags"
                  placeholder="Add tag"
                  onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleTagAdd(e.currentTarget.value);
                      e.currentTarget.value = '';
                    }
                  }}
                  className="bg-input border-border text-foreground flex-1"
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-accent text-foreground border-border"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="ml-1 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Trade rationale, lessons learned, etc."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="bg-input border-border text-foreground"
              disabled={isLoading}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : trade ? 'Update Trade' : 'Add Trade'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}