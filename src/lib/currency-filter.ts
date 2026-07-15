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

// Hook for managing currency filter state
export function useCurrencyFilter() {
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[] | null>(null);
  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);

  // Load stored filter on mount
  useEffect(() => {
    const stored = getStoredCurrencyFilter();
    setSelectedCurrencies(stored);
  }, []);

  // Update available currencies when trades are loaded
  const updateAvailableCurrencies = useCallback((trades: { symbol: string }[]) => {
    const currencies = [...new Set(trades.map(t => t.symbol).filter(Boolean))].sort();
    setAvailableCurrencies(currencies);
  }, []);

  // Set selected currencies and persist
  const setCurrencyFilter = useCallback((currencies: string[] | null) => {
    setSelectedCurrencies(currencies);
    saveCurrencyFilter(currencies);
  }, []);

  // Check if a specific currency is selected
  const isCurrencySelected = useCallback((currency: string): boolean => {
    if (selectedCurrencies === null) return true; // All currencies selected
    return selectedCurrencies.includes(currency);
  }, [selectedCurrencies]);

  // Check if "all currencies" mode is active
  const isAllSelected = selectedCurrencies === null || selectedCurrencies.length === 0;

  // Get display label for the filter
  const getFilterLabel = useCallback((): string => {
    if (isAllSelected) {
      return 'All Currencies';
    }
    if (selectedCurrencies && selectedCurrencies.length === 1) {
      return selectedCurrencies[0];
    }
    return `${selectedCurrencies?.length || 0} Selected`;
  }, [selectedCurrencies, isAllSelected]);

  // Filter trades by selected currencies
  const filterTradesByCurrency = useCallback(<T extends { symbol: string }>(trades: T[]): T[] => {
    if (isAllSelected) return trades;
    return trades.filter(trade => selectedCurrencies?.includes(trade.symbol));
  }, [selectedCurrencies, isAllSelected]);

  return {
    selectedCurrencies,
    availableCurrencies,
    isAllSelected,
    isCurrencySelected,
    getFilterLabel,
    setCurrencyFilter,
    updateAvailableCurrencies,
    filterTradesByCurrency,
  };
}