import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AtmAccordion,
  AtmAccordionItem,
  AtmAvatar,
  AtmBadge,
  AtmButton,
  AtmChip,
  AtmColor,
  AtmDropdown,
  AtmDropdownItem,
  AtmInput,
  AtmLabel,
  AtmSearchField,
  AtmSelect,
  AtmSelectOption,
  AtmSeparator,
  AtmTextarea,
  AtmToastService,
  AtmTooltip,
} from '../../../core/ui';

type Channel = 'whatsapp' | 'email' | 'site';

interface ChatMessage {
  id: number;
  from: 'agent' | 'customer';
  text: string;
  time: string;
}

interface Conversation {
  id: number;
  name: string;
  avatar?: string;
  company: string;
  email: string;
  phone: string;
  channel: Channel;
  status: 'online' | 'offline' | 'away' | 'busy';
  time: string;
  unread: number;
  tags: { text: string; color: AtmColor }[];
  ticketStatus: string;
  agent: string;
  messages: ChatMessage[];
}

const CHANNEL_META: Record<Channel, { icon: string; label: string; color: AtmColor }> = {
  whatsapp: { icon: 'icofont-brand-whatsapp', label: 'WhatsApp', color: 'success' },
  email: { icon: 'icofont-envelope', label: 'E-mail', color: 'info' },
  site: { icon: 'icofont-globe', label: 'Site', color: 'primary' },
};

const CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    name: 'Mariana Castro',
    avatar: 'https://i.pravatar.cc/80?img=47',
    company: 'Jampack Ltda',
    email: 'mariana@jampack.com.br',
    phone: '(48) 99812-3344',
    channel: 'whatsapp',
    status: 'online',
    time: '09:42',
    unread: 2,
    tags: [
      { text: 'VIP', color: 'warning' },
      { text: 'Financeiro', color: 'info' },
    ],
    ticketStatus: 'open',
    agent: 'Ana Souza',
    messages: [
      { id: 1, from: 'customer', text: 'Bom dia! A fatura deste mês veio com um valor diferente do contratado.', time: '09:30' },
      { id: 2, from: 'agent', text: 'Bom dia, Mariana! Tudo bem? Vou verificar sua fatura agora mesmo. 😊', time: '09:32' },
      { id: 3, from: 'customer', text: 'Obrigada! O plano é o Business anual, mas veio cobrança de módulo extra.', time: '09:35' },
      { id: 4, from: 'agent', text: 'Encontrei aqui: houve a ativação do módulo de relatórios no dia 12. Foi feita pelo usuário admin da conta.', time: '09:38' },
      { id: 5, from: 'customer', text: 'Hmm, ninguém aqui ativou isso. Consegue estornar?', time: '09:40' },
      { id: 6, from: 'customer', text: 'E aproveitando: como faço para trocar o cartão cadastrado?', time: '09:42' },
    ],
  },
  {
    id: 2,
    name: 'Ricardo Mendes',
    avatar: 'https://i.pravatar.cc/80?img=68',
    company: 'Construtora Alfa',
    email: 'ricardo@alfa.eng.br',
    phone: '(11) 98765-0021',
    channel: 'email',
    status: 'away',
    time: '09:15',
    unread: 0,
    tags: [{ text: 'Onboarding', color: 'primary' }],
    ticketStatus: 'pending',
    agent: 'Bruno Lima',
    messages: [
      { id: 1, from: 'customer', text: 'Olá! Estamos migrando da planilha para o sistema. Existe importador de dados?', time: '08:50' },
      { id: 2, from: 'agent', text: 'Olá Ricardo! Sim, aceitamos importação via CSV e Excel. Posso te enviar o modelo?', time: '09:02' },
      { id: 3, from: 'customer', text: 'Por favor! São cerca de 4 mil registros de clientes.', time: '09:15' },
    ],
  },
  {
    id: 3,
    name: 'Fernanda Oliveira',
    avatar: 'https://i.pravatar.cc/80?img=45',
    company: 'Studio Fê',
    email: 'fe@studiofe.com',
    phone: '(21) 99444-7788',
    channel: 'site',
    status: 'online',
    time: 'Ontem',
    unread: 1,
    tags: [{ text: 'Trial', color: 'success' }],
    ticketStatus: 'open',
    agent: 'Ana Souza',
    messages: [
      { id: 1, from: 'customer', text: 'Oi! Meu trial acaba amanhã, consigo estender por mais uma semana?', time: '18:22' },
      { id: 2, from: 'agent', text: 'Oi Fernanda! Claro, estendi seu trial por mais 7 dias. Aproveita para testar os relatórios! 🚀', time: '18:30' },
      { id: 3, from: 'customer', text: 'Vocês são demais! Já estou quase convencida a assinar o plano Pro.', time: '18:41' },
    ],
  },
  {
    id: 4,
    name: 'Paulo Teixeira',
    avatar: 'https://i.pravatar.cc/80?img=13',
    company: 'Log Express',
    email: 'paulo@logexpress.com.br',
    phone: '(41) 98877-1100',
    channel: 'whatsapp',
    status: 'busy',
    time: 'Ontem',
    unread: 0,
    tags: [{ text: 'Bug', color: 'danger' }],
    ticketStatus: 'pending',
    agent: 'Diego Rocha',
    messages: [
      { id: 1, from: 'customer', text: 'O app está fechando sozinho quando abro o mapa de entregas.', time: '16:05' },
      { id: 2, from: 'agent', text: 'Sinto muito pelo transtorno, Paulo! Qual o modelo do aparelho e a versão do app?', time: '16:11' },
      { id: 3, from: 'customer', text: 'Moto G84, app versão 3.2.1.', time: '16:20' },
      { id: 4, from: 'agent', text: 'Obrigado! Reproduzimos o problema e a correção sai na 3.2.2, ainda esta semana.', time: '17:02' },
    ],
  },
  {
    id: 5,
    name: 'Juliana Freitas',
    avatar: 'https://i.pravatar.cc/80?img=24',
    company: 'JF Contabilidade',
    email: 'juliana@jfcont.com.br',
    phone: '(31) 99123-4567',
    channel: 'email',
    status: 'offline',
    time: 'Seg',
    unread: 0,
    tags: [],
    ticketStatus: 'resolved',
    agent: 'Ana Souza',
    messages: [
      { id: 1, from: 'customer', text: 'Preciso da segunda via das notas fiscais de junho.', time: '10:12' },
      { id: 2, from: 'agent', text: 'Enviadas para o seu e-mail, Juliana! Qualquer coisa é só chamar.', time: '10:25' },
      { id: 3, from: 'customer', text: 'Recebido, obrigada!', time: '10:31' },
    ],
  },
  {
    id: 6,
    name: 'Grupo Vetor',
    company: 'Grupo Vetor S.A.',
    email: 'ti@grupovetor.com',
    phone: '(51) 3232-8899',
    channel: 'site',
    status: 'offline',
    time: 'Seg',
    unread: 0,
    tags: [{ text: 'Enterprise', color: 'primary' }],
    ticketStatus: 'open',
    agent: 'Diego Rocha',
    messages: [
      { id: 1, from: 'customer', text: 'Gostaríamos de agendar uma demo do plano Enterprise para 40 usuários.', time: '11:47' },
      { id: 2, from: 'agent', text: 'Excelente! Podemos na quinta às 14h? Envio o convite pelo e-mail ti@grupovetor.com.', time: '11:58' },
    ],
  },
];

