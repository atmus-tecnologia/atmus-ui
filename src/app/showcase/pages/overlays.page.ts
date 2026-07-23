import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import {
  ATM_DIALOG_DATA,
  AtmAlertDialogService,
  AtmButton,
  AtmDialogRef,
  AtmDialogService,
  AtmDrawer,
  AtmInput,
  AtmLabel,
  AtmModal,
  AtmPopover,
  AtmToastService,
  AtmTooltip,
  AtmTooltipPlacement,
} from '../../../core/ui';
import { FormsModule } from '@angular/forms';
import { DemoPage, DemoSection } from '../demo-section.component';

/** Example component opened dynamically by AtmDialogService. */
@Component({
  selector: 'product-list-demo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmButton],
  template: `
    <p class="mb-3 text-sm text-ink-muted">
      Componente aberto dinamicamente. Data recebida via
      <code class="text-primary">ATM_DIALOG_DATA</code>: {{ data?.origin }}
    </p>
    <div class="flex flex-col gap-2">
      @for (product of products; track product.id) {
        <button
          type="button"
          class="atm-option justify-between border border-line py-3"
          (click)="pick(product)"
        >
          <span>{{ product.name }}</span>
          <span class="text-xs text-ink-muted">R$ {{ product.price }}</span>
        </button>
      }
    </div>
    <div class="mt-4 flex justify-end">
      <atm-button variant="ghost" color="neutral" (clicked)="ref.close()">Cancelar</atm-button>
    </div>
  `,
})
export class ProductListDemo {
  readonly ref = inject(AtmDialogRef);
  readonly data = inject(ATM_DIALOG_DATA) as { origin: string } | null;

  readonly products = [
    { id: 1, name: 'Notebook Pro 14"', price: '8.999' },
    { id: 2, name: 'Monitor 4K 27"', price: '2.499' },
    { id: 3, name: 'Teclado mecânico', price: '499' },
  ];

  pick(product: { id: number; name: string }): void {
    this.ref.close(product);
  }
}

