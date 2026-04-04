// SitePulse V3 — Knowledge Graph
// In-memory graph for bug-fix-decision relationships

import type { KGNode, KGEdge, UUID, KGNodeType, KGRelation, Timestamp } from '../core/types.js';
import { eventBus } from '../core/event-bus.js';

type NodeId = UUID;
type EdgeId = UUID;

interface QueryOptions {
  nodeTypes?: KGNodeType[];
  relationTypes?: KGRelation[];
  minWeight?: number;
  limit?: number;
}

interface GraphStats {
  nodeCount: number;
  edgeCount: number;
  nodeTypes: Record<KGNodeType, number>;
  relationTypes: Record<KGRelation, number>;
  avgEdgeWeight: number;
  oldestNode: Timestamp | null;
  newestNode: Timestamp | null;
}

/**
 * Knowledge Graph for SitePulse V3
 * Stores relationships between bugs, fixes, decisions, and patterns
 */
export class KnowledgeGraph {
  private _nodes = new Map<NodeId, KGNode>();
  private _edges = new Map<EdgeId, KGEdge>();
  private _indexByType = new Map<KGNodeType, Set<NodeId>>();
  private _adjacency = new Map<NodeId, Set<EdgeId>>();

  constructor() {
    this._listenToEvents();
  }

  private _listenToEvents(): void {
    // Auto-learn from healing events
    eventBus.on('HEALING_COMPLETED', (event) => {
      const payload = event.payload as { 
        sessionId?: string; 
        success?: boolean;
        findingId?: string;
        filesModified?: string[];
      };
      
      if (payload.success && payload.findingId && payload.sessionId) {
        this.recordFix(payload.findingId, payload.sessionId, payload.filesModified || []);
      }
    });

    // Learn from findings
    eventBus.on('FINDING_DISCOVERED', (event) => {
      const payload = event.payload as { finding?: { id: string; code: string; title: string } };
      if (payload.finding) {
        this.addNode({
          id: payload.finding.id,
          type: 'bug',
          label: payload.finding.title,
          data: { code: payload.finding.code },
          weight: 1
        });
      }
    });
  }

  // ── Node Operations ─────────────────────────────────────────────────

  addNode(node: Omit<KGNode, 'createdAt'>): KGNode {
    const fullNode: KGNode = {
      ...node,
      createdAt: new Date().toISOString() as Timestamp
    };

    this._nodes.set(node.id, fullNode);
    
    // Index by type
    if (!this._indexByType.has(node.type)) {
      this._indexByType.set(node.type, new Set());
    }
    this._indexByType.get(node.type)!.add(node.id);

    // Initialize adjacency
    if (!this._adjacency.has(node.id)) {
      this._adjacency.set(node.id, new Set());
    }

    return fullNode;
  }

  getNode(id: NodeId): KGNode | undefined {
    return this._nodes.get(id);
  }

  removeNode(id: NodeId): boolean {
    // Remove connected edges first
    const edgeIds = this._adjacency.get(id);
    if (edgeIds) {
      edgeIds.forEach(edgeId => this.removeEdge(edgeId));
    }

    // Remove from type index
    const node = this._nodes.get(id);
    if (node) {
      this._indexByType.get(node.type)?.delete(id);
    }

    this._adjacency.delete(id);
    return this._nodes.delete(id);
  }

  // ── Edge Operations ─────────────────────────────────────────────────

  addEdge(edge: Omit<KGEdge, 'id' | 'createdAt'>): KGEdge {
    const id = this._generateId();
    const fullEdge: KGEdge = {
      ...edge,
      id,
      createdAt: new Date().toISOString() as Timestamp
    };

    this._edges.set(id, fullEdge);

    // Update adjacency
    if (!this._adjacency.has(edge.from)) {
      this._adjacency.set(edge.from, new Set());
    }
    if (!this._adjacency.has(edge.to)) {
      this._adjacency.set(edge.to, new Set());
    }
    this._adjacency.get(edge.from)!.add(id);
    this._adjacency.get(edge.to)!.add(id);

    return fullEdge;
  }

  removeEdge(id: EdgeId): boolean {
    const edge = this._edges.get(id);
    if (edge) {
      this._adjacency.get(edge.from)?.delete(id);
      this._adjacency.get(edge.to)?.delete(id);
    }
    return this._edges.delete(id);
  }

