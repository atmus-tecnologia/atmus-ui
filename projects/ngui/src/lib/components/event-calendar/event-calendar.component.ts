import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  input,
  model,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { AtmColor } from '../../types';

/** An event rendered by the event calendar. */
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

/**
 * Full event calendar (scheduler) with month, week, day and list views.
 *
 * Week/day views support drag to move, drag the bottom edge to resize,
 * drag-select on empty space to pick a range, and configurable slots +
 * working hours:
 *
 *   <atm-event-calendar
 *     [events]="events"
 *     [(date)]="date"
 *     [(view)]="view"
 *     [workStart]="8"
 *     [workEnd]="18"
 *     [slotMinutes]="30"
 *     (eventClick)="open($event)"
 *     (dayClick)="createFromMonth($event)"
 *     (rangeSelect)="create($event.start, $event.end)"
 *     (eventChange)="apply($event)"
 *   />
 */
@Component({
  selector: 'atm-event-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex flex-col overflow-hidden rounded-atm-lg border border-line bg-surface',
    '[class.select-none]': 'drag() || monthDragId()',
    '(document:pointerdown)': 'onDocumentPointerDown($event)',
    '(document:keydown.escape)': 'viewMenuOpen.set(false)',
  },
  template: `
    <!-- ============ Toolbar ============ -->
    <div class="flex flex-wrap items-center gap-x-3 gap-y-3 border-b border-line px-4 py-3">
      <!-- Date tile -->
      <div
        class="flex w-11 shrink-0 flex-col items-center overflow-hidden rounded-atm-lg border
          border-line py-1 leading-none shadow-sm"
        aria-hidden="true"
      >
        <span class="text-[9px] font-bold tracking-wide text-ink-faint uppercase">
          {{ monthTileLabel() }}
        </span>
        <span class="mt-0.5 text-lg font-bold text-ink">{{ date().getDate() }}</span>
      </div>
      <!-- Title + period -->
      <div class="min-w-0">
        <div class="flex items-center gap-2">
          <h2 class="truncate text-base font-bold text-ink">{{ title() }}</h2>
          @if (weekBadge()) {
            <span
              class="shrink-0 rounded-md border border-line bg-surface-alt px-1.5 py-0.5
                text-[10px] font-semibold text-ink-muted"
            >
              {{ weekBadge() }}
            </span>
          }
        </div>
        <p class="mt-0.5 truncate text-xs text-ink-muted">{{ subtitle() }}</p>
      </div>
      <span class="flex-1"></span>
      <!-- Prev / Today / Next -->
      <div class="flex h-9 shrink-0 items-stretch overflow-hidden rounded-atm-lg border border-line">
        <button
          type="button"
          class="atm-focus flex w-9 cursor-pointer items-center justify-center text-ink-muted
            transition-colors hover:bg-surface-alt hover:text-ink"
          aria-label="Anterior"
          (click)="navigate(-1)"
        >
          <i class="atm atm-chevron-left" aria-hidden="true"></i>
        </button>
        <button
          type="button"
          class="atm-focus cursor-pointer border-x border-line px-3 text-xs font-semibold
            text-ink transition-colors hover:bg-surface-alt"
          (click)="goToday()"
        >
          Hoje
        </button>
        <button
          type="button"
          class="atm-focus flex w-9 cursor-pointer items-center justify-center text-ink-muted
            transition-colors hover:bg-surface-alt hover:text-ink"
          aria-label="Próximo"
          (click)="navigate(1)"
        >
          <i class="atm atm-chevron-right" aria-hidden="true"></i>
        </button>
      </div>
      <!-- View dropdown -->
      <div #viewMenu class="relative shrink-0">
        <button
          type="button"
          class="atm-focus flex h-9 cursor-pointer items-center gap-2 rounded-atm-lg border
            border-line px-3 text-xs font-semibold text-ink transition-colors
            hover:bg-surface-alt"
          aria-haspopup="listbox"
          [attr.aria-expanded]="viewMenuOpen()"
          (click)="viewMenuOpen.set(!viewMenuOpen())"
        >
          {{ viewLabel() }}
          <i
            class="atm atm-chevron-down text-[9px] text-ink-faint transition-transform duration-200"
            [class.rotate-180]="viewMenuOpen()"
            aria-hidden="true"
          ></i>
        </button>
        @if (viewMenuOpen()) {
          <div
            class="atm-panel animate-atm-pop absolute top-full right-0 z-50 mt-1 w-36 p-1.5"
            role="listbox"
          >
            @for (option of viewOptions; track option.value) {
              <button
                type="button"
                class="atm-option py-2"
                role="option"
                [attr.aria-selected]="view() === option.value"
                [class.atm-option--selected]="view() === option.value"
                (click)="selectView(option.value)"
              >
                <span class="min-w-0 flex-1 truncate">{{ option.label }}</span>
                @if (view() === option.value) {
                  <i class="atm atm-tick-02 shrink-0 text-primary" aria-hidden="true"></i>
                }
              </button>
            }
          </div>
        }
      </div>
      <!-- Add event -->
      @if (showAddButton()) {
        <button
          type="button"
          class="atm-focus flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-atm-lg
            bg-primary px-3.5 text-xs font-semibold text-primary-contrast shadow-sm
            transition-opacity hover:opacity-90"
          (click)="addEvent.emit()"
        >
          <i class="atm atm-plus-sign" aria-hidden="true"></i>
          Novo evento
        </button>
      }
    </div>

    <!-- ============ Month view ============ -->
    @if (view() === 'month') {
      <div class="grid grid-cols-7 border-b border-line">
        @for (day of weekdays; track day) {
          <div class="px-2 py-2 text-center text-[11px] font-semibold text-ink-faint uppercase">
            {{ day }}
          </div>
        }
      </div>
      <div class="grid flex-1 grid-cols-7 auto-rows-fr">
        @for (cell of monthCells(); track cell.date.getTime(); let i = $index) {
          <div
            class="group min-h-28 cursor-pointer border-line p-1.5 transition-colors
              hover:bg-surface-alt/50"
            [class.border-r]="i % 7 !== 6"
            [class.border-b]="i < 35"
            [class.bg-surface-alt/30]="!cell.inMonth"
            [class.bg-primary-soft/40]="monthDropTarget() === cell.date.getTime()"
            [attr.data-atm-day]="cell.date.getTime()"
            (click)="dayClick.emit(cell.date)"
          >
            <div class="mb-1 flex items-center justify-between">
              <span
                class="flex size-6 items-center justify-center rounded-full text-xs font-medium"
                [class]="
                  cell.isToday
                    ? 'bg-primary font-bold text-primary-contrast'
                    : cell.inMonth
                      ? 'text-ink'
                      : 'text-ink-faint'
                "
              >
                {{ cell.date.getDate() }}
              </span>
              <i
                class="atm atm-plus-sign hidden text-[10px] text-ink-faint group-hover:block"
                aria-hidden="true"
              ></i>
            </div>
            <div class="space-y-1">
              @for (event of cell.visible; track event.id) {
                @if (event.allDay || isMultiDay(event)) {
                  <button
                    type="button"
                    class="atm-focus block w-full truncate rounded px-1.5 py-0.5 text-left
                      text-[11px] font-medium transition-opacity hover:opacity-85"
                    [class]="solid(event.color)"
                    [class.cursor-grab]="editable()"
                    [class.cursor-pointer]="!editable()"
                    [class.opacity-40]="monthDragId() === event.id"
                    (pointerdown)="onMonthEventDown($event, event)"
                    (pointermove)="onMonthEventMove($event)"
                    (pointerup)="onMonthEventUp($event)"
                    (pointercancel)="onMonthEventCancel($event)"
                    (click)="onEventClick($event, event)"
                  >
                    {{ event.title }}
                  </button>
                } @else {
                  <button
                    type="button"
                    class="atm-focus flex w-full items-center gap-1 rounded px-1 py-0.5 text-left
                      text-[11px] transition-colors hover:bg-surface-alt"
                    [class.cursor-grab]="editable()"
                    [class.cursor-pointer]="!editable()"
                    [class.opacity-40]="monthDragId() === event.id"
                    (pointerdown)="onMonthEventDown($event, event)"
                    (pointermove)="onMonthEventMove($event)"
                    (pointerup)="onMonthEventUp($event)"
                    (pointercancel)="onMonthEventCancel($event)"
                    (click)="onEventClick($event, event)"
                  >
                    <span class="size-1.5 shrink-0 rounded-full" [class]="dot(event.color)"></span>
                    <span class="shrink-0 font-medium text-ink-muted">{{ time(event.start) }}</span>
                    <span class="truncate text-ink">{{ event.title }}</span>
                  </button>
                }
              }
              @if (cell.hidden > 0) {
                <button
                  type="button"
                  class="atm-focus block w-full cursor-pointer rounded px-1.5 py-0.5 text-left
                    text-[11px] font-semibold text-ink-muted hover:bg-surface-alt hover:text-ink"
                  (click)="showMore($event, cell.date)"
                >
                  +{{ cell.hidden }} mais
                </button>
              }
            </div>
          </div>
        }
      </div>
    }

    <!-- ============ Week / Day view ============ -->
    @if (view() === 'week' || view() === 'day') {
      <!-- Day headers -->
      <div class="flex border-b border-line pr-2">
        <div class="w-14 shrink-0"></div>
        @for (col of timeColumns(); track col.date.getTime()) {
          <button
            type="button"
            class="atm-focus flex-1 cursor-pointer border-l border-line py-2 text-center
              transition-colors hover:bg-surface-alt/60"
            (click)="openDay(col.date)"
          >
            <span class="block text-[11px] font-semibold text-ink-faint uppercase">
              {{ weekdayLabel(col.date) }}
            </span>
            <span
              class="mx-auto mt-0.5 flex size-7 items-center justify-center rounded-full text-sm
                font-semibold"
              [class]="col.isToday ? 'bg-primary text-primary-contrast' : 'text-ink'"
            >
              {{ col.date.getDate() }}
            </span>
          </button>
        }
      </div>
      <!-- All-day row -->
      @if (hasAllDay()) {
        <div class="flex border-b border-line pr-2">
          <div class="flex w-14 shrink-0 items-center justify-end pr-2 text-[10px] text-ink-faint">
            dia todo
          </div>
          @for (col of timeColumns(); track col.date.getTime()) {
            <div class="min-h-8 flex-1 space-y-0.5 border-l border-line p-1">
              @for (event of col.allDay; track event.id) {
                <button
                  type="button"
                  class="atm-focus block w-full cursor-pointer truncate rounded px-1.5 py-0.5
                    text-left text-[11px] font-medium hover:opacity-85"
                  [class]="solid(event.color)"
                  (click)="onEventClick($event, event)"
                >
                  {{ event.title }}
                </button>
              }
            </div>
          }
        </div>
      }
      <!-- Time grid -->
      <div #scroller class="relative max-h-[38rem] flex-1 overflow-y-auto">
        <div #grid class="flex" [style.height.px]="24 * hourHeight">
          <!-- Hour gutter -->
          <div class="relative w-14 shrink-0">
            @for (hour of hours; track hour) {
              <span
                class="absolute right-2 -translate-y-1/2 text-[10px] text-ink-faint"
                [style.top.px]="hour * hourHeight"
              >
                @if (hour > 0) {
                  {{ hour }}:00
                }
              </span>
            }
          </div>
          @for (col of timeColumns(); track col.date.getTime(); let colIdx = $index) {
            <div
              class="relative flex-1 cursor-pointer border-l border-line"
              (pointerdown)="onSelectStart($event, colIdx)"
              (pointermove)="onDragMove($event)"
              (pointerup)="onDragEnd($event)"
              (pointercancel)="onDragCancel($event)"
            >
              <!-- non-working hours shading -->
              @if (workStart() > 0) {
                <div
                  class="pointer-events-none absolute inset-x-0 top-0 bg-surface-alt/70"
                  [style.height.px]="workStart() * hourHeight"
                ></div>
              }
              @if (workEnd() < 24) {
                <div
                  class="pointer-events-none absolute inset-x-0 bottom-0 bg-surface-alt/70"
                  [style.top.px]="workEnd() * hourHeight"
                ></div>
              }
              <!-- hour lines -->
              @for (hour of hours; track hour) {
                @if (hour > 0) {
                  <div
                    class="pointer-events-none absolute right-0 left-0 border-t border-line/70"
                    [style.top.px]="hour * hourHeight"
                  ></div>
                }
              }
              <!-- slot lines -->
              @for (offset of slotOffsets(); track offset) {
                <div
                  class="pointer-events-none absolute right-0 left-0 border-t border-dashed
                    border-line/50"
                  [style.top.px]="offset"
                ></div>
              }
              <!-- now indicator -->
              @if (col.isToday) {
                <div
                  class="pointer-events-none absolute right-0 left-0 z-10 border-t-2 border-danger"
                  [style.top.px]="nowOffset()"
                >
                  <span class="absolute -top-[5px] -left-1 size-2 rounded-full bg-danger"></span>
                </div>
              }
              <!-- drag / select preview -->
              @if (preview(); as p) {
                @if (p.dayIdx === colIdx) {
                  <div
                    class="pointer-events-none absolute inset-x-0.5 z-20 overflow-hidden
                      rounded-md px-1.5 py-1"
                    [class]="p.classes"
                    [style.top.px]="p.top"
                    [style.height.px]="p.height"
                  >
                    @if (p.title) {
                      <span class="block truncate text-[11px] leading-tight font-semibold">
                        {{ p.title }}
                      </span>
                    }
                    <span class="block truncate text-[10px] font-medium">{{ p.label }}</span>
                  </div>
                }
              }
              <!-- events -->
              @for (block of col.blocks; track block.event.id) {
                <button
                  type="button"
                  class="atm-focus absolute overflow-hidden rounded-md border-l-3 px-1.5 py-1
                    text-left transition-[filter] hover:brightness-95 dark:hover:brightness-110"
                  [class]="soft(block.event.color)"
                  [class.cursor-grab]="editable()"
                  [class.cursor-pointer]="!editable()"
                  [class.opacity-40]="isDraggingEvent(block.event)"
                  [style.top.px]="block.top"
                  [style.height.px]="block.height"
                  [style.left.%]="block.left"
                  [style.width.%]="block.width"
                  (pointerdown)="onMoveStart($event, block.event)"
                  (pointermove)="onDragMove($event)"
                  (pointerup)="onDragEnd($event)"
                  (pointercancel)="onDragCancel($event)"
                  (click)="onEventClick($event, block.event)"
                >
                  <span class="block truncate text-[11px] leading-tight font-semibold">
                    {{ block.event.title }}
                  </span>
                  @if (block.height > 32) {
                    <span class="block truncate text-[10px] opacity-80">
                      {{ time(block.event.start) }} – {{ time(end(block.event)) }}
                    </span>
                  }
                  @if (block.event.location && block.height > 52) {
                    <span class="block truncate text-[10px] opacity-70">
                      <i class="atm atm-location-01" aria-hidden="true"></i>
                      {{ block.event.location }}
                    </span>
                  }
                  @if (editable()) {
                    <span
                      class="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize touch-none"
                      aria-hidden="true"
                      (pointerdown)="onResizeStart($event, block.event, colIdx)"
                    ></span>
                  }
                </button>
              }
            </div>
          }
        </div>
      </div>
    }

    <!-- ============ List view ============ -->
    @if (view() === 'list') {
      <div class="max-h-[38rem] flex-1 overflow-y-auto">
        @for (group of listGroups(); track group.date.getTime()) {
          <div class="flex gap-4 border-b border-line px-4 py-3">
            <button
              type="button"
              class="atm-focus w-16 shrink-0 cursor-pointer text-center"
              (click)="openDay(group.date)"
            >
              <span
                class="block text-[11px] font-semibold uppercase"
                [class]="group.isToday ? 'text-primary' : 'text-ink-faint'"
              >
                {{ weekdayLabel(group.date) }}
              </span>
              <span
                class="mx-auto mt-1 flex size-9 items-center justify-center rounded-full text-lg
                  font-semibold"
                [class]="group.isToday ? 'bg-primary text-primary-contrast' : 'text-ink'"
              >
                {{ group.date.getDate() }}
              </span>
            </button>
            <ul class="min-w-0 flex-1 space-y-1.5">
              @for (event of group.events; track event.id) {
                <li>
                  <button
                    type="button"
                    class="atm-focus flex w-full cursor-pointer items-center gap-3 rounded-atm
                      px-2.5 py-2 text-left transition-colors hover:bg-surface-alt"
                    (click)="onEventClick($event, event)"
                  >
                    <span class="size-2.5 shrink-0 rounded-full" [class]="dot(event.color)"></span>
                    <span class="w-28 shrink-0 text-xs text-ink-muted">
                      @if (event.allDay) {
                        Dia todo
                      } @else {
                        {{ time(event.start) }} – {{ time(end(event)) }}
                      }
                    </span>
                    <span class="min-w-0 flex-1">
                      <span class="block truncate text-sm font-medium text-ink">
                        {{ event.title }}
                      </span>
                      @if (event.location) {
                        <span class="block truncate text-xs text-ink-faint">
                          <i class="atm atm-location-01" aria-hidden="true"></i>
                          {{ event.location }}
                        </span>
                      }
                    </span>
                    @if (event.category) {
                      <span
                        class="hidden rounded-full px-2 py-0.5 text-[10px] font-semibold sm:block"
                        [class]="softChip(event.color)"
                      >
                        {{ event.category }}
                      </span>
                    }
                  </button>
                </li>
              }
            </ul>
          </div>
        } @empty {
          <p class="px-4 py-16 text-center text-sm text-ink-faint">
            Nenhum evento neste período.
          </p>
        }
      </div>
    }
  `,
})
export class AtmEventCalendar {
  readonly events = input<AtmCalendarEvent[]>([]);
  readonly date = model<Date>(new Date());
  readonly view = model<AtmEventCalendarView>('month');
  /** Max visible events per month cell before collapsing into "+N mais". */
  readonly maxPerDay = input(3);
  /** Working hours start (0–24). Creating/moving events is constrained to the window. */
  readonly workStart = input(0);
  /** Working hours end (0–24). */
  readonly workEnd = input(24);
  /**
   * Slot size in minutes (e.g. 30, 60). Clicking an empty slot creates a range of this
   * size and drag/resize snaps to it. 0 disables slots (click = 1h, snapping = 15min).
   */
  readonly slotMinutes = input(0);
  /** Enables drag to move and resize. */
  readonly editable = input(true);
  /** Shows the "Novo evento" button in the toolbar (listen to addEvent). */
  readonly showAddButton = input(true);

