/**
 * Server-side trade service for API routes
 * This module can be safely used in server-side code (API routes, server components)
 */
import { createClient } from '@supabase/supabase-js';
import type { Trade } from '@/lib/types';

// Initialize Supabase client for server-side use
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Get all trades for a user (server-side)
 */
export async function getTrades(userId: string): Promise<Trade[]> {
  if (!supabase) {
    throw new Error('Supabase is not configured. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables.');
  }

  try {
    const { data, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) {
      console.error('[Server] Error fetching trades:', error);
      throw error;
    }

    return data.map(mapSupabaseTradeToTrade);
  } catch (error) {
    console.error('[Server] Failed to fetch trades for user:', userId, error);
    throw error;
  }
}

/**
 * Map Supabase trade record to Trade interface
 */
function mapSupabaseTradeToTrade(supabaseTrade: any): Trade {
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
    result: supabaseTrade.result as 'profit' | 'loss',
    date: supabaseTrade.date,
    createdAt: supabaseTrade.created_at,
    updatedAt: supabaseTrade.updated_at,
  };
}