'use client';

import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CategoryData {
  name: string;
  count: number;
  totalQty: number;
}

interface CategoryStockBarChartProps {
  data: CategoryData[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

export function CategoryStockBarChart({ data }: CategoryStockBarChartProps) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 10, fontFamily: 'monospace', angle: -45 }}
            height={80}
          />
          <YAxis 
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
              if (name === 'totalQty') return `Stock: ${value} units`;
              if (name === 'count') return `Products: ${value}`;
              return value;
            }}
          />
          <Bar dataKey="totalQty" radius={[4, 4, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
