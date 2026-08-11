# atm-chart

> Doc otimizada para LLMs. Fonte: `src/core/ui/components/chart/chart.component.ts`

## Purpose

Gráficos (chart) configuráveis.

## Notes from source

Chart families supported by AtmChart. */
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

/**AtmChart — canvas-based charting component.Types: line, area, bar (columns), bar-horizontal, pie, donut, radar, funnel(horizontal, vertical and pyramid), heatmap, treemap (with drill-down) andmixed charts (per-dataset `type`). Renders on HTML5 canvas withdevicePixelRatio scaling, ResizeObserver responsiveness, entry animations(respects prefers-reduced-motion), interactive HTML tooltip + legend andautomatic dark-mode via theme tokens.```html<atm-chart  type="bar"  title="Vendas"  [labels]="['Jan', 'Fev', 'Mar']"  [datasets]="[{ label: 'Receita', data: [10, 25, 18] }]"/>```

## Identity

- **Class**: `AtmChart`
- **Selector**: `atm-chart`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `type` | AtmChartType | no | 'line' |
| `labels` | string[] | no | [] |
| `datasets` | AtmChartDataset[] | no | [] |
| `title` | string | no | '' |
| `subtitle` | string | no | '' |
| `height` | number \| string | no | 320 |
| `width` | number \| string \| null | no | null |
| `colors` | string[] \| null | no | null |
| `legend` | boolean | no | true |
| `legendPosition` | 'top' \| 'bottom' \| 'left' \| 'right' | no | 'bottom' |
| `tooltip` | boolean | no | true |
| `grid` | boolean | no | true |
| `xAxis` | boolean | no | true |
| `yAxis` | boolean | no | true |
| `stacked` | boolean | no | false |
| `smooth` | boolean | no | true |
| `markers` | boolean | no | true |
| `showValues` | boolean | no | false |
| `animated` | boolean | no | true |
| `xTitle` | string | no | '' |
| `yTitle` | string | no | '' |
| `format` | ((value: number) => string) \| null | no | (value: number) => string) \| null>(null |
| `donutLabel` | string | no | 'Total' |
| `max` | number \| null | no | null |
| `radialStyle` | 'solid' \| 'dotted' | no | 'solid' |
| `tree` | AtmChartTreeNode[] \| null | no | null |
| `loadChildren` | ((node: AtmChartTreeNode, path: AtmChartTreeNode[]) => Promise<AtmChartTreeNode[]> \| AtmChartTreeNode[]) \| null | no | (node: AtmChartTreeNode, path: AtmChartTreeNode[]) => Promise<AtmChartTreeNode[]> \| AtmChartTreeNode[]) \| null >(null |

## Outputs

| Name | Payload |
| --- | --- |
| `pointClick` | AtmChartPointEvent |
| `nodeClick` | AtmChartTreeEvent |
| `drillDown` | AtmChartTreeEvent |

## Models (two-way)

_Nenhum._
## Related interfaces / types

### AtmChartType

```ts
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
```

### AtmChartPoint

```ts
export interface AtmChartPoint {
  x: number;
  y: number;
}
```

### AtmChartSeriesType

```ts
export type AtmChartSeriesType = 'line' | 'area' | 'bar';
```

### AtmChartDataset

```ts
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
```

### AtmChartPointEvent

```ts
export interface AtmChartPointEvent {
  index: number;
  label: string;
  datasetIndex: number;
  datasetLabel: string;
  value: number;
}
```

### AtmChartTreeNode

```ts
export interface AtmChartTreeNode {
  label: string;
  value?: number;
  /** Any CSS color, `var(--atm-primary)` or shorthand `--atm-primary`. */
  color?: string;
  /** Child nodes — enables built-in drill-down on double click. */
  children?: AtmChartTreeNode[];
}
```

### AtmChartTreeEvent

```ts
export interface AtmChartTreeEvent {
  node: AtmChartTreeNode;
  /** Drill trail from the root down to (and including) `node`. */
  path: AtmChartTreeNode[];
}
```

## Usage example

```html
<atm-chart [type]="'bar'" [data]="chartData" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
