'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { tradingPlanService } from '@/lib/store';
import { TradingPlan, TradingPlanFormData } from '@/lib/types';
import TradingPlanModal from '@/components/trading-plans/TradingPlanModal';
import TradingPlanList from '@/components/trading-plans/TradingPlanList';
import DashboardHeader from '../sections/DashboardHeader';
import Footer from '../sections/Footer';

// Default trading plan template
const DEFAULT_TRADING_PLAN_TEMPLATE: Omit<TradingPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'> = {
  name: 'My First Trading Plan',
  description: 'A comprehensive trading plan to maintain discipline and consistency in trading decisions.',
  status: 'active',
  instruments: ['XAUUSD', 'EURUSD', 'GBPUSD', 'BTCUSD'],
  tradingSessions: `• London Session (8:00 AM - 4:00 PM GMT) - Primary focus
• New York Session (1:00 PM - 9:00 PM GMT) - Secondary focus
• Avoid trading during low liquidity periods (late Asian session)
• Stay out of the market 30 minutes before and after major news events (NFP, CPI, FOMC)`,
  entryRules: `✓ TREND CONFIRMATION:
  • Identify trend direction on higher timeframe (H4/Daily)
  • Only trade in direction of the trend (buy in uptrend, sell in downtrend)
  • Use 50 EMA and 200 EMA for trend confirmation

✓ ENTRY TRIGGER:
  • Wait for price to pull back to key support/resistance level
  • Look for price action confirmation (pin bars, engulfing patterns, inside bars)
  • RSI must show momentum alignment (above 50 for buys, below 50 for sells)

✓ RISK-REWARD REQUIREMENT:
  • Minimum 1:2 risk-reward ratio on every trade
  • Entry must allow for logical stop loss placement
  • Take profit level must be at a clear technical level

✓ CHECKLIST (ALL must be true):
  □ Trend direction confirmed on higher timeframe
  □ Price at key support/resistance level
  □ Price action signal present
  □ Risk-reward ratio meets minimum 1:2
  □ No major news events in next 2 hours`,
  exitRules: `✓ TAKE PROFIT STRATEGY:
  • Take 50% profit at first target (1:2 risk-reward)
  • Move stop loss to breakeven after first target hit
  • Let remaining 50% run to second target (1:4 risk-reward)
  • Use trailing stop of 20 pips for remaining position

✓ STOP LOSS PLACEMENT:
  • Place stop loss below/above recent swing high/low
  • Maximum stop loss: 2% of account balance
  • Never move stop loss further away from entry
  • Only move stop loss in favor of the trade

✓ EARLY EXIT CONDITIONS:
  • Exit immediately if trade thesis is invalidated
  • Exit if opposite signal appears on entry timeframe
  • Exit before major news events if still in trade
  • Don't hold losing trades hoping they'll turn around`,
  riskManagement: `💰 POSITION SIZING:
  • Risk maximum 1-2% of account per trade
  • Calculate position size based on stop loss distance
  • Use position size calculator before every trade
  • Never increase position size to "make back" losses

📊 EXPOSURE LIMITS:
  • Maximum 3 open trades at any time
  • Maximum 5% total account risk across all trades
  • No correlated pairs (don't buy EURUSD and sell USDCHF simultaneously)

📉 DAILY/WEEKLY LIMITS:
  • Maximum daily loss: 5% of account
  • Maximum weekly loss: 10% of account
  • Stop trading for the day after 2 consecutive losses
  • Take a break after reaching daily profit target (5%)

🛡️ PROTECTION RULES:
  • Always use stop losses - no exceptions
  • Never add to losing positions (no martingale)
  • Don't trade with money you can't afford to lose
  • Keep leverage below 1:10 for forex, 1:5 for crypto`,
  psychologyRules: `🧠 MENTAL PREPARATION:
  • Get at least 7 hours of sleep before trading day
  • Review trading plan and rules before market open
  • Meditate or do breathing exercises for 5 minutes
  • Set clear intentions for the trading session

😤 EMOTIONAL CONTROL:
  • No trading when feeling emotional (angry, sad, overly excited)
  • Take a 15-minute break after any loss before next trade
  • Don't trade to "prove something" or "get revenge" on the market
  • Accept that losses are part of trading - focus on process, not outcome

📝 JOURNALING:
  • Record every trade in trading journal immediately after closing
  • Note emotional state during each trade
  • Review journal every weekend to identify patterns
  • Screenshot charts for winning and losing trades

⚡ DISCIPLINE RULES:
  • Follow the plan exactly - no improvisation
  • If you break a rule, stop trading for the day
  • Review this trading plan every Sunday
  • Update plan monthly based on performance review`,
};

export default function TradingPlansPage() {
  const router = useRouter();
  const { user, isLoaded, isSignedIn } = useUser();
  const [plans, setPlans] = useState<TradingPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TradingPlan | null>(null);
  const [templateData, setTemplateData] = useState<Omit<TradingPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Redirect to home page if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isLoaded, isSignedIn, router]);

  // Load trading plans
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      loadPlans();
    }
  }, [user, isLoaded, isSignedIn]);

  const loadPlans = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await tradingPlanService.getTradingPlans(user.id);
      setPlans(data);
    } catch (err) {
      console.error('Failed to load trading plans:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNew = () => {
    setEditingPlan(null);
    setTemplateData(null);
    setIsModalOpen(true);
  };

  const handleUseTemplate = () => {
    setEditingPlan(null);
    setTemplateData(DEFAULT_TRADING_PLAN_TEMPLATE);
    setIsModalOpen(true);
  };

  const handleEdit = (plan: TradingPlan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  const handleDelete = async (plan: TradingPlan) => {
    if (!user) return;
    try {
      await tradingPlanService.deleteTradingPlan(user.id, plan.id);
      await loadPlans();
    } catch (err) {
      console.error('Failed to delete trading plan:', err);
    }
  };

  const handleSubmit = async (planData: any) => {
    if (!user) return;
    setIsSaving(true);
    try {
      if (editingPlan) {
        await tradingPlanService.updateTradingPlan(user.id, editingPlan.id, planData);
      } else {
        await tradingPlanService.createTradingPlan(user.id, planData);
      }
      setIsModalOpen(false);
      setEditingPlan(null);
      setTemplateData(null);
      await loadPlans();
    } catch (err) {
      console.error('Failed to save trading plan:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading state while checking authentication
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Return null if not signed in (will redirect via useEffect)
  if (!isSignedIn) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <header className="py-4 border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 py-4 flex flex-col justify-between gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push('/dashboard')}
              className="w-fit text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Trading Plans</h1>
              <p className="text-sm text-muted-foreground">
                Create and manage your trading strategy templates
              </p>
            </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <TradingPlanList
          plans={plans}
          isLoading={isLoading}
          onCreateNew={handleCreateNew}
          onUseTemplate={handleUseTemplate}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </main>

      <TradingPlanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPlan(null);
          setTemplateData(null);
        }}
        onSubmit={handleSubmit}
        plan={editingPlan}
        templateData={templateData}
        isLoading={isSaving}
      />

      <Footer />
    </div>
  );
}