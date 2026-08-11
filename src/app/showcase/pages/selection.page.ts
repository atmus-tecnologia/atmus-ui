import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AtmCheckbox,
  AtmCheckboxGroup,
  AtmLabel,
  AtmRadioGroup,
  AtmSlider,
  AtmSwitch,
} from '@atmus/ngui';
import { DemoPage, DemoSection } from '../demo-section.component';

@Component({
  selector: 'selection-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    JsonPipe,
    AtmCheckbox,
    AtmCheckboxGroup,
    AtmRadioGroup,
    AtmSwitch,
    AtmSlider,
    AtmLabel,
    DemoPage,
    DemoSection,
  ],
  template: `
    <demo-page
      title="Seleção"
      description="Controles booleanos e de escolha, todos integrados a ngModel / Reactive Forms."
      importCode="import { AtmCheckbox, AtmCheckboxGroup, AtmRadioGroup, AtmSwitch, AtmSlider } from '@atmus/ngui';"
    >
      <demo-section id="checkbox" title="Checkbox" [code]="checkboxCode">
        <div class="flex flex-col gap-3">
          <atm-checkbox label="Aceito os termos de uso" [(ngModel)]="accepted" />
          <atm-checkbox
            label="Com descrição"
            description="Texto auxiliar explicando a opção."
          />
          <atm-checkbox label="Indeterminado" [indeterminate]="true" />
          <atm-checkbox label="Desabilitado" [disabled]="true" />
        </div>
      </demo-section>

      <demo-section
        id="checkbox-group"
        title="CheckboxGroup"
        description="Valor é um array."
        [code]="checkboxGroupCode"
      >
        <div class="flex flex-col gap-3">
          <atm-checkbox-group [options]="fruitOptions" direction="row" [(ngModel)]="fruits" />
          <span class="text-sm text-ink-muted">selecionados: {{ fruits() | json }}</span>
        </div>
      </demo-section>

      <demo-section id="radio-group" title="RadioGroup" [code]="radioCode">
        <atm-radio-group [options]="planOptions" [(ngModel)]="plan" />
        <span class="text-sm text-ink-muted">plano: {{ plan() }}</span>
      </demo-section>

      <demo-section id="switch" title="Switch" [code]="switchCode">
        <div class="flex flex-col gap-3">
          <atm-switch size="large" label="Notificações (large)" [(ngModel)]="notify" />
          <atm-switch label="Modo compacto (medium)" />
          <atm-switch size="slim" label="Backup automático (slim)" />
          <atm-switch label="Desabilitado" [disabled]="true" />
        </div>
      </demo-section>

      <demo-section id="slider" title="Slider" [code]="sliderCode">
        <div class="flex w-full max-w-md flex-col gap-6">
          <div>
            <atm-label>Volume · {{ volume() }}%</atm-label>
            <atm-slider [(ngModel)]="volume" [showValue]="true" />
          </div>
          <div>
            <atm-label>Slim, passo 10</atm-label>
            <atm-slider size="slim" [step]="10" [(ngModel)]="step10" />
          </div>
        </div>
      </demo-section>
    </demo-page>
  `,
})
export class SelectionPage {
  readonly accepted = signal(false);
  readonly fruits = signal<string[]>(['banana']);
  readonly plan = signal('pro');
  readonly notify = signal(true);
  readonly volume = signal(40);
  readonly step10 = signal(30);

  readonly fruitOptions = [
    { label: 'Maçã', value: 'maca' },
    { label: 'Banana', value: 'banana' },
    { label: 'Laranja', value: 'laranja' },
  ];

  readonly planOptions = [
    { label: 'Starter', value: 'starter', description: 'Para projetos pessoais' },
    { label: 'Pro', value: 'pro', description: 'Para times pequenos' },
    { label: 'Enterprise', value: 'enterprise', description: 'Suporte dedicado', disabled: true },
  ];

  readonly checkboxCode = `<atm-checkbox label="Aceito os termos de uso" [(ngModel)]="accepted" />
<atm-checkbox label="Com descrição" description="Texto auxiliar." />
<atm-checkbox label="Indeterminado" [indeterminate]="true" />`;

  readonly checkboxGroupCode = `<atm-checkbox-group
  [options]="[
    { label: 'Maçã', value: 'maca' },
    { label: 'Banana', value: 'banana' },
  ]"
  direction="row"
  [(ngModel)]="fruits"
/>`;

  readonly radioCode = `<atm-radio-group
  [options]="[
    { label: 'Starter', value: 'starter', description: 'Para projetos pessoais' },
    { label: 'Pro', value: 'pro', description: 'Para times pequenos' },
  ]"
  [(ngModel)]="plan"
/>`;

  readonly switchCode = `<atm-switch size="large" label="Notificações" [(ngModel)]="notify" />`;

  readonly sliderCode = `<atm-slider [(ngModel)]="volume" [showValue]="true" />
<atm-slider size="slim" [min]="0" [max]="100" [step]="10" [(ngModel)]="value" />`;
}
