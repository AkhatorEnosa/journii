'use client';

import { Trade, TradeFormData, DailyTotal, Goal, GoalFormData, GoalStatus, GoalProgress } from './types';
import { generateId } from './utils';
import { supabase, isSupabaseConfigured } from './supabase/client';

// Local storage keys
const STORAGE_KEYS = {
  TRADES: 'journii_trades',
  GOALS: 'journii_goals',
  USER: 'journii_user',
};

// Trade service interface for easy swapping to Supabase
interface ITradeService {
  getTrades(userId: string): Promise<Trade[]>;
  getTradesByDate(userId: string, date: string): Promise<Trade[]>;
  getTradesByTimeRange(userId: string, startDate: string, endDate: string): Promise<Trade[]>;
  createTrade(userId: string, trade: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>): Promise<Trade>;
  updateTrade(userId: string, tradeId: string, updates: Partial<TradeFormData>): Promise<Trade>;
  deleteTrade(userId: string, tradeId: string): Promise<void>;
  getDailyTotals(userId: string, year: number, month: number): Promise<DailyTotal[]>;
}

// Supabase implementation
class SupabaseTradeService implements ITradeService {
  async getTrades(userId: string): Promise<Trade[]> {
    if (!supabase) throw new Error('Supabase is not configured');

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(this.mapSupabaseTradeToTrade);
  }

  async getTradesByDate(userId: string, date: string): Promise<Trade[]> {
    if (!supabase) throw new Error('Supabase is not configured');

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .eq('date', date)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(this.mapSupabaseTradeToTrade);
  }

  async getTradesByTimeRange(userId: string, startDate: string, endDate: string): Promise<Trade[]> {
    if (!supabase) throw new Error('Supabase is not configured');

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;

    return data.map(this.mapSupabaseTradeToTrade);
  }

