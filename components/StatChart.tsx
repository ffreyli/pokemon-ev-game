
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Stats, MAX_STAT_EVS } from '../types';

interface StatChartProps {
  // Fix: Changed EVStats to Stats to match types.ts
  evs: Stats;
}

const StatChart: React.FC<StatChartProps> = ({ evs }) => {
  const data = [
    { name: 'HP', value: evs.hp, color: '#FF5959' },
    { name: 'Atk', value: evs.attack, color: '#F5AC78' },
    { name: 'Def', value: evs.defense, color: '#FAE078' },
    { name: 'SpA', value: evs.spAttack, color: '#9DB7F5' },
    { name: 'SpD', value: evs.spDefense, color: '#A7DB8D' },
    { name: 'Spe', value: evs.speed, color: '#FA92B2' },
  ];

  return (
    <div className="h-64 w-full bg-white rounded-lg p-2 shadow-inner border-2 border-gray-100">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ left: -10, right: 20 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" domain={[0, MAX_STAT_EVS]} hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            width={40} 
            tick={{ fontSize: 12, fontWeight: 'bold' }} 
          />
          <Tooltip 
            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StatChart;
