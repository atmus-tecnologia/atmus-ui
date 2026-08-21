import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  contentChild,
  input,
  model,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { AtmColor } from '../../types';
import { AtmAvatarGroup } from '../avatar/avatar-group.component';

/** A label/tag shown on a kanban card. */
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
  low: { icon: 'atm atm-arrow-down-02', class: 'text-info', label: 'Baixa' },
  medium: { icon: 'atm atm-minus-sign', class: 'text-warning', label: 'Média' },
  high: { icon: 'atm atm-arrow-up-02', class: 'text-danger', label: 'Alta' },
};

/**
 * Reusable Kanban board with native drag & drop between columns.
 *
 *   <atm-kanban [(columns)]="columns" (cardMove)="onMove($event)" />
 *
 * Provide a custom card body with an `<ng-template #card>`.
 * Context: `$implicit` (card), `column` and `index`:
 *
 *   <atm-kanban [(columns)]="columns">
 *     <ng-template #card let-card let-column="column">{{ card.title }}</ng-template>
 *   </atm-kanban>
 *
 * - `[scrollable]` (default true): horizontal scroll with fixed-width columns.
 *   When false, columns shrink/grow to fit the available width.
 * - `[allowColumnReorder]` (default false): drag column headers to reorder,
 *   emitting `(columnReorder)`.
 */
