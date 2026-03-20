import React from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import type { NetworkStats } from '../analysis/types';

interface Props {
  stats: NetworkStats;
}

export const TimeGrowth: React.FC<Props> = ({ stats }) => {
  const data = stats.monthlyGrowth.slice(-24);

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <h2 className="text-slate-200 font-semibold mb-4">📈 Network Growth Over Time</h2>

      <div className="mb-6">
        <p className="text-slate-400 text-xs mb-3">Cumulative Connections</p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="cumulativeGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => v.split('-')[1] + '/' + v.split('-')[0].slice(2)} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
            <Area type="monotone" dataKey="cumulative" stroke="#6366f1" fill="url(#cumulativeGrad)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div>
        <p className="text-slate-400 text-xs mb-3">Monthly New Connections</p>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => v.split('-')[1] + '/' + v.split('-')[0].slice(2)} />
            <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
            <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
