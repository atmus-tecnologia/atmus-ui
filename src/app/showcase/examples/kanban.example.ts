import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AtmAvatarGroup,
  AtmBadge,
  AtmButton,
  AtmInput,
  AtmKanban,
  AtmKanbanCard,
  AtmKanbanColumn,
  AtmKanbanLabel,
  AtmKanbanMoveEvent,
  AtmLabel,
  AtmModal,
  AtmKanbanColumnReorderEvent,
  AtmSearchField,
  AtmSelect,
  AtmSelectOption,
  AtmSwitch,
  AtmTextarea,
  AtmToastService,
} from '@atmus/ngui';

const TEAM = [
  { name: 'Ana Souza', src: 'https://i.pravatar.cc/80?img=1' },
  { name: 'Bruno Lima', src: 'https://i.pravatar.cc/80?img=12' },
  { name: 'Carla Nunes', src: 'https://i.pravatar.cc/80?img=32' },
  { name: 'Diego Rocha', src: 'https://i.pravatar.cc/80?img=14' },
  { name: 'Elisa Prado', src: 'https://i.pravatar.cc/80?img=5' },
  { name: 'Felipe Alves', src: 'https://i.pravatar.cc/80?img=59' },
  { name: 'Gabriela Reis', src: 'https://i.pravatar.cc/80?img=9' },
];

const COLUMNS: AtmKanbanColumn[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    color: 'neutral',
    cards: [
      {
        id: 'k1',
        title: 'Pesquisa de usuários do onboarding',
        description: 'Entrevistar 8 clientes para mapear os pontos de atrito no primeiro acesso.',
        labels: [{ text: 'Discovery', color: 'info' }],
        assignees: [TEAM[4]],
        dueDate: '12 ago',
        priority: 'low',
      },
      {
        id: 'k2',
        title: 'Integração com gateway de pagamento Pix',
        description: 'Avaliar provedores e desenhar o fluxo de conciliação.',
        labels: [
          { text: 'Backend', color: 'primary' },
          { text: 'Financeiro', color: 'warning' },
        ],
        assignees: [TEAM[1], TEAM[3]],
        priority: 'medium',
      },
      {
        id: 'k3',
        title: 'Migrar ícones legados para o novo pacote',
        labels: [{ text: 'Débito técnico', color: 'neutral' }],
        assignees: [TEAM[5]],
        priority: 'low',
      },
    ],
  },
  {
    id: 'todo',
    title: 'A fazer',
    color: 'info',
    cards: [
      {
        id: 'k4',
        title: 'Tela de relatórios com exportação em PDF',
        description: 'Gerar PDF no servidor com layout paginado e enviar por e-mail.',
        labels: [
          { text: 'Feature', color: 'success' },
          { text: 'Relatórios', color: 'info' },
        ],
        assignees: [TEAM[0], TEAM[6]],
        dueDate: '30 jul',
        priority: 'high',
      },
      {
        id: 'k5',
        title: 'Dark mode nas telas de configuração',
        labels: [{ text: 'UI', color: 'primary' }],
        assignees: [TEAM[4], TEAM[0]],
        dueDate: '2 ago',
        priority: 'medium',
      },
    ],
  },
  {
    id: 'doing',
    title: 'Em andamento',
    color: 'warning',
    limit: 3,
    cards: [
      {
        id: 'k6',
        title: 'Refatorar módulo de autenticação',
        description: 'Trocar sessão por JWT com refresh token e revogação por dispositivo.',
        labels: [
          { text: 'Backend', color: 'primary' },
          { text: 'Segurança', color: 'danger' },
        ],
        assignees: [TEAM[1], TEAM[3], TEAM[5]],
        dueDate: '28 jul',
        priority: 'high',
      },
      {
        id: 'k7',
        title: 'Novo fluxo de checkout em 2 passos',
        description: 'Reduzir abandono unificando endereço e pagamento em uma etapa.',
        labels: [{ text: 'Feature', color: 'success' }],
        assignees: [TEAM[2]],
        dueDate: '25 jul',
        priority: 'high',
      },
      {
        id: 'k8',
        title: 'Testes e2e do módulo financeiro',
        labels: [{ text: 'QA', color: 'info' }],
        assignees: [TEAM[6]],
        priority: 'medium',
      },
    ],
  },
  {
    id: 'review',
    title: 'Em revisão',
    color: 'primary',
    cards: [
      {
        id: 'k9',
        title: 'API pública v2 — documentação OpenAPI',
        labels: [
          { text: 'Docs', color: 'neutral' },
          { text: 'Backend', color: 'primary' },
        ],
        assignees: [TEAM[3]],
        dueDate: '24 jul',
        priority: 'medium',
      },
      {
        id: 'k10',
        title: 'Redesign do e-mail transacional',
        labels: [{ text: 'UI', color: 'primary' }],
        assignees: [TEAM[0], TEAM[4]],
        priority: 'low',
      },
    ],
  },
  {
    id: 'done',
    title: 'Concluído',
    color: 'success',
    cards: [
      {
        id: 'k11',
        title: 'Setup do CI com deploy automático',
        labels: [{ text: 'DevOps', color: 'warning' }],
        assignees: [TEAM[5]],
        priority: 'medium',
      },
      {
        id: 'k12',
        title: 'Página de status do sistema',
        labels: [{ text: 'Feature', color: 'success' }],
        assignees: [TEAM[1], TEAM[2]],
        priority: 'low',
      },
    ],
  },
];

