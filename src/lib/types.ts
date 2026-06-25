// Trade interface - treats entryPrice, exitPrice, and pnl as numbers
export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  pnl: number; // Manual PnL - source of truth, not calculated
  direction: 'long' | 'short';
  result: 'profit' | 'loss';
  notes: string;
  tags: string[];
  date: string; // ISO date string (YYYY-MM-DD) - derived from openDateTime or set manually
  openDateTime?: string; // ISO datetime string (YYYY-MM-DDTHH:MM) - when trade was opened
  closeDateTime?: string; // ISO datetime string (YYYY-MM-DDTHH:MM) - when trade was closed
  followedPlan?: boolean; // Whether the trader followed their trading plan
  planId?: string; // Reference to the trading plan used (if followedPlan is true)
  createdAt: string;
  updatedAt: string;
}

// Daily total for calendar display
export interface DailyTotal {
  date: string;
  totalPnl: number;
  tradeCount: number;
  trades: Trade[];
}

// Form data for creating/updating trades
export interface TradeFormData {
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  pnl: number;
  direction: 'long' | 'short';
  result: 'profit' | 'loss';
  notes: string;
  tags: string[];
  date: string; // ISO date string (YYYY-MM-DD) - derived from openDateTime or set manually
  openDateTime?: string; // ISO datetime string (YYYY-MM-DDTHH:MM) - when trade was opened
  closeDateTime?: string; // ISO datetime string (YYYY-MM-DDTHH:MM) - when trade was closed
  followedPlan?: boolean; // Whether the trader followed their trading plan
  planId?: string; // Reference to the trading plan used
}

// User profile type
export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

// Auth state
export interface AuthState {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// Goal/Challenge types
export type GoalStatus = 'active' | 'completed' | 'failed' | 'cancelled';
export type GoalPeriod = 'daily' | 'weekly' | 'monthly' | 'custom';

export interface Goal {
  id: string;
  userId: string;
  title: string;
  description: string;
  targetAmount: number;
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate: string; // ISO date string (YYYY-MM-DD)
  status: GoalStatus;
  period: GoalPeriod;
  actualAmount: number; // Calculated from trades
  createdAt: string;
  updatedAt: string;
}

export interface GoalFormData {
  title: string;
  description: string;
  targetAmount: number;
  startDate: string;
  endDate: string;
  period: GoalPeriod;
}

export interface GoalProgress {
  goal: Goal;
  currentAmount: number;
  percentage: number;
  daysRemaining: number;
  isAchieved: boolean;
  tradeCount: number;
}

// Trading Plan types
export type TradingPlanStatus = 'active' | 'archived';

export interface TradingPlan {
  id: string;
  userId: string;
  name: string;
  description: string;
  
  // Instruments and sessions
  instruments: string[]; // e.g., ['XAUUSD', 'BTCUSD']
  tradingSessions: string; // Description of preferred trading times
  
  // Rules and criteria
  entryRules: string; // Conditions for entering trades
  exitRules: string; // Conditions for exiting trades
  riskManagement: string; // Position sizing, max risk, stop loss rules
  
  // Psychology and discipline
  psychologyRules: string; // Mental state requirements, emotional rules
  
  status: TradingPlanStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TradingPlanFormData {
  name: string;
  description: string;
  instruments: string[];
  tradingSessions: string;
  entryRules: string;
  exitRules: string;
  riskManagement: string;
  psychologyRules: string;
}
