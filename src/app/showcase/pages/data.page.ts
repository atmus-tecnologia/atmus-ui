import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  AtmActionBar,
  AtmBreadcrumbs,
  AtmButton,
  AtmPagination,
  AtmSearchField,
  AtmSortEvent,
  AtmTable,
  AtmTableColumn,
  AtmTableFilter,
  AtmToastService,
  AtmToolbar,
} from '../../../core/ui';
import { DemoPage, DemoSection } from '../demo-section.component';
import { DummyUsersService, DummyUser } from '../../services/dummy-users.service';

interface User extends Record<string, unknown> {
  id: number;
  name: string;
  email: string;
  role: string;
  age: number;
  salary: number;
  hiredAt: string;
  active: boolean;
}

const USERS: User[] = [
  { id: 1, name: 'Ana Souza', email: 'ana@empresa.com', role: 'Admin', age: 29, salary: 12400, hiredAt: '2021-03-15', active: true },
  { id: 2, name: 'Bruno Costa', email: 'bruno@empresa.com', role: 'Editor', age: 36, salary: 8300, hiredAt: '2019-11-02', active: true },
  { id: 3, name: 'Carla Dias', email: 'carla@empresa.com', role: 'Viewer', age: 43, salary: 5900, hiredAt: '2022-06-20', active: false },
  { id: 4, name: 'Daniel Rocha', email: 'daniel@empresa.com', role: 'Editor', age: 31, salary: 9100, hiredAt: '2020-01-08', active: true },
  { id: 5, name: 'Elisa Melo', email: 'elisa@empresa.com', role: 'Viewer', age: 26, salary: 4800, hiredAt: '2023-02-27', active: false },
  { id: 6, name: 'Fábio Lima', email: 'fabio@empresa.com', role: 'Admin', age: 39, salary: 13800, hiredAt: '2018-07-19', active: true },
  { id: 7, name: 'Gabriela Nunes', email: 'gabi@empresa.com', role: 'Editor', age: 28, salary: 7600, hiredAt: '2021-09-01', active: true },
  { id: 8, name: 'Hugo Alves', email: 'hugo@empresa.com', role: 'Viewer', age: 34, salary: 5200, hiredAt: '2022-12-05', active: true },
  { id: 9, name: 'Iris Campos', email: 'iris@empresa.com', role: 'Editor', age: 45, salary: 8900, hiredAt: '2017-04-11', active: false },
  { id: 10, name: 'João Pedro', email: 'joao@empresa.com', role: 'Admin', age: 52, salary: 15200, hiredAt: '2015-10-23', active: true },
  { id: 11, name: 'Karen Dias', email: 'karen@empresa.com', role: 'Viewer', age: 24, salary: 4500, hiredAt: '2024-01-15', active: true },
  { id: 12, name: 'Lucas Prado', email: 'lucas@empresa.com', role: 'Editor', age: 33, salary: 8700, hiredAt: '2020-08-30', active: true },
];

