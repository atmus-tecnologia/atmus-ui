import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { AtmSize } from '../../types';
import { AtmValueAccessor } from '../../utils/value-accessor';

const TRACK_H: Record<AtmSize, string> = { large: 'h-2.5', medium: 'h-2', slim: 'h-1.5' };
const THUMB: Record<AtmSize, string> = {
  large: '[&::-webkit-slider-thumb]:size-6 [&::-moz-range-thumb]:size-6',
  medium: '[&::-webkit-slider-thumb]:size-5 [&::-moz-range-thumb]:size-5',
  slim: '[&::-webkit-slider-thumb]:size-4 [&::-moz-range-thumb]:size-4',
};

@Component({
  selector: 'atm-slider',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmSlider), multi: true },
  ],
  host: { class: 'block w-full' },
  template: `
    <div class="flex w-full items-center" [class.opacity-50]="isDisabled()">
      <div class="relative flex min-w-0 flex-1 items-center">
        <div
          [class]="trackClasses()"
          class="pointer-events-none absolute inset-x-0 overflow-hidden rounded-full bg-surface-alt
            inset-ring inset-ring-line"
        >
          <div
            class="h-full rounded-full bg-primary transition-[width] duration-75"
            [style.width.%]="percent()"
          ></div>
        </div>
        <input
          type="range"
          [class]="inputClasses()"
          [min]="min()"
          [max]="max()"
          [step]="step()"
          [disabled]="isDisabled()"
          [value]="value() ?? min()"
          (input)="onInput($event)"
          (change)="onTouched()"
        />
      </div>
      @if (showValue()) {
        <span
          class="ml-3 min-w-10 rounded-md bg-surface-alt px-1.5 py-0.5 text-center text-xs
            font-semibold text-ink tabular-nums"
        >
          {{ value() ?? min() }}
        </span>
      }
    </div>
  `,
})
export class AtmSlider extends AtmValueAccessor<number> {
  readonly size = input<AtmSize>('medium');
  readonly min = input(0);
  readonly max = input(100);
  readonly step = input(1);
  readonly disabled = input(false);
  readonly showValue = input(false);

  readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  readonly percent = computed(() => {
    const v = this.value() ?? this.min();
    return ((v - this.min()) / (this.max() - this.min())) * 100;
  });

  readonly trackClasses = computed(() => TRACK_H[this.size()]);

  readonly inputClasses = computed(() =>
    [
      'relative z-10 w-full cursor-pointer appearance-none bg-transparent outline-none',
      'disabled:cursor-not-allowed',
      '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full',
      '[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-primary',
      '[&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md',
      '[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-110',
      '[&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2',
      '[&::-moz-range-thumb]:border-primary [&::-moz-range-thumb]:bg-white',
      THUMB[this.size()],
    ].join(' '),
  );

  onInput(event: Event): void {
    this.setValue(Number((event.target as HTMLInputElement).value));
  }
}