  readonly eventClick = output<AtmCalendarEvent>();
  /** "Novo evento" toolbar button click. */
  readonly addEvent = output<void>();
  /** Month cell click. */
  readonly dayClick = output<Date>();
  /** Time range picked on week/day: drag-select on empty space or a slot click. */
  readonly rangeSelect = output<AtmCalendarRange>();
  /** An event was moved (drag) or resized; apply the new start/end to your data. */
  readonly eventChange = output<AtmCalendarEventChange>();

  readonly weekdays = WEEKDAYS_SHORT;
  readonly hours = Array.from({ length: 24 }, (_, i) => i);
  readonly hourHeight = HOUR_PX;
  readonly viewOptions: { value: AtmEventCalendarView; label: string }[] = [
    { value: 'month', label: 'Mês' },
    { value: 'week', label: 'Semana' },
    { value: 'day', label: 'Dia' },
    { value: 'list', label: 'Lista' },
  ];

  private readonly gridRef = viewChild<ElementRef<HTMLElement>>('grid');
  private readonly scrollerRef = viewChild<ElementRef<HTMLElement>>('scroller');
  private readonly viewMenuRef = viewChild<ElementRef<HTMLElement>>('viewMenu');

  constructor() {
    // Scroll the time grid to the start of the working hours when it appears.
    effect(() => {
      const scroller = this.scrollerRef()?.nativeElement;
      const start = this.workStart();
      if (scroller && start > 0) {
        scroller.scrollTop = Math.max(0, start * HOUR_PX - 8);
      }
    });
  }