@Component({
  selector: 'data-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AtmActionBar,
    AtmTable,
    AtmPagination,
    AtmBreadcrumbs,
    AtmToolbar,
    AtmButton,
    AtmSearchField,
    DemoPage,
    DemoSection,
  ],
  template: `
    <demo-page
      title="Dados & Navegação"
      description="Tabela com ordenação, filtros por coluna, seleção, colunas fixas, scroll, footer e dados via API; paginação, breadcrumbs e toolbar."
      importCode="import { AtmTable, AtmPagination, AtmBreadcrumbs, AtmToolbar } from 'src/core/ui';"
    >
      <demo-section
        id="table"
        title="Table"
        description="Colunas sortable, template customizado por coluna, linhas clicáveis e empty state."
        [code]="tableCode"
      >
        <div class="w-full">
          <atm-table
            [columns]="columns"
            [rows]="sortedUsers()"
            [loading]="tableLoading()"
            [clickableRows]="true"
            (rowClick)="onRow($event)"
          />
          <div class="mt-3">
            <atm-button size="slim" variant="soft" color="neutral" (clicked)="simulateLoading()">
              Simular loading
            </atm-button>
          </div>
        </div>
      </demo-section>

      <demo-section
        id="table-filters"
        title="Table — Filtros & Footer"
        description="filterable abre popup de filtro por coluna. O type ('text' | 'number' | 'date' | 'boolean') define os operadores (contém, igual, maior que…). footerValue calcula totais/médias com as linhas visíveis."
        [code]="filterCode"
      >
        <atm-table
          class="w-full"
          size="slim"
          [columns]="filterColumns"
          [rows]="users"
          [paginator]="true"
          [pageSize]="8"
          (filterChange)="onFilter($event)"
        />
      </demo-section>

      <demo-section
        id="table-selection"
        title="Table — Seleção"
        description="selectable adiciona a coluna de checkbox com selecionar todos; [(selection)] mantém as linhas marcadas."
        [code]="selectionCode"
      >
        <div class="w-full">
          <atm-table
            [columns]="columns"
            [rows]="users.slice(0, 6)"
            [selectable]="true"
            [(selection)]="selection"
          />
          <p class="mt-2 text-sm text-ink-muted">
            {{ selection().length }} selecionado(s):
            {{ selectionNames() || '—' }}
          </p>
        </div>
      </demo-section>

      <demo-section
        id="table-scroll"
        title="Table — Colunas fixas & Scroll"
        description="scrollable + scrollHeight limitam a área dos registros (header e footer ficam visíveis); fixed prende colunas à esquerda no scroll horizontal; width controla a largura da coluna."
        [code]="scrollCode"
      >
        <atm-table
          class="w-full"
          size="slim"
          [columns]="wideColumns"
          [rows]="users"
          [selectable]="true"
          [scrollable]="true"
          scrollHeight="280px"
        />
      </demo-section>

      <demo-section
        id="table-remote"
        title="Table — API (dataSource)"
        description="Passe um dataSource (AtmRemoteDataSource) e a tabela busca sozinha: paginação, ordenação e filtros viram parâmetros da query (padrão nest-paginator). Demo com dummyjson.com/users."
        [code]="remoteCode"
      >
        <atm-table
          class="w-full"
          size="slim"
          [columns]="remoteColumns"
          [dataSource]="usersService"
          [paginator]="true"
          [pageSize]="10"
          [scrollable]="true"
          scrollHeight="420px"
        />
      </demo-section>

      <demo-section
        id="pagination"
        title="Pagination"
        description="Janela deslizante com reticências."
        [code]="paginationCode"
      >
        <div class="flex w-full flex-col items-start gap-3">
          <atm-pagination [totalItems]="240" [pageSize]="10" [(page)]="page" />
          <atm-pagination size="slim" [totalItems]="50" [pageSize]="10" />
          <span class="text-sm text-ink-muted">página atual: {{ page() }}</span>
        </div>
      </demo-section>

      <demo-section id="breadcrumbs" title="Breadcrumbs" [code]="breadcrumbsCode">
        <atm-breadcrumbs [items]="crumbs" />
      </demo-section>

      <demo-section id="toolbar" title="Toolbar" description="Slots start / center / end." [code]="toolbarCode">
        <atm-toolbar class="w-full">
          <div start class="flex items-center gap-2">
            <atm-button size="slim" icon="plus">Novo</atm-button>
            <atm-button size="slim" variant="outline" color="neutral" icon="upload">Importar</atm-button>
          </div>
          <div center class="w-full max-w-xs">
            <atm-search-field size="slim" />
          </div>
          <div end>
            <atm-button size="slim" variant="ghost" color="neutral" icon="filter" [iconOnly]="true" />
          </div>
        </atm-toolbar>
      </demo-section>

      <demo-section
        id="action-bar"
        title="ActionBar"
        description="Barra flutuante de ações contextuais. Aparece centralizada embaixo (ou em cima, via position) da tela — ou do container com container='parent'. count mostra o total selecionado; o X e a tecla Esc emitem (closed)."
        [code]="actionBarCode"
      >
        <div class="relative w-full pb-20">
          <atm-table
            [columns]="columns"
            [rows]="users.slice(0, 6)"
            [selectable]="true"
            [(selection)]="barSelection"
          />
          <atm-action-bar
            container="parent"
            [open]="barSelection().length > 0"
            [count]="barSelection().length"
            (closed)="barSelection.set([])"
          >
            <atm-button size="slim" variant="ghost" color="neutral" icon="ui-edit">Editar</atm-button>
            <atm-button size="slim" variant="ghost" color="neutral" icon="download">Exportar</atm-button>
            <atm-button size="slim" variant="ghost" color="neutral" icon="box">Arquivar</atm-button>
            <atm-button size="slim" variant="soft" color="danger" icon="ui-delete">Excluir</atm-button>
          </atm-action-bar>
        </div>
      </demo-section>

      <demo-section
        id="action-bar-viewport"
        title="ActionBar — Tela inteira"
        description="Sem container='parent' a barra fica fixa na viewport (padrão). position controla a borda: bottom ou top."
        [code]="actionBarViewportCode"
      >
        <div class="flex gap-2">
          <atm-button size="slim" variant="outline" color="neutral" (clicked)="viewportBar.set('bottom')">
            Mostrar embaixo
          </atm-button>
          <atm-button size="slim" variant="outline" color="neutral" (clicked)="viewportBar.set('top')">
            Mostrar em cima
          </atm-button>
        </div>
        <atm-action-bar
          [open]="viewportBar() !== null"
          [position]="viewportBar() ?? 'bottom'"
          [count]="3"
          (closed)="viewportBar.set(null)"
        >
          <atm-button size="slim" variant="ghost" color="neutral" icon="ui-edit">Editar</atm-button>
          <atm-button size="slim" variant="ghost" color="neutral" icon="download">Exportar</atm-button>
          <atm-button size="slim" variant="soft" color="danger" icon="ui-delete">Excluir</atm-button>
        </atm-action-bar>
      </demo-section>
    </demo-page>
  `,
})
export class DataPage {
  private readonly toast = inject(AtmToastService);
  readonly usersService = inject(DummyUsersService);

