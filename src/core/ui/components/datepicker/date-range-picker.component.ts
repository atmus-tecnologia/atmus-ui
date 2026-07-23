import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ATM_SIZE_HEIGHT, ATM_SIZE_PX, ATM_SIZE_TEXT, AtmSize } from '../../types';
import { AtmOverlayBase } from '../../utils/overlay-base';
import { AtmCalendar } from '../calendar/calendar.component';
import { atmFormatDate } from './date-picker.component';

export interface AtmDateRange {
  start: Date | null;
  end: Date | null;
}

/** Date range picker — input + range calendar popover. Value: { start, end }. */
@Component({
  selector: 'atm-date-range-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmCalendar],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmDateRangePicker), multi: true },
  ],
  host: { class: 'block w-full' },
  template: `
    <button
      #trigger
      type="button"
      [class]="triggerClasses()"
      [disabled]="isDisabled()"
      (click)="toggle()"
    >
      <i class="icofont-ui-calendar shrink-0 text-ink-faint" aria-hidden="true"></i>
      <span class="flex-1 truncate text-left" [class.text-ink-faint]="!range().start">
        {{ display() || placeholder() }}
      </span>
      @if (range().start && !isDisabled()) {
        <span
          role="button"
          tabindex="-1"
          class="shrink-0 cursor-pointer text-ink-faint transition-colors hover:text-ink"
          aria-label="Limpar"
          (click)="clear($event)"
        >
          <i class="icofont-close" aria-hidden="true"></i>
        </span>
      }
    </button>

    @if (isOpen()) {
      <div #panel [style]="panelStyle()" class="animate-atm-pop z-50 w-max">
        <atm-calendar
          class="shadow-atm-lg"
          [range]="true"
          [rangeValue]="range()"
          (rangeValueChange)="onRangeChange($event)"
        />
      </div>
    }
  `,
})
export class AtmDateRangePicker extends AtmOverlayBase implements ControlValueAccessor {
  readonly size = input<AtmSize>('medium');
  readonly placeholder = input('Período');
  readonly disabled = input(false);
  readonly invalid = input(false);

  readonly rangeChange = output<AtmDateRange>();

  readonly triggerRef = viewChild<ElementRef<HTMLElement>>('trigger');
  readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');

  readonly range = signal<AtmDateRange>({ start: null, end: null });
  readonly disabledByForm = signal(false);
  private valueChangeFn: (v: AtmDateRange) => void = () => {};
  private touchedFn: () => void = () => {};

  readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  readonly display = computed(() => {
    const { start, end } = this.range();
    if (!start) return '';
    return `${atmFormatDate(start)}  –  ${end ? atmFormatDate(end) : '...'}`;
  });

  readonly triggerClasses = computed(() =>
    [
      'atm-field flex cursor-pointer items-center gap-2 text-left',
      ATM_SIZE_HEIGHT[this.size()],
      ATM_SIZE_PX[this.size()],
      ATM_SIZE_TEXT[this.size()],
      this.invalid() ? 'atm-field--invalid' : '',
      this.isDisabled() ? 'atm-field--disabled' : '',
    ].join(' '),
  );

  constructor() {
    super();
    this.matchTriggerWidth = false;
  }

  writeValue(value: AtmDateRange | null): void {
    this.range.set(value ?? { start: null, end: null });
  }
  registerOnChange(fn: (v: AtmDateRange) => void): void {
    this.valueChangeFn = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.touchedFn = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }

  protected getTriggerEl(): HTMLElement | null {
    return this.triggerRef()?.nativeElement ?? null;
  }
  protected getPanelEl(): HTMLElement | null {
    return this.panelRef()?.nativeElement ?? null;
  }

  protected override onClosed(): void {
    this.touchedFn();
  }

  onRangeChange(range: AtmDateRange): void {
    this.range.set(range);
    if (range.start && range.end) {
      this.valueChangeFn(range);
      this.rangeChange.emit(range);
      this.close();
    }
  }

  clear(event: Event): void {
    event.stopPropagation();
    const empty = { start: null, end: null };
    this.range.set(empty);
    this.valueChangeFn(empty);
    this.rangeChange.emit(empty);
  }
}
