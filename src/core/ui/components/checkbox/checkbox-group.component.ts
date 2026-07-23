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
import { AtmCheckbox } from './checkbox.component';

export interface AtmCheckboxOption {
  label: string;
  value: unknown;
  description?: string;
  disabled?: boolean;
}

/** Group of checkboxes bound to an array value. */
@Component({
  selector: 'atm-checkbox-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmCheckbox],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmCheckboxGroup), multi: true },
  ],
  host: { class: 'block', role: 'group' },
  template: `
    <div [class]="direction() === 'row' ? 'flex flex-wrap gap-x-6 gap-y-3' : 'flex flex-col gap-3'">
      @for (option of options(); track option.value) {
        <atm-checkbox
          [size]="size()"
          [label]="option.label"
          [description]="option.description"
          [disabled]="disabled() || !!option.disabled"
          [checked]="isChecked(option.value)"
          (changed)="toggle(option.value, $event)"
        />
      }
    </div>
  `,
})
export class AtmCheckboxGroup extends AtmValueAccessor<unknown[]> {
  readonly size = input<AtmSize>('medium');
  readonly options = input<AtmCheckboxOption[]>([]);
  readonly direction = input<'row' | 'column'>('column');
  readonly disabled = input(false);

  readonly selection = computed(() => new Set(this.value() ?? []));

  isChecked(v: unknown): boolean {
    return this.selection().has(v);
  }

  toggle(v: unknown, checked: boolean | null): void {
    const next = new Set(this.value() ?? []);
    if (checked) next.add(v);
    else next.delete(v);
    this.setValue([...next]);
  }
}