  getEdge(id: EdgeId): KGEdge | undefined {
    return this._edges.get(id);
  }

  // ── Query Operations ────────────────────────────────────────────────

  findNodes(options: QueryOptions = {}): KGNode[] {
    let results = Array.from(this._nodes.values());

    if (options.nodeTypes) {
      results = results.filter(n => options.nodeTypes!.includes(n.type));
    }

    if (options.minWeight !== undefined) {
      results = results.filter(n => n.weight >= options.minWeight!);
    }

    // Sort by weight desc, then by createdAt desc
    results.sort((a, b) => {
      if (b.weight !== a.weight) return b.weight - a.weight;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    if (options.limit) {
      results = results.slice(0, options.limit);
    }

    return results;
  }

  findEdges(from?: NodeId, to?: NodeId, relation?: KGRelation): KGEdge[] {
    let results = Array.from(this._edges.values());

    if (from) results = results.filter(e => e.from === from);
    if (to) results = results.filter(e => e.to === to);
    if (relation) results = results.filter(e => e.relation === relation);

    return results.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Get neighbors of a node with their connecting edges
   */
  getNeighbors(nodeId: NodeId): Array<{ node: KGNode; edge: KGEdge }> {
    const edgeIds = this._adjacency.get(nodeId);
    if (!edgeIds) return [];

    const results: Array<{ node: KGNode; edge: KGEdge }> = [];
    
    edgeIds.forEach(edgeId => {
      const edge = this._edges.get(edgeId);
      if (edge) {
        const otherId = edge.from === nodeId ? edge.to : edge.from;
        const otherNode = this._nodes.get(otherId);
        if (otherNode) {
          results.push({ node: otherNode, edge });
        }
      }
    });

    return results.sort((a, b) => b.edge.strength - a.edge.strength);
  }

  /**
   * Find similar bugs to a given bug
   */
  findSimilarBugs(bugId: NodeId, limit = 5): Array<{ node: KGNode; similarity: number }> {
    const bug = this._nodes.get(bugId);
    if (!bug || bug.type !== 'bug') return [];

    const similarities = new Map<NodeId, number>();

    // Direct similarity edges
    this.getNeighbors(bugId).forEach(({ node, edge }) => {
      if (edge.relation === 'similar_to') {
        similarities.set(node.id, edge.strength);
      }
    });

    // Pattern-based similarity
    const bugs = this.findNodes({ nodeTypes: ['bug'] });
    bugs.forEach(other => {
      if (other.id === bugId) return;
      
      // Check if same fix pattern
      const myFixes = this.findEdges(bugId, undefined, 'fixed_by');
      const theirFixes = this.findEdges(other.id, undefined, 'fixed_by');
      
      const commonFixes = myFixes.filter(me => 
        theirFixes.some(te => te.to === me.to)
      );
      
      if (commonFixes.length > 0) {
        const current = similarities.get(other.id) || 0;
        similarities.set(other.id, Math.max(current, 0.7));
      }
    });

    return Array.from(similarities.entries())
      .map(([id, similarity]) => ({ node: this._nodes.get(id)!, similarity }))
      .filter(x => x.node)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit);
  }

  /**
   * Get fix suggestions for a bug based on similar bugs
   */
  suggestFixes(bugId: NodeId): Array<{ 
    fix: KGNode; 
    confidence: number;
    source: 'direct' | 'similar' | 'pattern';
  }> {
    const suggestions: Array<{ fix: KGNode; confidence: number; source: 'direct' | 'similar' | 'pattern' }> = [];

    // Direct fixes
    this.findEdges(bugId, undefined, 'fixed_by').forEach(edge => {
      const fix = this._nodes.get(edge.to);
      if (fix) {
        suggestions.push({ fix, confidence: edge.strength, source: 'direct' });
      }
    });

    // Fixes from similar bugs
    this.findSimilarBugs(bugId).forEach(({ node: similarBug, similarity }) => {
      this.findEdges(similarBug.id, undefined, 'fixed_by').forEach(edge => {
        const fix = this._nodes.get(edge.to);
        if (fix && !suggestions.find(s => s.fix.id === fix.id)) {
          suggestions.push({ 
            fix, 
            confidence: edge.strength * similarity,
            source: 'similar'
          });
        }
      });
    });

    return suggestions.sort((a, b) => b.confidence - a.confidence);
  }

  /**
   * Record a bug-fix relationship
   */
  recordFix(bugId: NodeId, fixId: NodeId, filesModified: string[]): void {
    // Ensure nodes exist
    if (!this._nodes.has(bugId)) {
      this.addNode({
        id: bugId,
        type: 'bug',
        label: `Bug ${bugId.slice(0, 8)}`,
        data: {},
        weight: 1
      });
    }

    if (!this._nodes.has(fixId)) {
      this.addNode({
        id: fixId,
        type: 'fix',
        label: `Fix ${fixId.slice(0, 8)}`,
        data: { filesModified },
        weight: 1
      });
    }

    // Create fixed_by edge
    this.addEdge({
      from: bugId,
      to: fixId,
      relation: 'fixed_by',
      strength: 1.0
    });

    // Create caused_by edge (reverse)
    this.addEdge({
      from: fixId,
      to: bugId,
      relation: 'caused_by',
      strength: 0.5
    });

    // Update weights
    const bug = this._nodes.get(bugId);
    if (bug) {
      bug.weight += 0.1;
    }
  }

  /**
   * Record a pattern that was learned
   */
  recordPattern(name: string, description: string, relatedBugs: NodeId[]): UUID {
    const patternId = this._generateId();
    
    this.addNode({
      id: patternId,
      type: 'pattern',
      label: name,
      data: { description },
      weight: 0.5
    });

    relatedBugs.forEach(bugId => {
      this.addEdge({
        from: bugId,
        to: patternId,
        relation: 'similar_to',
        strength: 0.8
      });
    });

    return patternId;
  }

  /**
   * Reinforce an edge (increase its weight)
   */
  reinforceEdge(from: NodeId, to: NodeId, relation: KGRelation): void {
    const edge = Array.from(this._edges.values()).find(
      e => e.from === from && e.to === to && e.relation === relation
    );
    
    if (edge) {
      edge.strength = Math.min(1, edge.strength + 0.1);
    }
  }

  // ── Stats & Export ──────────────────────────────────────────────────

  get stats(): GraphStats {
    const nodeTypes: Record<string, number> = {};
    const relationTypes: Record<string, number> = {};
    
    this._nodes.forEach(n => {
      nodeTypes[n.type] = (nodeTypes[n.type] || 0) + 1;
    });
    
    this._edges.forEach(e => {
      relationTypes[e.relation] = (relationTypes[e.relation] || 0) + 1;
    });

    const edgeWeights = Array.from(this._edges.values()).map(e => e.strength);
    const timestamps = Array.from(this._nodes.values()).map(n => n.createdAt);

    return {
      nodeCount: this._nodes.size,
      edgeCount: this._edges.size,
      nodeTypes: nodeTypes as Record<KGNodeType, number>,
      relationTypes: relationTypes as Record<KGRelation, number>,
      avgEdgeWeight: edgeWeights.length > 0 
        ? edgeWeights.reduce((a, b) => a + b, 0) / edgeWeights.length 
        : 0,
      oldestNode: timestamps.length > 0 ? timestamps.sort()[0] : null,
      newestNode: timestamps.length > 0 ? timestamps.sort().reverse()[0] : null
    };
  }

  /**
   * Export graph in various formats
   */
  export(format: 'json' | 'cytoscape' | 'gexf'): object {
    switch (format) {
      case 'cytoscape':
        return {
          elements: [
            ...Array.from(this._nodes.values()).map(n => ({
              data: { ...n }
            })),
            ...Array.from(this._edges.values()).map(e => ({
              data: { ...e, source: e.from, target: e.to }
            }))
          ]
        };
      
      case 'gexf':
        // Simplified GEXF
        return {
          version: '1.3',
          nodes: Array.from(this._nodes.values()),
          edges: Array.from(this._edges.values())
        };
      
      default:
        return {
          nodes: Array.from(this._nodes.values()),
          edges: Array.from(this._edges.values()),
          stats: this.stats
        };
    }
  }

  private _generateId(): UUID {
    return `kg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }

  /**
   * Clear all data
   */
  clear(): void {
    this._nodes.clear();
    this._edges.clear();
    this._indexByType.clear();
    this._adjacency.clear();
  }
}

// Singleton
let _graph: KnowledgeGraph | null = null;

export function getKnowledgeGraph(): KnowledgeGraph {
  if (!_graph) {
    _graph = new KnowledgeGraph();
  }
  return _graph;
}
