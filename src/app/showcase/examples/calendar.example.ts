import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AtmButton,
  AtmCalendar,
  AtmCalendarEvent,
  AtmCalendarEventChange,
  AtmCalendarRange,
  AtmCheckbox,
  AtmColor,
  AtmEventCalendar,
  AtmEventCalendarView,
  AtmInput,
  AtmLabel,
  AtmModal,
  AtmSelect,
  AtmSelectOption,
  AtmTimeField,
  AtmToastService,
} from '../../../core/ui';

interface Category {
  id: string;
  label: string;
  color: AtmColor;
}

const CATEGORIES: Category[] = [
  { id: 'meeting', label: 'Reuniões', color: 'primary' },
  { id: 'travel', label: 'Viagens', color: 'info' },
  { id: 'birthday', label: 'Aniversários', color: 'success' },
  { id: 'conference', label: 'Conferências', color: 'warning' },
  { id: 'personal', label: 'Pessoal', color: 'danger' },
];

/** Cria uma data no mês atual (dia + hora), para o exemplo ficar sempre "vivo". */
function at(day: number, hour = 0, minute = 0): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), day, hour, minute);
}

function buildEvents(): AtmCalendarEvent[] {
  const today = new Date().getDate();
  return [
    {
      id: 'e1',
      title: 'Daily do time',
      start: at(today, 9, 30),
      end: at(today, 9, 45),
      color: 'primary',
      category: 'meeting',
      location: 'Google Meet',
    },
    {
      id: 'e2',
      title: 'Review da Sprint 14',
      start: at(today, 14, 0),
      end: at(today, 15, 30),
      color: 'primary',
      category: 'meeting',
      location: 'Sala Aquário',
    },
    {
      id: 'e3',
      title: 'Call com cliente Jampack',
      start: at(today + 1, 11, 0),
      end: at(today + 1, 12, 0),
      color: 'primary',
      category: 'meeting',
      location: 'Zoom',
    },
    {
      id: 'e4',
      title: 'Voo GRU → Florianópolis',
      start: at(today + 1, 14, 35),
      end: at(today + 1, 16, 0),
      color: 'info',
      category: 'travel',
      location: 'Aeroporto de Guarulhos',
    },
    {
      id: 'e5',
      title: 'Awwwards Conference',
      start: at(today + 2, 0, 0),
      end: at(today + 4, 23, 59),
      allDay: true,
      color: 'warning',
      category: 'conference',
      location: 'CentroSul, Florianópolis',
    },
    {
      id: 'e6',
      title: 'Aniversário da Rose',
      start: at(today + 4),
      allDay: true,
      color: 'success',
      category: 'birthday',
    },
    {
      id: 'e7',
      title: 'Planejamento Q3 com diretoria',
      start: at(today + 6, 10, 0),
      end: at(today + 6, 12, 30),
      color: 'primary',
      category: 'meeting',
      location: 'Sede — 12º andar',
    },
    {
      id: 'e8',
      title: 'Dentista',
      start: at(today + 6, 16, 0),
      end: at(today + 6, 17, 0),
      color: 'danger',
      category: 'personal',
    },
    {
      id: 'e9',
      title: 'Feira do produtor',
      start: at(today - 2, 8, 0),
      end: at(today - 2, 9, 0),
      color: 'danger',
      category: 'personal',
      location: 'Mercado municipal',
    },
    {
      id: 'e10',
      title: 'Onboarding — novos devs',
      start: at(today - 1, 9, 0),
      end: at(today - 1, 11, 0),
      color: 'primary',
      category: 'meeting',
      location: 'Google Meet',
    },
    {
      id: 'e11',
      title: '1:1 com a Gabriela',
      start: at(today, 10, 0),
      end: at(today, 10, 30),
      color: 'primary',
      category: 'meeting',
    },
    {
      id: 'e12',
      title: 'Academia',
      start: at(today, 7, 0),
      end: at(today, 8, 0),
      color: 'danger',
      category: 'personal',
    },
    {
      id: 'e13',
      title: 'Workshop de acessibilidade',
      start: at(today + 8, 14, 0),
      end: at(today + 8, 18, 0),
      color: 'warning',
      category: 'conference',
      location: 'Auditório B',
    },
    {
      id: 'e14',
      title: 'Aniversário do Diego',
      start: at(today + 11),
      allDay: true,
      color: 'success',
      category: 'birthday',
    },
    {
      id: 'e15',
      title: 'Retrospectiva do trimestre',
      start: at(today + 13, 15, 0),
      end: at(today + 13, 17, 0),
      color: 'primary',
      category: 'meeting',
      location: 'Sala Aquário',
    },
    {
      id: 'e16',
      title: 'Viagem — visita ao cliente Indigo',
      start: at(today + 15, 6, 0),
      end: at(today + 16, 22, 0),
      color: 'info',
      category: 'travel',
      location: 'Indonésia',
    },
  ];
}

