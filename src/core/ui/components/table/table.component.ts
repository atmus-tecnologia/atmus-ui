import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnDestroy,
  TemplateRef,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgTemplateOutlet } from '@angular/common';
import { Subject, catchError, of, switchMap, tap } from 'rxjs';
import { AtmSize } from '../../types';
import { atmComputePosition } from '../../utils/position';
import { AtmListQuery, AtmPaginated, AtmRemoteDataSource } from '../../services/rest.service';
import { AtmSkeleton } from '../skeleton/skeleton.component';
import { AtmCheckbox } from '../checkbox/checkbox.component';
import { AtmPagination } from '../pagination/pagination.component';

/** Data type of a column — drives which filter operators are offered. */
export type AtmTableColumnType = 'text' | 'number' | 'date' | 'boolean';

export type AtmTableFilterOperator =
  | 'contains'
  | 'notContains'
  | 'startsWith'
  | 'endsWith'
  | 'equals'
  | 'notEquals'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte';

export interface AtmTableFilter {
  key: string;
  operator: AtmTableFilterOperator;
  value: unknown;
}

export interface AtmTableColumn<T = Record<string, unknown>> {
  /** Row property. Supports dot paths for nested values, e.g. 'company.name'. */
  key: string;
  header: string;
  /** Drives filter operators and local filtering/sorting. Default 'text'. */
  type?: AtmTableColumnType;
  sortable?: boolean;
  /** Shows the filter icon that opens the per-column filter popup. */
  filterable?: boolean;
  /** Column width, e.g. '160px'. Required for good results with `fixed`. */
  width?: string;
  align?: 'left' | 'center' | 'right';
  /** Sticky to the left while scrolling horizontally. Put fixed columns first. */
  fixed?: boolean;
  /** Custom cell renderer. */
  template?: TemplateRef<{ $implicit: T }>;
  /** Value accessor for derived/formatted values (display only). */
  value?: (row: T) => unknown;
  /** Static footer text for this column. */
  footer?: string;
  /** Computed footer (totals, averages…) based on the visible rows. */
  footerValue?: (rows: T[]) => unknown;
  /** Custom footer renderer. Context = visible rows. */
  footerTemplate?: TemplateRef<{ $implicit: T[] }>;
}

export interface AtmSortEvent {
  key: string;
  direction: 'asc' | 'desc';
}

const CELL: Record<AtmSize, string> = {
  large: 'px-4 py-4 text-sm',
  medium: 'px-4 py-3 text-sm',
  slim: 'px-3 py-2 text-xs',
};

const SELECT_COL_WIDTH = 44;
const DEFAULT_FIXED_WIDTH = 150;

interface OperatorOption {
  value: AtmTableFilterOperator;
  label: string;
}

const OPERATORS: Record<AtmTableColumnType, OperatorOption[]> = {
  text: [
    { value: 'contains', label: 'Contém' },
    { value: 'notContains', label: 'Não contém' },
    { value: 'startsWith', label: 'Começa com' },
    { value: 'endsWith', label: 'Termina com' },
    { value: 'equals', label: 'Igual a' },
    { value: 'notEquals', label: 'Diferente de' },
  ],
  number: [
    { value: 'equals', label: 'Igual a' },
    { value: 'notEquals', label: 'Diferente de' },
    { value: 'gt', label: 'Maior que' },
    { value: 'gte', label: 'Maior ou igual' },
    { value: 'lt', label: 'Menor que' },
    { value: 'lte', label: 'Menor ou igual' },
  ],
  date: [
    { value: 'equals', label: 'Igual a' },
    { value: 'gte', label: 'A partir de' },
    { value: 'gt', label: 'Depois de' },
    { value: 'lte', label: 'Até' },
    { value: 'lt', label: 'Antes de' },
  ],
  boolean: [{ value: 'equals', label: 'Igual a' }],
};

