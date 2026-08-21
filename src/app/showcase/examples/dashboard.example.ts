import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import {
  AtmAvatar,
  AtmBadge,
  AtmButton,
  AtmCard,
  AtmChart,
  AtmChartDataset,
  AtmDateRangePicker,
  AtmProgressBar,
  AtmProgressCircle,
  AtmSelect,
  AtmSelectOption,
  AtmTable,
  AtmTableColumn,
  AtmToastService,
} from '@atmus/ngui';
import { FormsModule } from '@angular/forms';

interface Kpi {
  label: string;
  value: string;
  delta: number;
  icon: string;
  iconClass: string;
  spark: number[];
}

interface Seller {
  name: string;
  src: string;
  amount: number;
  goal: number;
}

interface Order extends Record<string, unknown> {
  id: string;
  customer: string;
  product: string;
  channel: string;
  date: string;
  total: number;
  status: 'paid' | 'pending' | 'canceled';
}

const MONTH_LABELS = ['Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'];

const ORDERS: Order[] = [
  { id: '#4821', customer: 'Jampack Ltda', product: 'Plano Business anual', channel: 'Site', date: '23/07/2026', total: 12490, status: 'paid' },
  { id: '#4820', customer: 'Studio Fê', product: 'Plano Pro mensal', channel: 'Indicação', date: '23/07/2026', total: 299, status: 'pending' },
  { id: '#4819', customer: 'Construtora Alfa', product: 'Plano Business + Onboarding', channel: 'Vendas', date: '22/07/2026', total: 8790, status: 'paid' },
  { id: '#4818', customer: 'Log Express', product: 'Módulo de rastreamento', channel: 'Site', date: '22/07/2026', total: 1590, status: 'paid' },
  { id: '#4817', customer: 'JF Contabilidade', product: 'Plano Starter anual', channel: 'Site', date: '21/07/2026', total: 1188, status: 'canceled' },
  { id: '#4816', customer: 'Grupo Vetor S.A.', product: 'Plano Enterprise (40 seats)', channel: 'Vendas', date: '21/07/2026', total: 38400, status: 'pending' },
  { id: '#4815', customer: 'Café Central', product: 'Plano Starter mensal', channel: 'Ads', date: '20/07/2026', total: 99, status: 'paid' },
  { id: '#4814', customer: 'Clínica Vida', product: 'Plano Pro anual', channel: 'Indicação', date: '20/07/2026', total: 2990, status: 'paid' },
  { id: '#4813', customer: 'Escola Nova Era', product: 'Plano Business mensal', channel: 'Vendas', date: '19/07/2026', total: 890, status: 'paid' },
  { id: '#4812', customer: 'Oficina do Pedal', product: 'Plano Starter mensal', channel: 'Ads', date: '19/07/2026', total: 99, status: 'canceled' },
];

const SELLERS: Seller[] = [
  { name: 'Ana Souza', src: 'https://i.pravatar.cc/80?img=1', amount: 84200, goal: 90000 },
  { name: 'Diego Rocha', src: 'https://i.pravatar.cc/80?img=14', amount: 71800, goal: 80000 },
  { name: 'Gabriela Reis', src: 'https://i.pravatar.cc/80?img=9', amount: 66500, goal: 70000 },
  { name: 'Bruno Lima', src: 'https://i.pravatar.cc/80?img=12', amount: 52300, goal: 70000 },
  { name: 'Elisa Prado', src: 'https://i.pravatar.cc/80?img=5', amount: 41900, goal: 60000 },
];

