import Graph from 'graphology';
import louvain from 'graphology-communities-louvain';
import { degreeCentrality } from 'graphology-metrics/centrality/degree';
import type {
  RawConnection, Connection, Cluster, NetworkStats,
  GraphData, GraphNode, GraphLink, SeniorityLevel, CompanyTier
} from './types';

const TOP_TECH_COMPANIES = new Set([
  'google', 'meta', 'facebook', 'amazon', 'apple', 'microsoft', 'netflix',
  'nvidia', 'tesla', 'uber', 'lyft', 'airbnb', 'spotify', 'twitter', 'x',
  'linkedin', 'salesforce', 'oracle', 'ibm', 'intel', 'amd', 'qualcomm',
  'adobe', 'dropbox', 'stripe', 'square', 'block', 'snowflake', 'databricks',
  'palantir', 'openai', 'anthropic', 'bytedance', 'tiktok', 'samsung',
  'shopify', 'twilio', 'cloudflare', 'datadog', 'mongodb', 'elastic',
  'confluent', 'hashicorp', 'gitlab', 'github', 'atlassian', 'zendesk',
  'servicenow', 'workday', 'okta', 'crowdstrike', 'palo alto networks',
  'cisco', 'vmware', 'dell', 'hp', 'lenovo', 'roblox', 'epic games',
  'valve', 'activision', 'ea', 'riot games', 'bloomberg', 'goldman sachs',
  'jpmorgan', 'morgan stanley', 'blackrock', 'citadel', 'two sigma',
  'jane street', 'de shaw', 'jump trading', 'optiver'
]);

const WELL_KNOWN_COMPANIES = new Set([
  'deloitte', 'accenture', 'mckinsey', 'bain', 'bcg', 'pwc', 'kpmg', 'ey',
  'ernst & young', 'booz allen', 'leidos', 'lockheed martin', 'boeing',
  'raytheon', 'northrop grumman', 'general dynamics', 'spacex', 'nasa',
  'general electric', 'general motors', 'ford', 'bmw', 'mercedes',
  'jpmorgan chase', 'bank of america', 'wells fargo', 'citi', 'citigroup',
  'aetna', 'unitedhealth', 'cvs', 'walgreens', 'pfizer', 'johnson & johnson',
  'merck', 'abbvie', 'eli lilly', 'moderna', 'biogen', 'genentech',
  'comcast', 'at&t', 'verizon', 't-mobile', 'sprint', 'charter',
  'disney', 'warner', 'paramount', 'nbc', 'cbs', 'abc', 'fox',
  'target', 'walmart', 'costco', 'kroger', 'home depot', 'lowes'
]);

const NONPROFIT_COMPANIES = new Set([
  'colorstack', 'codepath', 'management leadership for tomorrow',
  'girls who code', 'rewriting the code',
]);

const INDUSTRY_MAP: Record<string, string[]> = {
  'Software/Technology': ['software', 'engineer', 'developer', 'tech', 'engineering', 'swe', 'coder', 'programmer', 'fullstack', 'backend', 'frontend', 'devops', 'cloud', 'data', 'ai', 'ml', 'machine learning', 'artificial intelligence', 'cybersecurity', 'security', 'infrastructure', 'platform', 'systems'],
  'Finance/Banking': ['finance', 'bank', 'banking', 'investment', 'analyst', 'quant', 'trading', 'hedge fund', 'private equity', 'venture capital', 'vc', 'fintech', 'accounting', 'cfo', 'treasury'],
  'Consulting': ['consulting', 'consultant', 'advisory', 'strategy', 'management consulting'],
  'Healthcare/Biotech': ['health', 'medical', 'bio', 'pharma', 'clinical', 'hospital', 'doctor', 'nurse', 'physician', 'biotech', 'genomics', 'drug'],
  'Research/Academia': ['research', 'phd', 'professor', 'university', 'lab', 'institute', 'postdoc', 'academic', 'faculty', 'graduate'],
  'Product/Design': ['product', 'ux', 'ui', 'design', 'designer', 'pm', 'product manager', 'user experience'],
  'Marketing/Sales': ['marketing', 'sales', 'growth', 'brand', 'seo', 'advertising', 'account executive', 'business development'],
  'Operations/HR': ['operations', 'hr', 'human resources', 'recruiting', 'recruiter', 'talent', 'people ops', 'supply chain', 'logistics'],
  'Law/Legal': ['legal', 'law', 'attorney', 'lawyer', 'counsel', 'compliance', 'paralegal'],
  'Education': ['education', 'teacher', 'instructor', 'tutor', 'curriculum', 'edtech'],
  'Media/Entertainment': ['media', 'entertainment', 'content', 'journalist', 'writer', 'editor', 'film', 'game', 'gaming'],
  'Government/Defense': ['government', 'federal', 'defense', 'military', 'policy', 'public sector', 'nsa', 'cia', 'fbi', 'dod'],
};

