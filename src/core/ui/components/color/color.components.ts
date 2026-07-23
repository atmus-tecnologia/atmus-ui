import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
  output,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ATM_SIZE_HEIGHT, ATM_SIZE_PX, ATM_SIZE_TEXT, AtmSize } from '../../types';
import { AtmValueAccessor } from '../../utils/value-accessor';

/** Static color square with checkerboard for transparency. */
@Component({
  selector: 'atm-color-swatch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <span
      [class]="sizeClass()"
      class="inline-block rounded-md border border-line shadow-sm"
      [style.background]="color()"
      [attr.title]="color()"
    ></span>
  `,
})
export class AtmColorSwatch {
  readonly color = input('#000000');
  readonly size = input<AtmSize>('medium');
  readonly sizeClass = computed(
    () => ({ large: 'size-8', medium: 'size-6', slim: 'size-4' })[this.size()],
  );
}

/** Grid of selectable swatches. Value = hex string. */
@Component({
  selector: 'atm-color-swatch-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmColorSwatchPicker), multi: true },
  ],
  template: `
    <div class="flex flex-wrap gap-2" role="radiogroup">
      @for (color of colors(); track color) {
        <button
          type="button"
          class="atm-focus size-7 cursor-pointer rounded-lg border border-black/10 shadow-sm
            transition-transform duration-100 hover:scale-110 active:scale-95"
          [class.ring-2]="value() === color"
          [class.ring-primary]="value() === color"
          [class.ring-offset-2]="value() === color"
          [class.ring-offset-surface]="value() === color"
          [style.background]="color"
          role="radio"
          [attr.aria-checked]="value() === color"
          [attr.aria-label]="color"
          (click)="pick(color)"
        ></button>
      }
    </div>
  `,
})
export class AtmColorSwatchPicker extends AtmValueAccessor<string> {
  readonly colors = input<string[]>([
    '#ef4444', '#f97316', '#f59e0b', '#10b981', '#14b8a6',
    '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#64748b',
  ]);

  readonly picked = output<string>();

  pick(color: string): void {
    this.setValue(color);
    this.picked.emit(color);
    this.onTouched();
  }
}

/** Hex input + native color picker swatch (alias atm-color-picker). */
@Component({
  selector: 'atm-color-field, atm-color-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmColorField), multi: true },
  ],
  host: { class: 'block w-full' },
  template: `
    <div [class]="wrapperClasses()">
      <span class="relative inline-flex shrink-0">
        <input
          type="color"
          class="absolute inset-0 cursor-pointer opacity-0"
          [value]="value() ?? '#000000'"
          [disabled]="isDisabled()"
          (input)="onNative($event)"
        />
        <span
          class="pointer-events-none block size-6 rounded-md border border-line shadow-sm"
          [style.background]="value() ?? '#000000'"
        ></span>
      </span>
      <input
        type="text"
        class="h-full w-full min-w-0 bg-transparent font-mono uppercase outline-none
          placeholder:text-ink-faint disabled:cursor-not-allowed"
        placeholder="#000000"
        maxlength="7"
        [disabled]="isDisabled()"
        [value]="value() ?? ''"
        (input)="onText($event)"
        (blur)="onTouched()"
      />
    </div>
  `,
})
export class AtmColorField extends AtmValueAccessor<string> {
  readonly size = input<AtmSize>('medium');
  readonly disabled = input(false);
  readonly invalid = input(false);

  readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  readonly wrapperClasses = computed(() =>
    [
      'atm-field flex items-center gap-2.5',
      ATM_SIZE_HEIGHT[this.size()],
      ATM_SIZE_PX[this.size()],
      ATM_SIZE_TEXT[this.size()],
      this.invalid() ? 'atm-field--invalid' : '',
      this.isDisabled() ? 'atm-field--disabled' : '',
    ].join(' '),
  );

  onNative(event: Event): void {
    this.setValue((event.target as HTMLInputElement).value);
  }

  onText(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.trim();
    if (/^#[0-9a-fA-F]{6}$/.test(raw) || raw === '') {
      this.setValue(raw || null);
    }
  }
}
