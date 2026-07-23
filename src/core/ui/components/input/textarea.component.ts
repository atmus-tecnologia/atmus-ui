import {
  ChangeDetectionStrategy,
  Component,
  computed,
  forwardRef,
  input,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ATM_SIZE_TEXT, AtmSize, atmUid } from '../../types';
import { AtmValueAccessor } from '../../utils/value-accessor';

@Component({
  selector: 'atm-textarea',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmTextarea), multi: true },
  ],
  host: { class: 'block w-full' },
  template: `
    <textarea
      [id]="inputId()"
      [class]="classes()"
      [placeholder]="placeholder()"
      [rows]="rows()"
      [disabled]="disabled() || disabledByForm()"
      [readonly]="readonly()"
      [attr.maxlength]="maxlength() ?? null"
      [value]="value() ?? ''"
      (input)="onInput($event)"
      (blur)="onTouched()"
    ></textarea>
    @if (maxlength() && showCounter()) {
      <div class="mt-1 text-right text-xs text-ink-faint">
        {{ (value() ?? '').length }}/{{ maxlength() }}
      </div>
    }
  `,
})
export class AtmTextarea extends AtmValueAccessor<string> {
  readonly size = input<AtmSize>('medium');
  readonly placeholder = input('');
  readonly rows = input(3);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly invalid = input(false);
  readonly resizable = input(true);
  readonly maxlength = input<number | undefined>(undefined);
  readonly showCounter = input(true);
  readonly inputId = input(atmUid('atm-textarea'));

  readonly classes = computed(() =>
    [
      'atm-field block p-3 placeholder:text-ink-faint',
      ATM_SIZE_TEXT[this.size()],
      this.resizable() ? 'resize-y' : 'resize-none',
      this.invalid() ? 'atm-field--invalid' : '',
    ].join(' '),
  );

  onInput(event: Event): void {
    this.setValue((event.target as HTMLTextAreaElement).value);
  }
}