  async createTrade(
    userId: string,
    tradeData: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Trade> {
    if (!supabase) throw new Error('Supabase is not configured');

    const tradeToInsert = {
      user_id: userId,
      symbol: tradeData.symbol,
      entry_price: tradeData.entryPrice,
      exit_price: tradeData.exitPrice,
      pnl: tradeData.pnl,
      direction: tradeData.direction,
      result: tradeData.result,
      notes: tradeData.notes,
      tags: tradeData.tags,
      date: tradeData.date,
    };

    const { data, error } = await supabase
      .from('trades')
      .insert([tradeToInsert])
      .select()
      .single();

    if (error) throw error;

    return this.mapSupabaseTradeToTrade(data);
  }

  async updateTrade(
    userId: string,
    tradeId: string,
    updates: Partial<TradeFormData>
  ): Promise<Trade> {
    if (!supabase) throw new Error('Supabase is not configured');

    const updateData: any = {};
    if (updates.symbol !== undefined) updateData.symbol = updates.symbol;
    if (updates.entryPrice !== undefined) updateData.entry_price = updates.entryPrice;
    if (updates.exitPrice !== undefined) updateData.exit_price = updates.exitPrice;
    if (updates.pnl !== undefined) updateData.pnl = updates.pnl;
    if (updates.direction !== undefined) updateData.direction = updates.direction;
    if (updates.result !== undefined) updateData.result = updates.result;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.tags !== undefined) updateData.tags = updates.tags;
    if (updates.date !== undefined) updateData.date = updates.date;

    const { data, error } = await supabase
      .from('trades')
      .update(updateData)
      .eq('id', tradeId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return this.mapSupabaseTradeToTrade(data);
  }

  async deleteTrade(userId: string, tradeId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase is not configured');

    const { error } = await supabase
      .from('trades')
      .delete()
      .eq('id', tradeId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async getDailyTotals(userId: string, year: number, month: number): Promise<DailyTotal[]> {
    if (!supabase) throw new Error('Supabase is not configured');

    // Get all trades for the user in the specified year and month
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 2).padStart(2, '0')}-01`;

    console.log('[Supabase] getDailyTotals:', { userId, year, month, startDate, endDate });

    // First, let's check if there are ANY trades for this user (diagnostic)
    const { data: allUserTrades, error: allTradesError } = await supabase
      .from('trades')
      .select('id, user_id, date')
      .eq('user_id', userId)
      .limit(5);

    if (allTradesError) {
      console.error('[Supabase] Diagnostic - Error fetching all trades:', allTradesError);
    } else {
      console.log('[Supabase] Diagnostic - User has', allUserTrades?.length || 0, 'trades total');
      if (allUserTrades && allUserTrades.length > 0) {
        console.log('[Supabase] Diagnostic - Sample trades:', allUserTrades.slice(0, 3));
      }
    }

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lt('date', endDate)
      .order('date', { ascending: false });

    if (error) {
      console.error('[Supabase] getDailyTotals error:', error);
      throw error;
    }

    console.log('[Supabase] getDailyTotals raw data:', data);
    console.log('[Supabase] getDailyTotals raw data count:', data?.length || 0);

    if (!data || data.length === 0) {
      console.log('[Supabase] getDailyTotals: No trades found for this month');
      return [];
    }

    const trades = data.map(this.mapSupabaseTradeToTrade);
    const dailyMap = new Map<string, Trade[]>();

    trades.forEach((trade) => {
      // Normalize date to YYYY-MM-DD format for consistent matching
      const normalizedDate = trade.date;
      if (!dailyMap.has(normalizedDate)) {
        dailyMap.set(normalizedDate, []);
      }
      dailyMap.get(normalizedDate)!.push(trade);
    });

    const dailyTotals: DailyTotal[] = [];
    dailyMap.forEach((trades, date) => {
      const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
      dailyTotals.push({
        date,
        totalPnl,
        tradeCount: trades.length,
        trades,
      });
    });

    console.log('[Supabase] getDailyTotals result:', dailyTotals);
    return dailyTotals;
  }

  private mapSupabaseTradeToTrade(supabaseTrade: any): Trade {
    // Handle tags - could be null, undefined, or an array
    let tags: string[] = [];
    if (supabaseTrade.tags) {
      if (Array.isArray(supabaseTrade.tags)) {
        tags = supabaseTrade.tags.filter((t: string | null) => t != null);
      } else if (typeof supabaseTrade.tags === 'string') {
        // Handle case where tags might be a string representation
        try {
          const parsed = JSON.parse(supabaseTrade.tags);
          tags = Array.isArray(parsed) ? parsed.filter((t: string | null) => t != null) : [];
        } catch {
          tags = [];
        }
      }
    }

    return {
      id: supabaseTrade.id,
      userId: supabaseTrade.user_id,
      symbol: supabaseTrade.symbol,
      entryPrice: Number(supabaseTrade.entry_price),
      exitPrice: Number(supabaseTrade.exit_price),
      pnl: Number(supabaseTrade.pnl),
      direction: supabaseTrade.direction as 'long' | 'short',
      notes: supabaseTrade.notes || '',
      tags: tags,
      result: supabaseTrade.result ?? null,
      date: supabaseTrade.date,
      createdAt: supabaseTrade.created_at,
      updatedAt: supabaseTrade.updated_at,
    };
  }
}

// Local storage implementation
class LocalTradeService implements ITradeService {
  private getStoredTrades(): Trade[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.TRADES);
    return stored ? JSON.parse(stored) : [];
  }

  private saveTrades(trades: Trade[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TRADES, JSON.stringify(trades));
  }

  async getTrades(userId: string): Promise<Trade[]> {
    const trades = this.getStoredTrades();
    return trades.filter((t) => t.userId === userId);
  }

  async getTradesByDate(userId: string, date: string): Promise<Trade[]> {
    const trades = await this.getTrades(userId);
    return trades.filter((t) => t.date === date);
  }

  async getTradesByTimeRange(userId: string, startDate: string, endDate: string): Promise<Trade[]> {
    const trades = await this.getTrades(userId);
    return trades.filter((t) => t.date >= startDate && t.date <= endDate);
  }

  async createTrade(
    userId: string,
    tradeData: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Trade> {
    const trades = this.getStoredTrades();
    const newTrade: Trade = {
      ...tradeData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    trades.push(newTrade);
    this.saveTrades(trades);
    return newTrade;
  }

  async updateTrade(
    userId: string,
    tradeId: string,
    updates: Partial<TradeFormData>
  ): Promise<Trade> {
    const trades = this.getStoredTrades();
    const index = trades.findIndex((t) => t.id === tradeId && t.userId === userId);
    if (index === -1) throw new Error('Trade not found');

    trades[index] = {
      ...trades[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveTrades(trades);
    return trades[index];
  }

  async deleteTrade(userId: string, tradeId: string): Promise<void> {
    const trades = this.getStoredTrades();
    const filtered = trades.filter((t) => !(t.id === tradeId && t.userId === userId));
    this.saveTrades(filtered);
  }

  async getDailyTotals(userId: string, year: number, month: number): Promise<DailyTotal[]> {
    const trades = await this.getTrades(userId);
    const dailyMap = new Map<string, Trade[]>();

    trades.forEach((trade) => {
      const tradeDate = new Date(trade.date);
      if (tradeDate.getFullYear() === year && tradeDate.getMonth() === month) {
        const dateKey = trade.date;
        if (!dailyMap.has(dateKey)) {
          dailyMap.set(dateKey, []);
        }
        dailyMap.get(dateKey)!.push(trade);
      }
    });

    const dailyTotals: DailyTotal[] = [];
    dailyMap.forEach((trades, date) => {
      const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
      dailyTotals.push({
        date,
        totalPnl,
        tradeCount: trades.length,
        trades,
      });
    });

    return dailyTotals;
  }
}

// Export singleton instance - uses Supabase if configured, otherwise falls back to local storage
export const tradeService: ITradeService = isSupabaseConfigured
  ? new SupabaseTradeService()
  : new LocalTradeService();

// Export function to check if Supabase is being used
export const isUsingSupabase = () => isSupabaseConfigured;

// Auth storage helpers
export const authStorage = {
  getUser: (): { id: string; email: string } | null => {
    if (typeof window === 'undefined') return null;
    const stored = localStorage.getItem(STORAGE_KEYS.USER);
    return stored ? JSON.parse(stored) : null;
  },

  setUser: (user: { id: string; email: string }): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  removeUser: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEYS.USER);
  },
};

// Goal service interface
interface IGoalService {
  getGoals(userId: string): Promise<Goal[]>;
  getActiveGoals(userId: string): Promise<Goal[]>;
  getGoal(userId: string, goalId: string): Promise<Goal | null>;
  createGoal(userId: string, goal: Omit<Goal, 'id' | 'userId' | 'actualAmount' | 'createdAt' | 'updatedAt'>): Promise<Goal>;
  updateGoal(userId: string, goalId: string, updates: Partial<GoalFormData> | Partial<Pick<Goal, 'status'>>): Promise<Goal>;
  deleteGoal(userId: string, goalId: string): Promise<void>;
  getGoalProgress(userId: string, goal: Goal, trades: Trade[]): GoalProgress;
  updateGoalStatuses(userId: string): Promise<void>;
}

// Supabase goal service implementation
class SupabaseGoalService implements IGoalService {
  async getGoals(userId: string): Promise<Goal[]> {
    if (!supabase) throw new Error('Supabase is not configured');

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(this.mapSupabaseGoalToGoal);
  }

  async getActiveGoals(userId: string): Promise<Goal[]> {
    if (!supabase) throw new Error('Supabase is not configured');

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(this.mapSupabaseGoalToGoal);
  }

  async getGoal(userId: string, goalId: string): Promise<Goal | null> {
    if (!supabase) throw new Error('Supabase is not configured');

    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return this.mapSupabaseGoalToGoal(data);
  }

  async createGoal(
    userId: string,
    goalData: Omit<Goal, 'id' | 'userId' | 'actualAmount' | 'createdAt' | 'updatedAt'>
  ): Promise<Goal> {
    if (!supabase) throw new Error('Supabase is not configured');

    const goalToInsert = {
      user_id: userId,
      title: goalData.title,
      description: goalData.description,
      target_amount: goalData.targetAmount,
      start_date: goalData.startDate,
      end_date: goalData.endDate,
      status: goalData.status,
      period: goalData.period,
      actual_amount: 0,
    };

    const { data, error } = await supabase
      .from('goals')
      .insert([goalToInsert])
      .select()
      .single();

    if (error) throw error;

    return this.mapSupabaseGoalToGoal(data);
  }

  async updateGoal(
    userId: string,
    goalId: string,
    updates: Partial<GoalFormData> | Partial<Pick<Goal, 'status'>>
  ): Promise<Goal> {
    if (!supabase) throw new Error('Supabase is not configured');

    const updateData: any = {};
    if ('title' in updates && updates.title !== undefined) updateData.title = updates.title;
    if ('description' in updates && updates.description !== undefined) updateData.description = updates.description;
    if ('targetAmount' in updates && updates.targetAmount !== undefined) updateData.target_amount = updates.targetAmount;
    if ('startDate' in updates && updates.startDate !== undefined) updateData.start_date = updates.startDate;
    if ('endDate' in updates && updates.endDate !== undefined) updateData.end_date = updates.endDate;
    if ('period' in updates && updates.period !== undefined) updateData.period = updates.period;
    if ('status' in updates && updates.status !== undefined) updateData.status = updates.status;

    const { data, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', goalId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return this.mapSupabaseGoalToGoal(data);
  }

  async deleteGoal(userId: string, goalId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase is not configured');

    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  getGoalProgress(userId: string, goal: Goal, trades: Trade[]): GoalProgress {
    // Filter trades within the goal's date range
    const goalTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      const startDate = new Date(goal.startDate);
      const endDate = new Date(goal.endDate);
      return tradeDate >= startDate && tradeDate <= endDate;
    });

    const currentAmount = goalTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const percentage = goal.targetAmount !== 0 ? (currentAmount / goal.targetAmount) * 100 : 0;
    const daysRemaining = Math.max(0, Math.ceil((new Date(goal.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
    const isAchieved = currentAmount >= goal.targetAmount;

    return {
      goal,
      currentAmount,
      percentage: Math.min(100, Math.max(0, percentage)),
      daysRemaining,
      isAchieved,
      tradeCount: goalTrades.length,
    };
  }

  async updateGoalStatuses(userId: string): Promise<void> {
    const goals = await this.getGoals(userId);
    const now = new Date();

    for (const goal of goals) {
      if (goal.status === 'active') {
        const endDate = new Date(goal.endDate);
        if (endDate < now) {
          // Goal period has ended, update status based on achievement
          const trades = await new SupabaseTradeService().getTrades(userId);
          const progress = this.getGoalProgress(userId, goal, trades);
          const newStatus: GoalStatus = progress.isAchieved ? 'completed' : 'failed';
          await this.updateGoal(userId, goal.id, { status: newStatus });
        }
      }
    }
  }

  private mapSupabaseGoalToGoal(supabaseGoal: any): Goal {
    return {
      id: supabaseGoal.id,
      userId: supabaseGoal.user_id,
      title: supabaseGoal.title,
      description: supabaseGoal.description || '',
      targetAmount: Number(supabaseGoal.target_amount),
      startDate: supabaseGoal.start_date,
      endDate: supabaseGoal.end_date,
      status: supabaseGoal.status as GoalStatus,
      period: supabaseGoal.period as 'daily' | 'weekly' | 'monthly' | 'custom',
      actualAmount: Number(supabaseGoal.actual_amount || 0),
      createdAt: supabaseGoal.created_at,
      updatedAt: supabaseGoal.updated_at,
    };
  }
}

// Local storage goal service implementation
class LocalGoalService implements IGoalService {
  private getStoredGoals(): Goal[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.GOALS);
    return stored ? JSON.parse(stored) : [];
  }

  private saveGoals(goals: Goal[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(goals));
  }

  async getGoals(userId: string): Promise<Goal[]> {
    const goals = this.getStoredGoals();
    return goals.filter((g) => g.userId === userId);
  }

  async getActiveGoals(userId: string): Promise<Goal[]> {
    const goals = await this.getGoals(userId);
    return goals.filter((g) => g.status === 'active');
  }

  async getGoal(userId: string, goalId: string): Promise<Goal | null> {
    const goals = await this.getGoals(userId);
    return goals.find((g) => g.id === goalId) || null;
  }

  async createGoal(
    userId: string,
    goalData: Omit<Goal, 'id' | 'userId' | 'actualAmount' | 'createdAt' | 'updatedAt'>
  ): Promise<Goal> {
    const goals = this.getStoredGoals();
    const newGoal: Goal = {
      ...goalData,
      id: generateId(),
      userId,
      actualAmount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    goals.push(newGoal);
    this.saveGoals(goals);
    return newGoal;
  }

  async updateGoal(
    userId: string,
    goalId: string,
    updates: Partial<GoalFormData> | Partial<Pick<Goal, 'status'>>
  ): Promise<Goal> {
    const goals = this.getStoredGoals();
    const index = goals.findIndex((g) => g.id === goalId && g.userId === userId);
    if (index === -1) throw new Error('Goal not found');

    goals[index] = {
      ...goals[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveGoals(goals);
    return goals[index];
  }

  async deleteGoal(userId: string, goalId: string): Promise<void> {
    const goals = this.getStoredGoals();
    const filtered = goals.filter((g) => !(g.id === goalId && g.userId === userId));
    this.saveGoals(filtered);
  }

  getGoalProgress(userId: string, goal: Goal, trades: Trade[]): GoalProgress {
    // Filter trades within the goal's date range
    const goalTrades = trades.filter(trade => {
      const tradeDate = new Date(trade.date);
      const startDate = new Date(goal.startDate);
      const endDate = new Date(goal.endDate);
      return tradeDate >= startDate && tradeDate <= endDate;
    });

    const currentAmount = goalTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const percentage = goal.targetAmount !== 0 ? (currentAmount / goal.targetAmount) * 100 : 0;
    const daysRemaining = Math.max(0, Math.ceil((new Date(goal.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));
    const isAchieved = currentAmount >= goal.targetAmount;

    return {
      goal,
      currentAmount,
      percentage: Math.min(100, Math.max(0, percentage)),
      daysRemaining,
      isAchieved,
      tradeCount: goalTrades.length,
    };
  }

  async updateGoalStatuses(userId: string): Promise<void> {
    const goals = await this.getGoals(userId);
    const trades = await new LocalTradeService().getTrades(userId);
    const now = new Date();

    for (const goal of goals) {
      if (goal.status === 'active') {
        const endDate = new Date(goal.endDate);
        if (endDate < now) {
          // Goal period has ended, update status based on achievement
          const progress = this.getGoalProgress(userId, goal, trades);
          const newStatus: GoalStatus = progress.isAchieved ? 'completed' : 'failed';
          await this.updateGoal(userId, goal.id, { status: newStatus });
        }
      }
    }
  }
}

// Fallback goal service that tries Supabase first, then falls back to localStorage on error
class FallbackGoalService implements IGoalService {
  private supabaseService = new SupabaseGoalService();
  private localService = new LocalGoalService();

  private async tryWithFallback<T>(supabaseFn: () => Promise<T>, localFn: () => Promise<T>): Promise<T> {
    if (!isSupabaseConfigured) {
      return localFn();
    }
    try {
      return await supabaseFn();
    } catch (err) {
      console.warn('Supabase goal operation failed, falling back to localStorage:', err);
      return localFn();
    }
  }

  async getGoals(userId: string): Promise<Goal[]> {
    return this.tryWithFallback(
      () => this.supabaseService.getGoals(userId),
      () => this.localService.getGoals(userId)
    );
  }

  async getActiveGoals(userId: string): Promise<Goal[]> {
    return this.tryWithFallback(
      () => this.supabaseService.getActiveGoals(userId),
      () => this.localService.getActiveGoals(userId)
    );
  }

  async getGoal(userId: string, goalId: string): Promise<Goal | null> {
    return this.tryWithFallback(
      () => this.supabaseService.getGoal(userId, goalId),
      () => this.localService.getGoal(userId, goalId)
    );
  }

  async createGoal(
    userId: string,
    goalData: Omit<Goal, 'id' | 'userId' | 'actualAmount' | 'createdAt' | 'updatedAt'>
  ): Promise<Goal> {
    return this.tryWithFallback(
      () => this.supabaseService.createGoal(userId, goalData),
      () => this.localService.createGoal(userId, goalData)
    );
  }

  async updateGoal(
    userId: string,
    goalId: string,
    updates: Partial<GoalFormData> | Partial<Pick<Goal, 'status'>>
  ): Promise<Goal> {
    return this.tryWithFallback(
      () => this.supabaseService.updateGoal(userId, goalId, updates),
      () => this.localService.updateGoal(userId, goalId, updates)
    );
  }

  async deleteGoal(userId: string, goalId: string): Promise<void> {
    return this.tryWithFallback(
      () => this.supabaseService.deleteGoal(userId, goalId),
      () => this.localService.deleteGoal(userId, goalId)
    );
  }

  getGoalProgress(userId: string, goal: Goal, trades: Trade[]): GoalProgress {
    // This method doesn't use storage, just calculate
    return this.supabaseService.getGoalProgress(userId, goal, trades);
  }

  async updateGoalStatuses(userId: string): Promise<void> {
    return this.tryWithFallback(
      () => this.supabaseService.updateGoalStatuses(userId),
      () => this.localService.updateGoalStatuses(userId)
    );
  }
}

// Export singleton instance - uses FallbackGoalService which tries Supabase first, then localStorage
export const goalService: IGoalService = new FallbackGoalService();