  // ---------- toolbar ----------

  /** "julho 2026" — month of the visible period (week start for the week view). */
  readonly title = computed(() => {
    const d = this.view() === 'week' ? startOfWeek(this.date()) : this.date();
    return `${MONTHS[d.getMonth()].toLowerCase()} ${d.getFullYear()}`;
  });

  /** Range of the visible period, e.g. "26 de jul. de 2026 – 1 de ago. de 2026". */
  readonly subtitle = computed(() => {
    const d = this.date();
    switch (this.view()) {
      case 'week': {
        const first = startOfWeek(d);
        return `${shortDate(first)} – ${shortDate(addDays(first, 6))}`;
      }
      case 'day':
        return `${this.weekdayLabel(d)}, ${shortDate(d)}`;
      default: {
        const first = new Date(d.getFullYear(), d.getMonth(), 1);
        const last = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        return `${shortDate(first)} – ${shortDate(last)}`;
      }
    }
  });

  /** "Semana N" (week of the month) — shown on the week and day views. */
  readonly weekBadge = computed(() => {
    const view = this.view();
    if (view !== 'week' && view !== 'day') return '';
    return `Semana ${Math.ceil(startOfWeek(this.date()).getDate() / 7)}`;
  });

  readonly monthTileLabel = computed(() => MONTHS_SHORT[this.date().getMonth()].toUpperCase());

