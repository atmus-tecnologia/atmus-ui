import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  AtmChart,
  AtmChartDataset,
  AtmChartPointEvent,
  AtmChartTreeEvent,
  AtmChartTreeNode,
  AtmToastService,
} from '../../../core/ui';
import { DemoPage, DemoSection } from '../demo-section.component';

@Component({
  selector: 'charts-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmChart, DemoPage, DemoSection],
  template: `
    <demo-page
      title="Gráficos"
      description="AtmChart renderiza em canvas HTML5 com animações, tooltip interativo, legenda clicável, dark mode automático e responsividade. Tipos: line, area, bar, bar-horizontal, pie, donut, radar, funnel (horizontal, vertical e pirâmide), heatmap, treemap com drill-down e mistos."
      importCode="import { AtmChart } from 'src/core/ui';"
    >
      <demo-section
        id="chart-line"
        title="Linhas & Área"
        description="Curvas suaves (smooth), marcadores, série tracejada e gradiente de área. Clique na legenda para ocultar séries."
        [code]="lineCode"
      >
        <div class="flex w-full flex-col gap-8">
          <atm-chart
            type="line"
            title="Receita x Despesas"
            subtitle="Últimos 12 meses"
            [labels]="meses"
            [datasets]="lineData"
            (pointClick)="onPoint($event)"
          />
          <atm-chart
            type="area"
            title="Sessões por semana"
            [labels]="semanas"
            [datasets]="areaData"
            [height]="260"
          />
        </div>
      </demo-section>

      <demo-section
        id="chart-bar"
        title="Colunas & Barras"
        description="Colunas agrupadas e barras horizontais com cantos arredondados. Clique numa coluna — o pointClick identifica a série exata clicada."
        [code]="barCode"
      >
        <div class="flex w-full flex-col gap-8">
          <atm-chart
            type="bar"
            title="Vendas por trimestre"
            [labels]="trimestres"
            [datasets]="barData"
            [height]="280"
            (pointClick)="onPoint($event)"
          />
          <atm-chart
            type="bar-horizontal"
            title="Top produtos"
            [labels]="produtos"
            [datasets]="barHData"
            [height]="260"
            [showValues]="true"
            [legend]="false"
          />
        </div>
      </demo-section>

      <demo-section
        id="chart-bar-stacked"
        title="Colunas empilhadas"
        description="[stacked]='true' empilha as séries de barras — vale também para bar-horizontal."
        [code]="stackedCode"
      >
        <atm-chart
          class="w-full"
          type="bar"
          title="Faturamento por canal"
          [labels]="meses.slice(0, 8)"
          [datasets]="stackedData"
          [stacked]="true"
          [height]="300"
        />
      </demo-section>

      <demo-section
        id="chart-mixed"
        title="Gráfico misto"
        description="Cada dataset pode sobrescrever o tipo do gráfico via 'type' — colunas + linha, área + linha etc."
        [code]="mixedCode"
      >
        <atm-chart
          class="w-full"
          type="bar"
          title="Receita x Meta"
          subtitle="Colunas com linha de tendência tracejada"
          [labels]="meses.slice(0, 9)"
          [datasets]="mixedData"
          [height]="300"
        />
      </demo-section>

      <demo-section
        id="chart-range"
        title="Range bar"
        description="Cápsulas flutuantes representando intervalos [mín, máx] — ótimo para oscilações de preço, temperatura, horários."
        [code]="rangeCode"
      >
        <atm-chart
          class="w-full"
          type="range-bar"
          title="Oscilação diária"
          [labels]="dias"
          [datasets]="rangeData"
          [height]="260"
          [legend]="false"
        />
      </demo-section>

      <demo-section
        id="chart-scatter"
        title="Scatter"
        description="Dispersão XY com múltiplas séries — cada dataset usa 'points' com pares x/y."
        [code]="scatterCode"
      >
        <atm-chart
          class="w-full"
          type="scatter"
          title="Ticket x Engajamento"
          [labels]="[]"
          [datasets]="scatterData"
          [height]="300"
        />
      </demo-section>

      <demo-section
        id="chart-dots"
        title="Colunas de pontos"
        description="Valores desenhados como colunas de bolinhas empilhadas — visual leve para dashboards."
        [code]="dotsCode"
      >
        <atm-chart
          class="w-full"
          type="dots"
          title="Sales report"
          [labels]="faixas"
          [datasets]="dotsData"
          [height]="280"
        />
      </demo-section>

      <demo-section
        id="chart-segments"
        title="Progresso segmentado"
        description="Linhas de progresso com segmentos arredondados — proporção sobre o maior valor (ou [max])."
        [code]="segmentsCode"
      >
        <atm-chart
          class="w-full"
          type="segments"
          title="Receita por região"
          [labels]="regioes"
          [datasets]="segmentsData"
          [height]="220"
          [showValues]="true"
          [format]="brl"
        />
      </demo-section>

      <demo-section
        id="chart-heatmap"
        title="Heatmap"
        description="Matriz de intensidade — os labels são as colunas e cada dataset vira uma linha. Cor única com escala de intensidade, valores opcionais e pointClick por célula."
        [code]="heatmapCode"
      >
        <div class="flex w-full flex-col gap-8">
          <atm-chart
            type="heatmap"
            title="Uso por funcionalidade"
            subtitle="Sessões por semana"
            [labels]="heatSemanas"
            [datasets]="heatData"
            [height]="280"
            (pointClick)="onPoint($event)"
          />
          <atm-chart
            type="heatmap"
            title="Commits por dia da semana"
            [labels]="meses"
            [datasets]="commitsData"
            [colors]="['--atm-success']"
            [height]="220"
          />
        </div>
      </demo-section>

      <demo-section
        id="chart-treemap"
        title="Treemap"
        description="Retângulos proporcionais ao valor (layout squarified). Duplo clique adentra grupos com filhos — a setinha volta um nível. Para dados remotos, use [loadChildren] para buscar os filhos numa API no drill-down."
        [code]="treemapCode"
      >
        <div class="flex w-full flex-col gap-8">
          <atm-chart
            type="treemap"
            title="Vendas por cidade"
            [tree]="treemapCidades"
            [height]="300"
            [showValues]="true"
            (nodeClick)="onNode($event)"
          />
          <atm-chart
            type="treemap"
            title="Dispositivos"
            subtitle="Duplo clique num grupo para adentrar — a seta no canto volta um nível"
            [tree]="treemapDispositivos"
            [height]="320"
            (nodeClick)="onNode($event)"
            (drillDown)="onDrill($event)"
          />
          <atm-chart
            type="treemap"
            title="Receita por região"
            subtitle="Duplo clique carrega os estados via API simulada ([loadChildren])"
            [tree]="treemapRegioes"
            [loadChildren]="loadEstados"
            [height]="300"
            [showValues]="true"
            [format]="brl"
          />
        </div>
      </demo-section>

      <demo-section
        id="chart-pie"
        title="Pie & Donut"
        description="Fatias interativas (hover destaca), percentuais e total no centro do donut."
        [code]="pieCode"
      >
        <div class="grid w-full gap-6 sm:grid-cols-2">
          <atm-chart
            type="pie"
            title="Tráfego por origem"
            [labels]="origens"
            [datasets]="pieData"
            [height]="260"
            [showValues]="true"
          />
          <atm-chart
            type="donut"
            title="Despesas por categoria"
            [labels]="categorias"
            [datasets]="donutData"
            [height]="260"
            donutLabel="Total gasto"
            [format]="brl"
            legendPosition="right"
          />
        </div>
      </demo-section>

      <demo-section
        id="chart-radar"
        title="Radar"
        description="Comparação multidimensional. Por padrão usa curvas suaves (estilo 'estrela') — use [smooth]='false' para polígonos clássicos."
        [code]="radarCode"
      >
        <div class="grid w-full gap-6 sm:grid-cols-2">
          <atm-chart
            type="radar"
            title="Curvas suaves"
            [labels]="skills"
            [datasets]="radarData"
            [height]="300"
          />
          <atm-chart
            type="radar"
            title="Polígono clássico"
            [labels]="skills"
            [datasets]="radarData"
            [smooth]="false"
            [height]="300"
          />
        </div>
      </demo-section>

      <demo-section
        id="chart-radial"
        title="Radial bar & Gauge"
        description="Anéis concêntricos (radialStyle 'solid' ou 'dotted') e medidor semicircular com valor central."
        [code]="radialCode"
      >
        <div class="grid w-full gap-6 sm:grid-cols-2">
          <atm-chart
            type="radial-bar"
            title="Metas por país"
            [labels]="paises"
            [datasets]="radialData"
            [max]="100"
            [height]="260"
            donutLabel="média"
            legendPosition="right"
          />
          <atm-chart
            type="radial-bar"
            title="Variante pontilhada"
            [labels]="paises"
            [datasets]="radialData"
            [max]="100"
            [height]="260"
            radialStyle="dotted"
            donutLabel="média"
            legendPosition="right"
          />
          <atm-chart
            type="gauge"
            title="NPS"
            [labels]="[]"
            [datasets]="gaugeData"
            [max]="100"
            [height]="220"
            donutLabel="de 100"
          />
          <atm-chart
            type="gauge"
            title="Uso de armazenamento"
            [labels]="[]"
            [datasets]="gaugeStorageData"
            [max]="100"
            [format]="pct"
            [height]="220"
            radialStyle="dotted"
            donutLabel="ocupado"
            [colors]="['--atm-warning']"
          />
        </div>
      </demo-section>

      <demo-section
        id="chart-funnel"
        title="Funnel"
        description="Funil de conversão com transições suaves, camadas de eco, percentuais e valores por etapa."
        [code]="funnelCode"
      >
        <div class="flex w-full flex-col gap-8">
          <atm-chart
            type="funnel"
            title="Funil financeiro"
            [labels]="etapasFin"
            [datasets]="funnelFinData"
            [height]="300"
            [format]="brl"
          />
          <atm-chart
            type="funnel"
            title="Funil de vendas"
            subtitle="Com paleta multicolorida"
            [labels]="etapasVendas"
            [datasets]="funnelVendasData"
            [colors]="['--atm-primary', '--atm-info', '--atm-success', '--atm-warning', '--atm-danger']"
            [height]="280"
          />
        </div>
      </demo-section>

      <demo-section
        id="chart-funnel-styles"
        title="Funil vertical & pirâmide"
        description="Dois estilos além do funil horizontal: barras centradas com conectores e percentual de conversão por etapa (vertical), e pirâmide invertida com rótulos laterais. Ambos emitem pointClick por etapa."
        [code]="funnelStylesCode"
      >
        <div class="grid w-full gap-6 lg:grid-cols-2">
          <atm-chart
            type="funnel-vertical"
            title="Funil de recrutamento"
            [labels]="etapasRecrut"
            [datasets]="funnelRecrutData"
            [height]="360"
            (pointClick)="onPoint($event)"
          />
          <atm-chart
            type="funnel-pyramid"
            title="Pirâmide de conversão"
            [labels]="etapasVendas"
            [datasets]="funnelVendasData"
            [height]="360"
            (pointClick)="onPoint($event)"
          />
        </div>
      </demo-section>

      <demo-section
        id="chart-sparkline"
        title="Sparklines"
        description="Desligue grid, eixos e legenda para mini-gráficos de cards e dashboards."
        [code]="sparkCode"
      >
        <div class="grid w-full gap-4 sm:grid-cols-3">
          @for (card of sparkCards; track card.label) {
            <div class="rounded-atm-lg border border-line bg-surface p-4">
              <p class="text-xs text-ink-muted">{{ card.label }}</p>
              <p class="mt-0.5 text-xl font-bold text-ink">{{ card.value }}</p>
              <atm-chart
                class="mt-2"
                [type]="card.type"
                [labels]="card.labels"
                [datasets]="card.datasets"
                [height]="56"
                [grid]="false"
                [xAxis]="false"
                [yAxis]="false"
                [legend]="false"
                [markers]="false"
              />
            </div>
          }
        </div>
      </demo-section>

      <demo-section
        id="chart-config"
        title="Configurações"
        description="Cores customizadas, formatador (R$), rótulos de dados, títulos de eixo e posição da legenda."
        [code]="configCode"
      >
        <atm-chart
          class="w-full"
          type="bar"
          title="Faturamento mensal"
          subtitle="Formatação BRL + valores visíveis + legenda à direita"
          [labels]="meses.slice(0, 6)"
          [datasets]="configData"
          [colors]="['#8b5cf6', '#14b8a6']"
          [format]="brl"
          [showValues]="true"
          legendPosition="right"
          xTitle="Mês"
          yTitle="Faturamento"
          [height]="320"
        />
      </demo-section>
    </demo-page>
  `,
})
export class ChartsPage {
  private readonly toast = inject(AtmToastService);

