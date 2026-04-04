// SitePulse V3 — Attack Surface Analyzer
// Graph-based attack surface mapping

import type { SurfaceNode, SurfaceEdge, UUID } from '../core/types.js';
import { eventBus } from '../core/event-bus.js';

export type NodeType = 'endpoint' | 'asset' | 'form' | 'api' | 'script' | 'config';
export type EdgeType = 'dataflow' | 'call' | 'dependency' | 'redirect';

export interface AttackSurfaceGraph {
  nodes: Map<UUID, SurfaceNode>;
  edges: SurfaceEdge[];
}

export interface AttackPath {
  id: UUID;
  entryPoint: UUID;
  target: UUID;
  nodes: UUID[];
  riskScore: number;
  complexity: number;
  description: string;
}

export class AttackSurfaceAnalyzer {
  private _graph: AttackSurfaceGraph = {
    nodes: new Map(),
    edges: []
  };
  private _pageRankCache = new Map<UUID, number>();

  constructor() {
    this._listenToEvents();
  }

  private _listenToEvents(): void {
    eventBus.on('FINDING_DISCOVERED', (event) => {
      const payload = event.payload as { finding?: { route?: string } };
      if (payload.finding?.route) {
        this.addNode({
          id: `node-${Date.now()}`,
          type: 'endpoint',
          url: payload.finding.route,
          label: payload.finding.route,
          criticalityScore: 50
        });
      }
    });
  }

  addNode(node: SurfaceNode): void {
    this._graph.nodes.set(node.id, node);
    this._invalidateCache();
  }

  addEdge(from: UUID, to: UUID, type: EdgeType, weight = 1): void {
    this._graph.edges.push({ from, to, relation: type, weight });
    this._invalidateCache();
  }

  removeNode(id: UUID): void {
    this._graph.nodes.delete(id);
    this._graph.edges = this._graph.edges.filter(e => e.from !== id && e.to !== id);
    this._invalidateCache();
  }

  getNode(id: UUID): SurfaceNode | undefined {
    return this._graph.nodes.get(id);
  }

  getNeighbors(nodeId: UUID): SurfaceNode[] {
    const neighborIds = new Set<UUID>();
    
    this._graph.edges.forEach(edge => {
      if (edge.from === nodeId) neighborIds.add(edge.to);
      if (edge.to === nodeId) neighborIds.add(edge.from);
    });

    return Array.from(neighborIds)
      .map(id => this._graph.nodes.get(id))
      .filter((n): n is SurfaceNode => n !== undefined);
  }

  /**
   * Calculate PageRank for all nodes to identify high-value targets
   */
  calculatePageRank(iterations = 20, damping = 0.85): Map<UUID, number> {
    if (this._pageRankCache.size > 0) {
      return this._pageRankCache;
    }

    const nodes = Array.from(this._graph.nodes.keys());
    const n = nodes.length;
    if (n === 0) return new Map();

    // Initialize
    let ranks = new Map<UUID, number>();
    nodes.forEach(id => ranks.set(id, 1 / n));

    // Power iteration
    for (let i = 0; i < iterations; i++) {
      const newRanks = new Map<UUID, number>();
      
      nodes.forEach(nodeId => {
        let rank = (1 - damping) / n;
        
        // Sum contributions from incoming edges
        this._graph.edges.forEach(edge => {
          if (edge.to === nodeId) {
            const outDegree = this._graph.edges.filter(e => e.from === edge.from).length;
            if (outDegree > 0) {
              rank += damping * (ranks.get(edge.from) ?? 0) / outDegree;
            }
          }
        });
        
        newRanks.set(nodeId, rank);
      });
      
      ranks = newRanks;
    }

    this._pageRankCache = ranks;
    return ranks;
  }

  /**
   * Find attack paths from entry points to high-value targets
   */
  findAttackPaths(maxDepth = 5): AttackPath[] {
    const paths: AttackPath[] = [];
    const pageRank = this.calculatePageRank();
    
    // Entry points: nodes with low PageRank (peripheral)
    const entryPoints = Array.from(this._graph.nodes.values())
      .filter(n => (pageRank.get(n.id) ?? 0) < 0.1)
      .map(n => n.id);
    
    // Targets: nodes with high criticality
    const targets = Array.from(this._graph.nodes.values())
      .filter(n => n.criticalityScore > 70)
      .map(n => n.id);

    entryPoints.forEach(entry => {
      targets.forEach(target => {
        const path = this._findPath(entry, target, maxDepth);
        if (path) {
          paths.push(path);
        }
      });
    });

    return paths.sort((a, b) => b.riskScore - a.riskScore);
  }

