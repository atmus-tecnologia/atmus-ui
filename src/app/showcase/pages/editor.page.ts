import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AtmRichText, AtmRichTextConfig } from '@atmus/ngui';
import { DemoPage, DemoSection } from '../demo-section.component';

const BASIC_VALUE = `<h2>Bem-vindo ao editor ✍️</h2>
<p>Todo grande produto começa com um bom texto. Selecione um trecho para ver a <strong>toolbar flutuante</strong> de formatação rápida.</p>
<p>Use a toolbar acima para <em>títulos</em>, listas, citações, alinhamento, links e muito mais.</p>
<blockquote>Um bom editor desaparece — sobra só a escrita.</blockquote>`;

const AI_VALUE = `<h2>Rascunho do artigo</h2>
<p>O maior erro que muitos designers cometem é assumir que já sabem o que os usuários querem. Usuários reais são imprevisíveis: eles se distraem, interpretam mal os rótulos e às vezes só querem a forma mais rápida de terminar uma tarefa.</p>
<p>Selecione qualquer frase acima e clique em <strong>✨ Assistente</strong> para reescrever, resumir, mudar o tom ou traduzir. Ou clique no botão Assistente da toolbar para agir sobre o documento inteiro.</p>`;

const HIGHLIGHT_VALUE = `<p>O deploy do serviço <strong>Atmus API</strong> ficou agendado. O time do Projeto Alfa cuida da migração, enquanto o Projeto Beta valida a integração.</p>
<p>Qualquer incidente deve ser marcado como URGENTE no board — digite "Projeto Alfa", "Projeto Beta" ou "URGENTE" em qualquer lugar do texto e veja a tag aparecer sozinha.</p>`;

@Component({
  selector: 'editor-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmRichText, FormsModule, DemoPage, DemoSection],
  template: `
    <demo-page
      title="Rich Text"
      description="Editor de texto rico com toolbar completa, bubble de formatação ao selecionar,
        assistente de IA opcional (seleção ou documento inteiro), highlights automáticos por
        configuração e altura controlada com scroll. Integra ngModel/formControl — o valor é HTML."
      importCode="import { AtmRichText } from '@atmus/ngui';"
    >
      <demo-section
        id="rich-text"
        title="Editor básico"
        description="Toolbar com formato de bloco, marcas inline, alinhamento, listas, citação,
          link, limpar formatação e undo/redo. Selecione um trecho do texto para ver a toolbar
          flutuante de formatação rápida."
        [code]="basicCode"
      >
        <div class="flex w-full flex-col gap-3">
          <atm-rich-text [(ngModel)]="basicValue" placeholder="Escreva algo…" />
          <details class="w-full">
            <summary class="cursor-pointer text-xs font-medium text-ink-faint">
              Ver HTML gerado (valor do ngModel)
            </summary>
            <pre
              class="mt-2 max-h-40 overflow-auto rounded-atm bg-surface-alt p-3 text-[11px]
                leading-relaxed break-all whitespace-pre-wrap text-ink-muted"
            >{{ basicValue }}</pre>
          </details>
        </div>
      </demo-section>

      <demo-section
        id="rich-text-assistant"
        title="Assistente de IA"
        description="Com [assistant]='true', a toolbar ganha o botão ✨ Assistente (age no documento
          inteiro) e o bubble de seleção ganha o menu de ações rápidas — reescrever, resumir, mudar
          tom, traduzir. As chamadas vão para o token ATM_ASSISTANT_HANDLER; sem provider registrado,
          um mock simula a API com latência (a integração real vem depois)."
        [code]="assistantCode"
        language="typescript"
      >
        <atm-rich-text [(ngModel)]="aiValue" [assistant]="true" [scrollHeight]="340" />
      </demo-section>

      <demo-section
        id="rich-text-highlights"
        title="Highlights automáticos"
        description="Passe [config].highlights com { text, background, color, tooltip } e o editor
          detecta o trecho enquanto você digita, transformando-o numa tag colorida. Passe o mouse
          sobre 'Projeto Beta' para ver o tooltip."
        [code]="highlightsCode"
        language="typescript"
      >
        <atm-rich-text [(ngModel)]="highlightValue" [config]="highlightConfig" />
      </demo-section>

      <demo-section
        id="rich-text-scroll"
        title="Altura controlada (scrollHeight)"
        description="scrollHeight limita a altura da área editável — passou disso, o conteúdo rola.
          minHeight controla a altura mínima. Aceita número (px) ou string CSS ('40vh')."
        [code]="scrollCode"
      >
        <atm-rich-text
          [(ngModel)]="scrollValue"
          [scrollHeight]="160"
          [minHeight]="160"
          placeholder="Digite bastante texto para ver o scroll…"
        />
      </demo-section>

      <demo-section
        id="rich-text-states"
        title="Tamanhos & estados"
        description="Escala large / medium / slim e estados disabled e invalid."
        [code]="statesCode"
      >
        <div class="flex w-full flex-col gap-6">
          <div class="flex w-full flex-col gap-1.5">
            <span class="text-xs font-semibold text-ink-faint uppercase">size="slim"</span>
            <atm-rich-text size="slim" [minHeight]="80" placeholder="Editor slim…" />
          </div>
          <div class="flex w-full flex-col gap-1.5">
            <span class="text-xs font-semibold text-ink-faint uppercase">disabled</span>
            <atm-rich-text [disabled]="true" [minHeight]="80" [ngModel]="'<p>Conteúdo bloqueado.</p>'" />
          </div>
          <div class="flex w-full flex-col gap-1.5">
            <span class="text-xs font-semibold text-ink-faint uppercase">invalid</span>
            <atm-rich-text [invalid]="true" [minHeight]="80" placeholder="Campo obrigatório…" />
          </div>
        </div>
      </demo-section>
    </demo-page>
  `,
})
export class EditorPage {
  basicValue = BASIC_VALUE;
  aiValue = AI_VALUE;
  highlightValue = HIGHLIGHT_VALUE;
  scrollValue = '';

