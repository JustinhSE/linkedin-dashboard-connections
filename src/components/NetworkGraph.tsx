import React, { useRef, useCallback } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import type { GraphData, GraphNode } from '../analysis/types';

interface Props {
  graphData: GraphData;
  onNodeClick: (node: GraphNode) => void;
  highlightNodeIds?: Set<string>;
}

export const NetworkGraph: React.FC<Props> = ({ graphData, onNodeClick, highlightNodeIds }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fgRef = useRef<any>(null);

  const handleNodeClick = useCallback((node: object) => {
    onNodeClick(node as GraphNode);
  }, [onNodeClick]);

  const paintNode = useCallback((node: object, ctx: CanvasRenderingContext2D) => {
    const n = node as GraphNode & { x: number; y: number };
    const r = n.val * 2 + 3;
    const highlighted = highlightNodeIds?.has(n.id);

    ctx.beginPath();
    ctx.arc(n.x, n.y, r, 0, 2 * Math.PI);
    ctx.fillStyle = highlighted ? '#fff' : n.color;
    ctx.globalAlpha = highlighted ? 1 : 0.85;
    ctx.fill();

    if (highlighted) {
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }, [highlightNodeIds]);

  return (
    <div className="graph-container w-full" style={{ height: 500 }}>
      <ForceGraph2D
        ref={fgRef}
        graphData={graphData}
        nodeId="id"
        nodeLabel={(node: object) => {
          const n = node as GraphNode;
          return `${n.name}\n${n.position} @ ${n.company}`;
        }}
        nodeCanvasObject={paintNode}
        nodeCanvasObjectMode={() => 'replace'}
        linkColor={() => '#334155'}
        linkWidth={0.5}
        onNodeClick={handleNodeClick}
        backgroundColor="#1e293b"
        height={500}
        cooldownTicks={100}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
      />
    </div>
  );
};