@Component({
  selector: 'overlays-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    AtmButton,
    AtmModal,
    AtmDrawer,
    AtmPopover,
    AtmTooltip,
    AtmInput,
    AtmLabel,
    DemoPage,
    DemoSection,
  ],
  template: `
    <demo-page
      title="Overlays"
      description="Modais, diálogos dinâmicos, drawers, popovers, tooltips e toasts."
      importCode="import { AtmModal, AtmDialogService, AtmAlertDialogService, AtmDrawer, AtmPopover, AtmTooltip, AtmToastService } from 'src/core/ui';"
    >
      <demo-section
        id="modal"
        title="Modal"
        description="Header com botão de expandir (90% da viewport com margem) e fechar. Fecha com Esc/backdrop."
        [code]="modalCode"
      >
        <atm-button (clicked)="showModal.set(true)">Abrir modal</atm-button>
        <atm-modal [(open)]="showModal" header="Editar perfil" width="28rem">
          <div class="flex flex-col gap-4">
            <div>
              <atm-label>Nome</atm-label>
              <atm-input [(ngModel)]="modalName" />
            </div>
            <p class="text-sm text-ink-muted">
              Clique no ícone de expandir no header para maximizar a 90% do viewport.
            </p>
          </div>
          <div footer class="flex justify-end gap-2">
            <atm-button variant="ghost" color="neutral" (clicked)="showModal.set(false)">
              Cancelar
            </atm-button>
            <atm-button (clicked)="saveModal()">Salvar</atm-button>
          </div>
        </atm-modal>
      </demo-section>

      <demo-section
        id="dynamic-dialog"
        title="Dynamic Dialog"
        description="Estilo PrimeNG: passe um componente e receba um ref com onClose."
        [code]="dynamicCode"
        language="typescript"
      >
        <atm-button icon="cart" (clicked)="openProducts()">Selecionar produto</atm-button>
      </demo-section>

      <demo-section
        id="alert-dialog"
        title="AlertDialog"
        description="Confirmação por Promise — await direto no handler."
        [code]="alertCode"
        language="typescript"
      >
        <atm-button color="danger" variant="soft" icon="trash" (clicked)="confirmDelete()">
          Excluir registro
        </atm-button>
        <atm-button variant="outline" color="neutral" (clicked)="simpleAlert()">
          Alerta simples
        </atm-button>
      </demo-section>

      <demo-section id="drawer" title="Drawer" [code]="drawerCode">
        <atm-button variant="outline" color="neutral" (clicked)="drawerPos.set('right'); showDrawer.set(true)">
          Direita
        </atm-button>
        <atm-button variant="outline" color="neutral" (clicked)="drawerPos.set('left'); showDrawer.set(true)">
          Esquerda
        </atm-button>
        <atm-button variant="outline" color="neutral" (clicked)="drawerPos.set('bottom'); showDrawer.set(true)">
          Baixo
        </atm-button>
        <atm-drawer [(open)]="showDrawer" [position]="drawerPos()" header="Filtros">
          <p class="text-sm text-ink-muted">Conteúdo do drawer ({{ drawerPos() }}).</p>
          <div footer class="flex justify-end">
            <atm-button size="slim" (clicked)="showDrawer.set(false)">Aplicar</atm-button>
          </div>
        </atm-drawer>
      </demo-section>

      <demo-section id="popover" title="Popover" [code]="popoverCode">
        <atm-popover placement="bottom">
          <atm-button trigger variant="outline" color="neutral" iconRight="simple-down">
            Abrir popover
          </atm-button>
          <div body class="w-64">
            <p class="text-sm font-semibold text-ink">Conteúdo rico</p>
            <p class="mt-1 text-xs text-ink-muted">
              Qualquer conteúdo aqui dentro. Fecha com Esc ou clique fora, e flipa se faltar espaço.
            </p>
          </div>
        </atm-popover>
      </demo-section>

      <demo-section
        id="tooltip"
        title="Tooltip"
        description="Diretiva — funciona em qualquer elemento. 12 placements com auto-flip na viewport."
        [code]="tooltipCode"
      >
        @for (p of tooltipPlacements; track p) {
          <atm-button variant="soft" color="neutral" [atmTooltip]="'Placement ' + p" [tooltipPlacement]="p">
            {{ p }}
          </atm-button>
        }
      </demo-section>

      <demo-section id="toast" title="Toast" [code]="toastCode">
        <atm-button color="success" variant="soft" (clicked)="toast.success('Sucesso!', 'Registro salvo.')">
          Success
        </atm-button>
        <atm-button color="danger" variant="soft" (clicked)="toast.error('Erro', 'Algo deu errado.')">
          Error
        </atm-button>
        <atm-button color="warning" variant="soft" (clicked)="toast.warning('Atenção', 'Verifique os dados.')">
          Warning
        </atm-button>
        <atm-button color="info" variant="soft" (clicked)="toast.info('Info', 'Nova versão disponível.')">
          Info
        </atm-button>
        <atm-button color="success" variant="soft" (clicked)="toastWithTimer()">Com timer</atm-button>
        <atm-button color="primary" variant="soft" (clicked)="toastCollapsible()">Colapsável</atm-button>
        <atm-button color="neutral" variant="soft" (clicked)="toastWithAction()">Com ação</atm-button>
      </demo-section>
    </demo-page>
  `,
})
export class OverlaysPage {
  readonly toast = inject(AtmToastService);
  private readonly dialog = inject(AtmDialogService);
  private readonly alertDialog = inject(AtmAlertDialogService);

  readonly showModal = signal(false);
  readonly modalName = signal('Ana Souza');
  readonly showDrawer = signal(false);
  readonly drawerPos = signal<'left' | 'right' | 'top' | 'bottom'>('right');

  saveModal(): void {
    this.showModal.set(false);
    this.toast.success('Perfil salvo', this.modalName());
  }

  openProducts(): void {
    const ref = this.dialog.open<{ name: string }>(ProductListDemo, {
      header: 'Selecionar produto',
      width: '32rem',
      maximizable: true,
      data: { origin: 'overlays-page' },
    });
    ref.onClose.subscribe((product) => {
      if (product) this.toast.info('Produto selecionado', product.name);
    });
  }

  async confirmDelete(): Promise<void> {
    const ok = await this.alertDialog.confirm({
      title: 'Excluir registro',
      message: 'Essa ação não pode ser desfeita. Deseja continuar?',
      color: 'danger',
      confirmLabel: 'Excluir',
    });
    if (ok) this.toast.success('Excluído', 'Registro removido com sucesso.');
  }