@Component({
  selector: 'chat-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    AtmAvatar,
    AtmBadge,
    AtmButton,
    AtmChip,
    AtmDropdown,
    AtmInput,
    AtmLabel,
    AtmSearchField,
    AtmSelect,
    AtmSeparator,
    AtmTextarea,
    AtmTooltip,
    AtmAccordion,
    AtmAccordionItem,
  ],
  host: { class: 'block' },
  template: `
    <div
      class="flex h-[calc(100vh-8.5rem)] min-h-[34rem] overflow-hidden rounded-atm-lg border
        border-line bg-surface"
    >
      <!-- ================= Left: conversations ================= -->
      <aside class="flex w-80 shrink-0 flex-col border-r border-line max-md:hidden">
        <div class="border-b border-line p-4">
          <div class="mb-3 flex items-center justify-between">
            <h2 class="text-base font-bold text-ink">Atendimentos</h2>
            <atm-badge color="primary">{{ openCount() }} abertos</atm-badge>
          </div>
          <atm-search-field size="slim" placeholder="Buscar conversa..." (search)="query.set($event)" />
          <div class="mt-3 flex rounded-atm bg-surface-alt p-0.5">
            @for (option of filterOptions; track option.value) {
              <button
                type="button"
                class="atm-focus h-7 flex-1 cursor-pointer rounded-[calc(var(--atm-radius)-3px)]
                  text-xs font-medium transition-colors"
                [class]="
                  filter() === option.value
                    ? 'bg-surface text-ink shadow-atm'
                    : 'text-ink-muted hover:text-ink'
                "
                (click)="filter.set(option.value)"
              >
                {{ option.label }}
              </button>
            }
          </div>
        </div>

        <div class="flex-1 overflow-y-auto">
          @for (conversation of filtered(); track conversation.id) {
            <button
              type="button"
              class="atm-focus flex w-full cursor-pointer items-start gap-3 border-b border-line
                px-4 py-3 text-left transition-colors"
              [class]="
                selectedId() === conversation.id
                  ? 'bg-primary-soft/60'
                  : 'hover:bg-surface-alt/60'
              "
              (click)="select(conversation.id)"
            >
              <atm-avatar
                [name]="conversation.name"
                [src]="conversation.avatar"
                [status]="conversation.status"
              />
              <span class="min-w-0 flex-1">
                <span class="flex items-baseline justify-between gap-2">
                  <span class="truncate text-sm font-semibold text-ink">
                    {{ conversation.name }}
                  </span>
                  <span class="shrink-0 text-[11px] text-ink-faint">{{ conversation.time }}</span>
                </span>
                <span class="mt-0.5 flex items-center gap-1.5">
                  <i
                    [class]="channelMeta(conversation.channel).icon + ' shrink-0 text-xs text-ink-faint'"
                    aria-hidden="true"
                  ></i>
                  <span class="truncate text-xs text-ink-muted">
                    {{ lastMessage(conversation) }}
                  </span>
                  @if (conversation.unread > 0) {
                    <span
                      class="ml-auto flex size-5 shrink-0 items-center justify-center rounded-full
                        bg-primary text-[10px] font-bold text-primary-contrast"
                    >
                      {{ conversation.unread }}
                    </span>
                  }
                </span>
              </span>
            </button>
          } @empty {
            <p class="px-4 py-10 text-center text-sm text-ink-faint">Nenhuma conversa encontrada.</p>
          }
        </div>
      </aside>

      <!-- ================= Center: chat ================= -->
      <section class="flex min-w-0 flex-1 flex-col">
        @if (selected(); as conversation) {
          <!-- Chat header -->
          <header class="flex items-center gap-3 border-b border-line px-5 py-3">
            <atm-avatar
              [name]="conversation.name"
              [src]="conversation.avatar"
              [status]="conversation.status"
            />
            <div class="min-w-0">
              <h3 class="truncate text-sm font-bold text-ink">{{ conversation.name }}</h3>
              <p class="text-xs text-ink-muted">
                {{ conversation.company }} ·
                <span [class]="conversation.status === 'online' ? 'text-success' : ''">
                  {{ statusLabel(conversation.status) }}
                </span>
              </p>
            </div>
            <atm-chip size="slim" [color]="channelMeta(conversation.channel).color" [icon]="channelIcon(conversation.channel)">
              {{ channelMeta(conversation.channel).label }}
            </atm-chip>
            <span class="flex-1"></span>
            <atm-button
              variant="ghost"
              color="neutral"
              size="slim"
              [iconOnly]="true"
              icon="phone"
              atmTooltip="Ligar"
              (clicked)="notify('Chamada de voz iniciada')"
            />
            <atm-button
              variant="ghost"
              color="neutral"
              size="slim"
              [iconOnly]="true"
              icon="video-cam"
              atmTooltip="Videochamada"
              (clicked)="notify('Videochamada iniciada')"
            />
            <atm-dropdown [items]="actionItems" (itemClick)="onAction($event)">
              <atm-button variant="ghost" color="neutral" size="slim" [iconOnly]="true" icon="navigation-menu" />
            </atm-dropdown>
          </header>

          <!-- Messages -->
          <div #scroller class="flex-1 space-y-3 overflow-y-auto bg-app/60 p-5">
            <div class="flex items-center gap-3">
              <atm-separator class="flex-1" />
              <span class="text-[11px] font-medium text-ink-faint">Hoje</span>
              <atm-separator class="flex-1" />
            </div>
            @for (message of conversation.messages; track message.id) {
              <div class="flex" [class.justify-end]="message.from === 'agent'">
                <div class="max-w-[75%]">
                  <div
                    class="rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed shadow-atm"
                    [class]="
                      message.from === 'agent'
                        ? 'rounded-br-md bg-primary text-primary-contrast'
                        : 'rounded-bl-md border border-line bg-surface text-ink'
                    "
                  >
                    {{ message.text }}
                  </div>
                  <div
                    class="mt-1 flex items-center gap-1 text-[10px] text-ink-faint"
                    [class.justify-end]="message.from === 'agent'"
                  >
                    {{ message.time }}
                    @if (message.from === 'agent') {
                      <i class="icofont-check-alt text-success" aria-hidden="true"></i>
                    }
                  </div>
                </div>
              </div>
            }
            @if (typing()) {
              <div class="flex">
                <div
                  class="flex items-center gap-1.5 rounded-2xl rounded-bl-md border border-line
                    bg-surface px-4 py-3 shadow-atm"
                >
                  <span class="size-1.5 animate-bounce rounded-full bg-ink-faint"></span>
                  <span class="size-1.5 animate-bounce rounded-full bg-ink-faint [animation-delay:120ms]"></span>
                  <span class="size-1.5 animate-bounce rounded-full bg-ink-faint [animation-delay:240ms]"></span>
                </div>
              </div>
            }
          </div>

          <!-- Composer -->
          <footer class="border-t border-line p-4">
            <div class="flex items-end gap-2">
              <atm-button
                variant="ghost"
                color="neutral"
                [iconOnly]="true"
                icon="attachment"
                atmTooltip="Anexar arquivo"
                (clicked)="notify('Selecionar anexo')"
              />
              <atm-input
                class="flex-1"
                placeholder="Escreva sua mensagem... (Enter para enviar)"
                [(ngModel)]="draft"
                (keydown.enter)="send()"
              />
              <atm-button
                icon="paper-plane"
                [disabled]="!draft().trim()"
                (clicked)="send()"
              >
                Enviar
              </atm-button>
            </div>
            <p class="mt-2 text-[11px] text-ink-faint">
              Atendendo como <strong class="text-ink-muted">{{ selected()?.agent }}</strong> ·
              respostas em até 5 min
            </p>
          </footer>
        }
      </section>

      <!-- ================= Right: contact details ================= -->
      @if (selected(); as conversation) {
        <aside class="w-72 shrink-0 overflow-y-auto border-l border-line max-xl:hidden">
          <div class="flex flex-col items-center border-b border-line px-5 py-6 text-center">
            <atm-avatar
              size="large"
              [name]="conversation.name"
              [src]="conversation.avatar"
              [status]="conversation.status"
            />
            <h3 class="mt-3 text-sm font-bold text-ink">{{ conversation.name }}</h3>
            <p class="text-xs text-ink-muted">{{ conversation.company }}</p>
            @if (conversation.tags.length) {
              <div class="mt-3 flex flex-wrap justify-center gap-1.5">
                @for (tag of conversation.tags; track tag.text) {
                  <atm-chip size="slim" [color]="tag.color">{{ tag.text }}</atm-chip>
                }
              </div>
            }
          </div>

          <atm-accordion [multiple]="true">
            <atm-accordion-item header="Dados do contato" icon="id-card" [expanded]="true">
              <ul class="space-y-2.5 text-[13px]">
                <li class="flex items-center gap-2.5">
                  <i class="icofont-envelope w-4 text-ink-faint" aria-hidden="true"></i>
                  <span class="truncate text-ink">{{ conversation.email }}</span>
                </li>
                <li class="flex items-center gap-2.5">
                  <i class="icofont-phone w-4 text-ink-faint" aria-hidden="true"></i>
                  <span class="text-ink">{{ conversation.phone }}</span>
                </li>
                <li class="flex items-center gap-2.5">
                  <i [class]="channelMeta(conversation.channel).icon + ' w-4 text-ink-faint'" aria-hidden="true"></i>
                  <span class="text-ink">Canal: {{ channelMeta(conversation.channel).label }}</span>
                </li>
              </ul>
            </atm-accordion-item>

            <atm-accordion-item header="Atendimento" icon="tasks" [expanded]="true">
              <div class="space-y-3">
                <div>
                  <atm-label>Status</atm-label>
                  <atm-select
                    size="slim"
                    [options]="statusOptions"
                    [ngModel]="conversation.ticketStatus"
                    (ngModelChange)="setTicketStatus($event)"
                  />
                </div>
                <div>
                  <atm-label>Responsável</atm-label>
                  <atm-select
                    size="slim"
                    [options]="agentOptions"
                    [ngModel]="conversation.agent"
                    (ngModelChange)="setAgent($event)"
                  />
                </div>
              </div>
            </atm-accordion-item>

            <atm-accordion-item header="Notas internas" icon="notepad">
              <atm-textarea
                size="slim"
                placeholder="Visível apenas para o time..."
                [rows]="3"
                [(ngModel)]="notes"
              />
              <atm-button size="slim" variant="soft" class="mt-2" icon="save" (clicked)="notify('Nota salva')">
                Salvar nota
              </atm-button>
            </atm-accordion-item>
          </atm-accordion>

          <div class="space-y-2 p-4">
            <atm-button [block]="true" variant="outline" color="success" icon="check-alt" (clicked)="notify('Atendimento resolvido')">
              Marcar como resolvido
            </atm-button>
            <atm-button [block]="true" variant="ghost" color="danger" icon="close-circled" (clicked)="notify('Atendimento encerrado')">
              Encerrar atendimento
            </atm-button>
          </div>
        </aside>
      }
    </div>
  `,
})
export class ChatExample {
  private readonly toast = inject(AtmToastService);
  private readonly scroller = viewChild<ElementRef<HTMLElement>>('scroller');

