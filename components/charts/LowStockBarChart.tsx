'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface LowStockItem {
  name: string;
  sku: string;
  currentStock: number;
  minQuantity: number;
  urgency: number; // 0-100 scale
}

interface LowStockBarChartProps {
  items: LowStockItem[];
}

export function LowStockBarChart({ items }: LowStockBarChartProps) {
  // Get color based on urgency
  const getColor = (urgency: number) => {
    if (urgency >= 80) return '#dc2626'; // red-600
    if (urgency >= 60) return '#ea580c'; // orange-600
    if (urgency >= 40) return '#f59e0b'; // amber-500
    return '#fbbf24'; // amber-400
  };

  const chartData = items.slice(0, 10).map(item => ({
    name: item.sku,
    stock: item.currentStock,
    min: item.minQuantity,
    urgency: item.urgency,
  }));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis type="number" tick={{ fontSize: 11, fontFamily: 'monospace' }} />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={80}
            tick={{ fontSize: 10, fontFamily: 'monospace' }} 
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'monospace',
            }}
            formatter={(value: any, name?: string) => {
              if (name === 'stock') return `Current: ${value}`;
              if (name === 'min') return `Min Required: ${value}`;
              return value;
            }}
          />
          <Bar dataKey="stock" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.urgency)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