  private _findPath(start: UUID, end: UUID, maxDepth: number): AttackPath | null {
    const visited = new Set<UUID>();
    const queue: Array<{ node: UUID; path: UUID[] }> = [{ node: start, path: [start] }];
    
    while (queue.length > 0) {
      const { node, path } = queue.shift()!;
      
      if (node === end) {
        const riskScore = this._calculatePathRisk(path);
        return {
          id: `path-${Date.now()}-${Math.random()}`,
          entryPoint: start,
          target: end,
          nodes: path,
          riskScore,
          complexity: path.length,
          description: `Attack path from ${start} to ${end}`
        };
      }
      
      if (path.length >= maxDepth) continue;
      
      visited.add(node);
      
      const neighbors = this.getNeighbors(node);
      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor.id)) {
          queue.push({ node: neighbor.id, path: [...path, neighbor.id] });
        }
      });
    }
    
    return null;
  }

  private _calculatePathRisk(path: UUID[]): number {
    let risk = 0;
    
    path.forEach(nodeId => {
      const node = this._graph.nodes.get(nodeId);
      if (node) {
        risk += node.criticalityScore;
      }
    });
    
    // Longer paths have higher complexity but lower probability
    const complexityPenalty = path.length * 5;
    
    return Math.min(100, Math.max(0, risk / path.length - complexityPenalty));
  }

  /**
   * Get critical nodes that would have high impact if compromised
   */
  getCriticalNodes(threshold = 0.8): SurfaceNode[] {
    const pageRank = this.calculatePageRank();
    const maxRank = Math.max(...pageRank.values());
    
    return Array.from(this._graph.nodes.values())
      .filter(n => {
        const rank = pageRank.get(n.id) ?? 0;
        return (rank / maxRank) > threshold || n.criticalityScore > 80;
      })
      .sort((a, b) => b.criticalityScore - a.criticalityScore);
  }

  /**
   * Export graph for visualization
   */
  exportForVisualization(): {
    nodes: Array<{ id: string; label: string; type: NodeType; x?: number; y?: number }>;
    edges: Array<{ source: string; target: string; type: EdgeType }>;
  } {
    // Simple force-directed layout simulation
    const positions = this._calculateLayout();
    
    return {
      nodes: Array.from(this._graph.nodes.values()).map(n => ({
        id: n.id,
        label: n.label,
        type: n.type as NodeType,
        x: positions.get(n.id)?.x,
        y: positions.get(n.id)?.y
      })),
      edges: this._graph.edges.map(e => ({
        source: e.from,
        target: e.to,
        type: e.relation as EdgeType
      }))
    };
  }

  private _calculateLayout(): Map<UUID, { x: number; y: number }> {
    const positions = new Map<UUID, { x: number; y: number }>();
    const nodes = Array.from(this._graph.nodes.keys());
    const centerX = 400;
    const centerY = 300;
    
    // Simple circular layout for now
    nodes.forEach((id, i) => {
      const angle = (2 * Math.PI * i) / nodes.length;
      const radius = 200;
      positions.set(id, {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle)
      });
    });
    
    return positions;
  }

  private _invalidateCache(): void {
    this._pageRankCache.clear();
  }

  get stats(): {
    nodeCount: number;
    edgeCount: number;
    density: number;
    avgDegree: number;
  } {
    const nodeCount = this._graph.nodes.size;
    const edgeCount = this._graph.edges.length;
    const density = nodeCount > 1 ? (2 * edgeCount) / (nodeCount * (nodeCount - 1)) : 0;
    const avgDegree = nodeCount > 0 ? (2 * edgeCount) / nodeCount : 0;
    
    return { nodeCount, edgeCount, density, avgDegree };
  }
}

// Singleton
let _analyzer: AttackSurfaceAnalyzer | null = null;

export function getAttackSurfaceAnalyzer(): AttackSurfaceAnalyzer {
  if (!_analyzer) {
    _analyzer = new AttackSurfaceAnalyzer();
  }
  return _analyzer;
}
