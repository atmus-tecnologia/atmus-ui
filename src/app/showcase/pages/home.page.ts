import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AtmBadge, AtmButton, AtmCard } from '@atmus/ngui';
import { DemoSection } from '../demo-section.component';

@Component({
  selector: 'home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, AtmButton, AtmBadge, AtmCard, DemoSection],
  template: `
    <header class="mb-10">
      <atm-badge color="primary" variant="soft">Angular 20 · Tailwind 4 · IcoFont</atm-badge>
      <h1 class="mt-4 text-4xl font-bold tracking-tight text-ink">Atmus UI</h1>
      <p class="mt-3 max-w-2xl text-base leading-relaxed text-ink-muted">
        Biblioteca de componentes standalone com design consistente — mesmo arredondamento,
        alturas padronizadas (<code class="text-primary">large / medium / slim</code>), tema
        claro/escuro via tokens CSS e foco em performance (OnPush + signals em tudo).
      </p>
      <div class="mt-6 flex gap-3">
        <atm-button routerLink="/buttons" iconRight="simple-right">Explorar componentes</atm-button>
        <atm-button variant="outline" color="neutral" routerLink="/dropdowns">
          Ver Dropdown Remote
        </atm-button>
      </div>
    </header>

    <div class="mb-10 grid gap-4 sm:grid-cols-3">
      <atm-card header="Instalável" subheader="npm install @atmus/ngui e pronto — sem copiar pastas." />
      <atm-card header="Consistente" subheader="Todos os componentes seguem o mesmo size system." />
      <atm-card header="Temável" subheader="Cores em :root — troque a marca em um lugar só." />
    </div>

    <demo-section
      title="Instalação em outro projeto"
      description="A lib é publicada no npm como @atmus/ngui, com CSS já compilado."
      language="bash"
      [code]="installCode"
    >
      <ol class="list-inside list-decimal space-y-2 text-sm text-ink-muted">
        <li><code class="text-primary">npm install @atmus/ngui</code> (ou yarn/pnpm/bun)</li>
        <li>Importe <code class="text-primary">@atmus/ngui/styles.css</code> no styles.css global</li>
        <li>Adicione <code class="text-primary">provideAtmusUi()</code> no app.config.ts</li>
      </ol>
    </demo-section>

    <demo-section
      title="Configuração"
      description="provideAtmusUi define tema inicial e a URL do servidor para componentes remotos."
      language="typescript"
      [code]="configCode"
    >
      <p class="text-sm text-ink-muted">
        O tema escuro é aplicado pela classe <code class="text-primary">.dark</code> no
        <code class="text-primary">&lt;html&gt;</code> e persistido no localStorage.
      </p>
    </demo-section>

    <demo-section
      title="Padrão de tamanhos"
      description="Todo componente aceita [size] com três valores."
      language="html"
      [code]="sizeCode"
    >
      <div class="flex items-end gap-3">
        <atm-button size="large">large · h-12</atm-button>
        <atm-button size="medium">medium · h-10</atm-button>
        <atm-button size="slim">slim · h-8</atm-button>
      </div>
    </demo-section>
  `,
})
export class HomePage {
  readonly installCode = `npm install @atmus/ngui
# yarn add @atmus/ngui
# pnpm add @atmus/ngui
# bun add @atmus/ngui`;

  readonly configCode = `// app.config.ts
import { provideAtmusUi } from '@atmus/ngui';
import { environment } from '../environments/environment';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
    provideAtmusUi({
      theme: 'system', // 'light' | 'dark' | 'system'
      serverUrl: environment.serverUrl,
    }),
  ],
};

// styles.css
@import '@atmus/ngui/styles.css';`;

  readonly sizeCode = `<atm-button size="large">large · h-12</atm-button>
<atm-button size="medium">medium · h-10</atm-button>
<atm-button size="slim">slim · h-8</atm-button>`;
}