@Component({
  selector: 'kanban-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    AtmKanban,
    AtmButton,
    AtmBadge,
    AtmAvatarGroup,
    AtmSearchField,
    AtmModal,
    AtmInput,
    AtmTextarea,
    AtmSelect,
    AtmLabel,
    AtmSwitch,
  ],
  host: { class: 'block' },
  template: `
    <!-- Page header -->
    <header class="mb-6 flex flex-wrap items-center gap-4">
      <div class="min-w-0">
        <div class="flex items-center gap-3">
          <h1 class="text-2xl font-bold tracking-tight text-ink">Projeto Atmus App</h1>
          <atm-badge color="success" [dot]="true">Em dia</atm-badge>
        </div>
        <p class="mt-1 text-sm text-ink-muted">
          Sprint 14 · 23 jul – 5 ago · arraste os cartões entre as colunas
        </p>
      </div>
      <span class="flex-1"></span>
      <atm-switch size="slim" label="Scroll horizontal" [(ngModel)]="scrollable" />
      <atm-switch size="slim" label="Reordenar colunas" [(ngModel)]="reorderColumns" />
      <atm-avatar-group [items]="team" [max]="5" size="slim" tooltipKey="name" />
      <div class="w-56">
        <atm-search-field size="slim" placeholder="Buscar cartão..." (search)="query.set($event)" />
      </div>
      <atm-button size="slim" icon="plus" (clicked)="openNewCard()">Novo cartão</atm-button>
    </header>

    <!-- Board -->
    <atm-kanban
      [columns]="filteredColumns()"
      (columnsChange)="onColumnsChange($event)"
      [allowAddColumn]="false"
      [scrollable]="scrollable()"
      [allowColumnReorder]="reorderColumns()"
      (columnReorder)="onColumnReorder($event)"
      (cardMove)="onMove($event)"
      (cardClick)="onCardClick($event)"
      (addCard)="openNewCard($event)"
    >
      <!-- Card 100% customizado pelo app host -->
      <ng-template #card let-card let-column="column">
        <div class="flex items-center gap-2">
          <span
            class="rounded bg-surface-alt px-1.5 py-0.5 font-mono text-[10px] font-semibold
              tracking-wide text-ink-faint uppercase"
          >
            {{ card.id }}
          </span>
          <span class="flex-1"></span>
          @if (card.priority) {
            <i class="text-xs" [class]="priorityIcon(card.priority)" aria-hidden="true"></i>
          }
        </div>
        <p class="mt-1.5 text-sm leading-snug font-medium text-ink">{{ card.title }}</p>
        @if (card.labels?.length) {
          <div class="mt-2 flex flex-wrap gap-1">
            @for (label of card.labels; track label.text) {
              <span
                class="rounded-full px-2 py-0.5 text-[10px] font-semibold"
                [class]="labelClass(label)"
              >
                {{ label.text }}
              </span>
            }
          </div>
        }
        <footer class="mt-2.5 flex items-center gap-2">
          @if (card.dueDate) {
            <span class="inline-flex items-center gap-1 text-[11px] text-ink-muted">
              <i class="icofont-clock-time" aria-hidden="true"></i>
              {{ card.dueDate }}
            </span>
          }
          <span class="flex-1"></span>
          @if (card.assignees?.length) {
            <atm-avatar-group
              [items]="card.assignees"
              size="slim"
              [max]="3"
              nameKey="name"
              srcKey="src"
              tooltipKey="name"
            />
          }
        </footer>
      </ng-template>
    </atm-kanban>

    <!-- New card modal -->
    <atm-modal [(open)]="modalOpen" header="Novo cartão" width="26rem">
      <div class="space-y-4">
        <div>
          <atm-label>Título</atm-label>
          <atm-input placeholder="Ex.: Implementar filtro por período" [(ngModel)]="draftTitle" />
        </div>
        <div>
          <atm-label>Descrição</atm-label>
          <atm-textarea
            placeholder="Detalhes do que precisa ser feito..."
            [rows]="3"
            [(ngModel)]="draftDescription"
          />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <atm-label>Coluna</atm-label>
            <atm-select [options]="columnOptions" [(ngModel)]="draftColumn" />
          </div>
          <div>
            <atm-label>Prioridade</atm-label>
            <atm-select [options]="priorityOptions" [(ngModel)]="draftPriority" />
          </div>
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <atm-button variant="ghost" color="neutral" (clicked)="modalOpen.set(false)">
            Cancelar
          </atm-button>
          <atm-button icon="check-alt" [disabled]="!draftTitle().trim()" (clicked)="createCard()">
            Criar cartão
          </atm-button>
        </div>
      </div>
    </atm-modal>
  `,
})
export class KanbanExample {
  private readonly toast = inject(AtmToastService);

