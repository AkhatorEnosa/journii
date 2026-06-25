'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TradingPlan, TradingPlanFormData, TradingPlanStatus } from '@/lib/types';
import { Plus, X } from 'lucide-react';

interface TradingPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<TradingPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  plan?: TradingPlan | null;
  templateData?: Omit<TradingPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'> | null;
  isLoading?: boolean;
}

export default function TradingPlanModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  plan, 
  templateData,
  isLoading = false 
}: TradingPlanModalProps) {
  const [formData, setFormData] = useState<TradingPlanFormData>({
    name: '',
    description: '',
    instruments: [],
    tradingSessions: '',
    entryRules: '',
    exitRules: '',
    riskManagement: '',
    psychologyRules: '',
  });

  const [instrumentInput, setInstrumentInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Update form data when plan prop changes (for editing) or templateData changes
  useEffect(() => {
    if (plan) {
      setFormData({
        name: plan.name || '',
        description: plan.description || '',
        instruments: plan.instruments || [],
        tradingSessions: plan.tradingSessions || '',
        entryRules: plan.entryRules || '',
        exitRules: plan.exitRules || '',
        riskManagement: plan.riskManagement || '',
        psychologyRules: plan.psychologyRules || '',
      });
    } else if (templateData) {
      setFormData({
        name: templateData.name || '',
        description: templateData.description || '',
        instruments: templateData.instruments || [],
        tradingSessions: templateData.tradingSessions || '',
        entryRules: templateData.entryRules || '',
        exitRules: templateData.exitRules || '',
        riskManagement: templateData.riskManagement || '',
        psychologyRules: templateData.psychologyRules || '',
      });
    } else {
      // Reset form for new plan
      setFormData({
        name: '',
        description: '',
        instruments: [],
        tradingSessions: '',
        entryRules: '',
        exitRules: '',
        riskManagement: '',
        psychologyRules: '',
      });
    }
    setErrors({});
  }, [plan, templateData, isOpen]);

  const handleInputChange = (field: keyof TradingPlanFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleInstrumentAdd = () => {
    const instrument = instrumentInput.trim().toUpperCase();
    if (instrument && !formData.instruments.includes(instrument)) {
      handleInputChange('instruments', [...formData.instruments, instrument]);
      setInstrumentInput('');
    }
  };

  const handleInstrumentRemove = (instrumentToRemove: string) => {
    handleInputChange('instruments', formData.instruments.filter(i => i !== instrumentToRemove));
  };

  const handleInstrumentKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInstrumentAdd();
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Plan name is required';
    }

    if (!formData.entryRules.trim()) {
      newErrors.entryRules = 'Entry rules are required';
    }

    if (!formData.exitRules.trim()) {
      newErrors.exitRules = 'Exit rules are required';
    }

    if (!formData.riskManagement.trim()) {
      newErrors.riskManagement = 'Risk management rules are required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const status: TradingPlanStatus = plan?.status || 'active';
    
    onSubmit({
      ...formData,
      status,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-card border-border max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground">
            {plan ? 'Edit Trading Plan' : 'Create New Trading Plan'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {plan 
              ? 'Update your trading plan template' 
              : 'Document your trading strategy and rules to maintain discipline'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Basic Information</h4>
            
            <div className="space-y-2">
              <Label htmlFor="plan-name" className="text-foreground">
                Plan Name *
              </Label>
              <Input
                id="plan-name"
                placeholder="e.g., My Swing Trading Strategy"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="bg-input border-border text-foreground"
                disabled={isLoading}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="plan-description" className="text-foreground">
                Description
              </Label>
              <Textarea
                id="plan-description"
                placeholder="Brief description of this trading plan..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="bg-input border-border text-foreground"
                disabled={isLoading}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground">Instruments / Pairs</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g., XAUUSD, BTCUSD"
                  value={instrumentInput}
                  onChange={(e) => setInstrumentInput(e.target.value)}
                  onKeyDown={handleInstrumentKeyDown}
                  className="bg-input border-border text-foreground uppercase flex-1"
                  disabled={isLoading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleInstrumentAdd}
                  disabled={isLoading || !instrumentInput.trim()}
                  className="border-border"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.instruments.map((instrument) => (
                  <span
                    key={instrument}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-accent text-foreground rounded-full text-sm border border-border"
                  >
                    {instrument}
                    <button
                      type="button"
                      onClick={() => handleInstrumentRemove(instrument)}
                      className="text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="trading-sessions" className="text-foreground">
                Preferred Trading Sessions
              </Label>
              <Textarea
                id="trading-sessions"
                placeholder="e.g., London session (8am-4pm GMT), avoid news events..."
                value={formData.tradingSessions}
                onChange={(e) => handleInputChange('tradingSessions', e.target.value)}
                className="bg-input border-border text-foreground"
                disabled={isLoading}
                rows={2}
              />
            </div>
          </div>

          {/* Trading Rules */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Trading Rules</h4>
            
            <div className="space-y-2">
              <Label htmlFor="entry-rules" className="text-foreground">
                Entry Rules *
              </Label>
              <Textarea
                id="entry-rules"
                placeholder="• Specific conditions that must be met before entering a trade&#10;• Technical indicators or patterns to look for&#10;• Timeframe requirements..."
                value={formData.entryRules}
                onChange={(e) => handleInputChange('entryRules', e.target.value)}
                className="bg-input border-border text-foreground font-mono text-sm"
                disabled={isLoading}
                rows={4}
              />
              {errors.entryRules && <p className="text-sm text-destructive">{errors.entryRules}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="exit-rules" className="text-foreground">
                Exit Rules *
              </Label>
              <Textarea
                id="exit-rules"
                placeholder="• Take profit conditions&#10;• Stop loss placement rules&#10;• Trailing stop guidelines..."
                value={formData.exitRules}
                onChange={(e) => handleInputChange('exitRules', e.target.value)}
                className="bg-input border-border text-foreground font-mono text-sm"
                disabled={isLoading}
                rows={4}
              />
              {errors.exitRules && <p className="text-sm text-destructive">{errors.exitRules}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="risk-management" className="text-foreground">
                Risk Management Rules *
              </Label>
              <Textarea
                id="risk-management"
                placeholder="• Maximum risk per trade (e.g., 1-2% of account)&#10;• Position sizing methodology&#10;• Maximum number of open trades..."
                value={formData.riskManagement}
                onChange={(e) => handleInputChange('riskManagement', e.target.value)}
                className="bg-input border-border text-foreground font-mono text-sm"
                disabled={isLoading}
                rows={4}
              />
              {errors.riskManagement && <p className="text-sm text-destructive">{errors.riskManagement}</p>}
            </div>
          </div>

          {/* Psychology */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-foreground">Psychology & Discipline</h4>
            
            <div className="space-y-2">
              <Label htmlFor="psychology-rules" className="text-foreground">
                Psychology Rules
              </Label>
              <Textarea
                id="psychology-rules"
                placeholder="• Mental state requirements before trading&#10;• Rules to prevent emotional trading&#10;• What to do after a loss/win..."
                value={formData.psychologyRules}
                onChange={(e) => handleInputChange('psychologyRules', e.target.value)}
                className="bg-input border-border text-foreground font-mono text-sm"
                disabled={isLoading}
                rows={4}
              />
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
              {isLoading ? 'Saving...' : plan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}