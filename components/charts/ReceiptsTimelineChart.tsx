'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface ReceiptDataPoint {
  date: string;
  count: number;
  quantity: number;
}

interface ReceiptsTimelineChartProps {
  data: ReceiptDataPoint[];
}

export function ReceiptsTimelineChart({ data }: ReceiptsTimelineChartProps) {
  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fontFamily: 'monospace' }}
            stroke="#78716c"
          />
          <YAxis 
            tick={{ fontSize: 10, fontFamily: 'monospace' }}
            stroke="#78716c"
          />
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
          <Line 
            type="monotone" 
            dataKey="count" 
            stroke="#2563eb" 
            strokeWidth={2}
            dot={{ fill: '#2563eb', r: 4 }}
            name="Receipts"
          />
          <Line 
            type="monotone" 
            dataKey="quantity" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            name="Total Units"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
