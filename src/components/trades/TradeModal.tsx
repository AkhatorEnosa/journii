'use client';

import { useState } from 'react';
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
}

export default function TradeModal({ isOpen, onClose, onSubmit, trade, isLoading = false }: TradeModalProps) {
  const [formData, setFormData] = useState<TradeFormData>({
    symbol: trade?.symbol || '',
    entryPrice: trade?.entryPrice || 0,
    exitPrice: trade?.exitPrice || 0,
    pnl: trade?.pnl || 0,
    direction: trade?.direction || 'long',
    notes: trade?.notes || '',
    tags: trade?.tags || [],
    date: trade?.date || new Date().toISOString().split('T')[0],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [previewPnL, setPreviewPnL] = useState<number | null>(null);

  const calculatePnL = (entry: number, exit: number, direction: 'long' | 'short') => {
    if (!entry || !exit) return 0;
    return direction === 'long' ? exit - entry : entry - exit;
  };

  const handleInputChange = (field: keyof TradeFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Calculate PnL preview if entry/exit/direction changes
    if (field === 'entryPrice' || field === 'exitPrice' || field === 'direction') {
      const newEntry = field === 'entryPrice' ? value : formData.entryPrice;
      const newExit = field === 'exitPrice' ? value : formData.exitPrice;
      const newDirection = field === 'direction' ? value : formData.direction;
      setPreviewPnL(calculatePnL(newEntry, newExit, newDirection));
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
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
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
      <DialogContent className="sm:max-w-lg bg-slate-900 border-slate-800">
        <DialogHeader>
          <DialogTitle className="text-slate-100">
            {trade ? 'Edit Trade' : 'Add New Trade'}
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Record your trade details to track your performance
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol" className="text-slate-300">
                Symbol
              </Label>
              <Input
                id="symbol"
                placeholder="e.g., AAPL, BTC-USD"
                value={formData.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-100"
                disabled={isLoading}
              />
              {errors.symbol && <p className="text-sm text-rose-400">{errors.symbol}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="direction" className="text-slate-300">
                Direction
              </Label>
              <Select
                value={formData.direction}
                onValueChange={(value) => handleInputChange('direction', value as 'long' | 'short')}
                disabled={isLoading}
              >
                <SelectTrigger className="bg-slate-800 border-slate-700 text-slate-100">
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-800">
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entryPrice" className="text-slate-300">
                Entry Price
              </Label>
              <Input
                id="entryPrice"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.entryPrice || ''}
                onChange={(e) => handleInputChange('entryPrice', parseFloat(e.target.value) || 0)}
                className="bg-slate-800 border-slate-700 text-slate-100"
                disabled={isLoading}
              />
              {errors.entryPrice && <p className="text-sm text-rose-400">{errors.entryPrice}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="exitPrice" className="text-slate-300">
                Exit Price
              </Label>
              <Input
                id="exitPrice"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.exitPrice || ''}
                onChange={(e) => handleInputChange('exitPrice', parseFloat(e.target.value) || 0)}
                className="bg-slate-800 border-slate-700 text-slate-100"
                disabled={isLoading}
              />
              {errors.exitPrice && <p className="text-sm text-rose-400">{errors.exitPrice}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="pnl" className="text-slate-300">
                PnL
              </Label>
              <Input
                id="pnl"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.pnl || ''}
                onChange={(e) => handleInputChange('pnl', parseFloat(e.target.value) || 0)}
                className="bg-slate-800 border-slate-700 text-slate-100"
                disabled={isLoading}
              />
              {errors.pnl && <p className="text-sm text-rose-400">{errors.pnl}</p>}
            </div>
          </div>

          {/* PnL Preview */}
          {previewPnL !== null && (
            <div className={`p-3 rounded-lg border ${getPnLBorderColor(previewPnL)} ${getPnLBgColor(previewPnL)}`}>
              <p className="text-sm text-slate-300 mb-1">Calculated PnL:</p>
              <p className={`text-lg font-semibold ${getPnLColor(previewPnL)}`}>
                {formatPnL(previewPnL)}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="text-slate-300">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleInputChange('date', e.target.value)}
                className="bg-slate-800 border-slate-700 text-slate-100"
                disabled={isLoading}
              />
              {errors.date && <p className="text-sm text-rose-400">{errors.date}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="tags" className="text-slate-300">
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
                  className="bg-slate-800 border-slate-700 text-slate-100 flex-1"
                  disabled={isLoading}
                />
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="bg-slate-800 text-slate-300 border-slate-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleTagRemove(tag)}
                      className="ml-1 text-slate-400 hover:text-slate-200"
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
            <Label htmlFor="notes" className="text-slate-300">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Trade rationale, lessons learned, etc."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="bg-slate-800 border-slate-700 text-slate-100"
              disabled={isLoading}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-slate-300 hover:text-slate-100"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
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