  readonly viewMenuOpen = signal(false);

  readonly viewLabel = computed(
    () => this.viewOptions.find((o) => o.value === this.view())?.label ?? '',
  );

  selectView(view: AtmEventCalendarView): void {
    this.view.set(view);
    this.viewMenuOpen.set(false);
  }

  onDocumentPointerDown(e: Event): void {
    if (!this.viewMenuOpen()) return;
    const menu = this.viewMenuRef()?.nativeElement;
    if (menu && !menu.contains(e.target as Node)) this.viewMenuOpen.set(false);
  }

  goToday(): void {
    this.date.set(new Date());
  }

  navigate(direction: 1 | -1): void {
    const d = this.date();
    switch (this.view()) {
      case 'week':
        this.date.set(addDays(d, 7 * direction));
        break;
      case 'day':
        this.date.set(addDays(d, direction));
        break;
      default:
        this.date.set(new Date(d.getFullYear(), d.getMonth() + direction, 1));
    }
  }

  openDay(date: Date): void {
    this.date.set(date);
    this.view.set('day');
  }

  showMore(event: MouseEvent, date: Date): void {
    event.stopPropagation();
    this.openDay(date);
  }

  onEventClick(domEvent: Event, event: AtmCalendarEvent): void {
    domEvent.stopPropagation();
    if (this.squelchClick) {
      this.squelchClick = false;
      return;
    }
    this.eventClick.emit(event);
  }

