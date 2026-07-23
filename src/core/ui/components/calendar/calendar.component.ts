import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';

export interface AtmCalendarDay {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function atmSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  return (
    !!a && !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/**
 * Month calendar. Single mode: [(value)]. Range mode: [range]=true + [(rangeValue)].
 */
@Component({
  selector: 'atm-calendar, atm-range-calendar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block select-none' },
  template: `
    <div class="w-72 rounded-atm-lg border border-line bg-surface p-3">
      <!-- Header -->
      <div class="mb-2 flex items-center justify-between">
        <button
          type="button"
          class="atm-focus flex size-8 cursor-pointer items-center justify-center rounded-full
            text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink"
          aria-label="Mês anterior"
          (click)="navigate(-1)"
        >
          <i class="icofont-simple-left" aria-hidden="true"></i>
        </button>
        <span class="text-sm font-semibold text-ink">
          {{ monthLabel() }} {{ viewYear() }}
        </span>
        <button
          type="button"
          class="atm-focus flex size-8 cursor-pointer items-center justify-center rounded-full
            text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink"
          aria-label="Próximo mês"
          (click)="navigate(1)"
        >
          <i class="icofont-simple-right" aria-hidden="true"></i>
        </button>
      </div>

      <!-- Weekdays -->
      <div class="grid grid-cols-7 gap-y-0.5 text-center">
        @for (day of weekdays; track $index) {
          <span class="py-1 text-[11px] font-semibold text-ink-faint">{{ day }}</span>
        }
        <!-- Days -->
        @for (day of days(); track day.date.getTime()) {
          <button
            type="button"
            [class]="dayClasses(day)"
            [disabled]="isDisabled(day.date)"
            (click)="pick(day.date)"
            (mouseenter)="hovered.set(day.date)"
          >
            {{ day.date.getDate() }}
          </button>
        }
      </div>
    </div>
  `,
})
export class AtmCalendar {
  readonly value = model<Date | null>(null);
  readonly range = input(false);
  readonly rangeValue = model<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  readonly minDate = input<Date | undefined>(undefined);
  readonly maxDate = input<Date | undefined>(undefined);

  readonly picked = output<Date>();

  readonly weekdays = WEEKDAYS;

  private readonly today = new Date();
  readonly viewMonth = signal(
    (this.today.getMonth() + 12) % 12,
  );
  readonly viewYear = signal(this.today.getFullYear());
  readonly hovered = signal<Date | null>(null);

  readonly monthLabel = computed(() => MONTHS[this.viewMonth()]);

  readonly days = computed<AtmCalendarDay[]>(() => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const first = new Date(year, month, 1);
    const start = new Date(year, month, 1 - first.getDay());
    const result: AtmCalendarDay[] = [];
    for (let i = 0; i < 42; i++) {
      const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
      result.push({
        date,
        inMonth: date.getMonth() === month,
        isToday: atmSameDay(date, this.today),
      });
    }
    return result;
  });

  navigate(delta: number): void {
    let month = this.viewMonth() + delta;
    let year = this.viewYear();
    if (month < 0) {
      month = 11;
      year--;
    } else if (month > 11) {
      month = 0;
      year++;
    }
    this.viewMonth.set(month);
    this.viewYear.set(year);
  }

  /** Position the view on a given date (used by pickers when opening). */
  showDate(date: Date): void {
    this.viewMonth.set(date.getMonth());
    this.viewYear.set(date.getFullYear());
  }

  isDisabled(date: Date): boolean {
    if (this.minDate() && date < this.stripTime(this.minDate()!)) return true;
    if (this.maxDate() && date > this.maxDate()!) return true;
    return false;
  }

  pick(date: Date): void {
    if (this.range()) {
      const { start, end } = this.rangeValue();
      if (!start || (start && end)) {
        this.rangeValue.set({ start: date, end: null });
      } else if (date < start) {
        this.rangeValue.set({ start: date, end: start });
      } else {
        this.rangeValue.set({ start, end: date });
      }
    } else {
      this.value.set(date);
    }
    this.picked.emit(date);
  }

  dayClasses(day: AtmCalendarDay): string {
    const base =
      'flex size-9 cursor-pointer items-center justify-center text-xs font-medium ' +
      'transition-all duration-100 disabled:pointer-events-none disabled:opacity-30 outline-none';

    if (this.range()) {
      const { start, end } = this.rangeValue();
      const hoverEnd = end ?? this.hovered();
      const isStart = atmSameDay(day.date, start);
      const isEnd = atmSameDay(day.date, end);
      const inRange =
        start && hoverEnd && day.date > start && day.date < hoverEnd && hoverEnd > start;

      if (isStart || isEnd) {
        return `${base} rounded-full bg-primary text-primary-contrast shadow-sm`;
      }
      if (inRange) {
        return `${base} rounded-none bg-primary-soft text-primary`;
      }
    } else if (atmSameDay(day.date, this.value())) {
      return `${base} rounded-full bg-primary text-primary-contrast shadow-sm`;
    }

    return (
      `${base} rounded-full hover:bg-surface-alt ` +
      (day.isToday
        ? 'text-primary font-bold inset-ring inset-ring-primary/40 '
        : '') +
      (day.inMonth ? 'text-ink' : 'text-ink-faint/60')
    );
  }

  private stripTime(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
}
