import { Injectable, InjectionToken } from '@angular/core';
import { Observable, delay, map, of } from 'rxjs';

/**
 * Contrato do assistente de IA usado pelo AtmRichText.
 *
 * O componente nunca fala com a API diretamente — ele delega para um
 * `AtmAssistantHandler` registrado no token `ATM_ASSISTANT_HANDLER`.
 * Enquanto o backend não existe, o `AtmAssistantMock` (padrão) simula as
 * respostas com um pequeno atraso.
 */

/** Onde a ação será aplicada. */
export type AtmAssistantScope = 'selection' | 'document';

/** Ações rápidas suportadas + 'custom' (prompt livre digitado pelo usuário). */
export type AtmAssistantAction =
  | 'grammar'
  | 'improve'
  | 'extend'
  | 'summarize'
  | 'simplify'
  | 'tone-professional'
  | 'tone-friendly'
  | 'tone-confident'
  | 'tone-casual'
  | 'translate-en'
  | 'translate-pt'
  | 'translate-es'
  | 'custom';

/**
 * Payload de entrada — é exatamente isso que o backend receberá.
 * Sugestão de endpoint: `POST /api/assistant/rewrite`.
 */
export interface AtmAssistantRequest {
  action: AtmAssistantAction;
  scope: AtmAssistantScope;
  /** Prompt livre digitado pelo usuário (quando action === 'custom'). */
  prompt?: string;
  /** HTML do trecho selecionado (quando scope === 'selection'). */
  selection?: string;
  /** HTML do documento inteiro — serve de contexto para a IA. */
  document: string;
}

/** Payload de resposta da API. */
export interface AtmAssistantResponse {
  /** HTML que substitui a seleção (scope 'selection') ou o documento inteiro. */
  html: string;
}

/** Implemente esta interface no service real que chamará a API. */
export interface AtmAssistantHandler {
  run(request: AtmAssistantRequest): Observable<AtmAssistantResponse> | Promise<AtmAssistantResponse>;
}

/**
 * Registre o service real assim:
 *
 * ```ts
 * providers: [
 *   { provide: ATM_ASSISTANT_HANDLER, useClass: MeuAssistantApiService },
 * ]
 * ```
 *
 * ```ts
 * @Injectable({ providedIn: 'root' })
 * export class MeuAssistantApiService implements AtmAssistantHandler {
 *   private readonly http = inject(HttpClient);
 *   run(request: AtmAssistantRequest) {
 *     return this.http.post<AtmAssistantResponse>('/api/assistant/rewrite', request);
 *   }
 * }
 * ```
 */
export const ATM_ASSISTANT_HANDLER = new InjectionToken<AtmAssistantHandler>(
  'ATM_ASSISTANT_HANDLER',
);

const TONE_LABEL: Partial<Record<AtmAssistantAction, string>> = {
  'tone-professional': 'profissional',
  'tone-friendly': 'amigável',
  'tone-confident': 'confiante',
  'tone-casual': 'casual',
};

/**
 * Implementação SIMULADA — usada automaticamente quando nenhum
 * `ATM_ASSISTANT_HANDLER` foi registrado. Apenas transforma o texto de forma
 * visível para demonstrar o fluxo (loading → substituição).
 */
@Injectable({ providedIn: 'root' })
export class AtmAssistantMock implements AtmAssistantHandler {
  run(request: AtmAssistantRequest): Observable<AtmAssistantResponse> {
    return of(request).pipe(
      // Simula a latência da API real.
      delay(1100),
      map((req) => ({ html: this.fake(req) })),
    );
  }

  private fake(req: AtmAssistantRequest): string {
    const source = req.scope === 'selection' ? (req.selection ?? '') : req.document;
    const text = this.toPlainText(source).trim();

    switch (req.action) {
      case 'grammar':
        return this.wrap(req, `${text} — <em>(ortografia e gramática revisadas ✓)</em>`);
      case 'improve':
        return this.wrap(
          req,
          `${text} Essa versão foi lapidada pela IA: frases mais claras, ritmo melhor e zero redundância.`,
        );
      case 'extend':
        return this.wrap(
          req,
          `${text} Além disso, vale aprofundar o contexto: a IA expandiu este trecho com exemplos, dados de apoio e uma conclusão que amarra a ideia central.`,
        );
      case 'summarize':
        return this.wrap(req, `<strong>Resumo:</strong> ${this.firstSentence(text)}`);
      case 'simplify':
        return this.wrap(req, `${this.firstSentence(text)} (versão simplificada, direto ao ponto.)`);
      case 'tone-professional':
      case 'tone-friendly':
      case 'tone-confident':
      case 'tone-casual':
        return this.wrap(req, `${text} <em>(reescrito com tom ${TONE_LABEL[req.action]})</em>`);
      case 'translate-en':
        return this.wrap(req, `[EN] ${text}`);
      case 'translate-pt':
        return this.wrap(req, `[PT] ${text}`);
      case 'translate-es':
        return this.wrap(req, `[ES] ${text}`);
      case 'custom':
      default:
        if (req.scope === 'document') {
          return [
            `<h2>✨ Documento gerado pela IA</h2>`,
            `<p><strong>Pedido:</strong> ${req.prompt ?? ''}</p>`,
            `<p>Este conteúdo é uma simulação. Quando a API real estiver conectada ao token`,
            `<code>ATM_ASSISTANT_HANDLER</code>, a resposta do modelo substituirá este texto,`,
            `mantendo a formatação em HTML.</p>`,
            `<ul><li>Entrada: <code>AtmAssistantRequest</code></li>`,
            `<li>Saída: <code>AtmAssistantResponse</code></li></ul>`,
          ].join('\n');
        }
        return this.wrap(req, `${text} <em>(ajustado conforme: "${req.prompt ?? ''}")</em>`);
    }
  }

  private wrap(req: AtmAssistantRequest, html: string): string {
    return req.scope === 'document' ? `<p>${html}</p>` : html;
  }

  private firstSentence(text: string): string {
    const match = text.match(/[^.!?]+[.!?]?/);
    return (match?.[0] ?? text).trim();
  }

  private toPlainText(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent ?? '';
  }
}
