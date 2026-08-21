import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  output,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { AtmSize } from '../../types';
import { AtmValueAccessor } from '../../utils/value-accessor';
import { AtmSelectOption } from '../select/select.component';

/** Inline always-visible option list (single or multiple selection). */
@Component({
  selector: 'atm-listbox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmListbox), multi: true },
  ],
  host: { class: 'block w-full' },
  template: `
    <div
      class="atm-panel max-h-64 overflow-y-auto p-1.5 shadow-none"
      role="listbox"
      [attr.aria-multiselectable]="multiple()"
    >
      @for (option of options(); track option.value) {
        <button
          type="button"
          class="atm-option py-2"
          [class.atm-option--selected]="isSelected(option.value)"
          [class.atm-option--disabled]="option.disabled"
          role="option"
          [attr.aria-selected]="isSelected(option.value)"
          (click)="select(option)"
        >
          @if (option.icon) {
            <i [class]="'text-ink-muted atm atm-' + option.icon" aria-hidden="true"></i>
          }
          <span class="min-w-0 flex-1">
            <span class="block truncate">{{ option.label }}</span>
            @if (option.description) {
              <span class="block truncate text-xs font-normal text-ink-muted">
                {{ option.description }}
              </span>
            }
          </span>
          @if (isSelected(option.value)) {
            <i class="atm atm-tick-02 shrink-0 text-primary" aria-hidden="true"></i>
          }
        </button>
      } @empty {
        <div class="px-3 py-6 text-center text-sm text-ink-faint">Nenhuma opção</div>
      }
    </div>
  `,
})
export class AtmListbox extends AtmValueAccessor<unknown> {
  readonly size = input<AtmSize>('medium');
  readonly options = input<AtmSelectOption[]>([]);
  readonly multiple = input(false);

  readonly selectionChange = output<unknown>();

  isSelected(v: unknown): boolean {
    if (this.multiple()) return Array.isArray(this.value()) && (this.value() as unknown[]).includes(v);
    return this.value() === v;
  }

  select(option: AtmSelectOption): void {
    if (option.disabled) return;
    if (this.multiple()) {
      const current = Array.isArray(this.value()) ? [...(this.value() as unknown[])] : [];
      const i = current.indexOf(option.value);
      if (i >= 0) current.splice(i, 1);
      else current.push(option.value);
      this.setValue(current);
      this.selectionChange.emit(current);
    } else {
      this.setValue(option.value);
      this.selectionChange.emit(option.value);
    }
    this.onTouched();
  }
}
