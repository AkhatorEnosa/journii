'use client';

import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

interface CurrencyPieChartProps {
  data: CurrencyData[];
  title?: string;
  description?: string;
}

type FilterMode = 'pnl' | 'trades';

// Color palette for different currencies (multiple distinct colors)
const COLORS = [
  '#0088FE', // Blue
  '#00C49F', // Teal
  '#FFBB28', // Yellow
  '#FF8042', // Orange
  '#8884D8', // Purple
  '#82CA9D', // Mint
  '#FFC658', // Gold
  '#FF6B6B', // Coral
  '#4ECDC4', // Turquoise
  '#45B7D1', // Sky
  '#96CEB4', // Sage
  '#FFEAA7', // Light Yellow
  '#DDA0DD', // Plum
  '#98D8C8', // Seafoam
  '#F7DC6F', // Mustard
];

const CustomTooltip = ({ active, payload, filterMode }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    
    if (filterMode === 'pnl') {
      // Show actual PnL with sign
      const actualPnL = data.value;
      const pnlColor = actualPnL >= 0 ? 'text-emerald-500' : 'text-rose-500';
      
      return (
        <div className="bg-card border border-border p-3 rounded shadow-lg">
          <p className="text-foreground font-semibold uppercase">{data.name}</p>
          <p className={`text-sm font-medium ${pnlColor}`}>
            PnL: ${actualPnL.toFixed(2)}
          </p>
          <p className="text-sm text-muted-foreground">
            Trades: {data.count}
          </p>
        </div>
      );
    } else {
      // Show trade count
      return (
        <div className="bg-card border border-border p-3 rounded shadow-lg">
          <p className="text-foreground font-semibold uppercase">{data.name}</p>
          <p className="text-sm font-medium text-foreground">
            Trades: {data.count}
          </p>
          <p className="text-sm text-muted-foreground">
            PnL: ${data.value.toFixed(2)}
          </p>
        </div>
      );
    }
  }
  return null;
};

export default function CurrencyPieChart({ 
  data, 
  title = "Currency Distribution", 
  description = "Trades by currency pair" 
}: CurrencyPieChartProps) {
  const [filterMode, setFilterMode] = useState<FilterMode>('pnl');

  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Sort based on filter mode
    const sorted = [...data].sort((a, b) => {
      if (filterMode === 'pnl') {
        // Sort by PnL value from positive to negative (descending)
        return b.value - a.value;
      } else {
        return b.count - a.count;
      }
    }).slice(0, 10);

    return sorted.map(item => ({ 
      ...item, 
      displayValue: filterMode === 'pnl' ? item.value : item.count
    }));
  }, [data, filterMode]);

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
            {filterMode === 'pnl' 
              ? 'PnL by currency pair' 
              : 'Distribution by number of trades'}
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="outline" size="sm" className="gap-1">
              {filterMode === 'pnl' ? 'PnL Volume' : 'Total Trades'}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setFilterMode('pnl')}>
              PnL Volume
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setFilterMode('trades')}>
              Total Trades
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
                domain={filterMode === 'pnl' ? ['dataMin', 'dataMax'] : [0, 'dataMax']}
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
                dataKey="displayValue"
                name={filterMode === 'pnl' ? 'PnL' : 'Trades'}
                radius={[0, 4, 4, 0]}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]}
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