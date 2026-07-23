import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, catchError, debounceTime, of, switchMap, tap } from 'rxjs';
import { ATM_SIZE_HEIGHT, ATM_SIZE_PX, ATM_SIZE_TEXT, AtmSize } from '../../types';
import { AtmOverlayBase } from '../../utils/overlay-base';
import { AtmPaginated, AtmRemoteDataSource } from '../../services/rest.service';
import { AtmSpinner } from '../spinner/spinner.component';

/**
 * Remote (API-driven) dropdown for nest-paginator backends.
 * Pass any service implementing AtmRemoteDataSource (e.g. one extending
 * AtmRestService):
 *
 *   <atm-dropdown-remote
 *     [dataSource]="contactsService"
 *     labelField="name"
 *     valueField="id"
 *     [hasActionButton]="true"
 *     (actionClick)="createContact()"
 *     [(ngModel)]="contactId"
 *   />
 *
 * Loads at most `limit` (default 10) records; further records are reached by
 * typing in the built-in search box (debounced, server-side search).
 */
@Component({
  selector: 'atm-dropdown-remote',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmSpinner],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmDropdownRemote), multi: true },
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
      (click)="toggleOpen()"
    >
      <span class="truncate" [class.text-ink-faint]="!selectedLabel()">
        {{ selectedLabel() ?? placeholder() }}
      </span>
      <span class="ml-auto flex shrink-0 items-center gap-1.5">
        @if (clearable() && selectedLabel() && !isDisabled()) {
          <span
            role="button"
            tabindex="-1"
            class="cursor-pointer text-ink-faint transition-colors hover:text-ink"
            aria-label="Limpar"
            (click)="clear($event)"
          >
            <i class="icofont-close" aria-hidden="true"></i>
          </span>
        }
        <i
          class="icofont-simple-down text-xs text-ink-faint transition-transform duration-200"
          [class.rotate-180]="isOpen()"
          aria-hidden="true"
        ></i>
      </span>
    </button>

    @if (isOpen()) {
      <div
        #panel
        [style]="panelStyle()"
        class="atm-panel animate-atm-pop z-50 flex flex-col overflow-hidden"
        role="listbox"
      >
        <!-- Search -->
        <div class="border-b border-line p-2">
          <div class="atm-field flex h-9 items-center gap-2 px-2.5 text-sm">
            <i class="icofont-ui-search text-xs text-ink-faint" aria-hidden="true"></i>
            <input
              #searchInput
              type="text"
              class="h-full w-full min-w-0 bg-transparent outline-none placeholder:text-ink-faint"
              [placeholder]="searchPlaceholder()"
              [value]="searchTerm()"
              (input)="onSearch($event)"
            />
            @if (loading()) {
              <atm-spinner size="slim" />
            }
          </div>
        </div>

        <!-- Options -->
        <div class="flex-1 overflow-y-auto p-1.5">
          @if (loading() && !items().length) {
            <div class="flex flex-col gap-1 p-1">
              @for (s of [1, 2, 3]; track s) {
                <div class="h-8 animate-pulse rounded-md bg-surface-alt"></div>
              }
            </div>
          } @else {
            @for (item of items(); track trackValue(item)) {
              <button
                type="button"
                class="atm-option py-2"
                [class.atm-option--selected]="trackValue(item) === value()"
                role="option"
                [attr.aria-selected]="trackValue(item) === value()"
                (click)="select(item)"
              >
                <span class="min-w-0 flex-1 truncate">{{ labelOf(item) }}</span>
                @if (trackValue(item) === value()) {
                  <i class="icofont-check-alt shrink-0 text-primary" aria-hidden="true"></i>
                }
              </button>
            } @empty {
              <div class="flex flex-col items-center gap-1 px-3 py-6 text-center">
                <i class="icofont-ui-search text-lg text-ink-faint" aria-hidden="true"></i>
                <span class="text-sm text-ink-faint">
                  {{ error() ? 'Erro ao carregar dados' : 'Nenhum resultado encontrado' }}
                </span>
                @if (error()) {
                  <button
                    type="button"
                    class="cursor-pointer text-xs font-medium text-primary hover:underline"
                    (click)="reload()"
                  >
                    Tentar novamente
                  </button>
                }
              </div>
            }
          }
          @if (totalItems() > items().length && items().length) {
            <div class="px-3 pt-1.5 pb-1 text-center text-[11px] text-ink-faint">
              Mostrando {{ items().length }} de {{ totalItems() }} — refine a pesquisa
            </div>
          }
        </div>

        <!-- Footer action -->
        @if (hasActionButton()) {
          <div class="border-t border-line p-1.5">
            <button
              type="button"
              class="atm-focus flex w-full cursor-pointer items-center justify-center gap-2 rounded-[calc(var(--atm-radius)-4px)]
                px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-primary-soft"
              (click)="onActionClick()"
            >
              <i class="icofont-plus" aria-hidden="true"></i>
              {{ actionButtonLabel() }}
            </button>
          </div>
        }
      </div>
    }
  `,
})
export class AtmDropdownRemote extends AtmOverlayBase implements ControlValueAccessor {
  private readonly destroyRef2 = inject(DestroyRef);

  readonly size = input<AtmSize>('medium');
  /** Service implementing AtmRemoteDataSource (e.g. extends AtmRestService). */
  readonly dataSource = input.required<AtmRemoteDataSource>();
  /** Field shown as label, e.g. 'name'. Also accepts a function. */
  readonly labelField = input<string | ((item: Record<string, unknown>) => string)>('name');
  /** Field used as the bound value, e.g. 'id'. */
  readonly valueField = input<string>('id');
  readonly sortBy = input('id:DESC');
  readonly limit = input(10);
  readonly placeholder = input('Selecione...');
  readonly searchPlaceholder = input('Pesquisar...');
  readonly disabled = input(false);
  readonly invalid = input(false);
  readonly clearable = input(true);
  readonly hasActionButton = input(false);
  readonly actionButtonLabel = input('Adicionar novo');

  readonly actionClick = output<void>();
  /** Emits the full item object when the user selects an option. */
  readonly selectionChange = output<Record<string, unknown> | null>();

  readonly triggerRef = viewChild<ElementRef<HTMLElement>>('trigger');
  readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');
  readonly searchInputRef = viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly items = signal<Record<string, unknown>[]>([]);
  readonly loading = signal(false);
  readonly error = signal(false);
  readonly totalItems = signal(0);
  readonly searchTerm = signal('');
  readonly selectedItem = signal<Record<string, unknown> | null>(null);

  readonly value = signal<unknown>(null);
  readonly disabledByForm = signal(false);
  private valueChangeFn: (v: unknown) => void = () => {};
  private touchedFn: () => void = () => {};

  private readonly search$ = new Subject<string>();
  private loadedOnce = false;

  readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  readonly selectedLabel = computed(() => {
    const item = this.selectedItem();
    return item ? this.labelOf(item) : null;
  });

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

  constructor() {
    super();
    this.search$
      .pipe(
        debounceTime(300),
        tap(() => {
          this.loading.set(true);
          this.error.set(false);
        }),
        switchMap((term) =>
          this.dataSource()
            .list({ page: 1, limit: this.limit(), sortBy: this.sortBy(), search: term || undefined })
            .pipe(
              catchError(() => {
                this.error.set(true);
                return of({
                  data: [],
                  meta: { itemsPerPage: 0, totalItems: 0, currentPage: 1, totalPages: 0 },
                } satisfies AtmPaginated<Record<string, unknown>>);
              }),
            ),
        ),
        takeUntilDestroyed(this.destroyRef2),
      )
      .subscribe((response) => {
        this.items.set(response.data ?? []);
        this.totalItems.set(response.meta?.totalItems ?? response.data?.length ?? 0);
        this.loading.set(false);
        queueMicrotask(() => this.reposition());
      });
  }

  // ControlValueAccessor -------------------------------------------------
  writeValue(value: unknown): void {
    this.value.set(value);
    if (value == null) this.selectedItem.set(null);
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

  // Overlay ---------------------------------------------------------------
  protected getTriggerEl(): HTMLElement | null {
    return this.triggerRef()?.nativeElement ?? null;
  }
  protected getPanelEl(): HTMLElement | null {
    return this.panelRef()?.nativeElement ?? null;
  }

  toggleOpen(): void {
    if (this.isOpen()) {
      this.close();
      return;
    }
    this.open();
    if (!this.loadedOnce) {
      this.loadedOnce = true;
      this.loading.set(true);
      this.search$.next('');
    }
    queueMicrotask(() => this.searchInputRef()?.nativeElement.focus());
  }

  protected override onClosed(): void {
    this.touchedFn();
  }

  // Data ------------------------------------------------------------------
  onSearch(event: Event): void {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm.set(term);
    this.search$.next(term);
  }

  reload(): void {
    this.loading.set(true);
    this.error.set(false);
    this.search$.next(this.searchTerm());
  }

  labelOf(item: Record<string, unknown>): string {
    const field = this.labelField();
    return typeof field === 'function' ? field(item) : String(item[field] ?? '');
  }

  trackValue(item: Record<string, unknown>): unknown {
    return item[this.valueField()];
  }

  select(item: Record<string, unknown>): void {
    const v = this.trackValue(item);
    this.value.set(v);
    this.selectedItem.set(item);
    this.valueChangeFn(v);
    this.selectionChange.emit(item);
    this.close();
  }

  clear(event: Event): void {
    event.stopPropagation();
    this.value.set(null);
    this.selectedItem.set(null);
    this.valueChangeFn(null);
    this.selectionChange.emit(null);
  }

  onActionClick(): void {
    this.actionClick.emit();
    this.close();
  }
}
