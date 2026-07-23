import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ATM_SIZE_HEIGHT, ATM_SIZE_PX, ATM_SIZE_TEXT, AtmSize } from '../../types';
import { AtmOverlayBase } from '../../utils/overlay-base';
import { AtmSelectOption } from '../select/select.component';

/**
 * Autocomplete / ComboBox — text input with filtered local suggestions.
 * Alias selectors: atm-autocomplete, atm-combobox.
 */
@Component({
  selector: 'atm-autocomplete, atm-combobox',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmAutocomplete), multi: true },
  ],
  host: { class: 'block w-full' },
  template: `
    <div #trigger [class]="wrapperClasses()">
      <i class="icofont-ui-search shrink-0 text-xs text-ink-faint" aria-hidden="true"></i>
      <input
        type="text"
        role="combobox"
        [attr.aria-expanded]="isOpen()"
        class="h-full w-full min-w-0 bg-transparent outline-none placeholder:text-ink-faint"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [value]="query()"
        (input)="onQuery($event)"
        (focus)="openIfNeeded()"
        (keydown)="onKeydown($event)"
        (blur)="onTouched_()"
      />
      @if (query()) {
        <button
          type="button"
          class="shrink-0 cursor-pointer text-ink-faint transition-colors hover:text-ink"
          aria-label="Limpar"
          (click)="clear()"
        >
          <i class="icofont-close" aria-hidden="true"></i>
        </button>
      }
    </div>

    @if (isOpen()) {
      <div
        #panel
        [style]="panelStyle()"
        class="atm-panel animate-atm-pop z-50 overflow-y-auto p-1.5"
        role="listbox"
      >
        @for (option of filtered(); track option.value; let i = $index) {
          <button
            type="button"
            class="atm-option py-2"
            [class.atm-option--active]="i === activeIndex()"
            [class.atm-option--selected]="option.value === value()"
            role="option"
            (click)="select(option)"
            (mouseenter)="activeIndex.set(i)"
          >
            <span class="min-w-0 flex-1 truncate" [innerHTML]="highlight(option.label)"></span>
          </button>
        } @empty {
          <div class="px-3 py-6 text-center text-sm text-ink-faint">Nenhum resultado</div>
        }
      </div>
    }
  `,
})
export class AtmAutocomplete extends AtmOverlayBase implements ControlValueAccessor {
  readonly size = input<AtmSize>('medium');
  readonly options = input<AtmSelectOption[]>([]);
  readonly placeholder = input('Digite para pesquisar...');
  readonly disabled = input(false);
  readonly invalid = input(false);
  /** Min chars before showing suggestions. */
  readonly minChars = input(0);

  readonly selectionChange = output<AtmSelectOption | null>();

  readonly triggerRef = viewChild<ElementRef<HTMLElement>>('trigger');
  readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');

  readonly query = signal('');
  readonly activeIndex = signal(-1);
  readonly value = signal<unknown>(null);
  readonly disabledByForm = signal(false);

  private valueChangeFn: (v: unknown) => void = () => {};
  private touchedFn: () => void = () => {};

  readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  readonly filtered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (q.length < this.minChars()) return [];
    if (!q) return this.options();
    return this.options().filter((o) => o.label.toLowerCase().includes(q));
  });

  readonly wrapperClasses = computed(() =>
    [
      'atm-field flex items-center gap-2',
      ATM_SIZE_HEIGHT[this.size()],
      ATM_SIZE_PX[this.size()],
      ATM_SIZE_TEXT[this.size()],
      this.invalid() ? 'atm-field--invalid' : '',
      this.isDisabled() ? 'atm-field--disabled' : '',
    ].join(' '),
  );

  writeValue(value: unknown): void {
    this.value.set(value);
    const match = this.options().find((o) => o.value === value);
    if (match) this.query.set(match.label);
    else if (value == null) this.query.set('');
  }
  registerOnChange(fn: (v: unknown) => void): void {
    this.valueChangeFn = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.touchedFn = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }

  protected getTriggerEl(): HTMLElement | null {
    return this.triggerRef()?.nativeElement ?? null;
  }
  protected getPanelEl(): HTMLElement | null {
    return this.panelRef()?.nativeElement ?? null;
  }

  onTouched_(): void {
    this.touchedFn();
  }

  openIfNeeded(): void {
    if (this.query().length >= this.minChars()) this.open();
  }

  onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(-1);
    if (!this.isOpen()) this.open();
    else queueMicrotask(() => this.reposition());
  }

  onKeydown(event: KeyboardEvent): void {
    const list = this.filtered();
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.activeIndex.update((i) => Math.min(i + 1, list.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.activeIndex.update((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      const active = list[this.activeIndex()];
      if (active) {
        event.preventDefault();
        this.select(active);
      }
    }
  }

  select(option: AtmSelectOption): void {
    this.value.set(option.value);
    this.query.set(option.label);
    this.valueChangeFn(option.value);
    this.selectionChange.emit(option);
    this.close();
  }

  clear(): void {
    this.query.set('');
    this.value.set(null);
    this.valueChangeFn(null);
    this.selectionChange.emit(null);
  }

  highlight(label: string): string {
    const q = this.query().trim();
    if (!q) return label;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return label.replace(
      new RegExp(`(${escaped})`, 'ig'),
      '<mark class="bg-transparent font-semibold text-primary">$1</mark>',
    );
  }
}
