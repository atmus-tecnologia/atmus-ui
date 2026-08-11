import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  AtmButton,
  AtmButtonGroup,
  AtmCloseButton,
  AtmToggleButton,
  AtmToggleButtonGroup,
  AtmToastService,
} from '@atmus/ngui';
import { inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DemoPage, DemoSection } from '../demo-section.component';

@Component({
  selector: 'buttons-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AtmButton,
    AtmButtonGroup,
    AtmCloseButton,
    AtmToggleButton,
    AtmToggleButtonGroup,
    FormsModule,
    DemoPage,
    DemoSection,
  ],
  template: `
    <demo-page
      title="Botões"
      description="Ações com variantes solid, soft, outline e ghost, seis cores semânticas e três tamanhos."
      importCode="import { AtmButton, AtmButtonGroup, AtmCloseButton, AtmToggleButton, AtmToggleButtonGroup } from '@atmus/ngui';"
    >
      <demo-section id="button" title="Button" description="Variantes e cores." [code]="variantsCode">
        <div class="flex w-full flex-col gap-3">
          <div class="flex flex-wrap gap-2">
            <atm-button>Primary</atm-button>
            <atm-button color="success">Success</atm-button>
            <atm-button color="warning">Warning</atm-button>
            <atm-button color="danger">Danger</atm-button>
            <atm-button color="info">Info</atm-button>
            <atm-button color="neutral">Neutral</atm-button>
          </div>
          <div class="flex flex-wrap gap-2">
            <atm-button variant="soft">Soft</atm-button>
            <atm-button variant="outline">Outline</atm-button>
            <atm-button variant="ghost">Ghost</atm-button>
            <atm-button variant="soft" color="danger">Soft danger</atm-button>
            <atm-button variant="outline" color="neutral">Outline neutral</atm-button>
          </div>
        </div>
      </demo-section>

      <demo-section title="Tamanhos, ícones e estados" [code]="statesCode">
        <div class="flex w-full flex-col gap-3">
          <div class="flex flex-wrap items-end gap-2">
            <atm-button size="large" icon="plus">Large</atm-button>
            <atm-button size="medium" icon="plus">Medium</atm-button>
            <atm-button size="slim" icon="plus">Slim</atm-button>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <atm-button [loading]="loading()" (clicked)="simulate()">
              {{ loading() ? 'Salvando...' : 'Clique p/ salvar' }}
            </atm-button>
            <atm-button [loading]="true" variant="soft">Carregando</atm-button>
            <atm-button [loading]="true" variant="outline" color="neutral">Carregando</atm-button>
            <atm-button [disabled]="true">Desabilitado</atm-button>
            <atm-button icon="ui-check" [iconOnly]="true" aria-label="Confirmar" />
            <atm-button [rounded]="true" iconRight="simple-right">Arredondado</atm-button>
          </div>
        </div>
      </demo-section>

      <demo-section id="button-group" title="ButtonGroup" [code]="groupCode">
        <atm-button-group>
          <atm-button variant="outline" color="neutral" icon="ui-text-chat">Anos</atm-button>
          <atm-button variant="outline" color="neutral">Meses</atm-button>
          <atm-button variant="outline" color="neutral">Dias</atm-button>
        </atm-button-group>
      </demo-section>

      <demo-section id="close-button" title="CloseButton" [code]="closeCode">
        <atm-close-button size="large" (clicked)="toast.info('Fechou!', 'CloseButton large')" />
        <atm-close-button (clicked)="toast.info('Fechou!', 'CloseButton medium')" />
        <atm-close-button size="slim" (clicked)="toast.info('Fechou!', 'CloseButton slim')" />
      </demo-section>

      <demo-section
        id="toggle-button"
        title="ToggleButton"
        description="Botão com estado pressionado."
        [code]="toggleCode"
      >
        <atm-toggle-button icon="star">Favorito</atm-toggle-button>
        <atm-toggle-button icon="notification" [pressed]="true">Notificações</atm-toggle-button>
      </demo-section>

      <demo-section
        id="toggle-button-group"
        title="ToggleButtonGroup"
        description="Seleção exclusiva (ou múltipla) integrada a forms."
        [code]="toggleGroupCode"
      >
        <atm-toggle-button-group [options]="alignOptions" [(ngModel)]="alignment" />
        <span class="text-sm text-ink-muted">valor: {{ alignment() ?? 'nenhum' }}</span>
      </demo-section>
    </demo-page>
  `,
})
export class ButtonsPage {
  readonly toast = inject(AtmToastService);
  readonly loading = signal(false);
  readonly alignment = signal<string | null>('left');

  readonly alignOptions = [
    { label: 'Esquerda', value: 'left' },
    { label: 'Centro', value: 'center' },
    { label: 'Direita', value: 'right' },
  ];

  simulate(): void {
    this.loading.set(true);
    setTimeout(() => this.loading.set(false), 1500);
  }

  readonly variantsCode = `<atm-button>Primary</atm-button>
<atm-button color="success">Success</atm-button>
<atm-button color="danger">Danger</atm-button>

<atm-button variant="soft">Soft</atm-button>
<atm-button variant="outline">Outline</atm-button>
<atm-button variant="ghost">Ghost</atm-button>`;

  readonly statesCode = `<atm-button size="large" icon="plus">Large</atm-button>
<atm-button size="slim" icon="plus">Slim</atm-button>

<!-- [loading] mostra spinner e desabilita o clique -->
<atm-button [loading]="saving" (clicked)="save()">Salvar</atm-button>
<atm-button [loading]="true" variant="soft">Carregando</atm-button>
<atm-button [disabled]="true">Desabilitado</atm-button>
<atm-button icon="ui-check" [iconOnly]="true" />
<atm-button [rounded]="true" iconRight="simple-right">Arredondado</atm-button>`;

  readonly groupCode = `<atm-button-group>
  <atm-button variant="outline" color="neutral">Anos</atm-button>
  <atm-button variant="outline" color="neutral">Meses</atm-button>
  <atm-button variant="outline" color="neutral">Dias</atm-button>
</atm-button-group>`;

  readonly closeCode = `<atm-close-button size="medium" (clicked)="close()" />`;

  readonly toggleCode = `<atm-toggle-button icon="star" [(pressed)]="isFavorite">Favorito</atm-toggle-button>`;

  readonly toggleGroupCode = `<atm-toggle-button-group
  [options]="[
    { label: 'Esquerda', value: 'left' },
    { label: 'Centro', value: 'center' },
    { label: 'Direita', value: 'right' },
  ]"
  [(ngModel)]="alignment"
/>`;
}