  readonly conversations = signal<Conversation[]>(CONVERSATIONS);
  readonly selectedId = signal(1);
  readonly query = signal('');
  readonly filter = signal<'all' | 'unread' | 'mine'>('all');
  readonly draft = signal('');
  readonly notes = signal('');
  readonly typing = signal(false);

  readonly filterOptions = [
    { value: 'all' as const, label: 'Todas' },
    { value: 'unread' as const, label: 'Não lidas' },
    { value: 'mine' as const, label: 'Minhas' },
  ];

  readonly statusOptions: AtmSelectOption<string>[] = [
    { label: 'Aberto', value: 'open', icon: 'ui-play' },
    { label: 'Pendente', value: 'pending', icon: 'clock-time' },
    { label: 'Resolvido', value: 'resolved', icon: 'check-alt' },
  ];

  readonly agentOptions: AtmSelectOption<string>[] = [
    { label: 'Ana Souza', value: 'Ana Souza' },
    { label: 'Bruno Lima', value: 'Bruno Lima' },
    { label: 'Diego Rocha', value: 'Diego Rocha' },
  ];

  readonly actionItems: AtmDropdownItem[] = [
    { label: 'Transferir atendimento', icon: 'exchange' },
    { label: 'Ver histórico completo', icon: 'history' },
    { label: 'Exportar conversa', icon: 'download' },
    { label: 'Bloquear contato', icon: 'ban', danger: true, separatorBefore: true },
  ];

