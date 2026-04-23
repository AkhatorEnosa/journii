'use client';

import { Trade, TradeFormData, DailyTotal } from './types';
import { generateId } from './utils';
import { supabase, isSupabaseConfigured } from './supabase/client';

// Local storage keys
const STORAGE_KEYS = {
  TRADES: 'journii_trades',
  USER: 'journii_user',
};

// Trade service interface for easy swapping to Supabase
interface ITradeService {
  getTrades(userId: string): Promise<Trade[]>;
  getTradesByDate(userId: string, date: string): Promise<Trade[]>;
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

    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .lt('date', endDate)
      .order('date', { ascending: false });

    if (error) throw error;

    const trades = data.map(this.mapSupabaseTradeToTrade);
    const dailyMap = new Map<string, Trade[]>();

    trades.forEach((trade) => {
      if (!dailyMap.has(trade.date)) {
        dailyMap.set(trade.date, []);
      }
      dailyMap.get(trade.date)!.push(trade);
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