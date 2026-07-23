import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  input,
  output,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { signal } from '@angular/core';
import { ATM_SIZE_HEIGHT, ATM_SIZE_PX, ATM_SIZE_TEXT, AtmSize } from '../../types';
import { AtmOverlayBase } from '../../utils/overlay-base';
import { AtmCalendar } from '../calendar/calendar.component';

export function atmFormatDate(date: Date | null): string {
  if (!date) return '';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${date.getFullYear()}`;
}

/** Parses a complete 'dd/mm/yyyy' string into a Date; returns null when invalid. */
export function atmParseDate(text: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  const date = new Date(year, month - 1, day);
  const valid =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return valid ? date : null;
}

/**
 * Date picker (alias atm-date-field): input + calendar popover, dd/mm/yyyy.
 * Flips above when there is no viewport space below.
 * With `[editable]="true"` the field becomes a typeable input with a
 * dd/mm/yyyy mask and the calendar opens only via the icon button.
 */
@Component({
  selector: 'atm-date-picker, atm-date-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmCalendar],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmDatePicker), multi: true },
  ],
  host: { class: 'block w-full' },
  template: `
    @if (editable()) {
      <div #trigger [class]="editableClasses()">
        <button
          type="button"
          class="atm-focus -ml-1 flex shrink-0 cursor-pointer items-center rounded px-1 text-ink-faint
            transition-colors hover:text-ink disabled:cursor-not-allowed"
          aria-label="Abrir calendário"
          [disabled]="isDisabled()"
          (click)="toggle()"
        >
          <i class="icofont-ui-calendar" aria-hidden="true"></i>
        </button>
        <input
          type="text"
          class="h-full w-full min-w-0 bg-transparent outline-none placeholder:text-ink-faint
            disabled:cursor-not-allowed"
          inputmode="numeric"
          maxlength="10"
          [placeholder]="placeholder()"
          [disabled]="isDisabled()"
          [value]="text()"
          (input)="onTextInput($event)"
          (blur)="onTextBlur($event)"
        />
        @if (clearable() && value() && !isDisabled()) {
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
      </div>
    } @else {
      <button
        #trigger
        type="button"
        [class]="triggerClasses()"
        [disabled]="isDisabled()"
        (click)="toggle()"
      >
        <i class="icofont-ui-calendar shrink-0 text-ink-faint" aria-hidden="true"></i>
        <span class="flex-1 truncate text-left" [class.text-ink-faint]="!value()">
          {{ display() || placeholder() }}
        </span>
        @if (clearable() && value() && !isDisabled()) {
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
    }

    @if (isOpen()) {
      <div #panel [style]="panelStyle()" class="animate-atm-pop z-50 w-max">
        <atm-calendar
          class="shadow-atm-lg"
          [value]="value()"
          [minDate]="minDate()"
          [maxDate]="maxDate()"
          (valueChange)="onPick($event)"
        />
      </div>
    }
  `,
})
export class AtmDatePicker extends AtmOverlayBase implements ControlValueAccessor {
  readonly size = input<AtmSize>('medium');
  readonly placeholder = input('dd/mm/aaaa');
  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly clearable = input(true);
  /** Typeable input with dd/mm/yyyy mask; calendar opens via the icon button. */
  readonly editable = input(false);
  readonly minDate = input<Date | undefined>(undefined);
  readonly maxDate = input<Date | undefined>(undefined);

  readonly dateChange = output<Date | null>();

  readonly triggerRef = viewChild<ElementRef<HTMLElement>>('trigger');
  readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');
  readonly calendar = viewChild(AtmCalendar);

  readonly value = signal<Date | null>(null);
  /** Masked text shown in the editable input. */
  readonly text = signal('');
  readonly disabledByForm = signal(false);
  private valueChangeFn: (v: Date | null) => void = () => {};
  private touchedFn: () => void = () => {};

  readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());
  readonly display = computed(() => atmFormatDate(this.value()));

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

  readonly editableClasses = computed(() =>
    [
      'atm-field flex items-center gap-2',
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

  writeValue(value: Date | string | null): void {
    const date = value ? new Date(value) : null;
    this.value.set(date);
    this.text.set(atmFormatDate(date));
  }
  registerOnChange(fn: (v: Date | null) => void): void {
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
    queueMicrotask(() => {
      const v = this.value();
      if (v) this.calendar()?.showDate(v);
    });
  }

  protected override onClosed(): void {
    this.touchedFn();
  }

  onPick(date: Date | null): void {
    this.setDate(date);
    this.close();
  }

  clear(event: Event): void {
    event.stopPropagation();
    this.setDate(null);
  }

  /** Applies the dd/mm/yyyy mask while typing and commits complete valid dates. */
  onTextInput(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const digits = inputEl.value.replace(/\D/g, '').slice(0, 8);
    let masked = digits;
    if (digits.length > 4) masked = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    else if (digits.length > 2) masked = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    this.text.set(masked);
    inputEl.value = masked;

    const parsed = atmParseDate(masked);
    if (parsed) {
      this.value.set(parsed);
      this.valueChangeFn(parsed);
      this.dateChange.emit(parsed);
    } else if (!masked && this.value()) {
      this.value.set(null);
      this.valueChangeFn(null);
      this.dateChange.emit(null);
    }
  }

  /** On blur, discards incomplete/invalid text (reverts to the current value). */
  onTextBlur(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const parsed = atmParseDate(this.text());
    if (!parsed && this.text()) {
      this.text.set(atmFormatDate(this.value()));
      inputEl.value = this.text();
    }
    this.touchedFn();
  }

  private setDate(date: Date | null): void {
    this.value.set(date);
    this.text.set(atmFormatDate(date));
    this.valueChangeFn(date);
    this.dateChange.emit(date);
  }
}
