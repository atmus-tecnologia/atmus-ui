import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { AtmThemeService } from '../../services/theme.service';

/** Chart families supported by AtmChart. */
export type AtmChartType =
  | 'line'
  | 'area'
  | 'bar'
  | 'bar-horizontal'
  | 'pie'
  | 'donut'
  | 'radar'
  | 'funnel'
  | 'funnel-vertical'
  | 'funnel-pyramid'
  | 'range-bar'
  | 'scatter'
  | 'dots'
  | 'segments'
  | 'radial-bar'
  | 'gauge'
  | 'heatmap'
  | 'treemap';

export interface AtmChartPoint {
  x: number;
  y: number;
}

/** Per-dataset series style (enables mixed charts, e.g. bars + line). */
export type AtmChartSeriesType = 'line' | 'area' | 'bar';

export interface AtmChartDataset {
  label: string;
  data: number[];
  /** Any CSS color, `var(--atm-primary)` or shorthand `--atm-primary`. */
  color?: string;
  /** Overrides the chart type for this series (mixed charts). */
  type?: AtmChartSeriesType;
  /** Overrides the global `smooth` input for this series. */
  smooth?: boolean;
  /** Dashed stroke (line/area series). */
  dashed?: boolean;
  /** Overrides the global `markers` input for this series. */
  markers?: boolean;
  /** [low, high] pairs — used by type 'range-bar'. */
  ranges?: [number, number][];
  /** XY points — used by type 'scatter'. */
  points?: AtmChartPoint[];
}

export interface AtmChartPointEvent {
  index: number;
  label: string;
  datasetIndex: number;
  datasetLabel: string;
  value: number;
}

/** Hierarchical node for type 'treemap'. `value` defaults to the sum of the children. */
export interface AtmChartTreeNode {
  label: string;
  value?: number;
  /** Any CSS color, `var(--atm-primary)` or shorthand `--atm-primary`. */
  color?: string;
  /** Child nodes — enables built-in drill-down on double click. */
  children?: AtmChartTreeNode[];
}

/** Emitted by treemap interactions (`nodeClick` / `drillDown`). */
export interface AtmChartTreeEvent {
  node: AtmChartTreeNode;
  /** Drill trail from the root down to (and including) `node`. */
  path: AtmChartTreeNode[];
}

/** Default palette — first entries follow the theme tokens (dark-mode aware). */
export const ATM_CHART_PALETTE = [
  'var(--atm-primary)',
  'var(--atm-info)',
  'var(--atm-success)',
  'var(--atm-warning)',
  'var(--atm-danger)',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#a3e635',
];

const ANIM_MS = 750;

interface Series {
  ds: AtmChartDataset;
  di: number;
  kind: AtmChartSeriesType;
  color: string;
}

interface Slice {
  label: string;
  value: number;
  index: number;
  color: string;
}

interface TipRow {
  color: string;
  label: string;
  value: string;
}

interface TipView {
  x: number;
  y: number;
  below: boolean;
  title: string;
  rows: TipRow[];
}

interface Hit {
  index: number;
  datasetIndex: number;
}

interface ThemeColors {
  ink: string;
  muted: string;
  faint: string;
  grid: string;
  strong: string;
  surface: string;
}

/** Bar rectangle recorded during draw — used to resolve the exact dataset on click. */
interface BarRect {
  x: number;
  y: number;
  w: number;
  h: number;
  di: number;
  index: number;
}

/** Series point position recorded during draw — used to resolve the exact dataset on click. */
interface SeriesPt {
  x: number;
  y: number;
  di: number;
  index: number;
}

/** Treemap rectangle recorded during draw — used for hover/click/drill resolution. */
interface TreeRect {
  x: number;
  y: number;
  w: number;
  h: number;
  node: AtmChartTreeNode;
  /** Index of the node within the current drill level. */
  index: number;
  colorCss: string;
}

type Geom =
  | {
      kind: 'cartesian';
      x: number;
      y: number;
      w: number;
      h: number;
      centers: number[];
      horizontal: boolean;
      bars?: BarRect[];
      pts?: SeriesPt[];
    }
  | { kind: 'pie'; cx: number; cy: number; r: number; inner: number; slices: { start: number; end: number; index: number }[] }
  | { kind: 'radar'; cx: number; cy: number; r: number; count: number; pts: SeriesPt[] }
  | { kind: 'funnel'; x: number; w: number; count: number }
  | { kind: 'scatter'; pts: { x: number; y: number; di: number; pi: number }[] }
  | { kind: 'rings'; cx: number; cy: number; rings: { r: number; thick: number; index: number }[] }
  | { kind: 'matrix'; x: number; y: number; cw: number; ch: number; cols: number; rows: number }
  | { kind: 'treemap'; rects: TreeRect[] }
  | { kind: 'bands'; cx: number; tops: number[]; halves: [number, number][] }
  | null;

interface Pt {
  x: number;
  y: number;
}

function niceNum(range: number, round: boolean): number {
  const exp = Math.floor(Math.log10(range));
  const f = range / 10 ** exp;
  let nf: number;
  if (round) nf = f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10;
  else nf = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
  return nf * 10 ** exp;
}

function niceScale(min: number, max: number, maxTicks = 5): { min: number; max: number; step: number } {
  if (!Number.isFinite(min)) min = 0;
  if (!Number.isFinite(max)) max = 1;
  if (min === max) max = min + 1;
  const range = niceNum(max - min, false);
  const step = niceNum(range / (maxTicks - 1), true);
  return { min: Math.floor(min / step) * step, max: Math.ceil(max / step) * step, step };
}

function compactNumber(v: number): string {
  const abs = Math.abs(v);
  const trim = (x: number) => String(Math.round(x * 10) / 10).replace(/\.0$/, '');
  if (abs >= 1e9) return `${trim(v / 1e9)}B`;
  if (abs >= 1e6) return `${trim(v / 1e6)}M`;
  if (abs >= 1e3) return `${trim(v / 1e3)}k`;
  return Number.isInteger(v) ? String(v) : trim(v);
}

/**
 * AtmChart — canvas-based charting component.
 *
 * Types: line, area, bar (columns), bar-horizontal, pie, donut, radar, funnel
 * (horizontal, vertical and pyramid), heatmap, treemap (with drill-down) and
 * mixed charts (per-dataset `type`). Renders on HTML5 canvas with
 * devicePixelRatio scaling, ResizeObserver responsiveness, entry animations
 * (respects prefers-reduced-motion), interactive HTML tooltip + legend and
 * automatic dark-mode via theme tokens.
 *
 * ```html
 * <atm-chart
 *   type="bar"
 *   title="Vendas"
 *   [labels]="['Jan', 'Fev', 'Mar']"
 *   [datasets]="[{ label: 'Receita', data: [10, 25, 18] }]"
 * />
 * ```
 */
