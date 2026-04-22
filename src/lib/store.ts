'use client';

import { Trade, TradeFormData, DailyTotal } from './types';
import { generateId } from './utils';

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

// Export singleton instance
export const tradeService: ITradeService = new LocalTradeService();

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