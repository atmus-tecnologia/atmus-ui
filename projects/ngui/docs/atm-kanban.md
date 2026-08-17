# atm-kanban

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/kanban/kanban.component.ts`

## Purpose

Quadro Kanban com colunas, cards e drag-and-drop.

## Notes from source

A label/tag shown on a kanban card. */
export interface AtmKanbanLabel {
  text: string;
  color?: AtmColor;
}

/** A person assigned to a card (feeds the avatar group). */
export interface AtmKanbanAssignee {
  name: string;
  src?: string;
}

/** A single card inside a kanban column. */
export interface AtmKanbanCard {
  id: string;
  title: string;
  description?: string;
  cover?: string;
  labels?: AtmKanbanLabel[];
  assignees?: AtmKanbanAssignee[];
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  /** Free-form payload for the host app. */
  meta?: Record<string, unknown>;
}

/** A column (lane) holding a list of cards. */
export interface AtmKanbanColumn {
  id: string;
  title: string;
  /** Accent color for the column header. */
  color?: AtmColor;
  cards: AtmKanbanCard[];
  /** Optional WIP limit — highlights the count in red when exceeded. */
  limit?: number;
}

/** Emitted whenever a card is dropped in a (possibly) new position. */
export interface AtmKanbanMoveEvent {
  card: AtmKanbanCard;
  fromColumnId: string;
  toColumnId: string;
  toIndex: number;
}

/** Emitted whenever a column is dropped in a new position. */
export interface AtmKanbanColumnReorderEvent {
  column: AtmKanbanColumn;
  fromIndex: number;
  toIndex: number;
}

interface DragState {
  columnId: string;
  cardId: string;
}

interface ColumnDragState {
  columnId: string;
  index: number;
}

const DOT: Record<AtmColor, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-ink-faint',
};

const LABEL: Record<AtmColor, string> = {
  primary: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  neutral: 'bg-surface-alt text-ink-muted',
};

const PRIORITY: Record<'low' | 'medium' | 'high', { icon: string; class: string; label: string }> = {
  low: { icon: 'icofont-arrow-down', class: 'text-info', label: 'Baixa' },
  medium: { icon: 'icofont-minus', class: 'text-warning', label: 'Média' },
  high: { icon: 'icofont-arrow-up', class: 'text-danger', label: 'Alta' },
};

/**Reusable Kanban board with native drag & drop between columns.  <atm-kanban [(columns)]="columns" (cardMove)="onMove($event)" />Provide a custom card body with an `<ng-template #card>`.Context: `$implicit` (card), `column` and `index`:  <atm-kanban [(columns)]="columns">    <ng-template #card let-card let-column="column">{{ card.title }}</ng-template>  </atm-kanban>- `[scrollable]` (default true): horizontal scroll with fixed-width columns.  When false, columns shrink/grow to fit the available width.- `[allowColumnReorder]` (default false): drag column headers to reorder,  emitting `(columnReorder)`.

## Identity

- **Class**: `AtmKanban`
- **Selector**: `atm-kanban`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `allowAdd` | boolean | no | true |
| `allowAddColumn` | boolean | no | false |
| `allowColumnReorder` | boolean | no | false |
| `scrollable` | boolean | no | true |

## Outputs

| Name | Payload |
| --- | --- |
| `cardMove` | AtmKanbanMoveEvent |
| `cardClick` | AtmKanbanCard |
| `addCard` | AtmKanbanColumn |
| `addColumn` | void |
| `columnReorder` | AtmKanbanColumnReorderEvent |

## Models (two-way)

| Name | Type | Default |
| --- | --- | --- |
| `columns` | AtmKanbanColumn[] | [] |

## Related interfaces / types

### AtmKanbanLabel

```ts
export interface AtmKanbanLabel {
  text: string;
  color?: AtmColor;
}
```

### AtmKanbanAssignee

```ts
export interface AtmKanbanAssignee {
  name: string;
  src?: string;
}
```

### AtmKanbanCard

```ts
export interface AtmKanbanCard {
  id: string;
  title: string;
  description?: string;
  cover?: string;
  labels?: AtmKanbanLabel[];
  assignees?: AtmKanbanAssignee[];
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
  /** Free-form payload for the host app. */
  meta?: Record<string, unknown>;
}
```

### AtmKanbanColumn

```ts
export interface AtmKanbanColumn {
  id: string;
  title: string;
  /** Accent color for the column header. */
  color?: AtmColor;
  cards: AtmKanbanCard[];
  /** Optional WIP limit — highlights the count in red when exceeded. */
  limit?: number;
}
```

### AtmKanbanMoveEvent

```ts
export interface AtmKanbanMoveEvent {
  card: AtmKanbanCard;
  fromColumnId: string;
  toColumnId: string;
  toIndex: number;
}
```

### AtmKanbanColumnReorderEvent

```ts
export interface AtmKanbanColumnReorderEvent {
  column: AtmKanbanColumn;
  fromIndex: number;
  toIndex: number;
}
```

## Usage example

```html
<atm-kanban [columns]="cols" [(cards)]="cards" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
