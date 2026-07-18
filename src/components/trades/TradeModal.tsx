'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { TradeFormData, TradingPlan } from '@/lib/types';
import { ChevronDown, ChevronUp, Clock, Target, Loader2 } from 'lucide-react';
import { tradingPlanService } from '@/lib/store';
import { useUser } from '@clerk/nextjs';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TradeFormData) => void;
  trade?: TradeFormData;
  isLoading?: boolean;
  defaultDate?: string;
}

// Hook to get active trading plans for the user
function useActiveTradingPlans() {
  const { user } = useUser();
  const [plans, setPlans] = useState<TradingPlan[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = useState(false);

  useEffect(() => {
    if (user) {
      setIsLoadingPlans(true);
      tradingPlanService.getActiveTradingPlans(user.id)
        .then(setPlans)
        .catch(console.error)
        .finally(() => setIsLoadingPlans(false));
    } else {
      setPlans([]);
    }
  }, [user]);

  return { plans, isLoadingPlans };
}

// Helper function to format datetime for datetime-local input
const formatDateTimeForInput = (datetime: string | undefined): string => {
  if (!datetime) return '';
  const date = new Date(datetime);
  if (isNaN(date.getTime())) return ''; // Invalid date
  
  // Format as YYYY-MM-DDTHH:mm
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function TradeModal({ isOpen, onClose, onSubmit, trade, isLoading = false, defaultDate }: TradeModalProps) {
  const { plans, isLoadingPlans } = useActiveTradingPlans();
  
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
    openDateTime: trade?.openDateTime || '',
    closeDateTime: trade?.closeDateTime || '',
    followedPlan: trade?.followedPlan,
    planId: trade?.planId,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Update form data when trade prop changes (for editing)
  useEffect(() => {
    if (trade) {
      setFormData({
        symbol: trade?.symbol || '',
        entryPrice: trade.entryPrice || 0,
        exitPrice: trade.exitPrice || 0,
        pnl: trade.pnl || 0,
        direction: trade.direction || 'long',
        result: trade.result || (trade.pnl !== undefined && trade.pnl < 0 ? 'loss' : 'profit'),
        notes: trade.notes || '',
        tags: trade.tags || [],
        date: trade.date || new Date().toISOString().split('T')[0],
        openDateTime: formatDateTimeForInput(trade.openDateTime),
        closeDateTime: formatDateTimeForInput(trade.closeDateTime),
        followedPlan: trade.followedPlan,
        planId: trade.planId,
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
        openDateTime: '',
        closeDateTime: '',
        followedPlan: undefined,
        planId: undefined,
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

      // Validate that date matches openDateTime if provided
      if (formData.openDateTime) {
        const openDate = formData.openDateTime.split('T')[0];
        if (openDate !== formData.date) {
          newErrors.date = 'Date must match the open date/time';
        }
      }
      // Note: closeDateTime can be on a different day (for trades spanning multiple days)

      // Validate that close datetime is after open datetime
      if (formData.openDateTime && formData.closeDateTime) {
        const openDt = new Date(formData.openDateTime);
        const closeDt = new Date(formData.closeDateTime);
        if (closeDt <= openDt) {
          newErrors.closeDateTime = 'Close date/time must be after open date/time';
        }
        
        // Validate minimum trade duration (1 minute)
        const diffMs = closeDt.getTime() - openDt.getTime();
        const diffMinutes = diffMs / 60000;
        if (diffMinutes < 1) {
          newErrors.closeDateTime = 'Trade duration must be at least 1 minute';
        }
      }

      // Validate that open datetime is not in the future
      if (formData.openDateTime) {
        const openDt = new Date(formData.openDateTime);
        if (openDt > new Date()) {
          newErrors.openDateTime = 'Open date/time cannot be in the future';
        }
      }

      // Validate that close datetime is not in the future
      if (formData.closeDateTime) {
        const closeDt = new Date(formData.closeDateTime);
        if (closeDt > new Date()) {
          newErrors.closeDateTime = 'Close date/time cannot be in the future';
        }
      }
    }

    // Validate tags limit (maximum 10)
    if (formData.tags && formData.tags.length > 10) {
      newErrors.tags = 'Maximum 10 tags allowed';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || isLoading) {
      return;
    }

    // Convert symbol to lowercase before submitting
    const dataWithLowercaseSymbol = {
      ...formData,
      symbol: formData.symbol.toLowerCase(),
    };

    onSubmit(dataWithLowercaseSymbol);
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
      <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {trade ? 'Edit Trade' : 'Add New Trade'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Record your trade details to track your performance
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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

          {/* Advanced Section Toggle */}
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-sm text-muted-foreground hover:text-foreground"
              disabled={isLoading}
            >
              {showAdvanced ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-1" />
                  Hide Advanced Options
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Show Advanced Options
                </>
              )}
            </Button>
          </div>

          {/* Advanced Section */}
          {showAdvanced && (
            <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-dashed border-blue-500">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Trade Timing</span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="openDateTime" className="text-foreground text-sm">
                    Open Date & Time
                  </Label>
                  <Input
                    id="openDateTime"
                    type="datetime-local"
                    value={formData.openDateTime || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleInputChange('openDateTime', value);
                      // Auto-update date field from openDateTime
                      if (value) {
                        const datePart = value.split('T')[0];
                        handleInputChange('date', datePart);
                      }
                    }}
                    className="bg-input border-border text-foreground text-sm"
                    disabled={isLoading}
                  />
                  {errors.openDateTime && <p className="text-sm text-destructive">{errors.openDateTime}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="closeDateTime" className="text-foreground text-sm">
                    Close Date & Time
                  </Label>
                  <Input
                    id="closeDateTime"
                    type="datetime-local"
                    value={formData.closeDateTime || ''}
                    onChange={(e) => handleInputChange('closeDateTime', e.target.value)}
                    className="bg-input border-border text-foreground text-sm"
                    disabled={isLoading}
                  />
                  {errors.closeDateTime && <p className="text-sm text-destructive">{errors.closeDateTime}</p>}
                </div>
              </div>
              
              {formData.openDateTime && formData.closeDateTime && (
                <div className="text-xs text-muted-foreground">
                  Holding period: {(() => {
                    const open = new Date(formData.openDateTime!);
                    const close = new Date(formData.closeDateTime!);
                    const diffMs = close.getTime() - open.getTime();
                    const diffMins = Math.floor(diffMs / 60000);
                    const hours = Math.floor(diffMins / 60);
                    const mins = diffMins % 60;
                    if (hours > 0) {
                      return `${hours}h ${mins}m`;
                    }
                    return `${mins}m`;
                  })()}
                </div>
              )}
            </div>
          )}

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
                max={new Date().toISOString().split('T')[0]}
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

          {/* Trading Plan Compliance Section */}
          <div className="space-y-4 p-4 rounded-lg bg-muted/30 border border-border">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Trading Plan Compliance</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="followedPlan" className="text-foreground text-sm">
                  Followed Trading Plan?
                </Label>
                <Select
                  value={formData.followedPlan !== undefined ? (formData.followedPlan ? 'yes' : 'no') : ''}
                  onValueChange={(value) => {
                    const followedPlan = value === 'yes' ? true : (value === 'no' ? false : undefined);
                    handleInputChange('followedPlan', followedPlan);
                    // Clear planId if they didn't follow a plan
                    if (followedPlan !== true) {
                      handleInputChange('planId', undefined);
                    }
                  }}
                  disabled={isLoading || isLoadingPlans}
                >
                  <SelectTrigger className="bg-input border-border text-foreground w-full">
                    <SelectValue placeholder="Select...">
                      {formData.followedPlan === true ? 'Yes' : formData.followedPlan === false ? 'No' : 'Select...'}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.followedPlan === true && plans.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="planId" className="text-foreground text-sm">
                    Which Plan?
                  </Label>
                  <Select
                    value={formData.planId || ''}
                    onValueChange={(value) => handleInputChange('planId', value)}
                    disabled={isLoading || isLoadingPlans}
                  >
                    <SelectTrigger className="bg-input border-border text-foreground w-full">
                      <SelectValue placeholder="Select plan...">
                        {(() => {
                          const selectedPlan = plans.find(p => p.id === formData.planId);
                          return selectedPlan ? selectedPlan.name : 'Select plan...';
                        })()}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
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
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                trade ? 'Update Trade' : 'Add Trade'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}