import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  output,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { AtmSize, atmUid } from '../../types';
import { AtmValueAccessor } from '../../utils/value-accessor';

const BOX: Record<AtmSize, string> = { large: 'size-6', medium: 'size-5', slim: 'size-4' };
const TEXT: Record<AtmSize, string> = { large: 'text-base', medium: 'text-sm', slim: 'text-xs' };

/**
 * Checkbox. Works with forms (ngModel/formControl) or controlled via
 * [checked] + (changed) when used inside groups.
 */
@Component({
  selector: 'atm-checkbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmCheckbox), multi: true },
  ],
  host: { class: 'inline-block' },
  template: `
    <label
      [class]="
        'group flex cursor-pointer items-start gap-2.5 select-none ' +
        (isDisabled() ? 'cursor-not-allowed opacity-50' : '')
      "
    >
      <span class="relative inline-flex shrink-0 items-center justify-center pt-0.5">
        <input
          type="checkbox"
          class="peer sr-only"
          [id]="inputId"
          [checked]="isChecked()"
          [indeterminate]="indeterminate()"
          [disabled]="isDisabled()"
          (change)="onToggle($event)"
          (blur)="onTouched()"
        />
        <span
          [class]="boxClasses()"
          class="flex items-center justify-center rounded-md border-2 border-line-strong bg-surface
            transition-all duration-150 peer-checked:border-primary peer-checked:bg-primary
            peer-focus-visible:shadow-[0_0_0_3px_var(--atm-ring)]
            group-hover:border-primary/60 group-active:scale-90"
        >
          @if (indeterminate()) {
            <i class="atm atm-minus-sign text-[10px] font-bold text-primary" aria-hidden="true"></i>
          } @else if (isChecked()) {
            <i
              class="atm atm-tick-02 animate-atm-pop text-[11px] font-bold text-primary-contrast"
              aria-hidden="true"
            ></i>
          }
        </span>
      </span>
      @if (label()) {
        <span [class]="textClasses()">
          {{ label() }}
          @if (description()) {
            <span class="mt-0.5 block text-xs text-ink-muted">{{ description() }}</span>
          }
        </span>
      }
      <ng-content />
    </label>
  `,
})
export class AtmCheckbox extends AtmValueAccessor<boolean> {
  readonly size = input<AtmSize>('medium');
  readonly label = input<string | undefined>(undefined);
  readonly description = input<string | undefined>(undefined);
  readonly disabled = input(false);
  readonly indeterminate = input(false);
  /** Controlled mode — overrides the form value when set. */
  readonly checked = input<boolean | undefined>(undefined);

  readonly changed = output<boolean>();

  readonly inputId = atmUid('atm-checkbox');

  readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());
  readonly isChecked = computed(() => this.checked() ?? this.value() === true);
  readonly boxClasses = computed(() => BOX[this.size()]);
  readonly textClasses = computed(() => `${TEXT[this.size()]} leading-snug text-ink`);

  onToggle(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.setValue(checked);
    this.changed.emit(checked);
    this.onTouched();
  }
}
