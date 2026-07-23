import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import {
  AtmAlert,
  AtmMeter,
  AtmProgressBar,
  AtmProgressCircle,
  AtmSkeleton,
  AtmSpinner,
} from '../../../core/ui';
import { DemoPage, DemoSection } from '../demo-section.component';

@Component({
  selector: 'feedback-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    AtmAlert,
    AtmProgressBar,
    AtmProgressCircle,
    AtmMeter,
    AtmSkeleton,
    AtmSpinner,
    DemoPage,
    DemoSection,
  ],
  template: `
    <demo-page
      title="Feedback"
      description="Estados de carregamento, progresso e mensagens."
      importCode="import { AtmAlert, AtmProgressBar, AtmProgressCircle, AtmMeter, AtmSkeleton, AtmSpinner } from 'src/core/ui';"
    >
      <demo-section id="alert" title="Alert" [code]="alertCode">
        <div class="flex w-full flex-col gap-3">
          <atm-alert color="info" title="Nova versão disponível" actionLabel="Atualizar">
            Atualize a página para aproveitar os novos recursos e correções.
          </atm-alert>
          <atm-alert color="danger" title="Falha na conexão" actionLabel="Tentar de novo">
            Estamos com problemas de conexão. Verifique sua internet e tente novamente.
          </atm-alert>
          <atm-alert color="success" title="Perfil atualizado com sucesso" [dismissible]="true" />
          <atm-alert color="primary" title="Processando sua solicitação" [loading]="true">
            Aguarde enquanto sincronizamos seus dados. Isso pode levar alguns instantes.
          </atm-alert>
          <atm-alert color="warning" title="Manutenção programada">
            Nossos serviços ficarão indisponíveis no domingo, das 2h às 6h.
          </atm-alert>
        </div>
      </demo-section>

      <demo-section id="progress-bar" title="ProgressBar" [code]="progressCode">
        <div class="flex w-full max-w-md flex-col gap-4">
          <atm-progress-bar [value]="progress()" [showLabel]="true" label="Enviando arquivos" />
          <atm-progress-bar [value]="80" color="success" size="large" />
          <atm-progress-bar [indeterminate]="true" size="slim" />
        </div>
      </demo-section>

      <demo-section id="progress-circle" title="ProgressCircle" [code]="circleCode">
        <atm-progress-circle [value]="progress()" size="large" />
        <atm-progress-circle [value]="66" />
        <atm-progress-circle [value]="90" size="slim" color="success" [showLabel]="false" />
      </demo-section>

      <demo-section
        id="meter"
        title="Meter"
        description="Cor muda automaticamente pelos thresholds."
        [code]="meterCode"
      >
        <div class="flex w-full max-w-md flex-col gap-4">
          <atm-meter [value]="35" label="Uso de disco" />
          <atm-meter [value]="75" label="Memória" />
          <atm-meter [value]="95" label="CPU" />
        </div>
      </demo-section>

      <demo-section id="skeleton" title="Skeleton" [code]="skeletonCode">
        <div class="flex w-full max-w-sm items-center gap-3">
          <atm-skeleton shape="circle" width="3rem" height="3rem" />
          <div class="flex flex-1 flex-col gap-2">
            <atm-skeleton height="0.875rem" width="60%" />
            <atm-skeleton height="0.75rem" width="90%" />
          </div>
        </div>
      </demo-section>

      <demo-section id="spinner" title="Spinner" [code]="spinnerCode">
        <atm-spinner size="large" />
        <atm-spinner />
        <atm-spinner size="slim" color="neutral" />
      </demo-section>
    </demo-page>
  `,
})
export class FeedbackPage {
  readonly progress = signal(20);

  constructor() {
    setInterval(() => {
      this.progress.update((v) => (v >= 100 ? 0 : v + 10));
    }, 1200);
  }

  readonly alertCode = `<atm-alert color="danger" title="Falha na conexão" actionLabel="Tentar de novo" (action)="retry()">
  Estamos com problemas de conexão. Verifique sua internet e tente novamente.
</atm-alert>
<atm-alert color="primary" title="Processando sua solicitação" [loading]="true">
  Aguarde enquanto sincronizamos seus dados.
</atm-alert>
<atm-alert color="success" title="Perfil atualizado com sucesso" [dismissible]="true" />`;

  readonly progressCode = `<atm-progress-bar [value]="progress" [showLabel]="true" label="Enviando" />
<atm-progress-bar [indeterminate]="true" size="slim" />`;

  readonly circleCode = `<atm-progress-circle [value]="66" size="large" />`;

  readonly meterCode = `<atm-meter [value]="95" label="CPU" [warnAt]="70" [dangerAt]="90" />`;

  readonly skeletonCode = `<atm-skeleton shape="circle" width="3rem" height="3rem" />
<atm-skeleton height="0.875rem" width="60%" />`;

  readonly spinnerCode = `<atm-spinner size="large" color="primary" />`;
}
