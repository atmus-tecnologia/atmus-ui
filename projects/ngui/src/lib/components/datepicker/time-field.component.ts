import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ATM_SIZE_HEIGHT, ATM_SIZE_PX, ATM_SIZE_TEXT, AtmSize } from '../../types';
import { AtmValueAccessor } from '../../utils/value-accessor';

/** Time input (HH:mm). Value is a 'HH:mm' string. */
@Component({
  selector: 'atm-time-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmTimeField), multi: true },
  ],
  host: { class: 'block w-full' },
  template: `
    <div [class]="wrapperClasses()">
      <i class="icofont-clock-time shrink-0 text-ink-faint" aria-hidden="true"></i>
      <input
        type="time"
        class="h-full w-full min-w-0 bg-transparent outline-none disabled:cursor-not-allowed
          [&::-webkit-calendar-picker-indicator]:cursor-pointer
          [&::-webkit-calendar-picker-indicator]:opacity-60"
        [disabled]="isDisabled()"
        [attr.step]="stepSeconds() ?? null"
        [value]="value() ?? ''"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
    </div>
  `,
})
export class AtmTimeField extends AtmValueAccessor<string> {
  readonly size = input<AtmSize>('medium');
  readonly disabled = input(false);
  readonly invalid = input(false);
  /** e.g. 60 = minute precision (default), 1 = seconds. */
  readonly stepSeconds = input<number | undefined>(undefined);

  readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  readonly wrapperClasses = computed(() =>
    [
      'atm-field flex items-center gap-2',
      ATM_SIZE_HEIGHT[this.size()],
      ATM_SIZE_PX[this.size()],
      ATM_SIZE_TEXT[this.size()],
      this.invalid() ? 'atm-field--invalid' : '',
      this.isDisabled() ? 'atm-field--disabled' : '',
    ].join(' '),
  );

  onInput(event: Event): void {
    this.setValue((event.target as HTMLInputElement).value || null);
  }
}