  readonly team = TEAM;
  readonly columns = signal<AtmKanbanColumn[]>(COLUMNS);
  readonly query = signal('');
  readonly scrollable = signal(true);
  readonly reorderColumns = signal(true);

  readonly modalOpen = signal(false);
  readonly draftTitle = signal('');
  readonly draftDescription = signal('');
  readonly draftColumn = signal('todo');
  readonly draftPriority = signal<'low' | 'medium' | 'high'>('medium');

  readonly columnOptions: AtmSelectOption<string>[] = COLUMNS.map((c) => ({
    label: c.title,
    value: c.id,
  }));

  readonly priorityOptions: AtmSelectOption<string>[] = [
    { label: 'Baixa', value: 'low' },
    { label: 'Média', value: 'medium' },
    { label: 'Alta', value: 'high' },
  ];

  /** Filtro por texto — mantém as colunas e filtra os cartões. */
  filteredColumns(): AtmKanbanColumn[] {
    const term = this.query().trim().toLowerCase();
    if (!term) return this.columns();
    return this.columns().map((column) => ({
      ...column,
      cards: column.cards.filter(
        (card) =>
          card.title.toLowerCase().includes(term) ||
          card.description?.toLowerCase().includes(term) ||
          card.labels?.some((l) => l.text.toLowerCase().includes(term)),
      ),
    }));
  }

  onColumnsChange(columns: AtmKanbanColumn[]): void {
    // Sem filtro ativo o array emitido é o estado completo do board.
    if (!this.query().trim()) this.columns.set(columns);
  }

  onColumnReorder(event: AtmKanbanColumnReorderEvent): void {
    // Com filtro ativo, aplica a reordenação no estado completo.
    if (this.query().trim()) {
      this.columns.update((columns) => {
        const next = [...columns];
        const from = next.findIndex((c) => c.id === event.column.id);
        if (from === -1) return columns;
        const [column] = next.splice(from, 1);
        next.splice(Math.min(event.toIndex, next.length), 0, column);
        return next;
      });
    }
    this.toast.info('Coluna movida', `"${event.column.title}" → posição ${event.toIndex + 1}`);
  }

  /** Estilos do card custom — decididos pelo app host, não pela lib. */
  priorityIcon(priority: 'low' | 'medium' | 'high'): string {
    const map = {
      low: 'icofont-arrow-down text-info',
      medium: 'icofont-minus text-warning',
      high: 'icofont-arrow-up text-danger',
    };
    return map[priority];
  }

  labelClass(label: AtmKanbanLabel): string {
    const map: Record<string, string> = {
      primary: 'bg-primary-soft text-primary',
      success: 'bg-success-soft text-success',
      warning: 'bg-warning-soft text-warning',
      danger: 'bg-danger-soft text-danger',
      info: 'bg-info-soft text-info',
      neutral: 'bg-surface-alt text-ink-muted',
    };
    return map[label.color ?? 'neutral'];
  }

  onMove(event: AtmKanbanMoveEvent): void {
    // Com filtro ativo, aplica o movimento no estado completo.
    if (this.query().trim()) {
      this.columns.update((columns) => {
        const next = columns.map((c) => ({ ...c, cards: [...c.cards] }));
        const from = next.find((c) => c.id === event.fromColumnId);
        const to = next.find((c) => c.id === event.toColumnId);
        if (!from || !to) return columns;
        const index = from.cards.findIndex((c) => c.id === event.card.id);
        if (index === -1) return columns;
        const [card] = from.cards.splice(index, 1);
        to.cards.splice(Math.min(event.toIndex, to.cards.length), 0, card);
        return next;
      });
    }
    const target = this.columns().find((c) => c.id === event.toColumnId);
    this.toast.success('Cartão movido', `"${event.card.title}" → ${target?.title ?? ''}`);
  }

  onCardClick(card: AtmKanbanCard): void {
    this.toast.info(card.title, card.description ?? 'Abra aqui o detalhe do cartão.');
  }

  openNewCard(column?: AtmKanbanColumn): void {
    this.draftTitle.set('');
    this.draftDescription.set('');
    this.draftColumn.set(column?.id ?? 'todo');
    this.draftPriority.set('medium');
    this.modalOpen.set(true);
  }

  createCard(): void {
    const columnId = this.draftColumn();
    const card: AtmKanbanCard = {
      id: 'k' + Date.now(),
      title: this.draftTitle().trim(),
      description: this.draftDescription().trim() || undefined,
      priority: this.draftPriority(),
      assignees: [this.team[Math.floor(Math.random() * this.team.length)]],
    };
    this.columns.update((columns) =>
      columns.map((c) => (c.id === columnId ? { ...c, cards: [...c.cards, card] } : c)),
    );
    this.modalOpen.set(false);
    this.toast.success('Cartão criado', card.title);
  }
}
