import React from 'react';
import type { NetworkStats, Connection } from '../analysis/types';

interface Props {
  stats: NetworkStats;
  onSelectConnection: (conn: Connection) => void;
}

export const OpportunityInsights: React.FC<Props> = ({ stats, onSelectConnection }) => {
  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <h2 className="text-slate-200 font-semibold mb-4">💡 Opportunity Insights</h2>

      <div className="space-y-3 mb-6">
        {stats.insights.map((insight, i) => (
          <div key={i} className="flex gap-2 items-start">
            <span className="text-yellow-400 mt-0.5">›</span>
            <p className="text-slate-300 text-sm">{insight}</p>
          </div>
        ))}
      </div>

      <h3 className="text-slate-300 font-medium text-sm mb-3">🏆 Most Influential Connections</h3>
      <div className="space-y-2">
        {stats.mostInfluential.slice(0, 5).map((conn, i) => (
          <div
            key={conn.id}
            className="flex items-center gap-3 cursor-pointer hover:bg-slate-700 rounded-lg p-2 transition-colors"
            onClick={() => onSelectConnection(conn)}
          >
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white">
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-slate-200 text-sm font-medium truncate">{conn.fullName}</div>
              <div className="text-slate-500 text-xs truncate">{conn.position} @ {conn.company}</div>
            </div>
            <div className="text-indigo-400 text-xs font-bold">{conn.influenceScore.toFixed(1)}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
