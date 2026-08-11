import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ATM_SIZE_TEXT, AtmSize } from '../../types';
import { AtmValueAccessor } from '../../utils/value-accessor';
import { AtmChip } from '../chip/chip.component';

/**
 * Tag input — type and press Enter to add, Backspace to remove last.
 * Value is string[].
 */
@Component({
  selector: 'atm-tag-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmChip],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmTagGroup), multi: true },
  ],
  host: { class: 'block w-full' },
  template: `
    <div
      [class]="wrapperClasses()"
      class="atm-field flex min-h-10 cursor-text flex-wrap items-center gap-1.5 p-1.5"
      (click)="focusInput()"
    >
      @for (tag of tags(); track tag) {
        <atm-chip
          [size]="size() === 'large' ? 'medium' : 'slim'"
          color="primary"
          [removable]="!isDisabled()"
          (removed)="remove(tag)"
        >
          {{ tag }}
        </atm-chip>
      }
      <input
        #input
        type="text"
        class="h-7 min-w-24 flex-1 bg-transparent px-1 outline-none placeholder:text-ink-faint"
        [class]="textClasses()"
        [placeholder]="tags().length ? '' : placeholder()"
        [disabled]="isDisabled()"
        (keydown)="onKeydown($event)"
        (blur)="onTouched()"
      />
    </div>
  `,
})
export class AtmTagGroup extends AtmValueAccessor<string[]> {
  readonly size = input<AtmSize>('medium');
  readonly placeholder = input('Digite e pressione Enter...');
  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly maxTags = input<number | undefined>(undefined);

  readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('input');

  readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());
  readonly tags = computed(() => this.value() ?? []);
  readonly textClasses = computed(() => ATM_SIZE_TEXT[this.size()]);
  readonly wrapperClasses = computed(() =>
    [
      this.invalid() ? 'atm-field--invalid' : '',
      this.isDisabled() ? 'atm-field--disabled' : '',
    ].join(' '),
  );

  focusInput(): void {
    this.inputRef()?.nativeElement.focus();
  }

  onKeydown(event: KeyboardEvent): void {
    const inputEl = event.target as HTMLInputElement;
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      const tag = inputEl.value.trim();
      if (!tag) return;
      if (this.maxTags() && this.tags().length >= this.maxTags()!) return;
      if (!this.tags().includes(tag)) {
        this.setValue([...this.tags(), tag]);
      }
      inputEl.value = '';
    } else if (event.key === 'Backspace' && !inputEl.value && this.tags().length) {
      this.setValue(this.tags().slice(0, -1));
    }
  }

  remove(tag: string): void {
    this.setValue(this.tags().filter((t) => t !== tag));
  }
}
