'use client';

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';

interface CurrencyData {
  name: string;
  value: number;
  count: number;
}

interface TopBottomCurrenciesChartProps {
  data: CurrencyData[];
  title?: string;
  description?: string;
}

type FilterMode = 'best' | 'worst';

const CustomTooltip = ({ active, payload, filterMode }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const pnlColor = data.value >= 0 ? 'text-emerald-500' : 'text-rose-500';
    
    return (
      <div className="bg-card border border-border p-3 rounded shadow-lg">
        <p className="text-foreground font-semibold uppercase">{data.name}</p>
        <p className={`text-sm font-medium ${pnlColor}`}>
          PnL: ${data.value.toFixed(2)}
        </p>
        <p className="text-sm text-muted-foreground">
          Trades: {data.count}
        </p>
        {data.winRate !== undefined && (
          <p className="text-sm text-muted-foreground">
            Win Rate: {data.winRate}%
          </p>
        )}
      </div>
    );
  }
  return null;
};

export default function TopBottomCurrenciesChart({ 
  data, 
  title = "Top & Bottom Performers", 
  description = "Best and worst performing currency pairs" 
}: TopBottomCurrenciesChartProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>('best');

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Sort by PnL and get top or bottom 10
    const sorted = [...data].sort((a, b) => b.value - a.value);
    const selected = filterMode === 'best' 
      ? sorted.slice(0, 10)  // Top 10 best (highest PnL)
      : sorted.slice(-10).reverse();  // Bottom 10 worst (lowest PnL)

    return selected;
  }, [data, filterMode]);

  // Get color based on PnL value
  const getBarColor = (value: number) => {
    return value >= 0 ? 'var(--color-positive)' : 'var(--color-negative)';
  };

  if (!chartData || chartData.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground">{title}</CardTitle>
          <CardDescription className="text-muted-foreground">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No trade data available
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-foreground">{title}</CardTitle>
          <CardDescription className="text-muted-foreground">
            {filterMode === 'best' 
              ? 'Top 10 best performing currencies' 
              : 'Top 10 worst performing currencies'}
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-1.5 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
            {filterMode === 'best' ? 'Best 10' : 'Worst 10'}
            <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilterMode('best')}>
              Best 10
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterMode('worst')}>
              Worst 10
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 60, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis 
                type="number" 
                stroke="var(--color-muted-foreground)" 
                fontSize={12}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="var(--color-muted-foreground)" 
                fontSize={12}
                style={{ textTransform: 'uppercase' }}
                width={50}
              />
              <Tooltip
                content={<CustomTooltip filterMode={filterMode} />}
                cursor={{ fill: 'var(--color-muted)', opacity: 0.5 }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                formatter={(value) => (
                  <span className="text-sm text-muted-foreground uppercase">{value}</span>
                )}
              />
              <Bar
                dataKey="value"
                name="PnL"
                radius={[0, 4, 4, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={getBarColor(entry.value)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}