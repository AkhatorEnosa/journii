'use client';

import { Check, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCurrencyFilter } from '@/lib/currency-filter';
import { cn } from '@/lib/utils';

interface CurrencyFilterProps {
  availableCurrencies: string[];
  className?: string;
}

export function CurrencyFilter({ availableCurrencies, className }: CurrencyFilterProps) {
  const {
    selectedCurrencies,
    isAllSelected,
    setCurrencyFilter,
    getFilterLabel,
  } = useCurrencyFilter();

  const handleSelectAll = () => {
    setCurrencyFilter(null);
  };

  const handleSelectCurrency = (currency: string) => {
    if (selectedCurrencies === null) {
      // Currently "all" is selected, switch to just this currency
      setCurrencyFilter([currency]);
    } else if (selectedCurrencies.includes(currency)) {
      // Remove this currency
      const newSelection = selectedCurrencies.filter(c => c !== currency);
      setCurrencyFilter(newSelection.length === 0 ? null : newSelection);
    } else {
      // Add this currency
      setCurrencyFilter([...selectedCurrencies, currency]);
    }
  };

  const isSelected = (currency: string) => {
    if (isAllSelected) return false;
    return selectedCurrencies?.includes(currency) ?? false;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div
          className={cn(
            "flex items-center gap-2 border border-border bg-background text-foreground hover:bg-accent",
            "inline-flex shrink-0 items-center justify-center rounded-lg text-sm font-medium whitespace-nowrap",
            "transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            "h-8 px-2.5",
            className
          )}
        >
          <span className="text-sm font-medium">Currency:</span>
          <span className="text-sm font-semibold capitalize">{getFilterLabel()}</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-1.5 py-1 text-xs font-medium text-muted-foreground">
          Select Currencies
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            onClick={handleSelectAll}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="font-medium">All Currencies</span>
            {isAllSelected && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {availableCurrencies.map((currency) => (
            <DropdownMenuItem
              key={currency}
              onClick={() => handleSelectCurrency(currency)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span className="font-medium uppercase">{currency}</span>
              {isSelected(currency) && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}