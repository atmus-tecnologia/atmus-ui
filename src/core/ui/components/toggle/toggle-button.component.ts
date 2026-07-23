import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  model,
  output,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { AtmSize } from '../../types';
import { AtmValueAccessor } from '../../utils/value-accessor';

const SIZE: Record<AtmSize, string> = {
  large: 'h-12 px-5 text-base gap-2.5',
  medium: 'h-10 px-4 text-sm gap-2',
  slim: 'h-8 px-3 text-xs gap-1.5',
};

/** Pressed/unpressed button. Standalone or inside atm-toggle-button-group. */
@Component({
  selector: 'atm-toggle-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <button
      type="button"
      [class]="classes()"
      [attr.aria-pressed]="pressed()"
      [disabled]="disabled()"
      (click)="toggle()"
    >
      @if (icon()) {
        <i [class]="'icofont-' + icon()" aria-hidden="true"></i>
      }
      <ng-content />
    </button>
  `,
})
export class AtmToggleButton {
  readonly size = input<AtmSize>('medium');
  readonly icon = input<string | undefined>(undefined);
  readonly disabled = input(false);
  readonly pressed = model(false);

  readonly changed = output<boolean>();

  readonly classes = computed(
    () =>
      `atm-focus inline-flex cursor-pointer items-center justify-center rounded-atm font-medium ` +
      `transition-all duration-200 select-none active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 ` +
      `${SIZE[this.size()]} ` +
      (this.pressed()
        ? 'bg-primary-soft text-primary inset-ring inset-ring-primary/30'
        : 'border border-line text-ink-muted hover:bg-surface-alt hover:text-ink'),
  );

  toggle(): void {
    this.pressed.set(!this.pressed());
    this.changed.emit(this.pressed());
  }
}

/**
 * Exclusive (or multiple) toggle group bound to a form value:
 *   <atm-toggle-button-group [options]="[{label, value, icon?}]" [(ngModel)]="v" />
 */
@Component({
  selector: 'atm-toggle-button-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmToggleButtonGroup), multi: true },
  ],
  host: { class: 'inline-flex' },
  template: `
    <div class="inline-flex items-center gap-1 rounded-atm bg-surface-alt p-1" role="group">
      @for (option of options(); track option.value) {
        <button
          type="button"
          [class]="optionClasses(option.value)"
          [attr.aria-pressed]="isSelected(option.value)"
          [disabled]="disabled()"
          (click)="select(option.value)"
        >
          @if (option.icon) {
            <i [class]="'icofont-' + option.icon" aria-hidden="true"></i>
          }
          @if (option.label) {
            {{ option.label }}
          }
        </button>
      }
    </div>
  `,
})
export class AtmToggleButtonGroup extends AtmValueAccessor<unknown> {
  readonly size = input<AtmSize>('medium');
  readonly options = input<{ label?: string; value: unknown; icon?: string }[]>([]);
  readonly disabled = input(false);
  /** Allow multiple selection (value becomes array). */
  readonly multiple = input(false);

  isSelected(v: unknown): boolean {
    if (this.multiple()) return Array.isArray(this.value()) && (this.value() as unknown[]).includes(v);
    return this.value() === v;
  }

  optionClasses(v: unknown): string {
    const sizeMap: Record<AtmSize, string> = {
      large: 'h-10 px-4 text-base gap-2',
      medium: 'h-8 px-3 text-sm gap-1.5',
      slim: 'h-6 px-2 text-xs gap-1',
    };
    return (
      `atm-focus inline-flex cursor-pointer items-center justify-center rounded-[calc(var(--atm-radius)-2px)] ` +
      `font-medium transition-all duration-150 select-none disabled:pointer-events-none disabled:opacity-50 ` +
      `${sizeMap[this.size()]} ` +
      (this.isSelected(v)
        ? 'bg-surface text-ink shadow-sm'
        : 'text-ink-muted hover:text-ink')
    );
  }

  select(v: unknown): void {
    if (this.multiple()) {
      const current = Array.isArray(this.value()) ? [...(this.value() as unknown[])] : [];
      const i = current.indexOf(v);
      if (i >= 0) current.splice(i, 1);
      else current.push(v);
      this.setValue(current);
    } else {
      this.setValue(this.value() === v ? null : v);
    }
    this.onTouched();
  }
}