  readonly meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  readonly semanas = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8'];
  readonly trimestres = ['T1', 'T2', 'T3', 'T4'];
  readonly produtos = ['Plano Pro', 'Plano Business', 'Plano Starter', 'Add-on API', 'Consultoria'];
  readonly origens = ['Orgânico', 'Pago', 'Social', 'E-mail', 'Direto'];
  readonly categorias = ['Pessoal', 'Infra', 'Marketing', 'Operação'];
  readonly skills = ['Frontend', 'Backend', 'DevOps', 'UX', 'Dados', 'Mobile'];
  readonly etapasFin = ['Recebido', 'Transacionado', 'Investido', 'Poupado', 'Livre'];
  readonly etapasVendas = ['Visitantes', 'Leads', 'Qualificados', 'Propostas', 'Fechados'];

  readonly brl = (v: number): string =>
    v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  readonly pct = (v: number): string => `${Math.round(v)}%`;

  readonly dias = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];
  readonly faixas = ['100', '200', '300', '400', '500', '600', '700', '800', '900'];
  readonly regioes = ['Los Angeles', 'New York', 'Canadá', 'China', 'Tóquio'];
  readonly paises = ['Brasil', 'EUA', 'Portugal'];

  readonly lineData: AtmChartDataset[] = [
    { label: 'Receita', data: [42, 55, 48, 63, 71, 66, 80, 92, 87, 95, 104, 118] },
    { label: 'Despesas', data: [30, 34, 38, 35, 42, 47, 44, 51, 49, 55, 58, 62], dashed: true },
  ];

  readonly areaData: AtmChartDataset[] = [
    { label: 'Desktop', data: [320, 410, 380, 490, 530, 470, 590, 640] },
    { label: 'Mobile', data: [180, 220, 270, 250, 330, 380, 360, 450], color: '--atm-info' },
  ];

  readonly barData: AtmChartDataset[] = [
    { label: '2024', data: [1240, 1580, 1420, 1810] },
    { label: '2025', data: [1490, 1730, 1690, 2140] },
    { label: '2026', data: [1820, 2050, 0, 0] },
  ];

  readonly barHData: AtmChartDataset[] = [{ label: 'Vendas', data: [860, 640, 520, 310, 180] }];

  readonly stackedData: AtmChartDataset[] = [
    { label: 'Loja física', data: [44, 52, 41, 64, 58, 63, 70, 66] },
    { label: 'E-commerce', data: [31, 38, 45, 40, 54, 59, 62, 71] },
    { label: 'Marketplace', data: [12, 15, 19, 22, 20, 26, 24, 30] },
  ];

  readonly mixedData: AtmChartDataset[] = [
    { label: 'Receita', data: [88, 94, 81, 105, 112, 98, 124, 131, 119], type: 'bar' },
    { label: 'Meta', data: [90, 90, 95, 95, 105, 105, 115, 115, 125], type: 'line', dashed: true, markers: false, color: '--atm-danger' },
    { label: 'Média móvel', data: [88, 91, 88, 93, 99, 105, 111, 118, 125], type: 'line', color: '--atm-success' },
  ];

  readonly rangeData: AtmChartDataset[] = [
    {
      label: 'Variação',
      data: [],
      ranges: [
        [3, 7], [4, 9], [5, 8], [2, 6], [1, 5], [3, 9], [5.5, 8.5], [4, 7], [2.5, 6.5], [6, 9.5],
      ],
    },
  ];

  readonly scatterData: AtmChartDataset[] = [
    { label: 'Campanha A', data: [], points: this.genPoints(55, 1), color: '#f97316' },
    { label: 'Campanha B', data: [], points: this.genPoints(45, 2) },
  ];

  readonly dotsData: AtmChartDataset[] = [
    { label: 'Mensal', data: [340, 420, 380, 560, 610, 470, 390, 430, 360], color: '#f97316' },
    { label: 'Anual', data: [280, 350, 300, 480, 520, 400, 310, 370, 290], color: '#fbbf24' },
  ];

  readonly segmentsData: AtmChartDataset[] = [
    { label: 'Receita', data: [270120, 219650, 200680, 168400, 122270] },
  ];

  readonly radialData: AtmChartDataset[] = [{ label: 'Meta atingida', data: [86, 64, 45] }];

  readonly gaugeData: AtmChartDataset[] = [{ label: 'NPS', data: [72] }];

  readonly gaugeStorageData: AtmChartDataset[] = [{ label: 'Armazenamento', data: [58] }];

  private genPoints(count: number, seed: number): { x: number; y: number }[] {
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < count; i++) {
      const r1 = Math.abs(Math.sin((i + 1) * 12.9898 * seed) * 43758.5453) % 1;
      const r2 = Math.abs(Math.sin((i + 1) * 78.233 + seed * 7) * 12543.123) % 1;
      pts.push({ x: Math.round(10 + r1 * 90), y: Math.round(200 + r2 * 500) });
    }
    return pts;
  }

  readonly pieData: AtmChartDataset[] = [{ label: 'Visitas', data: [4200, 2800, 1900, 1200, 900] }];

  readonly donutData: AtmChartDataset[] = [{ label: 'Gasto', data: [48000, 22000, 15000, 9500] }];

  readonly radarData: AtmChartDataset[] = [
    { label: 'Time A', data: [80, 92, 65, 74, 60, 55] },
    { label: 'Time B', data: [62, 70, 85, 58, 88, 72], color: '--atm-warning' },
  ];

  readonly funnelFinData: AtmChartDataset[] = [{ label: 'Valor', data: [2957, 2129, 1360, 710, 296] }];

  readonly funnelVendasData: AtmChartDataset[] = [{ label: 'Pessoas', data: [12400, 5580, 2790, 1120, 430] }];

  readonly etapasRecrut = ['Sourcing', 'Triagem', 'Avaliação', 'Entrevista RH', 'Técnica', 'Proposta', 'Contratados'];

  readonly funnelRecrutData: AtmChartDataset[] = [
    { label: 'Candidatos', data: [1380, 1100, 990, 880, 740, 330, 200] },
  ];

  private rnd(seed: number): number {
    return Math.abs(Math.sin((seed + 1) * 12.9898) * 43758.5453) % 1;
  }

  readonly heatSemanas = Array.from({ length: 16 }, (_, i) => `s${i + 1}`);

  readonly heatFeatures = ['Dashboard', 'Relatórios', 'Busca', 'Perfil', 'Cobrança', 'Config', 'Inbox', 'Agenda'];

  readonly heatData: AtmChartDataset[] = this.heatFeatures.map((label, r) => ({
    label,
    data: this.heatSemanas.map((_, c) => Math.round(this.rnd(r * 37 + c * 3) * 100)),
  }));

  readonly diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  readonly commitsData: AtmChartDataset[] = this.diasSemana.map((label, r) => ({
    label,
    data: this.meses.map((_, c) => Math.round(this.rnd(r * 13 + c * 7 + 5) * 40)),
  }));

  readonly treemapCidades: AtmChartTreeNode[] = [
    { label: 'São Paulo', value: 486 },
    { label: 'Rio de Janeiro', value: 297 },
    { label: 'Belo Horizonte', value: 182 },
    { label: 'Curitiba', value: 141 },
    { label: 'Porto Alegre', value: 118 },
    { label: 'Recife', value: 96 },
    { label: 'Salvador', value: 84 },
    { label: 'Fortaleza', value: 63 },
    { label: 'Manaus', value: 41 },
    { label: 'Goiânia', value: 33 },
  ];

  readonly treemapDispositivos: AtmChartTreeNode[] = [
    {
      label: 'Desktops',
      children: [
        { label: 'Apple', value: 383 },
        { label: 'Dell', value: 246 },
        { label: 'Lenovo', value: 208 },
        { label: 'Acer', value: 157 },
        { label: 'HP', value: 129 },
      ],
    },
    {
      label: 'Mobile',
      children: [
        { label: 'Samsung', value: 341 },
        { label: 'Apple', value: 296 },
        { label: 'Xiaomi', value: 212 },
        { label: 'Motorola', value: 118 },
      ],
    },
    {
      label: 'Tablets',
      children: [
        { label: 'Apple', value: 168 },
        { label: 'Samsung', value: 102 },
        { label: 'Amazon', value: 58 },
      ],
    },
    {
      label: 'Wearables',
      children: [
        { label: 'Apple', value: 94 },
        { label: 'Garmin', value: 47 },
        { label: 'Huawei', value: 31 },
      ],
    },
  ];

  readonly treemapRegioes: AtmChartTreeNode[] = [
    { label: 'Sudeste', value: 4820 },
    { label: 'Sul', value: 2310 },
    { label: 'Nordeste', value: 1980 },
    { label: 'Centro-Oeste', value: 940 },
    { label: 'Norte', value: 610 },
  ];

  private readonly estadosPorRegiao: Record<string, [string, number][]> = {
    Sudeste: [['São Paulo', 2530], ['Minas Gerais', 1080], ['Rio de Janeiro', 890], ['Espírito Santo', 320]],
    Sul: [['Paraná', 940], ['Rio Grande do Sul', 820], ['Santa Catarina', 550]],
    Nordeste: [['Bahia', 610], ['Pernambuco', 480], ['Ceará', 430], ['Maranhão', 250], ['Outros', 210]],
    'Centro-Oeste': [['Goiás', 390], ['Distrito Federal', 310], ['Mato Grosso', 240]],
    Norte: [['Pará', 260], ['Amazonas', 210], ['Outros', 140]],
  };

  /** Simula uma API que devolve os filhos do nó no drill-down do treemap. */
  readonly loadEstados = (node: AtmChartTreeNode): Promise<AtmChartTreeNode[]> =>
    new Promise((resolve) =>
      setTimeout(() => {
        const rows = this.estadosPorRegiao[node.label] ?? [];
        resolve(rows.map(([label, value]) => ({ label, value })));
      }, 700),
    );

  readonly configData: AtmChartDataset[] = [
    { label: 'Recorrente', data: [42000, 48500, 51200, 49800, 56400, 61300] },
    { label: 'Avulso', data: [12800, 9400, 14100, 11700, 15900, 13200] },
  ];

  readonly sparkCards: {
    label: string;
    value: string;
    type: 'line' | 'area' | 'bar';
    labels: string[];
    datasets: AtmChartDataset[];
  }[] = [
    {
      label: 'Novos usuários',
      value: '+1.284',
      type: 'area',
      labels: this.semanas,
      datasets: [{ label: 'Usuários', data: [12, 19, 15, 26, 22, 31, 28, 38] }],
    },
    {
      label: 'Pedidos',
      value: '342',
      type: 'bar',
      labels: this.semanas,
      datasets: [{ label: 'Pedidos', data: [31, 40, 28, 51, 42, 49, 60, 55], color: '--atm-success' }],
    },
    {
      label: 'Churn',
      value: '2,4%',
      type: 'line',
      labels: this.semanas,
      datasets: [{ label: 'Churn', data: [4.1, 3.8, 3.9, 3.2, 3.4, 2.9, 2.6, 2.4], color: '--atm-danger' }],
    },
  ];

  onPoint(e: AtmChartPointEvent): void {
    this.toast.info(`${e.datasetLabel}: ${e.value}`, e.label);
  }

  onNode(e: AtmChartTreeEvent): void {
    this.toast.info(e.path.map((n) => n.label).join(' / '), e.node.label);
  }

  onDrill(e: AtmChartTreeEvent): void {
    this.toast.info(`Drill-down em ${e.node.label}`, 'Treemap');
  }

  readonly lineCode = `<atm-chart
  type="line"
  title="Receita x Despesas"
  subtitle="Últimos 12 meses"
  [labels]="meses"
  [datasets]="[
    { label: 'Receita', data: [42, 55, 48, ...] },
    { label: 'Despesas', data: [30, 34, 38, ...], dashed: true },
  ]"
  (pointClick)="onPoint($event)"
/>

<!-- Área com gradiente -->
<atm-chart type="area" [labels]="semanas" [datasets]="areaData" [height]="260" />`;

  readonly barCode = `<!-- pointClick emite { index, label, datasetIndex, datasetLabel, value } da barra clicada -->
<atm-chart
  type="bar"
  title="Vendas por trimestre"
  [labels]="trimestres"
  [datasets]="barData"
  (pointClick)="onPoint($event)"
/>

<atm-chart
  type="bar-horizontal"
  [labels]="produtos"
  [datasets]="[{ label: 'Vendas', data: [860, 640, 520, 310, 180] }]"
  [showValues]="true"
  [legend]="false"
/>`;

  readonly stackedCode = `<atm-chart
  type="bar"
  [stacked]="true"
  [labels]="meses"
  [datasets]="[
    { label: 'Loja física', data: [...] },
    { label: 'E-commerce', data: [...] },
    { label: 'Marketplace', data: [...] },
  ]"
/>`;

  readonly mixedCode = `<!-- Cada dataset pode ter um type próprio: 'bar' | 'line' | 'area' -->
<atm-chart
  type="bar"
  [labels]="meses"
  [datasets]="[
    { label: 'Receita', data: [...], type: 'bar' },
    { label: 'Meta', data: [...], type: 'line', dashed: true, color: '--atm-danger' },
    { label: 'Média móvel', data: [...], type: 'line', color: '--atm-success' },
  ]"
/>`;

  readonly rangeCode = `<!-- data fica vazio; os intervalos vão em ranges: [low, high][] -->
<atm-chart
  type="range-bar"
  [labels]="dias"
  [datasets]="[{ label: 'Variação', data: [], ranges: [[3, 7], [4, 9], [5, 8], ...] }]"
  [legend]="false"
/>`;

  readonly scatterCode = `<!-- cada dataset usa points: { x, y }[] -->
<atm-chart
  type="scatter"
  [datasets]="[
    { label: 'Campanha A', data: [], points: [{ x: 12, y: 340 }, ...], color: '#f97316' },
    { label: 'Campanha B', data: [], points: [{ x: 30, y: 520 }, ...] },
  ]"
/>`;

  readonly dotsCode = `<atm-chart
  type="dots"
  [labels]="faixas"
  [datasets]="[
    { label: 'Mensal', data: [340, 420, ...], color: '#f97316' },
    { label: 'Anual', data: [280, 350, ...], color: '#fbbf24' },
  ]"
/>`;

  readonly segmentsCode = `<atm-chart
  type="segments"
  [labels]="['Los Angeles', 'New York', 'Canadá', ...]"
  [datasets]="[{ label: 'Receita', data: [270120, 219650, ...] }]"
  [showValues]="true"
  [format]="brl"
/>`;

  readonly radialCode = `<!-- Anéis concêntricos; [max] define a escala (ex.: 100 = percentual) -->
<atm-chart
  type="radial-bar"
  [labels]="['Brasil', 'EUA', 'Portugal']"
  [datasets]="[{ label: 'Meta atingida', data: [86, 64, 45] }]"
  [max]="100"
  donutLabel="média"
  legendPosition="right"
  radialStyle="dotted"
/>

<!-- Gauge: usa o primeiro valor do dataset -->
<atm-chart
  type="gauge"
  [datasets]="[{ label: 'NPS', data: [72] }]"
  [max]="100"
  donutLabel="de 100"
  [format]="pct"
/>`;

  readonly pieCode = `<atm-chart type="pie" [labels]="origens" [datasets]="pieData" [showValues]="true" />

<atm-chart
  type="donut"
  [labels]="categorias"
  [datasets]="donutData"
  donutLabel="Total gasto"
  [format]="brl"
  legendPosition="right"
/>`;

  readonly radarCode = `<atm-chart
  type="radar"
  [labels]="['Frontend', 'Backend', 'DevOps', 'UX', 'Dados', 'Mobile']"
  [datasets]="[
    { label: 'Time A', data: [80, 92, 65, 74, 60, 55] },
    { label: 'Time B', data: [62, 70, 85, 58, 88, 72], color: '--atm-warning' },
  ]"
/>`;

  readonly funnelCode = `<!-- Monocromático (tons alternados do primary) -->
<atm-chart
  type="funnel"
  [labels]="['Recebido', 'Transacionado', 'Investido', 'Poupado', 'Livre']"
  [datasets]="[{ label: 'Valor', data: [2957, 2129, 1360, 710, 296] }]"
  [format]="brl"
/>

<!-- Multicolorido: passe uma paleta em [colors] -->
<atm-chart
  type="funnel"
  [labels]="etapas"
  [datasets]="funnelData"
  [colors]="['--atm-primary', '--atm-info', '--atm-success', '--atm-warning', '--atm-danger']"
/>`;

  readonly heatmapCode = `<!-- labels = colunas; cada dataset é uma linha da matriz -->
<atm-chart
  type="heatmap"
  title="Uso por funcionalidade"
  [labels]="semanas"
  [datasets]="[
    { label: 'Dashboard', data: [82, 34, 61, ...] },
    { label: 'Relatórios', data: [12, 78, 44, ...] },
    ...
  ]"
  (pointClick)="onPoint($event)"  <!-- { index: coluna, datasetIndex: linha, value } -->
/>

<!-- Cor customizada (escala de intensidade sobre um único tom) -->
<atm-chart type="heatmap" [labels]="meses" [datasets]="commitsData" [colors]="['--atm-success']" />`;

  readonly treemapCode = `<!-- Nós hierárquicos: value opcional em grupos (soma dos filhos) -->
<atm-chart
  type="treemap"
  [tree]="[
    { label: 'Desktops', children: [{ label: 'Apple', value: 383 }, ...] },
    { label: 'Mobile', children: [{ label: 'Samsung', value: 341 }, ...] },
  ]"
  (nodeClick)="onNode($event)"   <!-- { node, path } -->
  (drillDown)="onDrill($event)"  <!-- duplo clique adentra o grupo; a seta volta -->
/>

<!-- Drill-down remoto: sem children, o duplo clique chama loadChildren (ex.: API) -->
<atm-chart
  type="treemap"
  [tree]="regioes"
  [loadChildren]="loadEstados"
/>

// loadEstados = (node) => this.api.get(\`/regioes/\${node.label}/estados\`)
//   → Promise<AtmChartTreeNode[]>`;

  readonly funnelStylesCode = `<!-- Vertical: barras centradas + conectores + % de conversão -->
<atm-chart
  type="funnel-vertical"
  [labels]="['Sourcing', 'Triagem', 'Avaliação', ...]"
  [datasets]="[{ label: 'Candidatos', data: [1380, 1100, 990, ...] }]"
  (pointClick)="onPoint($event)"
/>

<!-- Pirâmide invertida com rótulos laterais (paleta do tema por etapa) -->
<atm-chart
  type="funnel-pyramid"
  [labels]="etapas"
  [datasets]="funnelData"
  (pointClick)="onPoint($event)"
/>`;

  readonly sparkCode = `<atm-chart
  type="area"
  [labels]="semanas"
  [datasets]="[{ label: 'Usuários', data: [12, 19, 15, 26, 22, 31, 28, 38] }]"
  [height]="56"
  [grid]="false"
  [xAxis]="false"
  [yAxis]="false"
  [legend]="false"
  [markers]="false"
/>`;

  readonly configCode = `<atm-chart
  type="bar"
  title="Faturamento mensal"
  [labels]="meses"
  [datasets]="configData"
  [colors]="['#8b5cf6', '#14b8a6']"
  [format]="brl"          <!-- (v) => v.toLocaleString('pt-BR', { style: 'currency', ... }) -->
  [showValues]="true"
  legendPosition="right"  <!-- top | bottom | left | right -->
  xTitle="Mês"
  yTitle="Faturamento"
  [height]="320"
/>`;
}