@Component({
  selector: 'atm-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: { class: 'block', '[attr.title]': 'null' },
  template: `
    <div class="flex flex-col" [style.width]="cssWidth()">
      @if (title() || subtitle()) {
        <div class="mb-3">
          @if (title()) {
            <h3 class="text-sm font-semibold text-ink">{{ title() }}</h3>
          }
          @if (subtitle()) {
            <p class="mt-0.5 text-xs text-ink-muted">{{ subtitle() }}</p>
          }
        </div>
      }

      <div [class]="bodyClass()">
        @if (legendVisible() && legendBefore()) {
          <ng-container [ngTemplateOutlet]="legendTpl" />
        }

        <div #wrapper class="relative min-w-0 flex-1" [style.height]="cssHeight()">
          <canvas #canvas class="block h-full w-full" role="img" [attr.aria-label]="ariaLabel()"></canvas>

          @if (isTreemap() && drillPath().length) {
            <div class="absolute top-1.5 left-1.5 z-10 flex items-center gap-2">
              <button
                type="button"
                class="atm-focus flex size-7 cursor-pointer items-center justify-center rounded-full
                  border border-line bg-surface text-ink shadow-atm-sm transition-colors hover:bg-surface-alt"
                aria-label="Voltar"
                (click)="drillUp()"
              >
                <i class="atm atm-arrow-left-02 text-sm"></i>
              </button>
              <span class="text-xs text-ink-muted">{{ drillPath().join(' / ') }}</span>
            </div>
          }

          @if (treeLoading()) {
            <div class="absolute inset-0 z-10 grid place-items-center bg-surface/60">
              <i class="atm atm-loading-03 inline-block animate-spin text-xl text-ink-muted"></i>
            </div>
          }

          @if (tipView(); as tt) {
            <div
              class="pointer-events-none absolute z-10 min-w-28 rounded-lg border border-line
                bg-surface-raised px-3 py-2 shadow-atm-lg"
              [style.left.px]="tt.x"
              [style.top.px]="tt.y"
              [style.transform]="tt.below ? 'translate(-50%, 14px)' : 'translate(-50%, calc(-100% - 14px))'"
            >
              @if (tt.title) {
                <p class="mb-1 text-xs font-semibold whitespace-nowrap text-ink">{{ tt.title }}</p>
              }
              @for (row of tt.rows; track $index) {
                <div class="flex items-center gap-2 py-0.5 text-xs whitespace-nowrap">
                  <span class="size-2 shrink-0 rounded-full" [style.background]="row.color"></span>
                  @if (row.label) {
                    <span class="text-ink-muted">{{ row.label }}</span>
                  }
                  <span class="ml-auto pl-3 font-semibold text-ink tabular-nums">{{ row.value }}</span>
                </div>
              }
            </div>
          }
        </div>

        @if (legendVisible() && !legendBefore()) {
          <ng-container [ngTemplateOutlet]="legendTpl" />
        }
      </div>
    </div>

    <ng-template #legendTpl>
      <div [class]="legendClass()">
        @for (item of legendItems(); track $index; let i = $index) {
          <button
            type="button"
            class="atm-focus flex cursor-pointer items-center gap-1.5 rounded-md px-1.5 py-1 text-xs
              text-ink-muted transition-colors hover:bg-surface-alt"
            [class.opacity-40]="isHidden(i)"
            [attr.aria-pressed]="!isHidden(i)"
            (click)="toggleSeries(i)"
          >
            <span class="size-2.5 shrink-0 rounded-full" [style.background]="item.color"></span>
            <span [class.line-through]="isHidden(i)">{{ item.label }}</span>
          </button>
        }
      </div>
    </ng-template>
  `,
})
export class AtmChart {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);
  private readonly theme = inject(AtmThemeService);

  /** Chart type. Cartesian types accept per-dataset overrides for mixed charts. */
  readonly type = input<AtmChartType>('line');
  /** Category labels (x axis / slices / funnel stages / radar axes). */
  readonly labels = input<string[]>([]);
  /** Data series. Pie/donut/funnel use the first dataset only. */
  readonly datasets = input<AtmChartDataset[]>([]);
  readonly title = input('');
  readonly subtitle = input('');
  /** Height in px (number) or any CSS size. */
  readonly height = input<number | string>(320);
  /** Width in px (number) or CSS size. Defaults to 100% of the container. */
  readonly width = input<number | string | null>(null);
  /** Custom palette. Accepts CSS colors, `var(--atm-*)` or `--atm-*`. */
  readonly colors = input<string[] | null>(null);
  readonly legend = input(true);
  readonly legendPosition = input<'top' | 'bottom' | 'left' | 'right'>('bottom');
  readonly tooltip = input(true);
  readonly grid = input(true);
  readonly xAxis = input(true);
  readonly yAxis = input(true);
  /** Stacks bar series (vertical and horizontal). */
  readonly stacked = input(false);
  /** Curved lines/areas. Can be overridden per dataset. */
  readonly smooth = input(true);
  /** Dots on line/area points. Can be overridden per dataset. */
  readonly markers = input(true);
  /** Draws the value next to each bar/point/slice. */
  readonly showValues = input(false);
  readonly animated = input(true);
  readonly xTitle = input('');
  readonly yTitle = input('');
  /** Formatter applied to axis ticks, tooltip and data labels. */
  readonly format = input<((value: number) => string) | null>(null);
  /** Caption under the total in the donut center. */
  readonly donutLabel = input('Total');
  /** Max scale for gauge / radial-bar / segments. Defaults to auto (gauge: 100). */
  readonly max = input<number | null>(null);
  /** Arc rendering style for radial-bar and gauge. */
  readonly radialStyle = input<'solid' | 'dotted'>('solid');
  /** Hierarchical nodes for type 'treemap'. Falls back to labels + datasets[0]. */
  readonly tree = input<AtmChartTreeNode[] | null>(null);
  /**
   * Treemap only — async loader called on double click when the node has no
   * `children` (e.g. fetch from an API). Returning a non-empty array drills
   * into the node; the back arrow pops the level automatically.
   */
  readonly loadChildren = input<
    ((node: AtmChartTreeNode, path: AtmChartTreeNode[]) => Promise<AtmChartTreeNode[]> | AtmChartTreeNode[]) | null
  >(null);

  /**
   * Emitted when the user clicks a data point / bar / slice / stage.
   * `datasetIndex`/`datasetLabel` identify the exact series clicked — e.g. the
   * specific bar within a group or stack, the nearest line marker, etc.
   */
  readonly pointClick = output<AtmChartPointEvent>();
  /** Treemap — click on a node. */
  readonly nodeClick = output<AtmChartTreeEvent>();
  /** Treemap — double click drilled into a node (built-in children or loadChildren). */
  readonly drillDown = output<AtmChartTreeEvent>();

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly wrapperRef = viewChild.required<ElementRef<HTMLDivElement>>('wrapper');

  /** Hidden series (or slices, for pie/donut) — toggled via legend. */
  private readonly hidden = signal<ReadonlySet<number>>(new Set());
  private readonly tip = signal<TipView | null>(null);
  readonly tipView = computed(() => (this.tooltip() ? this.tip() : null));

  /** Treemap drill-down stack — each entry is a level the user entered. */
  private readonly drillStack = signal<{ node: AtmChartTreeNode; nodes: AtmChartTreeNode[]; colorCss: string }[]>([]);
  /** True while `loadChildren` is resolving (treemap). */
  readonly treeLoading = signal(false);
  readonly isTreemap = computed(() => this.type() === 'treemap');
  /** Labels of the current drill trail (treemap breadcrumb). */
  readonly drillPath = computed(() => this.drillStack().map((e) => e.node.label));

  /** Root nodes for the treemap — `tree` input or labels + datasets[0] as flat nodes. */
  private readonly rootNodes = computed<AtmChartTreeNode[]>(() => {
    const tr = this.tree();
    if (tr?.length) return tr;
    const data = this.datasets()[0]?.data ?? [];
    return this.labels().map((label, i) => ({ label, value: data[i] ?? 0 }));
  });

  readonly legendItems = computed(() => {
    const type = this.type();
    if (
      type === 'funnel' ||
      type === 'funnel-vertical' ||
      type === 'funnel-pyramid' ||
      type === 'segments' ||
      type === 'gauge' ||
      type === 'heatmap' ||
      type === 'treemap'
    ) {
      return [] as { label: string; color: string }[];
    }
    if (type === 'pie' || type === 'donut' || type === 'radial-bar') {
      return this.labels().map((label, i) => ({ label, color: this.cssColorAt(i) }));
    }
    return this.datasets().map((ds, i) => ({ label: ds.label, color: this.cssColorAt(i, ds) }));
  });

  readonly legendVisible = computed(() => this.legend() && this.legendItems().length > 0);
  readonly legendBefore = computed(() => this.legendPosition() === 'top' || this.legendPosition() === 'left');
  readonly bodyClass = computed(() =>
    this.legendPosition() === 'left' || this.legendPosition() === 'right'
      ? 'flex items-center gap-4'
      : 'flex flex-col gap-2',
  );
  readonly legendClass = computed(() =>
    this.legendPosition() === 'left' || this.legendPosition() === 'right'
      ? 'flex max-w-40 shrink-0 flex-col items-start gap-0.5'
      : 'flex flex-wrap items-center justify-center gap-x-1 gap-y-0.5',
  );
  readonly ariaLabel = computed(() => this.title() || `Gráfico ${this.type()}`);

  readonly cssWidth = computed(() => {
    const w = this.width();
    return w == null ? '100%' : typeof w === 'number' ? `${w}px` : w;
  });
  readonly cssHeight = computed(() => {
    const h = this.height();
    return typeof h === 'number' ? `${h}px` : h;
  });

  private ctx: CanvasRenderingContext2D | null = null;
  private scratchCtx: CanvasRenderingContext2D | null = null;
  private readonly rgbCache = new Map<string, { r: number; g: number; b: number; a: number }>();
  private ro?: ResizeObserver;
  private raf = 0;
  private resizeRaf = 0;
  private progress = 1;
  private ready = false;
  private fontFamily = 'sans-serif';
  private geom: Geom = null;
  private lastHit: Hit | null = null;
  private lastKey = '';

  constructor() {
    // Data / options change → replay entry animation.
    effect(() => {
      this.type();
      this.datasets();
      this.labels();
      this.colors();
      this.stacked();
      this.smooth();
      this.markers();
      this.showValues();
      this.grid();
      this.xAxis();
      this.yAxis();
      this.format();
      this.donutLabel();
      this.xTitle();
      this.yTitle();
      this.max();
      this.radialStyle();
      this.hidden();
      this.tree();
      this.drillStack();
      untracked(() => {
        if (this.ready) this.startAnimation();
      });
    });

    // New treemap data → reset the drill-down navigation.
    effect(() => {
      this.tree();
      this.labels();
      this.datasets();
      untracked(() => {
        this.drillStack.set([]);
        this.treeLoading.set(false);
      });
    });

    // Theme change → redraw with the new token colors (no animation).
    effect(() => {
      this.theme.isDark();
      untracked(() => {
        if (this.ready) this.drawNow();
      });
    });

    afterNextRender(() => {
      const canvas = this.canvasRef().nativeElement;
      this.ctx = canvas.getContext('2d');
      this.fontFamily = getComputedStyle(this.host.nativeElement).fontFamily || 'sans-serif';
      this.zone.runOutsideAngular(() => {
        // Deferred to rAF — resizing the canvas inside the observer callback
        // triggers "ResizeObserver loop completed with undelivered notifications".
        this.ro = new ResizeObserver(() => {
          cancelAnimationFrame(this.resizeRaf);
          this.resizeRaf = requestAnimationFrame(() => {
            this.resizeCanvas();
            this.drawNow();
          });
        });
        this.ro.observe(this.wrapperRef().nativeElement);
        canvas.addEventListener('mousemove', this.onMove, { passive: true });
        canvas.addEventListener('mouseleave', this.onLeave, { passive: true });
        canvas.addEventListener('click', this.onClick);
        canvas.addEventListener('dblclick', this.onDblClick);
      });
      this.ready = true;
      this.startAnimation();
    });

    this.destroyRef.onDestroy(() => {
      cancelAnimationFrame(this.raf);
      cancelAnimationFrame(this.resizeRaf);
      this.ro?.disconnect();
    });
  }

  isHidden(i: number): boolean {
    return this.hidden().has(i);
  }

  toggleSeries(i: number): void {
    this.hidden.update((set) => {
      const next = new Set(set);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  }

  /** Returns the current chart as a PNG data URL (e.g. for download/export). */
  exportImage(type = 'image/png'): string {
    return this.canvasRef().nativeElement.toDataURL(type);
  }

  /** Treemap — goes back one drill-down level (the back arrow calls this). */
  drillUp(): void {
    this.drillStack.update((st) => st.slice(0, -1));
  }

  // ------------------------------------------------------------------
  // Interaction
  // ------------------------------------------------------------------

  private readonly onMove = (e: MouseEvent): void => {
    const el = e.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hit = this.hitTest(mx, my);
    el.style.cursor = hit ? 'pointer' : '';
    const key = hit ? `${hit.index}:${hit.datasetIndex}` : '';
    if (key !== this.lastKey) {
      this.lastKey = key;
      this.lastHit = hit;
      this.drawNow();
    }
    this.tip.set(hit ? this.buildTip(hit, mx, my) : null);
  };

  private readonly onLeave = (): void => {
    this.lastKey = '';
    this.lastHit = null;
    this.tip.set(null);
    this.drawNow();
  };

  private readonly onClick = (e: MouseEvent): void => {
    const hit = this.lastHit;
    if (!hit) return;
    const type = this.type();
    const labels = this.labels();
    let datasetIndex = 0;
    let datasetLabel = this.datasets()[0]?.label ?? '';
    let value = this.datasets()[0]?.data[hit.index] ?? 0;
    if (type === 'treemap') {
      const g = this.geom;
      if (g?.kind !== 'treemap') return;
      const r = g.rects[hit.index];
      if (!r) return;
      const path = [...this.drillStack().map((s) => s.node), r.node];
      this.zone.run(() => {
        this.nodeClick.emit({ node: r.node, path });
        this.pointClick.emit({
          index: r.index,
          label: r.node.label,
          datasetIndex: 0,
          datasetLabel: '',
          value: this.nodeValue(r.node),
        });
      });
      return;
    }
    if (type === 'heatmap') {
      const ds = this.datasets()[hit.datasetIndex];
      this.zone.run(() =>
        this.pointClick.emit({
          index: hit.index,
          label: labels[hit.index] ?? '',
          datasetIndex: hit.datasetIndex,
          datasetLabel: ds?.label ?? '',
          value: ds?.data[hit.index] ?? 0,
        }),
      );
      return;
    }
    if (type === 'scatter') {
      const s = this.seriesList().find((x) => x.di === hit.datasetIndex);
      this.zone.run(() =>
        this.pointClick.emit({
          index: hit.index,
          label: s?.ds.label ?? '',
          datasetIndex: hit.datasetIndex,
          datasetLabel: s?.ds.label ?? '',
          value: s?.ds.points?.[hit.index]?.y ?? 0,
        }),
      );
      return;
    }
    if (
      type !== 'pie' &&
      type !== 'donut' &&
      type !== 'funnel' &&
      type !== 'funnel-vertical' &&
      type !== 'funnel-pyramid' &&
      type !== 'radial-bar'
    ) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const s =
        this.datasetAt(e.clientX - rect.left, e.clientY - rect.top, hit.index) ?? this.seriesList()[0];
      if (s) {
        datasetIndex = s.di;
        datasetLabel = s.ds.label;
        value = s.ds.data[hit.index] ?? s.ds.ranges?.[hit.index]?.[1] ?? 0;
      }
    }
    this.zone.run(() =>
      this.pointClick.emit({ index: hit.index, label: labels[hit.index] ?? '', datasetIndex, datasetLabel, value }),
    );
  };

  /** Treemap — double click drills into the node (built-in `children` or async `loadChildren`). */
  private readonly onDblClick = (e: MouseEvent): void => {
    if (this.type() !== 'treemap' || this.treeLoading()) return;
    const g = this.geom;
    if (g?.kind !== 'treemap') return;
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const r = g.rects.find((rc) => mx >= rc.x && mx <= rc.x + rc.w && my >= rc.y && my <= rc.y + rc.h);
    if (!r) return;
    const node = r.node;
    const path = [...this.drillStack().map((s) => s.node), node];

    if (node.children?.length) {
      this.zone.run(() => {
        this.drillStack.update((st) => [...st, { node, nodes: node.children!, colorCss: r.colorCss }]);
        this.drillDown.emit({ node, path });
      });
      return;
    }
    const loader = this.loadChildren();
    if (!loader) return;
    this.zone.run(() => {
      this.treeLoading.set(true);
      this.drillDown.emit({ node, path });
      Promise.resolve(loader(node, path))
        .then((kids) => {
          if (kids?.length) {
            this.drillStack.update((st) => [...st, { node, nodes: kids, colorCss: r.colorCss }]);
          }
        })
        .finally(() => this.treeLoading.set(false));
    });
  };

  /** Resolves which series (bar / point) sits under the cursor for the hovered category. */
  private datasetAt(mx: number, my: number, index: number): Series | null {
    const g = this.geom;
    if (!g || (g.kind !== 'cartesian' && g.kind !== 'radar')) return null;
    const series = this.seriesList();
    if (g.kind === 'cartesian') {
      const bar = g.bars?.find(
        (b) =>
          b.index === index && mx >= b.x - 2 && mx <= b.x + b.w + 2 && my >= b.y - 2 && my <= b.y + b.h + 2,
      );
      if (bar) return series.find((s) => s.di === bar.di) ?? null;
    }
    let best: SeriesPt | null = null;
    let bd = 18 * 18;
    for (const p of g.pts ?? []) {
      if (p.index !== index) continue;
      const d = (p.x - mx) ** 2 + (p.y - my) ** 2;
      if (d < bd) {
        bd = d;
        best = p;
      }
    }
    const b = best;
    return b ? (series.find((s) => s.di === b.di) ?? null) : null;
  }

  private hitTest(mx: number, my: number): Hit | null {
    const g = this.geom;
    if (!g) return null;
    switch (g.kind) {
      case 'cartesian': {
        if (mx < g.x - 6 || mx > g.x + g.w + 6 || my < g.y - 6 || my > g.y + g.h + 6) return null;
        const pos = g.horizontal ? my : mx;
        let best = -1;
        let bd = Infinity;
        g.centers.forEach((c, i) => {
          const d = Math.abs(c - pos);
          if (d < bd) {
            bd = d;
            best = i;
          }
        });
        return best >= 0 ? { index: best, datasetIndex: -1 } : null;
      }
      case 'pie': {
        const dx = mx - g.cx;
        const dy = my - g.cy;
        const d = Math.hypot(dx, dy);
        if (d > g.r + 8 || d < g.inner - 8) return null;
        let a = Math.atan2(dy, dx);
        if (a < -Math.PI / 2) a += Math.PI * 2;
        const sl = g.slices.find((s) => a >= s.start && a <= s.end);
        return sl ? { index: sl.index, datasetIndex: 0 } : null;
      }
      case 'funnel': {
        const i = Math.floor(((mx - g.x) / g.w) * g.count);
        return i >= 0 && i < g.count ? { index: i, datasetIndex: 0 } : null;
      }
      case 'radar': {
        const dx = mx - g.cx;
        const dy = my - g.cy;
        if (Math.hypot(dx, dy) > g.r + 26) return null;
        const stepA = (Math.PI * 2) / g.count;
        let i = Math.round((Math.atan2(dy, dx) + Math.PI / 2) / stepA);
        i = ((i % g.count) + g.count) % g.count;
        return { index: i, datasetIndex: -1 };
      }
      case 'scatter': {
        let best: Hit | null = null;
        let bd = 12 * 12;
        for (const p of g.pts) {
          const d = (p.x - mx) ** 2 + (p.y - my) ** 2;
          if (d < bd) {
            bd = d;
            best = { index: p.pi, datasetIndex: p.di };
          }
        }
        return best;
      }
      case 'rings': {
        const d = Math.hypot(mx - g.cx, my - g.cy);
        const ring = g.rings.find((r) => Math.abs(d - r.r) <= r.thick / 2 + 3);
        return ring ? { index: ring.index, datasetIndex: 0 } : null;
      }
      case 'matrix': {
        const c = Math.floor((mx - g.x) / g.cw);
        const r = Math.floor((my - g.y) / g.ch);
        if (c < 0 || c >= g.cols || r < 0 || r >= g.rows) return null;
        return { index: c, datasetIndex: r };
      }
      case 'treemap': {
        for (let i = 0; i < g.rects.length; i++) {
          const r = g.rects[i];
          if (mx >= r.x && mx <= r.x + r.w && my >= r.y && my <= r.y + r.h) {
            return { index: i, datasetIndex: 0 };
          }
        }
        return null;
      }
      case 'bands': {
        for (let i = 0; i < g.halves.length; i++) {
          if (my >= g.tops[i] && my <= g.tops[i + 1]) {
            const f = (my - g.tops[i]) / Math.max(1, g.tops[i + 1] - g.tops[i]);
            const half = g.halves[i][0] + (g.halves[i][1] - g.halves[i][0]) * f;
            return Math.abs(mx - g.cx) <= half + 8 ? { index: i, datasetIndex: 0 } : null;
          }
        }
        return null;
      }
    }
  }

  private buildTip(hit: Hit, mx: number, my: number): TipView | null {
    const fmt = this.tooltipFormat();
    const type = this.type();
    const labels = this.labels();
    let title = labels[hit.index] ?? '';
    let rows: TipRow[];

    if (type === 'scatter') {
      const s = this.seriesList().find((x) => x.di === hit.datasetIndex);
      const p = s?.ds.points?.[hit.index];
      if (!s || !p) return null;
      title = s.ds.label;
      rows = [{ color: s.color, label: '', value: `${fmt(p.x)} · ${fmt(p.y)}` }];
    } else if (type === 'treemap') {
      const g = this.geom;
      if (g?.kind !== 'treemap') return null;
      const r = g.rects[hit.index];
      if (!r) return null;
      const total = g.rects.reduce((a, b) => a + this.nodeValue(b.node), 0) || 1;
      const v = this.nodeValue(r.node);
      title = r.node.label;
      rows = [{ color: r.colorCss, label: '', value: `${fmt(v)} · ${Math.round((v / total) * 1000) / 10}%` }];
    } else if (type === 'heatmap') {
      const ds = this.datasets()[hit.datasetIndex];
      if (!ds) return null;
      title = `${ds.label} · ${labels[hit.index] ?? ''}`;
      rows = [{ color: this.baseColorCss(), label: '', value: fmt(ds.data[hit.index] ?? 0) }];
    } else if (
      type === 'pie' ||
      type === 'donut' ||
      type === 'funnel' ||
      type === 'funnel-vertical' ||
      type === 'funnel-pyramid' ||
      type === 'radial-bar'
    ) {
      const isFunnelType = type === 'funnel' || type === 'funnel-vertical' || type === 'funnel-pyramid';
      const slices = this.sliceList();
      const s = slices.find((x) => x.index === hit.index);
      if (!s) return null;
      const total = slices.reduce((a, b) => a + Math.max(0, b.value), 0) || 1;
      const base = isFunnelType
        ? Math.max(...slices.map((x) => x.value), 0) || 1
        : type === 'radial-bar'
          ? (this.max() ?? Math.max(...slices.map((x) => x.value), 0)) || 1
          : total;
      const pct = Math.round((s.value / base) * 1000) / 10;
      title = s.label;
      const color = isFunnelType ? this.stageColorCss(s.index) : s.color;
      rows = [{ color, label: this.datasets()[0]?.label ?? '', value: `${fmt(s.value)} · ${pct}%` }];
    } else {
      rows = this.seriesList().map((s) => {
        const rng = s.ds.ranges?.[hit.index];
        return {
          color: s.color,
          label: s.ds.label,
          value: rng ? `${fmt(rng[0])} – ${fmt(rng[1])}` : fmt(s.ds.data[hit.index] ?? 0),
        };
      });
      if (!rows.length) return null;
    }

    let ax = mx;
    let ay = my;
    const g = this.geom;
    if (g?.kind === 'cartesian') {
      if (g.horizontal) ay = g.centers[hit.index] ?? my;
      else ax = g.centers[hit.index] ?? mx;
    }
    const wrapW = this.wrapperRef().nativeElement.clientWidth;
    const below = ay < 110;
    if (wrapW > 180) ax = Math.min(Math.max(ax, 84), wrapW - 84);
    return { x: ax, y: ay, below, title, rows };
  }

  // ------------------------------------------------------------------
  // Data helpers
  // ------------------------------------------------------------------

  private tooltipFormat(): (v: number) => string {
    return this.format() ?? ((v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 2 }));
  }

  private normalizeColor(c: string): string {
    return c.startsWith('--') ? `var(${c})` : c;
  }

  private cssColorAt(i: number, ds?: AtmChartDataset): string {
    const custom = this.colors();
    const palette = custom?.length ? custom : ATM_CHART_PALETTE;
    return this.normalizeColor(ds?.color ?? palette[i % palette.length]);
  }

  /** Base color for single-hue charts (funnel, heatmap): colors[0] or the primary token. */
  private baseColorCss(): string {
    const custom = this.colors();
    return this.normalizeColor(custom?.length ? custom[0] : 'var(--atm-primary)');
  }

  /** Per-stage color for the funnel variants. */
  private stageColorCss(i: number): string {
    const custom = this.colors();
    if (custom && custom.length > 1) return this.normalizeColor(custom[i % custom.length]);
    return this.type() === 'funnel-pyramid' ? this.cssColorAt(i) : this.baseColorCss();
  }

  /** Node value — explicit or the recursive sum of the children. */
  private nodeValue(n: AtmChartTreeNode): number {
    if (n.value != null) return n.value;
    return (n.children ?? []).reduce((a, c) => a + this.nodeValue(c), 0);
  }

  private seriesList(): Series[] {
    const hidden = this.hidden();
    const chartType = this.type();
    const defKind: AtmChartSeriesType =
      chartType === 'bar' || chartType === 'bar-horizontal' ? 'bar' : chartType === 'area' ? 'area' : 'line';
    return this.datasets()
      .map((ds, di) => ({
        ds,
        di,
        kind: chartType === 'bar-horizontal' ? ('bar' as const) : (ds.type ?? defKind),
        color: this.cssColorAt(di, ds),
      }))
      .filter((s) => !hidden.has(s.di));
  }

  private sliceList(): Slice[] {
    const hidden = this.hidden();
    const data = this.datasets()[0]?.data ?? [];
    const type = this.type();
    const noHide = type === 'funnel' || type === 'funnel-vertical' || type === 'funnel-pyramid';
    return this.labels()
      .map((label, i) => ({ label, value: data[i] ?? 0, index: i, color: this.cssColorAt(i) }))
      .filter((s) => noHide || !hidden.has(s.index));
  }

  // ------------------------------------------------------------------
  // Color resolution (canvas can't use CSS var() directly)
  // ------------------------------------------------------------------

  private resolveColor(css: string): string {
    if (!css.includes('var(')) return css;
    const style = getComputedStyle(this.host.nativeElement);
    return css.replace(/var\((--[\w-]+)[^)]*\)/g, (_, name: string) => style.getPropertyValue(name).trim() || '#888888');
  }

  private parseColor(color: string): { r: number; g: number; b: number; a: number } {
    const cached = this.rgbCache.get(color);
    if (cached) return cached;
    if (!this.scratchCtx) this.scratchCtx = document.createElement('canvas').getContext('2d');
    let out = { r: 120, g: 120, b: 120, a: 1 };
    const c = this.scratchCtx;
    if (c) {
      c.fillStyle = '#000';
      c.fillStyle = color;
      const norm = String(c.fillStyle);
      if (norm.startsWith('#')) {
        out = {
          r: parseInt(norm.slice(1, 3), 16),
          g: parseInt(norm.slice(3, 5), 16),
          b: parseInt(norm.slice(5, 7), 16),
          a: 1,
        };
      } else {
        const m = norm.match(/rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?/);
        if (m) out = { r: +m[1], g: +m[2], b: +m[3], a: m[4] !== undefined ? +m[4] : 1 };
      }
    }
    this.rgbCache.set(color, out);
    return out;
  }

  private rgba(color: string, alpha: number): string {
    const c = this.parseColor(color);
    return `rgba(${c.r}, ${c.g}, ${c.b}, ${+(c.a * alpha).toFixed(3)})`;
  }

  // ------------------------------------------------------------------
  // Render pipeline
  // ------------------------------------------------------------------

  private resizeCanvas(): void {
    const wrap = this.wrapperRef().nativeElement;
    const canvas = this.canvasRef().nativeElement;
    const dpr = window.devicePixelRatio || 1;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (!w || !h) return;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    this.ctx?.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  private startAnimation(): void {
    cancelAnimationFrame(this.raf);
    this.lastHit = null;
    this.lastKey = '';
    this.tip.set(null);
    this.resizeCanvas();
    const reduced =
      typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!this.animated() || reduced) {
      this.progress = 1;
      this.drawNow();
      return;
    }
    this.zone.runOutsideAngular(() => {
      const start = performance.now();
      const loop = (now: number): void => {
        const t = Math.min(1, (now - start) / ANIM_MS);
        this.progress = 1 - (1 - t) ** 4; // easeOutQuart
        this.drawNow();
        if (t < 1) this.raf = requestAnimationFrame(loop);
      };
      this.raf = requestAnimationFrame(loop);
    });
  }

  private drawNow(): void {
    this.draw(this.progress);
  }

  private draw(t: number): void {
    const ctx = this.ctx;
    if (!ctx) return;
    const wrap = this.wrapperRef().nativeElement;
    const w = wrap.clientWidth;
    const h = wrap.clientHeight;
    if (w < 10 || h < 10) return;
    ctx.clearRect(0, 0, w, h);
    this.geom = null;

    const th: ThemeColors = {
      ink: this.resolveColor('var(--atm-ink)'),
      muted: this.resolveColor('var(--atm-ink-muted)'),
      faint: this.resolveColor('var(--atm-ink-faint)'),
      grid: this.resolveColor('var(--atm-line)'),
      strong: this.resolveColor('var(--atm-line-strong)'),
      surface: this.resolveColor('var(--atm-surface)'),
    };

    switch (this.type()) {
      case 'pie':
        this.drawPie(ctx, w, h, t, th, false);
        break;
      case 'donut':
        this.drawPie(ctx, w, h, t, th, true);
        break;
      case 'radar':
        this.drawRadar(ctx, w, h, t, th);
        break;
      case 'funnel':
        this.drawFunnel(ctx, w, h, t, th);
        break;
      case 'funnel-vertical':
        this.drawFunnelVertical(ctx, w, h, t, th);
        break;
      case 'funnel-pyramid':
        this.drawFunnelPyramid(ctx, w, h, t, th);
        break;
      case 'heatmap':
        this.drawHeatmap(ctx, w, h, t, th);
        break;
      case 'treemap':
        this.drawTreemap(ctx, w, h, t, th);
        break;
      case 'bar-horizontal':
        this.drawBarsHorizontal(ctx, w, h, t, th);
        break;
      case 'range-bar':
        this.drawRangeBars(ctx, w, h, t, th);
        break;
      case 'scatter':
        this.drawScatter(ctx, w, h, t, th);
        break;
      case 'dots':
        this.drawDots(ctx, w, h, t, th);
        break;
      case 'segments':
        this.drawSegments(ctx, w, h, t, th);
        break;
      case 'radial-bar':
        this.drawRadialBar(ctx, w, h, t, th);
        break;
      case 'gauge':
        this.drawGauge(ctx, w, h, t, th);
        break;
      default:
        this.drawCartesian(ctx, w, h, t, th);
    }
  }

  private drawEmpty(ctx: CanvasRenderingContext2D, w: number, h: number, th: ThemeColors): void {
    ctx.fillStyle = th.faint;
    ctx.font = `12px ${this.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Sem dados para exibir', w / 2, h / 2);
  }

  private traceClosedSmooth(ctx: CanvasRenderingContext2D, pts: Pt[]): void {
    const n = pts.length;
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n];
      const p1 = pts[i];
      const p2 = pts[(i + 1) % n];
      const p3 = pts[(i + 2) % n];
      ctx.bezierCurveTo(
        p1.x + (p2.x - p0.x) / 6,
        p1.y + (p2.y - p0.y) / 6,
        p2.x - (p3.x - p1.x) / 6,
        p2.y - (p3.y - p1.y) / 6,
        p2.x,
        p2.y,
      );
    }
  }

  private tracePath(ctx: CanvasRenderingContext2D, pts: Pt[], smooth: boolean): void {
    ctx.moveTo(pts[0].x, pts[0].y);
    if (!smooth || pts.length < 3) {
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      return;
    }
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[Math.max(0, i - 1)];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[Math.min(pts.length - 1, i + 2)];
      ctx.bezierCurveTo(
        p1.x + (p2.x - p0.x) / 6,
        p1.y + (p2.y - p0.y) / 6,
        p2.x - (p3.x - p1.x) / 6,
        p2.y - (p3.y - p1.y) / 6,
        p2.x,
        p2.y,
      );
    }
  }

  // ------------------------------------------------------------------
  // Cartesian (line / area / bar / mixed)
  // ------------------------------------------------------------------

  private drawCartesian(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, th: ThemeColors): void {
    const labels = this.labels();
    const series = this.seriesList();
    if (!labels.length || !series.length) {
      this.drawEmpty(ctx, w, h, th);
      return;
    }
    const stacked = this.stacked();
    const barSeries = series.filter((s) => s.kind === 'bar');
    const hasBars = barSeries.length > 0;
    const n = labels.length;

    // Value domain
    let vMin = 0;
    let vMax = 0;
    for (let i = 0; i < n; i++) {
      let pos = 0;
      let neg = 0;
      for (const s of series) {
        const v = s.ds.data[i] ?? 0;
        if (stacked && s.kind === 'bar') {
          if (v >= 0) pos += v;
          else neg += v;
        } else {
          if (v > vMax) vMax = v;
          if (v < vMin) vMin = v;
        }
      }
      if (pos > vMax) vMax = pos;
      if (neg < vMin) vMin = neg;
    }
    const sc = niceScale(vMin, vMax, 5);
    const ticks: number[] = [];
    for (let v = sc.min; v <= sc.max + sc.step / 2; v += sc.step) ticks.push(v);

    const fmtAxis = this.format() ?? compactNumber;
    ctx.font = `11px ${this.fontFamily}`;
    const tickW = Math.max(...ticks.map((v) => ctx.measureText(fmtAxis(v)).width));

    const px = (this.yAxis() ? tickW + 14 : 8) + (this.yTitle() ? 18 : 0);
    const py = 10;
    const pb = (this.xAxis() ? 26 : 8) + (this.xTitle() ? 18 : 0);
    const pw = w - px - 10;
    const ph = h - py - pb;
    if (pw < 20 || ph < 20) return;

    const y = (v: number): number => py + ph - ((v - sc.min) / (sc.max - sc.min)) * ph;
    const zeroY = y(Math.min(Math.max(0, sc.min), sc.max));

    // Grid + y ticks
    for (const tk of ticks) {
      const ty = y(tk);
      if (this.grid()) {
        ctx.strokeStyle = th.grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, ty);
        ctx.lineTo(px + pw, ty);
        ctx.stroke();
      }
      if (this.yAxis()) {
        ctx.fillStyle = th.muted;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(fmtAxis(tk), px - 8, ty);
      }
    }

    const centers = Array.from({ length: n }, (_, i) =>
      hasBars || n === 1 ? px + ((i + 0.5) * pw) / n : px + (i * pw) / (n - 1),
    );

    // Hover highlight behind series
    const hovIdx = this.lastHit?.index ?? -1;
    if (hovIdx >= 0 && hovIdx < n) {
      if (hasBars) {
        ctx.fillStyle = this.rgba(th.ink, 0.05);
        const bw = pw / n;
        ctx.fillRect(centers[hovIdx] - bw / 2, py, bw, ph);
      } else {
        ctx.strokeStyle = th.strong;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(centers[hovIdx], py);
        ctx.lineTo(centers[hovIdx], py + ph);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // X labels (skip overlapping)
    if (this.xAxis()) {
      const maxLabW = Math.max(...labels.map((l) => ctx.measureText(l).width));
      const step = Math.max(1, Math.ceil((maxLabW + 16) / (pw / n)));
      ctx.fillStyle = th.muted;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      labels.forEach((l, i) => {
        if (i % step === 0) ctx.fillText(l, centers[i], py + ph + 8);
      });
    }

    const barRects: BarRect[] = [];
    const seriesPts: SeriesPt[] = [];

    // Bars
    if (hasBars) {
      const groupW = (pw / n) * 0.62;
      const barW = stacked ? Math.min(groupW, 44) : Math.min(groupW / barSeries.length, 40);
      for (let i = 0; i < n; i++) {
        let cumPos = 0;
        let cumNeg = 0;
        barSeries.forEach((s, si) => {
          const raw = s.ds.data[i] ?? 0;
          const v = raw * t;
          if (!v) return;
          const color = this.resolveColor(s.color);
          let x0: number;
          let base: number;
          if (stacked) {
            x0 = centers[i] - barW / 2;
            base = v >= 0 ? cumPos : cumNeg;
            if (v >= 0) cumPos += v;
            else cumNeg += v;
          } else {
            x0 = centers[i] - (barW * barSeries.length) / 2 + si * barW;
            base = 0;
          }
          const y0 = y(base);
          const y1 = y(base + v);
          const top = Math.min(y0, y1);
          const bh = Math.abs(y0 - y1);
          const r = Math.min(4, barW / 2, bh);
          barRects.push({ x: x0, y: top, w: barW, h: bh, di: s.di, index: i });
          ctx.fillStyle = color;
          ctx.beginPath();
          ctx.roundRect(x0, top, barW, bh, stacked ? 0 : v >= 0 ? [r, r, 0, 0] : [0, 0, r, r]);
          ctx.fill();

          if (this.showValues() && !stacked) {
            ctx.fillStyle = th.muted;
            ctx.font = `10px ${this.fontFamily}`;
            ctx.textAlign = 'center';
            ctx.textBaseline = raw >= 0 ? 'bottom' : 'top';
            ctx.fillText(fmtAxis(raw), x0 + barW / 2, raw >= 0 ? top - 3 : top + bh + 3);
          }
        });
        if (this.showValues() && stacked && cumPos > 0) {
          ctx.fillStyle = th.muted;
          ctx.font = `10px ${this.fontFamily}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(fmtAxis(barSeries.reduce((a, s) => a + Math.max(0, s.ds.data[i] ?? 0), 0)), centers[i], y(cumPos) - 3);
        }
      }
    }

    // Lines & areas
    for (const s of series) {
      if (s.kind === 'bar') continue;
      const color = this.resolveColor(s.color);
      const data = s.ds.data;
      const pts: Pt[] = centers.map((cx, i) => ({ x: cx, y: zeroY + (y(data[i] ?? 0) - zeroY) * t }));
      pts.forEach((p, i) => seriesPts.push({ x: p.x, y: p.y, di: s.di, index: i }));
      const smooth = s.ds.smooth ?? this.smooth();

      if (pts.length > 1) {
        if (s.kind === 'area') {
          const grad = ctx.createLinearGradient(0, py, 0, py + ph);
          grad.addColorStop(0, this.rgba(color, 0.3));
          grad.addColorStop(1, this.rgba(color, 0.02));
          ctx.beginPath();
          this.tracePath(ctx, pts, smooth);
          ctx.lineTo(pts[pts.length - 1].x, zeroY);
          ctx.lineTo(pts[0].x, zeroY);
          ctx.closePath();
          ctx.fillStyle = grad;
          ctx.fill();
        }
        ctx.beginPath();
        this.tracePath(ctx, pts, smooth);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';
        if (s.ds.dashed) ctx.setLineDash([6, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      const showDots = (s.ds.markers ?? this.markers()) && n <= 40;
      pts.forEach((p, i) => {
        const active = i === hovIdx;
        if (!showDots && !active) return;
        ctx.beginPath();
        ctx.arc(p.x, p.y, active ? 4.5 : 3, 0, Math.PI * 2);
        ctx.fillStyle = active ? color : th.surface;
        ctx.fill();
        ctx.strokeStyle = active ? th.surface : color;
        ctx.lineWidth = active ? 2 : 1.5;
        ctx.stroke();
      });

      if (this.showValues()) {
        ctx.fillStyle = th.muted;
        ctx.font = `10px ${this.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        pts.forEach((p, i) => ctx.fillText(fmtAxis(data[i] ?? 0), p.x, p.y - 8));
      }
    }

    // Axis titles
    if (this.xTitle()) {
      ctx.fillStyle = th.muted;
      ctx.font = `600 11px ${this.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(this.xTitle(), px + pw / 2, h - 4);
    }
    if (this.yTitle()) {
      ctx.save();
      ctx.translate(12, py + ph / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.fillStyle = th.muted;
      ctx.font = `600 11px ${this.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.yTitle(), 0, 0);
      ctx.restore();
    }

    this.geom = { kind: 'cartesian', x: px, y: py, w: pw, h: ph, centers, horizontal: false, bars: barRects, pts: seriesPts };
  }

  // ------------------------------------------------------------------
  // Horizontal bars
  // ------------------------------------------------------------------

  private drawBarsHorizontal(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, th: ThemeColors): void {
    const labels = this.labels();
    const series = this.seriesList();
    if (!labels.length || !series.length) {
      this.drawEmpty(ctx, w, h, th);
      return;
    }
    const stacked = this.stacked();
    const n = labels.length;

    let vMin = 0;
    let vMax = 0;
    for (let i = 0; i < n; i++) {
      let pos = 0;
      let neg = 0;
      for (const s of series) {
        const v = s.ds.data[i] ?? 0;
        if (stacked) {
          if (v >= 0) pos += v;
          else neg += v;
        } else {
          if (v > vMax) vMax = v;
          if (v < vMin) vMin = v;
        }
      }
      if (pos > vMax) vMax = pos;
      if (neg < vMin) vMin = neg;
    }
    const sc = niceScale(vMin, vMax, 5);
    const ticks: number[] = [];
    for (let v = sc.min; v <= sc.max + sc.step / 2; v += sc.step) ticks.push(v);
    const fmtAxis = this.format() ?? compactNumber;

    ctx.font = `11px ${this.fontFamily}`;
    const truncate = (label: string, maxW: number): string => {
      if (ctx.measureText(label).width <= maxW) return label;
      let out = label;
      while (out.length > 1 && ctx.measureText(`${out}…`).width > maxW) out = out.slice(0, -1);
      return `${out}…`;
    };
    const catW = this.yAxis() ? Math.min(120, Math.max(...labels.map((l) => ctx.measureText(l).width))) : 0;

    const px = (this.yAxis() ? catW + 14 : 8) + (this.yTitle() ? 18 : 0);
    const py = 8;
    const pb = (this.xAxis() ? 24 : 8) + (this.xTitle() ? 18 : 0);
    const pw = w - px - (this.showValues() ? 44 : 12);
    const ph = h - py - pb;
    if (pw < 20 || ph < 20) return;

    const x = (v: number): number => px + ((v - sc.min) / (sc.max - sc.min)) * pw;

    for (const tk of ticks) {
      const tx = x(tk);
      if (this.grid()) {
        ctx.strokeStyle = th.grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tx, py);
        ctx.lineTo(tx, py + ph);
        ctx.stroke();
      }
      if (this.xAxis()) {
        ctx.fillStyle = th.muted;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(fmtAxis(tk), tx, py + ph + 8);
      }
    }

    const rowH = ph / n;
    const centers = Array.from({ length: n }, (_, i) => py + (i + 0.5) * rowH);

    const hovIdx = this.lastHit?.index ?? -1;
    if (hovIdx >= 0 && hovIdx < n) {
      ctx.fillStyle = this.rgba(th.ink, 0.05);
      ctx.fillRect(px, centers[hovIdx] - rowH / 2, pw, rowH);
    }

    if (this.yAxis()) {
      ctx.fillStyle = th.muted;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      labels.forEach((l, i) => ctx.fillText(truncate(l, catW), px - 8, centers[i]));
    }

    const barRects: BarRect[] = [];
    const groupH = rowH * 0.62;
    const barH = stacked ? Math.min(groupH, 30) : Math.min(groupH / series.length, 26);
    for (let i = 0; i < n; i++) {
      let cumPos = 0;
      let cumNeg = 0;
      series.forEach((s, si) => {
        const raw = s.ds.data[i] ?? 0;
        const v = raw * t;
        if (!v) return;
        const color = this.resolveColor(s.color);
        let y0: number;
        let base: number;
        if (stacked) {
          y0 = centers[i] - barH / 2;
          base = v >= 0 ? cumPos : cumNeg;
          if (v >= 0) cumPos += v;
          else cumNeg += v;
        } else {
          y0 = centers[i] - (barH * series.length) / 2 + si * barH;
          base = 0;
        }
        const x0 = x(base);
        const x1 = x(base + v);
        const left = Math.min(x0, x1);
        const bw = Math.abs(x1 - x0);
        const r = Math.min(4, barH / 2, bw);
        barRects.push({ x: left, y: y0, w: bw, h: barH, di: s.di, index: i });
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(left, y0, bw, barH, stacked ? 0 : v >= 0 ? [0, r, r, 0] : [r, 0, 0, r]);
        ctx.fill();

        if (this.showValues() && !stacked) {
          ctx.fillStyle = th.muted;
          ctx.font = `10px ${this.fontFamily}`;
          ctx.textAlign = raw >= 0 ? 'left' : 'right';
          ctx.textBaseline = 'middle';
          ctx.fillText(fmtAxis(raw), raw >= 0 ? left + bw + 5 : left - 5, y0 + barH / 2);
        }
      });
      if (this.showValues() && stacked && cumPos > 0) {
        ctx.fillStyle = th.muted;
        ctx.font = `10px ${this.fontFamily}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText(fmtAxis(series.reduce((a, s) => a + Math.max(0, s.ds.data[i] ?? 0), 0)), x(cumPos) + 5, centers[i]);
      }
    }

    if (this.xTitle()) {
      ctx.fillStyle = th.muted;
      ctx.font = `600 11px ${this.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(this.xTitle(), px + pw / 2, h - 4);
    }

    this.geom = { kind: 'cartesian', x: px, y: py, w: pw, h: ph, centers, horizontal: true, bars: barRects };
  }

  // ------------------------------------------------------------------
  // Pie / Donut
  // ------------------------------------------------------------------

  private drawPie(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    t: number,
    th: ThemeColors,
    donut: boolean,
  ): void {
    const slices = this.sliceList().filter((s) => s.value > 0);
    const total = slices.reduce((a, s) => a + s.value, 0);
    if (!slices.length || total <= 0) {
      this.drawEmpty(ctx, w, h, th);
      return;
    }
    const cx = w / 2;
    const cy = h / 2;
    const r = Math.max(12, Math.min(w, h) / 2 - 12);
    const inner = donut ? r * 0.62 : 0;

    let ang = -Math.PI / 2;
    const geomSlices: { start: number; end: number; index: number }[] = [];

    for (const s of slices) {
      const frac = s.value / total;
      const a0 = ang;
      const a1 = ang + frac * Math.PI * 2 * t;
      ang = a1;
      geomSlices.push({ start: a0, end: a1, index: s.index });

      const active = this.lastHit?.index === s.index;
      const mid = (a0 + a1) / 2;
      const ox = active ? Math.cos(mid) * 6 : 0;
      const oy = active ? Math.sin(mid) * 6 : 0;
      const color = this.resolveColor(s.color);

      ctx.beginPath();
      ctx.arc(cx + ox, cy + oy, r, a0, a1);
      if (inner) ctx.arc(cx + ox, cy + oy, inner, a1, a0, true);
      else ctx.lineTo(cx + ox, cy + oy);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = th.surface;
      ctx.lineWidth = 2;
      ctx.stroke();

      if (this.showValues() && frac >= 0.05) {
        const lr = inner ? (r + inner) / 2 : r * 0.64;
        ctx.fillStyle = th.surface;
        ctx.font = `600 11px ${this.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.round(frac * 100)}%`, cx + ox + Math.cos(mid) * lr, cy + oy + Math.sin(mid) * lr);
      }
    }

    if (inner) {
      const fmt = this.format() ?? compactNumber;
      ctx.fillStyle = th.ink;
      ctx.font = `700 ${Math.max(14, Math.round(r * 0.2))}px ${this.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(fmt(total), cx, cy - (this.donutLabel() ? 8 : 0));
      if (this.donutLabel()) {
        ctx.fillStyle = th.muted;
        ctx.font = `11px ${this.fontFamily}`;
        ctx.fillText(this.donutLabel(), cx, cy + 13);
      }
    }

    this.geom = { kind: 'pie', cx, cy, r, inner, slices: geomSlices };
  }

  // ------------------------------------------------------------------
  // Radar
  // ------------------------------------------------------------------

  private drawRadar(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, th: ThemeColors): void {
    const labels = this.labels();
    const series = this.seriesList();
    const n = labels.length;
    if (n < 3 || !series.length) {
      this.drawEmpty(ctx, w, h, th);
      return;
    }
    let vMax = 0;
    series.forEach((s) => s.ds.data.forEach((v) => (vMax = Math.max(vMax, v))));
    const max = niceScale(0, vMax || 1, 5).max;

    const cx = w / 2;
    const cy = h / 2;
    const R = Math.max(24, Math.min(w, h) / 2 - 34);
    const angle = (i: number): number => -Math.PI / 2 + (i * Math.PI * 2) / n;

    // Rings
    ctx.strokeStyle = th.grid;
    ctx.lineWidth = 1;
    for (let k = 1; k <= 4; k++) {
      ctx.beginPath();
      for (let i = 0; i <= n; i++) {
        const a = angle(i % n);
        const rr = (R * k) / 4;
        const px = cx + Math.cos(a) * rr;
        const py = cy + Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    const hovIdx = this.lastHit?.index ?? -1;

    // Spokes + axis labels
    for (let i = 0; i < n; i++) {
      const a = angle(i);
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      ctx.strokeStyle = i === hovIdx ? th.strong : th.grid;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + cos * R, cy + sin * R);
      ctx.stroke();

      ctx.fillStyle = th.muted;
      ctx.font = `11px ${this.fontFamily}`;
      ctx.textAlign = cos > 0.25 ? 'left' : cos < -0.25 ? 'right' : 'center';
      ctx.textBaseline = sin > 0.25 ? 'top' : sin < -0.25 ? 'bottom' : 'middle';
      ctx.fillText(labels[i], cx + cos * (R + 12), cy + sin * (R + 12));
    }

    // Series polygons (smooth = closed spline, like modern "star" radars)
    const smooth = this.smooth();
    const seriesPts: SeriesPt[] = [];
    for (const s of series) {
      const color = this.resolveColor(s.color);
      const pts: Pt[] = labels.map((_, i) => {
        const a = angle(i);
        const rr = Math.max(0, Math.min(1, (s.ds.data[i] ?? 0) / max)) * R * t;
        return { x: cx + Math.cos(a) * rr, y: cy + Math.sin(a) * rr };
      });
      pts.forEach((p, i) => seriesPts.push({ x: p.x, y: p.y, di: s.di, index: i }));
      ctx.beginPath();
      if (smooth && pts.length > 2) this.traceClosedSmooth(ctx, pts);
      else pts.forEach((p, i) => (i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y)));
      ctx.closePath();
      ctx.fillStyle = this.rgba(color, 0.16);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.lineJoin = 'round';
      ctx.stroke();
      pts.forEach((p, i) => {
        const active = i === hovIdx;
        ctx.beginPath();
        ctx.arc(p.x, p.y, active ? 4.5 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        if (active) {
          ctx.strokeStyle = th.surface;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    }

    this.geom = { kind: 'radar', cx, cy, r: R, count: n, pts: seriesPts };
  }

  // ------------------------------------------------------------------
  // Funnel
  // ------------------------------------------------------------------

  private traceFunnel(
    ctx: CanvasRenderingContext2D,
    hs: number[],
    x0: number,
    stageW: number,
    cy: number,
    n: number,
  ): void {
    const trans = stageW * 0.28;
    ctx.moveTo(x0, cy - hs[0] / 2);
    for (let i = 0; i < n; i++) {
      const xEnd = x0 + (i + 1) * stageW;
      ctx.lineTo(xEnd - (i < n - 1 ? trans : 0), cy - hs[i] / 2);
      if (i < n - 1) {
        ctx.bezierCurveTo(xEnd, cy - hs[i] / 2, xEnd, cy - hs[i + 1] / 2, xEnd + trans, cy - hs[i + 1] / 2);
      }
    }
    const xR = x0 + n * stageW;
    ctx.lineTo(xR, cy + hs[n - 1] / 2);
    for (let i = n - 1; i >= 0; i--) {
      const xStart = x0 + i * stageW;
      ctx.lineTo(xStart + (i > 0 ? trans : 0), cy + hs[i] / 2);
      if (i > 0) {
        ctx.bezierCurveTo(xStart, cy + hs[i] / 2, xStart, cy + hs[i - 1] / 2, xStart - trans, cy + hs[i - 1] / 2);
      }
    }
    ctx.closePath();
  }

  private drawFunnel(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, th: ThemeColors): void {
    const labels = this.labels();
    const values = this.datasets()[0]?.data ?? [];
    const n = Math.min(labels.length, values.length);
    if (!n) {
      this.drawEmpty(ctx, w, h, th);
      return;
    }
    const base = Math.max(...values.slice(0, n), 0) || 1;
    const padX = 6;
    const fw = w - padX * 2;
    const stageW = fw / n;
    const topPad = 34;
    const bottomPad = 28;
    const availH = h - topPad - bottomPad;
    if (availH < 40 || fw < 40) return;
    const mainH = availH / 1.3;
    const cy = topPad + availH / 2;
    const hs = values.slice(0, n).map((v) => Math.max(0.045, Math.min(1, v / base)) * mainH * t);

    const custom = this.colors();
    const multi = !!custom && custom.length > 1;
    const baseColor = this.resolveColor(this.baseColorCss());

    // Echo layers (soft glow behind the main shape)
    for (const e of [
      { k: 1.3, a: 0.1 },
      { k: 1.15, a: 0.18 },
    ]) {
      ctx.beginPath();
      this.traceFunnel(ctx, hs.map((v) => Math.min(v * e.k, availH)), padX, stageW, cy, n);
      ctx.fillStyle = this.rgba(baseColor, e.a);
      ctx.fill();
    }

    // Main shape, filled per stage (clipped) with alternating tones
    for (let i = 0; i < n; i++) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(padX + i * stageW, 0, stageW, h);
      ctx.clip();
      ctx.beginPath();
      this.traceFunnel(ctx, hs, padX, stageW, cy, n);
      if (multi) {
        ctx.fillStyle = this.resolveColor(this.normalizeColor(custom[i % custom.length]));
      } else {
        ctx.fillStyle = this.rgba(baseColor, i % 2 === 0 ? 1 : 0.55);
      }
      ctx.fill();
      ctx.restore();

      if (this.lastHit?.index === i) {
        ctx.fillStyle = this.rgba(th.ink, 0.06);
        ctx.fillRect(padX + i * stageW, topPad - 6, stageW, availH + 12);
      }
    }

    // Stage separators
    ctx.strokeStyle = th.surface;
    ctx.lineWidth = 2;
    for (let i = 1; i < n; i++) {
      const x = padX + i * stageW;
      ctx.beginPath();
      ctx.moveTo(x, cy - availH / 2);
      ctx.lineTo(x, cy + availH / 2);
      ctx.stroke();
    }

    // Values, percentage pills and stage labels
    const fmt = this.format() ?? compactNumber;
    for (let i = 0; i < n; i++) {
      const cxI = padX + (i + 0.5) * stageW;

      ctx.fillStyle = th.ink;
      ctx.font = `600 12px ${this.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(fmt(values[i] ?? 0), cxI, 14);

      ctx.fillStyle = th.muted;
      ctx.font = `11px ${this.fontFamily}`;
      ctx.fillText(labels[i], cxI, h - 12);

      const pctTxt = `${Math.round(((values[i] ?? 0) / base) * 100)}%`;
      ctx.font = `700 10px ${this.fontFamily}`;
      const tw = ctx.measureText(pctTxt).width;
      ctx.beginPath();
      ctx.roundRect(cxI - (tw + 16) / 2, cy - 10, tw + 16, 20, 10);
      ctx.fillStyle = this.rgba(th.ink, 0.9);
      ctx.fill();
      ctx.fillStyle = th.surface;
      ctx.fillText(pctTxt, cxI, cy + 0.5);
    }

    this.geom = { kind: 'funnel', x: padX, w: fw, count: n };
  }

  // ------------------------------------------------------------------
  // Funnel vertical (centered decreasing bars + connectors)
  // ------------------------------------------------------------------

  private drawFunnelVertical(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, th: ThemeColors): void {
    const labels = this.labels();
    const values = this.datasets()[0]?.data ?? [];
    const n = Math.min(labels.length, values.length);
    if (!n) {
      this.drawEmpty(ctx, w, h, th);
      return;
    }
    const base = Math.max(...values.slice(0, n), 0) || 1;
    const fmt = this.format() ?? compactNumber;

    const pctW = 46;
    const availW = w - 10 - pctW;
    const cx = 5 + availW / 2;
    const topPad = 4;
    const rowH = (h - topPad - 4) / n;
    const barH = Math.min(rowH * 0.72, 46);
    const connH = rowH - barH;
    const minW = Math.min(76, availW * 0.24);
    if (availW < 60 || rowH < 14) return;

    const widths = values
      .slice(0, n)
      .map((v) => Math.max(minW, Math.max(0, Math.min(1, v / base)) * availW) * t);
    const custom = this.colors();
    const multi = !!custom && custom.length > 1;
    const baseColor = this.resolveColor(this.baseColorCss());
    const stageFill = (i: number): string =>
      multi
        ? this.resolveColor(this.normalizeColor(custom[i % custom.length]))
        : this.rgba(baseColor, 1 - (n > 1 ? (0.55 * i) / (n - 1) : 0));

    // Connectors first, so the bars are drawn on top
    for (let i = 0; i < n - 1; i++) {
      if (connH < 3) break;
      const y0 = topPad + i * rowH;
      const bw = widths[i];
      const nw = widths[i + 1];
      ctx.beginPath();
      ctx.moveTo(cx - bw / 2 + 8, y0 + barH - 1);
      ctx.lineTo(cx + bw / 2 - 8, y0 + barH - 1);
      ctx.lineTo(cx + nw / 2 - 8, y0 + rowH + 1);
      ctx.lineTo(cx - nw / 2 + 8, y0 + rowH + 1);
      ctx.closePath();
      ctx.fillStyle = this.rgba(stageFill(i + 1), 0.25);
      ctx.fill();
    }

    const centers: number[] = [];
    for (let i = 0; i < n; i++) {
      const y0 = topPad + i * rowH;
      const bw = widths[i];
      centers.push(y0 + barH / 2);

      ctx.beginPath();
      ctx.roundRect(cx - bw / 2, y0, bw, barH, Math.min(10, barH / 2));
      ctx.fillStyle = stageFill(i);
      ctx.fill();
      if (this.lastHit?.index === i) {
        ctx.fillStyle = this.rgba(th.ink, 0.1);
        ctx.fill();
      }

      const txt = `${labels[i]} · ${fmt(values[i] ?? 0)}`;
      ctx.font = `600 11px ${this.fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = ctx.measureText(txt).width <= bw - 18 ? th.surface : th.ink;
      ctx.fillText(txt, cx, y0 + barH / 2 + 0.5);

      ctx.fillStyle = th.muted;
      ctx.font = `700 10px ${this.fontFamily}`;
      ctx.textAlign = 'right';
      ctx.fillText(`${Math.round(((values[i] ?? 0) / base) * 100)}%`, w - 4, y0 + barH / 2);
    }

    this.geom = { kind: 'cartesian', x: 0, y: topPad, w, h: h - topPad - 4, centers, horizontal: true };
  }

  // ------------------------------------------------------------------
  // Funnel pyramid (inverted triangle with side labels)
  // ------------------------------------------------------------------

  private drawFunnelPyramid(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, th: ThemeColors): void {
    const labels = this.labels();
    const values = this.datasets()[0]?.data ?? [];
    const n = Math.min(labels.length, values.length);
    if (!n) {
      this.drawEmpty(ctx, w, h, th);
      return;
    }
    const base = Math.max(...values.slice(0, n), 0) || 1;
    const fmt = this.format() ?? compactNumber;

    ctx.font = `600 11px ${this.fontFamily}`;
    const labW = Math.min(w * 0.42, Math.max(...labels.map((l) => ctx.measureText(l).width), 56) + 78);
    const sw = w - labW - 8;
    const cx = 4 + sw / 2;
    const topPad = 6;
    const H = h - topPad - 6;
    if (sw < 60 || H < 60) return;

    // Slice heights ∝ value, with a minimum so tiny stages stay readable
    const raw = values.slice(0, n).map((v) => Math.max(0, v));
    const sum = raw.reduce((a, b) => a + b, 0) || 1;
    const fr = raw.map((v) => Math.max(v / sum, 0.055));
    const frSum = fr.reduce((a, b) => a + b, 0);
    const heights = fr.map((f) => (f / frSum) * H * t);

    const topHalf = sw / 2 - 2;
    const tipHalf = topHalf * 0.06;
    const totalH = heights.reduce((a, b) => a + b, 0) || 1;
    const halfAt = (y: number): number => topHalf + ((tipHalf - topHalf) * (y - topPad)) / totalH;

    const tops: number[] = [topPad];
    const halves: [number, number][] = [];
    let yCur = topPad;
    for (let i = 0; i < n; i++) {
      const y0 = yCur;
      const y1 = yCur + heights[i];
      const h0 = halfAt(y0);
      const h1 = halfAt(y1);
      halves.push([h0, h1]);
      tops.push(y1);
      yCur = y1;

      ctx.beginPath();
      ctx.moveTo(cx - h0, y0);
      ctx.lineTo(cx + h0, y0);
      ctx.lineTo(cx + h1, y1);
      ctx.lineTo(cx - h1, y1);
      ctx.closePath();
      ctx.fillStyle = this.resolveColor(this.stageColorCss(i));
      ctx.fill();
      if (this.lastHit?.index === i) {
        ctx.fillStyle = this.rgba(th.ink, 0.1);
        ctx.fill();
      }
      ctx.strokeStyle = th.surface;
      ctx.lineWidth = 2;
      ctx.stroke();

      // Leader line + label / value on the right
      const midY = (y0 + y1) / 2;
      const lx = 4 + sw + 12;
      ctx.strokeStyle = th.strong;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx + halfAt(midY) + 3, midY);
      ctx.lineTo(lx - 5, midY);
      ctx.stroke();

      ctx.fillStyle = th.ink;
      ctx.font = `600 11px ${this.fontFamily}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
      ctx.fillText(labels[i], lx, midY - 2);
      ctx.fillStyle = th.muted;
      ctx.font = `10px ${this.fontFamily}`;
      ctx.textBaseline = 'top';
      ctx.fillText(`${fmt(values[i] ?? 0)} · ${Math.round(((values[i] ?? 0) / base) * 100)}%`, lx, midY + 3);

      if (this.showValues() && heights[i] > 18 && halfAt(midY) * 2 > 64) {
        ctx.fillStyle = th.surface;
        ctx.font = `700 11px ${this.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(fmt(values[i] ?? 0), cx, midY);
      }
    }

    this.geom = { kind: 'bands', cx, tops, halves };
  }

  // ------------------------------------------------------------------
  // Heatmap (matrix — labels = columns, each dataset = one row)
  // ------------------------------------------------------------------

  private drawHeatmap(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, th: ThemeColors): void {
    const labels = this.labels();
    const rows = this.datasets();
    const cols = labels.length;
    const m = rows.length;
    if (!cols || !m) {
      this.drawEmpty(ctx, w, h, th);
      return;
    }
    let vMin = Infinity;
    let vMax = -Infinity;
    for (const r of rows) {
      for (let i = 0; i < cols; i++) {
        const v = r.data[i] ?? 0;
        if (v < vMin) vMin = v;
        if (v > vMax) vMax = v;
      }
    }
    if (!Number.isFinite(vMin)) {
      vMin = 0;
      vMax = 1;
    }
    if (vMin > 0) vMin = 0;
    const span = vMax - vMin || 1;

    const fmtAxis = this.format() ?? compactNumber;
    ctx.font = `11px ${this.fontFamily}`;
    const catW = this.yAxis() ? Math.min(120, Math.max(...rows.map((r) => ctx.measureText(r.label).width))) : 0;
    const px = catW + (this.yAxis() ? 12 : 2);
    const py = 2;
    const pb = (this.xAxis() ? 24 : 4) + (this.legend() ? 18 : 0);
    const pw = w - px - 4;
    const ph = h - py - pb;
    if (pw < 20 || ph < 20) return;

    const cw = pw / cols;
    const chh = ph / m;
    const gap = Math.min(3, cw * 0.14, chh * 0.14);
    const baseColor = this.resolveColor(this.baseColorCss());
    const hov = this.lastHit;

    for (let r = 0; r < m; r++) {
      for (let c = 0; c < cols; c++) {
        const v = rows[r].data[c] ?? 0;
        const frac = Math.max(0, Math.min(1, (v - vMin) / span));
        const x0 = px + c * cw + gap / 2;
        const y0 = py + r * chh + gap / 2;
        const rw = cw - gap;
        const rh = chh - gap;
        ctx.beginPath();
        ctx.roundRect(x0, y0, rw, rh, Math.min(4, rw / 2, rh / 2));
        ctx.fillStyle = this.rgba(baseColor, (0.07 + 0.93 * frac) * t);
        ctx.fill();
        if (hov && hov.datasetIndex === r && hov.index === c) {
          ctx.strokeStyle = th.ink;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
        if (this.showValues() && rw > 22 && rh > 14) {
          ctx.fillStyle = frac > 0.55 ? th.surface : th.muted;
          ctx.font = `10px ${this.fontFamily}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(fmtAxis(v), x0 + rw / 2, y0 + rh / 2);
        }
      }
    }

    if (this.yAxis()) {
      ctx.fillStyle = th.muted;
      ctx.font = `11px ${this.fontFamily}`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      rows.forEach((r, i) => ctx.fillText(r.label, px - 8, py + (i + 0.5) * chh));
    }
    if (this.xAxis()) {
      ctx.font = `11px ${this.fontFamily}`;
      const maxLabW = Math.max(...labels.map((l) => ctx.measureText(l).width));
      const step = Math.max(1, Math.ceil((maxLabW + 10) / cw));
      ctx.fillStyle = th.muted;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      labels.forEach((l, i) => {
        if (i % step === 0) ctx.fillText(l, px + (i + 0.5) * cw, py + ph + 8);
      });
    }

    // Intensity scale (bottom right)
    if (this.legend()) {
      const sw = Math.min(90, pw * 0.4);
      const sx = w - sw - 6;
      const sy = h - 9;
      const grad = ctx.createLinearGradient(sx, 0, sx + sw, 0);
      grad.addColorStop(0, this.rgba(baseColor, 0.07));
      grad.addColorStop(1, baseColor);
      ctx.beginPath();
      ctx.roundRect(sx, sy - 4, sw, 8, 4);
      ctx.fillStyle = grad;
      ctx.fill();
      ctx.fillStyle = th.faint;
      ctx.font = `10px ${this.fontFamily}`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(fmtAxis(vMin), sx - 6, sy);
      ctx.textAlign = 'left';
      ctx.fillText(fmtAxis(vMax), sx + sw + 6, sy);
    }

    this.geom = { kind: 'matrix', x: px, y: py, cw, ch: chh, cols, rows: m };
  }

  // ------------------------------------------------------------------
  // Treemap (squarified, with drill-down)
  // ------------------------------------------------------------------

  /** Squarified treemap layout — values must be sorted descending. */
  private squarify(values: number[], x: number, y: number, w: number, h: number): { x: number; y: number; w: number; h: number }[] {
    const total = values.reduce((a, b) => a + b, 0) || 1;
    const scale = (w * h) / total;
    const areas = values.map((v) => v * scale);
    const rects: { x: number; y: number; w: number; h: number }[] = [];
    let rx = x;
    let ry = y;
    let rw = w;
    let rh = h;
    let row: number[] = [];

    const worst = (arr: number[], len: number): number => {
      const s = arr.reduce((a, b) => a + b, 0);
      const max = Math.max(...arr);
      const min = Math.min(...arr);
      return Math.max((len * len * max) / (s * s), (s * s) / (len * len * min));
    };
    const layoutRow = (arr: number[]): void => {
      const s = arr.reduce((a, b) => a + b, 0);
      if (rw >= rh) {
        const colW = s / rh;
        let cy = ry;
        for (const a of arr) {
          rects.push({ x: rx, y: cy, w: colW, h: a / colW });
          cy += a / colW;
        }
        rx += colW;
        rw -= colW;
      } else {
        const rowH = s / rw;
        let cx = rx;
        for (const a of arr) {
          rects.push({ x: cx, y: ry, w: a / rowH, h: rowH });
          cx += a / rowH;
        }
        ry += rowH;
        rh -= rowH;
      }
    };

    for (const a of areas) {
      const len = Math.min(rw, rh);
      if (!row.length || worst([...row, a], len) <= worst(row, len)) row.push(a);
      else {
        layoutRow(row);
        row = [a];
      }
    }
    if (row.length) layoutRow(row);
    return rects;
  }

  private drawTreemap(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, th: ThemeColors): void {
    const stack = this.drillStack();
    const level = stack[stack.length - 1];
    const nodes = level?.nodes ?? this.rootNodes();
    const items = nodes
      .map((node, index) => ({ node, index, v: this.nodeValue(node) }))
      .filter((it) => it.v > 0);
    if (!items.length) {
      this.drawEmpty(ctx, w, h, th);
      return;
    }
    const topPad = stack.length ? 38 : 0;
    const ax = 1;
    const ay = 1 + topPad;
    const aw = w - 2;
    const ah = h - 2 - topPad;
    if (aw < 20 || ah < 20) return;

    const sorted = [...items].sort((a, b) => b.v - a.v);
    const layout = this.squarify(sorted.map((s) => s.v), ax, ay, aw, ah);

    const rects: TreeRect[] = [];
    const hovIdx = this.lastHit?.index ?? -1;
    const fmt = this.format() ?? compactNumber;

    ctx.save();
    const sc = 0.92 + 0.08 * t;
    ctx.translate((w / 2) * (1 - sc), (ay + ah / 2) * (1 - sc));
    ctx.scale(sc, sc);
    ctx.globalAlpha = Math.min(1, t * 1.5);

    sorted.forEach((it, k) => {
      const r = layout[k];
      const colorCss = it.node.color
        ? this.normalizeColor(it.node.color)
        : level
          ? this.rgba(this.resolveColor(level.colorCss), 1 - (sorted.length > 1 ? (0.5 * k) / (sorted.length - 1) : 0))
          : this.cssColorAt(it.index);
      const rectIdx = rects.length;
      rects.push({ x: r.x, y: r.y, w: r.w, h: r.h, node: it.node, index: it.index, colorCss });

      const gx = r.x + 1.5;
      const gy = r.y + 1.5;
      const gw = Math.max(0, r.w - 3);
      const gh = Math.max(0, r.h - 3);
      if (gw < 2 || gh < 2) return;
      ctx.beginPath();
      ctx.roundRect(gx, gy, gw, gh, Math.min(5, gw / 2, gh / 2));
      ctx.fillStyle = this.resolveColor(colorCss);
      ctx.fill();
      if (rectIdx === hovIdx) {
        ctx.fillStyle = this.rgba(th.ink, 0.12);
        ctx.fill();
      }

      if (gw > 44 && gh > 22) {
        ctx.save();
        ctx.beginPath();
        ctx.rect(gx + 4, gy, gw - 8, gh);
        ctx.clip();
        ctx.fillStyle = th.surface;
        ctx.font = `600 11px ${this.fontFamily}`;
        ctx.textAlign = 'center';
        const cxText = gx + gw / 2;
        if (this.showValues() && gh > 40) {
          ctx.textBaseline = 'alphabetic';
          ctx.fillText(it.node.label, cxText, gy + gh / 2 - 3);
          ctx.fillStyle = this.rgba(th.surface, 0.85);
          ctx.font = `10px ${this.fontFamily}`;
          ctx.textBaseline = 'top';
          ctx.fillText(fmt(it.v), cxText, gy + gh / 2 + 4);
        } else {
          ctx.textBaseline = 'middle';
          ctx.fillText(it.node.label, cxText, gy + gh / 2);
        }
        ctx.restore();
      }

      // Drillable marker (chevron at the top-right corner)
      if (it.node.children?.length && gw > 30 && gh > 22) {
        ctx.strokeStyle = this.rgba(th.surface, 0.8);
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.beginPath();
        const mx = gx + gw - 12;
        const my = gy + 12;
        ctx.moveTo(mx - 2, my - 3.5);
        ctx.lineTo(mx + 2, my);
        ctx.lineTo(mx - 2, my + 3.5);
        ctx.stroke();
      }
    });
    ctx.restore();

    this.geom = { kind: 'treemap', rects };
  }

  // ------------------------------------------------------------------
  // Range bars (floating rounded capsules)
  // ------------------------------------------------------------------

  private drawRangeBars(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, th: ThemeColors): void {
    const labels = this.labels();
    const series = this.seriesList().filter((s) => s.ds.ranges?.length);
    if (!labels.length || !series.length) {
      this.drawEmpty(ctx, w, h, th);
      return;
    }
    const n = labels.length;
    let lo = Infinity;
    let hi = -Infinity;
    for (const s of series) {
      for (const rng of s.ds.ranges ?? []) {
        lo = Math.min(lo, rng[0], rng[1]);
        hi = Math.max(hi, rng[0], rng[1]);
      }
    }
    const sc = niceScale(lo, hi, 5);
    const ticks: number[] = [];
    for (let v = sc.min; v <= sc.max + sc.step / 2; v += sc.step) ticks.push(v);
    const fmtAxis = this.format() ?? compactNumber;
    ctx.font = `11px ${this.fontFamily}`;
    const tickW = Math.max(...ticks.map((v) => ctx.measureText(fmtAxis(v)).width));

    const px = this.yAxis() ? tickW + 14 : 8;
    const py = 10;
    const pb = this.xAxis() ? 26 : 8;
    const pw = w - px - 10;
    const ph = h - py - pb;
    if (pw < 20 || ph < 20) return;
    const y = (v: number): number => py + ph - ((v - sc.min) / (sc.max - sc.min)) * ph;

    for (const tk of ticks) {
      const ty = y(tk);
      if (this.grid()) {
        ctx.strokeStyle = th.grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, ty);
        ctx.lineTo(px + pw, ty);
        ctx.stroke();
      }
      if (this.yAxis()) {
        ctx.fillStyle = th.muted;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(fmtAxis(tk), px - 8, ty);
      }
    }

    const centers = Array.from({ length: n }, (_, i) => px + ((i + 0.5) * pw) / n);

    const hovIdx = this.lastHit?.index ?? -1;
    if (hovIdx >= 0 && hovIdx < n) {
      ctx.fillStyle = this.rgba(th.ink, 0.05);
      const bw = pw / n;
      ctx.fillRect(centers[hovIdx] - bw / 2, py, bw, ph);
    }

    if (this.xAxis()) {
      const maxLabW = Math.max(...labels.map((l) => ctx.measureText(l).width));
      const step = Math.max(1, Math.ceil((maxLabW + 16) / (pw / n)));
      ctx.fillStyle = th.muted;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      labels.forEach((l, i) => {
        if (i % step === 0) ctx.fillText(l, centers[i], py + ph + 8);
      });
    }

    const barRects: BarRect[] = [];
    const groupW = (pw / n) * 0.55;
    const barW = Math.min(groupW / series.length, 16);
    series.forEach((s, si) => {
      const color = this.resolveColor(s.color);
      ctx.fillStyle = color;
      for (let i = 0; i < n; i++) {
        const rng = s.ds.ranges?.[i];
        if (!rng) continue;
        const mid = (rng[0] + rng[1]) / 2;
        const half = (Math.abs(rng[1] - rng[0]) / 2) * t;
        const yTop = y(mid + half);
        const yBot = y(mid - half);
        const x0 = centers[i] - (barW * series.length) / 2 + si * barW + 1.5;
        const bw = barW - 3;
        barRects.push({ x: x0, y: yTop, w: bw, h: Math.max(yBot - yTop, bw), di: s.di, index: i });
        ctx.beginPath();
        ctx.roundRect(x0, yTop, bw, Math.max(yBot - yTop, bw), bw / 2);
        ctx.fill();
      }
    });

    this.geom = { kind: 'cartesian', x: px, y: py, w: pw, h: ph, centers, horizontal: false, bars: barRects };
  }

  // ------------------------------------------------------------------
  // Scatter (XY)
  // ------------------------------------------------------------------

  private drawScatter(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, th: ThemeColors): void {
    const series = this.seriesList().filter((s) => s.ds.points?.length);
    if (!series.length) {
      this.drawEmpty(ctx, w, h, th);
      return;
    }
    let xMin = Infinity;
    let xMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;
    for (const s of series) {
      for (const p of s.ds.points ?? []) {
        xMin = Math.min(xMin, p.x);
        xMax = Math.max(xMax, p.x);
        yMin = Math.min(yMin, p.y);
        yMax = Math.max(yMax, p.y);
      }
    }
    const scX = niceScale(xMin, xMax, 6);
    const scY = niceScale(yMin, yMax, 5);
    const ticksX: number[] = [];
    for (let v = scX.min; v <= scX.max + scX.step / 2; v += scX.step) ticksX.push(v);
    const ticksY: number[] = [];
    for (let v = scY.min; v <= scY.max + scY.step / 2; v += scY.step) ticksY.push(v);
    const fmtAxis = this.format() ?? compactNumber;
    ctx.font = `11px ${this.fontFamily}`;
    const tickW = Math.max(...ticksY.map((v) => ctx.measureText(fmtAxis(v)).width));

    const px = this.yAxis() ? tickW + 14 : 8;
    const py = 10;
    const pb = this.xAxis() ? 26 : 8;
    const pw = w - px - 12;
    const ph = h - py - pb;
    if (pw < 20 || ph < 20) return;
    const x = (v: number): number => px + ((v - scX.min) / (scX.max - scX.min)) * pw;
    const y = (v: number): number => py + ph - ((v - scY.min) / (scY.max - scY.min)) * ph;

    for (const tk of ticksY) {
      const ty = y(tk);
      if (this.grid()) {
        ctx.strokeStyle = th.grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, ty);
        ctx.lineTo(px + pw, ty);
        ctx.stroke();
      }
      if (this.yAxis()) {
        ctx.fillStyle = th.muted;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(fmtAxis(tk), px - 8, ty);
      }
    }
    for (const tk of ticksX) {
      const tx = x(tk);
      if (this.grid()) {
        ctx.strokeStyle = this.rgba(th.grid, 0.6);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(tx, py);
        ctx.lineTo(tx, py + ph);
        ctx.stroke();
      }
      if (this.xAxis()) {
        ctx.fillStyle = th.muted;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillText(fmtAxis(tk), tx, py + ph + 8);
      }
    }

    const geomPts: { x: number; y: number; di: number; pi: number }[] = [];
    const hov = this.lastHit;
    for (const s of series) {
      const color = this.resolveColor(s.color);
      (s.ds.points ?? []).forEach((p, pi) => {
        const sx = x(p.x);
        const sy = y(p.y);
        geomPts.push({ x: sx, y: sy, di: s.di, pi });
        const active = hov?.datasetIndex === s.di && hov?.index === pi;
        ctx.beginPath();
        ctx.arc(sx, sy, (active ? 6.5 : 4) * t, 0, Math.PI * 2);
        ctx.fillStyle = this.rgba(color, active ? 1 : 0.85);
        ctx.fill();
        if (active) {
          ctx.strokeStyle = th.surface;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      });
    }

    this.geom = { kind: 'scatter', pts: geomPts };
  }

  // ------------------------------------------------------------------
  // Dot columns (values as stacked dots)
  // ------------------------------------------------------------------

  private drawDots(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, th: ThemeColors): void {
    const labels = this.labels();
    const series = this.seriesList();
    if (!labels.length || !series.length) {
      this.drawEmpty(ctx, w, h, th);
      return;
    }
    const n = labels.length;
    let vMax = 0;
    for (const s of series) for (const v of s.ds.data) vMax = Math.max(vMax, v);
    const sc = niceScale(0, vMax || 1, 5);
    const ticks: number[] = [];
    for (let v = sc.min; v <= sc.max + sc.step / 2; v += sc.step) ticks.push(v);
    const fmtAxis = this.format() ?? compactNumber;
    ctx.font = `11px ${this.fontFamily}`;
    const tickW = Math.max(...ticks.map((v) => ctx.measureText(fmtAxis(v)).width));

    const px = this.yAxis() ? tickW + 14 : 8;
    const py = 10;
    const pb = this.xAxis() ? 26 : 8;
    const pw = w - px - 10;
    const ph = h - py - pb;
    if (pw < 20 || ph < 20) return;
    const y = (v: number): number => py + ph - ((v - sc.min) / (sc.max - sc.min)) * ph;
    const zeroY = y(0);

    for (const tk of ticks) {
      const ty = y(tk);
      if (this.grid()) {
        ctx.strokeStyle = th.grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(px, ty);
        ctx.lineTo(px + pw, ty);
        ctx.stroke();
      }
      if (this.yAxis()) {
        ctx.fillStyle = th.muted;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';
        ctx.fillText(fmtAxis(tk), px - 8, ty);
      }
    }

    const centers = Array.from({ length: n }, (_, i) => px + ((i + 0.5) * pw) / n);

    const hovIdx = this.lastHit?.index ?? -1;
    if (hovIdx >= 0 && hovIdx < n) {
      ctx.fillStyle = this.rgba(th.ink, 0.05);
      const bw = pw / n;
      ctx.fillRect(centers[hovIdx] - bw / 2, py, bw, ph);
    }

    if (this.xAxis()) {
      const maxLabW = Math.max(...labels.map((l) => ctx.measureText(l).width));
      const step = Math.max(1, Math.ceil((maxLabW + 16) / (pw / n)));
      ctx.fillStyle = th.muted;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      labels.forEach((l, i) => {
        if (i % step === 0) ctx.fillText(l, centers[i], py + ph + 8);
      });
    }

    const colW = (pw / n) * 0.7;
    const laneW = Math.min(colW / series.length, 26);
    const pitch = 13;
    const dotR = Math.max(2, Math.min(4, laneW / 2 - 2));
    series.forEach((s, si) => {
      const color = this.resolveColor(s.color);
      ctx.fillStyle = color;
      for (let i = 0; i < n; i++) {
        const v = (s.ds.data[i] ?? 0) * t;
        if (v <= 0) continue;
        const topY = y(v);
        const cxD = centers[i] - (laneW * series.length) / 2 + (si + 0.5) * laneW;
        let drawn = false;
        for (let yy = zeroY - pitch / 2; yy >= topY; yy -= pitch) {
          ctx.beginPath();
          ctx.arc(cxD, yy, dotR, 0, Math.PI * 2);
          ctx.fill();
          drawn = true;
        }
        if (!drawn) {
          ctx.beginPath();
          ctx.arc(cxD, (zeroY + topY) / 2, dotR, 0, Math.PI * 2);
          ctx.fill();
        }
        if (this.showValues()) {
          ctx.fillStyle = th.muted;
          ctx.font = `10px ${this.fontFamily}`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'bottom';
          ctx.fillText(fmtAxis(s.ds.data[i] ?? 0), cxD, topY - 5);
          ctx.fillStyle = color;
        }
      }
    });

    this.geom = { kind: 'cartesian', x: px, y: py, w: pw, h: ph, centers, horizontal: false };
  }

  // ------------------------------------------------------------------
  // Segments (horizontal segmented progress rows)
  // ------------------------------------------------------------------

  private drawSegments(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, th: ThemeColors): void {
    const labels = this.labels();
    const ds = this.datasets()[0];
    const values = ds?.data ?? [];
    const n = Math.min(labels.length, values.length);
    if (!n) {
      this.drawEmpty(ctx, w, h, th);
      return;
    }
    const maxV = this.max() ?? (Math.max(...values.slice(0, n), 0) || 1);
    const fmtV = this.format() ?? compactNumber;
    ctx.font = `11px ${this.fontFamily}`;
    const catW = Math.min(130, Math.max(...labels.map((l) => ctx.measureText(l).width)));
    const valW = this.showValues()
      ? Math.max(...values.slice(0, n).map((v) => ctx.measureText(fmtV(v)).width)) + 16
      : 0;

    const px = catW + 14;
    const py = 8;
    const pw = w - px - 12 - valW;
    const ph = h - py - 8;
    if (pw < 40 || ph < 20) return;

    const rowH = ph / n;
    const centers = Array.from({ length: n }, (_, i) => py + (i + 0.5) * rowH);
    const segH = Math.max(5, Math.min(9, rowH * 0.5));
    const gap = 6;
    const segW = 16;
    const count = Math.max(1, Math.floor((pw + gap) / (segW + gap)));
    const color = this.resolveColor(this.cssColorAt(0, ds));

    const hovIdx = this.lastHit?.index ?? -1;
    if (hovIdx >= 0 && hovIdx < n) {
      ctx.fillStyle = this.rgba(th.ink, 0.05);
      ctx.fillRect(0, centers[hovIdx] - rowH / 2, w, rowH);
    }

    for (let i = 0; i < n; i++) {
      const frac = Math.max(0, Math.min(1, (values[i] ?? 0) / maxV)) * t;
      const filled = Math.round(frac * count);
      for (let k = 0; k < count; k++) {
        const x0 = px + k * (segW + gap);
        ctx.fillStyle = k < filled ? color : this.rgba(th.strong, 0.35);
        ctx.beginPath();
        ctx.roundRect(x0, centers[i] - segH / 2, segW, segH, segH / 2);
        ctx.fill();
      }

      ctx.fillStyle = th.muted;
      ctx.font = `11px ${this.fontFamily}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(labels[i], 2, centers[i]);

      if (this.showValues()) {
        ctx.fillStyle = th.ink;
        ctx.font = `600 11px ${this.fontFamily}`;
        ctx.textAlign = 'right';
        ctx.fillText(fmtV(values[i] ?? 0), w - 2, centers[i]);
      }
    }

    this.geom = { kind: 'cartesian', x: px, y: py, w: pw + valW, h: ph, centers, horizontal: true };
  }

  // ------------------------------------------------------------------
  // Radial bar & gauge
  // ------------------------------------------------------------------

  private drawArc(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    a0: number,
    a1: number,
    thick: number,
    color: string,
    dotted: boolean,
  ): void {
    if (a1 <= a0 || r <= 0) return;
    if (!dotted) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, a0, a1);
      ctx.strokeStyle = color;
      ctx.lineWidth = thick;
      ctx.lineCap = 'round';
      ctx.stroke();
      return;
    }
    const dotR = thick / 2;
    const step = Math.max((dotR * 2.8) / r, 0.05);
    ctx.fillStyle = color;
    for (let a = a0 + step / 2; a <= a1; a += step) {
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, dotR, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  private drawRadialBar(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, th: ThemeColors): void {
    const slices = this.sliceList();
    if (!slices.length) {
      this.drawEmpty(ctx, w, h, th);
      return;
    }
    const vals = slices.map((s) => s.value);
    const maxV = this.max() ?? (Math.max(...vals, 0) || 1);
    const cx = w / 2;
    const cy = h / 2;
    const outerR = Math.min(w, h) / 2 - 8;
    if (outerR < 24) return;
    const n = slices.length;
    const inner = outerR * 0.38;
    const per = (outerR - inner) / n;
    const thick = Math.max(4, per * 0.6);
    const dotted = this.radialStyle() === 'dotted';
    const start = -Math.PI / 2;
    const sweepMax = Math.PI * 1.5;

    const rings: { r: number; thick: number; index: number }[] = [];
    slices.forEach((s, k) => {
      const r = outerR - per * k - thick / 2;
      const color = this.resolveColor(s.color);
      this.drawArc(ctx, cx, cy, r, start, start + sweepMax, thick, this.rgba(th.strong, dotted ? 0.25 : 0.3), dotted);
      const frac = Math.max(0, Math.min(1, s.value / maxV));
      const active = this.lastHit?.index === s.index;
      this.drawArc(ctx, cx, cy, r, start, start + sweepMax * frac * t, active ? thick + 2 : thick, color, dotted);
      rings.push({ r, thick, index: s.index });
    });

    const fmt = this.format() ?? compactNumber;
    const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
    ctx.fillStyle = th.ink;
    ctx.font = `700 ${Math.max(13, Math.min(20, Math.round(inner * 0.45)))}px ${this.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fmt(Math.round(avg * 10) / 10), cx, cy - (this.donutLabel() ? 7 : 0));
    if (this.donutLabel()) {
      ctx.fillStyle = th.muted;
      ctx.font = `10px ${this.fontFamily}`;
      ctx.fillText(this.donutLabel(), cx, cy + 11);
    }

    this.geom = { kind: 'rings', cx, cy, rings };
  }

  private drawGauge(ctx: CanvasRenderingContext2D, w: number, h: number, t: number, th: ThemeColors): void {
    const ds = this.datasets()[0];
    const value = ds?.data[0] ?? 0;
    const maxV = this.max() ?? 100;
    const R = Math.min(w / 2 - 12, h / 2 - 8);
    if (R < 20) {
      this.drawEmpty(ctx, w, h, th);
      return;
    }
    const cx = w / 2;
    const cy = h / 2 + R * 0.12;
    const thick = Math.max(10, Math.min(22, R * 0.16));
    const dotted = this.radialStyle() === 'dotted';
    const a0 = Math.PI * 0.75;
    const sweep = Math.PI * 1.5;
    const color = this.resolveColor(this.cssColorAt(0, ds));

    this.drawArc(ctx, cx, cy, R - thick / 2, a0, a0 + sweep, thick, this.rgba(th.strong, dotted ? 0.25 : 0.3), dotted);
    const frac = Math.max(0, Math.min(1, value / maxV));
    this.drawArc(ctx, cx, cy, R - thick / 2, a0, a0 + sweep * frac * t, thick, color, dotted);

    const fmt = this.format() ?? compactNumber;
    ctx.fillStyle = th.ink;
    ctx.font = `700 ${Math.max(16, Math.round(R * 0.28))}px ${this.fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(fmt(value * t), cx, cy - (this.donutLabel() ? 8 : 0));
    if (this.donutLabel()) {
      ctx.fillStyle = th.muted;
      ctx.font = `11px ${this.fontFamily}`;
      ctx.fillText(this.donutLabel(), cx, cy + Math.max(14, R * 0.18));
    }

    this.geom = null;
  }
}
