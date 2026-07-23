/**
 * Atmus Flow — pure geometry helpers (no Angular): anchors, edge paths
 * (bezier / smoothstep / step / straight) and shared constants.
 */
import {
  AtmFlowEdgeType,
  AtmFlowHandle,
  AtmFlowHandlePosition,
  AtmFlowPoint,
} from './flow.types';

/** Unit direction a handle "points" to, per side. */
export const DIR: Record<AtmFlowHandlePosition, [number, number]> = {
  top: [0, -1],
  right: [1, 0],
  bottom: [0, 1],
  left: [-1, 0],
};

export const OPPOSITE: Record<AtmFlowHandlePosition, AtmFlowHandlePosition> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

export const DEFAULT_HANDLES_LR: AtmFlowHandle[] = [
  { type: 'target', position: 'left' },
  { type: 'source', position: 'right' },
];

export const DEFAULT_HANDLES_TB: AtmFlowHandle[] = [
  { type: 'target', position: 'top' },
  { type: 'source', position: 'bottom' },
];

/** Fallback size for auto-measured nodes (before the first measurement). */
export const NODE_W = 150;
export const NODE_H = 40;
/** Default size for group nodes without explicit width/height. */
export const GROUP_W = 320;
export const GROUP_H = 220;
export const EDGE_COLOR = 'var(--atm-ink-faint)';
export const SELECTED_COLOR = 'var(--atm-primary)';