/** nest-paginator (nestjs-paginate) filter param builders: filter.<key>=$op:value */
const REMOTE_OP: Record<AtmTableFilterOperator, (v: string) => string> = {
  contains: (v) => `$ilike:${v}`,
  notContains: (v) => `$not:$ilike:${v}`,
  startsWith: (v) => `$sw:${v}`,
  // nestjs-paginate has no endsWith — fall back to $ilike
  endsWith: (v) => `$ilike:${v}`,
  equals: (v) => `$eq:${v}`,
  notEquals: (v) => `$not:$eq:${v}`,
  gt: (v) => `$gt:${v}`,
  gte: (v) => `$gte:${v}`,
  lt: (v) => `$lt:${v}`,
  lte: (v) => `$lte:${v}`,
};

function resolvePath(obj: unknown, path: string): unknown {
  if (obj == null) return undefined;
  if (!path.includes('.')) return (obj as Record<string, unknown>)[path];
  return path
    .split('.')
    .reduce<unknown>((acc, k) => (acc == null ? undefined : (acc as Record<string, unknown>)[k]), obj);
}

function parseWidth(width: string | undefined): number {
  const n = parseFloat(width ?? '');
  return Number.isNaN(n) ? DEFAULT_FIXED_WIDTH : n;
}

function matchFilter(raw: unknown, filter: AtmTableFilter, type: AtmTableColumnType): boolean {
  if (filter.value === '' || filter.value == null) return true;

  if (type === 'boolean') {
    const rowBool = raw === true || raw === 'true' || raw === 1;
    const filterBool = filter.value === true || filter.value === 'true';
    return rowBool === filterBool;
  }

  if (type === 'number' || type === 'date') {
    const a = type === 'number' ? Number(raw) : new Date(String(raw)).getTime();
    const b = type === 'number' ? Number(filter.value) : new Date(String(filter.value)).getTime();
    if (Number.isNaN(a) || Number.isNaN(b)) return false;
    switch (filter.operator) {
      case 'equals':
        return type === 'date'
          ? new Date(String(raw)).toDateString() === new Date(String(filter.value)).toDateString()
          : a === b;
      case 'notEquals':
        return a !== b;
      case 'gt':
        return a > b;
      case 'gte':
        return a >= b;
      case 'lt':
        return a < b;
      case 'lte':
        return a <= b;
      default:
        return true;
    }
  }

  const s = String(raw ?? '').toLowerCase();
  const v = String(filter.value).toLowerCase();
  switch (filter.operator) {
    case 'contains':
      return s.includes(v);
    case 'notContains':
      return !s.includes(v);
    case 'startsWith':
      return s.startsWith(v);
    case 'endsWith':
      return s.endsWith(v);
    case 'equals':
      return s === v;
    case 'notEquals':
      return s !== v;
    default:
      return true;
  }
}

const EMPTY_PAGE: AtmPaginated<Record<string, unknown>> = {
  data: [],
  meta: { itemsPerPage: 0, totalItems: 0, currentPage: 1, totalPages: 0 },
};

/**
 * Data table with sorting, per-column filters (operator based on column type),
 * row selection, fixed (sticky) columns, loading skeleton, built-in pagination
 * (client-side or API driven), scrollable body and per-column footer.
 *
 * Local data:
 *   <atm-table [columns]="cols" [rows]="rows" [paginator]="true" [pageSize]="10" />
 *
 * Remote data (nest-paginator via AtmRemoteDataSource):
 *   <atm-table [columns]="cols" [dataSource]="usersService" [paginator]="true" />
 *
 * Manual server-side (you fetch, table only emits events):
 *   <atm-table [columns]="cols" [rows]="pageRows" [serverSide]="true"
 *              [totalItems]="total" [paginator]="true"
 *              (queryChange)="load($event)" />
 */
