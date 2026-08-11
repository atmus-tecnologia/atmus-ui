import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { AtmSize, atmUid } from '../../types';
import { AtmValueAccessor } from '../../utils/value-accessor';

export interface AtmRadioOption {
  label: string;
  value: unknown;
  description?: string;
  disabled?: boolean;
}

const DOT: Record<AtmSize, string> = { large: 'size-6', medium: 'size-5', slim: 'size-4' };
const TEXT: Record<AtmSize, string> = { large: 'text-base', medium: 'text-sm', slim: 'text-xs' };

@Component({
  selector: 'atm-radio-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmRadioGroup), multi: true },
  ],
  host: { class: 'block', role: 'radiogroup' },
  template: `
    <div [class]="direction() === 'row' ? 'flex flex-wrap gap-x-6 gap-y-3' : 'flex flex-col gap-3'">
      @for (option of options(); track option.value) {
        <label
          [class]="
            'group flex cursor-pointer items-start gap-2.5 select-none ' +
            (isDisabled(option) ? 'cursor-not-allowed opacity-50' : '')
          "
        >
          <span class="relative inline-flex shrink-0 items-center justify-center pt-0.5">
            <input
              type="radio"
              class="peer sr-only"
              [name]="name"
              [checked]="value() === option.value"
              [disabled]="isDisabled(option)"
              (change)="select(option)"
              (blur)="onTouched()"
            />
            <span
              [class]="dotSize()"
              class="flex items-center justify-center rounded-full border-2 border-line-strong bg-surface
                transition-all duration-150 peer-checked:border-primary
                peer-focus-visible:shadow-[0_0_0_3px_var(--atm-ring)]
                group-hover:border-primary/60 group-active:scale-90"
            >
              @if (value() === option.value) {
                <span class="animate-atm-pop block size-1/2 rounded-full bg-primary"></span>
              }
            </span>
          </span>
          <span [class]="textSize()" class="leading-snug text-ink">
            {{ option.label }}
            @if (option.description) {
              <span class="mt-0.5 block text-xs text-ink-muted">{{ option.description }}</span>
            }
          </span>
        </label>
      }
    </div>
  `,
})
export class AtmRadioGroup extends AtmValueAccessor<unknown> {
  readonly size = input<AtmSize>('medium');
  readonly options = input<AtmRadioOption[]>([]);
  readonly direction = input<'row' | 'column'>('column');
  readonly disabled = input(false);

  readonly name = atmUid('atm-radio');

  readonly dotSize = computed(() => DOT[this.size()]);
  readonly textSize = computed(() => TEXT[this.size()]);

  isDisabled(option: AtmRadioOption): boolean {
    return this.disabled() || this.disabledByForm() || !!option.disabled;
  }

  select(option: AtmRadioOption): void {
    if (this.isDisabled(option)) return;
    this.setValue(option.value);
    this.onTouched();
  }
}