  readonly page = signal(3);
  readonly tableLoading = signal(false);
  readonly users = USERS;
  readonly selection = signal<User[]>([]);
  readonly barSelection = signal<User[]>([]);
  readonly viewportBar = signal<'bottom' | 'top' | null>(null);

  readonly columns: AtmTableColumn<User>[] = [
    { key: 'id', header: '#', sortable: true, width: '60px' },
    { key: 'name', header: 'Nome', sortable: true },
    { key: 'email', header: 'E-mail' },
    { key: 'role', header: 'Papel', sortable: true },
    {
      key: 'active',
      header: 'Status',
      align: 'center',
      value: (u) => (u.active ? '● Ativo' : '○ Inativo'),
    },
  ];

  readonly filterColumns: AtmTableColumn<User>[] = [
    { key: 'id', header: '#', sortable: true, width: '60px' },
    { key: 'name', header: 'Nome', type: 'text', sortable: true, filterable: true },
    { key: 'role', header: 'Papel', type: 'text', filterable: true },
    { key: 'age', header: 'Idade', type: 'number', sortable: true, filterable: true, align: 'center', footer: 'Média' },
    {
      key: 'salary',
      header: 'Salário',
      type: 'number',
      sortable: true,
      filterable: true,
      align: 'right',
      value: (u) => this.currency(u.salary),
      footerValue: (rows) => this.currency(rows.reduce((sum, r) => sum + r.salary, 0)),
    },
    { key: 'hiredAt', header: 'Admissão', type: 'date', sortable: true, filterable: true },
    {
      key: 'active',
      header: 'Ativo',
      type: 'boolean',
      filterable: true,
      align: 'center',
      value: (u) => (u.active ? 'Sim' : 'Não'),
    },
  ];

  readonly wideColumns: AtmTableColumn<User>[] = [
    { key: 'id', header: '#', width: '60px', fixed: true },
    { key: 'name', header: 'Nome', width: '180px', fixed: true },
    { key: 'email', header: 'E-mail', width: '220px' },
    { key: 'role', header: 'Papel', width: '140px' },
    { key: 'age', header: 'Idade', width: '100px', align: 'center' },
    { key: 'salary', header: 'Salário', width: '140px', align: 'right', value: (u) => this.currency(u.salary) },
    { key: 'hiredAt', header: 'Admissão', width: '140px' },
    { key: 'active', header: 'Status', width: '120px', align: 'center', value: (u) => (u.active ? 'Ativo' : 'Inativo') },
  ];

  readonly remoteColumns: AtmTableColumn<DummyUser>[] = [
    { key: 'id', header: '#', width: '60px', sortable: true, fixed: true },
    { key: 'firstName', header: 'Nome', width: '150px', sortable: true, filterable: true, fixed: true },
    { key: 'lastName', header: 'Sobrenome', width: '140px', sortable: true },
    { key: 'age', header: 'Idade', width: '90px', type: 'number', sortable: true, align: 'center' },
    { key: 'email', header: 'E-mail', width: '260px' },
    { key: 'phone', header: 'Telefone', width: '170px' },
    { key: 'company.name', header: 'Empresa', width: '220px' },
    { key: 'company.title', header: 'Cargo', width: '220px' },
    { key: 'address.city', header: 'Cidade', width: '150px' },
    { key: 'role', header: 'Papel', width: '120px', filterable: true },
  ];

  readonly sortedUsers = signal<User[]>(USERS.slice(0, 5));

  selectionNames(): string {
    return this.selection()
      .map((u) => u.name)
      .join(', ');
  }

