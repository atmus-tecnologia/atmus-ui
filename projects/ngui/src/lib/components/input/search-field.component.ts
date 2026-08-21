import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  forwardRef,
  inject,
  input,
  output,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ATM_SIZE_HEIGHT, ATM_SIZE_PX, ATM_SIZE_TEXT, AtmSize } from '../../types';
import { AtmValueAccessor } from '../../utils/value-accessor';

/** Search input with debounced (search) output. */
@Component({
  selector: 'atm-search-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmSearchField), multi: true },
  ],
  host: { class: 'block w-full' },
  template: `
    <div [class]="wrapperClasses()">
      <i class="atm atm-search-01 shrink-0 text-xs text-ink-faint" aria-hidden="true"></i>
      <input
        type="search"
        class="h-full w-full min-w-0 bg-transparent outline-none placeholder:text-ink-faint
          disabled:cursor-not-allowed [&::-webkit-search-cancel-button]:hidden"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [value]="value() ?? ''"
        (input)="onInput($event)"
        (blur)="onTouched()"
      />
      @if (value()) {
        <button
          type="button"
          class="shrink-0 cursor-pointer text-ink-faint transition-colors hover:text-ink"
          aria-label="Limpar"
          (click)="clear()"
        >
          <i class="atm atm-cancel-01" aria-hidden="true"></i>
        </button>
      }
    </div>
  `,
})
export class AtmSearchField extends AtmValueAccessor<string> {
  private readonly destroyRef = inject(DestroyRef);

  readonly size = input<AtmSize>('medium');
  readonly placeholder = input('Pesquisar...');
  readonly disabled = input(false);
  readonly debounce = input(300);

  /** Emits the term after the debounce window. */
  readonly search = output<string>();

  private readonly term$ = new Subject<string>();

  readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  readonly wrapperClasses = computed(() =>
    [
      'atm-field flex items-center gap-2',
      ATM_SIZE_HEIGHT[this.size()],
      ATM_SIZE_PX[this.size()],
      ATM_SIZE_TEXT[this.size()],
      this.isDisabled() ? 'atm-field--disabled' : '',
    ].join(' '),
  );

  constructor() {
    super();
    this.term$
      .pipe(debounceTime(this.debounce()), takeUntilDestroyed(this.destroyRef))
      .subscribe((term) => this.search.emit(term));
  }

  onInput(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.setValue(term);
    this.term$.next(term);
  }

  clear(): void {
    this.setValue('');
    this.search.emit('');
  }
}
