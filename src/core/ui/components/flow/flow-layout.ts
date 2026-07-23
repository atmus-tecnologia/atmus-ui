/**
 * Atmus Flow — layered auto layout (Sugiyama-style: longest-path ranks +
 * barycenter ordering). Pure functions: return the new position of each node.
 */
import { AtmFlowEdge, AtmFlowLayoutDirection, AtmFlowNode, AtmFlowPoint } from './flow.types';

export interface FlowLayoutResult {
  positions: Map<string, AtmFlowPoint>;
  /** New sizes for group nodes, fitted around their laid-out members. */
  groupSizes: Map<string, { w: number; h: number }>;
}

/**
 * Group-aware layout: members are laid out *inside* their group, each group
 * collapses into a single "super-node" for the global pass (inheriting the
 * edges of its members), and group sizes are recomputed to wrap the result.
 */
export function computeFlowLayoutWithGroups(
  nodes: AtmFlowNode[],
  edges: AtmFlowEdge[],
  sizeOf: (node: AtmFlowNode) => { w: number; h: number },
  direction: AtmFlowLayoutDirection,
): FlowLayoutResult {
  const groupIds = new Set(nodes.filter((n) => n.group).map((n) => n.id));
  if (!groupIds.size) {
    return { positions: computeFlowLayout(nodes, edges, sizeOf, direction), groupSizes: new Map() };
  }

  const PAD = 24;
  const PAD_TOP = 40; // room for the group label
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const isMember = (n: AtmFlowNode) => !n.group && !!n.parentId && groupIds.has(n.parentId);

  // 1. Inner layout of each group; offsets are relative to the group box.
  const innerOffset = new Map<string, AtmFlowPoint>();
  const groupBox = new Map<string, { w: number; h: number }>();
  const groupSizes = new Map<string, { w: number; h: number }>();
  for (const gid of groupIds) {
    const members = nodes.filter((n) => isMember(n) && n.parentId === gid);
    if (!members.length) {
      groupBox.set(gid, sizeOf(nodeMap.get(gid)!));
      continue;
    }
    const memberIds = new Set(members.map((m) => m.id));
    const innerEdges = edges.filter((e) => memberIds.has(e.source) && memberIds.has(e.target));
    const pos = computeFlowLayout(members, innerEdges, sizeOf, direction);
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const m of members) {
      const p = pos.get(m.id)!;
      const s = sizeOf(m);
      x0 = Math.min(x0, p.x);
      y0 = Math.min(y0, p.y);
      x1 = Math.max(x1, p.x + s.w);
      y1 = Math.max(y1, p.y + s.h);
    }
    for (const m of members) {
      const p = pos.get(m.id)!;
      innerOffset.set(m.id, { x: p.x - x0, y: p.y - y0 });
    }
    const size = { w: Math.round(x1 - x0 + PAD * 2), h: Math.round(y1 - y0 + PAD_TOP + PAD) };
    groupBox.set(gid, size);
    groupSizes.set(gid, size);
  }

  // 2. Global pass: groups replace their members in the graph.
  const superOf = (id: string) => {
    const n = nodeMap.get(id);
    return n && isMember(n) ? n.parentId! : id;
  };
  const topNodes = nodes.filter((n) => !isMember(n));
  const globalEdges = edges
    .map((e) => ({ ...e, source: superOf(e.source), target: superOf(e.target) }))
    .filter((e) => e.source !== e.target);
  const globalPos = computeFlowLayout(
    topNodes,
    globalEdges,
    (n) => (n.group ? groupBox.get(n.id)! : sizeOf(n)),
    direction,
  );

  // 3. Compose: top-level positions + members anchored to their group.
  const positions = new Map<string, AtmFlowPoint>();
  for (const n of topNodes) {
    const p = globalPos.get(n.id);
    if (p) positions.set(n.id, p);
  }
  for (const n of nodes) {
    if (!isMember(n)) continue;
    const gp = globalPos.get(n.parentId!);
    const off = innerOffset.get(n.id);
    if (gp && off) positions.set(n.id, { x: gp.x + PAD + off.x, y: gp.y + PAD_TOP + off.y });
  }
  return { positions, groupSizes };
}