  async simpleAlert(): Promise<void> {
    await this.alertDialog.alert({
      title: 'Tudo certo!',
      message: 'Sua conta foi verificada.',
      color: 'success',
    });
  }

  readonly modalCode = `<atm-button (clicked)="show.set(true)">Abrir modal</atm-button>

<atm-modal [(open)]="show" header="Editar perfil" width="28rem" [expandable]="true">
  ...conteúdo...
  <div footer class="flex justify-end gap-2">
    <atm-button variant="ghost" color="neutral" (clicked)="show.set(false)">Cancelar</atm-button>
    <atm-button (clicked)="save()">Salvar</atm-button>
  </div>
</atm-modal>`;

  readonly dynamicCode = `// qualquer componente pode ser aberto dinamicamente
private dialog = inject(AtmDialogService);

openProducts() {
  const ref = this.dialog.open<Product>(ProductListDemo, {
    header: 'Selecionar produto',
    width: '50vw',
    maximizable: true,
    data: { origin: 'minha-pagina' },
  });
  ref.onClose.subscribe((product) => {
    if (product) this.toast.info('Selecionado', product.name);
  });
}

// dentro do componente aberto:
readonly ref = inject(AtmDialogRef);
readonly data = inject(ATM_DIALOG_DATA);
this.ref.close(selectedProduct); // devolve o resultado`;

  readonly alertCode = `const ok = await this.alertDialog.confirm({
  title: 'Excluir registro',
  message: 'Essa ação não pode ser desfeita.',
  color: 'danger',
  confirmLabel: 'Excluir',
});
if (ok) { /* excluir */ }`;

  readonly drawerCode = `<atm-drawer [(open)]="show" position="right" header="Filtros" size="24rem">
  ...conteúdo...
  <div footer><atm-button (clicked)="apply()">Aplicar</atm-button></div>
</atm-drawer>`;

  readonly popoverCode = `<atm-popover placement="bottom">
  <atm-button trigger>Abrir popover</atm-button>
  <div body>Conteúdo rico aqui...</div>
</atm-popover>`;

  readonly tooltipPlacements: AtmTooltipPlacement[] = [
    'top', 'bottom', 'left', 'right',
    'top-left', 'top-right', 'bottom-left', 'bottom-right',
    'left-top', 'left-bottom', 'right-top', 'right-bottom',
  ];

  readonly tooltipCode = `<!-- top (padrão) | bottom | left | right
     top-left | top-right | bottom-left | bottom-right
     left-top | left-bottom | right-top | right-bottom -->
<atm-button atmTooltip="Salvar alterações" tooltipPlacement="bottom-right">Hover</atm-button>`;

  readonly toastCode = `private toast = inject(AtmToastService);

this.toast.success('Sucesso!', 'Registro salvo.');
this.toast.error('Erro', 'Algo deu errado.');

// Timer visível (contagem regressiva + barra; clique no rodapé para parar)
this.toast.success('Alterações salvas', undefined, { life: 15000, showTimer: true });

// Conteúdo extra colapsável (chevron no header; expanded: false começa fechado)
this.toast.info('Nova versão', 'Detalhes da atualização...', { expanded: false });

// Botão de ação
this.toast.add({
  severity: 'success',
  summary: 'Alterações salvas',
  detail: 'Tem certeza que deseja remover este usuário?',
  showTimer: true,
  life: 15000,
  action: { label: 'Okay', onClick: () => console.log('ok!') },
});

// <atm-toast-container /> renderizado uma vez no App`;

  toastWithTimer(): void {
    this.toast.success('Alterações salvas', undefined, { life: 15000, showTimer: true });
  }

  toastCollapsible(): void {
    this.toast.add({
      severity: 'primary',
      summary: 'Nova versão disponível',
      detail:
        'A versão 2.4 inclui melhorias de desempenho, correções de bugs e o novo módulo de relatórios.',
      expanded: false,
      life: 0,
    });
  }

  toastWithAction(): void {
    this.toast.add({
      severity: 'success',
      summary: 'Alterações salvas',
      detail:
        'Tem certeza que deseja remover este usuário? Se ele for um membro ativo da sua equipe, a conta será excluída. Esta ação não pode ser desfeita.',
      showTimer: true,
      life: 15000,
      action: { label: 'Okay', onClick: () => this.toast.info('Ação executada', 'Você clicou em Okay.') },
    });
  }
}
