'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { GoalFormData, GoalPeriod } from '@/lib/types';

interface GoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GoalFormData) => void;
  isLoading?: boolean;
  defaultEndDate?: string;
}

export default function GoalModal({ isOpen, onClose, onSubmit, isLoading = false, defaultEndDate }: GoalModalProps) {
  const today = new Date().toISOString().split('T')[0];
  const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [formData, setFormData] = useState<GoalFormData>({
    title: '',
    description: '',
    targetAmount: 0,
    startDate: today,
    endDate: defaultEndDate || nextWeek,
    period: 'weekly',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        description: '',
        targetAmount: 0,
        startDate: today,
        endDate: defaultEndDate || nextWeek,
        period: 'weekly',
      });
      setErrors({});
    }
  }, [isOpen, defaultEndDate]);

  const handleInputChange = (field: keyof GoalFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Goal title is required';
    }

    if (!formData.targetAmount || formData.targetAmount <= 0) {
      newErrors.targetAmount = 'Target amount must be greater than 0';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    } else if (new Date(formData.endDate) < new Date(formData.startDate)) {
      newErrors.endDate = 'End date must be after start date';
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

  const handlePeriodChange = (value: string | null) => {
    if (!value) return;
    const period = value as GoalPeriod;
    const startDate = new Date(formData.startDate);
    let endDate = new Date(startDate);

    switch (period) {
      case 'daily':
        endDate.setDate(endDate.getDate() + 1);
        break;
      case 'weekly':
        endDate.setDate(endDate.getDate() + 7);
        break;
      case 'monthly':
        endDate.setMonth(endDate.getMonth() + 1);
        break;
      case 'custom':
        // Keep the current end date
        handleInputChange('period', period);
        return;
    }

    handleInputChange('period', period);
    handleInputChange('endDate', endDate.toISOString().split('T')[0]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Create New Goal</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Set a trading goal to challenge yourself and track your progress
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground">
              Goal Title
            </Label>
            <Input
              id="title"
              placeholder="e.g., Weekly $1000 Challenge"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="bg-input border-border text-foreground"
              disabled={isLoading}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Add notes about your goal..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="bg-input border-border text-foreground"
              disabled={isLoading}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="targetAmount" className="text-foreground">
              Target Amount ($)
            </Label>
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.targetAmount || ''}
              onChange={(e) => handleInputChange('targetAmount', parseFloat(e.target.value) || 0)}
              className="bg-input border-border text-foreground"
              disabled={isLoading}
            />
            {errors.targetAmount && <p className="text-sm text-destructive">{errors.targetAmount}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="period" className="text-foreground">
              Goal Period
            </Label>
            <Select
              value={formData.period}
              onValueChange={handlePeriodChange}
              disabled={isLoading}
            >
              <SelectTrigger className="bg-input border-border text-foreground capitalize w-full">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-foreground">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                className="bg-input border-border text-foreground"
                disabled={isLoading}
              />
              {errors.startDate && <p className="text-sm text-destructive">{errors.startDate}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-foreground">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
                className="bg-input border-border text-foreground"
                disabled={isLoading || formData.period !== 'custom'}
              />
              {errors.endDate && <p className="text-sm text-destructive">{errors.endDate}</p>}
            </div>
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
              {isLoading ? 'Creating...' : 'Create Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}