@Component({
  selector: 'calendar-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    AtmEventCalendar,
    AtmCalendar,
    AtmButton,
    AtmCheckbox,
    AtmModal,
    AtmInput,
    AtmLabel,
    AtmSelect,
    AtmTimeField,
  ],
  host: { class: 'block' },
  template: `
    <div class="flex items-start gap-6">
      <!-- ===== Sidebar ===== -->
      <aside class="hidden w-64 shrink-0 space-y-6 xl:block">
        <atm-button [block]="true" icon="plus" (clicked)="openCreate()">Criar evento</atm-button>

        <div class="overflow-hidden rounded-atm-lg border border-line bg-surface">
          <atm-calendar [flat]="true" [value]="selectedDate()" (valueChange)="onMiniPick($event)" />
        </div>

        <section>
          <h3 class="mb-2 text-xs font-semibold tracking-wide text-ink-faint uppercase">
            Próximos eventos
          </h3>
          <ul class="space-y-1">
            @for (event of upcoming(); track event.id) {
              <li>
                <button
                  type="button"
                  class="atm-focus flex w-full cursor-pointer items-start gap-2.5 rounded-atm
                    px-2 py-2 text-left transition-colors hover:bg-surface-alt"
                  (click)="onEventClick(event)"
                >
                  <span
                    class="mt-1.5 size-2 shrink-0 rounded-full"
                    [class]="dotClass(event.color)"
                  ></span>
                  <span class="min-w-0">
                    <span class="block truncate text-[13px] font-medium text-ink">
                      {{ event.title }}
                    </span>
                    <span class="block text-[11px] text-ink-muted">
                      {{ upcomingLabel(event) }}
                    </span>
                  </span>
                </button>
              </li>
            } @empty {
              <li class="px-2 py-2 text-xs text-ink-faint">Nada por vir.</li>
            }
          </ul>
        </section>

        <section>
          <h3 class="mb-2 text-xs font-semibold tracking-wide text-ink-faint uppercase">
            Categorias
          </h3>
          <div class="space-y-1">
            @for (category of categories; track category.id) {
              <label
                class="flex cursor-pointer items-center gap-2.5 rounded-atm px-2 py-1.5
                  transition-colors hover:bg-surface-alt"
              >
                <atm-checkbox
                  [ngModel]="enabled()[category.id]"
                  (ngModelChange)="toggleCategory(category.id, $event)"
                />
                <span class="size-2.5 rounded-full" [class]="dotClass(category.color)"></span>
                <span class="text-[13px] text-ink">{{ category.label }}</span>
                <span class="ml-auto text-[11px] text-ink-faint">
                  {{ countFor(category.id) }}
                </span>
              </label>
            }
          </div>
        </section>
      </aside>

      <!-- ===== Calendar ===== -->
      <atm-event-calendar
        class="min-h-[42rem] min-w-0 flex-1"
        [events]="visibleEvents()"
        [(date)]="date"
        [(view)]="view"
        [workStart]="8"
        [workEnd]="19"
        [slotMinutes]="30"
        (addEvent)="openCreate()"
        (eventClick)="onEventClick($event)"
        (dayClick)="openCreate($event)"
        (rangeSelect)="openCreateRange($event)"
        (eventChange)="onEventChange($event)"
      />
    </div>

    <!-- ===== Create event modal ===== -->
    <atm-modal [(open)]="modalOpen" header="Novo evento" width="26rem">
      <div class="space-y-4">
        <div>
          <atm-label>Título</atm-label>
          <atm-input placeholder="Ex.: Reunião de alinhamento" [(ngModel)]="draftTitle" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <atm-label>Início</atm-label>
            <atm-time-field [(ngModel)]="draftStart" />
          </div>
          <div>
            <atm-label>Fim</atm-label>
            <atm-time-field [(ngModel)]="draftEnd" />
          </div>
        </div>
        <div>
          <atm-label>Categoria</atm-label>
          <atm-select [options]="categoryOptions" [(ngModel)]="draftCategory" />
        </div>
        <div>
          <atm-label>Local (opcional)</atm-label>
          <atm-input placeholder="Ex.: Google Meet" [(ngModel)]="draftLocation" />
        </div>
        <div class="flex justify-end gap-2 pt-1">
          <atm-button variant="ghost" color="neutral" (clicked)="modalOpen.set(false)">
            Cancelar
          </atm-button>
          <atm-button icon="check-alt" [disabled]="!draftTitle().trim()" (clicked)="createEvent()">
            Salvar evento
          </atm-button>
        </div>
      </div>
    </atm-modal>
  `,
})
export class CalendarExample {
  private readonly toast = inject(AtmToastService);

  readonly categories = CATEGORIES;
  readonly events = signal<AtmCalendarEvent[]>(buildEvents());
  readonly date = signal(new Date());
  readonly view = signal<AtmEventCalendarView>('month');
  readonly selectedDate = computed(() => this.date());