export function computeFlowLayout(
  nodes: AtmFlowNode[],
  edges: AtmFlowEdge[],
  sizeOf: (node: AtmFlowNode) => { w: number; h: number },
  direction: AtmFlowLayoutDirection,
): Map<string, AtmFlowPoint> {
  const positions = new Map<string, AtmFlowPoint>();
  if (!nodes.length) return positions;

  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const ids = new Set(nodes.map((n) => n.id));
  const outAdj = new Map<string, string[]>();
  const inAdj = new Map<string, string[]>();
  const indeg = new Map<string, number>();
  for (const n of nodes) {
    outAdj.set(n.id, []);
    inAdj.set(n.id, []);
    indeg.set(n.id, 0);
  }
  for (const e of edges) {
    if (!ids.has(e.source) || !ids.has(e.target) || e.source === e.target) continue;
    outAdj.get(e.source)!.push(e.target);
    inAdj.get(e.target)!.push(e.source);
    indeg.set(e.target, indeg.get(e.target)! + 1);
  }

  // Longest-path ranking (Kahn); cyclic leftovers land on rank 0.
  const rank = new Map<string, number>();
  const queue = nodes.filter((n) => indeg.get(n.id) === 0).map((n) => n.id);
  for (const id of queue) rank.set(id, 0);
  const deg = new Map(indeg);
  while (queue.length) {
    const id = queue.shift()!;
    for (const m of outAdj.get(id)!) {
      rank.set(m, Math.max(rank.get(m) ?? 0, rank.get(id)! + 1));
      deg.set(m, deg.get(m)! - 1);
      if (deg.get(m) === 0) queue.push(m);
    }
  }
  for (const n of nodes) if (!rank.has(n.id)) rank.set(n.id, 0);

  // Group per rank, then refine ordering by neighbor barycenter.
  const maxRank = Math.max(...rank.values());
  const ranks: string[][] = Array.from({ length: maxRank + 1 }, () => []);
  for (const n of nodes) ranks[rank.get(n.id)!].push(n.id);
  const orderIdx = new Map<string, number>();
  const reindex = () => ranks.forEach((r) => r.forEach((id, i) => orderIdx.set(id, i)));
  reindex();
  const bary = (id: string, neigh: string[]) =>
    neigh.length
      ? neigh.reduce((acc, m) => acc + (orderIdx.get(m) ?? 0), 0) / neigh.length
      : (orderIdx.get(id) ?? 0);
  for (let pass = 0; pass < 2; pass++) {
    for (let r = 1; r <= maxRank; r++) {
      ranks[r].sort((a, b) => bary(a, inAdj.get(a)!) - bary(b, inAdj.get(b)!));
      reindex();
    }
    for (let r = maxRank - 1; r >= 0; r--) {
      ranks[r].sort((a, b) => bary(a, outAdj.get(a)!) - bary(b, outAdj.get(b)!));
      reindex();
    }
  }

  // Coordinates.
  const RANK_GAP = 90;
  const NODE_GAP = 32;
  let main = 0;
  for (const r of ranks) {
    if (!r.length) continue;
    const sizes = r.map((id) => sizeOf(nodeMap.get(id)!));
    const rankThickness = Math.max(...sizes.map((s) => (direction === 'LR' ? s.w : s.h)));
    const crossTotal =
      sizes.reduce((acc, s) => acc + (direction === 'LR' ? s.h : s.w), 0) + NODE_GAP * (r.length - 1);
    let cross = -crossTotal / 2;
    r.forEach((id, i) => {
      const s = sizes[i];
      if (direction === 'LR') {
        positions.set(id, { x: main + (rankThickness - s.w) / 2, y: cross });
        cross += s.h + NODE_GAP;
      } else {
        positions.set(id, { x: cross, y: main + (rankThickness - s.h) / 2 });
        cross += s.w + NODE_GAP;
      }
    });
    main += rankThickness + RANK_GAP;
  }
  return positions;
}