  // ---------- month view ----------

  readonly monthCells = computed<MonthCell[]>(() => {
    const d = this.date();
    const first = new Date(d.getFullYear(), d.getMonth(), 1);
    const gridStart = startOfWeek(first);
    const today = new Date();
    const max = this.maxPerDay();

    return Array.from({ length: 42 }, (_, i) => {
      const date = addDays(gridStart, i);
      const events = this.eventsOn(date);
      const hidden = Math.max(0, events.length - max);
      return {
        date,
        inMonth: date.getMonth() === d.getMonth(),
        isToday: sameDay(date, today),
        events,
        visible: hidden > 0 ? events.slice(0, max) : events,
        hidden,
      };
    });
  });

  // ---------- week / day views ----------

  readonly timeColumns = computed<DayColumn[]>(() => {
    const d = this.date();
    const today = new Date();
    const days =
      this.view() === 'day'
        ? [startOfDay(d)]
        : Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(d), i));

    return days.map((date) => {
      const events = this.eventsOn(date);
      return {
        date,
        isToday: sameDay(date, today),
        allDay: events.filter((e) => e.allDay || this.isMultiDay(e)),
        blocks: this.layoutTimed(
          events.filter((e) => !e.allDay && !this.isMultiDay(e)),
          date,
        ),
      };
    });
  });

  readonly hasAllDay = computed(() => this.timeColumns().some((c) => c.allDay.length));

  readonly nowOffset = computed(() => {
    // Recomputed on navigation; precision here is cosmetic.
    const now = new Date();
    return ((now.getHours() * 60 + now.getMinutes()) / 60) * HOUR_PX;
  });

  /** Dashed sub-hour lines when slots smaller than 1h are enabled. */
  readonly slotOffsets = computed(() => {
    const slot = this.slotMinutes();
    if (slot <= 0 || slot >= 60) return [];
    const offsets: number[] = [];
    for (let m = slot; m < DAY_MIN; m += slot) {
      if (m % 60 !== 0) offsets.push((m / 60) * HOUR_PX);
    }
    return offsets;
  });

  /** Greedy column layout so overlapping events share the horizontal space. */
  private layoutTimed(events: AtmCalendarEvent[], day: Date): TimedBlock[] {
    const dayStart = startOfDay(day).getTime();
    const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
    const columns: { end: number }[] = [];
    const placed: { event: AtmCalendarEvent; column: number; cluster: number }[] = [];
    const clusterCols: number[] = [];
    let cluster = -1;
    let clusterEnd = -1;

    for (const event of sorted) {
      const start = event.start.getTime();
      const end = eventEnd(event).getTime();
      if (start >= clusterEnd) {
        cluster++;
        clusterCols[cluster] = 0;
        columns.length = 0;
        clusterEnd = end;
      } else {
        clusterEnd = Math.max(clusterEnd, end);
      }
      let column = columns.findIndex((c) => c.end <= start);
      if (column === -1) {
        column = columns.length;
        columns.push({ end });
      } else {
        columns[column].end = end;
      }
      clusterCols[cluster] = Math.max(clusterCols[cluster], columns.length);
      placed.push({ event, column, cluster });
    }

    return placed.map(({ event, column, cluster: c }) => {
      const total = clusterCols[c] || 1;
      const startMin = Math.max(0, (event.start.getTime() - dayStart) / 60000);
      const endMin = Math.min(24 * 60, (eventEnd(event).getTime() - dayStart) / 60000);
      const width = 100 / total;
      return {
        event,
        top: (startMin / 60) * HOUR_PX,
        height: Math.max(22, ((endMin - startMin) / 60) * HOUR_PX - 2),
        left: column * width,
        width: total > 1 ? width : 96,
      };
    });
  }

  // ---------- drag interactions (week / day) ----------

  readonly drag = signal<DragState | null>(null);
  private squelchClick = false;

  /** Snap step: the slot size when enabled, otherwise 15 minutes. */
  private readonly snapMinutes = computed(() => {
    const slot = this.slotMinutes();
    return slot > 0 ? slot : 15;
  });

  /** Ghost block shown while selecting, moving or resizing. */
  readonly preview = computed(() => {
    const d = this.drag();
    if (!d || !d.moved) return null;
    const top = (d.startMin / 60) * HOUR_PX;
    const height = Math.max(14, ((d.endMin - d.startMin) / 60) * HOUR_PX - 2);
    const label = `${minutesLabel(d.startMin)} – ${minutesLabel(d.endMin)}`;
    if (d.kind === 'select') {
      return {
        dayIdx: d.dayIdx,
        top,
        height,
        label,
        title: '',
        classes: 'border-2 border-dashed border-primary bg-primary-soft/70 text-primary',
      };
    }
    return {
      dayIdx: d.dayIdx,
      top,
      height,
      label,
      title: d.event?.title ?? '',
      classes: 'border-l-3 shadow-lg ' + this.soft(d.event?.color),
    };
  });

  isDraggingEvent(event: AtmCalendarEvent): boolean {
    const d = this.drag();
    return !!d && d.moved && d.event?.id === event.id;
  }

  /** Working hours window in minutes. */
  private workWindow(): [number, number] {
    const start = clamp(this.workStart(), 0, 24) * 60;
    const end = clamp(this.workEnd(), 0, 24) * 60;
    return end > start ? [start, end] : [0, DAY_MIN];
  }

  /** Maps a pointer position to a day column + minutes within the time grid. */
  private locate(e: PointerEvent): { dayIdx: number; minutes: number } | null {
    const grid = this.gridRef()?.nativeElement;
    if (!grid) return null;
    const rect = grid.getBoundingClientRect();
    const cols = this.timeColumns().length;
    const colWidth = (rect.width - GUTTER_PX) / cols;
    const dayIdx = clamp(Math.floor((e.clientX - rect.left - GUTTER_PX) / colWidth), 0, cols - 1);
    const minutes = clamp(((e.clientY - rect.top) / HOUR_PX) * 60, 0, DAY_MIN);
    return { dayIdx, minutes };
  }

  private minutesToDate(dayIdx: number, minutes: number): Date {
    const columns = this.timeColumns();
    const base = columns[clamp(dayIdx, 0, columns.length - 1)]?.date ?? this.date();
    const result = startOfDay(base);
    result.setMinutes(minutes);
    return result;
  }

  onSelectStart(e: PointerEvent, dayIdx: number): void {
    if (e.button !== 0 || this.drag()) return;
    this.squelchClick = false;
    const pt = this.locate(e);
    if (!pt) return;
    const [workLo, workHi] = this.workWindow();
    // Fora do horário de trabalho: não permite criar.
    if (pt.minutes < workLo || pt.minutes >= workHi) return;
    const snap = this.snapMinutes();
    const anchor = clamp(floorTo(pt.minutes, snap), workLo, workHi - snap);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    this.drag.set({
      kind: 'select',
      pointerId: e.pointerId,
      event: null,
      dayIdx,
      startMin: anchor,
      endMin: Math.min(anchor + snap, workHi),
      anchorMin: anchor,
      rawMin: pt.minutes,
      grabOffsetMin: 0,
      durationMin: 0,
      moved: false,
      originX: e.clientX,
      originY: e.clientY,
    });
  }

  onMoveStart(e: PointerEvent, event: AtmCalendarEvent): void {
    e.stopPropagation();
    if (!this.editable() || e.button !== 0 || this.drag()) return;
    this.squelchClick = false;
    const pt = this.locate(e);
    if (!pt) return;
    const durationMin = Math.max(
      this.snapMinutes(),
      (eventEnd(event).getTime() - event.start.getTime()) / 60000,
    );
    const colDate = this.timeColumns()[pt.dayIdx]?.date ?? event.start;
    const startMin = Math.max(
      0,
      (event.start.getTime() - startOfDay(colDate).getTime()) / 60000,
    );
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    this.drag.set({
      kind: 'move',
      pointerId: e.pointerId,
      event,
      dayIdx: pt.dayIdx,
      startMin,
      endMin: startMin + durationMin,
      anchorMin: startMin,
      rawMin: pt.minutes,
      grabOffsetMin: pt.minutes - startMin,
      durationMin,
      moved: false,
      originX: e.clientX,
      originY: e.clientY,
    });
  }

  onResizeStart(e: PointerEvent, event: AtmCalendarEvent, dayIdx: number): void {
    e.stopPropagation();
    if (!this.editable() || e.button !== 0 || this.drag()) return;
    this.squelchClick = false;
    const colDate = this.timeColumns()[dayIdx]?.date;
    if (!colDate) return;
    const dayStart = startOfDay(colDate).getTime();
    const startMin = Math.max(0, (event.start.getTime() - dayStart) / 60000);
    const endMin = Math.min(DAY_MIN, (eventEnd(event).getTime() - dayStart) / 60000);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    this.drag.set({
      kind: 'resize',
      pointerId: e.pointerId,
      event,
      dayIdx,
      startMin,
      endMin,
      anchorMin: startMin,
      rawMin: endMin,
      grabOffsetMin: 0,
      durationMin: 0,
      moved: false,
      originX: e.clientX,
      originY: e.clientY,
    });
  }

  onDragMove(e: PointerEvent): void {
    const d = this.drag();
    if (!d || e.pointerId !== d.pointerId) return;
    const pt = this.locate(e);
    if (!pt) return;
    const moved =
      d.moved ||
      Math.abs(e.clientX - d.originX) + Math.abs(e.clientY - d.originY) > DRAG_THRESHOLD_PX;
    if (!moved) return;
    const snap = this.snapMinutes();
    const [workLo, workHi] = this.workWindow();

    if (d.kind === 'select') {
      const current = clamp(roundTo(pt.minutes, snap), workLo, workHi);
      this.drag.set({
        ...d,
        moved: true,
        startMin: Math.min(d.anchorMin, current),
        endMin: Math.max(d.anchorMin + snap, current),
      });
    } else if (d.kind === 'move') {
      const startMin = clamp(
        roundTo(pt.minutes - d.grabOffsetMin, snap),
        workLo,
        Math.min(workHi, DAY_MIN) - d.durationMin,
      );
      this.drag.set({
        ...d,
        moved: true,
        dayIdx: pt.dayIdx,
        startMin,
        endMin: startMin + d.durationMin,
      });
    } else {
      const endMin = clamp(roundTo(pt.minutes, snap), d.anchorMin + snap, workHi);
      this.drag.set({ ...d, moved: true, endMin });
    }
  }

  onDragEnd(e: PointerEvent): void {
    const d = this.drag();
    if (!d || e.pointerId !== d.pointerId) return;
    this.drag.set(null);

    if (d.kind === 'select') {
      if (d.moved) {
        this.rangeSelect.emit({
          start: this.minutesToDate(d.dayIdx, d.startMin),
          end: this.minutesToDate(d.dayIdx, d.endMin),
        });
      } else {
        // Clique simples num espaço vazio: cria no slot que contém o ponto clicado.
        const [workLo, workHi] = this.workWindow();
        const duration = this.slotMinutes() || 60;
        const startMin = clamp(floorTo(d.rawMin, duration), workLo, workHi - duration);
        this.rangeSelect.emit({
          start: this.minutesToDate(d.dayIdx, startMin),
          end: this.minutesToDate(d.dayIdx, Math.min(startMin + duration, workHi)),
        });
      }
      return;
    }

    if (!d.moved || !d.event) return;
    this.squelchClick = true;
    const start =
      d.kind === 'move' ? this.minutesToDate(d.dayIdx, d.startMin) : d.event.start;
    const end = this.minutesToDate(d.dayIdx, d.endMin);
    if (
      start.getTime() === d.event.start.getTime() &&
      end.getTime() === eventEnd(d.event).getTime()
    ) {
      return;
    }
    this.eventChange.emit({ event: d.event, start, end });
  }

  onDragCancel(e: PointerEvent): void {
    const d = this.drag();
    if (d && e.pointerId === d.pointerId) this.drag.set(null);
  }

  // ---------- month drag (change event date) ----------

  private monthDrag: {
    pointerId: number;
    event: AtmCalendarEvent;
    originX: number;
    originY: number;
    moved: boolean;
  } | null = null;
  readonly monthDragId = signal<string | null>(null);
  readonly monthDropTarget = signal<number | null>(null);

  onMonthEventDown(e: PointerEvent, event: AtmCalendarEvent): void {
    e.stopPropagation();
    if (!this.editable() || e.button !== 0) return;
    this.squelchClick = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    this.monthDrag = {
      pointerId: e.pointerId,
      event,
      originX: e.clientX,
      originY: e.clientY,
      moved: false,
    };
  }

  onMonthEventMove(e: PointerEvent): void {
    const d = this.monthDrag;
    if (!d || e.pointerId !== d.pointerId) return;
    if (
      !d.moved &&
      Math.abs(e.clientX - d.originX) + Math.abs(e.clientY - d.originY) <= DRAG_THRESHOLD_PX
    ) {
      return;
    }
    d.moved = true;
    this.monthDragId.set(d.event.id);
    const cell = document
      .elementFromPoint(e.clientX, e.clientY)
      ?.closest('[data-atm-day]');
    this.monthDropTarget.set(cell ? Number(cell.getAttribute('data-atm-day')) : null);
  }

  onMonthEventUp(e: PointerEvent): void {
    const d = this.monthDrag;
    if (!d || e.pointerId !== d.pointerId) return;
    this.monthDrag = null;
    this.monthDragId.set(null);
    const target = this.monthDropTarget();
    this.monthDropTarget.set(null);
    if (!d.moved) return; // Clique simples: o (click) do chip emite eventClick.
    this.squelchClick = true;
    if (target == null) return;
    const targetDay = new Date(target);
    const start = new Date(
      targetDay.getFullYear(),
      targetDay.getMonth(),
      targetDay.getDate(),
      d.event.start.getHours(),
      d.event.start.getMinutes(),
    );
    if (start.getTime() === d.event.start.getTime()) return;
    const durationMs = eventEnd(d.event).getTime() - d.event.start.getTime();
    this.eventChange.emit({
      event: d.event,
      start,
      end: new Date(start.getTime() + durationMs),
    });
  }

  onMonthEventCancel(e: PointerEvent): void {
    if (this.monthDrag?.pointerId !== e.pointerId) return;
    this.monthDrag = null;
    this.monthDragId.set(null);
    this.monthDropTarget.set(null);
  }

  // ---------- list view ----------

  readonly listGroups = computed<ListGroup[]>(() => {
    const d = this.date();
    const today = new Date();
    const inMonth = this.events()
      .filter(
        (e) =>
          e.start.getFullYear() === d.getFullYear() && e.start.getMonth() === d.getMonth(),
      )
      .sort((a, b) => a.start.getTime() - b.start.getTime());

    const groups = new Map<number, ListGroup>();
    for (const event of inMonth) {
      const key = startOfDay(event.start).getTime();
      if (!groups.has(key)) {
        const date = new Date(key);
        groups.set(key, { date, isToday: sameDay(date, today), events: [] });
      }
      groups.get(key)!.events.push(event);
    }
    return [...groups.values()];
  });

  // ---------- helpers ----------

  private eventsOn(date: Date): AtmCalendarEvent[] {
    return this.events()
      .filter((e) => coversDay(e, date))
      .sort((a, b) => {
        const aFirst = a.allDay || this.isMultiDay(a) ? 0 : 1;
        const bFirst = b.allDay || this.isMultiDay(b) ? 0 : 1;
        return aFirst - bFirst || a.start.getTime() - b.start.getTime();
      });
  }

  isMultiDay(e: AtmCalendarEvent): boolean {
    return !sameDay(e.start, eventEnd(e));
  }

  weekdayLabel(date: Date): string {
    return WEEKDAYS_SHORT[date.getDay()];
  }

  time(d: Date): string {
    return fmtTime(d);
  }

  end(e: AtmCalendarEvent): Date {
    return eventEnd(e);
  }

  solid(color?: AtmColor): string {
    return SOLID[color ?? 'primary'];
  }

  soft(color?: AtmColor): string {
    return SOFT[color ?? 'primary'];
  }

  softChip(color?: AtmColor): string {
    const c = color ?? 'primary';
    return SOFT[c].split(' ').slice(0, 2).join(' ');
  }

  dot(color?: AtmColor): string {
    return DOT[color ?? 'primary'];
  }
}
