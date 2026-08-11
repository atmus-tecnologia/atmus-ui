import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AtmButton,
  AtmContextMenu,
  AtmContextMenuItem,
  AtmContextMenuSelect,
  AtmContextMenuTrigger,
  AtmDropdown,
  AtmDropdownItem,
  AtmDropdownRemote,
  AtmLabel,
  AtmToastService,
} from '@atmus/ngui';
import { ContactsService } from '../../services/contacts.service';
import { DemoPage, DemoSection } from '../demo-section.component';

@Component({
  selector: 'dropdowns-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    AtmDropdown,
    AtmDropdownRemote,
    AtmContextMenu,
    AtmContextMenuTrigger,
    AtmButton,
    AtmLabel,
    DemoPage,
    DemoSection,
  ],
  template: `
    <demo-page
      title="Dropdown, Context Menu & Remote"
      description="Menus de ação (por clique ou botão direito) e seleção remota via API. Todos são viewport-aware: reposicionam automaticamente quando não há espaço."
      importCode="import { AtmDropdown, AtmContextMenu, AtmContextMenuTrigger, AtmDropdownRemote } from '@atmus/ngui';"
    >
      <demo-section
        id="dropdown"
        title="Dropdown"
        description="Menu de ações com ícones, separadores, atalhos e footer de ação opcional."
        [code]="dropdownCode"
      >
        <atm-dropdown [items]="menuItems" (itemClick)="toast.info('Clicou', $event.label)">
          <atm-button variant="outline" color="neutral" iconRight="simple-down">Ações</atm-button>
        </atm-dropdown>

        <atm-dropdown
          [items]="menuItems"
          [hasActionButton]="true"
          actionButtonLabel="Novo item"
          (itemClick)="toast.info('Clicou', $event.label)"
          (actionClick)="toast.success('Ação do footer', 'Adicionar novo registro')"
        >
          <atm-button variant="soft" iconRight="simple-down">Com footer</atm-button>
        </atm-dropdown>
      </demo-section>

      <demo-section
        id="context-menu"
        title="Context Menu"
        description="Clique com o botão direito. Use a diretiva [atmContextMenu] em qualquer elemento; [atmContextMenuData] devolve o registro da linha no itemClick — uma única instância do menu serve para a lista inteira. Suporta teclado (setas, Enter, Esc), header opcional e fecha em clique fora/scroll."
        [code]="contextMenuCode"
      >
        <div class="flex w-full flex-col gap-4">
          <div
            class="flex h-32 w-full items-center justify-center rounded-atm border border-dashed
              border-line bg-surface-alt/40 text-sm text-ink-muted select-none"
            [atmContextMenu]="areaMenu"
          >
            Clique com o botão direito nesta área
          </div>

          <div class="w-full max-w-md overflow-hidden rounded-atm border border-line">
            @for (file of files; track file.name) {
              <div
                class="flex cursor-default items-center gap-2.5 border-b border-line px-3 py-2 text-sm
                  last:border-b-0 hover:bg-surface-alt"
                [atmContextMenu]="fileMenu"
                [atmContextMenuData]="file"
                [atmContextMenuHeader]="file.name"
              >
                <i [class]="'text-ink-muted icofont-' + file.icon" aria-hidden="true"></i>
                <span class="flex-1 text-ink">{{ file.name }}</span>
                <span class="text-xs text-ink-faint">{{ file.size }}</span>
              </div>
            }
          </div>
        </div>

        <atm-context-menu
          #areaMenu
          header="Área de trabalho"
          [items]="areaItems"
          (itemClick)="toast.info('Ação', $event.item.label)"
        />
        <atm-context-menu #fileMenu [items]="fileItems" (itemClick)="onFileAction($event)" />
      </demo-section>

      <demo-section
        id="dropdown-remote"
        title="Dropdown Remote"
        description="Passe qualquer service que estenda AtmRestService (padrão nest-paginator). Carrega no máximo 10 registros; o restante é alcançado pela busca server-side (debounce 300ms). GET {serverUrl}/contacts?sortBy=id:DESC&page=1&search=termo"
        [code]="remoteCode"
        language="typescript"
      >
        <div class="w-full max-w-sm">
          <atm-label>Contato</atm-label>
          <atm-dropdown-remote
            [dataSource]="contacts"
            labelField="name"
            valueField="id"
            [(ngModel)]="contactId"
            [hasActionButton]="true"
            actionButtonLabel="Novo contato"
            (actionClick)="toast.info('actionClick', 'Abra seu modal de cadastro aqui.')"
            (selectionChange)="onContact($event)"
          />
        </div>
        <span class="text-sm text-ink-muted">id selecionado: {{ contactId() ?? '—' }}</span>
      </demo-section>

      <demo-section
        title="Criando o service"
        description="Todo o resto (paginação, busca, URL) vem de graça do AtmRestService."
        [code]="serviceCode"
        language="typescript"
      >
        <p class="text-sm text-ink-muted">
          O <code class="text-primary">serverUrl</code> vem do
          <code class="text-primary">provideAtmusUi(&#123; serverUrl &#125;)</code> configurado no
          app.config.ts a partir do environment.
        </p>
      </demo-section>
    </demo-page>
  `,
})
export class DropdownsPage {
  readonly toast = inject(AtmToastService);
  readonly contacts = inject(ContactsService);