  readonly selected = computed(
    () => this.conversations().find((c) => c.id === this.selectedId()) ?? null,
  );

  readonly openCount = computed(
    () => this.conversations().filter((c) => c.ticketStatus === 'open').length,
  );

  readonly filtered = computed(() => {
    const term = this.query().trim().toLowerCase();
    const filter = this.filter();
    return this.conversations().filter((c) => {
      if (filter === 'unread' && c.unread === 0) return false;
      if (filter === 'mine' && c.agent !== 'Ana Souza') return false;
      if (!term) return true;
      return (
        c.name.toLowerCase().includes(term) ||
        c.company.toLowerCase().includes(term) ||
        c.messages.some((m) => m.text.toLowerCase().includes(term))
      );
    });
  });

  channelMeta(channel: Channel) {
    return CHANNEL_META[channel];
  }

  channelIcon(channel: Channel): string {
    return CHANNEL_META[channel].icon.replace('icofont-', '');
  }

  statusLabel(status: Conversation['status']): string {
    return { online: 'online', offline: 'offline', away: 'ausente', busy: 'ocupado' }[status];
  }

  lastMessage(conversation: Conversation): string {
    const last = conversation.messages.at(-1);
    if (!last) return '';
    return (last.from === 'agent' ? 'Você: ' : '') + last.text;
  }

