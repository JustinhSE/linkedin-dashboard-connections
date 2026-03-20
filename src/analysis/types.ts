export interface RawConnection {
  firstName: string;
  lastName: string;
  url: string;
  emailAddress: string;
  company: string;
  position: string;
  connectedOn: string;
}

export type SeniorityLevel = 'intern' | 'junior' | 'mid' | 'senior' | 'manager' | 'director' | 'executive' | 'unknown';
export type CompanyTier = 'top-tech' | 'well-known' | 'startup' | 'unknown';

export interface Connection {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  url: string;
  emailAddress: string;
  company: string;
  position: string;
  connectedOn: Date;
  industry: string;
  seniority: SeniorityLevel;
  companyTier: CompanyTier;
  clusterId?: number;
  clusterLabel?: string;
  influenceScore: number;
  degreeCentrality: number;
  bridgeScore: number;
  clusteringCoefficient: number;
}

export interface Cluster {
  id: number;
  label: string;
  members: Connection[];
  dominantCompany: string;
  dominantIndustry: string;
  dominantRole: string;
  avgSeniority: string;
  companies: string[];
  insights: string[];
}

export interface NetworkStats {
  totalConnections: number;
  topCompanies: Array<{ name: string; count: number }>;
  topRoles: Array<{ name: string; count: number }>;
  topIndustries: Array<{ name: string; count: number }>;
  seniorityDistribution: Record<SeniorityLevel, number>;
  companyTierDistribution: Record<CompanyTier, number>;
  mostInfluential: Connection[];
  clusters: Cluster[];
  monthlyGrowth: Array<{ month: string; count: number; cumulative: number }>;
  insights: string[];
}

export interface GraphNode {
  id: string;
  name: string;
  company: string;
  position: string;
  industry: string;
  seniority: SeniorityLevel;
  companyTier: CompanyTier;
  clusterId: number;
  clusterLabel: string;
  influenceScore: number;
  val: number;
  color: string;
}

export interface GraphLink {
  source: string;
  target: string;
  weight: number;
  type: 'same-company' | 'similar-role' | 'same-industry';
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}