@Component({
  selector: 'atm-kanban',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet, AtmAvatarGroup],
  host: { class: 'block' },
  template: `
    <div
      class="flex h-full items-start gap-4 pb-2"
      [class.overflow-x-auto]="scrollable()"
      (dragover)="onBoardDragOver($event)"
      (drop)="onBoardDrop($event)"
    >
      @for (column of columns(); track column.id; let colIndex = $index) {
        <!-- Column drop indicator -->
        @if (isColumnDropSlot(colIndex)) {
          <div class="w-1 shrink-0 self-stretch rounded-full bg-primary"></div>
        }
        <section
          class="flex max-h-full flex-col rounded-atm-lg border bg-surface-alt/40
            transition-colors"
          [class]="columnClass(column)"
          (dragover)="onColumnDragOver($event, column, colIndex)"
          (drop)="onColumnDrop($event, column)"
        >
          <!-- Column header -->
          <header
            class="flex items-center gap-2 px-3 pt-3 pb-2"
            [class.cursor-grab]="allowColumnReorder()"
            [class.active:cursor-grabbing]="allowColumnReorder()"
            [attr.draggable]="allowColumnReorder() ? true : null"
            (dragstart)="onColumnDragStart($event, column, colIndex)"
            (dragend)="onColumnDragEnd()"
          >
            <span class="size-2.5 rounded-full" [class]="dot(column.color)"></span>
            <h3 class="text-sm font-semibold text-ink">{{ column.title }}</h3>
            <span
              class="rounded-full px-1.5 py-0.5 text-[11px] font-semibold"
              [class]="
                column.limit && column.cards.length > column.limit
                  ? 'bg-danger-soft text-danger'
                  : 'bg-surface text-ink-muted'
              "
            >
              {{ column.cards.length }}@if (column.limit) {/{{ column.limit }}}
            </span>
            <span class="flex-1"></span>
            @if (allowAdd()) {
              <button
                type="button"
                class="atm-focus flex size-6 cursor-pointer items-center justify-center rounded-md
                  text-ink-faint transition-colors hover:bg-surface hover:text-ink"
                aria-label="Adicionar cartão"
                (click)="addCard.emit(column)"
              >
                <i class="atm atm-plus-sign text-xs" aria-hidden="true"></i>
              </button>
            }
          </header>

          <!-- Cards -->
          <div class="flex min-h-4 flex-1 flex-col gap-2 overflow-y-auto px-2.5 pb-2.5">
            @for (card of column.cards; track card.id; let i = $index) {
              <!-- Drop indicator -->
              @if (isDropSlot(column.id, i)) {
                <div class="h-0.5 rounded-full bg-primary"></div>
              }
              <article
                draggable="true"
                class="group cursor-grab rounded-atm border border-line bg-surface p-3 shadow-atm
                  transition-all active:cursor-grabbing hover:border-line-strong hover:shadow-atm-lg"
                [class.opacity-40]="isDragging(column.id, card.id)"
                (dragstart)="onDragStart($event, column, card)"
                (dragend)="onDragEnd()"
                (dragover)="onCardDragOver($event, column, i)"
                (click)="cardClick.emit(card)"
              >
                @if (cardTemplate(); as tpl) {
                  <ng-container
                    [ngTemplateOutlet]="tpl"
                    [ngTemplateOutletContext]="{ $implicit: card, column, index: i }"
                  />
                } @else {
                  @if (card.cover) {
                    <img
                      [src]="card.cover"
                      [alt]="card.title"
                      class="mb-2.5 h-28 w-full rounded-md object-cover"
                    />
                  }
                  @if (card.labels?.length) {
                    <div class="mb-2 flex flex-wrap gap-1">
                      @for (label of card.labels; track label.text) {
                        <span
                          class="rounded px-1.5 py-0.5 text-[10px] font-semibold"
                          [class]="labelClass(label.color)"
                        >
                          {{ label.text }}
                        </span>
                      }
                    </div>
                  }
                  <p class="text-sm leading-snug font-medium text-ink">{{ card.title }}</p>
                  @if (card.description) {
                    <p class="mt-1 line-clamp-2 text-xs leading-relaxed text-ink-muted">
                      {{ card.description }}
                    </p>
                  }
                  @if (
                    card.priority || card.dueDate || card.assignees?.length
                  ) {
                    <footer class="mt-3 flex items-center gap-2">
                      @if (card.priority) {
                        <span
                          class="inline-flex items-center gap-1 text-[11px] font-medium"
                          [class]="priorityMeta(card.priority).class"
                        >
                          <i [class]="priorityMeta(card.priority).icon" aria-hidden="true"></i>
                          {{ priorityMeta(card.priority).label }}
                        </span>
                      }
                      @if (card.dueDate) {
                        <span class="inline-flex items-center gap-1 text-[11px] text-ink-muted">
                          <i class="atm atm-clock-01" aria-hidden="true"></i>
                          {{ card.dueDate }}
                        </span>
                      }
                      <span class="flex-1"></span>
                      @if (card.assignees?.length) {
                        <atm-avatar-group
                          [items]="card.assignees ?? []"
                          size="slim"
                          [max]="3"
                          nameKey="name"
                          srcKey="src"
                          tooltipKey="name"
                        />
                      }
                    </footer>
                  }
                }
              </article>
            }

            <!-- Trailing drop indicator -->
            @if (isDropSlot(column.id, column.cards.length)) {
              <div class="h-0.5 rounded-full bg-primary"></div>
            }

            @if (!column.cards.length && dragOverColumn() !== column.id) {
              <p class="rounded-atm border border-dashed border-line px-3 py-6 text-center text-xs text-ink-faint">
                Sem cartões
              </p>
            }
          </div>

          @if (allowAdd()) {
            <button
              type="button"
              class="atm-focus m-2.5 mt-0 flex cursor-pointer items-center justify-center gap-1.5
                rounded-atm px-2 py-2 text-xs font-medium text-ink-muted transition-colors
                hover:bg-surface hover:text-ink"
              (click)="addCard.emit(column)"
            >
              <i class="atm atm-plus-sign" aria-hidden="true"></i>
              Adicionar cartão
            </button>
          }
        </section>
      }

      <!-- Trailing column drop indicator -->
      @if (isColumnDropSlot(columns().length)) {
        <div class="w-1 shrink-0 self-stretch rounded-full bg-primary"></div>
      }

      @if (allowAddColumn()) {
        <button
          type="button"
          class="atm-focus flex cursor-pointer items-center justify-center gap-2
            rounded-atm-lg border border-dashed border-line px-3 py-3 text-sm font-medium
            text-ink-muted transition-colors hover:border-primary/50 hover:text-primary"
          [class]="widthClass()"
          (click)="addColumn.emit()"
        >
          <i class="atm atm-plus-sign" aria-hidden="true"></i>
          Nova coluna
        </button>
      }
    </div>
  `,
})
export class AtmKanban {
  readonly columns = model<AtmKanbanColumn[]>([]);
  readonly allowAdd = input(true);
  readonly allowAddColumn = input(false);
  /** Drag column headers to reorder columns. */
  readonly allowColumnReorder = input(false);
  /**
   * true (default): horizontal scroll with fixed-width columns.
   * false: columns share the available width.
   */
  readonly scrollable = input(true);
  /** Optional custom card body. Context: { $implicit: card, column, index }. */
  readonly cardTemplate = contentChild<TemplateRef<unknown>>('card');

  readonly cardMove = output<AtmKanbanMoveEvent>();
  readonly cardClick = output<AtmKanbanCard>();
  readonly addCard = output<AtmKanbanColumn>();
  readonly addColumn = output<void>();
  readonly columnReorder = output<AtmKanbanColumnReorderEvent>();

  private readonly drag = signal<DragState | null>(null);
  readonly dragOverColumn = signal<string | null>(null);
  private readonly dropIndex = signal<number | null>(null);

  private readonly columnDrag = signal<ColumnDragState | null>(null);
  private readonly columnDropIndex = signal<number | null>(null);

  readonly widthClass = computed(() =>
    this.scrollable() ? 'w-72 shrink-0' : 'min-w-0 flex-1 basis-0',
  );

  columnClass(column: AtmKanbanColumn): string {
    const border =
      this.dragOverColumn() === column.id
        ? 'border-primary/60 bg-primary-soft/30'
        : 'border-line';
    const dragging = this.isColumnDragging(column.id) ? 'opacity-40' : '';
    return `${this.widthClass()} ${border} ${dragging}`;
  }