function inferSeniority(position: string): SeniorityLevel {
  const pos = position.toLowerCase();
  if (/\b(intern|internship|co-op|coop|student|trainee)\b/.test(pos)) return 'intern';
  if (/\b(vp|vice president|svp|evp)\b/.test(pos)) return 'executive';
  if (/\b(ceo|cto|coo|cfo|cpo|chief|founder|co-founder|president|partner)\b/.test(pos)) return 'executive';
  if (/\b(director|head of|head,)\b/.test(pos)) return 'director';
  if (/\b(senior manager|principal manager|group manager)\b/.test(pos)) return 'manager';
  if (/\b(manager|lead|tech lead)\b/.test(pos)) return 'manager';
  if (/\b(senior|sr\.?|sr |iii|iv|v |staff|principal)\b/.test(pos)) return 'senior';
  if (/\b(junior|jr\.?|jr |associate|entry|new grad|graduate)\b/.test(pos)) return 'junior';
  if (/\b(engineer|developer|analyst|scientist|designer|consultant|specialist|coordinator|advisor)\b/.test(pos)) return 'mid';
  if (pos.trim() === '') return 'unknown';
  return 'unknown';
}

function inferCompanyTier(company: string): CompanyTier {
  const c = company.toLowerCase().trim();
  if (!c) return 'unknown';
  for (const name of TOP_TECH_COMPANIES) {
    if (c.includes(name)) return 'top-tech';
  }
  for (const name of WELL_KNOWN_COMPANIES) {
    if (c.includes(name)) return 'well-known';
  }
  for (const name of NONPROFIT_COMPANIES) {
    if (c.includes(name)) return 'nonprofit';
  }
  if (/\b(startup|ventures|labs|ai|technologies|solutions|systems|software|digital)\b/.test(c)) return 'startup';
  return 'unknown';
}

function inferIndustry(company: string, position: string): string {
  const text = (company + ' ' + position).toLowerCase();
  for (const [industry, keywords] of Object.entries(INDUSTRY_MAP)) {
    if (keywords.some(kw => text.includes(kw))) return industry;
  }
  return 'Other';
}

function computeInfluenceScore(
  seniority: SeniorityLevel,
  companyTier: CompanyTier,
  dc: number,
  bridgeScore: number
): number {
  const seniorityScore: Record<SeniorityLevel, number> = {
    executive: 10, director: 8, manager: 6, senior: 5, mid: 4, junior: 3, intern: 2, unknown: 1
  };
  const tierScore: Record<CompanyTier, number> = {
    'top-tech': 10, 'well-known': 6, 'startup': 4, 'nonprofit': 4 /* community-focused orgs weighted similarly to startups */, 'unknown': 1
  };
  const s = seniorityScore[seniority] ?? 1;
  const t = tierScore[companyTier] ?? 1;
  const dcScore = dc * 40;
  const bsScore = bridgeScore * 30;
  return Math.round((s * 2 + t * 2 + dcScore + bsScore) * 10) / 10;
}

const CLUSTER_COLORS = [
  '#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6',
  '#ec4899', '#14b8a6', '#8b5cf6', '#f97316', '#06b6d4',
  '#84cc16', '#e11d48', '#0ea5e9', '#d97706', '#7c3aed',
];