  readonly contactId = signal<number | null>(null);

  readonly menuItems: AtmDropdownItem[] = [
    { label: 'Editar', icon: 'edit', shortcut: 'Ctrl+E' },
    { label: 'Duplicar', icon: 'copy' },
    { label: 'Arquivar', icon: 'archive', disabled: true },
    { label: 'Excluir', icon: 'trash', danger: true, separatorBefore: true },
  ];

  onContact(item: Record<string, unknown> | null): void {
    if (item) this.toast.success('Selecionado', String(item['name']));
  }

  /* --------------------- context menu ---------------------- */

  readonly files = [
    { name: 'relatorio-2026.pdf', icon: 'file-pdf', size: '1,2 MB' },
    { name: 'vendas.xlsx', icon: 'file-excel', size: '340 KB' },
    { name: 'logo-atmus.png', icon: 'file-image', size: '88 KB' },
  ];

  readonly areaItems: AtmContextMenuItem[] = [
    { label: 'Atualizar', value: 'refresh', icon: 'refresh', shortcut: 'F5' },
    { label: 'Colar', value: 'paste', icon: 'copy', shortcut: 'Ctrl+V', disabled: true },
    { label: 'Nova pasta', value: 'new-folder', icon: 'folder', separatorBefore: true },
    { label: 'Novo arquivo', value: 'new-file', icon: 'file-text' },
  ];

  readonly fileItems: AtmContextMenuItem[] = [
    { label: 'Abrir', value: 'open', icon: 'external-link' },
    { label: 'Renomear', value: 'rename', icon: 'edit', shortcut: 'F2' },
    { label: 'Duplicar', value: 'duplicate', icon: 'copy' },
    { label: 'Excluir', value: 'delete', icon: 'trash', danger: true, separatorBefore: true },
  ];

  onFileAction(e: AtmContextMenuSelect): void {
    const file = e.data as { name: string };
    if (e.item.value === 'delete') this.toast.error(`Excluir "${file.name}"`, 'Context menu');
    else this.toast.info(`${e.item.label} — ${file.name}`, 'Context menu');
  }

  readonly dropdownCode = `<atm-dropdown
  [items]="[
    { label: 'Editar', icon: 'edit', shortcut: 'Ctrl+E' },
    { label: 'Excluir', icon: 'trash', danger: true, separatorBefore: true },
  ]"
  [hasActionButton]="true"
  actionButtonLabel="Novo item"
  (itemClick)="onAction($event)"
  (actionClick)="createNew()"
>
  <atm-button variant="outline" iconRight="simple-down">Ações</atm-button>
</atm-dropdown>`;

  readonly contextMenuCode = `<!-- Diretiva em qualquer elemento; data/header por linha -->
<div [atmContextMenu]="fileMenu" [atmContextMenuData]="file" [atmContextMenuHeader]="file.name">
  {{ file.name }}
</div>

<atm-context-menu #fileMenu [items]="fileItems" (itemClick)="onFileAction($event)" />

// Itens (iguais ao AtmDropdown):
fileItems: AtmContextMenuItem[] = [
  { label: 'Abrir', value: 'open', icon: 'external-link' },
  { label: 'Renomear', value: 'rename', icon: 'edit', shortcut: 'F2' },
  { label: 'Excluir', value: 'delete', icon: 'trash', danger: true, separatorBefore: true },
];

// O data volta em cada clique:
onFileAction(e: AtmContextMenuSelect) {
  const file = e.data as File;         // quem foi clicado
  switch (e.item.value) { ... }        // qual ação
}

// Também abre imperativamente (menus dinâmicos — veja o exemplo no Flow):
menu.open(mouseEvent, { items, header: 'Título', data: alvo });`;

  readonly remoteCode = `<atm-dropdown-remote
  [dataSource]="contactsService"
  labelField="name"
  valueField="id"
  sortBy="id:DESC"
  [limit]="10"
  [(ngModel)]="contactId"
  [hasActionButton]="true"
  actionButtonLabel="Novo contato"
  (actionClick)="openCreateContactModal()"
  (selectionChange)="onContactSelected($event)"
/>`;

  readonly serviceCode = `// contacts.service.ts
import { Injectable } from '@angular/core';
import { AtmRestService } from '@atmus/ngui';

export interface Contact {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class ContactsService extends AtmRestService<Contact> {
  protected override resource = 'contacts';
}

// GET https://api.wizeflows.com.br/v1/contacts?sortBy=id:DESC&page=1&search=as`;
}
