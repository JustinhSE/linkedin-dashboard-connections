import React from 'react';
import type { NetworkStats, Connection } from '../analysis/types';

interface Props {
  stats: NetworkStats;
  connections: Connection[];
}

export const ExportPanel: React.FC<Props> = ({ stats, connections }) => {
  const exportMarkdown = () => {
    const topTech = connections.filter(c => c.companyTier === 'top-tech');
    const md = `# LinkedIn Network Intelligence Report

Generated: ${new Date().toLocaleDateString()}

## Summary
- **Total Connections:** ${stats.totalConnections}
- **Network Clusters:** ${stats.clusters.length}
- **Top-tier Tech Connections:** ${topTech.length}

## Top Companies
${stats.topCompanies.slice(0, 10).map(c => `- ${c.name}: ${c.count} connections`).join('\n')}

## Top Roles
${stats.topRoles.slice(0, 10).map(r => `- ${r.name}: ${r.count} connections`).join('\n')}

## Top Industries
${stats.topIndustries.slice(0, 10).map(i => `- ${i.name}: ${i.count} connections`).join('\n')}

## Key Insights
${stats.insights.map(i => `- ${i}`).join('\n')}

## Most Influential Connections
${stats.mostInfluential.slice(0, 10).map((c, i) => `${i + 1}. **${c.fullName}** — ${c.position} @ ${c.company} (Score: ${c.influenceScore})`).join('\n')}

## Network Clusters
${stats.clusters.slice(0, 10).map(cl => `### ${cl.label}
- Size: ${cl.members.length} connections
- Industry: ${cl.dominantIndustry}
- Top Company: ${cl.dominantCompany}
- Seniority Level: ${cl.avgSeniority}
`).join('\n')}
`;
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'linkedin-network-report.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex gap-3">
      <button
        onClick={exportMarkdown}
        className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2"
      >
        📄 Export Markdown
      </button>
    </div>
  );
};
