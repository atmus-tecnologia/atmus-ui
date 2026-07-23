import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AtmButton,
  AtmDropdown,
  AtmDropdownItem,
  AtmDropdownRemote,
  AtmLabel,
  AtmToastService,
} from '../../../core/ui';
import { ContactsService } from '../../services/contacts.service';
import { DemoPage, DemoSection } from '../demo-section.component';

@Component({
  selector: 'dropdowns-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, AtmDropdown, AtmDropdownRemote, AtmButton, AtmLabel, DemoPage, DemoSection],
  template: `
    <demo-page
      title="Dropdown & Dropdown Remote"
      description="Menus de ação e seleção remota via API. Ambos abrem para cima automaticamente quando não há espaço abaixo na viewport."
      importCode="import { AtmDropdown, AtmDropdownRemote, AtmRestService } from 'src/core/ui';"
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
import { AtmRestService } from 'src/core/ui';

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
