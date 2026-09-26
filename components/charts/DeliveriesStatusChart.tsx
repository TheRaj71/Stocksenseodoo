'use client';

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface StatusData {
  name: string;
  value: number;
  color: string;
}

interface DeliveriesStatusChartProps {
  data: StatusData[];
}

const COLORS = {
  DRAFT: '#fbbf24',     // amber-400
  WAITING: '#fb923c',   // orange-400
  READY: '#60a5fa',     // blue-400
  DONE: '#34d399',      // emerald-400
  CANCELLED: '#ef4444', // red-500
};

export function DeliveriesStatusChart({ data }: DeliveriesStatusChartProps) {
  const chartData = data.map(item => ({
    ...item,
    color: COLORS[item.name as keyof typeof COLORS] || '#94a3b8',
  }));

  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '11px',
              fontFamily: 'monospace',
            }}
          />
          <Legend 
            wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