function brl(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

@Component({
  selector: 'dashboard-example',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    AtmCard,
    AtmChart,
    AtmBadge,
    AtmButton,
    AtmAvatar,
    AtmProgressBar,
    AtmProgressCircle,
    AtmTable,
    AtmSelect,
    AtmDateRangePicker,
  ],
  host: { class: 'block' },
  template: `
    <!-- ===== Header ===== -->
    <header class="mb-6 flex flex-wrap items-center gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl font-bold tracking-tight text-ink">Dashboard de vendas</h1>
        <p class="mt-1 text-sm text-ink-muted">Acompanhe receita, pedidos e metas do time comercial.</p>
      </div>
      <span class="flex-1"></span>
      <div class="w-44">
        <atm-select size="slim" [options]="periodOptions" [(ngModel)]="period" />
      </div>
      <atm-date-range-picker size="slim" class="w-64 max-sm:hidden" />
      <atm-button size="slim" variant="outline" color="neutral" icon="download-01" (clicked)="notify('Exportando relatório...')">
        Exportar
      </atm-button>
    </header>

    <!-- ===== KPIs ===== -->
    <div class="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      @for (kpi of kpis; track kpi.label) {
        <atm-card [padded]="false">
          <div class="p-5 pb-2">
            <div class="flex items-start justify-between">
              <div>
                <p class="text-xs font-medium text-ink-muted">{{ kpi.label }}</p>
                <p class="mt-1.5 text-2xl font-bold tracking-tight text-ink">{{ kpi.value }}</p>
              </div>
              <span
                class="flex size-10 items-center justify-center rounded-atm text-base"
                [class]="kpi.iconClass"
              >
                <i [class]="kpi.icon" aria-hidden="true"></i>
              </span>
            </div>
            <div class="mt-2 flex items-center gap-2">
              <atm-badge size="slim" [color]="kpi.delta >= 0 ? 'success' : 'danger'">
                <i
                  [class]="kpi.delta >= 0 ? 'atm atm-arrow-up-02' : 'atm atm-arrow-down-02'"
                  aria-hidden="true"
                ></i>
                {{ kpi.delta >= 0 ? '+' : '' }}{{ kpi.delta }}%
              </atm-badge>
              <span class="text-[11px] text-ink-faint">vs. mês anterior</span>
            </div>
          </div>
          <atm-chart
            type="area"
            [labels]="MONTH_LABELS"
            [datasets]="[{ label: kpi.label, data: kpi.spark }]"
            [height]="56"
            [legend]="false"
            [grid]="false"
            [xAxis]="false"
            [yAxis]="false"
            [markers]="false"
            [tooltip]="false"
            [animated]="false"
          />
        </atm-card>
      }
    </div>

    <!-- ===== Revenue + channels ===== -->
    <div class="mb-5 grid gap-4 xl:grid-cols-3">
      <atm-card class="xl:col-span-2" header="Receita × Meta" subheader="Últimos 6 meses (R$ mil)">
        <atm-chart
          type="area"
          [labels]="MONTH_LABELS"
          [datasets]="revenueDatasets"
          [height]="300"
          [format]="thousands"
        />
      </atm-card>
      <atm-card header="Vendas por canal" subheader="Participação na receita do mês">
        <atm-chart
          type="donut"
          [labels]="['Site', 'Time de vendas', 'Indicação', 'Ads']"
          [datasets]="[{ label: 'Canal', data: [38, 32, 18, 12] }]"
          [height]="300"
          donutLabel="Receita"
          [format]="percent"
        />
      </atm-card>
    </div>

    <!-- ===== Category + funnel + sellers ===== -->
    <div class="mb-5 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
      <atm-card header="Vendas por plano" subheader="Pedidos no período">
        <atm-chart
          type="bar"
          [labels]="['Starter', 'Pro', 'Business', 'Enterprise']"
          [datasets]="[
            { label: 'Novos', data: [86, 64, 38, 9] },
            { label: 'Renovações', data: [54, 47, 31, 6] }
          ]"
          [height]="280"
        />
      </atm-card>

      <atm-card header="Funil de conversão" subheader="Do lead ao fechamento">
        <atm-chart
          type="funnel"
          [labels]="['Leads', 'Qualificados', 'Proposta', 'Negociação', 'Fechado']"
          [datasets]="[{ label: 'Funil', data: [1240, 720, 410, 260, 187] }]"
          [height]="280"
          [legend]="false"
        />
      </atm-card>

      <atm-card header="Top vendedores" subheader="Meta individual do mês" [padded]="false">
        <ul>
          @for (seller of sellers; track seller.name; let i = $index) {
            <li class="flex items-center gap-3 border-b border-line px-5 py-3 last:border-0">
              <span class="w-4 text-xs font-bold text-ink-faint">{{ i + 1 }}</span>
              <atm-avatar size="slim" [name]="seller.name" [src]="seller.src" />
              <div class="min-w-0 flex-1">
                <div class="flex items-baseline justify-between gap-2">
                  <span class="truncate text-[13px] font-semibold text-ink">{{ seller.name }}</span>
                  <span class="shrink-0 text-xs font-medium text-ink-muted">
                    {{ format(seller.amount) }}
                  </span>
                </div>
                <atm-progress-bar
                  class="mt-1.5 block"
                  size="slim"
                  [value]="(seller.amount / seller.goal) * 100"
                  [color]="seller.amount >= seller.goal ? 'success' : 'primary'"
                />
              </div>
            </li>
          }
        </ul>
      </atm-card>
    </div>

    <!-- ===== Orders + quarter goal ===== -->
    <div class="grid gap-4 xl:grid-cols-3">
      <atm-card
        class="xl:col-span-2"
        header="Pedidos recentes"
        subheader="Últimas vendas em todos os canais"
        [padded]="false"
      >
        <atm-table
          size="slim"
          [columns]="orderColumns()"
          [rows]="orders"
          [paginator]="true"
          [pageSize]="6"
          trackBy="id"
        />
        <ng-template #statusTpl let-order>
          <atm-badge
            size="slim"
            [color]="order.status === 'paid' ? 'success' : order.status === 'pending' ? 'warning' : 'danger'"
            [dot]="true"
          >
            {{ statusLabel(order.status) }}
          </atm-badge>
        </ng-template>
      </atm-card>

      <atm-card header="Meta do trimestre" subheader="Q3 · Julho a Setembro">
        <div class="flex flex-col items-center gap-4 py-2">
          <atm-progress-circle [value]="68" size="large" color="primary" />
          <p class="text-center text-sm text-ink-muted">
            <strong class="text-ink">{{ format(316700) }}</strong> de
            <strong class="text-ink">{{ format(465000) }}</strong> — faltam
            {{ format(148300) }} para bater a meta.
          </p>
          <div class="grid w-full grid-cols-2 gap-3 text-center">
            <div class="rounded-atm bg-surface-alt px-3 py-2.5">
              <p class="text-[11px] text-ink-muted">Novos clientes</p>
              <p class="text-lg font-bold text-ink">142</p>
            </div>
            <div class="rounded-atm bg-surface-alt px-3 py-2.5">
              <p class="text-[11px] text-ink-muted">Churn</p>
              <p class="text-lg font-bold text-success">2,1%</p>
            </div>
          </div>
          <atm-button [block]="true" variant="soft" icon="chart-line" (clicked)="notify('Abrindo relatório completo...')">
            Ver relatório completo
          </atm-button>
        </div>
      </atm-card>
    </div>
  `,
})
export class DashboardExample {
  private readonly toast = inject(AtmToastService);
  private readonly statusTpl = viewChild<TemplateRef<{ $implicit: Order }>>('statusTpl');

