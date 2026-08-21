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
import { ATM_SIZE_TEXT, AtmSize } from '../../types';
import { AtmOverlayBase } from '../../utils/overlay-base';
import { AtmChip } from '../chip/chip.component';
import { AtmSelectOption } from '../select/select.component';

/** Option for atm-tags — same shape as select options + optional group header. */
export interface AtmTagsOption<T = unknown> extends AtmSelectOption<T> {
  /** Optional group header shown in the suggestions panel. */
  group?: string;
}

const MIN_HEIGHT: Record<AtmSize, string> = {
  large: 'min-h-12',
  medium: 'min-h-10',
  slim: 'min-h-8',
};

/**
 * Tags input with suggestions panel (multi-select).
 * The form value is `T[]` — option values can be any object coming from the
 * backend; use `compareWith` to match by id and `displayWith` to render
 * labels for values that are not in the options list.
 * With `allowCustom`, free text becomes a tag via `createTag` (string by default).
 */
@Component({
  selector: 'atm-tags',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmChip],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmTags), multi: true },
  ],
  host: { class: 'block w-full' },
  template: `
    <div #trigger [class]="wrapperClasses()" (click)="focusInput()">
      @for (tag of tags(); track $index) {
        <atm-chip
          [size]="size() === 'large' ? 'medium' : 'slim'"
          color="primary"
          [removable]="!isDisabled()"
          (removed)="removeAt($index)"
        >
          {{ tag.label }}
        </atm-chip>
      }
      <input
        #input
        type="text"
        role="combobox"
        aria-haspopup="listbox"
        [attr.aria-expanded]="isOpen()"
        class="h-7 min-w-20 flex-1 bg-transparent px-1 outline-none placeholder:text-ink-faint"
        [class]="textClasses()"
        [placeholder]="tags().length ? '' : placeholder()"
        [disabled]="isDisabled()"
        [value]="query()"
        (input)="onQuery($event)"
        (focus)="openIfNeeded()"
        (keydown)="onKeydown($event)"
        (blur)="touchedFn()"
      />
    </div>

    @if (isOpen()) {
      <div
        #panel
        [style]="panelStyle()"
        class="atm-panel animate-atm-pop z-50 flex flex-col overflow-hidden"
        role="listbox"
        aria-multiselectable="true"
      >
        <div class="flex-1 overflow-y-auto p-1.5">
          @for (group of groupedFiltered(); track group.label) {
            @if (group.label) {
              <div class="px-3 pt-2 pb-1 text-xs font-semibold text-ink-muted">
                {{ group.label }}
              </div>
            }
            @for (item of group.items; track item.index) {
              <button
                type="button"
                class="atm-option py-2"
                [class.atm-option--active]="item.index === activeIndex()"
                [class.atm-option--selected]="isSelected(item.option)"
                [class.atm-option--disabled]="item.option.disabled"
                role="option"
                [attr.aria-selected]="isSelected(item.option)"
                (click)="toggleOption(item.option)"
                (mouseenter)="activeIndex.set(item.index)"
              >
                @if (item.option.icon) {
                  <i [class]="'text-ink-muted atm atm-' + item.option.icon" aria-hidden="true"></i>
                }
                <span class="min-w-0 flex-1">
                  <span class="block truncate">{{ item.option.label }}</span>
                  @if (item.option.description) {
                    <span class="block truncate text-xs font-normal text-ink-muted">
                      {{ item.option.description }}
                    </span>
                  }
                </span>
                @if (isSelected(item.option)) {
                  <i class="atm atm-tick-02 shrink-0 text-primary" aria-hidden="true"></i>
                }
              </button>
            }
          } @empty {
            @if (!canCreate()) {
              <div class="px-3 py-6 text-center text-sm text-ink-faint">Nenhuma opção</div>
            }
          }
          @if (canCreate()) {
            <button
              type="button"
              class="atm-option py-2 text-primary"
              (click)="addCustom()"
            >
              <i class="atm atm-plus-sign" aria-hidden="true"></i>
              <span class="min-w-0 flex-1 truncate">Adicionar "{{ query().trim() }}"</span>
            </button>
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
export class AtmTags extends AtmOverlayBase implements ControlValueAccessor {
  readonly size = input<AtmSize>('medium');
  readonly options = input<AtmTagsOption[]>([]);
  readonly placeholder = input('Digite para pesquisar...');
  readonly disabled = input(false);
  readonly invalid = input(false);
  /** Allows adding free text (not in options) as a tag. */
  readonly allowCustom = input(false);
  /** Builds the value of a custom tag from the typed text (default: the string itself). */
  readonly createTag = input<(label: string) => unknown>((label) => label);
  readonly maxTags = input<number | undefined>(undefined);
  /** Compares a form value against an option value (default: ===). Use it when values come from the backend. */
  readonly compareWith = input<(a: unknown, b: unknown) => boolean>((a, b) => a === b);
  /** Label for values without a matching option (default: String(v)). */
  readonly displayWith = input<((value: unknown) => string) | undefined>(undefined);
  /** Shows a footer button inside the panel ("add new record" pattern). */
  readonly hasActionButton = input(false);
  readonly actionButtonLabel = input('Adicionar novo');

  readonly actionClick = output<void>();
  readonly selectionChange = output<unknown[]>();

  readonly triggerRef = viewChild<ElementRef<HTMLElement>>('trigger');
  readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');
  readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('input');

  readonly query = signal('');
  readonly activeIndex = signal(-1);
  readonly values = signal<unknown[]>([]);
  readonly disabledByForm = signal(false);

  private valueChangeFn: (v: unknown[]) => void = () => {};
  touchedFn: () => void = () => {};

  writeValue(value: unknown[] | null): void {
    this.values.set(value ?? []);
  }
  registerOnChange(fn: (v: unknown[]) => void): void {
    this.valueChangeFn = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.touchedFn = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }

  readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());
  readonly textClasses = computed(() => ATM_SIZE_TEXT[this.size()]);

  readonly wrapperClasses = computed(() =>
    [
      'atm-field flex cursor-text flex-wrap items-center gap-1.5 p-1.5',
      MIN_HEIGHT[this.size()],
      this.invalid() ? 'atm-field--invalid' : '',
      this.isDisabled() ? 'atm-field--disabled' : '',
    ].join(' '),
  );

  /** Selected values resolved to labels (option label > string itself > displayWith > String). */
  readonly tags = computed(() => {
    const compare = this.compareWith();
    const display = this.displayWith();
    return this.values().map((value) => {
      const option = this.options().find((o) => compare(o.value, value));
      const label =
        option?.label ??
        (typeof value === 'string' ? value : (display?.(value) ?? String(value)));
      return { value, label };
    });
  });

  readonly maxReached = computed(
    () => this.maxTags() != null && this.values().length >= this.maxTags()!,
  );

  /** Options matching the query, grouped by `group` (visual order = keyboard order). */
  readonly groupedFiltered = computed(() => {
    const q = this.query().trim().toLowerCase();
    const matches = this.options().filter((o) => !q || o.label.toLowerCase().includes(q));
    const groups: {
      label: string | null;
      items: { option: AtmTagsOption; index: number }[];
    }[] = [];
    for (const option of matches) {
      const label = option.group ?? null;
      let group = groups.find((g) => g.label === label);
      if (!group) {
        group = { label, items: [] };
        groups.push(group);
      }
      group.items.push({ option, index: 0 });
    }
    let index = 0;
    for (const group of groups) {
      for (const item of group.items) item.index = index++;
    }
    return groups;
  });

  readonly flatFiltered = computed(() =>
    this.groupedFiltered().flatMap((g) => g.items.map((i) => i.option)),
  );

  readonly canCreate = computed(() => {
    const text = this.query().trim();
    if (!this.allowCustom() || !text || this.maxReached()) return false;
    const lower = text.toLowerCase();
    const existsInOptions = this.options().some((o) => o.label.toLowerCase() === lower);
    const existsInTags = this.tags().some((t) => t.label.toLowerCase() === lower);
    return !existsInOptions && !existsInTags;
  });

  protected getTriggerEl(): HTMLElement | null {
    return this.triggerRef()?.nativeElement ?? null;
  }
  protected getPanelEl(): HTMLElement | null {
    return this.panelRef()?.nativeElement ?? null;
  }

  isSelected(option: AtmTagsOption): boolean {
    const compare = this.compareWith();
    return this.values().some((v) => compare(option.value, v));
  }

  focusInput(): void {
    if (!this.isDisabled()) this.inputRef()?.nativeElement.focus();
  }

  openIfNeeded(): void {
    if (!this.isDisabled() && (this.options().length || this.hasActionButton())) this.open();
  }

  onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(-1);
    if (!this.isOpen()) this.openIfNeeded();
    else queueMicrotask(() => this.reposition());
  }

  onKeydown(event: KeyboardEvent): void {
    const list = this.flatFiltered();
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      if (!this.isOpen()) {
        this.openIfNeeded();
        return;
      }
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      this.activeIndex.update((current) => {
        let i = current;
        do {
          i += delta;
        } while (list[i]?.disabled);
        return list[i] ? i : current;
      });
    } else if (event.key === 'Enter' || (event.key === ',' && this.allowCustom())) {
      const active = list[this.activeIndex()];
      if (active) {
        event.preventDefault();
        this.toggleOption(active);
      } else if (this.canCreate()) {
        event.preventDefault();
        this.addCustom();
      }
    } else if (event.key === 'Backspace' && !this.query() && this.values().length) {
      this.removeAt(this.values().length - 1);
    }
  }

  toggleOption(option: AtmTagsOption): void {
    if (option.disabled || this.isDisabled()) return;
    if (this.isSelected(option)) {
      const compare = this.compareWith();
      this.setValues(this.values().filter((v) => !compare(option.value, v)));
    } else {
      if (this.maxReached()) return;
      this.setValues([...this.values(), option.value]);
    }
    this.query.set('');
    this.activeIndex.set(-1);
    this.focusInput();
    queueMicrotask(() => this.reposition());
  }

  addCustom(): void {
    if (!this.canCreate()) return;
    this.setValues([...this.values(), this.createTag()(this.query().trim())]);
    this.query.set('');
    this.activeIndex.set(-1);
    this.focusInput();
    if (this.isOpen()) queueMicrotask(() => this.reposition());
  }

  removeAt(index: number): void {
    if (this.isDisabled()) return;
    this.setValues(this.values().filter((_, i) => i !== index));
    if (this.isOpen()) queueMicrotask(() => this.reposition());
  }

  onActionClick(): void {
    this.actionClick.emit();
    this.close();
  }

  private setValues(values: unknown[]): void {
    this.values.set(values);
    this.valueChangeFn(values);
    this.selectionChange.emit(values);
  }
}
