import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  Directive,
  ElementRef,
  NgZone,
  TemplateRef,
  afterNextRender,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import { atmUid } from '../../types';
import {
  AtmFlowConnectEnd,
  AtmFlowConnectInvalid,
  AtmFlowConnection,
  AtmFlowContextMenuEvent,
  AtmFlowDeleteEvent,
  AtmFlowEdge,
  AtmFlowEdgeEvent,
  AtmFlowEdgeType,
  AtmFlowHandle,
  AtmFlowHandlePosition,
  AtmFlowHandleType,
  AtmFlowJson,
  AtmFlowInvalidReason,
  AtmFlowLayoutDirection,
  AtmFlowMarker,
  AtmFlowNode,
  AtmFlowNodeDragEvent,
  AtmFlowNodeEvent,
  AtmFlowPoint,
  AtmFlowReconnectEvent,
  AtmFlowSelection,
  AtmFlowValidator,
  AtmFlowViewport,
} from './flow.types';

/* ------------------------------------------------------------------ */
/* Geometry helpers                                                    */
/* ------------------------------------------------------------------ */

const DIR: Record<AtmFlowHandlePosition, [number, number]> = {
  top: [0, -1],
  right: [1, 0],
  bottom: [0, 1],
  left: [-1, 0],
};

const OPPOSITE: Record<AtmFlowHandlePosition, AtmFlowHandlePosition> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

const DEFAULT_HANDLES_LR: AtmFlowHandle[] = [
  { type: 'target', position: 'left' },
  { type: 'source', position: 'right' },
];

const DEFAULT_HANDLES_TB: AtmFlowHandle[] = [
  { type: 'target', position: 'top' },
  { type: 'source', position: 'bottom' },
];

const NODE_W = 150;
const NODE_H = 40;
const EDGE_COLOR = 'var(--atm-ink-faint)';
const SELECTED_COLOR = 'var(--atm-primary)';

function f(n: number): number {
  return Math.round(n * 100) / 100;
}

