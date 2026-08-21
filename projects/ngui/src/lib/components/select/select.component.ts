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

export interface AtmSelectOption<T = unknown> {
  label: string;
  value: T;
  description?: string;
  icon?: string;
  disabled?: boolean;
}

/**
 * Custom select with viewport-aware panel (flips up when there is no space
 * below), keyboard navigation and optional footer action button.
 */
@Component({
  selector: 'atm-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmSelect), multi: true },
  ],
  host: { class: 'block w-full' },
  template: `
    <button
      #trigger
      type="button"
      [class]="triggerClasses()"
      [disabled]="isDisabled()"
      aria-haspopup="listbox"
      [attr.aria-expanded]="isOpen()"
      (click)="toggle()"
      (keydown)="onTriggerKeydown($event)"
    >
      <span class="flex min-w-0 flex-1 items-center gap-2">
        @if (selectedOption()?.icon) {
          <i [class]="'text-ink-muted atm atm-' + selectedOption()!.icon" aria-hidden="true"></i>
        }
        <span class="truncate" [class.text-ink-faint]="!selectedOption()">
          {{ selectedOption()?.label ?? placeholder() }}
        </span>
      </span>
      @if (clearable() && selectedOption() && !isDisabled()) {
        <span
          role="button"
          tabindex="-1"
          class="shrink-0 cursor-pointer text-ink-faint transition-colors hover:text-ink"
          aria-label="Limpar"
          (click)="clear($event)"
        >
          <i class="atm atm-cancel-01" aria-hidden="true"></i>
        </span>
      }
      <i
        class="atm atm-chevron-down shrink-0 text-xs text-ink-faint transition-transform duration-200"
        [class.rotate-180]="isOpen()"
        aria-hidden="true"
      ></i>
    </button>

    @if (isOpen()) {
      <div
        #panel
        [style]="panelStyle()"
        class="atm-panel animate-atm-pop z-50 flex flex-col overflow-hidden"
        role="listbox"
      >
        <div class="flex-1 overflow-y-auto p-1.5">
          @for (option of options(); track option.value; let i = $index) {
            <button
              type="button"
              class="atm-option"
              [class]="optionRowSize()"
              [class.atm-option--selected]="option.value === value()"
              [class.atm-option--active]="i === activeIndex()"
              [class.atm-option--disabled]="option.disabled"
              role="option"
              [attr.aria-selected]="option.value === value()"
              (click)="select(option)"
              (mouseenter)="activeIndex.set(i)"
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
              @if (option.value === value()) {
                <i class="atm atm-tick-02 shrink-0 text-primary" aria-hidden="true"></i>
              }
            </button>
          } @empty {
            <div class="px-3 py-6 text-center text-sm text-ink-faint">Nenhuma opção</div>
          }
        </div>
        @if (hasActionButton()) {
          <div class="border-t border-line p-1.5">
            <button
              type="button"
              class="atm-focus flex w-full cursor-pointer items-center justify-center gap-2 rounded-[calc(var(--atm-radius)-4px)]
                px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary-soft"
              (click)="onActionClick()"
            >
              <i class="atm atm-plus-sign" aria-hidden="true"></i>
              {{ actionButtonLabel() }}
            </button>
          </div>
        }
      </div>
    }
  `,
})
export class AtmSelect extends AtmOverlayBase implements ControlValueAccessor {
  readonly size = input<AtmSize>('medium');
  readonly options = input<AtmSelectOption[]>([]);
  readonly placeholder = input('Selecione...');
  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly clearable = input(false);
  /** Shows a footer button inside the panel ("add new record" pattern). */
  readonly hasActionButton = input(false);
  readonly actionButtonLabel = input('Adicionar novo');

  readonly actionClick = output<void>();
  readonly selectionChange = output<AtmSelectOption | null>();

  readonly triggerRef = viewChild<ElementRef<HTMLElement>>('trigger');
  readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');

  readonly activeIndex = signal(-1);

  readonly value = signal<unknown>(null);
  readonly disabledByForm = signal(false);
  private valueChangeFn: (v: unknown) => void = () => {};
  private touchedFn: () => void = () => {};

  writeValue(value: unknown): void {
    this.value.set(value);
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

  readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  readonly selectedOption = computed(
    () => this.options().find((o) => o.value === this.value()) ?? null,
  );

  readonly triggerClasses = computed(() =>
    [
      'atm-field flex cursor-pointer items-center gap-2 text-left',
      ATM_SIZE_HEIGHT[this.size()],
      ATM_SIZE_PX[this.size()],
      ATM_SIZE_TEXT[this.size()],
      this.invalid() ? 'atm-field--invalid' : '',
      this.isDisabled() ? 'atm-field--disabled' : '',
    ].join(' '),
  );

  readonly optionRowSize = computed(() =>
    this.size() === 'slim' ? 'py-1.5' : this.size() === 'large' ? 'py-2.5' : 'py-2',
  );

  protected getTriggerEl(): HTMLElement | null {
    return this.triggerRef()?.nativeElement ?? null;
  }
  protected getPanelEl(): HTMLElement | null {
    return this.panelRef()?.nativeElement ?? null;
  }

  select(option: AtmSelectOption): void {
    if (option.disabled) return;
    this.value.set(option.value);
    this.valueChangeFn(option.value);
    this.selectionChange.emit(option);
    this.touchedFn();
    this.close();
  }

  clear(event: Event): void {
    event.stopPropagation();
    this.value.set(null);
    this.valueChangeFn(null);
    this.selectionChange.emit(null);
  }

  onActionClick(): void {
    this.actionClick.emit();
    this.close();
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    const options = this.options();
    if (!options.length) return;
    if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(event.key)) {
      event.preventDefault();
      if (!this.isOpen()) {
        this.open();
        this.activeIndex.set(Math.max(options.findIndex((o) => o.value === this.value()), 0));
        return;
      }
    }
    if (event.key === 'ArrowDown') {
      this.activeIndex.update((i) => Math.min(i + 1, options.length - 1));
    } else if (event.key === 'ArrowUp') {
      this.activeIndex.update((i) => Math.max(i - 1, 0));
    } else if (event.key === 'Enter' && this.isOpen()) {
      const active = options[this.activeIndex()];
      if (active) this.select(active);
    }
  }
}