/** Rounds to 2 decimals — keeps the generated SVG/transform strings short. */
export function f(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Anchor point of a handle on the border of a node box. */
export function anchorOf(
  pos: AtmFlowPoint,
  w: number,
  h: number,
  hd: Pick<AtmFlowHandle, 'position' | 'offset'>,
): AtmFlowPoint {
  const off = hd.offset ?? 0.5;
  switch (hd.position) {
    case 'top':
      return { x: pos.x + w * off, y: pos.y };
    case 'bottom':
      return { x: pos.x + w * off, y: pos.y + h };
    case 'left':
      return { x: pos.x, y: pos.y + h * off };
    default:
      return { x: pos.x + w, y: pos.y + h * off };
  }
}

export function bezierPath(
  s: AtmFlowPoint,
  sp: AtmFlowHandlePosition,
  t: AtmFlowPoint,
  tp: AtmFlowHandlePosition,
): { d: string; mid: AtmFlowPoint } {
  const [sdx, sdy] = DIR[sp];
  const [tdx, tdy] = DIR[tp];
  const dist = Math.max(Math.abs(t.x - s.x), Math.abs(t.y - s.y));
  const c = Math.min(Math.max(dist * 0.5, 40), 260);
  const c1 = { x: s.x + sdx * c, y: s.y + sdy * c };
  const c2 = { x: t.x + tdx * c, y: t.y + tdy * c };
  return {
    d: `M${f(s.x)} ${f(s.y)}C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(t.x)} ${f(t.y)}`,
    mid: {
      x: (s.x + 3 * c1.x + 3 * c2.x + t.x) / 8,
      y: (s.y + 3 * c1.y + 3 * c2.y + t.y) / 8,
    },
  };
}

function orthoPoints(
  s: AtmFlowPoint,
  sp: AtmFlowHandlePosition,
  t: AtmFlowPoint,
  tp: AtmFlowHandlePosition,
): AtmFlowPoint[] {
  const EXT = 24;
  const [sdx, sdy] = DIR[sp];
  const [tdx, tdy] = DIR[tp];
  const p1 = { x: s.x + sdx * EXT, y: s.y + sdy * EXT };
  const p2 = { x: t.x + tdx * EXT, y: t.y + tdy * EXT };
  const sH = sdy === 0;
  const tH = tdy === 0;
  let mids: AtmFlowPoint[];
  if (sH && tH) {
    // Route via mid-x only when the target extension is "ahead" of the
    // source extension for both handle directions; otherwise the segment
    // would run backwards underneath the nodes.
    const ahead = (p2.x - p1.x) * sdx >= 0 && (p1.x - p2.x) * tdx >= 0;
    if (ahead) {
      const mx = (p1.x + p2.x) / 2;
      mids = [
        { x: mx, y: p1.y },
        { x: mx, y: p2.y },
      ];
    } else if (sdx === -tdx) {
      // Opposing handles but target behind → S-shape around via mid-y.
      const my = (p1.y + p2.y) / 2;
      mids = [
        { x: p1.x, y: my },
        { x: p2.x, y: my },
      ];
    } else {
      // Same direction → hug the extreme x.
      const ex = sdx > 0 ? Math.max(p1.x, p2.x) : Math.min(p1.x, p2.x);
      mids = [
        { x: ex, y: p1.y },
        { x: ex, y: p2.y },
      ];
    }
  } else if (!sH && !tH) {
    const ahead = (p2.y - p1.y) * sdy >= 0 && (p1.y - p2.y) * tdy >= 0;
    if (ahead) {
      const my = (p1.y + p2.y) / 2;
      mids = [
        { x: p1.x, y: my },
        { x: p2.x, y: my },
      ];
    } else if (sdy === -tdy) {
      const mx = (p1.x + p2.x) / 2;
      mids = [
        { x: mx, y: p1.y },
        { x: mx, y: p2.y },
      ];
    } else {
      const ey = sdy > 0 ? Math.max(p1.y, p2.y) : Math.min(p1.y, p2.y);
      mids = [
        { x: p1.x, y: ey },
        { x: p2.x, y: ey },
      ];
    }
  } else if (sH) {
    mids = [{ x: p2.x, y: p1.y }];
  } else {
    mids = [{ x: p1.x, y: p2.y }];
  }
  const raw = [s, p1, ...mids, p2, t];
  const pts: AtmFlowPoint[] = [raw[0]];
  for (const p of raw) {
    const last = pts[pts.length - 1];
    if (Math.abs(p.x - last.x) > 0.01 || Math.abs(p.y - last.y) > 0.01) pts.push(p);
  }
  return pts;
}

function roundedPath(pts: AtmFlowPoint[], r: number): string {
  if (pts.length < 2) return '';
  let d = `M${f(pts[0].x)} ${f(pts[0].y)}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const prev = pts[i - 1];
    const p = pts[i];
    const next = pts[i + 1];
    const inLen = Math.hypot(p.x - prev.x, p.y - prev.y);
    const outLen = Math.hypot(next.x - p.x, next.y - p.y);
    const rr = Math.min(r, inLen / 2, outLen / 2);
    if (rr < 0.5) {
      d += `L${f(p.x)} ${f(p.y)}`;
      continue;
    }
    const ix = p.x - ((p.x - prev.x) / inLen) * rr;
    const iy = p.y - ((p.y - prev.y) / inLen) * rr;
    const ox = p.x + ((next.x - p.x) / outLen) * rr;
    const oy = p.y + ((next.y - p.y) / outLen) * rr;
    d += `L${f(ix)} ${f(iy)}Q${f(p.x)} ${f(p.y)} ${f(ox)} ${f(oy)}`;
  }
  const last = pts[pts.length - 1];
  return d + `L${f(last.x)} ${f(last.y)}`;
}

function polylineMid(pts: AtmFlowPoint[]): AtmFlowPoint {
  let total = 0;
  for (let i = 1; i < pts.length; i++) total += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  let walk = total / 2;
  for (let i = 1; i < pts.length; i++) {
    const seg = Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
    if (walk <= seg) {
      const k = seg === 0 ? 0 : walk / seg;
      return {
        x: pts[i - 1].x + (pts[i].x - pts[i - 1].x) * k,
        y: pts[i - 1].y + (pts[i].y - pts[i - 1].y) * k,
      };
    }
    walk -= seg;
  }
  return pts[Math.floor(pts.length / 2)];
}

/** Distance from `p` to the segment a→b. */
function segmentDist(p: AtmFlowPoint, a: AtmFlowPoint, b: AtmFlowPoint): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len2 = dx * dx + dy * dy;
  const k = len2 ? Math.min(Math.max(((p.x - a.x) * dx + (p.y - a.y) * dy) / len2, 0), 1) : 0;
  return Math.hypot(p.x - (a.x + dx * k), p.y - (a.y + dy * k));
}

/**
 * Index of the polyline segment closest to `p` (0 = between pts[0] and
 * pts[1]). Used to decide where a new edge waypoint should be inserted.
 */
export function closestSegment(pts: AtmFlowPoint[], p: AtmFlowPoint): number {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < pts.length - 1; i++) {
    const d = segmentDist(p, pts[i], pts[i + 1]);
    if (d < bestD) {
      bestD = d;
      best = i;
    }
  }
  return best;
}

/**
 * Catmull-Rom spline through every point, emitted as cubic beziers.
 * Phantom endpoints bias the first/last tangents along the handle
 * directions so the wire still leaves/enters the nodes perpendicular.
 */
function catmullRomPath(
  pts: AtmFlowPoint[],
  sDir: [number, number],
  tDir: [number, number],
): string {
  const lead = 60;
  const first = pts[0];
  const last = pts[pts.length - 1];
  const ext = [
    { x: first.x - sDir[0] * lead, y: first.y - sDir[1] * lead },
    ...pts,
    { x: last.x - tDir[0] * lead, y: last.y - tDir[1] * lead },
  ];
  let d = `M${f(first.x)} ${f(first.y)}`;
  for (let i = 1; i < ext.length - 2; i++) {
    const p0 = ext[i - 1];
    const p1 = ext[i];
    const p2 = ext[i + 1];
    const p3 = ext[i + 2];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += `C${f(c1.x)} ${f(c1.y)} ${f(c2.x)} ${f(c2.y)} ${f(p2.x)} ${f(p2.y)}`;
  }
  return d;
}

/**
 * Orthogonal route that visits every waypoint. Each leg travels along the
 * source-handle axis first and turns into the waypoint on the perpendicular
 * one, so the corner lands exactly on the waypoint (clean staircase look).
 */
function orthoPointsVia(
  s: AtmFlowPoint,
  sp: AtmFlowHandlePosition,
  t: AtmFlowPoint,
  tp: AtmFlowHandlePosition,
  via: AtmFlowPoint[],
): AtmFlowPoint[] {
  const EXT = 24;
  const [sdx, sdy] = DIR[sp];
  const [tdx, tdy] = DIR[tp];
  const p1 = { x: s.x + sdx * EXT, y: s.y + sdy * EXT };
  const p2 = { x: t.x + tdx * EXT, y: t.y + tdy * EXT };
  // Leave axis: horizontal when the source handle points left/right.
  const horizontal = sdy === 0;
  const raw: AtmFlowPoint[] = [s, p1];
  let last = p1;
  for (const w of via) {
    raw.push(horizontal ? { x: w.x, y: last.y } : { x: last.x, y: w.y });
    raw.push(w);
    last = w;
  }
  // Final leg: same pattern into the target extension, then the target.
  raw.push(horizontal ? { x: p2.x, y: last.y } : { x: last.x, y: p2.y });
  raw.push(p2, t);
  const pts: AtmFlowPoint[] = [raw[0]];
  for (const p of raw) {
    const prev = pts[pts.length - 1];
    if (Math.abs(p.x - prev.x) > 0.01 || Math.abs(p.y - prev.y) > 0.01) pts.push(p);
  }
  return pts;
}

/**
 * Full path (+ label midpoint) for an edge of the given type. Optional
 * `points` (edge waypoints) force the wire through each of them.
 */
export function edgePath(
  s: AtmFlowPoint,
  sp: AtmFlowHandlePosition,
  t: AtmFlowPoint,
  tp: AtmFlowHandlePosition,
  type: AtmFlowEdgeType,
  points?: AtmFlowPoint[],
): { d: string; mid: AtmFlowPoint } {
  if (points?.length) {
    const anchors = [s, ...points, t];
    if (type === 'straight') {
      let d = `M${f(s.x)} ${f(s.y)}`;
      for (let i = 1; i < anchors.length; i++) d += `L${f(anchors[i].x)} ${f(anchors[i].y)}`;
      return { d, mid: polylineMid(anchors) };
    }
    if (type === 'bezier') {
      return { d: catmullRomPath(anchors, DIR[sp], DIR[tp]), mid: polylineMid(anchors) };
    }
    const pts = orthoPointsVia(s, sp, t, tp, points);
    return { d: roundedPath(pts, type === 'step' ? 0 : 10), mid: polylineMid(pts) };
  }
  if (type === 'straight') {
    return {
      d: `M${f(s.x)} ${f(s.y)}L${f(t.x)} ${f(t.y)}`,
      mid: { x: (s.x + t.x) / 2, y: (s.y + t.y) / 2 },
    };
  }
  if (type === 'bezier') return bezierPath(s, sp, t, tp);
  const pts = orthoPoints(s, sp, t, tp);
  return { d: roundedPath(pts, type === 'step' ? 0 : 10), mid: polylineMid(pts) };
}
