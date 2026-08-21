import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  forwardRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ATM_SIZE_TEXT, AtmSize } from '../../types';
import { AtmOverlayBase } from '../../utils/overlay-base';
import { AtmAvatar } from '../avatar/avatar.component';

/** Option for atm-combobox-user — a person/entity with optional photo. */
export interface AtmComboboxUserOption<T = unknown> {
  /** Display name (used for initials when there is no avatar). */
  label: string;
  value: T;
  /** Photo URL; without it, initials with deterministic color are shown. */
  avatar?: string;
  /** Secondary line (e.g. e-mail, role). */
  description?: string;
  disabled?: boolean;
}

/** Explicit tab definition: display name + value matched against the `groupBy` path. */
export interface AtmComboboxUserTab {
  label: string;
  value: unknown;
}

/** Sentinel for the "all" tab. */
const ALL_TAB: unique symbol = Symbol('atm-all-tab');

const MIN_HEIGHT: Record<AtmSize, string> = {
  large: 'min-h-12',
  medium: 'min-h-10',
  slim: 'min-h-8',
};

/** Same deterministic palette used by atm-avatar for initials fallback. */
const PALETTE = [
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-teal-500',
  'bg-orange-500',
];

/** Resolves a dot path (`role.name`) against an object. */
function resolvePath(source: unknown, path: string): unknown {
  return path
    .split('.')
    .reduce<unknown>(
      (acc, key) => (acc == null ? undefined : (acc as Record<string, unknown>)[key]),
      source,
    );
}

function sameGroup(a: unknown, b: unknown): boolean {
  return a === b || String(a) === String(b);
}

/**
 * ComboBox for picking people (or any entity with a photo): options render
 * avatar + name + description, and can be grouped into tabs by a dot path of
 * the option value (`groupBy="role.name"`). Tabs are auto-generated from the
 * distinct path values (capped by `maxTabs`), or provide `[tabs]` to
 * name/order them yourself. When the tab row overflows, scroll chevrons with
 * fading edges appear (same pattern as atm-tabs).
 *
 * Single (`T | null`) or multi (`[multiple]`, value `T[]`) — in multi mode the
 * selection is shown as avatar chips inside the field (search inline, like
 * atm-tags); in single mode the panel has a search bar on top.
 * Values can be backend objects; use `compareWith` to match by id.
 */
