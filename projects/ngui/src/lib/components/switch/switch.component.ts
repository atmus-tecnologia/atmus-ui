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

const TRACK: Record<AtmSize, string> = {
  large: 'h-7 w-13',
  medium: 'h-6 w-11',
  slim: 'h-5 w-9',
};
const THUMB: Record<AtmSize, string> = {
  large: 'size-5.5 peer-checked:translate-x-6',
  medium: 'size-4.5 peer-checked:translate-x-5',
  slim: 'size-3.5 peer-checked:translate-x-4',
};
const TEXT: Record<AtmSize, string> = { large: 'text-base', medium: 'text-sm', slim: 'text-xs' };

@Component({
  selector: 'atm-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmSwitch), multi: true },
  ],
  host: { class: 'inline-block' },
  template: `
    <label
      [class]="
        'group flex cursor-pointer items-center gap-3 select-none ' +
        (isDisabled() ? 'cursor-not-allowed opacity-50' : '')
      "
    >
      <span class="relative inline-flex shrink-0">
        <input
          type="checkbox"
          role="switch"
          class="peer sr-only"
          [checked]="value() === true"
          [disabled]="isDisabled()"
          (change)="onToggle($event)"
          (blur)="onTouched()"
        />
        <span
          [class]="trackClasses()"
          class="rounded-full bg-line-strong transition-colors duration-200
            peer-checked:bg-primary peer-focus-visible:shadow-[0_0_0_3px_var(--atm-ring)]"
        ></span>
        <span
          [class]="thumbClasses()"
          class="absolute top-1/2 left-0.5 -translate-y-1/2 rounded-full bg-white shadow-md
            transition-transform duration-200 ease-out group-active:scale-90"
        ></span>
      </span>
      @if (label()) {
        <span [class]="textClasses()" class="text-ink">{{ label() }}</span>
      }
      <ng-content />
    </label>
  `,
})
export class AtmSwitch extends AtmValueAccessor<boolean> {
  readonly size = input<AtmSize>('medium');
  readonly label = input<string | undefined>(undefined);
  readonly disabled = input(false);

  readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());
  readonly trackClasses = computed(() => `block ${TRACK[this.size()]}`);
  readonly thumbClasses = computed(() => THUMB[this.size()]);
  readonly textClasses = computed(() => TEXT[this.size()]);

  onToggle(event: Event): void {
    this.setValue((event.target as HTMLInputElement).checked);
    this.onTouched();
  }
}