  select(id: number): void {
    this.selectedId.set(id);
    this.conversations.update((list) =>
      list.map((c) => (c.id === id ? { ...c, unread: 0 } : c)),
    );
    this.scrollToBottom();
  }

  send(): void {
    const text = this.draft().trim();
    const conversation = this.selected();
    if (!text || !conversation) return;

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    this.appendMessage(conversation.id, { id: Date.now(), from: 'agent', text, time });
    this.draft.set('');
    this.scrollToBottom();

    // Resposta simulada do cliente.
    this.typing.set(true);
    setTimeout(() => {
      this.typing.set(false);
      this.appendMessage(conversation.id, {
        id: Date.now() + 1,
        from: 'customer',
        text: 'Perfeito, obrigado pelo retorno! 🙌',
        time,
      });
      this.scrollToBottom();
    }, 1800);
  }

  private appendMessage(conversationId: number, message: ChatMessage): void {
    this.conversations.update((list) =>
      list.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, message], time: message.time }
          : c,
      ),
    );
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const el = this.scroller()?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    });
  }

  setTicketStatus(status: string): void {
    const id = this.selectedId();
    this.conversations.update((list) =>
      list.map((c) => (c.id === id ? { ...c, ticketStatus: status } : c)),
    );
    this.toast.success('Status atualizado');
  }

  setAgent(agent: string): void {
    const id = this.selectedId();
    this.conversations.update((list) =>
      list.map((c) => (c.id === id ? { ...c, agent } : c)),
    );
    this.toast.success('Atendimento transferido', `Novo responsável: ${agent}`);
  }

  onAction(item: AtmDropdownItem): void {
    this.notify(item.label);
  }

  notify(message: string): void {
    this.toast.info(message, 'Ação de exemplo — conecte à sua API.');
  }
}
