import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  input,
  output,
  viewChildren,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { AtmSize } from '../../types';
import { AtmValueAccessor } from '../../utils/value-accessor';

const SIZE: Record<AtmSize, string> = {
  large: 'size-12 text-xl',
  medium: 'size-10 text-lg',
  slim: 'size-8 text-sm',
};

/** One-time-password input with auto-advance and paste support. */
@Component({
  selector: 'atm-input-otp',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmInputOtp), multi: true },
  ],
  host: { class: 'inline-block' },
  template: `
    <div class="flex items-center gap-2">
      @for (i of slots(); track i) {
        <input
          #slot
          type="text"
          inputmode="numeric"
          maxlength="1"
          autocomplete="one-time-code"
          [class]="slotClasses()"
          [disabled]="disabled() || disabledByForm()"
          [value]="charAt(i)"
          (input)="onSlotInput(i, $event)"
          (keydown)="onKeydown(i, $event)"
          (paste)="onPaste($event)"
          (focus)="selectAll($event)"
        />
      }
    </div>
  `,
})
export class AtmInputOtp extends AtmValueAccessor<string> {
  readonly size = input<AtmSize>('medium');
  readonly length = input(6);
  readonly disabled = input(false);
  readonly invalid = input(false);

  /** Emits when all slots are filled. */
  readonly completed = output<string>();

  private readonly inputs = viewChildren<ElementRef<HTMLInputElement>>('slot');

  readonly slots = computed(() => Array.from({ length: this.length() }, (_, i) => i));

  readonly slotClasses = computed(() =>
    [
      'atm-field atm-focus text-center font-semibold caret-primary',
      SIZE[this.size()],
      this.invalid() ? 'atm-field--invalid' : '',
    ].join(' '),
  );

  charAt(i: number): string {
    return (this.value() ?? '')[i] ?? '';
  }

  onSlotInput(i: number, event: Event): void {
    const char = (event.target as HTMLInputElement).value.slice(-1);
    const chars = (this.value() ?? '').padEnd(this.length(), ' ').split('');
    chars[i] = char || ' ';
    this.commit(chars.join(''));
    if (char && i < this.length() - 1) this.focusSlot(i + 1);
  }

  onKeydown(i: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.charAt(i) && i > 0) this.focusSlot(i - 1);
    if (event.key === 'ArrowLeft' && i > 0) this.focusSlot(i - 1);
    if (event.key === 'ArrowRight' && i < this.length() - 1) this.focusSlot(i + 1);
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const text = (event.clipboardData?.getData('text') ?? '').trim().slice(0, this.length());
    if (!text) return;
    this.commit(text);
    this.focusSlot(Math.min(text.length, this.length() - 1));
  }

  selectAll(event: FocusEvent): void {
    (event.target as HTMLInputElement).select();
  }

  private commit(raw: string): void {
    const clean = raw.replace(/\s+$/, '');
    this.setValue(clean);
    if (clean.length === this.length() && !clean.includes(' ')) this.completed.emit(clean);
  }

  private focusSlot(i: number): void {
    this.inputs()[i]?.nativeElement.focus();
  }
}
