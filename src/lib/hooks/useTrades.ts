'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { tradeService } from '@/lib/store';
import { Trade, TradeFormData, DailyTotal } from '@/lib/types';

// Query keys
export const tradeKeys = {
  all: ['trades'] as const,
  lists: () => [...tradeKeys.all, 'list'] as const,
  list: (filters: { userId: string; date?: string }) => [...tradeKeys.lists(), filters] as const,
  details: () => [...tradeKeys.all, 'detail'] as const,
  detail: (id: string) => [...tradeKeys.details(), id] as const,
  dailyTotals: (filters: { userId: string; year: number; month: number }) => 
    [...tradeKeys.all, 'dailyTotals', filters] as const,
};

// Hook to get all trades for a user
export function useTrades(userId: string) {
  return useQuery({
    queryKey: tradeKeys.list({ userId }),
    queryFn: () => tradeService.getTrades(userId),
    enabled: !!userId,
  });
}

// Hook to get trades for a specific date
export function useTradesByDate(userId: string, date: string) {
  return useQuery({
    queryKey: tradeKeys.list({ userId, date }),
    queryFn: () => tradeService.getTradesByDate(userId, date),
    enabled: !!userId && !!date,
  });
}

// Hook to get daily totals for calendar
export function useDailyTotals(userId: string, year: number, month: number) {
  return useQuery({
    queryKey: tradeKeys.dailyTotals({ userId, year, month }),
    queryFn: () => tradeService.getDailyTotals(userId, year, month),
    enabled: !!userId,
    retry: 2,
    staleTime: 30000, // 30 seconds
  });
}

// Hook to create a trade
export function useCreateTrade() {
  const queryClient = useQueryClient();
  const { user } = useUser();
  const router = useRouter();

  return useMutation({
    mutationFn: async (tradeData: Omit<Trade, 'id' | 'createdAt' | 'updatedAt'>) => {
      if (!user) throw new Error('Not authenticated');
      return tradeService.createTrade(user.id, tradeData);
    },
    onSuccess: () => {
      // Invalidate all trade queries to refetch
      queryClient.invalidateQueries({ queryKey: tradeKeys.all });
    },
  });
}

// Hook to update a trade
export function useUpdateTrade() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async ({ tradeId, updates }: { tradeId: string; updates: Partial<TradeFormData> }) => {
      if (!user) throw new Error('Not authenticated');
      return tradeService.updateTrade(user.id, tradeId, updates);
    },
    onSuccess: () => {
      // Invalidate all trade queries to refetch
      queryClient.invalidateQueries({ queryKey: tradeKeys.all });
    },
  });
}

// Hook to delete a trade
export function useDeleteTrade() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: async (tradeId: string) => {
      if (!user) throw new Error('Not authenticated');
      return tradeService.deleteTrade(user.id, tradeId);
    },
    onSuccess: () => {
      // Invalidate all trade queries to refetch
      queryClient.invalidateQueries({ queryKey: tradeKeys.all });
    },
  });
}