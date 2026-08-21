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
import { AtmButton } from '../button/button.component';
import { AtmCalendar, atmSameDay } from '../calendar/calendar.component';
import { atmFormatDate } from './date-picker.component';
import { ATM_RANGE_PRESETS, AtmDateRange, AtmDateRangePreset } from './date-presets';

export type { AtmDateRange } from './date-presets';

/**
 * Date range picker — input + range calendar popover. Value: { start, end }.
 * Shows preset recommendations on the side ([presets]="[]" hides them) and a
 * double-month calendar ([months]="1" for a single one). With [confirm]="true"
 * the selection is only applied when the user clicks "Confirmar".
 */
@Component({
  selector: 'atm-date-range-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmButton, AtmCalendar],
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
      <i class="atm atm-calendar-01 shrink-0 text-ink-faint" aria-hidden="true"></i>
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
          <i class="atm atm-cancel-01" aria-hidden="true"></i>
        </span>
      }
    </button>

    @if (isOpen()) {
      <div
        #panel
        [style]="panelStyle()"
        class="atm-panel animate-atm-pop z-50 flex w-max flex-col overflow-hidden"
      >
        <div class="flex items-stretch">
          @if (presets().length) {
            <div class="flex w-44 shrink-0 flex-col gap-0.5 border-r border-line p-2">
              <span class="px-2.5 py-2 text-sm font-semibold text-ink">{{ presetsTitle() }}</span>
              @for (preset of presets(); track preset.label; let i = $index) {
                <button
                  type="button"
                  class="atm-option atm-focus py-1.5"
                  [class.atm-option--selected]="i === activePresetIndex()"
                  (click)="applyPreset(preset)"
                >
                  {{ preset.label }}
                </button>
              }
              <span
                class="atm-option mt-1 cursor-default py-1.5 text-ink-muted"
                [class.atm-option--selected]="isCustom()"
              >
                Personalizado
              </span>
            </div>
          }
          <atm-calendar
            [flat]="true"
            [range]="true"
            [months]="months()"
            [rangeValue]="pending()"
            [minDate]="minDate()"
            [maxDate]="maxDate()"
            (rangeValueChange)="onRangeChange($event)"
          />
        </div>

        @if (confirm()) {
          <div class="flex items-center justify-between gap-2 border-t border-line p-2">
            <button
              type="button"
              class="atm-focus flex size-8 shrink-0 cursor-pointer items-center justify-center
                rounded-atm text-danger transition-colors hover:bg-danger-soft"
              aria-label="Limpar seleção"
              (click)="clearPending()"
            >
              <i class="atm atm-delete-02" aria-hidden="true"></i>
            </button>
            <div class="flex items-center gap-2">
              <atm-button size="slim" variant="ghost" color="neutral" (clicked)="cancel()">
                Cancelar
              </atm-button>
              <atm-button size="slim" (clicked)="confirmSelection()">Confirmar</atm-button>
            </div>
          </div>
        }
      </div>
    }
  `,
})
export class AtmDateRangePicker extends AtmOverlayBase implements ControlValueAccessor {
  readonly size = input<AtmSize>('medium');
  readonly placeholder = input('Período');
  readonly disabled = input(false);
  readonly invalid = input(false);
  /** Preset recommendations shown on the side. Pass [] to hide the sidebar. */
  readonly presets = input<AtmDateRangePreset[]>(ATM_RANGE_PRESETS);
  readonly presetsTitle = input('Período');
  /** Months rendered side by side (2 = double calendar, like analytics tools). */
  readonly months = input(2);
  /** When true, the change is only applied after clicking "Confirmar". */
  readonly confirm = input(false);
  readonly minDate = input<Date | undefined>(undefined);
  readonly maxDate = input<Date | undefined>(undefined);

  readonly rangeChange = output<AtmDateRange>();

  readonly triggerRef = viewChild<ElementRef<HTMLElement>>('trigger');
  readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');
  readonly calendar = viewChild(AtmCalendar);

  /** Committed value (what the form/ngModel sees). */
  readonly range = signal<AtmDateRange>({ start: null, end: null });
  /** Selection being edited in the open panel (equals `range` unless confirm mode). */
  readonly pending = signal<AtmDateRange>({ start: null, end: null });
  readonly disabledByForm = signal(false);
  private valueChangeFn: (v: AtmDateRange) => void = () => {};
  private touchedFn: () => void = () => {};

  readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  readonly display = computed(() => {
    const { start, end } = this.range();
    if (!start) return '';
    return `${atmFormatDate(start)}  –  ${end ? atmFormatDate(end) : '...'}`;
  });

  readonly activePresetIndex = computed(() => {
    const { start, end } = this.pending();
    if (!start || !end) return -1;
    return this.presets().findIndex((preset) => {
      const r = preset.value();
      return atmSameDay(r.start, start) && atmSameDay(r.end, end);
    });
  });

  readonly isCustom = computed(() => !!this.pending().start && this.activePresetIndex() === -1);

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
    const range = value ?? { start: null, end: null };
    this.range.set(range);
    this.pending.set(range);
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

  override open(): void {
    super.open();
    this.pending.set(this.range());
    queueMicrotask(() => {
      const start = this.range().start;
      if (start) this.calendar()?.showDate(start);
    });
  }

  protected override onClosed(): void {
    this.pending.set(this.range());
    this.touchedFn();
  }

  onRangeChange(range: AtmDateRange): void {
    this.pending.set(range);
    if (!this.confirm() && range.start && range.end) {
      this.commit(range);
      this.close();
    }
  }

  applyPreset(preset: AtmDateRangePreset): void {
    const range = preset.value();
    this.pending.set(range);
    if (range.start) this.calendar()?.showDate(range.start);
    if (!this.confirm()) {
      this.commit(range);
      this.close();
    }
  }

  confirmSelection(): void {
    let range = this.pending();
    // A single picked day counts as a one-day range.
    if (range.start && !range.end) range = { start: range.start, end: range.start };
    this.commit(range);
    this.close();
  }

  cancel(): void {
    this.close();
  }

  clearPending(): void {
    this.pending.set({ start: null, end: null });
  }

  clear(event: Event): void {
    event.stopPropagation();
    this.commit({ start: null, end: null });
  }

  private commit(range: AtmDateRange): void {
    this.range.set(range);
    this.pending.set(range);
    this.valueChangeFn(range);
    this.rangeChange.emit(range);
  }
}
