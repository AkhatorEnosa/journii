'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatPnL } from '@/lib/utils';

interface PnLData {
  name: string;
  value: number; // Actual PnL value (positive for profit, negative for loss)
  count: number;
}

interface PnLPieChartProps {
  data: PnLData[];
  title?: string;
  description?: string;
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const totalValue = payload[0].payload.totalAbsValue || 1;
    const isProfit = data.value >= 0;
    return (
      <div className="bg-card border border-border p-3 rounded shadow-lg">
        <p className="text-foreground font-semibold">{data.name}</p>
        <p className={`text-sm font-medium ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
          {formatPnL(data.value)}
        </p>
        <p className="text-sm text-muted-foreground">
          Trades: {data.count} ({((Math.abs(data.value) / totalValue) * 100).toFixed(1)}%)
        </p>
      </div>
    );
  }
  return null;
};

export default function PnLPieChart({ 
  data, 
  title = "Profit & Loss Distribution", 
  description = "Breakdown of profits and losses" 
}: PnLPieChartProps) {
  if (!data || data.length === 0) {
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

  // Calculate total absolute value for percentage calculation
  const totalAbsValue = data.reduce((sum, item) => sum + Math.abs(item.value), 0);
  
  // Transform data to use absolute values for pie chart sizing
  const chartData = data.map(item => ({
    ...item,
    absValue: Math.abs(item.value), // Use absolute value for slice size
    totalAbsValue,
  }));

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${formatPnL(value)}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="absValue" // Use absolute value for slice size
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.value >= 0 ? '#10B981' : '#F43F5E'} 
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                verticalAlign="bottom" 
                height="36"
                formatter={(value, entry) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-4">
          {data.filter(d => d.value > 0).map((item, idx) => (
            <div key={`profit-${idx}`} className="text-center">
              <p className="text-xs text-muted-foreground">Total Profit</p>
              <p className="text-lg font-bold text-emerald-500">{formatPnL(item.value)}</p>
              <p className="text-xs text-muted-foreground">{item.count} winning trades</p>
            </div>
          ))}
          {data.filter(d => d.value < 0).map((item, idx) => (
            <div key={`loss-${idx}`} className="text-center">
              <p className="text-xs text-muted-foreground">Total Loss</p>
              <p className="text-lg font-bold text-rose-500">{formatPnL(item.value)}</p>
              <p className="text-xs text-muted-foreground">{item.count} losing trades</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}