function anchorOf(
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

function bezierPath(
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

function edgePath(
  s: AtmFlowPoint,
  sp: AtmFlowHandlePosition,
  t: AtmFlowPoint,
  tp: AtmFlowHandlePosition,
  type: AtmFlowEdgeType,
): { d: string; mid: AtmFlowPoint } {
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

/* ------------------------------------------------------------------ */
/* Internal view models                                                */
/* ------------------------------------------------------------------ */

interface HandleView {
  key: string;
  id: string | undefined;
  type: AtmFlowHandleType;
  handle: AtmFlowHandle;
  left: string | null;
  top: string | null;
  right: string | null;
  bottom: string | null;
}

interface NodeView {
  node: AtmFlowNode;
  x: number;
  y: number;
  selected: boolean;
  template: TemplateRef<unknown> | null;
  handles: HandleView[];
}

interface EdgeView {
  edge: AtmFlowEdge;
  d: string;
  color: string;
  width: number;
  selected: boolean;
  animated: boolean;
  dashed: boolean;
  dimmed: boolean;
  labelX: number;
  labelY: number;
  markerStart: string | null;
  markerEnd: string | null;
  /** Reconnect grip positions (slightly outside each anchor, on the wire). */
  sx: number;
  sy: number;
  tx: number;
  ty: number;
}

interface MarkerDef {
  id: string;
  type: AtmFlowMarker;
  color: string;
}

interface Candidate {
  nodeId: string;
  handleId: string | undefined;
  key: string;
  anchor: AtmFlowPoint;
  position: AtmFlowHandlePosition;
}

/** Measured info of an <atm-flow-handle> placed inside a custom node. */
interface CustomHandleInfo {
  key: string;
  id: string | undefined;
  type: AtmFlowHandleType;
  position: AtmFlowHandlePosition;
  dataType: string | undefined;
  /** Center offset relative to the node's top-left corner (flow units). */
  x: number;
  y: number;
}

/* ------------------------------------------------------------------ */
/* Custom node template directive                                      */
/* ------------------------------------------------------------------ */

/**
 * Declares a custom node renderer inside `<atm-flow>`:
 *
 * ```html
 * <atm-flow [(nodes)]="nodes" [(edges)]="edges">
 *   <ng-template atmFlowNode="card" let-node let-selected="selected">
 *     <div class="...">{{ node.data.title }}</div>
 *   </ng-template>
 * </atm-flow>
 * ```
 */
@Directive({ selector: 'ng-template[atmFlowNode]' })
export class AtmFlowNodeDef {
  readonly type = input.required<string>({ alias: 'atmFlowNode' });
  readonly template = inject(TemplateRef);

  static ngTemplateContextGuard(
    _dir: AtmFlowNodeDef,
    ctx: unknown,
  ): ctx is { $implicit: AtmFlowNode; selected: boolean; zoom: number } {
    return true;
  }
}

/* ------------------------------------------------------------------ */
/* atm-flow                                                            */
/* ------------------------------------------------------------------ */

/**
 * Node-based flow editor (React Flow style): pan/zoom canvas, draggable
 * nodes, drag-to-connect handles, custom node templates, edge types
 * (bezier/smoothstep/step/straight) with labels & markers, minimap,
 * controls, dotted background, box selection, snap-to-grid, helper lines,
 * auto layout, undo/redo, copy/paste and JSON import/export.
 * Viewport culling keeps it fast with thousands of nodes.
 */
@Component({
  selector: 'atm-flow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: {
    class: 'relative block w-full overflow-hidden rounded-atm-lg border border-line bg-app outline-none',
    tabindex: '0',
    '[style.height.px]': 'height()',
    '(keydown)': 'onKeydown($event)',
  },
  styles: `
    @keyframes atm-flow-dash {
      from { stroke-dashoffset: 10; }
      to { stroke-dashoffset: 0; }
    }
    .atm-flow-edge-animated {
      stroke-dasharray: 6 4;
      animation: atm-flow-dash 0.45s linear infinite;
    }
  `,
  template: `
    <div
      #pane
      class="absolute inset-0 touch-none overflow-hidden select-none"
      [class.cursor-grabbing]="panning()"
      (wheel)="onWheel($event)"
      (pointerdown)="onPanePointerDown($event)"
      (dblclick)="onPaneDblClick($event)"
      (contextmenu)="onPaneContextMenu($event)"
    >
      <!-- Background pattern -->
      @if (background() !== 'none') {
        <svg class="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          <defs>
            <pattern
              [id]="uid + '-bg'"
              patternUnits="userSpaceOnUse"
              [attr.width]="bgPattern().size"
              [attr.height]="bgPattern().size"
              [attr.x]="bgPattern().x"
              [attr.y]="bgPattern().y"
            >
              @if (background() === 'dots') {
                <circle
                  [attr.cx]="bgPattern().size / 2"
                  [attr.cy]="bgPattern().size / 2"
                  [attr.r]="bgPattern().dot"
                  fill="var(--atm-line-strong)"
                  opacity="0.75"
                />
              } @else {
                <path
                  [attr.d]="'M' + bgPattern().size + ' 0H0V' + bgPattern().size"
                  fill="none"
                  stroke="var(--atm-line)"
                  stroke-width="1"
                />
              }
            </pattern>
          </defs>
          <rect width="100%" height="100%" [attr.fill]="'url(#' + uid + '-bg)'" />
        </svg>
      }

      <!-- World (transformed layer) -->
      <div class="absolute top-0 left-0 origin-top-left" [style.transform]="worldTransform()">
        <!-- Edges -->
        <svg class="absolute top-0 left-0 overflow-visible" width="2" height="2" aria-hidden="true">
          <defs>
            @for (m of markerDefs(); track m.id) {
              <marker
                [id]="m.id"
                viewBox="0 0 10 10"
                markerWidth="9"
                markerHeight="9"
                refY="5"
                [attr.refX]="m.type === 'dot' ? 5 : 8"
                orient="auto-start-reverse"
              >
                @switch (m.type) {
                  @case ('arrow') {
                    <path
                      d="M1.5 1.5L8.5 5L1.5 8.5"
                      fill="none"
                      [attr.stroke]="m.color"
                      stroke-width="1.6"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  }
                  @case ('dot') {
                    <circle cx="5" cy="5" r="3.4" [attr.fill]="m.color" />
                  }
                  @default {
                    <path d="M1 1L9 5L1 9Z" [attr.fill]="m.color" />
                  }
                }
              </marker>
            }
          </defs>
          @for (ev of edgeViews(); track ev.edge.id) {
            <g
              class="cursor-pointer"
              [attr.opacity]="ev.dimmed ? 0.25 : null"
              (pointerdown)="onEdgePointerDown(ev.edge, $event)"
              (dblclick)="onEdgeDblClick(ev.edge, $event)"
              (contextmenu)="onEdgeContextMenu(ev.edge, $event)"
            >
              <path [attr.d]="ev.d" fill="none" stroke="transparent" [attr.stroke-width]="edgeHitWidth()" />
              <path
                [attr.d]="ev.d"
                fill="none"
                [attr.stroke]="ev.color"
                [attr.stroke-width]="ev.width"
                [attr.stroke-dasharray]="ev.dashed && !ev.animated ? '6 4' : null"
                [attr.marker-start]="ev.markerStart"
                [attr.marker-end]="ev.markerEnd"
                [class.atm-flow-edge-animated]="ev.animated"
              />
            </g>
          }
          <!-- Reconnect grips on selected edges -->
          @if (reconnectable() && !locked()) {
            @for (ev of edgeViews(); track 'r' + ev.edge.id) {
              @if (ev.selected && !ev.dimmed) {
                <circle
                  class="cursor-crosshair"
                  [attr.cx]="ev.sx"
                  [attr.cy]="ev.sy"
                  r="5"
                  fill="var(--atm-primary)"
                  stroke="var(--atm-surface)"
                  stroke-width="1.5"
                  (pointerdown)="onReconnectPointerDown(ev.edge, 'source', $event)"
                />
                <circle
                  class="cursor-crosshair"
                  [attr.cx]="ev.tx"
                  [attr.cy]="ev.ty"
                  r="5"
                  fill="var(--atm-primary)"
                  stroke="var(--atm-surface)"
                  stroke-width="1.5"
                  (pointerdown)="onReconnectPointerDown(ev.edge, 'target', $event)"
                />
              }
            }
          }
          @if (connLine(); as c) {
            <path
              [attr.d]="c.d"
              fill="none"
              [attr.stroke]="c.valid === false ? 'var(--atm-danger)' : 'var(--atm-primary)'"
              stroke-width="1.8"
              class="atm-flow-edge-animated pointer-events-none"
            />
          }
        </svg>

        <!-- Helper (alignment) lines -->
        @if (helperX() !== null) {
          <div
            class="pointer-events-none absolute w-px bg-primary/70"
            [style.left.px]="helperX()"
            [style.top.px]="worldRect().y"
            [style.height.px]="worldRect().h"
          ></div>
        }
        @if (helperY() !== null) {
          <div
            class="pointer-events-none absolute h-px bg-primary/70"
            [style.top.px]="helperY()"
            [style.left.px]="worldRect().x"
            [style.width.px]="worldRect().w"
          ></div>
        }

        <!-- Edge labels -->
        @for (ev of edgeViews(); track ev.edge.id) {
          @if (ev.edge.label) {
            <div
              class="pointer-events-none absolute top-0 left-0 z-10 max-w-40 truncate rounded-md border
                border-line bg-surface px-1.5 py-0.5 text-[10px] font-medium whitespace-nowrap text-ink-muted"
              [style.transform]="'translate(' + ev.labelX + 'px,' + ev.labelY + 'px) translate(-50%, -50%)'"
            >
              {{ ev.edge.label }}
            </div>
          }
        }

        <!-- Nodes -->
        @for (nv of nodeViews(); track nv.node.id) {
          <div
            #nodeEl
            class="absolute top-0 left-0"
            [class.cursor-grab]="!locked() && nv.node.draggable !== false"
            [attr.data-flow-node]="nv.node.id"
            [style.transform]="'translate(' + nv.x + 'px,' + nv.y + 'px)'"
            [style.width.px]="nv.node.width ?? null"
            [style.height.px]="nv.node.height ?? null"
            [style.zIndex]="nv.selected ? 30 : 20"
            (pointerdown)="onNodePointerDown(nv.node, $event)"
            (dblclick)="onNodeDblClick(nv.node, $event)"
            (contextmenu)="onNodeContextMenu(nv.node, $event)"
          >
            @if (nv.template) {
              <ng-container
                [ngTemplateOutlet]="nv.template"
                [ngTemplateOutletContext]="{ $implicit: nv.node, selected: nv.selected, zoom: viewport().zoom }"
              />
              @if (nv.selected) {
                <div class="pointer-events-none absolute -inset-1 rounded-atm-lg border border-primary/70"></div>
              }
            } @else {
              <div
                class="flex h-full items-center gap-2 rounded-atm border bg-surface px-3.5 py-2 text-[13px]
                  font-medium text-ink shadow-sm"
                [class]="nv.selected ? 'border-primary ring-2 ring-[var(--atm-ring)]' : 'border-line-strong/70'"
              >
                @if (nv.node.icon) {
                  <i
                    [class]="nv.node.icon + ' shrink-0 text-sm'"
                    [style.color]="nv.node.color || 'var(--atm-ink-muted)'"
                    aria-hidden="true"
                  ></i>
                } @else if (nv.node.color) {
                  <span class="size-2 shrink-0 rounded-full" [style.background]="nv.node.color"></span>
                }
                <span class="truncate">{{ nv.node.label ?? nv.node.id }}</span>
              </div>
            }

            <!-- Handles -->
            @if (nv.node.connectable !== false) {
              @for (h of nv.handles; track h.key) {
                <span
                  class="absolute size-2.5 rounded-full border-2 border-surface bg-ink-faint transition-transform
                    hover:scale-125 hover:bg-primary"
                  [class.cursor-crosshair]="!locked()"
                  [class.bg-primary]="candidateKey() === h.key"
                  [class.scale-125]="candidateKey() === h.key"
                  [style.left]="h.left"
                  [style.top]="h.top"
                  [style.right]="h.right"
                  [style.bottom]="h.bottom"
                  [attr.data-flow-key]="h.key"
                  [attr.data-flow-handle]="h.id ?? ''"
                  [attr.data-flow-handle-type]="h.type"
                  [attr.data-flow-handle-node]="nv.node.id"
                  (pointerdown)="onHandlePointerDown(nv.node, h, $event)"
                ></span>
              }
            }

            <!-- Resize grip -->
            @if (nv.selected && nv.node.resizable && !locked()) {
              <span
                class="absolute -right-1 -bottom-1 size-3 cursor-nwse-resize rounded-xs border border-surface
                  bg-primary"
                (pointerdown)="onResizePointerDown(nv.node, $event)"
              ></span>
            }
          </div>
        }
      </div>

      <!-- Box selection (screen space) -->
      @if (selectBox(); as b) {
        <div
          class="pointer-events-none absolute border border-primary/60 bg-primary/10"
          [style.left.px]="b.x"
          [style.top.px]="b.y"
          [style.width.px]="b.w"
          [style.height.px]="b.h"
        ></div>
      }
    </div>

    <!-- Controls -->
    @if (controls()) {
      <div
        class="absolute bottom-3 left-3 z-40 flex flex-col overflow-hidden rounded-atm border border-line
          bg-surface shadow-atm"
      >
        @for (btn of ctrlButtons(); track btn.action) {
          <button
            type="button"
            class="atm-focus flex size-8 cursor-pointer items-center justify-center border-b border-line
              text-xs text-ink-muted transition-colors last:border-b-0 hover:bg-surface-alt hover:text-ink"
            [class.text-primary]="btn.active"
            [attr.aria-label]="btn.label"
            [title]="btn.label"
            (click)="onCtrl(btn.action)"
          >
            <i [class]="btn.icon" aria-hidden="true"></i>
          </button>
        }
      </div>
      <span
        class="absolute bottom-3 left-14 z-40 rounded-md border border-line bg-surface/85 px-1.5 py-0.5
          text-[10px] font-medium text-ink-faint tabular-nums backdrop-blur-sm"
      >
        {{ zoomPct() }}%
      </span>
    }

    <!-- Minimap -->
    @if (minimap()) {
      <svg
        #mmEl
        class="absolute right-3 bottom-3 z-40 h-28 w-44 cursor-pointer rounded-atm border border-line
          bg-surface/85 shadow-atm backdrop-blur-sm"
        [attr.viewBox]="mmView().vb"
        preserveAspectRatio="xMidYMid meet"
        (pointerdown)="onMinimapPointerDown($event)"
      >
        @for (r of mmView().rects; track r.id) {
          <rect
            [attr.x]="r.x"
            [attr.y]="r.y"
            [attr.width]="r.w"
            [attr.height]="r.h"
            [attr.rx]="mmView().rx"
            [attr.fill]="r.color"
            [attr.opacity]="r.sel ? 0.95 : 0.4"
          />
        }
        <rect
          [attr.x]="mmView().vp.x"
          [attr.y]="mmView().vp.y"
          [attr.width]="mmView().vp.w"
          [attr.height]="mmView().vp.h"
          [attr.rx]="mmView().rx"
          fill="var(--atm-primary)"
          opacity="0.1"
          stroke="var(--atm-primary)"
          [attr.stroke-width]="mmView().stroke"
        />
      </svg>
    }
  `,
})
export class AtmFlow {
  /* ---------------------------------------------------------------- */
  /* Inputs / outputs                                                  */
  /* ---------------------------------------------------------------- */

  /** Two-way bindable node list. */
  readonly nodes = model<AtmFlowNode[]>([]);
  /** Two-way bindable edge list. */
  readonly edges = model<AtmFlowEdge[]>([]);
  /** Canvas height in px (null = control via CSS). */
  readonly height = input<number | null>(520);
  readonly background = input<'dots' | 'lines' | 'none'>('dots');
  readonly gridSize = input(20);
  readonly snapToGrid = input(false);
  /** Alignment helper lines while dragging a single node. */
  readonly helperLines = input(true);
  readonly minimap = input(true);
  readonly controls = input(true);
  /** Read-only mode: pan/zoom only (two-way bindable — controls can toggle it). */
  readonly locked = model(false);
  readonly minZoom = input(0.1);
  readonly maxZoom = input(2.5);
  /** Edge style used when an edge has no `type` and for new connections. */
  readonly defaultEdgeType = input<AtmFlowEdgeType>('bezier');
  /** Marker used when an edge has no `markerEnd`. */
  readonly defaultMarkerEnd = input<AtmFlowMarker>('arrow-closed');
  /** Default handle orientation + auto layout direction. */
  readonly direction = input<AtmFlowLayoutDirection>('LR');
  /** Automatically append the edge when a valid connection is dropped. */
  readonly autoConnect = input(true);
  /** Selected edges expose endpoint grips that can be dragged to reconnect. */
  readonly reconnectable = input(true);
  readonly preventCycles = input(false);
  /** Custom connection validation (connection limit, typing rules…). */
  readonly connectionValidator = input<AtmFlowValidator | null>(null);
  /**
   * Compatibility map for typed ports: source `dataType` → allowed target
   * `dataType`s (ex.: `{ text: ['text', 'any'] }`). Types absent from the map
   * require an exact match. Ports without `dataType` connect to anything.
   */
  readonly compatibleTypes = input<Record<string, string[]> | null>(null);
  /** Above this node count only the visible viewport slice is rendered. */
  readonly cullingThreshold = input(250);
  /** Fit the graph on first render. */
  readonly autoFit = input(true);

  readonly nodeClick = output<AtmFlowNodeEvent>();
  readonly nodeDoubleClick = output<AtmFlowNodeEvent>();
  readonly nodeDragStart = output<AtmFlowNodeDragEvent>();
  readonly nodeDragStop = output<AtmFlowNodeDragEvent>();
  readonly edgeClick = output<AtmFlowEdgeEvent>();
  readonly edgeDoubleClick = output<AtmFlowEdgeEvent>();
  readonly edgeReconnect = output<AtmFlowReconnectEvent>();
  readonly paneClick = output<AtmFlowPoint>();
  readonly connect = output<AtmFlowConnection>();
  readonly connectEnd = output<AtmFlowConnectEnd>();
  /** Fired when a connection is dropped on a handle/node but rejected (type mismatch, ciclo…). */
  readonly connectInvalid = output<AtmFlowConnectInvalid>();
  readonly selectionChange = output<AtmFlowSelection>();
  readonly viewportChange = output<AtmFlowViewport>();
  readonly contextMenu = output<AtmFlowContextMenuEvent>();
  readonly deleted = output<AtmFlowDeleteEvent>();

  /* ---------------------------------------------------------------- */
  /* State                                                             */
  /* ---------------------------------------------------------------- */

  protected readonly uid = atmUid('atm-flow');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  private readonly paneRef = viewChild.required<ElementRef<HTMLElement>>('pane');
  private readonly mmRef = viewChild<ElementRef<SVGSVGElement>>('mmEl');
  private readonly nodeEls = viewChildren<ElementRef<HTMLElement>>('nodeEl');
  private readonly nodeDefs = contentChildren(AtmFlowNodeDef);

  readonly viewport = signal<AtmFlowViewport>({ x: 0, y: 0, zoom: 1 });
  private readonly hostSize = signal({ w: 0, h: 0 });
  private readonly dims = signal(new Map<string, { w: number; h: number }>());
  readonly selectedNodes = signal<ReadonlySet<string>>(new Set());
  readonly selectedEdges = signal<ReadonlySet<string>>(new Set());

  protected readonly panning = signal(false);
  protected readonly selectBox = signal<{ x: number; y: number; w: number; h: number } | null>(null);
  protected readonly connLine = signal<{ d: string; valid: boolean | null } | null>(null);
  /** @internal — read by AtmFlowNodeHandle to highlight itself as drop target. */
  readonly candidateKey = signal<string | null>(null);
  protected readonly helperX = signal<number | null>(null);
  protected readonly helperY = signal<number | null>(null);
  protected readonly reconnectingId = signal<string | null>(null);

  private nodeRo: ResizeObserver | null = null;
  private readonly roReady = signal(false);
  private observed = new Map<HTMLElement, string>();

  private past: { nodes: AtmFlowNode[]; edges: AtmFlowEdge[] }[] = [];
  private future: { nodes: AtmFlowNode[]; edges: AtmFlowEdge[] }[] = [];
  private clipboard: { nodes: AtmFlowNode[]; edges: AtmFlowEdge[] } | null = null;
  private pasteCount = 0;
  private lastNudge = 0;
  private didAutoFit = false;

  private readonly pointers = new Map<number, AtmFlowPoint>();
  private pinch: { dist: number; center: AtmFlowPoint; vp: AtmFlowViewport } | null = null;

  /** Live <atm-flow-handle> elements and their measured info per node. */
  private readonly customHandleEls = new Map<HTMLElement, { nodeId: string; handle: AtmFlowNodeHandle }>();
  private readonly customHandles = signal(new Map<string, CustomHandleInfo[]>());

  /* ---------------------------------------------------------------- */
  /* Derived state                                                     */
  /* ---------------------------------------------------------------- */

  protected readonly worldTransform = computed(() => {
    const vp = this.viewport();
    return `translate(${vp.x}px, ${vp.y}px) scale(${vp.zoom})`;
  });

  protected readonly zoomPct = computed(() => Math.round(this.viewport().zoom * 100));

  protected readonly ctrlButtons = computed(() => [
    { action: 'zoom-in', icon: 'icofont-plus', label: 'Aproximar', active: false },
    { action: 'zoom-out', icon: 'icofont-minus', label: 'Afastar', active: false },
    { action: 'fit', icon: 'icofont-focus', label: 'Enquadrar', active: false },
    { action: 'layout', icon: 'icofont-site-map', label: 'Auto organizar', active: false },
    {
      action: 'lock',
      icon: this.locked() ? 'icofont-lock' : 'icofont-unlock',
      label: this.locked() ? 'Desbloquear' : 'Bloquear',
      active: this.locked(),
    },
  ]);

  protected onCtrl(action: string): void {
    if (action === 'zoom-in') this.zoomIn();
    else if (action === 'zoom-out') this.zoomOut();
    else if (action === 'fit') this.fitView();
    else if (action === 'layout') this.autoLayout();
    else if (action === 'lock') this.locked.set(!this.locked());
  }

  protected readonly bgPattern = computed(() => {
    const vp = this.viewport();
    const size = Math.max(this.gridSize() * vp.zoom, 6);
    return {
      size: f(size),
      x: f(vp.x % size),
      y: f(vp.y % size),
      dot: f(Math.min(Math.max(vp.zoom, 0.6), 1.4)),
    };
  });

  private readonly nodeMap = computed(() => {
    const map = new Map<string, AtmFlowNode>();
    for (const n of this.nodes()) map.set(n.id, n);
    return map;
  });

  protected readonly worldRect = computed(() => {
    const vp = this.viewport();
    const { w, h } = this.hostSize();
    return { x: -vp.x / vp.zoom, y: -vp.y / vp.zoom, w: w / vp.zoom, h: h / vp.zoom };
  });

  private readonly cullingActive = computed(() => this.nodes().length > this.cullingThreshold());

  /** Quantized viewport rect so culling only recomputes when crossing tiles. */
  private readonly cullRect = computed(
    () => {
      const r = this.worldRect();
      const Q = 256;
      return {
        x0: Math.floor(r.x / Q - 1) * Q,
        y0: Math.floor(r.y / Q - 1) * Q,
        x1: Math.ceil((r.x + r.w) / Q + 1) * Q,
        y1: Math.ceil((r.y + r.h) / Q + 1) * Q,
      };
    },
    { equal: (a, b) => a.x0 === b.x0 && a.y0 === b.y0 && a.x1 === b.x1 && a.y1 === b.y1 },
  );

  private readonly visibleNodes = computed(() => {
    const nodes = this.nodes();
    if (!this.cullingActive()) return nodes;
    const r = this.cullRect();
    const dims = this.dims();
    return nodes.filter((n) => {
      const w = n.width ?? dims.get(n.id)?.w ?? NODE_W;
      const h = n.height ?? dims.get(n.id)?.h ?? NODE_H;
      return n.position.x + w >= r.x0 && n.position.x <= r.x1 && n.position.y + h >= r.y0 && n.position.y <= r.y1;
    });
  });

  private readonly visibleEdges = computed(() => {
    const edges = this.edges();
    const nodeMap = this.nodeMap();
    if (!this.cullingActive()) return edges.filter((e) => nodeMap.has(e.source) && nodeMap.has(e.target));
    const r = this.cullRect();
    return edges.filter((e) => {
      const s = nodeMap.get(e.source);
      const t = nodeMap.get(e.target);
      if (!s || !t) return false;
      const pad = 80;
      return (
        Math.max(s.position.x, t.position.x) + pad >= r.x0 &&
        Math.min(s.position.x, t.position.x) - pad <= r.x1 &&
        Math.max(s.position.y, t.position.y) + pad >= r.y0 &&
        Math.min(s.position.y, t.position.y) - pad <= r.y1
      );
    });
  });

  protected readonly edgeHitWidth = computed(() =>
    f(Math.min(Math.max(12 / this.viewport().zoom, 12), 48)),
  );

  protected readonly nodeViews = computed<NodeView[]>(() => {
    const sel = this.selectedNodes();
    const defs = this.nodeDefs();
    const custom = this.customHandles();
    return this.visibleNodes().map((node) => {
      const template = node.type
        ? (defs.find((d) => d.type() === node.type)?.template ?? null)
        : null;
      // Nodes com <atm-flow-handle> no template não recebem os handles default.
      const hasCustom = !!custom.get(node.id)?.length;
      return {
        node,
        x: f(node.position.x),
        y: f(node.position.y),
        selected: sel.has(node.id),
        template,
        handles: hasCustom ? [] : this.handlesOf(node).map((h, i) => this.handleView(node.id, h, i)),
      };
    });
  });

  private readonly markerMap = computed(() => {
    const map = new Map<string, MarkerDef>();
    const selE = this.selectedEdges();
    const defMarker = this.defaultMarkerEnd();
    for (const e of this.visibleEdges()) {
      const color = selE.has(e.id) ? SELECTED_COLOR : (e.color ?? EDGE_COLOR);
      for (const m of [e.markerStart ?? 'none', e.markerEnd ?? defMarker]) {
        if (m === 'none') continue;
        const key = `${m}|${color}`;
        if (!map.has(key)) map.set(key, { id: `${this.uid}-m${map.size}`, type: m, color });
      }
    }
    return map;
  });

  protected readonly markerDefs = computed(() => [...this.markerMap().values()]);

  protected readonly edgeViews = computed<EdgeView[]>(() => {
    const selE = this.selectedEdges();
    const markers = this.markerMap();
    const defType = this.defaultEdgeType();
    const defMarker = this.defaultMarkerEnd();
    const nodeMap = this.nodeMap();
    const out: EdgeView[] = [];
    for (const edge of this.visibleEdges()) {
      const sn = nodeMap.get(edge.source);
      const tn = nodeMap.get(edge.target);
      if (!sn || !tn) continue;
      const s = this.resolveHandle(sn, 'source', edge.sourceHandle);
      const t = this.resolveHandle(tn, 'target', edge.targetHandle);
      const { d, mid } = edgePath(s.pt, s.pos, t.pt, t.pos, edge.type ?? defType);
      const selected = selE.has(edge.id);
      const color = selected ? SELECTED_COLOR : (edge.color ?? EDGE_COLOR);
      const ms = edge.markerStart ?? 'none';
      const me = edge.markerEnd ?? defMarker;
      out.push({
        edge,
        d,
        selected,
        color,
        width: (edge.width ?? 1.5) + (selected ? 0.5 : 0),
        animated: !!edge.animated,
        dashed: !!edge.dashed,
        dimmed: this.reconnectingId() === edge.id,
        labelX: f(mid.x),
        labelY: f(mid.y),
        markerStart: ms === 'none' ? null : `url(#${markers.get(`${ms}|${color}`)?.id})`,
        markerEnd: me === 'none' ? null : `url(#${markers.get(`${me}|${color}`)?.id})`,
        sx: f(s.pt.x + DIR[s.pos][0] * 11),
        sy: f(s.pt.y + DIR[s.pos][1] * 11),
        tx: f(t.pt.x + DIR[t.pos][0] * 11),
        ty: f(t.pt.y + DIR[t.pos][1] * 11),
      });
    }
    return out;
  });

  private readonly contentBBox = computed(() => {
    const nodes = this.nodes();
    if (!nodes.length) return null;
    const dims = this.dims();
    let x0 = Infinity;
    let y0 = Infinity;
    let x1 = -Infinity;
    let y1 = -Infinity;
    for (const n of nodes) {
      const w = n.width ?? dims.get(n.id)?.w ?? NODE_W;
      const h = n.height ?? dims.get(n.id)?.h ?? NODE_H;
      if (n.position.x < x0) x0 = n.position.x;
      if (n.position.y < y0) y0 = n.position.y;
      if (n.position.x + w > x1) x1 = n.position.x + w;
      if (n.position.y + h > y1) y1 = n.position.y + h;
    }
    return { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
  });

  protected readonly mmView = computed(() => {
    const wr = this.worldRect();
    const content = this.contentBBox() ?? wr;
    const sel = this.selectedNodes();
    const dims = this.dims();
    const pad = 40;
    const x = Math.min(content.x, wr.x) - pad;
    const y = Math.min(content.y, wr.y) - pad;
    const x2 = Math.max(content.x + content.w, wr.x + wr.w) + pad;
    const y2 = Math.max(content.y + content.h, wr.y + wr.h) + pad;
    const w = Math.max(x2 - x, 1);
    const h = Math.max(y2 - y, 1);
    const scale = Math.max(w, h) / 176;
    const rects = this.nodes()
      .slice(0, 1500)
      .map((n) => ({
        id: n.id,
        x: f(n.position.x),
        y: f(n.position.y),
        w: f(n.width ?? dims.get(n.id)?.w ?? NODE_W),
        h: f(n.height ?? dims.get(n.id)?.h ?? NODE_H),
        color: sel.has(n.id) ? 'var(--atm-primary)' : (n.color ?? 'var(--atm-ink-faint)'),
        sel: sel.has(n.id),
      }));
    return {
      vb: `${f(x)} ${f(y)} ${f(w)} ${f(h)}`,
      bounds: { x, y, w, h },
      rects,
      vp: { x: f(wr.x), y: f(wr.y), w: f(wr.w), h: f(wr.h) },
      stroke: f(scale * 1.5),
      rx: f(scale * 3),
    };
  });

  /* ---------------------------------------------------------------- */
  /* Setup                                                             */
  /* ---------------------------------------------------------------- */

  constructor() {
    afterNextRender(() => {
      const hostRo = new ResizeObserver((entries) => {
        const rect = entries[0]?.contentRect;
        if (rect) this.zone.run(() => this.hostSize.set({ w: rect.width, h: rect.height }));
      });
      hostRo.observe(this.host.nativeElement);

      this.nodeRo = new ResizeObserver((entries) => {
        const next = new Map(this.dims());
        let changed = false;
        for (const entry of entries) {
          const el = entry.target as HTMLElement;
          const id = el.dataset['flowNode'];
          if (!id) continue;
          const w = el.offsetWidth;
          const h = el.offsetHeight;
          if (!w || !h) continue;
          const prev = next.get(id);
          if (!prev || Math.abs(prev.w - w) > 0.5 || Math.abs(prev.h - h) > 0.5) {
            next.set(id, { w, h });
            changed = true;
          }
        }
        if (changed) this.zone.run(() => this.dims.set(next));
      });
      this.roReady.set(true);

      this.destroyRef.onDestroy(() => {
        hostRo.disconnect();
        this.nodeRo?.disconnect();
      });
    });

    // Measure node elements as they enter/leave the viewport.
    effect(() => {
      const els = this.nodeEls();
      if (!this.roReady() || !this.nodeRo) return;
      untracked(() => {
        const current = new Set(els.map((e) => e.nativeElement));
        for (const [el] of this.observed) {
          if (!current.has(el)) {
            this.nodeRo!.unobserve(el);
            this.observed.delete(el);
          }
        }
        for (const el of current) {
          if (!this.observed.has(el)) {
            this.observed.set(el, el.dataset['flowNode'] ?? '');
            this.nodeRo!.observe(el);
          }
        }
      });
    });

    // Fit view once, as soon as we know the host size and have nodes.
    effect(() => {
      const size = this.hostSize();
      const count = this.nodes().length;
      if (!this.autoFit() || this.didAutoFit || !size.w || !count) return;
      this.didAutoFit = true;
      requestAnimationFrame(() => this.fitView());
    });

    // Re-measure <atm-flow-handle> offsets whenever node sizes change.
    effect(() => {
      this.dims();
      untracked(() => {
        for (const [el, reg] of this.customHandleEls) this.measureCustomHandle(el, reg.nodeId, reg.handle);
      });
    });
  }

  /* ---------------------------------------------------------------- */
  /* Custom handle registry (@internal — used by AtmFlowNodeHandle)    */
  /* ---------------------------------------------------------------- */

  /** @internal */
  registerCustomHandle(el: HTMLElement, handle: AtmFlowNodeHandle): void {
    const nodeId = el.closest<HTMLElement>('[data-flow-node]')?.dataset['flowNode'];
    if (!nodeId) return;
    this.customHandleEls.set(el, { nodeId, handle });
    el.dataset['flowHandleNode'] = nodeId;
    this.measureCustomHandle(el, nodeId, handle);
  }

  /** @internal */
  refreshCustomHandle(el: HTMLElement): void {
    const reg = this.customHandleEls.get(el);
    if (reg) this.measureCustomHandle(el, reg.nodeId, reg.handle);
  }

  /** @internal */
  unregisterCustomHandle(el: HTMLElement): void {
    const reg = this.customHandleEls.get(el);
    this.customHandleEls.delete(el);
    if (!reg) return;
    const map = new Map(this.customHandles());
    const list = (map.get(reg.nodeId) ?? []).filter((i) => i.key !== reg.handle.key);
    if (list.length) map.set(reg.nodeId, list);
    else map.delete(reg.nodeId);
    this.customHandles.set(map);
  }

  /** @internal */
  startCustomConnection(el: HTMLElement, e: PointerEvent): void {
    const reg = this.customHandleEls.get(el);
    if (!reg || e.button !== 0 || this.locked()) return;
    const node = this.nodeMap().get(reg.nodeId);
    if (!node || node.connectable === false) return;
    const info = this.customHandles()
      .get(reg.nodeId)
      ?.find((h) => h.key === reg.handle.key);
    if (!info) return;
    e.stopPropagation();
    e.preventDefault();
    this.startConnectionDrag({
      fixedNodeId: node.id,
      fixedHandleId: info.id,
      fixedType: info.type,
      from: { x: node.position.x + info.x, y: node.position.y + info.y },
      fromPos: info.position,
      startClient: { x: e.clientX, y: e.clientY },
      onDrop: this.makeConnectDrop(node.id, info.id),
    });
  }

  private measureCustomHandle(el: HTMLElement, nodeId: string, handle: AtmFlowNodeHandle): void {
    const nodeEl = el.closest<HTMLElement>('[data-flow-node]');
    if (!nodeEl) return;
    const zoom = this.viewport().zoom;
    const nr = nodeEl.getBoundingClientRect();
    const hr = el.getBoundingClientRect();
    if (!nr.width || !hr.width) return;
    const x = (hr.left + hr.width / 2 - nr.left) / zoom;
    const y = (hr.top + hr.height / 2 - nr.top) / zoom;
    const w = nr.width / zoom;
    const h = nr.height / zoom;
    // Side inferred from the closest node border, unless explicitly set.
    const dists: [AtmFlowHandlePosition, number][] = [
      ['left', x],
      ['right', w - x],
      ['top', y],
      ['bottom', h - y],
    ];
    dists.sort((a, b) => a[1] - b[1]);
    const info: CustomHandleInfo = {
      key: handle.key,
      id: handle.id(),
      type: handle.type(),
      position: handle.position() ?? dists[0][0],
      dataType: handle.dataType(),
      x: f(x),
      y: f(y),
    };
    const map = new Map(this.customHandles());
    const list = (map.get(nodeId) ?? []).filter((i) => i.key !== info.key);
    list.push(info);
    map.set(nodeId, list);
    const prev = this.customHandles().get(nodeId)?.find((i) => i.key === info.key);
    if (
      prev &&
      prev.x === info.x &&
      prev.y === info.y &&
      prev.id === info.id &&
      prev.type === info.type &&
      prev.position === info.position &&
      prev.dataType === info.dataType
    ) {
      return; // unchanged — avoid signal churn
    }
    this.customHandles.set(map);
  }

  /* ---------------------------------------------------------------- */
  /* Public API                                                        */
  /* ---------------------------------------------------------------- */

  /** Converts client (screen) coordinates into flow coordinates. */
  screenToFlow(p: AtmFlowPoint): AtmFlowPoint {
    const rect = this.paneRef().nativeElement.getBoundingClientRect();
    const vp = this.viewport();
    return { x: (p.x - rect.left - vp.x) / vp.zoom, y: (p.y - rect.top - vp.y) / vp.zoom };
  }

  /** Converts flow coordinates into client (screen) coordinates. */
  flowToScreen(p: AtmFlowPoint): AtmFlowPoint {
    const rect = this.paneRef().nativeElement.getBoundingClientRect();
    const vp = this.viewport();
    return { x: rect.left + vp.x + p.x * vp.zoom, y: rect.top + vp.y + p.y * vp.zoom };
  }

  getViewport(): AtmFlowViewport {
    return this.viewport();
  }

  setViewport(vp: AtmFlowViewport): void {
    this.setVp(vp);
  }

  zoomIn(): void {
    this.zoomAtCenter(this.viewport().zoom * 1.2);
  }

  zoomOut(): void {
    this.zoomAtCenter(this.viewport().zoom / 1.2);
  }

  zoomTo(zoom: number): void {
    this.zoomAtCenter(zoom);
  }

  /** Zooms/pans so every node fits inside the canvas. */
  fitView(padding = 48): void {
    const b = this.contentBBox();
    const { w, h } = this.hostSize();
    if (!b || !w || !h) return;
    const zoom = Math.min(
      Math.max(Math.min((w - padding * 2) / Math.max(b.w, 1), (h - padding * 2) / Math.max(b.h, 1)), this.minZoom()),
      Math.min(this.maxZoom(), 1.5),
    );
    this.setVp({
      zoom,
      x: w / 2 - (b.x + b.w / 2) * zoom,
      y: h / 2 - (b.y + b.h / 2) * zoom,
    });
  }

  /** Serializable snapshot (save & restore). */
  toJson(): AtmFlowJson {
    return structuredClone({ nodes: this.nodes(), edges: this.edges(), viewport: this.viewport() });
  }

  /** Restores a snapshot produced by toJson() (or built by hand). */
  loadJson(json: AtmFlowJson): void {
    this.snapshot();
    this.nodes.set(structuredClone(json.nodes ?? []));
    this.edges.set(structuredClone(json.edges ?? []));
    this.select([], []);
    if (json.viewport) this.setVp(json.viewport);
    else requestAnimationFrame(() => this.fitView());
  }

  selectAll(): void {
    this.select(
      this.nodes().map((n) => n.id),
      this.edges().map((e) => e.id),
    );
  }

  clearSelection(): void {
    this.select([], []);
  }

  /** Deletes selected nodes/edges (honoring `deletable: false`). */
  deleteSelection(): void {
    if (this.locked()) return;
    const selN = this.selectedNodes();
    const selE = this.selectedEdges();
    const nodeMap = this.nodeMap();
    const doomed = new Set(
      [...selN].filter((id) => nodeMap.get(id) && nodeMap.get(id)!.deletable !== false),
    );
    const edgeDoomed = (e: AtmFlowEdge) =>
      doomed.has(e.source) || doomed.has(e.target) || (selE.has(e.id) && e.deletable !== false);
    if (!doomed.size && !this.edges().some(edgeDoomed)) return;
    this.snapshot();
    const removedNodes = this.nodes().filter((n) => doomed.has(n.id));
    const removedEdges = this.edges().filter(edgeDoomed);
    this.nodes.update((ns) => ns.filter((n) => !doomed.has(n.id)));
    this.edges.update((es) => es.filter((e) => !edgeDoomed(e)));
    this.select([], []);
    this.deleted.emit({ nodes: removedNodes, edges: removedEdges });
  }

  undo(): void {
    const prev = this.past.pop();
    if (!prev) return;
    this.future.push(this.cloneState());
    this.nodes.set(prev.nodes);
    this.edges.set(prev.edges);
    this.select([], []);
  }

  redo(): void {
    const next = this.future.pop();
    if (!next) return;
    this.past.push(this.cloneState());
    this.nodes.set(next.nodes);
    this.edges.set(next.edges);
    this.select([], []);
  }

  copySelection(): void {
    const selN = this.selectedNodes();
    if (!selN.size) return;
    this.clipboard = structuredClone({
      nodes: this.nodes().filter((n) => selN.has(n.id)),
      edges: this.edges().filter((e) => selN.has(e.source) && selN.has(e.target)),
    });
    this.pasteCount = 0;
  }

  paste(): void {
    if (!this.clipboard || this.locked()) return;
    this.snapshot();
    this.pasteCount++;
    const off = 28 * this.pasteCount;
    const idMap = new Map<string, string>();
    const nodes = this.clipboard.nodes.map((n) => {
      const id = atmUid('atm-n');
      idMap.set(n.id, id);
      return structuredClone({ ...n, id, position: { x: n.position.x + off, y: n.position.y + off } });
    });
    const edges = this.clipboard.edges.map((e) =>
      structuredClone({ ...e, id: atmUid('atm-e'), source: idMap.get(e.source)!, target: idMap.get(e.target)! }),
    );
    this.nodes.update((ns) => [...ns, ...nodes]);
    this.edges.update((es) => [...es, ...edges]);
    this.select(nodes.map((n) => n.id), edges.map((e) => e.id));
  }

  /**
   * Layered auto layout (Sugiyama-style: longest-path ranks + barycenter
   * ordering). Fits the view afterwards.
   */
  autoLayout(direction: AtmFlowLayoutDirection = this.direction()): void {
    const nodes = this.nodes();
    if (!nodes.length) return;
    this.snapshot();
    const dims = this.dims();
    const sizeOf = (n: AtmFlowNode) => ({
      w: n.width ?? dims.get(n.id)?.w ?? NODE_W,
      h: n.height ?? dims.get(n.id)?.h ?? NODE_H,
    });
    const ids = new Set(nodes.map((n) => n.id));
    const outAdj = new Map<string, string[]>();
    const inAdj = new Map<string, string[]>();
    const indeg = new Map<string, number>();
    for (const n of nodes) {
      outAdj.set(n.id, []);
      inAdj.set(n.id, []);
      indeg.set(n.id, 0);
    }
    for (const e of this.edges()) {
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
    const nodeMap = this.nodeMap();
    const RANK_GAP = 90;
    const NODE_GAP = 32;
    const positions = new Map<string, AtmFlowPoint>();
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
    this.nodes.update((ns) =>
      ns.map((n) => (positions.has(n.id) ? { ...n, position: positions.get(n.id)! } : n)),
    );
    requestAnimationFrame(() => this.fitView());
  }

  /* ---------------------------------------------------------------- */
  /* Pointer interactions                                              */
  /* ---------------------------------------------------------------- */

  protected onWheel(e: WheelEvent): void {
    e.preventDefault();
    const factor = Math.exp(-e.deltaY * (e.ctrlKey ? 0.008 : 0.0016));
    this.zoomAt({ x: e.clientX, y: e.clientY }, this.viewport().zoom * factor);
  }

  protected onPaneDblClick(e: MouseEvent): void {
    this.zoomAt({ x: e.clientX, y: e.clientY }, this.viewport().zoom * 1.35);
  }

  protected onPanePointerDown(e: PointerEvent): void {
    this.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (this.pointers.size === 2) {
      const [a, b] = [...this.pointers.values()];
      this.pinch = {
        dist: Math.hypot(b.x - a.x, b.y - a.y),
        center: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
        vp: this.viewport(),
      };
      return;
    }
    if (e.button === 0 && e.shiftKey) {
      this.startBoxSelection(e);
      return;
    }
    if (e.button !== 0 && e.button !== 1) return;
    e.preventDefault();
    const start = { vp: this.viewport(), x: e.clientX, y: e.clientY };
    let moved = false;
    this.beginDrag(
      (ev) => {
        this.pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
        if (this.pinch) {
          this.updatePinch();
          return;
        }
        const dx = ev.clientX - start.x;
        const dy = ev.clientY - start.y;
        if (!moved && Math.hypot(dx, dy) < 3) return;
        moved = true;
        this.panning.set(true);
        this.setVp({ ...start.vp, x: start.vp.x + dx, y: start.vp.y + dy });
      },
      (ev) => {
        this.pointers.clear();
        this.pinch = null;
        this.panning.set(false);
        if (!moved && ev.button === 0) {
          this.select([], []);
          this.paneClick.emit(this.screenToFlow({ x: ev.clientX, y: ev.clientY }));
        }
      },
    );
  }

  private updatePinch(): void {
    if (!this.pinch || this.pointers.size < 2) return;
    const [a, b] = [...this.pointers.values()];
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    const center = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
    const rect = this.paneRef().nativeElement.getBoundingClientRect();
    const zoom = this.clampZoom((this.pinch.vp.zoom * dist) / Math.max(this.pinch.dist, 1));
    const worldX = (this.pinch.center.x - rect.left - this.pinch.vp.x) / this.pinch.vp.zoom;
    const worldY = (this.pinch.center.y - rect.top - this.pinch.vp.y) / this.pinch.vp.zoom;
    this.setVp({
      zoom,
      x: center.x - rect.left - worldX * zoom,
      y: center.y - rect.top - worldY * zoom,
    });
  }

  private startBoxSelection(e: PointerEvent): void {
    e.preventDefault();
    const rect = this.paneRef().nativeElement.getBoundingClientRect();
    const sx = e.clientX - rect.left;
    const sy = e.clientY - rect.top;
    this.beginDrag(
      (ev) => {
        const cx = ev.clientX - rect.left;
        const cy = ev.clientY - rect.top;
        this.selectBox.set({
          x: Math.min(sx, cx),
          y: Math.min(sy, cy),
          w: Math.abs(cx - sx),
          h: Math.abs(cy - sy),
        });
      },
      () => {
        const box = this.selectBox();
        this.selectBox.set(null);
        if (!box || (box.w < 4 && box.h < 4)) return;
        const vp = this.viewport();
        const wx0 = (box.x - vp.x) / vp.zoom;
        const wy0 = (box.y - vp.y) / vp.zoom;
        const wx1 = (box.x + box.w - vp.x) / vp.zoom;
        const wy1 = (box.y + box.h - vp.y) / vp.zoom;
        const dims = this.dims();
        const hit = this.nodes()
          .filter((n) => {
            const w = n.width ?? dims.get(n.id)?.w ?? NODE_W;
            const h = n.height ?? dims.get(n.id)?.h ?? NODE_H;
            return n.position.x + w >= wx0 && n.position.x <= wx1 && n.position.y + h >= wy0 && n.position.y <= wy1;
          })
          .map((n) => n.id);
        this.select([...this.selectedNodes(), ...hit], [...this.selectedEdges()]);
      },
    );
  }

  protected onNodePointerDown(node: AtmFlowNode, e: PointerEvent): void {
    if (e.button !== 0) {
      if (!this.selectedNodes().has(node.id)) this.select([node.id], []);
      return;
    }
    e.stopPropagation();
    const multi = e.ctrlKey || e.metaKey || e.shiftKey;
    const wasSelected = this.selectedNodes().has(node.id);
    if (!wasSelected) {
      this.select(
        multi ? [...this.selectedNodes(), node.id] : [node.id],
        multi ? [...this.selectedEdges()] : [],
      );
    }
    const canDrag = !this.locked() && node.draggable !== false;
    const startClient = { x: e.clientX, y: e.clientY };
    const startFlow = this.screenToFlow(startClient);
    const dragged = new Map<string, AtmFlowPoint>();
    for (const id of this.selectedNodes()) {
      const n = this.nodeMap().get(id);
      if (n && n.draggable !== false) dragged.set(id, { ...n.position });
    }
    let moved = false;
    this.beginDrag(
      (ev) => {
        if (!canDrag) return;
        if (!moved && Math.hypot(ev.clientX - startClient.x, ev.clientY - startClient.y) < 3) return;
        if (!moved) {
          moved = true;
          this.snapshot();
          const nodeMap = this.nodeMap();
          this.nodeDragStart.emit({
            node,
            nodes: [...dragged.keys()].map((id) => nodeMap.get(id)!).filter(Boolean),
          });
        }
        const pt = this.screenToFlow({ x: ev.clientX, y: ev.clientY });
        let dx = pt.x - startFlow.x;
        let dy = pt.y - startFlow.y;
        const origin = dragged.get(node.id);
        if (origin) {
          let nx = origin.x + dx;
          let ny = origin.y + dy;
          if (this.snapToGrid()) {
            const g = this.gridSize();
            nx = Math.round(nx / g) * g;
            ny = Math.round(ny / g) * g;
          }
          if (dragged.size === 1 && this.helperLines() && !this.cullingActive()) {
            const snap = this.alignmentSnap(node, nx, ny);
            nx = snap.x;
            ny = snap.y;
          } else {
            this.helperX.set(null);
            this.helperY.set(null);
          }
          dx = nx - origin.x;
          dy = ny - origin.y;
        }
        const patch = new Map<string, Partial<AtmFlowNode>>();
        for (const [id, pos] of dragged) {
          patch.set(id, { position: { x: pos.x + dx, y: pos.y + dy } });
        }
        this.patchNodes(patch);
      },
      (ev) => {
        this.helperX.set(null);
        this.helperY.set(null);
        if (!moved) {
          if (wasSelected && multi) {
            const next = new Set(this.selectedNodes());
            next.delete(node.id);
            this.select([...next], [...this.selectedEdges()]);
          }
          this.nodeClick.emit({ node, event: ev });
        } else {
          const nodeMap = this.nodeMap();
          this.nodeDragStop.emit({
            node: nodeMap.get(node.id) ?? node,
            nodes: [...dragged.keys()].map((id) => nodeMap.get(id)!).filter(Boolean),
          });
        }
      },
    );
  }

  private alignmentSnap(node: AtmFlowNode, x: number, y: number): AtmFlowPoint {
    const { w, h } = this.sizeOf(node);
    const tol = 6 / this.viewport().zoom;
    let bestX: { diff: number; adjust: number; line: number } | null = null;
    let bestY: { diff: number; adjust: number; line: number } | null = null;
    const myXs = [x, x + w / 2, x + w];
    const myYs = [y, y + h / 2, y + h];
    for (const other of this.visibleNodes()) {
      if (other.id === node.id) continue;
      const os = this.sizeOf(other);
      const oxs = [other.position.x, other.position.x + os.w / 2, other.position.x + os.w];
      const oys = [other.position.y, other.position.y + os.h / 2, other.position.y + os.h];
      for (const mx of myXs) {
        for (const ox of oxs) {
          const diff = Math.abs(mx - ox);
          if (diff < tol && (!bestX || diff < bestX.diff)) bestX = { diff, adjust: ox - mx, line: ox };
        }
      }
      for (const my of myYs) {
        for (const oy of oys) {
          const diff = Math.abs(my - oy);
          if (diff < tol && (!bestY || diff < bestY.diff)) bestY = { diff, adjust: oy - my, line: oy };
        }
      }
    }
    this.helperX.set(bestX ? f(bestX.line) : null);
    this.helperY.set(bestY ? f(bestY.line) : null);
    return { x: x + (bestX?.adjust ?? 0), y: y + (bestY?.adjust ?? 0) };
  }

  protected onResizePointerDown(node: AtmFlowNode, e: PointerEvent): void {
    if (e.button !== 0 || this.locked()) return;
    e.stopPropagation();
    e.preventDefault();
    const start = { x: e.clientX, y: e.clientY, ...this.sizeOf(node) };
    let moved = false;
    this.beginDrag((ev) => {
      if (!moved) {
        moved = true;
        this.snapshot();
      }
      const zoom = this.viewport().zoom;
      let w = Math.max(60, start.w + (ev.clientX - start.x) / zoom);
      let h = Math.max(32, start.h + (ev.clientY - start.y) / zoom);
      if (this.snapToGrid()) {
        const g = this.gridSize();
        w = Math.round(w / g) * g;
        h = Math.round(h / g) * g;
      }
      this.patchNodes(new Map([[node.id, { width: Math.round(w), height: Math.round(h) }]]));
    });
  }

  protected onHandlePointerDown(node: AtmFlowNode, hv: HandleView, e: PointerEvent): void {
    if (e.button !== 0 || this.locked() || node.connectable === false) return;
    e.stopPropagation();
    e.preventDefault();
    const { w, h } = this.sizeOf(node);
    this.startConnectionDrag({
      fixedNodeId: node.id,
      fixedHandleId: hv.id,
      fixedType: hv.type,
      from: anchorOf(node.position, w, h, hv.handle),
      fromPos: hv.handle.position,
      startClient: { x: e.clientX, y: e.clientY },
      onDrop: this.makeConnectDrop(node.id, hv.id),
    });
  }

  private makeConnectDrop(
    fixedNodeId: string,
    fixedHandleId: string | undefined,
  ): (conn: AtmFlowConnection | null, pos: AtmFlowPoint, moved: boolean) => void {
    return (conn, pos, moved) => {
      if (!moved) return;
      if (conn) {
        this.snapshot();
        if (this.autoConnect()) {
          const edge: AtmFlowEdge = { id: atmUid('atm-e'), ...conn };
          this.edges.update((es) => [...es, edge]);
        }
        this.connect.emit(conn);
        this.connectEnd.emit({ connection: conn, position: pos, source: fixedNodeId, sourceHandle: fixedHandleId });
      } else {
        this.connectEnd.emit({ connection: null, position: pos, source: fixedNodeId, sourceHandle: fixedHandleId });
      }
    };
  }

  protected onReconnectPointerDown(edge: AtmFlowEdge, end: 'source' | 'target', e: PointerEvent): void {
    if (e.button !== 0 || this.locked() || !this.reconnectable()) return;
    e.stopPropagation();
    e.preventDefault();
    // The end being dragged is released; the opposite end stays fixed.
    const fixedType: AtmFlowHandleType = end === 'source' ? 'target' : 'source';
    const fixedNodeId = fixedType === 'source' ? edge.source : edge.target;
    const fixedHandleId = fixedType === 'source' ? edge.sourceHandle : edge.targetHandle;
    const fixedNode = this.nodeMap().get(fixedNodeId);
    if (!fixedNode) return;
    const resolved = this.resolveHandle(fixedNode, fixedType, fixedHandleId);
    this.reconnectingId.set(edge.id);
    this.startConnectionDrag({
      fixedNodeId,
      fixedHandleId,
      fixedType,
      from: resolved.pt,
      fromPos: resolved.pos,
      startClient: { x: e.clientX, y: e.clientY },
      excludeEdgeId: edge.id,
      onDrop: (conn, _pos, moved) => {
        this.reconnectingId.set(null);
        if (!moved || !conn) return;
        const same =
          conn.source === edge.source &&
          conn.target === edge.target &&
          (conn.sourceHandle ?? '') === (edge.sourceHandle ?? '') &&
          (conn.targetHandle ?? '') === (edge.targetHandle ?? '');
        if (same) return;
        this.snapshot();
        const updated: AtmFlowEdge = {
          ...edge,
          source: conn.source,
          target: conn.target,
          sourceHandle: conn.sourceHandle,
          targetHandle: conn.targetHandle,
        };
        this.edges.update((es) => es.map((x) => (x.id === edge.id ? updated : x)));
        this.edgeReconnect.emit({
          edge: updated,
          previous: {
            source: edge.source,
            target: edge.target,
            sourceHandle: edge.sourceHandle,
            targetHandle: edge.targetHandle,
          },
          connection: conn,
        });
      },
    });
  }

  private startConnectionDrag(opts: {
    fixedNodeId: string;
    fixedHandleId: string | undefined;
    fixedType: AtmFlowHandleType;
    from: AtmFlowPoint;
    fromPos: AtmFlowHandlePosition;
    startClient: AtmFlowPoint;
    excludeEdgeId?: string;
    onDrop: (conn: AtmFlowConnection | null, pos: AtmFlowPoint, moved: boolean) => void;
  }): void {
    let candidate: Candidate | null = null;
    let conn: AtmFlowConnection | null = null;
    let moved = false;
    this.beginDrag(
      (ev) => {
        if (!moved && Math.hypot(ev.clientX - opts.startClient.x, ev.clientY - opts.startClient.y) < 3) return;
        moved = true;
        const pt = this.screenToFlow({ x: ev.clientX, y: ev.clientY });
        candidate = this.findCandidate(ev, opts.fixedType, opts.fixedNodeId);
        conn = candidate
          ? this.buildConnection(opts.fixedNodeId, opts.fixedHandleId, opts.fixedType, candidate)
          : null;
        const valid = conn ? this.isValidConnection(conn, opts.excludeEdgeId) : null;
        this.candidateKey.set(candidate && valid ? candidate.key : null);
        const end = candidate && valid ? candidate.anchor : pt;
        const endPos = candidate && valid ? candidate.position : OPPOSITE[opts.fromPos];
        this.connLine.set({ d: bezierPath(opts.from, opts.fromPos, end, endPos).d, valid });
      },
      (ev) => {
        const pos = this.screenToFlow({ x: ev.clientX, y: ev.clientY });
        this.connLine.set(null);
        this.candidateKey.set(null);
        const reason = conn ? this.validateConnection(conn, opts.excludeEdgeId) : null;
        if (moved && conn && reason) {
          this.connectInvalid.emit({
            connection: conn,
            reason,
            sourceType: this.handleDataType(conn.source, 'source', conn.sourceHandle),
            targetType: this.handleDataType(conn.target, 'target', conn.targetHandle),
          });
        }
        opts.onDrop(conn && !reason ? conn : null, pos, moved);
      },
    );
  }

  private findCandidate(ev: PointerEvent, fixedType: AtmFlowHandleType, fixedNodeId: string): Candidate | null {
    const el = document.elementFromPoint(ev.clientX, ev.clientY);
    if (!el) return null;
    const wanted: AtmFlowHandleType = fixedType === 'source' ? 'target' : 'source';
    const handleEl = el.closest<HTMLElement>('[data-flow-handle-type]');
    let nodeId: string | null = null;
    let handleId: string | undefined;
    let elKey: string | null = null;
    if (handleEl && handleEl.dataset['flowHandleType'] === wanted) {
      nodeId = handleEl.dataset['flowHandleNode'] ?? null;
      handleId = handleEl.dataset['flowHandle'] || undefined;
      elKey = handleEl.dataset['flowKey'] ?? null;
    } else {
      nodeId = el.closest<HTMLElement>('[data-flow-node]')?.dataset['flowNode'] ?? null;
    }
    if (!nodeId || nodeId === fixedNodeId) return null;
    const target = this.nodeMap().get(nodeId);
    if (!target || target.connectable === false) return null;
    // Handles custom do node alvo.
    const custom = this.customHandles().get(nodeId)?.filter((x) => x.type === wanted) ?? [];
    if (custom.length) {
      const hd =
        (handleId !== undefined ? custom.find((x) => (x.id ?? '') === handleId) : undefined) ??
        (elKey ? custom.find((x) => x.key === elKey) : undefined) ??
        custom[0];
      return {
        nodeId,
        handleId: hd.id,
        key: hd.key,
        anchor: { x: target.position.x + hd.x, y: target.position.y + hd.y },
        position: hd.position,
      };
    }
    const handles = this.handlesOf(target);
    const hd =
      (handleId !== undefined
        ? handles.find((x) => x.type === wanted && x.id === handleId)
        : undefined) ?? handles.find((x) => x.type === wanted);
    if (!hd) return null;
    const resolved = this.resolveHandle(target, wanted, hd.id);
    return {
      nodeId,
      handleId: hd.id,
      key: elKey ?? this.handleKeyOf(nodeId, wanted, hd.id, handles.indexOf(hd)),
      anchor: resolved.pt,
      position: resolved.pos,
    };
  }

  private buildConnection(
    fixedNodeId: string,
    fixedHandleId: string | undefined,
    fixedType: AtmFlowHandleType,
    cand: Candidate,
  ): AtmFlowConnection {
    return fixedType === 'source'
      ? { source: fixedNodeId, sourceHandle: fixedHandleId, target: cand.nodeId, targetHandle: cand.handleId }
      : { source: cand.nodeId, sourceHandle: cand.handleId, target: fixedNodeId, targetHandle: fixedHandleId };
  }

  private isValidConnection(conn: AtmFlowConnection, excludeEdgeId?: string): boolean {
    return this.validateConnection(conn, excludeEdgeId) === null;
  }

  /** @returns null when valid, otherwise the rejection reason. */
  private validateConnection(conn: AtmFlowConnection, excludeEdgeId?: string): AtmFlowInvalidReason | null {
    if (conn.source === conn.target) return 'invalid';
    const nodeMap = this.nodeMap();
    if (!nodeMap.has(conn.source) || !nodeMap.has(conn.target)) return 'invalid';
    const dup = this.edges().some(
      (e) =>
        e.id !== excludeEdgeId &&
        e.source === conn.source &&
        e.target === conn.target &&
        (e.sourceHandle ?? '') === (conn.sourceHandle ?? '') &&
        (e.targetHandle ?? '') === (conn.targetHandle ?? ''),
    );
    if (dup) return 'duplicate';
    const st = this.handleDataType(conn.source, 'source', conn.sourceHandle);
    const tt = this.handleDataType(conn.target, 'target', conn.targetHandle);
    if (st && tt && !this.typesCompatible(st, tt)) return 'type-mismatch';
    if (this.preventCycles() && this.createsCycle(conn, excludeEdgeId)) return 'cycle';
    const validator = this.connectionValidator();
    if (validator && !validator(conn, this.nodes(), this.edges())) return 'validator';
    return null;
  }

  private typesCompatible(sourceType: string, targetType: string): boolean {
    const map = this.compatibleTypes();
    if (map && map[sourceType]) return map[sourceType].includes(targetType);
    return sourceType === targetType;
  }

  /** dataType do port (custom registry primeiro, depois node.handles). */
  private handleDataType(nodeId: string, type: AtmFlowHandleType, handleId?: string): string | undefined {
    const node = this.nodeMap().get(nodeId);
    if (!node) return undefined;
    const custom = this.customHandles().get(nodeId)?.filter((h) => h.type === type);
    if (custom?.length) {
      const hd = (handleId !== undefined ? custom.find((h) => h.id === handleId) : undefined) ?? custom[0];
      return hd?.dataType;
    }
    const list = this.handlesOf(node).filter((h) => h.type === type);
    const hd = (handleId !== undefined ? list.find((h) => h.id === handleId) : undefined) ?? list[0];
    return hd?.dataType;
  }

  private createsCycle(conn: AtmFlowConnection, excludeEdgeId?: string): boolean {
    const adj = new Map<string, string[]>();
    for (const e of this.edges()) {
      if (e.id === excludeEdgeId) continue;
      if (!adj.has(e.source)) adj.set(e.source, []);
      adj.get(e.source)!.push(e.target);
    }
    const stack = [conn.target];
    const seen = new Set<string>();
    while (stack.length) {
      const id = stack.pop()!;
      if (id === conn.source) return true;
      if (seen.has(id)) continue;
      seen.add(id);
      for (const m of adj.get(id) ?? []) stack.push(m);
    }
    return false;
  }

  protected onEdgePointerDown(edge: AtmFlowEdge, e: PointerEvent): void {
    if (e.button !== 0) return;
    e.stopPropagation();
    const multi = e.ctrlKey || e.metaKey || e.shiftKey;
    const sel = new Set(multi ? this.selectedEdges() : []);
    if (multi && sel.has(edge.id)) sel.delete(edge.id);
    else sel.add(edge.id);
    this.select(multi ? [...this.selectedNodes()] : [], [...sel]);
    this.edgeClick.emit({ edge, event: e });
  }

  protected onMinimapPointerDown(e: PointerEvent): void {
    e.preventDefault();
    e.stopPropagation();
    const move = (ev: PointerEvent) => this.centerOn(this.minimapToWorld(ev));
    move(e);
    this.beginDrag(move);
  }

  private minimapToWorld(ev: PointerEvent): AtmFlowPoint {
    const svg = this.mmRef()?.nativeElement;
    const view = this.mmView();
    if (!svg) return { x: 0, y: 0 };
    const r = svg.getBoundingClientRect();
    const b = view.bounds;
    const scale = Math.min(r.width / b.w, r.height / b.h);
    const ox = (r.width - b.w * scale) / 2;
    const oy = (r.height - b.h * scale) / 2;
    return {
      x: b.x + (ev.clientX - r.left - ox) / scale,
      y: b.y + (ev.clientY - r.top - oy) / scale,
    };
  }

  private centerOn(pt: AtmFlowPoint): void {
    const { w, h } = this.hostSize();
    const vp = this.viewport();
    this.setVp({ ...vp, x: w / 2 - pt.x * vp.zoom, y: h / 2 - pt.y * vp.zoom });
  }

  /* ---------------------------------------------------------------- */
  /* Context menu / clicks                                             */
  /* ---------------------------------------------------------------- */

  protected onNodeDblClick(node: AtmFlowNode, e: MouseEvent): void {
    e.stopPropagation();
    this.nodeDoubleClick.emit({ node, event: e });
  }

  protected onEdgeDblClick(edge: AtmFlowEdge, e: MouseEvent): void {
    e.stopPropagation();
    this.edgeDoubleClick.emit({ edge, event: e });
  }

  protected onNodeContextMenu(node: AtmFlowNode, e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.contextMenu.emit({ node, position: this.screenToFlow({ x: e.clientX, y: e.clientY }), event: e });
  }

  protected onEdgeContextMenu(edge: AtmFlowEdge, e: MouseEvent): void {
    e.preventDefault();
    e.stopPropagation();
    this.contextMenu.emit({ edge, position: this.screenToFlow({ x: e.clientX, y: e.clientY }), event: e });
  }

  protected onPaneContextMenu(e: MouseEvent): void {
    e.preventDefault();
    this.contextMenu.emit({ position: this.screenToFlow({ x: e.clientX, y: e.clientY }), event: e });
  }

  /* ---------------------------------------------------------------- */
  /* Keyboard                                                          */
  /* ---------------------------------------------------------------- */

  protected onKeydown(e: KeyboardEvent): void {
    const target = e.target as HTMLElement;
    if (target !== this.host.nativeElement && target.closest('input, textarea, [contenteditable]')) return;
    const mod = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();
    if (key === 'delete' || key === 'backspace') {
      e.preventDefault();
      this.deleteSelection();
    } else if (mod && key === 'z' && !e.shiftKey) {
      e.preventDefault();
      this.undo();
    } else if (mod && (key === 'y' || (key === 'z' && e.shiftKey))) {
      e.preventDefault();
      this.redo();
    } else if (mod && key === 'a') {
      e.preventDefault();
      this.selectAll();
    } else if (mod && key === 'c') {
      this.copySelection();
    } else if (mod && key === 'v') {
      this.paste();
    } else if (key === 'escape') {
      this.select([], []);
    } else if (key.startsWith('arrow')) {
      if (this.locked() || !this.selectedNodes().size) return;
      e.preventDefault();
      const step = this.snapToGrid() ? this.gridSize() : e.shiftKey ? 10 : 2;
      const dx = key === 'arrowleft' ? -step : key === 'arrowright' ? step : 0;
      const dy = key === 'arrowup' ? -step : key === 'arrowdown' ? step : 0;
      const now = Date.now();
      if (now - this.lastNudge > 800) this.snapshot();
      this.lastNudge = now;
      const patch = new Map<string, Partial<AtmFlowNode>>();
      for (const id of this.selectedNodes()) {
        const n = this.nodeMap().get(id);
        if (n && n.draggable !== false) {
          patch.set(id, { position: { x: n.position.x + dx, y: n.position.y + dy } });
        }
      }
      this.patchNodes(patch);
    }
  }

  /* ---------------------------------------------------------------- */
  /* Internals                                                         */
  /* ---------------------------------------------------------------- */

  private beginDrag(move: (e: PointerEvent) => void, up?: (e: PointerEvent) => void): void {
    const onMove = (e: PointerEvent) => move(e);
    const onUp = (e: PointerEvent) => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      up?.(e);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  }

  private clampZoom(z: number): number {
    return Math.min(Math.max(z, this.minZoom()), this.maxZoom());
  }

  private setVp(vp: AtmFlowViewport): void {
    const next = { x: vp.x, y: vp.y, zoom: this.clampZoom(vp.zoom) };
    this.viewport.set(next);
    this.viewportChange.emit(next);
  }

  private zoomAt(client: AtmFlowPoint, zoom: number): void {
    const rect = this.paneRef().nativeElement.getBoundingClientRect();
    const vp = this.viewport();
    const z = this.clampZoom(zoom);
    const px = client.x - rect.left;
    const py = client.y - rect.top;
    this.setVp({
      zoom: z,
      x: px - ((px - vp.x) / vp.zoom) * z,
      y: py - ((py - vp.y) / vp.zoom) * z,
    });
  }

  private zoomAtCenter(zoom: number): void {
    const rect = this.paneRef().nativeElement.getBoundingClientRect();
    this.zoomAt({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }, zoom);
  }

  private select(nodes: Iterable<string>, edges: Iterable<string>): void {
    const n = new Set(nodes);
    const eSet = new Set(edges);
    const prevN = this.selectedNodes();
    const prevE = this.selectedEdges();
    const same =
      prevN.size === n.size &&
      prevE.size === eSet.size &&
      [...n].every((id) => prevN.has(id)) &&
      [...eSet].every((id) => prevE.has(id));
    if (same) return;
    this.selectedNodes.set(n);
    this.selectedEdges.set(eSet);
    this.selectionChange.emit({ nodes: [...n], edges: [...eSet] });
  }

  private patchNodes(patch: Map<string, Partial<AtmFlowNode>>): void {
    if (!patch.size) return;
    this.nodes.update((ns) => ns.map((n) => (patch.has(n.id) ? { ...n, ...patch.get(n.id) } : n)));
  }

  private sizeOf(node: AtmFlowNode): { w: number; h: number } {
    const d = this.dims().get(node.id);
    return { w: node.width ?? d?.w ?? NODE_W, h: node.height ?? d?.h ?? NODE_H };
  }

  private handlesOf(node: AtmFlowNode): AtmFlowHandle[] {
    // `handles: []` significa "sem handles default" (ex.: nodes que usam <atm-flow-handle>).
    if (node.handles) return node.handles;
    return this.direction() === 'TB' ? DEFAULT_HANDLES_TB : DEFAULT_HANDLES_LR;
  }

  private handleKeyOf(nodeId: string, type: AtmFlowHandleType, id: string | undefined, idx: number): string {
    return `${nodeId}|${type}|${id ?? ''}|${idx}`;
  }

  private handleView(nodeId: string, h: AtmFlowHandle, idx: number): HandleView {
    const off = `calc(${((h.offset ?? 0.5) * 100).toFixed(2)}% - 5px)`;
    let left: string | null = null;
    let top: string | null = null;
    let right: string | null = null;
    let bottom: string | null = null;
    switch (h.position) {
      case 'left':
        left = '-5px';
        top = off;
        break;
      case 'right':
        right = '-5px';
        top = off;
        break;
      case 'top':
        top = '-5px';
        left = off;
        break;
      case 'bottom':
        bottom = '-5px';
        left = off;
        break;
    }
    return {
      key: this.handleKeyOf(nodeId, h.type, h.id, idx),
      id: h.id,
      type: h.type,
      handle: h,
      left,
      top,
      right,
      bottom,
    };
  }

  private resolveHandle(
    node: AtmFlowNode,
    type: AtmFlowHandleType,
    handleId?: string,
  ): { pt: AtmFlowPoint; pos: AtmFlowHandlePosition } {
    // Handles custom (<atm-flow-handle>) têm precedência: ancoram na posição real medida.
    const custom = this.customHandles().get(node.id)?.filter((x) => x.type === type);
    if (custom?.length) {
      const hd =
        (handleId !== undefined ? custom.find((x) => x.id === handleId) : undefined) ?? custom[0];
      return {
        pt: { x: node.position.x + hd.x, y: node.position.y + hd.y },
        pos: hd.position,
      };
    }
    const { w, h } = this.sizeOf(node);
    const candidates = this.handlesOf(node).filter((x) => x.type === type);
    const fallbackPos: AtmFlowHandlePosition =
      type === 'source'
        ? this.direction() === 'TB'
          ? 'bottom'
          : 'right'
        : this.direction() === 'TB'
          ? 'top'
          : 'left';
    const hd =
      (handleId !== undefined ? candidates.find((x) => x.id === handleId) : undefined) ??
      candidates[0] ?? { type, position: fallbackPos };
    return { pt: anchorOf(node.position, w, h, hd), pos: hd.position };
  }

  private cloneState(): { nodes: AtmFlowNode[]; edges: AtmFlowEdge[] } {
    return structuredClone({ nodes: this.nodes(), edges: this.edges() });
  }

  private snapshot(): void {
    this.past.push(this.cloneState());
    if (this.past.length > 60) this.past.shift();
    this.future = [];
  }
}

/* ------------------------------------------------------------------ */
/* atm-flow-handle                                                     */
/* ------------------------------------------------------------------ */

/**
 * Connection port to be placed **inside a custom node template** — the
 * equivalent of Foundation Flow's `fNodeInput`/`fNodeOutput`. Position it
 * freely with utility classes; edges anchor to its real rendered position.
 *
 * ```html
 * <atm-flow [(nodes)]="nodes" [(edges)]="edges">
 *   <ng-template atmFlowNode="send-message" let-node let-selected="selected">
 *     <node-send-message [nodeId]="node.id" [nodeData]="node.data" [selected]="selected" />
 *   </ng-template>
 * </atm-flow>
 *
 * <!-- dentro do template de node-send-message: -->
 * <div class="relative ...">
 *   ...
 *   <atm-flow-handle type="target" position="left" class="top-1/2 -left-[5px] -translate-y-1/2" />
 *   <atm-flow-handle type="source" id="sent" position="right" class="-right-[5px] bottom-3" />
 * </div>
 * ```
 *
 * Use `handles: []` no node para remover os handles default das bordas.
 */
@Component({
  selector: 'atm-flow-handle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'absolute z-10 block size-2.5 rounded-full border-2 border-surface bg-ink-faint transition-transform hover:scale-125 hover:bg-primary',
    '[class.cursor-crosshair]': '!flow?.locked()',
    '[class.bg-primary]': 'isCandidate()',
    '[class.scale-125]': 'isCandidate()',
    '[attr.data-flow-handle]': 'id() ?? ""',
    '[attr.data-flow-handle-type]': 'type()',
    '[attr.data-flow-key]': 'key',
    '(pointerdown)': 'onPointerDown($event)',
  },
  template: '',
})
export class AtmFlowNodeHandle {
  readonly type = input<AtmFlowHandleType>('source');
  /** Necessário quando o node tem vários handles do mesmo tipo. */
  readonly id = input<string | undefined>(undefined);
  /** Lado por onde a edge entra/sai. Inferido da posição no node se omitido. */
  readonly position = input<AtmFlowHandlePosition | undefined>(undefined);
  /** Tipo do port — só conecta em ports compatíveis (ver compatibleTypes do atm-flow). */
  readonly dataType = input<string | undefined>(undefined);

  /** @internal */
  readonly key = atmUid('atm-fh');
  protected readonly flow = inject(AtmFlow, { optional: true });
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly isCandidate = computed(() => this.flow?.candidateKey() === this.key);

  constructor() {
    afterNextRender(() => this.flow?.registerCustomHandle(this.el, this));
    // Re-measure when inputs change after registration.
    effect(() => {
      this.type();
      this.id();
      this.position();
      this.dataType();
      untracked(() => this.flow?.refreshCustomHandle(this.el));
    });
    inject(DestroyRef).onDestroy(() => this.flow?.unregisterCustomHandle(this.el));
  }

  protected onPointerDown(e: PointerEvent): void {
    this.flow?.startCustomConnection(this.el, e);
  }
}
