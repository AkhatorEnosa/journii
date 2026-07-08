'use client';

import { Trade, TradeFormData, DailyTotal, Goal, GoalFormData, GoalStatus, GoalProgress, TradingPlan, TradingPlanFormData, TradingPlanStatus } from './types';
import { generateId } from './utils';
import { supabase, isSupabaseConfigured } from './supabase/client';

// Local storage keys
const STORAGE_KEYS = {
  TRADES: 'journii_trades',
  GOALS: 'journii_goals',
  TRADING_PLANS: 'journii_trading_plans',
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
  checkForDuplicate(userId: string, tradeData: TradeFormData): Promise<Trade | null>;
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

  async createTrade( userId: string, tradeData: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Trade> {
    if (!supabase) throw new Error('Supabase is not configured');

    const tradeToInsert: any = {
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
    
    // Include optional datetime fields only if they have values (not empty strings)
    if (tradeData.openDateTime) tradeToInsert.open_datetime = tradeData.openDateTime;
    if (tradeData.closeDateTime) tradeToInsert.close_datetime = tradeData.closeDateTime;
    // Include optional plan-related fields only if they have values
    if (tradeData.followedPlan !== undefined) tradeToInsert.followed_plan = tradeData.followedPlan;
    if (tradeData.planId) tradeToInsert.plan_id = tradeData.planId;

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
    // Only include datetime fields if they have values (not empty strings)
    if (updates.openDateTime) updateData.open_datetime = updates.openDateTime;
    if (updates.closeDateTime) updateData.close_datetime = updates.closeDateTime;
    if (updates.followedPlan !== undefined) updateData.followed_plan = updates.followedPlan;
    if (updates.planId !== undefined) updateData.plan_id = updates.planId;

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

  async checkForDuplicate(userId: string, tradeData: TradeFormData): Promise<Trade | null> {
    if (!supabase) throw new Error('Supabase is not configured');

    // Check for trades with same symbol, entry price, exit price, date, and direction
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .eq('symbol', tradeData.symbol.toLowerCase())
      .eq('entry_price', tradeData.entryPrice)
      .eq('exit_price', tradeData.exitPrice)
      .eq('date', tradeData.date)
      .eq('direction', tradeData.direction)
      .single();

    if (error) {
      // If it's a "not found" error, return null (no duplicate)
      if (error.code === 'PGRST116') return null;
      throw error;
    }

    return this.mapSupabaseTradeToTrade(data);
  }

  async getDailyTotals(userId: string, year: number, month: number): Promise<DailyTotal[]> {
    if (!supabase) throw new Error('Supabase is not configured');

    // Get all trades for the user in the specified year and month
    const startDate = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const endDate = `${year}-${String(month + 2).padStart(2, '0')}-01`;

    // console.log('[Supabase] getDailyTotals:', { userId, year, month, startDate, endDate });

    // check if there are ANY trades for this user (diagnostic)
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

    // console.log('[Supabase] getDailyTotals raw data:', data);
    // console.log('[Supabase] getDailyTotals raw data count:', data?.length || 0);

    if (!data || data.length === 0) {
      // console.log('[Supabase] getDailyTotals: No trades found for this month');
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

    // console.log('[Supabase] getDailyTotals result:', dailyTotals);
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
      openDateTime: supabaseTrade.open_datetime || undefined,
      closeDateTime: supabaseTrade.close_datetime || undefined,
      followedPlan: supabaseTrade.followed_plan ?? undefined,
      planId: supabaseTrade.plan_id || undefined,
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

  async checkForDuplicate(userId: string, tradeData: TradeFormData): Promise<Trade | null> {
    const trades = await this.getTrades(userId);
    
    // Find a trade with same symbol, entry price, exit price, date, and direction
    const duplicate = trades.find(t => 
      t.symbol.toLowerCase() === tradeData.symbol.toLowerCase() &&
      t.entryPrice === tradeData.entryPrice &&
      t.exitPrice === tradeData.exitPrice &&
      t.date === tradeData.date &&
      t.direction === tradeData.direction
    );
    
    return duplicate || null;
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
    // Use date string comparison for consistency (YYYY-MM-DD format)
    const goalTrades = trades.filter(trade => {
      return trade.date >= goal.startDate && trade.date <= goal.endDate;
    });

    const currentAmount = goalTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const percentage = goal.targetAmount !== 0 ? (currentAmount / goal.targetAmount) * 100 : 0;
    
    // Calculate days remaining using end of day (23:59:59) in local timezone
    // This ensures the goal is active for the entire end date
    const today = new Date();
    const endDateParts = goal.endDate.split('-');
    const endDate = new Date(
      parseInt(endDateParts[0]),
      parseInt(endDateParts[1]) - 1,
      parseInt(endDateParts[2]),
      23, 59, 59
    );
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    const isAchieved = currentAmount >= goal.targetAmount;

    return {
      goal,
      currentAmount,
      // Allow negative percentages to show losses, but cap at 100%
      percentage: Math.min(100, percentage),
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
        // Parse end date and set to end of day (23:59:59) in local timezone
        // This ensures the goal remains active for the entire end date
        const endDateParts = goal.endDate.split('-');
        const endDate = new Date(
          parseInt(endDateParts[0]),
          parseInt(endDateParts[1]) - 1,
          parseInt(endDateParts[2]),
          23, 59, 59
        );
        
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
    // Use date string comparison for consistency (YYYY-MM-DD format)
    const goalTrades = trades.filter(trade => {
      return trade.date >= goal.startDate && trade.date <= goal.endDate;
    });

    const currentAmount = goalTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const percentage = goal.targetAmount !== 0 ? (currentAmount / goal.targetAmount) * 100 : 0;
    
    // Calculate days remaining using end of day (23:59:59) in local timezone
    // This ensures the goal is active for the entire end date
    const today = new Date();
    const endDateParts = goal.endDate.split('-');
    const endDate = new Date(
      parseInt(endDateParts[0]),
      parseInt(endDateParts[1]) - 1,
      parseInt(endDateParts[2]),
      23, 59, 59
    );
    const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    const isAchieved = currentAmount >= goal.targetAmount;

    return {
      goal,
      currentAmount,
      // Allow negative percentages to show losses, but cap at 100%
      percentage: Math.min(100, percentage),
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
        // Parse end date and set to end of day (23:59:59) in local timezone
        // This ensures the goal remains active for the entire end date
        const endDateParts = goal.endDate.split('-');
        const endDate = new Date(
          parseInt(endDateParts[0]),
          parseInt(endDateParts[1]) - 1,
          parseInt(endDateParts[2]),
          23, 59, 59
        );
        
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

// Trading Plan service interface
interface ITradingPlanService {
  getTradingPlans(userId: string): Promise<TradingPlan[]>;
  getActiveTradingPlans(userId: string): Promise<TradingPlan[]>;
  getTradingPlan(userId: string, planId: string): Promise<TradingPlan | null>;
  createTradingPlan(userId: string, plan: Omit<TradingPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<TradingPlan>;
  updateTradingPlan(userId: string, planId: string, updates: Partial<TradingPlanFormData>): Promise<TradingPlan>;
  deleteTradingPlan(userId: string, planId: string): Promise<void>;
}

// Supabase trading plan service implementation
class SupabaseTradingPlanService implements ITradingPlanService {
  async getTradingPlans(userId: string): Promise<TradingPlan[]> {
    if (!supabase) throw new Error('Supabase is not configured');

    const { data, error } = await supabase
      .from('trading_plans')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(this.mapSupabaseTradingPlanToTradingPlan);
  }

  async getActiveTradingPlans(userId: string): Promise<TradingPlan[]> {
    if (!supabase) throw new Error('Supabase is not configured');

    const { data, error } = await supabase
      .from('trading_plans')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data.map(this.mapSupabaseTradingPlanToTradingPlan);
  }

  async getTradingPlan(userId: string, planId: string): Promise<TradingPlan | null> {
    if (!supabase) throw new Error('Supabase is not configured');

    const { data, error } = await supabase
      .from('trading_plans')
      .select('*')
      .eq('id', planId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return this.mapSupabaseTradingPlanToTradingPlan(data);
  }

  async createTradingPlan(
    userId: string,
    planData: Omit<TradingPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<TradingPlan> {
    if (!supabase) throw new Error('Supabase is not configured');

    const planToInsert = {
      user_id: userId,
      name: planData.name,
      description: planData.description,
      instruments: planData.instruments,
      trading_sessions: planData.tradingSessions,
      entry_rules: planData.entryRules,
      exit_rules: planData.exitRules,
      risk_management: planData.riskManagement,
      psychology_rules: planData.psychologyRules,
      status: planData.status,
    };

    const { data, error } = await supabase
      .from('trading_plans')
      .insert([planToInsert])
      .select()
      .single();

    if (error) throw error;

    return this.mapSupabaseTradingPlanToTradingPlan(data);
  }

  async updateTradingPlan(
    userId: string,
    planId: string,
    updates: Partial<TradingPlanFormData>
  ): Promise<TradingPlan> {
    if (!supabase) throw new Error('Supabase is not configured');

    const updateData: any = {};
    if ('name' in updates && updates.name !== undefined) updateData.name = updates.name;
    if ('description' in updates && updates.description !== undefined) updateData.description = updates.description;
    if ('instruments' in updates) updateData.instruments = updates.instruments;
    if ('tradingSessions' in updates) updateData.trading_sessions = updates.tradingSessions;
    if ('entryRules' in updates) updateData.entry_rules = updates.entryRules;
    if ('exitRules' in updates) updateData.exit_rules = updates.exitRules;
    if ('riskManagement' in updates) updateData.risk_management = updates.riskManagement;
    if ('psychologyRules' in updates) updateData.psychology_rules = updates.psychologyRules;

    const { data, error } = await supabase
      .from('trading_plans')
      .update(updateData)
      .eq('id', planId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;

    return this.mapSupabaseTradingPlanToTradingPlan(data);
  }

  async deleteTradingPlan(userId: string, planId: string): Promise<void> {
    if (!supabase) throw new Error('Supabase is not configured');

    const { error } = await supabase
      .from('trading_plans')
      .delete()
      .eq('id', planId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  private mapSupabaseTradingPlanToTradingPlan(supabasePlan: any): TradingPlan {
    // Handle instruments - could be null, undefined, or an array
    let instruments: string[] = [];
    if (supabasePlan.instruments) {
      if (Array.isArray(supabasePlan.instruments)) {
        instruments = supabasePlan.instruments.filter((i: string | null) => i != null);
      } else if (typeof supabasePlan.instruments === 'string') {
        try {
          const parsed = JSON.parse(supabasePlan.instruments);
          instruments = Array.isArray(parsed) ? parsed.filter((i: string | null) => i != null) : [];
        } catch {
          instruments = [];
        }
      }
    }

    return {
      id: supabasePlan.id,
      userId: supabasePlan.user_id,
      name: supabasePlan.name,
      description: supabasePlan.description || '',
      instruments: instruments,
      tradingSessions: supabasePlan.trading_sessions || '',
      entryRules: supabasePlan.entry_rules || '',
      exitRules: supabasePlan.exit_rules || '',
      riskManagement: supabasePlan.risk_management || '',
      psychologyRules: supabasePlan.psychology_rules || '',
      status: supabasePlan.status as TradingPlanStatus,
      createdAt: supabasePlan.created_at,
      updatedAt: supabasePlan.updated_at,
    };
  }
}

// Local storage trading plan service implementation
class LocalTradingPlanService implements ITradingPlanService {
  private getStoredTradingPlans(): TradingPlan[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEYS.TRADING_PLANS);
    return stored ? JSON.parse(stored) : [];
  }

  private saveTradingPlans(plans: TradingPlan[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.TRADING_PLANS, JSON.stringify(plans));
  }

  async getTradingPlans(userId: string): Promise<TradingPlan[]> {
    const plans = this.getStoredTradingPlans();
    return plans.filter((p) => p.userId === userId);
  }

  async getActiveTradingPlans(userId: string): Promise<TradingPlan[]> {
    const plans = await this.getTradingPlans(userId);
    return plans.filter((p) => p.status === 'active');
  }

  async getTradingPlan(userId: string, planId: string): Promise<TradingPlan | null> {
    const plans = await this.getTradingPlans(userId);
    return plans.find((p) => p.id === planId) || null;
  }

  async createTradingPlan(
    userId: string,
    planData: Omit<TradingPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<TradingPlan> {
    const plans = this.getStoredTradingPlans();
    const newPlan: TradingPlan = {
      ...planData,
      id: generateId(),
      userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    plans.push(newPlan);
    this.saveTradingPlans(plans);
    return newPlan;
  }

  async updateTradingPlan(
    userId: string,
    planId: string,
    updates: Partial<TradingPlanFormData>
  ): Promise<TradingPlan> {
    const plans = this.getStoredTradingPlans();
    const index = plans.findIndex((p) => p.id === planId && p.userId === userId);
    if (index === -1) throw new Error('Trading plan not found');

    plans[index] = {
      ...plans[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveTradingPlans(plans);
    return plans[index];
  }

  async deleteTradingPlan(userId: string, planId: string): Promise<void> {
    const plans = this.getStoredTradingPlans();
    const filtered = plans.filter((p) => !(p.id === planId && p.userId === userId));
    this.saveTradingPlans(filtered);
  }
}

// Fallback trading plan service
class FallbackTradingPlanService implements ITradingPlanService {
  private supabaseService = new SupabaseTradingPlanService();
  private localService = new LocalTradingPlanService();

  private async tryWithFallback<T>(supabaseFn: () => Promise<T>, localFn: () => Promise<T>): Promise<T> {
    if (!isSupabaseConfigured) {
      return localFn();
    }
    try {
      return await supabaseFn();
    } catch (err) {
      console.warn('Supabase trading plan operation failed, falling back to localStorage:', err);
      return localFn();
    }
  }

  async getTradingPlans(userId: string): Promise<TradingPlan[]> {
    return this.tryWithFallback(
      () => this.supabaseService.getTradingPlans(userId),
      () => this.localService.getTradingPlans(userId)
    );
  }

  async getActiveTradingPlans(userId: string): Promise<TradingPlan[]> {
    return this.tryWithFallback(
      () => this.supabaseService.getActiveTradingPlans(userId),
      () => this.localService.getActiveTradingPlans(userId)
    );
  }

  async getTradingPlan(userId: string, planId: string): Promise<TradingPlan | null> {
    return this.tryWithFallback(
      () => this.supabaseService.getTradingPlan(userId, planId),
      () => this.localService.getTradingPlan(userId, planId)
    );
  }

  async createTradingPlan(
    userId: string,
    planData: Omit<TradingPlan, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ): Promise<TradingPlan> {
    return this.tryWithFallback(
      () => this.supabaseService.createTradingPlan(userId, planData),
      () => this.localService.createTradingPlan(userId, planData)
    );
  }

  async updateTradingPlan(
    userId: string,
    planId: string,
    updates: Partial<TradingPlanFormData>
  ): Promise<TradingPlan> {
    return this.tryWithFallback(
      () => this.supabaseService.updateTradingPlan(userId, planId, updates),
      () => this.localService.updateTradingPlan(userId, planId, updates)
    );
  }

  async deleteTradingPlan(userId: string, planId: string): Promise<void> {
    return this.tryWithFallback(
      () => this.supabaseService.deleteTradingPlan(userId, planId),
      () => this.localService.deleteTradingPlan(userId, planId)
    );
  }
}

// Export trading plan service singleton
export const tradingPlanService: ITradingPlanService = new FallbackTradingPlanService();