  dot(color?: AtmColor): string {
    return DOT[color ?? 'neutral'];
  }

  labelClass(color?: AtmColor): string {
    return LABEL[color ?? 'neutral'];
  }

  priorityMeta(priority: 'low' | 'medium' | 'high') {
    return PRIORITY[priority];
  }

  isDragging(columnId: string, cardId: string): boolean {
    const d = this.drag();
    return !!d && d.columnId === columnId && d.cardId === cardId;
  }

  isDropSlot(columnId: string, index: number): boolean {
    return this.dragOverColumn() === columnId && this.dropIndex() === index && !!this.drag();
  }

  onDragStart(event: DragEvent, column: AtmKanbanColumn, card: AtmKanbanCard): void {
    this.drag.set({ columnId: column.id, cardId: card.id });
    event.dataTransfer?.setData('text/plain', card.id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  onDragEnd(): void {
    this.drag.set(null);
    this.dragOverColumn.set(null);
    this.dropIndex.set(null);
  }

  onCardDragOver(event: DragEvent, column: AtmKanbanColumn, index: number): void {
    if (!this.drag()) return;
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const after = event.clientY - rect.top > rect.height / 2;
    this.dragOverColumn.set(column.id);
    this.dropIndex.set(after ? index + 1 : index);
  }

  onColumnDragOver(event: DragEvent, column: AtmKanbanColumn, index: number): void {
    if (this.columnDrag()) {
      event.preventDefault();
      const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
      const after = event.clientX - rect.left > rect.width / 2;
      this.columnDropIndex.set(after ? index + 1 : index);
      return;
    }
    if (!this.drag()) return;
    event.preventDefault();
    this.dragOverColumn.set(column.id);
    if (this.dropIndex() === null) this.dropIndex.set(column.cards.length);
  }

  onColumnDrop(event: DragEvent, column: AtmKanbanColumn): void {
    event.preventDefault();
    if (this.columnDrag()) {
      this.dropColumn();
      return;
    }
    const d = this.drag();
    if (!d) return;
    const targetIndex = this.dropIndex() ?? column.cards.length;
    this.moveCard(d.columnId, d.cardId, column.id, targetIndex);
    this.onDragEnd();
  }

  // --- Column reorder ---

  onColumnDragStart(event: DragEvent, column: AtmKanbanColumn, index: number): void {
    if (!this.allowColumnReorder()) return;
    this.columnDrag.set({ columnId: column.id, index });
    event.dataTransfer?.setData('text/plain', column.id);
    if (event.dataTransfer) event.dataTransfer.effectAllowed = 'move';
  }

  onColumnDragEnd(): void {
    this.columnDrag.set(null);
    this.columnDropIndex.set(null);
  }

  isColumnDragging(columnId: string): boolean {
    return this.columnDrag()?.columnId === columnId;
  }

  isColumnDropSlot(index: number): boolean {
    const d = this.columnDrag();
    if (!d || this.columnDropIndex() !== index) return false;
    // Hide indicators that would result in a no-op move.
    return index !== d.index && index !== d.index + 1;
  }

  onBoardDragOver(event: DragEvent): void {
    if (!this.columnDrag()) return;
    event.preventDefault();
    if (this.columnDropIndex() === null) this.columnDropIndex.set(this.columns().length);
  }

  onBoardDrop(event: DragEvent): void {
    if (!this.columnDrag()) return;
    event.preventDefault();
    this.dropColumn();
  }

  private dropColumn(): void {
    const d = this.columnDrag();
    const target = this.columnDropIndex();
    this.onColumnDragEnd();
    if (!d || target === null) return;

    const columns = [...this.columns()];
    const fromIndex = columns.findIndex((c) => c.id === d.columnId);
    if (fromIndex === -1) return;

    let index = target;
    if (fromIndex < index) index -= 1;
    index = Math.max(0, Math.min(index, columns.length - 1));
    if (index === fromIndex) return;

    const [column] = columns.splice(fromIndex, 1);
    columns.splice(index, 0, column);
    this.columns.set(columns);
    this.columnReorder.emit({ column, fromIndex, toIndex: index });
  }

  private moveCard(fromId: string, cardId: string, toId: string, toIndex: number): void {
    const columns = this.columns().map((c) => ({ ...c, cards: [...c.cards] }));
    const from = columns.find((c) => c.id === fromId);
    const to = columns.find((c) => c.id === toId);
    if (!from || !to) return;

    const fromIndex = from.cards.findIndex((c) => c.id === cardId);
    if (fromIndex === -1) return;
    const [card] = from.cards.splice(fromIndex, 1);

    let index = toIndex;
    if (fromId === toId && fromIndex < index) index -= 1;
    index = Math.max(0, Math.min(index, to.cards.length));
    to.cards.splice(index, 0, card);

    this.columns.set(columns);
    this.cardMove.emit({ card, fromColumnId: fromId, toColumnId: toId, toIndex: index });
  }
}