  currency(value: number): string {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  onRow(user: User): void {
    this.toast.info('Linha clicada', user.name);
  }

  onFilter(filters: AtmTableFilter[]): void {
    this.toast.info('Filtros ativos', filters.length ? JSON.stringify(filters) : 'nenhum');
  }

  simulateLoading(): void {
    this.tableLoading.set(true);
    setTimeout(() => this.tableLoading.set(false), 2000);
  }

  readonly crumbs = [
    { label: 'Home', link: '/', icon: 'ui-home' },
    { label: 'Configurações', link: '/data' },
    { label: 'Usuários' },
  ];

  readonly tableCode = `columns: AtmTableColumn<User>[] = [
  { key: 'id', header: '#', sortable: true, width: '60px' },
  { key: 'name', header: 'Nome', sortable: true },
  { key: 'active', header: 'Status', value: (u) => u.active ? 'Ativo' : 'Inativo' },
];

<atm-table
  [columns]="columns"
  [rows]="users"
  [loading]="loading"
  [clickableRows]="true"
  (sortChange)="onSort($event)"
  (rowClick)="open($event)"
/>`;

  readonly filterCode = `columns: AtmTableColumn<User>[] = [
  { key: 'name', header: 'Nome', type: 'text', filterable: true },
  { key: 'age', header: 'Idade', type: 'number', filterable: true, footer: 'Média' },
  {
    key: 'salary', header: 'Salário', type: 'number', filterable: true,
    footerValue: (rows) => total(rows), // totalizador com as linhas visíveis
  },
  { key: 'hiredAt', header: 'Admissão', type: 'date', filterable: true },
  { key: 'active', header: 'Ativo', type: 'boolean', filterable: true },
];

<atm-table
  [columns]="columns"
  [rows]="users"
  [paginator]="true"
  [pageSize]="8"
  (filterChange)="onFilter($event)"
/>`;

  readonly selectionCode = `<atm-table
  [columns]="columns"
  [rows]="users"
  [selectable]="true"
  [(selection)]="selection"
/>`;

  readonly scrollCode = `columns: AtmTableColumn<User>[] = [
  { key: 'id', header: '#', width: '60px', fixed: true },
  { key: 'name', header: 'Nome', width: '180px', fixed: true },
  { key: 'email', header: 'E-mail', width: '220px' },
  // ... colunas largas o suficiente para scroll horizontal
];

<atm-table
  [columns]="columns"
  [rows]="users"
  [selectable]="true"
  [scrollable]="true"
  scrollHeight="280px"
/>`;

  readonly remoteCode = `// Serviço implementando AtmRemoteDataSource (padrão nest-paginator)
@Injectable({ providedIn: 'root' })
export class UsersService extends AtmRestService<User> {
  protected override resource = 'users';
}

<atm-table
  [columns]="columns"
  [dataSource]="usersService"
  [paginator]="true"
  [pageSize]="10"
/>

// A tabela envia page, limit, sortBy=key:ASC e filter.key=$op:value
// automaticamente. Para outra API (ex.: dummyjson), basta implementar
// list(query: AtmListQuery): Observable<AtmPaginated<T>> adaptando os params.`;

  readonly paginationCode = `<atm-pagination [totalItems]="240" [pageSize]="10" [(page)]="page" (pageChange)="load($event)" />`;

  readonly breadcrumbsCode = `<atm-breadcrumbs
  [items]="[
    { label: 'Home', link: '/', icon: 'ui-home' },
    { label: 'Configurações', link: '/settings' },
    { label: 'Usuários' },
  ]"
/>`;

  readonly actionBarCode = `<!-- container='parent': posiciona dentro do container mais próximo com position: relative -->
<div class="relative">
  <atm-table [columns]="columns" [rows]="users" [selectable]="true" [(selection)]="selection" />

  <atm-action-bar
    container="parent"
    [open]="selection().length > 0"
    [count]="selection().length"
    (closed)="selection.set([])"
  >
    <atm-button size="slim" variant="ghost" color="neutral" icon="ui-edit">Editar</atm-button>
    <atm-button size="slim" variant="ghost" color="neutral" icon="download">Exportar</atm-button>
    <atm-button size="slim" variant="soft" color="danger" icon="ui-delete">Excluir</atm-button>
  </atm-action-bar>
</div>`;

  readonly actionBarViewportCode = `<!-- padrão: fixa na viewport, centralizada embaixo -->
<atm-action-bar [open]="open()" position="top" [count]="3" (closed)="open.set(false)">
  <atm-button size="slim" variant="ghost" color="neutral" icon="ui-edit">Editar</atm-button>
  <atm-button size="slim" variant="soft" color="danger" icon="ui-delete">Excluir</atm-button>
</atm-action-bar>

<!-- inputs: open, position (bottom|top), container (viewport|parent),
     size (large|medium|slim), count, showClose, ariaLabel · output: closed -->`;

  readonly toolbarCode = `<atm-toolbar>
  <div start><atm-button size="slim" icon="plus">Novo</atm-button></div>
  <div center><atm-search-field size="slim" /></div>
  <div end><atm-button size="slim" variant="ghost" icon="filter" [iconOnly]="true" /></div>
</atm-toolbar>`;
}
