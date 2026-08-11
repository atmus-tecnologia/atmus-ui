import { ChangeDetectionStrategy, Component, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AtmButton,
  AtmInput,
  AtmOffice,
  AtmOfficeAgent,
  AtmSelect,
  AtmSelectOption,
  AtmSwitch,
} from '@atmus/ngui';
import { DemoPage, DemoSection } from '../demo-section.component';

const TEAM: AtmOfficeAgent[] = [
  { id: 'amelia', name: 'Amelia', role: 'CEO', boss: true },
  { id: 'lucas', name: 'Lucas', role: 'Dev Backend' },
  { id: 'mariana', name: 'Mariana', role: 'Dev Frontend' },
  { id: 'pedro', name: 'Pedro', role: 'QA' },
  { id: 'ana', name: 'Ana', role: 'Designer' },
  { id: 'rafael', name: 'Rafael', role: 'DevOps' },
];

const SQUAD: AtmOfficeAgent[] = [
  { id: 'boss', name: 'Athena', role: 'Tech Lead', boss: true, color: '#8b5cf6' },
  { id: 'dev1', name: 'Nina', role: 'IA · Código', color: '#06b6d4' },
  { id: 'dev2', name: 'Otto', role: 'IA · Testes', color: '#f97316' },
  { id: 'dev3', name: 'Zara', role: 'IA · Docs', color: '#ec4899' },
];

@Component({
  selector: 'office-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmOffice, AtmButton, AtmInput, AtmSelect, AtmSwitch, FormsModule, DemoPage, DemoSection],
  template: `
    <demo-page
      title="Office"
      description="Escritório virtual animado — os personagens andam entre as mesas, conversam em
        balões de fala e se reúnem na sala de reunião ao redor do chefe. Todo o movimento é
        comandado por uma API fluente, pensada para assistentes de IA controlados pelo backend."
      importCode="import { AtmOffice } from '@atmus/ngui';"
    >
      <demo-section
        id="office"
        title="Escritório completo"
        description="Equipe com chefe + 5 agentes. Ligue o modo demo para conversas espontâneas,
          chame a reunião com pauta e clique em um personagem para selecioná-lo."
        [code]="officeCode"
      >
        <div class="flex w-full flex-col gap-4">
          <atm-office
            #office
            [agents]="team"
            [demo]="demoOn()"
            (agentClick)="clicked.set($event.name)"
          />

          <div class="flex flex-wrap items-center gap-3">
            <atm-input
              placeholder="Pauta da reunião (opcional)"
              class="max-w-64"
              [(ngModel)]="topic"
            />
            <atm-button icon="megaphone" (clicked)="office.meeting(topic())">
              Chamar reunião
            </atm-button>
            <atm-button variant="soft" color="neutral" (clicked)="office.backToWork()">
              Voltar ao trabalho
            </atm-button>
            <atm-button variant="soft" color="neutral" (clicked)="office.randomChat()">
              Conversa aleatória
            </atm-button>
            <label class="ml-auto flex items-center gap-2 text-sm text-ink-muted">
              Modo demo
              <atm-switch [ngModel]="demoOn()" (ngModelChange)="demoOn.set($event)" />
            </label>
          </div>

          <div class="flex flex-wrap items-end gap-3 rounded-atm border border-line bg-surface-alt/40 p-4">
            <div class="flex min-w-44 flex-col gap-1">
              <span class="text-xs font-semibold text-ink-faint uppercase">Quem age</span>
              <atm-select [options]="agentOptions" [(ngModel)]="actor" size="slim" />
            </div>
            <div class="flex min-w-44 flex-col gap-1">
              <span class="text-xs font-semibold text-ink-faint uppercase">Vai até</span>
              <atm-select [options]="agentOptions" [(ngModel)]="target" size="slim" />
            </div>
            <div class="flex min-w-56 flex-1 flex-col gap-1">
              <span class="text-xs font-semibold text-ink-faint uppercase">
                Mensagem (vazio = frase aleatória)
              </span>
              <atm-input placeholder="Ex.: Pode revisar meu PR?" size="slim" [(ngModel)]="message" />
            </div>
            <atm-button size="slim" (clicked)="runVisit()">Executar</atm-button>
          </div>

          @if (clicked(); as name) {
            <p class="text-sm text-ink-muted">
              Último personagem clicado: <strong class="text-ink">{{ name }}</strong>
            </p>
          }
        </div>
      </demo-section>

      <demo-section
        id="office-custom"
        title="Equipe customizada"
        description="Qualquer número de agentes (1 chefe + até 8), com cores próprias por CSS e
          letreiro configurável. Aqui, um squad de assistentes de IA em modo demo."
        [code]="customCode"
      >
        <atm-office
          [agents]="squad"
          [demo]="true"
          title="Atmus · AI Squad"
          [showLegend]="false"
          size="slim"
        />
      </demo-section>

      <demo-section
        id="office-api"
        title="API para o backend"
        description="Cada agente tem uma fila de comandos processada em sequência. O backend
          (WebSocket/SSE) só precisa traduzir eventos dos assistentes de IA nessas chamadas —
          o evento (agentIdle) avisa quando um agente terminou a fila."
        language="typescript"
        [code]="apiCode"
      >
        <div class="flex flex-wrap items-center gap-3">
          <atm-button variant="soft" icon="play-alt-1" (clicked)="runScript()">
            Rodar roteiro de exemplo
          </atm-button>
          <span class="text-sm text-ink-muted">
            Executa a sequência do snippet no escritório da primeira seção.
          </span>
        </div>
      </demo-section>
    </demo-page>
  `,
})
export class OfficePage {
  readonly office = viewChild.required<AtmOffice>('office');