  readonly enabled = signal<Record<string, boolean>>(
    Object.fromEntries(CATEGORIES.map((c) => [c.id, true])),
  );

  readonly visibleEvents = computed(() => {
    const enabled = this.enabled();
    return this.events().filter((e) => !e.category || enabled[e.category]);
  });

  readonly upcoming = computed(() => {
    const now = Date.now();
    return this.visibleEvents()
      .filter((e) => e.start.getTime() >= now || e.allDay)
      .filter((e) => e.start.getTime() >= now - 24 * 60 * 60 * 1000)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 5);
  });

  readonly modalOpen = signal(false);
  readonly draftTitle = signal('');
  readonly draftStart = signal('09:00');
  readonly draftEnd = signal('10:00');
  readonly draftCategory = signal('meeting');
  readonly draftLocation = signal('');
  private draftDate = new Date();

  readonly categoryOptions: AtmSelectOption<string>[] = CATEGORIES.map((c) => ({
    label: c.label,
    value: c.id,
  }));

  dotClass(color?: AtmColor): string {
    const map: Record<AtmColor, string> = {
      primary: 'bg-primary',
      success: 'bg-success',
      warning: 'bg-warning',
      danger: 'bg-danger',
      info: 'bg-info',
      neutral: 'bg-ink-faint',
    };
    return map[color ?? 'primary'];
  }

  countFor(categoryId: string): number {
    return this.events().filter((e) => e.category === categoryId).length;
  }

  toggleCategory(id: string, value: boolean): void {
    this.enabled.update((current) => ({ ...current, [id]: value }));
  }

  onMiniPick(date: Date | null): void {
    if (!date) return;
    this.date.set(date);
    if (this.view() === 'month') this.view.set('day');
  }

  upcomingLabel(event: AtmCalendarEvent): string {
    const day = event.start.getDate();
    const month = event.start.toLocaleDateString('pt-BR', { month: 'short' });
    if (event.allDay) return `${day} ${month} · dia todo`;
    const time = event.start.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${day} ${month} · ${time}`;
  }

  onEventClick(event: AtmCalendarEvent): void {
    this.toast.info(
      event.title,
      [event.location, event.category ? this.labelFor(event.category) : '']
        .filter(Boolean)
        .join(' · ') || 'Abra aqui o detalhe do evento.',
    );
  }

  private labelFor(categoryId: string): string {
    return CATEGORIES.find((c) => c.id === categoryId)?.label ?? categoryId;
  }

  openCreate(date?: Date): void {
    this.draftDate = date ?? this.date();
    if (date && date.getHours() > 0) {
      this.draftStart.set(String(date.getHours()).padStart(2, '0') + ':00');
      this.draftEnd.set(String(Math.min(23, date.getHours() + 1)).padStart(2, '0') + ':00');
    }
    this.draftTitle.set('');
    this.draftLocation.set('');
    this.modalOpen.set(true);
  }

  /** Slot clicado ou área selecionada por arraste na visão de semana/dia. */
  openCreateRange(range: AtmCalendarRange): void {
    this.draftDate = range.start;
    this.draftStart.set(this.hhmm(range.start));
    this.draftEnd.set(this.hhmm(range.end));
    this.draftTitle.set('');
    this.draftLocation.set('');
    this.modalOpen.set(true);
  }

  /** Evento movido (drag) ou redimensionado no calendário. */
  onEventChange(change: AtmCalendarEventChange): void {
    this.events.update((events) =>
      events.map((e) =>
        e.id === change.event.id ? { ...e, start: change.start, end: change.end } : e,
      ),
    );
    const day = change.start.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    this.toast.success(
      'Evento atualizado',
      `${change.event.title} · ${day}, ${this.hhmm(change.start)} – ${this.hhmm(change.end)}`,
    );
  }

  private hhmm(date: Date): string {
    return (
      String(date.getHours()).padStart(2, '0') + ':' + String(date.getMinutes()).padStart(2, '0')
    );
  }

  createEvent(): void {
    const [startHour, startMinute] = this.draftStart().split(':').map(Number);
    const [endHour, endMinute] = this.draftEnd().split(':').map(Number);
    const base = this.draftDate;
    const start = new Date(base.getFullYear(), base.getMonth(), base.getDate(), startHour || 0, startMinute || 0);
    const end = new Date(base.getFullYear(), base.getMonth(), base.getDate(), endHour || 0, endMinute || 0);
    const category = this.categories.find((c) => c.id === this.draftCategory());

    this.events.update((events) => [
      ...events,
      {
        id: 'e' + Date.now(),
        title: this.draftTitle().trim(),
        start,
        end: end > start ? end : undefined,
        color: category?.color ?? 'primary',
        category: category?.id,
        location: this.draftLocation().trim() || undefined,
      },
    ]);
    this.modalOpen.set(false);
    this.toast.success('Evento criado', this.draftTitle());
  }
}
