import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ATM_SIZE_HEIGHT, ATM_SIZE_TEXT, AtmSize } from '../../types';
import { AtmValueAccessor } from '../../utils/value-accessor';

/** Numeric input with increment/decrement steppers, min/max and step. */
@Component({
  selector: 'atm-number-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmNumberField), multi: true },
  ],
  host: { class: 'block w-full' },
  template: `
    <div [class]="wrapperClasses()">
      <button
        type="button"
        class="flex h-full w-10 shrink-0 cursor-pointer items-center justify-center border-r border-line
          text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink
          disabled:cursor-not-allowed disabled:opacity-40"
        [disabled]="isDisabled() || (min() !== undefined && (value() ?? 0) <= min()!)"
        aria-label="Diminuir"
        (click)="step_(-1)"
      >
        <i class="icofont-minus" aria-hidden="true"></i>
      </button>
      <input
        type="number"
        inputmode="decimal"
        class="h-full w-full min-w-0 [appearance:textfield] bg-transparent text-center outline-none
          placeholder:text-ink-faint disabled:cursor-not-allowed
          [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [attr.min]="min() ?? null"
        [attr.max]="max() ?? null"
        [attr.step]="step()"
        [value]="value() ?? ''"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
      <button
        type="button"
        class="flex h-full w-10 shrink-0 cursor-pointer items-center justify-center border-l border-line
          text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink
          disabled:cursor-not-allowed disabled:opacity-40"
        [disabled]="isDisabled() || (max() !== undefined && (value() ?? 0) >= max()!)"
        aria-label="Aumentar"
        (click)="step_(1)"
      >
        <i class="icofont-plus" aria-hidden="true"></i>
      </button>
    </div>
  `,
})
export class AtmNumberField extends AtmValueAccessor<number> {
  readonly size = input<AtmSize>('medium');
  readonly placeholder = input('');
  readonly min = input<number | undefined>(undefined);
  readonly max = input<number | undefined>(undefined);
  readonly step = input(1);
  readonly disabled = input(false);
  readonly invalid = input(false);

  readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  readonly wrapperClasses = computed(() =>
    [
      'atm-field flex items-stretch overflow-hidden p-0',
      ATM_SIZE_HEIGHT[this.size()],
      ATM_SIZE_TEXT[this.size()],
      this.invalid() ? 'atm-field--invalid' : '',
      this.isDisabled() ? 'atm-field--disabled' : '',
    ].join(' '),
  );

  onInput(event: Event): void {
    const raw = (event.target as HTMLInputElement).value;
    this.setValue(raw === '' ? null : Number(raw));
  }

  step_(direction: 1 | -1): void {
    const next = this.clamp((this.value() ?? 0) + direction * this.step());
    this.setValue(next);
  }

  private clamp(v: number): number {
    if (this.min() !== undefined) v = Math.max(v, this.min()!);
    if (this.max() !== undefined) v = Math.min(v, this.max()!);
    return v;
  }
}
