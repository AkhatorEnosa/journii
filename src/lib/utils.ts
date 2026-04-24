import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format PnL as currency (e.g., +$120.50 or -$45.00)
export function formatPnL(pnl: number, currency = 'USD'): string {
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(pnl));

  return pnl >= 0 ? `+${formatted}` : `-${formatted}`;
}

// Format price as currency without sign
export function formatPrice(price: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

// Get PnL color class based on value
export function getPnLColor(pnl: number): string {
  if (pnl > 0) return 'text-emerald-500';
  if (pnl < 0) return 'text-rose-500';
  return 'text-slate-400';
}

// Get PnL background color class (subtle)
export function getPnLBgColor(pnl: number): string {
  if (pnl > 0) return 'bg-emerald-500/10';
  if (pnl < 0) return 'bg-rose-500/10';
  return 'bg-slate-500/10';
}

// Get PnL border color class
export function getPnLBorderColor(pnl: number): string {
  if (pnl > 0) return 'border-emerald-500/50';
  if (pnl < 0) return 'border-rose-500/50';
  return 'border-slate-500/20';
}

// Format date for display
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

// Format date for input field (YYYY-MM-DD)
export function formatDateForInput(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
}

// Get today's date in YYYY-MM-DD format
export function getTodayString(): string {
  return new Date().toISOString().split('T')[0];
}

// Generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

// Validate email format
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}
