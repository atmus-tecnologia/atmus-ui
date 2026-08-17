# atm-event-calendar

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/event-calendar/event-calendar.component.ts`

## Purpose

Calendário de eventos (views dia/semana/mês).

## Notes from source

An event rendered by the event calendar. */
export interface AtmCalendarEvent {
  id: string;
  title: string;
  start: Date;
  /** Defaults to start + 1h for timed events. */
  end?: Date;
  allDay?: boolean;
  color?: AtmColor;
  category?: string;
  location?: string;
  description?: string;
  /** Free-form payload for the host app. */
  meta?: Record<string, unknown>;
}

export type AtmEventCalendarView = 'month' | 'week' | 'day' | 'list';

/** Emitted when the user selects a time range (drag-select or slot click). */
export interface AtmCalendarRange {
  start: Date;
  end: Date;
}

/** Emitted after a drag-move or resize; the host applies the change to its data. */
export interface AtmCalendarEventChange {
  event: AtmCalendarEvent;
  start: Date;
  end: Date;
}

interface MonthCell {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
  events: AtmCalendarEvent[];
  visible: AtmCalendarEvent[];
  hidden: number;
}

interface TimedBlock {
  event: AtmCalendarEvent;
  top: number;
  height: number;
  left: number;
  width: number;
}

interface DayColumn {
  date: Date;
  isToday: boolean;
  allDay: AtmCalendarEvent[];
  blocks: TimedBlock[];
}

interface ListGroup {
  date: Date;
  isToday: boolean;
  events: AtmCalendarEvent[];
}

type DragKind = 'move' | 'resize' | 'select';

interface DragState {
  kind: DragKind;
  pointerId: number;
  /** The event being moved/resized (null for select). */
  event: AtmCalendarEvent | null;
  /** Column the preview is currently on. */
  dayIdx: number;
  startMin: number;
  endMin: number;
  /** select: snapped anchor slot; resize: fixed event start. */
  anchorMin: number;
  /** Raw pointer minutes at pointerdown (used for plain slot clicks). */
  rawMin: number;
  /** move: distance between pointer and event start, in minutes. */
  grabOffsetMin: number;
  /** move: event duration in minutes. */
  durationMin: number;
  moved: boolean;
  originX: number;
  originY: number;
}

const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];
const MONTHS_SHORT = [
  'jan.', 'fev.', 'mar.', 'abr.', 'mai.', 'jun.',
  'jul.', 'ago.', 'set.', 'out.', 'nov.', 'dez.',
];

const SOLID: Record<AtmColor, string> = {
  primary: 'bg-primary text-primary-contrast',
  success: 'bg-success text-white',
  warning: 'bg-warning text-white',
  danger: 'bg-danger text-white',
  info: 'bg-info text-white',
  neutral: 'bg-ink text-surface',
};

const SOFT: Record<AtmColor, string> = {
  primary: 'bg-primary-soft text-primary border-primary',
  success: 'bg-success-soft text-success border-success',
  warning: 'bg-warning-soft text-warning border-warning',
  danger: 'bg-danger-soft text-danger border-danger',
  info: 'bg-info-soft text-info border-info',
  neutral: 'bg-surface-alt text-ink border-ink-faint',
};

const DOT: Record<AtmColor, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-ink-faint',
};

const HOUR_PX = 52;
/** Width in px of the hour gutter (w-14). */
const GUTTER_PX = 56;
/** Pointer must travel this many px before a gesture counts as a drag. */
const DRAG_THRESHOLD_PX = 4;
const DAY_MIN = 24 * 60;

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function addDays(d: Date, n: number): Date {
  const next = new Date(d);
  next.setDate(next.getDate() + n);
  return next;
}
function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function startOfWeek(d: Date): Date {
  return addDays(startOfDay(d), -d.getDay());
}
function pad(n: number): string {
  return String(n).padStart(2, '0');
}
function fmtTime(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function eventEnd(e: AtmCalendarEvent): Date {
  return e.end ?? new Date(e.start.getTime() + 60 * 60 * 1000);
}
/** True when the event touches the given day. */
function coversDay(e: AtmCalendarEvent, day: Date): boolean {
  const dayStart = startOfDay(day).getTime();
  const dayEnd = dayStart + 24 * 60 * 60 * 1000;
  return e.start.getTime() < dayEnd && eventEnd(e).getTime() > dayStart;
}
function clamp(value: number, lo: number, hi: number): number {
  return Math.min(Math.max(value, lo), Math.max(lo, hi));
}
function roundTo(value: number, step: number): number {
  return Math.round(value / step) * step;
}
function floorTo(value: number, step: number): number {
  return Math.floor(value / step) * step;
}
function minutesLabel(minutes: number): string {
  return `${pad(Math.floor(minutes / 60))}:${pad(Math.round(minutes % 60))}`;
}
/** "26 de jul. de 2026" */
function shortDate(d: Date): string {
  return `${d.getDate()} de ${MONTHS_SHORT[d.getMonth()]} de ${d.getFullYear()}`;
}

/**Full event calendar (scheduler) with month, week, day and list views.Week/day views support drag to move, drag the bottom edge to resize,drag-select on empty space to pick a range, and configurable slots +working hours:  <atm-event-calendar    [events]="events"    [(date)]="date"    [(view)]="view"    [workStart]="8"    [workEnd]="18"    [slotMinutes]="30"    (eventClick)="open($event)"    (dayClick)="createFromMonth($event)"    (rangeSelect)="create($event.start, $event.end)"    (eventChange)="apply($event)"  />

## Identity

- **Class**: `AtmEventCalendar`
- **Selector**: `atm-event-calendar`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `events` | AtmCalendarEvent[] | no | [] |
| `maxPerDay` | number | no | 3 |
| `workStart` | number | no | 0 |
| `workEnd` | number | no | 24 |
| `slotMinutes` | number | no | 0 |
| `editable` | boolean | no | true |
| `showAddButton` | boolean | no | true |

## Outputs

| Name | Payload |
| --- | --- |
| `eventClick` | AtmCalendarEvent |
| `addEvent` | void |
| `dayClick` | Date |
| `rangeSelect` | AtmCalendarRange |
| `eventChange` | AtmCalendarEventChange |

## Models (two-way)

| Name | Type | Default |
| --- | --- | --- |
| `date` | Date | new Date() |
| `view` | AtmEventCalendarView | 'month' |

## Related interfaces / types

### AtmCalendarEvent

```ts
export interface AtmCalendarEvent {
  id: string;
  title: string;
  start: Date;
  /** Defaults to start + 1h for timed events. */
  end?: Date;
  allDay?: boolean;
  color?: AtmColor;
  category?: string;
  location?: string;
  description?: string;
  /** Free-form payload for the host app. */
  meta?: Record<string, unknown>;
}
```

### AtmEventCalendarView

```ts
export type AtmEventCalendarView = 'month' | 'week' | 'day' | 'list';
```

### AtmCalendarRange

```ts
export interface AtmCalendarRange {
  start: Date;
  end: Date;
}
```

### AtmCalendarEventChange

```ts
export interface AtmCalendarEventChange {
  event: AtmCalendarEvent;
  start: Date;
  end: Date;
}
```

## Usage example

```html
<atm-event-calendar [events]="events" (eventClick)="onEvent($event)" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