export function buildNetworkData(rawConnections: RawConnection[]): {
  connections: Connection[];
  graphData: GraphData;
  stats: NetworkStats;
} {
  const graph = new Graph({ multi: false });

  const connections: Connection[] = rawConnections.map((raw, i) => {
    const id = `conn-${i}`;
    const industry = inferIndustry(raw.company || '', raw.position || '');
    const seniority = inferSeniority(raw.position || '');
    const companyTier = inferCompanyTier(raw.company || '');
    let connectedOn: Date;
    try {
      connectedOn = new Date(raw.connectedOn);
      if (isNaN(connectedOn.getTime())) connectedOn = new Date();
    } catch {
      connectedOn = new Date();
    }

    return {
      id,
      firstName: raw.firstName || '',
      lastName: raw.lastName || '',
      fullName: `${raw.firstName || ''} ${raw.lastName || ''}`.trim() || 'Unknown',
      url: raw.url || '',
      emailAddress: raw.emailAddress || '',
      company: raw.company || 'Unknown',
      position: raw.position || 'Unknown',
      connectedOn,
      industry,
      seniority,
      companyTier,
      influenceScore: 0,
      degreeCentrality: 0,
      bridgeScore: 0,
      clusteringCoefficient: 0,
    };
  });

  connections.forEach(conn => {
    graph.addNode(conn.id, {
      company: conn.company,
      industry: conn.industry,
      seniority: conn.seniority,
      position: conn.position,
    });
  });

  const byCompany: Record<string, string[]> = {};
  const byIndustry: Record<string, string[]> = {};

  connections.forEach(conn => {
    const co = conn.company.toLowerCase().trim();
    const ind = conn.industry;
    if (co && co !== 'unknown') {
      if (!byCompany[co]) byCompany[co] = [];
      byCompany[co].push(conn.id);
    }
    if (ind && ind !== 'Other') {
      if (!byIndustry[ind]) byIndustry[ind] = [];
      byIndustry[ind].push(conn.id);
    }
  });

  const links: GraphLink[] = [];

  Object.values(byCompany).forEach(ids => {
    // Skip singletons (no edge to add) and very large groups (>50) to avoid O(n²) edge explosion
    if (ids.length < 2 || ids.length > 50) return;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        if (!graph.hasEdge(ids[i], ids[j])) {
          graph.addEdge(ids[i], ids[j], { type: 'same-company', weight: 3 });
          links.push({ source: ids[i], target: ids[j], weight: 3, type: 'same-company' });
        }
      }
    }
  });

  Object.values(byIndustry).forEach(ids => {
    // Industry edges are weaker signals, so use a tighter cap (30) to keep the graph readable
    if (ids.length < 2 || ids.length > 30) return;
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        if (!graph.hasEdge(ids[i], ids[j])) {
          graph.addEdge(ids[i], ids[j], { type: 'same-industry', weight: 1 });
          links.push({ source: ids[i], target: ids[j], weight: 1, type: 'same-industry' });
        }
      }
    }
  });

  let degCentrality: Record<string, number> = {};

  try {
    degCentrality = degreeCentrality(graph);
  } catch {
    connections.forEach(c => { degCentrality[c.id] = 0; });
  }

  let communities: Record<string, number> = {};
  try {
    communities = louvain(graph);
  } catch {
    connections.forEach(c => { communities[c.id] = 0; });
  }

  // Network Reach Score: estimates how broadly a connection can introduce you
  // across your graph by measuring diversity among direct neighbors.
  // It combines neighbor company and industry diversity (with a small bonus for
  // multi-industry reach) and is clamped to [0, 1].
  const byId = connections.reduce((acc, conn) => {
    acc[conn.id] = conn;
    return acc;
  }, {} as Record<string, Connection>);
  const totalCompanies = new Set(
    connections
      .map(c => c.company.toLowerCase().trim())
      .filter(c => c && c !== 'unknown')
  ).size;
  const totalIndustries = new Set(
    connections
      .map(c => c.industry)
      .filter(i => i && i !== 'Other')
  ).size;
  const bridgeScores: Record<string, number> = {};
  graph.forEachNode((nodeId) => {
    const neighborCompanies = new Set<string>();
    const neighborIndustries = new Set<string>();
    graph.forEachNeighbor(nodeId, (neighborId) => {
      const neighbor = byId[neighborId];
      if (!neighbor) return;
      const company = neighbor.company.toLowerCase().trim();
      if (company && company !== 'unknown') neighborCompanies.add(company);
      if (neighbor.industry && neighbor.industry !== 'Other') neighborIndustries.add(neighbor.industry);
    });
    const companyReach = totalCompanies > 0
      ? neighborCompanies.size / Math.min(totalCompanies, 12)
      : 0;
    const industryReach = totalIndustries > 0
      ? neighborIndustries.size / Math.min(totalIndustries, 8)
      : 0;
    const crossIndustryBonus = neighborIndustries.size > 1 ? 0.15 : 0;
    bridgeScores[nodeId] = Math.max(0, Math.min(1, companyReach * 0.6 + industryReach * 0.4 + crossIndustryBonus));
  });

  connections.forEach(conn => {
    conn.degreeCentrality = degCentrality[conn.id] ?? 0;
    conn.bridgeScore = bridgeScores[conn.id] ?? 0;
    conn.clusterId = communities[conn.id] ?? 0;
    conn.influenceScore = computeInfluenceScore(
      conn.seniority, conn.companyTier,
      conn.degreeCentrality, conn.bridgeScore
    );
  });

  const clusterGroups: Record<number, Connection[]> = {};
  connections.forEach(conn => {
    const cid = conn.clusterId ?? 0;
    if (!clusterGroups[cid]) clusterGroups[cid] = [];
    clusterGroups[cid].push(conn);
  });

  function getMostCommon(arr: string[]): string {
    const freq: Record<string, number> = {};
    arr.forEach(a => { if (a && a !== 'Unknown') freq[a] = (freq[a] || 0) + 1; });
    return Object.entries(freq).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Mixed';
  }

  const clusters: Cluster[] = Object.entries(clusterGroups)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([id, members]) => {
      const cid = parseInt(id);
      const companies = members.map(m => m.company);
      const industries = members.map(m => m.industry);
      const positions = members.map(m => m.position);
      const seniorities = members.map(m => m.seniority);

      const dominantCompany = getMostCommon(companies);
      const dominantIndustry = getMostCommon(industries);
      const dominantRole = getMostCommon(positions);
      const avgSeniority = getMostCommon(seniorities);

      const label = dominantIndustry !== 'Other'
        ? `${dominantIndustry} (${dominantCompany !== 'Mixed' ? dominantCompany : dominantIndustry})`
        : members.filter(m => m.companyTier === 'nonprofit').length > members.length / 2
          ? `nonprofit (${dominantCompany})`
          : `${dominantCompany} Cluster`;

      const clusterInsights: string[] = [];
      const topTechCount = members.filter(m => m.companyTier === 'top-tech').length;
      if (topTechCount > members.length * 0.3) {
        clusterInsights.push(`${topTechCount} connections at top-tier tech companies`);
      }
      if (members.length > 5) {
        clusterInsights.push(`Strong cluster with ${members.length} connections`);
      }

      return {
        id: cid,
        label,
        members,
        dominantCompany,
        dominantIndustry,
        dominantRole,
        avgSeniority,
        companies: [...new Set(companies)].filter(c => c && c !== 'Unknown').slice(0, 10),
        insights: clusterInsights,
      };
    });

  clusters.forEach(cluster => {
    cluster.members.forEach(conn => {
      conn.clusterLabel = cluster.label;
    });
  });

  const nodes: GraphNode[] = connections.map(conn => {
    const colorIndex = (conn.clusterId ?? 0) % CLUSTER_COLORS.length;
    return {
      id: conn.id,
      name: conn.fullName,
      company: conn.company,
      position: conn.position,
      industry: conn.industry,
      seniority: conn.seniority,
      companyTier: conn.companyTier,
      clusterId: conn.clusterId ?? 0,
      clusterLabel: conn.clusterLabel ?? 'Unknown',
      influenceScore: conn.influenceScore,
      val: Math.max(1, Math.min(conn.influenceScore / 3, 8)),
      color: CLUSTER_COLORS[colorIndex],
    };
  });

  const topCompanies = Object.entries(
    connections.reduce((acc, c) => {
      if (c.company && c.company !== 'Unknown') acc[c.company] = (acc[c.company] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count }));

  const topRoles = Object.entries(
    connections.reduce((acc, c) => {
      if (c.position && c.position !== 'Unknown') acc[c.position] = (acc[c.position] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count }));

  const topIndustries = Object.entries(
    connections.reduce((acc, c) => {
      acc[c.industry] = (acc[c.industry] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([name, count]) => ({ name, count }));

  const seniorityDistribution = connections.reduce((acc, c) => {
    acc[c.seniority] = (acc[c.seniority] || 0) + 1;
    return acc;
  }, {} as Record<SeniorityLevel, number>);

  const companyTierDistribution = connections.reduce((acc, c) => {
    acc[c.companyTier] = (acc[c.companyTier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const mostInfluential = [...connections]
    .sort((a, b) => b.influenceScore - a.influenceScore)
    .slice(0, 10);

  const monthlyMap: Record<string, number> = {};
  connections.forEach(conn => {
    const d = conn.connectedOn;
    if (d && !isNaN(d.getTime())) {
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = (monthlyMap[key] || 0) + 1;
    }
  });
  const sortedMonths = Object.keys(monthlyMap).sort();
  let cumulative = 0;
  const monthlyGrowth = sortedMonths.map(month => {
    cumulative += monthlyMap[month];
    return { month, count: monthlyMap[month], cumulative };
  });

  const insights = generateInsights(connections, clusters, topCompanies, topIndustries);

  const stats: NetworkStats = {
    totalConnections: connections.length,
    topCompanies,
    topRoles,
    topIndustries,
    seniorityDistribution: seniorityDistribution as Record<SeniorityLevel, number>,
    companyTierDistribution: companyTierDistribution as Record<CompanyTier, number>,
    mostInfluential,
    clusters,
    monthlyGrowth,
    insights,
  };

  return { connections, graphData: { nodes, links }, stats };
}

function generateInsights(
  connections: Connection[],
  clusters: Cluster[],
  topCompanies: Array<{ name: string; count: number }>,
  topIndustries: Array<{ name: string; count: number }>
): string[] {
  const insights: string[] = [];

  if (topCompanies.length > 0) {
    insights.push(`Your strongest company cluster is ${topCompanies[0].name} with ${topCompanies[0].count} connections.`);
  }

  const topTechConns = connections.filter(c => c.companyTier === 'top-tech');
  if (topTechConns.length > 0) {
    insights.push(`You have ${topTechConns.length} connections at top-tier tech companies — leverage these for referrals.`);
  }

  const interns = connections.filter(c => c.seniority === 'intern');
  const seniors = connections.filter(c => c.seniority === 'senior' || c.seniority === 'manager' || c.seniority === 'director' || c.seniority === 'executive');

  if (interns.length > 0) {
    insights.push(`You have ${interns.length} intern connections — great for peer networking and referrals into internship programs.`);
  }
  if (seniors.length > 0) {
    insights.push(`You have ${seniors.length} senior/leadership connections — prioritize these for mentorship and referrals.`);
  }

  const allIndustries = ['Software/Technology', 'Finance/Banking', 'Healthcare/Biotech', 'Consulting', 'Research/Academia'];
  const represented = new Set(topIndustries.map(i => i.name));
  const missing = allIndustries.filter(i => !represented.has(i));
  if (missing.length > 0) {
    insights.push(`You lack connections in: ${missing.slice(0, 3).join(', ')} — consider expanding your network here.`);
  }

  if (clusters.length > 0) {
    const largestCluster = clusters[0];
    insights.push(`Your largest network cluster contains ${largestCluster.members.length} people focused on ${largestCluster.dominantIndustry}.`);
  }

  if (connections.length > 0) {
    const topInfluencer = [...connections].sort((a, b) => b.influenceScore - a.influenceScore)[0];
    insights.push(`Your most influential connection is ${topInfluencer.fullName} at ${topInfluencer.company} — reach out for mentorship or referrals.`);
  }

  return insights;
}
