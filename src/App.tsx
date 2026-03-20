import { useState, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { MetricsPanel } from './components/MetricsPanel';
import { NetworkGraph } from './components/NetworkGraph';
import { ClusterExplorer } from './components/ClusterExplorer';
import { OpportunityInsights } from './components/OpportunityInsights';
import { TimeGrowth } from './components/TimeGrowth';
import { ConnectionDetail } from './components/ConnectionDetail';
import { SearchFilter } from './components/SearchFilter';
import { ExportPanel } from './components/ExportPanel';
import { parseCSV } from './analysis/csvParser';
import { buildNetworkData } from './analysis/graphAnalysis';
import type { Connection, GraphNode, NetworkStats, GraphData } from './analysis/types';

function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [stats, setStats] = useState<NetworkStats | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<Connection | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCompany, setFilterCompany] = useState('');
  const [filterIndustry, setFilterIndustry] = useState('');
  const [activeTab, setActiveTab] = useState<'graph' | 'clusters' | 'insights' | 'growth'>('graph');

  const handleFile = async (file: File) => {
    setIsLoading(true);
    try {
      const raw = await parseCSV(file);
      const result = buildNetworkData(raw);
      setConnections(result.connections);
      setGraphData(result.graphData);
      setStats(result.stats);
    } catch (err) {
      console.error('Failed to process CSV:', err);
      alert('Failed to process CSV. Please check the file format.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNodeClick = (node: GraphNode) => {
    const conn = connections.find(c => c.id === node.id);
    if (conn) setSelectedConnection(conn);
  };

  const companies = useMemo(() =>
    stats?.topCompanies.map(c => c.name) || [], [stats]);
  const industries = useMemo(() =>
    stats?.topIndustries.map(i => i.name) || [], [stats]);

  const filteredGraphData = useMemo(() => {
    if (!graphData) return null;
    if (!searchQuery && !filterCompany && !filterIndustry) return graphData;

    const matchIds = new Set(
      connections
        .filter(c => {
          const q = searchQuery.toLowerCase();
          const matchSearch = !q || c.fullName.toLowerCase().includes(q) ||
            c.company.toLowerCase().includes(q) || c.position.toLowerCase().includes(q);
          const matchCo = !filterCompany || c.company === filterCompany;
          const matchInd = !filterIndustry || c.industry === filterIndustry;
          return matchSearch && matchCo && matchInd;
        })
        .map(c => c.id)
    );

    // After force-graph simulation, link endpoints may become objects with an id property
    const getLinkNodeId = (endpoint: string | { id: string }): string =>
      typeof endpoint === 'object' ? endpoint.id : endpoint;

    return {
      nodes: graphData.nodes.filter(n => matchIds.has(n.id)),
      links: graphData.links.filter(l =>
        matchIds.has(getLinkNodeId(l.source as string | { id: string })) &&
        matchIds.has(getLinkNodeId(l.target as string | { id: string }))
      ),
    };
  }, [graphData, connections, searchQuery, filterCompany, filterIndustry]);

  if (!stats || !graphData) {
    return <FileUpload onFile={handleFile} isLoading={isLoading} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 p-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-indigo-400">LinkedIn Network Intelligence</h1>
          <p className="text-slate-400 text-sm">
            {stats.totalConnections} connections · {stats.clusters.length} clusters detected
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ExportPanel stats={stats} connections={connections} />
          <button
            onClick={() => { setConnections([]); setGraphData(null); setStats(null); }}
            className="text-slate-400 hover:text-slate-200 text-sm"
          >
            ↺ Reset
          </button>
        </div>
      </div>

      <MetricsPanel stats={stats} />

      <SearchFilter
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        filterCompany={filterCompany}
        onFilterCompany={setFilterCompany}
        filterIndustry={filterIndustry}
        onFilterIndustry={setFilterIndustry}
        companies={companies}
        industries={industries}
      />

      <div className="flex gap-2 mb-4">
        {(['graph', 'clusters', 'insights', 'growth'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
              activeTab === tab
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {tab === 'graph' ? '🕸️ Network' : tab === 'clusters' ? '🔗 Clusters' : tab === 'insights' ? '💡 Insights' : '📈 Growth'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2">
          {activeTab === 'graph' && filteredGraphData && (
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div className="p-3 border-b border-slate-700">
                <p className="text-slate-400 text-xs">
                  Showing {filteredGraphData.nodes.length} nodes · Colors = clusters · Size = influence score · Click to explore
                </p>
              </div>
              <NetworkGraph
                graphData={filteredGraphData}
                onNodeClick={handleNodeClick}
              />
            </div>
          )}
          {activeTab === 'clusters' && (
            <ClusterExplorer
              clusters={stats.clusters}
              onSelectConnection={setSelectedConnection}
            />
          )}
          {activeTab === 'insights' && (
            <OpportunityInsights
              stats={stats}
              onSelectConnection={setSelectedConnection}
            />
          )}
          {activeTab === 'growth' && (
            <TimeGrowth stats={stats} />
          )}
        </div>

        <div className="space-y-4">
          <OpportunityInsights
            stats={stats}
            onSelectConnection={setSelectedConnection}
          />
        </div>
      </div>

      <ConnectionDetail
        connection={selectedConnection}
        onClose={() => setSelectedConnection(null)}
      />
    </div>
  );
}

export default App;
