import { ChangeDetectionStrategy, Component, computed, effect, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { AtmThemeService } from '../../core/ui';
import { AtmToastContainer } from '../../core/ui';

interface MenuItem {
  label: string;
  link: string;
  fragment?: string;
  badge?: string;
}

interface MenuGroup {
  label: string;
  icon: string;
  items: MenuItem[];
}

const MENU: MenuGroup[] = [
  {
    label: 'Começando',
    icon: 'icofont-rocket-alt-2',
    items: [{ label: 'Introdução', link: '/' }],
  },
  {
    label: 'Botões',
    icon: 'icofont-ui-press',
    items: [
      { label: 'Button', link: '/buttons', fragment: 'button' },
      { label: 'ButtonGroup', link: '/buttons', fragment: 'button-group' },
      { label: 'CloseButton', link: '/buttons', fragment: 'close-button' },
      { label: 'ToggleButton', link: '/buttons', fragment: 'toggle-button' },
      { label: 'ToggleButtonGroup', link: '/buttons', fragment: 'toggle-button-group' },
    ],
  },
  {
    label: 'Entradas',
    icon: 'icofont-ui-edit',
    items: [
      { label: 'Input', link: '/inputs', fragment: 'input' },
      { label: 'InputMask', link: '/inputs', fragment: 'input-mask' },
      { label: 'Currency', link: '/inputs', fragment: 'input-currency' },
      { label: 'InputGroup', link: '/inputs', fragment: 'input-group' },
      { label: 'TextArea', link: '/inputs', fragment: 'textarea' },
      { label: 'NumberField', link: '/inputs', fragment: 'number-field' },
      { label: 'SearchField', link: '/inputs', fragment: 'search-field' },
      { label: 'InputOTP', link: '/inputs', fragment: 'input-otp' },
      { label: 'TagGroup', link: '/inputs', fragment: 'tag-group' },
      { label: 'Form & Fieldset', link: '/inputs', fragment: 'form' },
    ],
  },
  {
    label: 'Seleção',
    icon: 'icofont-ui-check',
    items: [
      { label: 'Checkbox', link: '/selection', fragment: 'checkbox' },
      { label: 'CheckboxGroup', link: '/selection', fragment: 'checkbox-group' },
      { label: 'RadioGroup', link: '/selection', fragment: 'radio-group' },
      { label: 'Switch', link: '/selection', fragment: 'switch' },
      { label: 'Slider', link: '/selection', fragment: 'slider' },
      { label: 'Select', link: '/selects', fragment: 'select' },
      { label: 'ListBox', link: '/selects', fragment: 'listbox' },
      { label: 'Autocomplete', link: '/selects', fragment: 'autocomplete' },
      { label: 'Tags', link: '/selects', fragment: 'tags' },
      { label: 'Dropdown', link: '/dropdowns', fragment: 'dropdown' },
      { label: 'Dropdown Remote', link: '/dropdowns', fragment: 'dropdown-remote', badge: 'API' },
    ],
  },
  {
    label: 'Datas',
    icon: 'icofont-ui-calendar',
    items: [
      { label: 'Calendar', link: '/dates', fragment: 'calendar' },
      { label: 'RangeCalendar', link: '/dates', fragment: 'range-calendar' },
      { label: 'DatePicker', link: '/dates', fragment: 'date-picker' },
      { label: 'DatePicker editável', link: '/dates', fragment: 'date-picker-editable' },
      { label: 'DateRangePicker', link: '/dates', fragment: 'date-range-picker' },
      { label: 'TimeField', link: '/dates', fragment: 'time-field' },
    ],
  },
  {
    label: 'Overlays',
    icon: 'icofont-layers',
    items: [
      { label: 'Modal', link: '/overlays', fragment: 'modal' },
      { label: 'Dynamic Dialog', link: '/overlays', fragment: 'dynamic-dialog', badge: 'novo' },
      { label: 'AlertDialog', link: '/overlays', fragment: 'alert-dialog' },
      { label: 'Drawer', link: '/overlays', fragment: 'drawer' },
      { label: 'Popover', link: '/overlays', fragment: 'popover' },
      { label: 'Tooltip', link: '/overlays', fragment: 'tooltip' },
      { label: 'Toast', link: '/overlays', fragment: 'toast' },
    ],
  },
  {
    label: 'Feedback',
    icon: 'icofont-info-circle',
    items: [
      { label: 'Alert', link: '/feedback', fragment: 'alert' },
      { label: 'ProgressBar', link: '/feedback', fragment: 'progress-bar' },
      { label: 'ProgressCircle', link: '/feedback', fragment: 'progress-circle' },
      { label: 'Meter', link: '/feedback', fragment: 'meter' },
      { label: 'Skeleton', link: '/feedback', fragment: 'skeleton' },
      { label: 'Spinner', link: '/feedback', fragment: 'spinner' },
    ],
  },
  {
    label: 'Exibição',
    icon: 'icofont-eye-alt',
    items: [
      { label: 'Avatar', link: '/display', fragment: 'avatar' },
      { label: 'Badge', link: '/display', fragment: 'badge' },
      { label: 'Chip', link: '/display', fragment: 'chip' },
      { label: 'Card', link: '/display', fragment: 'card' },
      { label: 'Surface', link: '/display', fragment: 'surface' },
      { label: 'Accordion', link: '/display', fragment: 'accordion' },
      { label: 'Tabs', link: '/display', fragment: 'tabs' },
      { label: 'Tabs — Overflow', link: '/display', fragment: 'tabs-overflow' },
      { label: 'Table', link: '/data', fragment: 'table' },
      { label: 'Table — Filtros', link: '/data', fragment: 'table-filters', badge: 'novo' },
      { label: 'Table — Seleção', link: '/data', fragment: 'table-selection', badge: 'novo' },
      { label: 'Table — Scroll', link: '/data', fragment: 'table-scroll', badge: 'novo' },
      { label: 'Table — Remote', link: '/data', fragment: 'table-remote', badge: 'API' },
      { label: 'Pagination', link: '/data', fragment: 'pagination' },
      { label: 'Breadcrumbs', link: '/data', fragment: 'breadcrumbs' },
      { label: 'Toolbar', link: '/data', fragment: 'toolbar' },
      { label: 'Typography', link: '/display', fragment: 'typography' },
      { label: 'Kbd & Link', link: '/display', fragment: 'misc' },
      { label: 'Separator', link: '/display', fragment: 'separator' },
      { label: 'ScrollShadow', link: '/display', fragment: 'scroll-shadow' },
    ],
  },
  {
    label: 'Gráficos',
    icon: 'icofont-chart-bar-graph',
    items: [
      { label: 'Linhas & Área', link: '/charts', fragment: 'chart-line', badge: 'novo' },
      { label: 'Colunas & Barras', link: '/charts', fragment: 'chart-bar' },
      { label: 'Empilhado', link: '/charts', fragment: 'chart-bar-stacked' },
      { label: 'Misto', link: '/charts', fragment: 'chart-mixed' },
      { label: 'Range Bar', link: '/charts', fragment: 'chart-range', badge: 'novo' },
      { label: 'Scatter', link: '/charts', fragment: 'chart-scatter', badge: 'novo' },
      { label: 'Colunas de pontos', link: '/charts', fragment: 'chart-dots', badge: 'novo' },
      { label: 'Progresso segmentado', link: '/charts', fragment: 'chart-segments', badge: 'novo' },
      { label: 'Pie & Donut', link: '/charts', fragment: 'chart-pie' },
      { label: 'Radar', link: '/charts', fragment: 'chart-radar' },
      { label: 'Radial & Gauge', link: '/charts', fragment: 'chart-radial', badge: 'novo' },
      { label: 'Funnel', link: '/charts', fragment: 'chart-funnel', badge: 'novo' },
      { label: 'Sparklines', link: '/charts', fragment: 'chart-sparkline' },
      { label: 'Configurações', link: '/charts', fragment: 'chart-config' },
    ],
  },
  {
    label: 'Diagramas',
    icon: 'icofont-site-map',
    items: [
      { label: 'Flow — Básico', link: '/flow', fragment: 'flow-basic', badge: 'novo' },
      { label: 'Flow — Custom nodes', link: '/flow', fragment: 'flow-custom', badge: 'novo' },
      { label: 'Flow — Grupos', link: '/flow', fragment: 'flow-groups', badge: 'novo' },
      { label: 'Flow — Node componente', link: '/flow', fragment: 'flow-component-nodes', badge: 'novo' },
      { label: 'Flow — Ports tipados', link: '/flow', fragment: 'flow-types', badge: 'novo' },
      { label: 'Flow — Interações', link: '/flow', fragment: 'flow-interaction', badge: 'novo' },
      { label: 'Flow — Add ao soltar', link: '/flow', fragment: 'flow-add-drop', badge: 'novo' },
      { label: 'Flow — Eventos', link: '/flow', fragment: 'flow-events', badge: 'novo' },
      { label: 'Flow — Layout & JSON', link: '/flow', fragment: 'flow-json', badge: 'novo' },
      { label: 'Flow — Stress test', link: '/flow', fragment: 'flow-stress', badge: 'novo' },
    ],
  },
  {
    label: 'Cores',
    icon: 'icofont-color-picker',
    items: [
      { label: 'ColorSwatch', link: '/colors', fragment: 'color-swatch' },
      { label: 'ColorSwatchPicker', link: '/colors', fragment: 'color-swatch-picker' },
      { label: 'ColorField', link: '/colors', fragment: 'color-field' },
    ],
  },
];

@Component({
  selector: 'showcase-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, AtmToastContainer],
  template: `
    <div class="flex min-h-screen">
      <!-- Sidebar -->
      <aside
        class="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-surface
          transition-transform duration-300 max-lg:shadow-atm-lg"
        [class.max-lg:-translate-x-full]="!sidebarOpen()"
      >
        <div class="flex h-16 shrink-0 items-center gap-2.5 border-b border-line px-5">
          <span
            class="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-black
              text-primary-contrast"
          >
            A
          </span>
          <div>
            <span class="block text-sm leading-tight font-bold text-ink">Atmus UI</span>
            <span class="block text-[10px] leading-tight text-ink-faint">v1.0 · Angular 20</span>
          </div>
        </div>

        <div class="p-3">
          <div class="atm-field flex h-9 items-center gap-2 px-2.5 text-sm">
            <i class="icofont-ui-search text-xs text-ink-faint" aria-hidden="true"></i>
            <input
              type="text"
              placeholder="Filtrar componentes..."
              class="h-full w-full bg-transparent outline-none placeholder:text-ink-faint"
              [value]="filter()"
              (input)="onFilter($event)"
            />
          </div>
        </div>

        <nav class="flex-1 overflow-y-auto px-3 pb-6">
          @for (group of filteredMenu(); track group.label) {
            <button
              type="button"
              class="atm-focus mt-0.5 flex w-full cursor-pointer items-center gap-2.5 rounded-lg
                px-2 py-2 text-left text-[13px] font-semibold text-ink transition-colors
                hover:bg-surface-alt"
              [attr.aria-expanded]="isOpen(group)"
              (click)="toggleGroup(group.label)"
            >
              <span
                class="flex size-6 shrink-0 items-center justify-center rounded-md text-xs
                  transition-colors"
                [class]="
                  isGroupActive(group)
                    ? 'bg-primary-soft text-primary'
                    : 'bg-surface-alt text-ink-muted'
                "
              >
                <i [class]="group.icon" aria-hidden="true"></i>
              </span>
              {{ group.label }}
              <span class="ml-auto flex items-center gap-1.5">
                @if (!isOpen(group) && isGroupActive(group)) {
                  <span class="size-1.5 rounded-full bg-primary"></span>
                }
                <i
                  class="icofont-simple-down text-[10px] text-ink-faint transition-transform
                    duration-200"
                  [class.-rotate-90]="!isOpen(group)"
                  aria-hidden="true"
                ></i>
              </span>
            </button>

            <div
              class="grid transition-[grid-template-rows] duration-200 ease-out"
              [style.grid-template-rows]="isOpen(group) ? '1fr' : '0fr'"
            >
              <div class="min-h-0 overflow-hidden">
                <ul class="mt-0.5 mb-1.5 ml-[19px] border-l border-line">
                  @for (item of group.items; track item.label) {
                    <li>
                      <a
                        [routerLink]="item.link"
                        [fragment]="item.fragment"
                        class="-ml-px flex items-center justify-between gap-2 border-l-2 py-1.5
                          pr-2 pl-3.5 text-[13px] transition-colors"
                        [class]="
                          isItemActive(item)
                            ? 'border-primary font-medium text-primary'
                            : 'border-transparent text-ink-muted hover:border-ink-faint/40 hover:text-ink'
                        "
                        (click)="sidebarOpen.set(false)"
                      >
                        {{ item.label }}
                        @if (item.badge) {
                          <span
                            class="rounded-full bg-primary-soft px-1.5 py-0.5 text-[9px] font-bold
                              text-primary uppercase"
                          >
                            {{ item.badge }}
                          </span>
                        }
                      </a>
                    </li>
                  }
                </ul>
              </div>
            </div>
          }

          @if (!filteredMenu().length) {
            <p class="px-2 pt-6 text-center text-sm text-ink-faint">
              Nenhum componente encontrado.
            </p>
          }
        </nav>
      </aside>

      @if (sidebarOpen()) {
        <div
          class="fixed inset-0 z-30 bg-[var(--atm-overlay)] lg:hidden"
          (click)="sidebarOpen.set(false)"
        ></div>
      }

      <!-- Main -->
      <div class="flex min-w-0 flex-1 flex-col lg:pl-64">
        <header
          class="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-line
            bg-surface/80 px-5 backdrop-blur-md"
        >
          <button
            type="button"
            class="atm-focus flex size-9 cursor-pointer items-center justify-center rounded-atm
              text-ink-muted hover:bg-surface-alt lg:hidden"
            aria-label="Menu"
            (click)="sidebarOpen.set(!sidebarOpen())"
          >
            <i class="icofont-navigation-menu" aria-hidden="true"></i>
          </button>
          <span class="text-sm text-ink-muted">
            Biblioteca de componentes · prefixo
            <code class="rounded bg-surface-alt px-1.5 py-0.5 font-mono text-xs text-primary">atm</code>
          </span>
          <span class="flex-1"></span>
          <button
            type="button"
            class="atm-focus flex size-9 cursor-pointer items-center justify-center rounded-atm
              text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink"
            [attr.aria-label]="theme.isDark() ? 'Tema claro' : 'Tema escuro'"
            (click)="theme.toggle()"
          >
            <i [class]="theme.isDark() ? 'icofont-sun' : 'icofont-moon'" aria-hidden="true"></i>
          </button>
        </header>

        <main class="mx-auto w-full max-w-4xl flex-1 px-5 py-8 lg:px-10">
          <router-outlet />
        </main>
      </div>
    </div>

    <atm-toast-container />
  `,
})
export class ShowcaseShell {
  private readonly router = inject(Router);
  readonly theme = inject(AtmThemeService);
  readonly sidebarOpen = signal(false);
  readonly filter = signal('');

  /** Grupos fechados (por label). Começa tudo fechado; o grupo da rota atual abre via effect. */
  private readonly collapsed = signal<Set<string>>(new Set(MENU.map((g) => g.label)));

  private readonly currentUrl = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map((e) => e.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  private readonly currentPath = computed(() => {
    const url = this.currentUrl().split('#')[0].split('?')[0];
    return url || '/';
  });

  private readonly currentFragment = computed<string | null>(
    () => this.currentUrl().split('#')[1] ?? null,
  );

  readonly filteredMenu = computed(() => {
    const term = this.filter().trim().toLowerCase();
    if (!term) return MENU;
    return MENU.map((group) => ({
      ...group,
      items: group.items.filter((i) => i.label.toLowerCase().includes(term)),
    })).filter((group) => group.items.length);
  });

  constructor() {
    // Ao navegar, expande automaticamente o(s) grupo(s) que contêm a rota atual.
    effect(() => {
      const path = this.currentPath();
      const active = MENU.filter((g) => g.items.some((i) => i.link === path));
      if (!active.length) return;
      this.collapsed.update((set) => {
        const next = new Set(set);
        active.forEach((g) => next.delete(g.label));
        return next;
      });
    });
  }

  /** Enquanto filtra, tudo fica expandido para mostrar os resultados. */
  isOpen(group: MenuGroup): boolean {
    return this.filter().trim() ? true : !this.collapsed().has(group.label);
  }

  isGroupActive(group: MenuGroup): boolean {
    const path = this.currentPath();
    return group.items.some((i) => i.link === path);
  }

  isItemActive(item: MenuItem): boolean {
    if (item.link !== this.currentPath()) return false;
    const fragment = this.currentFragment();
    if (fragment) return item.fragment === fragment;
    // Sem fragment na URL: destaca só o primeiro item daquela rota.
    return MENU.flatMap((g) => g.items).find((i) => i.link === item.link) === item;
  }

  toggleGroup(label: string): void {
    this.collapsed.update((set) => {
      const next = new Set(set);
      if (next.has(label)) next.delete(label);
      else next.add(label);
      return next;
    });
  }

  onFilter(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
  }
}
