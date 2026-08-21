# atm-table

> Doc otimizada para LLMs. Fonte: `src/core/ui/components/table/table.component.ts`

## Purpose

Tabela rica: sort, filter, seleção, templates, paginação e remote dataSource.

## Notes from source

Data type of a column — drives which filter operators are offered. */
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
Data table with sorting, per-column filters (operator based on column type),
row selection, fixed (sticky) columns, loading skeleton, built-in pagination
(client-side or API driven), scrollable body and per-column footer.
Local data:
  <atm-table [columns]="cols" [rows]="rows" [paginator]="true" [pageSize]="10" />
Remote data (nest-paginator via AtmRemoteDataSource):
  <atm-table [columns]="cols" [dataSource]="usersService" [paginator]="true" />
Manual server-side (you fetch, table only emits events):
  <atm-table [columns]="cols" [rows]="pageRows" [serverSide]="true"
             [totalItems]="total" [paginator]="true"
             (queryChange)="load($event)" />

## Identity

- **Class**: `AtmTable`
- **Selector**: `atm-table`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `columns` | AtmTableColumn<T>[] | no | [] |
| `rows` | T[] | no | [] |
| `loading` | boolean | no | false |
| `loadingRows` | number | no | 5 |
| `emptyMessage` | string | no | 'Nenhum registro encontrado' |
| `clickableRows` | boolean | no | false |
| `trackBy` | string | no | 'id' |
| `selectable` | boolean | no | false |
| `scrollable` | boolean | no | false |
| `scrollHeight` | string | no | '400px' |
| `paginator` | boolean | no | false |
| `pageSize` | number | no | 10 |
| `totalItems` | number | no | 0 |
| `serverSide` | boolean | no | false |
| `dataSource` | AtmRemoteDataSource<T> \| undefined | no | undefined |
| `autoLoad` | boolean | no | true |

## Outputs

| Name | Payload |
| --- | --- |
| `sortChange` | AtmSortEvent |
| `rowClick` | T |
| `filterChange` | AtmTableFilter[] |
| `queryChange` | AtmListQuery |

## Models (two-way)

| Name | Type | Default |
| --- | --- | --- |
| `selection` | T[] | [] |
| `page` | inferred | 1 |

## Related interfaces / types

### AtmTableColumnType

```ts
export type AtmTableColumnType = 'text' | 'number' | 'date' | 'boolean';
```

### AtmTableFilterOperator

```ts
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
```

### AtmTableFilter

```ts
export interface AtmTableFilter {
  key: string;
  operator: AtmTableFilterOperator;
  value: unknown;
}
```

### AtmTableColumn

```ts
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
```

### AtmSortEvent

```ts
export interface AtmSortEvent {
  key: string;
  direction: 'asc' | 'desc';
}
```

## Usage example

```html
<atm-table [columns]="cols" [rows]="rows" [selectable]="true" [(selection)]="sel" />
```

## Tips

Colunas AtmTableColumn. Remote usa AtmRemoteDataSource (nest-paginator).

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