@Component({
  selector: 'atm-combobox-user',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmAvatar],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmComboboxUser), multi: true },
  ],
  host: { class: 'block w-full' },
  template: `
    <div
      #trigger
      [class]="wrapperClasses()"
      role="combobox"
      aria-haspopup="listbox"
      [attr.aria-expanded]="isOpen()"
      [attr.tabindex]="!multiple() && !isDisabled() ? 0 : null"
      (click)="onTriggerClick()"
      (keydown)="onWrapperKeydown($event)"
    >
      @if (multiple()) {
        @for (chip of chips(); track $index) {
          <span
            class="flex h-6 max-w-full items-center gap-1.5 rounded-full border border-line
              bg-surface-alt py-0.5 pr-1.5 pl-0.5 text-xs font-medium text-ink"
          >
            @if (chip.avatar) {
              <img [src]="chip.avatar" [alt]="chip.label" class="size-5 shrink-0 rounded-full object-cover" />
            } @else {
              <span
                [class]="'flex size-5 shrink-0 items-center justify-center rounded-full text-[9px] font-semibold text-white ' + colorOf(chip.label)"
              >
                {{ initialsOf(chip.label) }}
              </span>
            }
            <span class="max-w-36 truncate">{{ chip.label }}</span>
            @if (!isDisabled()) {
              <button
                type="button"
                class="atm-focus -mr-0.5 flex cursor-pointer items-center rounded-full text-ink-faint transition-colors hover:text-ink"
                [attr.aria-label]="'Remover ' + chip.label"
                (click)="removeAt($index); $event.stopPropagation()"
              >
                <i class="atm atm-cancel-01 text-[10px]" aria-hidden="true"></i>
              </button>
            }
          </span>
        }
        <input
          #input
          type="text"
          aria-haspopup="listbox"
          [attr.aria-expanded]="isOpen()"
          class="h-6 min-w-20 flex-1 bg-transparent px-1 outline-none placeholder:text-ink-faint"
          [class]="textClasses()"
          [placeholder]="chips().length ? '' : placeholder()"
          [disabled]="isDisabled()"
          [value]="query()"
          (input)="onQuery($event)"
          (focus)="openIfNeeded()"
          (keydown)="onKeydown($event)"
          (blur)="touchedFn()"
        />
      } @else {
        @if (selected(); as sel) {
          <span class="flex min-w-0 flex-1 items-center gap-2">
            @if (sel.avatar) {
              <img [src]="sel.avatar" [alt]="sel.label" class="size-6 shrink-0 rounded-full object-cover" />
            } @else {
              <span
                [class]="'flex size-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold text-white ' + colorOf(sel.label)"
              >
                {{ initialsOf(sel.label) }}
              </span>
            }
            <span class="truncate" [class]="textClasses()">{{ sel.label }}</span>
          </span>
        } @else {
          <span class="flex-1 truncate text-ink-faint" [class]="textClasses()">
            {{ placeholder() }}
          </span>
        }
        @if (clearable() && selected() && !isDisabled()) {
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
      }
      <i
        class="atm atm-chevron-down ml-auto shrink-0 text-xs text-ink-faint transition-transform duration-200"
        [class.rotate-180]="isOpen()"
        aria-hidden="true"
      ></i>
    </div>

    @if (isOpen()) {
      <div
        #panel
        [style]="panelStyle()"
        class="atm-panel animate-atm-pop z-50 flex flex-col overflow-hidden"
      >
        @if (!multiple()) {
          <div class="flex w-0 min-w-full items-center gap-2 border-b border-line px-3">
            <i class="atm atm-search-01 shrink-0 text-xs text-ink-faint" aria-hidden="true"></i>
            <input
              #input
              type="text"
              role="searchbox"
              class="h-9 w-full bg-transparent text-sm outline-none placeholder:text-ink-faint"
              [placeholder]="searchPlaceholder()"
              [value]="query()"
              (input)="onQuery($event)"
              (keydown)="onKeydown($event)"
              (blur)="touchedFn()"
            />
          </div>
        }
        @if (displayTabs().length) {
          <!-- w-0 + min-w-full: the tab row never widens the panel; it scrolls instead -->
          <div class="relative w-0 min-w-full border-b border-line">
            <div
              #tabsList
              role="tablist"
              class="flex items-center gap-0.5 overflow-x-auto px-1.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              (scroll)="updateTabsOverflow()"
            >
              @for (tab of displayTabs(); track $index) {
                <button
                  type="button"
                  role="tab"
                  [attr.aria-selected]="activeTab() === tab.value"
                  class="atm-focus flex shrink-0 cursor-pointer items-center gap-1.5 whitespace-nowrap border-b-2 px-2.5 pt-2 pb-1.5 text-xs font-medium transition-colors"
                  [class]="
                    activeTab() === tab.value
                      ? 'border-primary text-primary'
                      : 'border-transparent text-ink-muted hover:text-ink'
                  "
                  (click)="selectTab(tab.value)"
                >
                  {{ tab.label }}
                  <span
                    class="rounded-full px-1.5 text-[10px] tabular-nums"
                    [class]="activeTab() === tab.value ? 'bg-primary-soft text-primary' : 'bg-surface-alt text-ink-muted'"
                  >
                    {{ tab.count }}
                  </span>
                </button>
              }
            </div>
            @if (canScrollTabsLeft()) {
              <button
                type="button"
                tabindex="-1"
                aria-label="Rolar para a esquerda"
                class="absolute inset-y-0 left-0 z-10 flex w-8 cursor-pointer items-center justify-start pl-1 text-ink-muted transition-colors hover:text-ink"
                style="background: linear-gradient(to right, var(--atm-surface) 55%, transparent)"
                (click)="scrollTabsBy(-1)"
              >
                <i class="atm atm-chevron-left text-xs" aria-hidden="true"></i>
              </button>
            }
            @if (canScrollTabsRight()) {
              <button
                type="button"
                tabindex="-1"
                aria-label="Rolar para a direita"
                class="absolute inset-y-0 right-0 z-10 flex w-8 cursor-pointer items-center justify-end pr-1 text-ink-muted transition-colors hover:text-ink"
                style="background: linear-gradient(to left, var(--atm-surface) 55%, transparent)"
                (click)="scrollTabsBy(1)"
              >
                <i class="atm atm-chevron-right text-xs" aria-hidden="true"></i>
              </button>
            }
          </div>
        }
        <div
          class="flex-1 overflow-y-auto p-1.5"
          role="listbox"
          [attr.aria-multiselectable]="multiple()"
        >
          @for (option of visibleOptions(); track $index) {
            <button
              type="button"
              class="atm-option py-1.5"
              [class.atm-option--active]="$index === activeIndex()"
              [class.atm-option--selected]="isSelected(option)"
              [class.atm-option--disabled]="option.disabled"
              role="option"
              [attr.aria-selected]="isSelected(option)"
              (click)="toggleOption(option)"
              (mouseenter)="activeIndex.set($index)"
            >
              <atm-avatar size="slim" [src]="option.avatar" [name]="option.label" />
              <span class="min-w-0 flex-1">
                <span class="block truncate">{{ option.label }}</span>
                @if (option.description) {
                  <span class="block truncate text-xs font-normal text-ink-muted">
                    {{ option.description }}
                  </span>
                }
              </span>
              @if (isSelected(option)) {
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
export class AtmComboboxUser extends AtmOverlayBase implements ControlValueAccessor {
  readonly size = input<AtmSize>('medium');
  readonly options = input<AtmComboboxUserOption[]>([]);
  readonly placeholder = input('Selecione...');
  readonly searchPlaceholder = input('Pesquisar...');
  readonly disabled = input(false);
  readonly invalid = input(false);
  /** Multi-select: form value becomes `T[]` and selections render as avatar chips. */
  readonly multiple = input(false);
  /** Clear button in single mode. */
  readonly clearable = input(true);
  /**
   * Dot path resolved against the option value (fallback: the option itself),
   * e.g. `"role.name"` — options are grouped into tabs by the value found there.
   */
  readonly groupBy = input<string | undefined>(undefined);
  /** Explicit tabs (name + path value). Without it, tabs are auto-generated from distinct values. */
  readonly tabs = input<AtmComboboxUserTab[] | undefined>(undefined);
  /** Hard cap on the number of tabs (excess groups fall under the "all" tab). */
  readonly maxTabs = input(10);
  readonly showAllTab = input(true);
  readonly allTabLabel = input('Todos');
  /** Compares a form value against an option value (default: ===). Use it when values come from the backend. */
  readonly compareWith = input<(a: unknown, b: unknown) => boolean>((a, b) => a === b);
  /** Label for values without a matching option (default: String(v)). */
  readonly displayWith = input<((value: unknown) => string) | undefined>(undefined);
  /** Shows a footer button inside the panel ("add new record" pattern). */
  readonly hasActionButton = input(false);
  readonly actionButtonLabel = input('Adicionar novo');

  readonly actionClick = output<void>();
  /** Emits `T[]` in multi mode, `T | null` in single mode. */
  readonly selectionChange = output<unknown>();

  readonly triggerRef = viewChild<ElementRef<HTMLElement>>('trigger');
  readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');
  readonly inputRef = viewChild<ElementRef<HTMLInputElement>>('input');
  readonly tabsListRef = viewChild<ElementRef<HTMLElement>>('tabsList');

  readonly query = signal('');
  readonly activeIndex = signal(-1);
  readonly activeTab = signal<unknown>(ALL_TAB);
  readonly values = signal<unknown[]>([]);
  readonly disabledByForm = signal(false);

  readonly canScrollTabsLeft = signal(false);
  readonly canScrollTabsRight = signal(false);

  private valueChangeFn: (v: unknown) => void = () => {};
  touchedFn: () => void = () => {};

  constructor() {
    super();
    // Re-measure the tab row whenever the panel opens or the tabs/counts change.
    effect(() => {
      this.isOpen();
      this.displayTabs();
      queueMicrotask(() => this.updateTabsOverflow());
    });
  }

  writeValue(value: unknown): void {
    if (value == null) this.values.set([]);
    else if (Array.isArray(value)) this.values.set(value);
    else this.values.set([value]);
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
  readonly textClasses = computed(() => ATM_SIZE_TEXT[this.size()]);

  readonly wrapperClasses = computed(() =>
    [
      'atm-field flex items-center gap-1.5 p-1.5',
      this.multiple() ? 'cursor-text flex-wrap' : 'cursor-pointer',
      MIN_HEIGHT[this.size()],
      this.invalid() ? 'atm-field--invalid' : '',
      this.isDisabled() ? 'atm-field--disabled' : '',
    ].join(' '),
  );

  /** Selected values resolved to label + avatar (via matching option). */
  readonly chips = computed(() => {
    const compare = this.compareWith();
    const display = this.displayWith();
    return this.values().map((value) => {
      const option = this.options().find((o) => compare(o.value, value));
      const label =
        option?.label ??
        (typeof value === 'string' ? value : (display?.(value) ?? String(value)));
      return { value, label, avatar: option?.avatar };
    });
  });

  /** Single-mode selection. */
  readonly selected = computed(() => this.chips().at(0) ?? null);

  private groupValue(option: AtmComboboxUserOption): unknown {
    const path = this.groupBy();
    if (!path) return undefined;
    const fromValue = resolvePath(option.value, path);
    return fromValue !== undefined ? fromValue : resolvePath(option, path);
  }

  /** Tabs: explicit `[tabs]` or distinct `groupBy` values found in the options (max `maxTabs`). */
  readonly resolvedTabs = computed<AtmComboboxUserTab[]>(() => {
    const path = this.groupBy();
    if (!path) return [];
    const explicit = this.tabs();
    if (explicit?.length) return explicit.slice(0, this.maxTabs());
    const found: AtmComboboxUserTab[] = [];
    for (const option of this.options()) {
      if (found.length >= this.maxTabs()) break;
      const value = this.groupValue(option);
      if (!found.some((t) => sameGroup(t.value, value))) {
        found.push({ label: value == null ? 'Outros' : String(value), value });
      }
    }
    return found;
  });

  /** Options matching the typed query (label or description). */
  readonly queryFiltered = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) return this.options();
    return this.options().filter(
      (o) =>
        o.label.toLowerCase().includes(q) || o.description?.toLowerCase().includes(q),
    );
  });

  /** Tabs with live counts (query-aware), prefixed by the "all" tab. */
  readonly displayTabs = computed(() => {
    const base = this.resolvedTabs();
    if (!base.length) return [];
    const filtered = this.queryFiltered();
    const tabs = base.map((tab) => ({
      ...tab,
      count: filtered.filter((o) => sameGroup(this.groupValue(o), tab.value)).length,
    }));
    return this.showAllTab()
      ? [{ label: this.allTabLabel(), value: ALL_TAB as unknown, count: filtered.length }, ...tabs]
      : tabs;
  });

  /** Options of the active tab, filtered by the query (visual order = keyboard order). */
  readonly visibleOptions = computed(() => {
    const tab = this.activeTab();
    const list = this.queryFiltered();
    if (!this.groupBy() || tab === ALL_TAB) return list;
    return list.filter((o) => sameGroup(this.groupValue(o), tab));
  });

  protected getTriggerEl(): HTMLElement | null {
    return this.triggerRef()?.nativeElement ?? null;
  }
  protected getPanelEl(): HTMLElement | null {
    return this.panelRef()?.nativeElement ?? null;
  }

  protected override onClosed(): void {
    this.query.set('');
    this.activeIndex.set(-1);
    this.activeTab.set(ALL_TAB);
  }

  isSelected(option: AtmComboboxUserOption): boolean {
    const compare = this.compareWith();
    return this.values().some((v) => compare(option.value, v));
  }

  initialsOf(label: string): string {
    const parts = label.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    return ((parts[0][0] ?? '') + (parts.at(-1)?.[0] ?? '')).toUpperCase().slice(0, 2);
  }

  colorOf(label: string): string {
    let hash = 0;
    for (let i = 0; i < label.length; i++) hash = (hash * 31 + label.charCodeAt(i)) | 0;
    return PALETTE[Math.abs(hash) % PALETTE.length];
  }

  onTriggerClick(): void {
    if (this.isDisabled()) return;
    if (!this.multiple() && this.isOpen()) {
      this.close();
      return;
    }
    this.openIfNeeded();
    this.focusInput();
  }

  onWrapperKeydown(event: KeyboardEvent): void {
    if (this.multiple() || this.isOpen() || this.isDisabled()) return;
    if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(event.key)) {
      event.preventDefault();
      this.openIfNeeded();
      this.focusInput();
    }
  }

  openIfNeeded(): void {
    if (this.isDisabled() || this.isOpen()) return;
    if (!this.options().length && !this.hasActionButton()) return;
    this.open();
    if (!this.showAllTab()) {
      const first = this.displayTabs()[0];
      if (first) this.activeTab.set(first.value);
    }
  }

  focusInput(): void {
    this.inputRef()?.nativeElement.focus();
  }

  onQuery(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.activeIndex.set(-1);
    if (!this.isOpen()) this.openIfNeeded();
    else queueMicrotask(() => this.reposition());
  }

  onKeydown(event: KeyboardEvent): void {
    const list = this.visibleOptions();
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
    } else if (event.key === 'Enter') {
      const active = list[this.activeIndex()];
      if (active) {
        event.preventDefault();
        this.toggleOption(active);
      }
    } else if (
      (event.key === 'ArrowLeft' || event.key === 'ArrowRight') &&
      !this.query() &&
      this.displayTabs().length
    ) {
      event.preventDefault();
      const tabs = this.displayTabs();
      const current = tabs.findIndex((t) => t.value === this.activeTab());
      const delta = event.key === 'ArrowRight' ? 1 : -1;
      const next = tabs[(current + delta + tabs.length) % tabs.length];
      this.selectTab(next.value);
    } else if (
      event.key === 'Backspace' &&
      this.multiple() &&
      !this.query() &&
      this.values().length
    ) {
      this.removeAt(this.values().length - 1);
    }
  }

  selectTab(value: unknown): void {
    this.activeTab.set(value);
    this.activeIndex.set(-1);
    this.focusInput();
    queueMicrotask(() => {
      this.reposition();
      this.scrollActiveTabIntoView();
      this.updateTabsOverflow();
    });
  }

  updateTabsOverflow(): void {
    const el = this.tabsListRef()?.nativeElement;
    if (!el) {
      this.canScrollTabsLeft.set(false);
      this.canScrollTabsRight.set(false);
      return;
    }
    const max = el.scrollWidth - el.clientWidth;
    this.canScrollTabsLeft.set(el.scrollLeft > 1);
    this.canScrollTabsRight.set(max - el.scrollLeft > 1);
  }

  scrollTabsBy(dir: 1 | -1): void {
    const el = this.tabsListRef()?.nativeElement;
    el?.scrollBy({ left: dir * el.clientWidth * 0.6, behavior: 'smooth' });
  }

  private scrollActiveTabIntoView(): void {
    const list = this.tabsListRef()?.nativeElement;
    if (!list) return;
    const index = this.displayTabs().findIndex((t) => t.value === this.activeTab());
    const el = list.querySelectorAll<HTMLElement>('[role="tab"]')[index];
    el?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  toggleOption(option: AtmComboboxUserOption): void {
    if (option.disabled || this.isDisabled()) return;
    const compare = this.compareWith();
    if (this.multiple()) {
      if (this.isSelected(option)) {
        this.setValues(this.values().filter((v) => !compare(option.value, v)));
      } else {
        this.setValues([...this.values(), option.value]);
      }
      this.query.set('');
      this.activeIndex.set(-1);
      this.focusInput();
      queueMicrotask(() => this.reposition());
    } else {
      this.setValues([option.value]);
      this.touchedFn();
      this.close();
    }
  }

  removeAt(index: number): void {
    if (this.isDisabled()) return;
    this.setValues(this.values().filter((_, i) => i !== index));
    if (this.isOpen()) queueMicrotask(() => this.reposition());
  }

  clear(event: Event): void {
    event.stopPropagation();
    this.setValues([]);
  }

  onActionClick(): void {
    this.actionClick.emit();
    this.close();
  }

  private setValues(values: unknown[]): void {
    this.values.set(values);
    const out = this.multiple() ? values : (values[0] ?? null);
    this.valueChangeFn(out);
    this.selectionChange.emit(out);
  }
}
