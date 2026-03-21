import React from 'react';
import type { Connection } from '../analysis/types';

interface Props {
  connection: Connection | null;
  onClose: () => void;
}

const SENIORITY_BADGES: Record<string, string> = {
  intern: 'bg-blue-900 text-blue-300',
  junior: 'bg-teal-900 text-teal-300',
  mid: 'bg-green-900 text-green-300',
  senior: 'bg-yellow-900 text-yellow-300',
  manager: 'bg-orange-900 text-orange-300',
  director: 'bg-red-900 text-red-300',
  executive: 'bg-purple-900 text-purple-300',
  unknown: 'bg-slate-700 text-slate-400',
};

const TIER_BADGES: Record<string, string> = {
  'top-tech': 'bg-green-900 text-green-300',
  'well-known': 'bg-blue-900 text-blue-300',
  'startup': 'bg-yellow-900 text-yellow-300',
  'nonprofit': 'bg-pink-900 text-pink-300',
};

export const ConnectionDetail: React.FC<Props> = ({ connection, onClose }) => {
  if (!connection) return null;

  const whyValuable: string[] = [];
  if (connection.companyTier === 'top-tech') whyValuable.push('Works at a top-tier tech company');
  if (connection.seniority === 'executive' || connection.seniority === 'director') whyValuable.push('Senior leadership — valuable for mentorship');
  if (connection.seniority === 'manager') whyValuable.push('Can provide referrals within their team');
  if (connection.seniority === 'intern') whyValuable.push('Peer connection for internship insights');
  if (connection.degreeCentrality > 0.1) whyValuable.push('Highly connected within your network');
  if (connection.bridgeScore > 0.1) whyValuable.push('Bridges multiple different network clusters');

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-600" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-white text-xl font-bold">{connection.fullName}</h3>
            <p className="text-slate-400 text-sm">{connection.position}</p>
            <p className="text-indigo-400 text-sm">{connection.company}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">✕</button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {connection.seniority !== 'unknown' && (
            <span className={`text-xs px-2 py-1 rounded-full ${SENIORITY_BADGES[connection.seniority]}`}>
              {connection.seniority}
            </span>
          )}
          {connection.companyTier !== 'unknown' && (
            <span className={`text-xs px-2 py-1 rounded-full ${TIER_BADGES[connection.companyTier]}`}>
              {connection.companyTier}
            </span>
          )}
          <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-300">
            {connection.industry}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center bg-slate-700 rounded-lg p-2">
            <div className="text-indigo-400 font-bold">{connection.influenceScore.toFixed(1)}</div>
            <div className="text-slate-400 text-xs">Influence</div>
          </div>
          <div className="text-center bg-slate-700 rounded-lg p-2">
            <div className="text-green-400 font-bold">{(connection.degreeCentrality * 100).toFixed(1)}%</div>
            <div className="text-slate-400 text-xs">Degree</div>
          </div>
          <div className="text-center bg-slate-700 rounded-lg p-2">
            <div className="text-yellow-400 font-bold">{(connection.bridgeScore * 100).toFixed(1)}%</div>
            <div className="text-slate-400 text-xs">Bridge Score</div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-slate-400 text-xs mb-1">Cluster: <span className="text-slate-200">{connection.clusterLabel}</span></p>
          <p className="text-slate-400 text-xs">Connected: <span className="text-slate-200">{connection.connectedOn.toLocaleDateString()}</span></p>
          {connection.emailAddress && (
            <p className="text-slate-400 text-xs">Email: <span className="text-slate-200">{connection.emailAddress}</span></p>
          )}
        </div>

        {whyValuable.length > 0 && (
          <div className="bg-indigo-950/50 rounded-lg p-3">
            <p className="text-indigo-300 text-xs font-semibold mb-2">Why they're valuable:</p>
            <ul className="space-y-1">
              {whyValuable.map((w, i) => (
                <li key={i} className="text-slate-300 text-xs flex gap-2">
                  <span className="text-indigo-400">›</span>{w}
                </li>
              ))}
            </ul>
          </div>
        )}

        {connection.url && (
          <a
            href={connection.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block text-center bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-sm transition-colors"
          >
            View LinkedIn Profile →
          </a>
        )}
      </div>
    </div>
  );
};