  readonly team = TEAM;
  readonly squad = SQUAD;

  readonly demoOn = signal(true);
  readonly topic = signal('');
  readonly message = signal('');
  readonly actor = signal('ana');
  readonly target = signal('pedro');
  readonly clicked = signal('');

  readonly agentOptions: AtmSelectOption<string>[] = TEAM.map((a) => ({
    label: `${a.name} (${a.role})`,
    value: a.id,
  }));

  runVisit(): void {
    if (this.actor() === this.target()) return;
    this.office().visit(this.actor(), this.target(), this.message());
    this.message.set('');
  }

  runScript(): void {
    const office = this.office();
    office.stopAll();
    office.agent('ana').moveTo('pedro').talk('Pode revisar meu PR?').wait(2200).backToDesk();
    office.agent('pedro').wait(2600).talk('Deixa comigo!', 2000);
    office.agent('mariana').wait(1000).moveTo('lucas').talk('CI quebrou no seu branch...').wait(2400).backToDesk();
    office.agent('lucas').wait(4200).talk('Já olho isso.', 1800);
    office.agent('amelia').wait(6000).moveTo('rafael').talk('Como foi o deploy?').wait(2600).backToDesk();
    office.agent('rafael').wait(9000).talk('Tudo verde, chefe!', 2200);
  }

  // --- Snippets ---

  readonly officeCode = `<atm-office #office [agents]="team" [demo]="true" (agentClick)="select($event)" />

<atm-button (clicked)="office.meeting('Planejamento da sprint')">Chamar reunião</atm-button>
<atm-button (clicked)="office.backToWork()">Voltar ao trabalho</atm-button>

// componente
readonly team: AtmOfficeAgent[] = [
  { id: 'amelia', name: 'Amelia', role: 'CEO', boss: true },
  { id: 'lucas', name: 'Lucas', role: 'Dev Backend' },
  { id: 'mariana', name: 'Mariana', role: 'Dev Frontend' },
  // ...até 8 agentes + chefe
];`;

  readonly customCode = `<atm-office
  [agents]="squad"
  [demo]="true"
  title="Atmus · AI Squad"
  [showLegend]="false"
  size="slim"
/>

readonly squad: AtmOfficeAgent[] = [
  { id: 'boss', name: 'Athena', role: 'Tech Lead', boss: true, color: '#8b5cf6' },
  { id: 'dev1', name: 'Nina', role: 'IA · Código', color: '#06b6d4' },
  { id: 'dev2', name: 'Otto', role: 'IA · Testes', color: '#f97316' },
  { id: 'dev3', name: 'Zara', role: 'IA · Docs', color: '#ec4899' },
];`;

  readonly apiCode = `const office = this.office(); // viewChild<AtmOffice>

// API fluente por agente — cada chamada entra na fila dele
office.agent('ana').moveTo('pedro').talk('Pode revisar meu PR?').wait(2200).backToDesk();
office.agent('pedro').wait(2600).talk('Deixa comigo!', 2000);

// Atalhos de coreografia
office.visit('mariana', 'lucas', 'CI quebrou no seu branch');  // vai, fala, ouve e volta
office.meeting('Planejamento da sprint');                      // todos para a sala, chefe fala
office.backToWork();                                           // todos voltam às mesas
office.randomChat();                                           // conversa espontânea
office.stopAll();                                              // cancela todas as filas

// Orquestração pelo backend
// <atm-office (agentIdle)="onAgentIdle($event)" /> — agente terminou a fila
office.isBusy('ana');   // ainda tem comandos pendentes?
office.inMeeting();     // signal: reunião em andamento`;
}