  readonly MONTH_LABELS = MONTH_LABELS;
  readonly sellers = SELLERS;
  readonly orders = ORDERS;
  readonly period = signal('month');

  readonly periodOptions: AtmSelectOption<string>[] = [
    { label: 'Este mês', value: 'month' },
    { label: 'Último trimestre', value: 'quarter' },
    { label: 'Este ano', value: 'year' },
  ];

  readonly kpis: Kpi[] = [
    {
      label: 'Receita total',
      value: brl(128420),
      delta: 12.4,
      icon: 'atm atm-money-01',
      iconClass: 'bg-primary-soft text-primary',
      spark: [74, 82, 79, 96, 104, 128],
    },
    {
      label: 'Pedidos',
      value: '1.284',
      delta: 8.1,
      icon: 'atm atm-shopping-cart-01',
      iconClass: 'bg-info-soft text-info',
      spark: [820, 940, 890, 1020, 1150, 1284],
    },
    {
      label: 'Ticket médio',
      value: brl(486),
      delta: 3.9,
      icon: 'atm atm-tag-01',
      iconClass: 'bg-success-soft text-success',
      spark: [402, 415, 398, 441, 460, 486],
    },
    {
      label: 'Conversão',
      value: '15,1%',
      delta: -1.2,
      icon: 'atm atm-chart-line',
      iconClass: 'bg-warning-soft text-warning',
      spark: [16.4, 15.9, 16.8, 15.6, 15.4, 15.1],
    },
  ];

  readonly revenueDatasets: AtmChartDataset[] = [
    { label: 'Receita', data: [74, 82, 79, 96, 104, 128], type: 'area' },
    { label: 'Meta', data: [80, 85, 90, 95, 100, 110], type: 'line', dashed: true, markers: false },
  ];

  readonly orderColumns = computed<AtmTableColumn<Order>[]>(() => [
    { key: 'id', header: 'Pedido', width: '80px' },
    { key: 'customer', header: 'Cliente', sortable: true },
    { key: 'product', header: 'Produto' },
    { key: 'channel', header: 'Canal', width: '110px' },
    { key: 'date', header: 'Data', width: '110px' },
    {
      key: 'total',
      header: 'Valor',
      width: '120px',
      align: 'right',
      sortable: true,
      value: (order) => brl(order.total),
    },
    {
      key: 'status',
      header: 'Status',
      width: '130px',
      align: 'center',
      template: this.statusTpl(),
    },
  ]);

  readonly thousands = (value: number) => `R$ ${value}k`;
  readonly percent = (value: number) => `${value}%`;

  format(value: number): string {
    return brl(value);
  }

  statusLabel(status: Order['status']): string {
    return { paid: 'Pago', pending: 'Pendente', canceled: 'Cancelado' }[status];
  }

  notify(message: string): void {
    this.toast.info(message, 'Ação de exemplo — conecte à sua API.');
  }
}
