# LinkedIn Network Intelligence Dashboard

A powerful web application that transforms your LinkedIn connections CSV export into actionable career insights through graph analysis, community detection, and interactive visualizations.

## Features

- **Network Graph Visualization** — Force-directed graph with color-coded clusters and influence-weighted node sizes
- **Community Detection** — Louvain algorithm identifies natural clusters in your network
- **Centrality Metrics** — Degree and betweenness centrality scores for each connection
- **Influence Scoring** — Composite score based on seniority, company tier, and network position
- **Opportunity Insights** — AI-generated recommendations for networking gaps and valuable connections
- **Time Growth Charts** — Track your network growth with area and bar charts
- **Search & Filter** — Filter by company, industry, or free-text search
- **Cluster Explorer** — Browse and expand each network cluster
- **Connection Details** — Click any node for a detailed profile with "why they're valuable" analysis
- **Markdown Export** — Export a full network intelligence report

## Setup

### Prerequisites
- Node.js 18+
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
npm run build
```

## Usage

1. **Export your LinkedIn connections:**
   - Go to LinkedIn → Settings → Data Privacy → Get a copy of your data
   - Select "Connections" and request the archive
   - Download the `Connections.csv` file

2. **Load the dashboard:**
   - Drag & drop your `Connections.csv` onto the upload area, or click "Choose File"
   - The app processes everything locally — no data is sent to any server

3. **Explore your network:**
   - **Network tab:** Interactive force graph; click nodes to see connection details
   - **Clusters tab:** Browse detected network clusters and their members
   - **Insights tab:** See opportunity insights and your most influential connections
   - **Growth tab:** View your network growth over time

4. **Sample data:** A sample CSV is available at `public/sample-data.csv` for testing.

## Tech Stack

- **Vite + React + TypeScript** — Fast build tooling and type safety
- **Tailwind CSS** — Dark-themed utility-first styling
- **graphology** — Graph data structure and algorithms
- **graphology-communities-louvain** — Community detection
- **graphology-metrics** — Degree and betweenness centrality
- **react-force-graph-2d** — Canvas-based force-directed graph
- **recharts** — Area and bar charts for growth visualization
- **papaparse** — CSV parsing

## Project Structure

```
src/
├── analysis/
│   ├── types.ts          # TypeScript interfaces
│   ├── csvParser.ts      # LinkedIn CSV parser
│   ├── graphAnalysis.ts  # Graph building, centrality, clustering
│   └── insights.ts       # Re-export convenience
├── components/
│   ├── FileUpload.tsx     # CSV upload UI
│   ├── MetricsPanel.tsx   # Top-level stats cards
│   ├── NetworkGraph.tsx   # Force graph visualization
│   ├── ClusterExplorer.tsx # Cluster browser
│   ├── OpportunityInsights.tsx # Insights + influential list
│   ├── TimeGrowth.tsx    # Growth charts
│   ├── ConnectionDetail.tsx # Connection detail modal
│   ├── SearchFilter.tsx  # Search and filter bar
│   └── ExportPanel.tsx   # Markdown export
├── App.tsx               # Main app shell
├── main.tsx              # React entry point
└── index.css             # Tailwind base styles
public/
└── sample-data.csv       # Sample LinkedIn connections
```