@Component({
  selector: 'atm-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, AtmSkeleton, AtmCheckbox, AtmPagination],
  host: { class: 'block w-full' },
  template: `
    <div class="overflow-hidden rounded-atm-lg border border-line bg-surface">
      <!-- Scroll area: only header + rows + footer live here; pagination stays out -->
      <div
        class="overflow-x-auto"
        [class.overflow-y-auto]="scrollable()"
        [style.max-height]="scrollable() ? scrollHeight() : null"
      >
        <table class="w-full border-separate border-spacing-0 text-left">
          <thead>
            <tr>
              @if (selectable()) {
                <th [class]="selectHeadClass()" [style.width.px]="selectColWidth">
                  <atm-checkbox
                    size="slim"
                    [checked]="allSelected()"
                    [indeterminate]="someSelected() && !allSelected()"
                    (changed)="toggleAll($event)"
                  />
                </th>
              }
              @for (col of columns(); track col.key) {
                <th
                  [class]="headerCellClass(col)"
                  [style.width]="col.width ?? null"
                  [style.min-width]="col.width ?? null"
                  [style.left.px]="col.fixed ? fixedLeft()[col.key] : null"
                >
                  <div class="flex items-center gap-1.5" [style.justify-content]="justify(col)">
                    @if (col.sortable) {
                      <button
                        type="button"
                        class="inline-flex cursor-pointer items-center gap-1.5 transition-colors hover:text-ink"
                        (click)="sort(col)"
                      >
                        {{ col.header }}
                        <span class="inline-flex flex-col text-[8px] leading-[7px]">
                          <i
                            class="icofont-simple-up"
                            [class]="sortKey() === col.key && sortDir() === 'asc' ? 'text-primary' : 'text-ink-faint'"
                            aria-hidden="true"
                          ></i>
                          <i
                            class="icofont-simple-down"
                            [class]="sortKey() === col.key && sortDir() === 'desc' ? 'text-primary' : 'text-ink-faint'"
                            aria-hidden="true"
                          ></i>
                        </span>
                      </button>
                    } @else {
                      <span>{{ col.header }}</span>
                    }
                    @if (col.filterable) {
                      <button
                        type="button"
                        [class]="
                          'atm-focus inline-flex size-5 shrink-0 cursor-pointer items-center justify-center rounded transition-colors ' +
                          (isFiltered(col.key)
                            ? 'bg-primary-soft text-primary'
                            : 'text-ink-faint hover:bg-surface hover:text-ink')
                        "
                        [attr.aria-label]="'Filtrar ' + col.header"
                        [attr.aria-expanded]="filterCol()?.key === col.key"
                        (click)="openFilter($event, col)"
                      >
                        <i class="icofont-filter text-[11px]" aria-hidden="true"></i>
                      </button>
                    }
                  </div>
                </th>
              }
            </tr>
          </thead>
          <tbody>
            @if (isLoading()) {
              @for (r of skeletonRows(); track r) {
                <tr class="last:*:border-b-0">
                  @if (selectable()) {
                    <td [class]="selectCellClass(false)">
                      <atm-skeleton height="1rem" width="1rem" shape="rect" />
                    </td>
                  }
                  @for (col of columns(); track col.key) {
                    <td
                      [class]="bodyCellClass(col, false)"
                      [style.left.px]="col.fixed ? fixedLeft()[col.key] : null"
                    >
                      <atm-skeleton height="0.875rem" [width]="60 + ((r * 17 + col.key.length * 13) % 30) + '%'" />
                    </td>
                  }
                </tr>
              }
            } @else {
              @for (row of displayRows(); track trackRow($index, row)) {
                <tr
                  [class]="rowClass(row)"
                  (click)="clickableRows() && rowClick.emit(row)"
                >
                  @if (selectable()) {
                    <td [class]="selectCellClass(isSelected(row))" (click)="$event.stopPropagation()">
                      <atm-checkbox
                        size="slim"
                        [checked]="isSelected(row)"
                        (changed)="toggleRow(row, $event)"
                      />
                    </td>
                  }
                  @for (col of columns(); track col.key) {
                    <td
                      [class]="bodyCellClass(col, isSelected(row))"
                      [style.text-align]="col.align ?? 'left'"
                      [style.left.px]="col.fixed ? fixedLeft()[col.key] : null"
                    >
                      @if (col.template) {
                        <ng-container
                          [ngTemplateOutlet]="col.template"
                          [ngTemplateOutletContext]="{ $implicit: row }"
                        />
                      } @else {
                        {{ cellValue(row, col) }}
                      }
                    </td>
                  }
                </tr>
              } @empty {
                <tr>
                  <td [attr.colspan]="colCount()" class="px-4 py-12 text-center">
                    <div class="flex flex-col items-center gap-2 text-ink-faint">
                      @if (remoteError()) {
                        <i class="icofont-warning-alt text-3xl" aria-hidden="true"></i>
                        <span class="text-sm">Erro ao carregar dados</span>
                        <button
                          type="button"
                          class="cursor-pointer text-xs font-medium text-primary hover:underline"
                          (click)="reload()"
                        >
                          Tentar novamente
                        </button>
                      } @else {
                        <i class="icofont-file-document text-3xl" aria-hidden="true"></i>
                        <span class="text-sm">{{ emptyMessage() }}</span>
                      }
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
          @if (hasFooter()) {
            <tfoot>
              <tr>
                @if (selectable()) {
                  <td [class]="footerCellClass(null)"></td>
                }
                @for (col of columns(); track col.key) {
                  <td
                    [class]="footerCellClass(col)"
                    [style.text-align]="col.align ?? 'left'"
                    [style.left.px]="col.fixed ? fixedLeft()[col.key] : null"
                  >
                    @if (col.footerTemplate) {
                      <ng-container
                        [ngTemplateOutlet]="col.footerTemplate"
                        [ngTemplateOutletContext]="{ $implicit: displayRows() }"
                      />
                    } @else if (col.footerValue) {
                      {{ col.footerValue(displayRows()) }}
                    } @else {
                      {{ col.footer ?? '' }}
                    }
                  </td>
                }
              </tr>
            </tfoot>
          }
        </table>
      </div>

      @if (paginator()) {
        <div class="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-2.5">
          <span class="text-xs text-ink-muted">
            @if (total() > 0) {
              Mostrando {{ rangeStart() }}–{{ rangeEnd() }} de {{ total() }}
            } @else {
              0 registros
            }
          </span>
          <atm-pagination
            size="slim"
            [totalItems]="total()"
            [pageSize]="pageSize()"
            [page]="page()"
            (pageChange)="page.set($event)"
          />
        </div>
      }
    </div>

    <!-- Per-column filter popup -->
    @if (filterCol(); as col) {
      <div
        #filterPanel
        [style]="filterPanelStyle()"
        class="atm-panel animate-atm-pop z-50 flex w-64 flex-col gap-2 p-3"
        role="dialog"
        [attr.aria-label]="'Filtrar ' + col.header"
      >
        <span class="text-xs font-semibold text-ink-muted">Filtrar — {{ col.header }}</span>
        @if (typeOf(col) === 'boolean') {
          <select
            class="atm-field h-9 w-full cursor-pointer px-2.5 text-sm"
            [value]="draftValue()"
            (change)="draftValue.set($any($event.target).value)"
          >
            <option value="">Todos</option>
            <option value="true" [selected]="draftValue() === 'true'">Sim</option>
            <option value="false" [selected]="draftValue() === 'false'">Não</option>
          </select>
        } @else {
          <select
            class="atm-field h-9 w-full cursor-pointer px-2.5 text-sm"
            [value]="draftOp()"
            (change)="draftOp.set($any($event.target).value)"
          >
            @for (op of operatorsFor(col); track op.value) {
              <option [value]="op.value" [selected]="op.value === draftOp()">{{ op.label }}</option>
            }
          </select>
          <input
            [type]="inputTypeFor(col)"
            class="atm-field h-9 w-full px-2.5 text-sm"
            placeholder="Valor..."
            [value]="draftValue()"
            (input)="draftValue.set($any($event.target).value)"
            (keydown.enter)="applyFilter()"
          />
        }
        <div class="flex justify-end gap-1.5 pt-1">
          <button
            type="button"
            class="atm-focus h-8 cursor-pointer rounded-atm px-3 text-xs font-medium text-ink-muted
              transition-colors hover:bg-surface-alt hover:text-ink"
            (click)="clearFilter()"
          >
            Limpar
          </button>
          <button
            type="button"
            class="atm-focus h-8 cursor-pointer rounded-atm bg-primary px-3 text-xs font-medium
              text-primary-contrast shadow-sm transition-colors hover:bg-primary-hover"
            (click)="applyFilter()"
          >
            Aplicar
          </button>
        </div>
      </div>
    }
  `,
})
export class AtmTable<T extends Record<string, unknown> = Record<string, unknown>>
  implements OnDestroy
{
  private readonly cdr = inject(ChangeDetectorRef);

  readonly size = input<AtmSize>('medium');
  readonly columns = input<AtmTableColumn<T>[]>([]);
  readonly rows = input<T[]>([]);
  readonly loading = input(false);
  readonly loadingRows = input(5);
  readonly emptyMessage = input('Nenhum registro encontrado');
  readonly clickableRows = input(false);
  readonly trackBy = input<string>('id');

  /** Shows the checkbox column + select-all. Selected rows via [(selection)]. */
  readonly selectable = input(false);
  readonly selection = model<T[]>([]);

  /** Scrolls only the records area (header/footer stay visible). */
  readonly scrollable = input(false);
  readonly scrollHeight = input('400px');

  /** Built-in pagination bar. Client-side for local rows, server-side otherwise. */
  readonly paginator = input(false);
  readonly pageSize = input(10);
  readonly page = model(1);
  /** Total records — only needed in manual [serverSide] mode. */
  readonly totalItems = input(0);
  /** Rows are already the current page; table only emits (queryChange). */
  readonly serverSide = input(false);

  /** nest-paginator data source — the table fetches pages/sort/filters itself. */
  readonly dataSource = input<AtmRemoteDataSource<T> | undefined>(undefined);
  readonly autoLoad = input(true);

  readonly sortChange = output<AtmSortEvent>();
  readonly rowClick = output<T>();
  readonly filterChange = output<AtmTableFilter[]>();
  /** Full nest-paginator query — emitted whenever page/sort/filters change. */
  readonly queryChange = output<AtmListQuery>();

  readonly filterPanelRef = viewChild<ElementRef<HTMLElement>>('filterPanel');

  readonly sortKey = signal<string | null>(null);
  readonly sortDir = signal<'asc' | 'desc'>('asc');
  readonly filters = signal<Map<string, AtmTableFilter>>(new Map());

  // Filter popup state
  readonly filterCol = signal<AtmTableColumn<T> | null>(null);
  readonly filterPanelStyle = signal<Record<string, string>>({});
  readonly draftOp = signal<AtmTableFilterOperator>('contains');
  readonly draftValue = signal('');

  // Remote state
  readonly remoteRows = signal<T[]>([]);
  readonly remoteTotal = signal(0);
  readonly remoteLoading = signal(false);
  readonly remoteError = signal(false);

  readonly selectColWidth = SELECT_COL_WIDTH;

  private readonly load$ = new Subject<AtmListQuery>();
  private filterCleanup: Array<() => void> = [];

  readonly isRemote = computed(() => !!this.dataSource());
  readonly isLoading = computed(() => this.loading() || this.remoteLoading());
  readonly cellClasses = computed(() => CELL[this.size()]);
  readonly colCount = computed(() => this.columns().length + (this.selectable() ? 1 : 0));
  readonly skeletonRows = computed(() => Array.from({ length: this.loadingRows() }, (_, i) => i));
  readonly hasFixed = computed(() => this.columns().some((c) => c.fixed));
  readonly lastFixedKey = computed(() => {
    const fixed = this.columns().filter((c) => c.fixed);
    return fixed.length ? fixed[fixed.length - 1].key : null;
  });
  readonly hasFooter = computed(() =>
    this.columns().some((c) => c.footer !== undefined || c.footerValue || c.footerTemplate),
  );

  /** Cumulative left offsets for sticky (fixed) columns. */
  readonly fixedLeft = computed<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    if (!this.hasFixed()) return map;
    let left = this.selectable() ? SELECT_COL_WIDTH : 0;
    for (const col of this.columns()) {
      if (!col.fixed) continue;
      map[col.key] = left;
      left += parseWidth(col.width);
    }
    return map;
  });

  private readonly filteredRows = computed(() => {
    const active = Array.from(this.filters().values());
    if (!active.length) return this.rows();
    const colByKey = new Map(this.columns().map((c) => [c.key, c]));
    return this.rows().filter((row) =>
      active.every((f) => matchFilter(this.rawValue(row, f.key), f, colByKey.get(f.key)?.type ?? 'text')),
    );
  });

  private readonly sortedRows = computed(() => {
    const rows = this.filteredRows();
    const key = this.sortKey();
    if (!key) return rows;
    const dir = this.sortDir() === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const av = this.rawValue(a, key);
      const bv = this.rawValue(b, key);
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * dir;
      return String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true }) * dir;
    });
  });

  /** Rows currently rendered (after filter/sort/pagination or remote page). */
  readonly displayRows = computed(() => {
    if (this.isRemote()) return this.remoteRows();
    if (this.serverSide()) return this.rows();
    const rows = this.sortedRows();
    if (!this.paginator()) return rows;
    const start = (this.page() - 1) * this.pageSize();
    return rows.slice(start, start + this.pageSize());
  });

  readonly total = computed(() => {
    if (this.isRemote()) return this.remoteTotal();
    if (this.serverSide()) return this.totalItems();
    return this.filteredRows().length;
  });

  readonly rangeStart = computed(() =>
    this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1,
  );
  readonly rangeEnd = computed(() => Math.min(this.page() * this.pageSize(), this.total()));

  readonly allSelected = computed(() => {
    const rows = this.displayRows();
    return rows.length > 0 && rows.every((r) => this.isSelected(r));
  });
  readonly someSelected = computed(() => this.displayRows().some((r) => this.isSelected(r)));

  constructor() {
    this.load$
      .pipe(
        tap(() => {
          this.remoteLoading.set(true);
          this.remoteError.set(false);
        }),
        switchMap((query) =>
          this.dataSource()!
            .list(query)
            .pipe(
              catchError(() => {
                this.remoteError.set(true);
                return of(EMPTY_PAGE as AtmPaginated<T>);
              }),
            ),
        ),
        takeUntilDestroyed(),
      )
      .subscribe((res) => {
        this.remoteRows.set(res.data ?? []);
        this.remoteTotal.set(res.meta?.totalItems ?? res.data?.length ?? 0);
        this.remoteLoading.set(false);
      });

    // Reloads (remote) / re-emits the query whenever page, sort or filters change.
    let first = true;
    effect(() => {
      const ds = this.dataSource();
      const server = this.serverSide();
      const query = this.buildQuery(); // tracks page/pageSize/sort/filters
      if (!ds && !server) {
        first = false;
        return;
      }
      const skipLoad = first && !this.autoLoad();
      first = false;
      untracked(() => {
        this.queryChange.emit(query);
        if (ds && !skipLoad) this.load$.next(query);
      });
    });
  }

  // Data helpers ----------------------------------------------------------
  trackRow(index: number, row: T): unknown {
    return row[this.trackBy()] ?? index;
  }

  /** Display value (uses col.value formatter when provided). */
  cellValue(row: T, col: AtmTableColumn<T>): unknown {
    return col.value ? col.value(row) : resolvePath(row, col.key);
  }

  /** Raw value (dot-path aware) — used by sorting/filtering. */
  private rawValue(row: T, key: string): unknown {
    return resolvePath(row, key);
  }

  sort(col: AtmTableColumn<T>): void {
    if (this.sortKey() === col.key) {
      this.sortDir.update((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      this.sortKey.set(col.key);
      this.sortDir.set('asc');
    }
    this.sortChange.emit({ key: col.key, direction: this.sortDir() });
  }

  /** Re-fetches the current page (remote mode). */
  reload(): void {
    if (this.isRemote()) this.load$.next(this.buildQuery());
  }

  private buildQuery(): AtmListQuery {
    const query: AtmListQuery = { page: this.page(), limit: this.pageSize() };
    const key = this.sortKey();
    if (key) query.sortBy = `${key}:${this.sortDir().toUpperCase()}`;
    for (const f of this.filters().values()) {
      query[`filter.${f.key}`] = REMOTE_OP[f.operator](String(f.value));
    }
    return query;
  }

  // Selection ---------------------------------------------------------------
  private keyOf(row: T): unknown {
    return row[this.trackBy()] ?? row;
  }

  isSelected(row: T): boolean {
    const key = this.keyOf(row);
    return this.selection().some((r) => this.keyOf(r) === key);
  }

  toggleRow(row: T, checked: boolean): void {
    if (checked) {
      if (!this.isSelected(row)) this.selection.set([...this.selection(), row]);
    } else {
      const key = this.keyOf(row);
      this.selection.set(this.selection().filter((r) => this.keyOf(r) !== key));
    }
  }

  toggleAll(checked: boolean): void {
    const rows = this.displayRows();
    if (checked) {
      const missing = rows.filter((r) => !this.isSelected(r));
      this.selection.set([...this.selection(), ...missing]);
    } else {
      const keys = new Set(rows.map((r) => this.keyOf(r)));
      this.selection.set(this.selection().filter((r) => !keys.has(this.keyOf(r))));
    }
  }

  // Filters -----------------------------------------------------------------
  typeOf(col: AtmTableColumn<T>): AtmTableColumnType {
    return col.type ?? 'text';
  }

  isFiltered(key: string): boolean {
    return this.filters().has(key);
  }

  operatorsFor(col: AtmTableColumn<T>): OperatorOption[] {
    return OPERATORS[this.typeOf(col)];
  }

  inputTypeFor(col: AtmTableColumn<T>): string {
    const type = this.typeOf(col);
    return type === 'number' ? 'number' : type === 'date' ? 'date' : 'text';
  }

  openFilter(event: MouseEvent, col: AtmTableColumn<T>): void {
    event.stopPropagation();
    if (this.filterCol()?.key === col.key) {
      this.closeFilter();
      return;
    }
    this.closeFilter();

    const existing = this.filters().get(col.key);
    this.draftOp.set(
      (existing?.operator as AtmTableFilterOperator) ?? this.operatorsFor(col)[0].value,
    );
    this.draftValue.set(existing != null ? String(existing.value) : '');

    // Park off-flow, render synchronously, measure, then position (viewport-aware).
    this.filterPanelStyle.set({ position: 'fixed', top: '0px', left: '0px', visibility: 'hidden' });
    this.filterCol.set(col);
    this.cdr.detectChanges();

    const trigger = (event.currentTarget as HTMLElement).getBoundingClientRect();
    const panel = this.filterPanelRef()?.nativeElement;
    if (panel) {
      const result = atmComputePosition(
        trigger,
        { width: panel.offsetWidth, height: panel.offsetHeight },
        { placement: 'bottom', align: 'end' },
      );
      this.filterPanelStyle.set({
        position: 'fixed',
        top: `${result.top}px`,
        left: `${result.left}px`,
      });
      queueMicrotask(() =>
        panel.querySelector<HTMLElement>('input, select')?.focus(),
      );
    }
    this.attachFilterListeners();
  }

  closeFilter(): void {
    if (!this.filterCol()) return;
    this.filterCol.set(null);
    this.detachFilterListeners();
  }

  applyFilter(): void {
    const col = this.filterCol();
    if (!col) return;
    const value = this.draftValue().trim();
    const map = new Map(this.filters());
    if (value === '') {
      map.delete(col.key);
    } else {
      const parsed: unknown = this.typeOf(col) === 'boolean' ? value === 'true' : value;
      map.set(col.key, { key: col.key, operator: this.draftOp(), value: parsed });
    }
    this.filters.set(map);
    this.page.set(1);
    this.filterChange.emit([...map.values()]);
    this.closeFilter();
  }

  clearFilter(): void {
    this.draftValue.set('');
    this.applyFilter();
  }

  private attachFilterListeners(): void {
    const onPointerDown = (event: PointerEvent) => {
      const panel = this.filterPanelRef()?.nativeElement;
      if (panel && !panel.contains(event.target as Node)) this.closeFilter();
    };
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') this.closeFilter();
    };
    // Delay registration so the opening click doesn't immediately close it.
    const timer = setTimeout(() => {
      document.addEventListener('pointerdown', onPointerDown, true);
    });
    document.addEventListener('keydown', onKeydown);
    this.filterCleanup.push(() => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', onPointerDown, true);
      document.removeEventListener('keydown', onKeydown);
    });
  }

  private detachFilterListeners(): void {
    this.filterCleanup.forEach((fn) => fn());
    this.filterCleanup = [];
  }

  ngOnDestroy(): void {
    this.detachFilterListeners();
  }

  // Style helpers -----------------------------------------------------------
  justify(col: AtmTableColumn<T>): string {
    return col.align === 'center' ? 'center' : col.align === 'right' ? 'flex-end' : 'flex-start';
  }

  headerCellClass(col: AtmTableColumn<T>): string {
    const parts = [
      this.cellClasses(),
      'bg-surface-alt font-semibold text-ink-muted whitespace-nowrap border-b border-line',
    ];
    if (this.scrollable()) parts.push('sticky top-0');
    if (col.fixed) parts.push('sticky');
    if (col.fixed && this.scrollable()) parts.push('z-30');
    else if (col.fixed || this.scrollable()) parts.push('z-20');
    if (col.key === this.lastFixedKey()) parts.push('border-r');
    return parts.join(' ');
  }

  bodyCellClass(col: AtmTableColumn<T>, selected: boolean): string {
    const parts = [this.cellClasses(), 'border-b border-line text-ink'];
    if (col.fixed) {
      parts.push('sticky z-10');
      parts.push(selected ? 'bg-primary-soft' : 'bg-surface group-hover:bg-surface-alt');
      if (col.key === this.lastFixedKey()) parts.push('border-r');
    }
    return parts.join(' ');
  }

  selectHeadClass(): string {
    const parts = [this.cellClasses(), 'bg-surface-alt border-b border-line'];
    if (this.scrollable()) parts.push('sticky top-0');
    if (this.hasFixed()) parts.push('sticky left-0');
    if (this.hasFixed() && this.scrollable()) parts.push('z-30');
    else if (this.hasFixed() || this.scrollable()) parts.push('z-20');
    return parts.join(' ');
  }

  selectCellClass(selected: boolean): string {
    const parts = [this.cellClasses(), 'border-b border-line'];
    if (this.hasFixed()) {
      parts.push('sticky left-0 z-10');
      parts.push(selected ? 'bg-primary-soft' : 'bg-surface group-hover:bg-surface-alt');
    }
    return parts.join(' ');
  }

  footerCellClass(col: AtmTableColumn<T> | null): string {
    const parts = [
      this.cellClasses(),
      'bg-surface-alt border-t border-line font-semibold text-ink whitespace-nowrap',
    ];
    if (this.scrollable()) parts.push('sticky bottom-0');
    const fixed = col ? !!col.fixed : this.hasFixed();
    if (fixed) parts.push(col ? 'sticky' : 'sticky left-0');
    if (fixed && this.scrollable()) parts.push('z-30');
    else if (fixed || this.scrollable()) parts.push('z-20');
    if (col && col.key === this.lastFixedKey()) parts.push('border-r');
    return parts.join(' ');
  }

  rowClass(row: T): string {
    return (
      'group transition-colors last:*:border-b-0 ' +
      (this.isSelected(row) ? 'bg-primary-soft/40 ' : 'hover:bg-surface-alt/50 ') +
      (this.clickableRows() ? 'cursor-pointer' : '')
    );
  }
}
