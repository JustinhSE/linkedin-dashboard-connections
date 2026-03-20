import React from 'react';
import type { NetworkStats } from '../analysis/types';

interface Props {
  stats: NetworkStats;
}

const TIER_COLORS: Record<string, string> = {
  'top-tech': 'text-green-400', 'well-known': 'text-blue-400',
  'startup': 'text-yellow-400', 'unknown': 'text-slate-400'
};

export const MetricsPanel: React.FC<Props> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="text-slate-400 text-sm mb-1">Total Connections</div>
        <div className="text-3xl font-bold text-indigo-400">{stats.totalConnections}</div>
        <div className="text-slate-500 text-xs mt-1">{stats.clusters.length} network clusters</div>
      </div>

      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="text-slate-400 text-sm mb-2">Top Companies</div>
        <div className="space-y-1">
          {stats.topCompanies.slice(0, 4).map(c => (
            <div key={c.name} className="flex justify-between items-center">
              <span className="text-slate-300 text-xs truncate max-w-[70%]">{c.name}</span>
              <span className="text-indigo-400 text-xs font-bold">{c.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="text-slate-400 text-sm mb-2">Top Roles</div>
        <div className="space-y-1">
          {stats.topRoles.slice(0, 4).map(r => (
            <div key={r.name} className="flex justify-between items-center">
              <span className="text-slate-300 text-xs truncate max-w-[70%]">{r.name}</span>
              <span className="text-green-400 text-xs font-bold">{r.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="text-slate-400 text-sm mb-2">Company Tiers</div>
        <div className="space-y-1">
          {Object.entries(stats.companyTierDistribution).map(([tier, count]) => (
            <div key={tier} className="flex justify-between items-center">
              <span className={`text-xs ${TIER_COLORS[tier] || 'text-slate-400'}`}>
                {tier === 'top-tech' ? '🏆 Top Tech' : tier === 'well-known' ? '⭐ Well-Known' : tier === 'startup' ? '🚀 Startup' : '❓ Unknown'}
              </span>
              <span className="text-slate-300 text-xs font-bold">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
