'use client';

import { useState, useEffect, useCallback } from 'react';

// Storage key for persisting currency filter
const CURRENCY_FILTER_KEY = 'journii_currency_filter';

// Get stored currency filter from localStorage
function getStoredCurrencyFilter(): string[] | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem(CURRENCY_FILTER_KEY);
  return stored ? JSON.parse(stored) : null;
}

// Save currency filter to localStorage
function saveCurrencyFilter(currencies: string[] | null): void {
  if (typeof window === 'undefined') return;
  if (currencies === null || currencies.length === 0) {
    localStorage.removeItem(CURRENCY_FILTER_KEY);
  } else {
    localStorage.setItem(CURRENCY_FILTER_KEY, JSON.stringify(currencies));
  }
}

// Module-level state for currency filter (shared across all components)
let globalSelectedCurrencies: string[] | null = getStoredCurrencyFilter();
let globalAvailableCurrencies: string[] = [];
let listeners: Array<() => void> = [];

// Subscribe to changes
function subscribe(listener: () => void) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

// Notify all listeners of changes
function notifyListeners() {
  listeners.forEach(listener => listener());
}

// Hook for managing currency filter state
export function useCurrencyFilter() {
  const [, forceUpdate] = useState(0);

  // Load stored filter on mount
  useEffect(() => {
    const stored = getStoredCurrencyFilter();
    if (stored !== globalSelectedCurrencies) {
      globalSelectedCurrencies = stored;
      forceUpdate(n => n + 1);
    }
  }, []);

  // Subscribe to changes
  useEffect(() => {
    return subscribe(() => forceUpdate(n => n + 1));
  }, []);

  // Update available currencies when trades are loaded
  const updateAvailableCurrencies = useCallback((trades: { symbol: string }[]) => {
    const currencies = [...new Set(trades.map(t => t.symbol).filter(Boolean))].sort();
    globalAvailableCurrencies = currencies;
    forceUpdate(n => n + 1);
  }, []);

  // Set selected currencies and persist
  const setCurrencyFilter = useCallback((currencies: string[] | null) => {
    globalSelectedCurrencies = currencies;
    saveCurrencyFilter(currencies);
    notifyListeners();
  }, []);

  // Check if a specific currency is selected
  const isCurrencySelected = useCallback((currency: string): boolean => {
    if (globalSelectedCurrencies === null) return true; // All currencies selected
    return globalSelectedCurrencies.includes(currency);
  }, []);

  // Check if "all currencies" mode is active
  const isAllSelected = globalSelectedCurrencies === null || globalSelectedCurrencies.length === 0;

  // Get display label for the filter
  const getFilterLabel = useCallback((): string => {
    if (isAllSelected) {
      return 'All Currencies';
    }
    if (globalSelectedCurrencies && globalSelectedCurrencies.length === 1) {
      return globalSelectedCurrencies[0];
    }
    return `${globalSelectedCurrencies?.length || 0} Selected`;
  }, [isAllSelected]);

  // Filter trades by selected currencies - check current value directly
  const filterTradesByCurrency = useCallback(<T extends { symbol: string }>(trades: T[]): T[] => {
    const currentSelected = globalSelectedCurrencies;
    if (currentSelected === null || currentSelected.length === 0) return trades;
    return trades.filter(trade => currentSelected.includes(trade.symbol));
  }, []);

  return {
    selectedCurrencies: globalSelectedCurrencies,
    availableCurrencies: globalAvailableCurrencies,
    isAllSelected,
    isCurrencySelected,
    getFilterLabel,
    setCurrencyFilter,
    updateAvailableCurrencies,
    filterTradesByCurrency,
  };
}