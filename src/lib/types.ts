// Trade interface - treats entryPrice, exitPrice, and pnl as numbers
export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  entryPrice: number;
  exitPrice: number;
  pnl: number; // Manual PnL - source of truth, not calculated
  direction: 'long' | 'short';
  notes: string;
  tags: string[];
  date: string; // ISO date string (YYYY-MM-DD)
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
  notes: string;
  tags: string[];
  date: string;
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