  readonly highlightConfig: AtmRichTextConfig = {
    highlights: [
      { text: 'Projeto Alfa', background: '#0f172a', color: '#fff' },
      {
        text: 'Projeto Beta',
        background: '#ff8000',
        color: '#fff',
        tooltip: 'Squad responsável pela integração',
      },
      { text: 'URGENTE', background: '#ef4444', color: '#fff', tooltip: 'Prioridade máxima' },
      { text: 'Atmus API', background: '#eef2ff', color: '#4338ca', tooltip: 'Serviço core' },
    ],
  };

  // --- Snippets ---

  readonly basicCode = `<atm-rich-text [(ngModel)]="html" placeholder="Escreva algo…" />`;

  readonly assistantCode = `<!-- template -->
<atm-rich-text [(ngModel)]="html" [assistant]="true" [scrollHeight]="340" />

// A IA é plugável: implemente AtmAssistantHandler e registre no token.
// Sem provider, o AtmAssistantMock simula as respostas (demo atual).
@Injectable({ providedIn: 'root' })
export class AssistantApiService implements AtmAssistantHandler {
  private readonly http = inject(HttpClient);

  run(request: AtmAssistantRequest) {
    // payload de entrada:
    // { action: 'improve' | 'summarize' | ... | 'custom',
    //   scope: 'selection' | 'document',
    //   prompt?: string,      // texto digitado pelo usuário (action 'custom')
    //   selection?: string,   // HTML selecionado (scope 'selection')
    //   document: string }    // HTML completo, como contexto
    // resposta: { html: string } — substitui a seleção ou o documento
    return this.http.post<AtmAssistantResponse>('/api/assistant/rewrite', request);
  }
}

// app.config.ts
providers: [{ provide: ATM_ASSISTANT_HANDLER, useClass: AssistantApiService }]`;

  readonly highlightsCode = `<!-- template -->
<atm-rich-text [(ngModel)]="html" [config]="config" />

// componente
readonly config: AtmRichTextConfig = {
  highlights: [
    { text: 'Projeto Alfa', background: '#0f172a', color: '#fff' },
    { text: 'Projeto Beta', background: '#ff8000', color: '#fff',
      tooltip: 'Squad responsável pela integração' },
    { text: 'URGENTE', background: '#ef4444', color: '#fff', tooltip: 'Prioridade máxima' },
  ],
};`;

  readonly scrollCode = `<atm-rich-text [(ngModel)]="html" [scrollHeight]="160" [minHeight]="160" />
<!-- também aceita string CSS: [scrollHeight]="'40vh'" -->`;

  readonly statesCode = `<atm-rich-text size="slim" />
<atm-rich-text [disabled]="true" />
<atm-rich-text [invalid]="true" />`;
}
