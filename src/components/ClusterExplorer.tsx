import React, { useState } from 'react';
import type { Cluster, Connection } from '../analysis/types';

interface Props {
  clusters: Cluster[];
  onSelectConnection: (conn: Connection) => void;
}

const CLUSTER_COLORS = [
  'border-indigo-500', 'border-green-500', 'border-yellow-500', 'border-red-500',
  'border-blue-500', 'border-pink-500', 'border-teal-500', 'border-purple-500',
];

export const ClusterExplorer: React.FC<Props> = ({ clusters, onSelectConnection }) => {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <h2 className="text-slate-200 font-semibold mb-4">🔗 Network Clusters</h2>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {clusters.slice(0, 12).map((cluster, idx) => (
          <div
            key={cluster.id}
            className={`border-l-2 ${CLUSTER_COLORS[idx % CLUSTER_COLORS.length]} pl-3 cursor-pointer`}
            onClick={() => setExpanded(expanded === cluster.id ? null : cluster.id)}
          >
            <div className="flex justify-between items-center">
              <span className="text-slate-200 text-sm font-medium truncate max-w-[70%]">{cluster.label}</span>
              <span className="text-slate-400 text-xs">{cluster.members.length} people</span>
            </div>
            <div className="text-slate-500 text-xs mt-0.5">
              {cluster.dominantIndustry}
            </div>

            {expanded === cluster.id && (
              <div className="mt-2 space-y-1">
                <div className="text-slate-400 text-xs">Companies: {cluster.companies.slice(0, 5).join(', ')}</div>
                <div className="space-y-1 mt-2">
                  {cluster.members.slice(0, 5).map(m => (
                    <div
                      key={m.id}
                      className="text-indigo-400 text-xs cursor-pointer hover:text-indigo-300"
                      onClick={(e) => { e.stopPropagation(); onSelectConnection(m); }}
                    >
                      {m.fullName} · {m.position} @ {m.company}
                    </div>
                  ))}
                  {cluster.members.length > 5 && (
                    <div className="text-slate-500 text-xs">+{cluster.members.length - 5} more</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
