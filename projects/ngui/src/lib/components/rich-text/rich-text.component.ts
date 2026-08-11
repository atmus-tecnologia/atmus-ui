import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  ViewEncapsulation,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { firstValueFrom, isObservable } from 'rxjs';
import { AtmSize } from '../../types';
import { AtmValueAccessor } from '../../utils/value-accessor';
import { AtmTooltip } from '../tooltip/tooltip.directive';
import {
  ATM_ASSISTANT_HANDLER,
  AtmAssistantAction,
  AtmAssistantMock,
  AtmAssistantRequest,
} from '../../services/assistant.service';

/** Trecho de texto destacado automaticamente dentro do editor. */
export interface AtmRichTextHighlight {
  /** Texto exato a detectar (case-insensitive). */
  text: string;
  /** Cor de fundo da tag, ex.: '#ff8000'. */
  background: string;
  /** Cor do texto da tag, ex.: '#fff'. */
  color?: string;
  /** Tooltip exibido ao passar o mouse na tag. */
  tooltip?: string;
}

/** Configurações extras do editor. */
export interface AtmRichTextConfig {
  highlights?: AtmRichTextHighlight[];
}

interface AiQuickAction {
  id: AtmAssistantAction;
  icon: string;
  label: string;
  divider?: boolean;
}

const AI_SELECTION_ACTIONS: AiQuickAction[] = [
  { id: 'grammar', icon: 'icofont-check', label: 'Corrigir ortografia e gramática' },
  { id: 'improve', icon: 'icofont-magic', label: 'Melhorar escrita' },
  { id: 'extend', icon: 'icofont-text-width', label: 'Estender texto' },
  { id: 'summarize', icon: 'icofont-text-height', label: 'Resumir texto' },
  { id: 'simplify', icon: 'icofont-paragraph', label: 'Simplificar texto' },
  { id: 'tone-professional', icon: 'icofont-briefcase', label: 'Tom profissional', divider: true },
  { id: 'tone-friendly', icon: 'icofont-slightly-smile', label: 'Tom amigável' },
  { id: 'tone-confident', icon: 'icofont-muscle', label: 'Tom confiante' },
  { id: 'tone-casual', icon: 'icofont-coffee-cup', label: 'Tom casual' },
  { id: 'translate-en', icon: 'icofont-globe', label: 'Traduzir para Inglês', divider: true },
  { id: 'translate-pt', icon: 'icofont-globe', label: 'Traduzir para Português' },
  { id: 'translate-es', icon: 'icofont-globe', label: 'Traduzir para Espanhol' },
];

const AI_DOC_CHIPS: { id: AtmAssistantAction; label: string }[] = [
  { id: 'improve', label: 'Melhorar o texto inteiro' },
  { id: 'summarize', label: 'Resumir documento' },
  { id: 'grammar', label: 'Corrigir gramática' },
  { id: 'translate-en', label: 'Traduzir para Inglês' },
];

/**
 * Editor de texto rico (contenteditable) com:
 * - toolbar completa (blocos, marcas inline, alinhamento, listas, link, undo/redo);
 * - bubble de formatação rápida ao selecionar texto;
 * - assistente de IA opcional (`[assistant]="true"`): reescreve a seleção
 *   (bubble) ou o documento inteiro (painel na toolbar). A chamada é delegada
 *   ao token `ATM_ASSISTANT_HANDLER` — sem provider registrado usa o mock;
 * - `[config].highlights`: detecção automática de trechos com tag colorida
 *   e tooltip;
 * - `[scrollHeight]`: altura máxima da área editável (scroll interno).
 *
 * Integra ngModel / formControl (o valor é o HTML do conteúdo).
 */
@Component({
  selector: 'atm-rich-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  imports: [AtmTooltip],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmRichText), multi: true },
  ],
  host: { class: 'block w-full' },
  template: `
    <div
      class="flex flex-col rounded-atm-lg border bg-surface transition-colors duration-200"
      [class]="wrapperClass()"
    >
      <!-- ============ Toolbar flutuante (pill, sem header demarcado) ============ -->
      <div
        class="mx-3 mt-3 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-0.5 self-start
          rounded-2xl border border-line/70 bg-surface-raised px-1.5 py-1 shadow-atm"
        role="toolbar"
        aria-label="Formatação"
      >
        <!-- Desfazer / refazer -->
        <button type="button" [class]="tbClass()" [disabled]="isDisabled()" atmTooltip="Desfazer (Ctrl+Z)"
          (mousedown)="$event.preventDefault()" (click)="exec('undo')">
          <i class="icofont-undo" aria-hidden="true"></i>
        </button>
        <button type="button" [class]="tbClass()" [disabled]="isDisabled()" atmTooltip="Refazer"
          (mousedown)="$event.preventDefault()" (click)="exec('redo')">
          <i class="icofont-redo" aria-hidden="true"></i>
        </button>

        <span class="mx-1 h-4 w-px shrink-0 bg-line" aria-hidden="true"></span>

        <!-- Marcações inline -->
        <button type="button" [class]="tbClass('bold')" [disabled]="isDisabled()" atmTooltip="Negrito (Ctrl+B)"
          (mousedown)="$event.preventDefault()" (click)="exec('bold')">
          <i class="icofont-bold" aria-hidden="true"></i>
        </button>
        <button type="button" [class]="tbClass('italic')" [disabled]="isDisabled()" atmTooltip="Itálico (Ctrl+I)"
          (mousedown)="$event.preventDefault()" (click)="exec('italic')">
          <i class="icofont-italic" aria-hidden="true"></i>
        </button>
        <button type="button" [class]="tbClass('underline')" [disabled]="isDisabled()" atmTooltip="Sublinhado (Ctrl+U)"
          (mousedown)="$event.preventDefault()" (click)="exec('underline')">
          <i class="icofont-underline" aria-hidden="true"></i>
        </button>
        <button type="button" [class]="tbClass('strikeThrough')" [disabled]="isDisabled()" atmTooltip="Tachado"
          (mousedown)="$event.preventDefault()" (click)="exec('strikeThrough')">
          <i class="icofont-strike-through" aria-hidden="true"></i>
        </button>
        <button type="button" [class]="tbCodeClass()" [disabled]="isDisabled()" atmTooltip="Código inline"
          (mousedown)="$event.preventDefault()" (click)="wrapInlineCode()">
          <i class="icofont-code" aria-hidden="true"></i>
        </button>

        <span class="mx-1 h-4 w-px shrink-0 bg-line" aria-hidden="true"></span>

        <!-- Blocos: títulos, citação e código -->
        <button type="button" [class]="tbBlockClass('h1')" [disabled]="isDisabled()" atmTooltip="Título 1"
          (mousedown)="$event.preventDefault()" (click)="toggleBlock('h1')">
          <span class="text-[11px] font-bold">H1</span>
        </button>
        <button type="button" [class]="tbBlockClass('h2')" [disabled]="isDisabled()" atmTooltip="Título 2"
          (mousedown)="$event.preventDefault()" (click)="toggleBlock('h2')">
          <span class="text-[11px] font-bold">H2</span>
        </button>
        <button type="button" [class]="tbBlockClass('h3')" [disabled]="isDisabled()" atmTooltip="Título 3"
          (mousedown)="$event.preventDefault()" (click)="toggleBlock('h3')">
          <span class="text-[11px] font-bold">H3</span>
        </button>
        <button type="button" [class]="tbBlockClass('blockquote')" [disabled]="isDisabled()" atmTooltip="Citação"
          (mousedown)="$event.preventDefault()" (click)="toggleBlock('blockquote')">
          <i class="icofont-quote-left" aria-hidden="true"></i>
        </button>
        <button type="button" [class]="tbBlockClass('pre')" [disabled]="isDisabled()" atmTooltip="Bloco de código"
          (mousedown)="$event.preventDefault()" (click)="toggleBlock('pre')">
          <span class="text-[11px] font-bold">&#123;&#125;</span>
        </button>

        <span class="mx-1 h-4 w-px shrink-0 bg-line" aria-hidden="true"></span>

        <!-- Listas & link -->
        <button type="button" [class]="tbClass('insertUnorderedList')" [disabled]="isDisabled()" atmTooltip="Lista"
          (mousedown)="$event.preventDefault()" (click)="exec('insertUnorderedList')">
          <i class="icofont-listine-dots" aria-hidden="true"></i>
        </button>
        <button type="button" [class]="tbClass('insertOrderedList')" [disabled]="isDisabled()" atmTooltip="Lista numerada"
          (mousedown)="$event.preventDefault()" (click)="exec('insertOrderedList')">
          <i class="icofont-listing-number" aria-hidden="true"></i>
        </button>
        <button type="button" [class]="tbClass()" [disabled]="isDisabled()" atmTooltip="Inserir link"
          (mousedown)="$event.preventDefault()" (click)="setLink()">
          <i class="icofont-link" aria-hidden="true"></i>
        </button>

        <span class="mx-1 h-4 w-px shrink-0 bg-line" aria-hidden="true"></span>

        <!-- Alinhamento -->
        <button type="button" [class]="tbClass('justifyLeft')" [disabled]="isDisabled()" atmTooltip="Alinhar à esquerda"
          (mousedown)="$event.preventDefault()" (click)="exec('justifyLeft')">
          <i class="icofont-align-left" aria-hidden="true"></i>
        </button>
        <button type="button" [class]="tbClass('justifyCenter')" [disabled]="isDisabled()" atmTooltip="Centralizar"
          (mousedown)="$event.preventDefault()" (click)="exec('justifyCenter')">
          <i class="icofont-align-center" aria-hidden="true"></i>
        </button>
        <button type="button" [class]="tbClass('justifyRight')" [disabled]="isDisabled()" atmTooltip="Alinhar à direita"
          (mousedown)="$event.preventDefault()" (click)="exec('justifyRight')">
          <i class="icofont-align-right" aria-hidden="true"></i>
        </button>

        <span class="mx-1 h-4 w-px shrink-0 bg-line" aria-hidden="true"></span>

        <!-- Limpar & assistente -->
        <button type="button" [class]="tbClass()" [disabled]="isDisabled()" atmTooltip="Limpar formatação"
          (mousedown)="$event.preventDefault()" (click)="clearFormatting()">
          <i class="icofont-eraser" aria-hidden="true"></i>
        </button>
        @if (assistant()) {
          <button
            type="button"
            [class]="assistantBtnClass()"
            [disabled]="isDisabled()"
            atmTooltip="Assistente IA"
            (click)="toggleAiBox()"
          >
            <i class="icofont-magic" aria-hidden="true"></i>
          </button>
        }
      </div>

      <!-- ==================== Painel do assistente (documento) ==================== -->
      @if (aiBoxOpen()) {
        <div
          class="animate-atm-pop mx-3 mt-2 overflow-hidden rounded-2xl border border-line
            bg-surface-raised shadow-atm"
        >
            <div
              class="flex items-center gap-2.5 bg-gradient-to-r from-primary-soft to-info-soft
                px-3.5 py-2.5"
            >
              <span
                class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br
                  from-primary to-info text-white shadow-sm"
              >
                <i class="icofont-magic" aria-hidden="true"></i>
              </span>
              <div class="min-w-0 flex-1">
                <p class="text-[13px] leading-tight font-semibold text-ink">Assistente IA</p>
                <p class="text-[11px] leading-tight text-ink-muted">
                  A resposta substitui o documento inteiro
                </p>
              </div>
              <button
                type="button"
                class="atm-focus flex size-7 cursor-pointer items-center justify-center rounded-md
                  text-ink-muted hover:bg-surface-alt hover:text-ink"
                aria-label="Fechar"
                (click)="aiBoxOpen.set(false)"
              >
                <i class="icofont-close" aria-hidden="true"></i>
              </button>
            </div>

            <div class="p-3">
              <textarea
                class="atm-field resize-none p-2.5 text-sm placeholder:text-ink-faint"
                rows="3"
                placeholder="Peça algo à IA… ex.: escreva um documento sobre boas práticas de UX"
                [value]="aiPrompt()"
                [disabled]="aiBoxBusy()"
                (input)="aiPrompt.set($any($event.target).value)"
                (keydown)="onAiPromptKeydown($event)"
              ></textarea>

              <div class="mt-2 flex flex-wrap gap-1.5">
                @for (chip of aiDocChips; track chip.id) {
                  <button
                    type="button"
                    class="atm-focus cursor-pointer rounded-full border border-line bg-surface px-2.5
                      py-1 text-[11px] font-medium text-ink-muted transition-colors
                      hover:border-primary/40 hover:bg-primary-soft hover:text-primary"
                    [disabled]="aiBoxBusy()"
                    (click)="runDocumentAction(chip.id)"
                  >
                    {{ chip.label }}
                  </button>
                }
              </div>

              @if (aiError()) {
                <p class="mt-2 text-xs text-danger">{{ aiError() }}</p>
              }

              <div class="mt-3 flex items-center justify-between gap-2">
                <span class="text-[11px] text-ink-faint">Enter envia · Shift+Enter quebra linha</span>
                <button
                  type="button"
                  class="atm-focus inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg
                    bg-gradient-to-r from-primary to-info px-3 text-xs font-semibold text-white
                    shadow-sm transition-[filter,transform,opacity] hover:brightness-110
                    active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50"
                  [disabled]="aiBoxBusy() || !aiPrompt().trim()"
                  (click)="submitAiPrompt()"
                >
                  @if (aiBoxBusy()) {
                    <i class="icofont-spinner animate-spin" aria-hidden="true"></i>
                    Gerando…
                  } @else {
                    <i class="icofont-send-mail" aria-hidden="true"></i>
                    Gerar
                  }
                </button>
              </div>
            </div>
        </div>
      }

      <!-- ============================ Área editável ============================ -->
      <div
        #editor
        class="atm-rte-content relative w-full overflow-y-auto px-4 py-3.5 text-ink"
        [class]="contentClasses()"
        [class.atm-rte-empty]="isEmpty()"
        [style.minHeight]="minHeightCss()"
        [style.maxHeight]="scrollHeightCss()"
        [attr.contenteditable]="isDisabled() ? 'false' : 'true'"
        [attr.data-placeholder]="placeholder()"
        role="textbox"
        aria-multiline="true"
        (input)="onEditorInput($event)"
        (blur)="onEditorBlur()"
        (mousedown)="closeMenus()"
        (mouseover)="onEditorMouseover($event)"
        (mouseleave)="hlTooltip.set(null)"
        (keydown.escape)="closeAllOverlays()"
      ></div>

      <!-- Rodapé sutil com contagem (sem demarcação) -->
      @if (counter()) {
        <div class="flex items-center justify-end px-4 pb-2.5 text-[11px] text-ink-faint select-none">
          {{ charCount() }} caracteres · {{ wordCount() }} palavras
        </div>
      }
    </div>

    <!-- Tooltip dos highlights (fixed: não é clipado pelo scroll do editor) -->
    @if (hlTooltip(); as tip) {
      <div
        class="animate-atm-fade pointer-events-none fixed z-[80] -translate-x-1/2 -translate-y-full
          rounded-lg bg-ink px-2.5 py-1.5 text-xs font-medium whitespace-nowrap text-surface shadow-atm"
        [style.top]="tip.top"
        [style.left]="tip.left"
        role="tooltip"
      >
        {{ tip.text }}
        <span
          class="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 bg-ink"
          aria-hidden="true"
        ></span>
      </div>
    }

    <!-- ============================ Bubble de seleção ============================ -->
    @if (bubbleVisible()) {
      <div
        #bubble
        class="animate-atm-fade fixed z-[70] rounded-2xl border border-line/70 bg-surface-raised
          p-1 shadow-atm-lg"
        role="toolbar"
        aria-label="Formatação rápida"
        [style.top]="bubbleTop()"
        [style.left]="bubbleLeft()"
        (mousedown)="$event.preventDefault()"
      >
        @if (aiBusy()) {
          <div class="flex items-center gap-2 px-2.5 py-1 text-[13px] font-medium text-primary">
            <i class="icofont-spinner animate-spin" aria-hidden="true"></i>
            Reescrevendo com IA…
          </div>
        } @else {
          <div class="flex items-center gap-0.5">
            @if (assistant()) {
              <button
                type="button"
                class="atm-focus flex h-8 shrink-0 cursor-pointer items-center gap-1.5 rounded-full
                  px-2.5 text-[13px] font-semibold text-primary transition-colors hover:bg-primary-soft"
                [class.bg-primary-soft]="aiMenuOpen()"
                (click)="aiMenuOpen.set(!aiMenuOpen())"
              >
                <i class="icofont-magic" aria-hidden="true"></i>
                Assistente
                <i class="icofont-simple-down text-[8px]" aria-hidden="true"></i>
              </button>
              <span class="mx-0.5 h-4 w-px shrink-0 bg-line" aria-hidden="true"></span>
            }

            <button type="button" [class]="bubbleBtn('bold')" (click)="exec('bold')" aria-label="Negrito">
              <i class="icofont-bold" aria-hidden="true"></i>
            </button>
            <button type="button" [class]="bubbleBtn('italic')" (click)="exec('italic')" aria-label="Itálico">
              <i class="icofont-italic" aria-hidden="true"></i>
            </button>
            <button type="button" [class]="bubbleBtn('underline')" (click)="exec('underline')" aria-label="Sublinhado">
              <i class="icofont-underline" aria-hidden="true"></i>
            </button>
            <button type="button" [class]="bubbleBtn('strikeThrough')" (click)="exec('strikeThrough')" aria-label="Tachado">
              <i class="icofont-strike-through" aria-hidden="true"></i>
            </button>
            <button type="button" [class]="bubbleCodeClass()" (click)="wrapInlineCode()" aria-label="Código">
              <i class="icofont-code" aria-hidden="true"></i>
            </button>

            <span class="mx-0.5 h-4 w-px shrink-0 bg-line" aria-hidden="true"></span>

            <button type="button" [class]="bubbleBtn('insertUnorderedList')" (click)="exec('insertUnorderedList')" aria-label="Lista">
              <i class="icofont-listine-dots" aria-hidden="true"></i>
            </button>
            <button type="button" [class]="bubbleBtn('insertOrderedList')" (click)="exec('insertOrderedList')" aria-label="Lista numerada">
              <i class="icofont-listing-number" aria-hidden="true"></i>
            </button>
            <button type="button" [class]="bubbleBtn()" (click)="setLink()" aria-label="Link">
              <i class="icofont-link" aria-hidden="true"></i>
            </button>
          </div>

          <!-- Menu de ações rápidas de IA sobre a seleção -->
          @if (aiMenuOpen()) {
            <div
              class="animate-atm-pop absolute left-0 z-[71] max-h-72 w-64 overflow-y-auto rounded-xl
                border border-line bg-surface-raised p-1 shadow-atm-lg"
              [class]="bubbleBelow() ? 'bottom-[calc(100%+6px)]' : 'top-[calc(100%+6px)]'"
            >
              @for (action of aiSelectionActions; track action.id) {
                @if (action.divider) {
                  <div class="my-1 h-px bg-line" aria-hidden="true"></div>
                }
                <button
                  type="button"
                  class="atm-option h-8 text-[13px]"
                  (click)="runSelectionAction(action.id)"
                >
                  <i [class]="action.icon + ' w-4 text-center text-primary'" aria-hidden="true"></i>
                  {{ action.label }}
                </button>
              }
            </div>
          }
        }
      </div>
    }
  `,
  styles: [
    `
      .atm-rte-content {
        line-height: 1.65;
        word-break: break-word;
        outline: none;
      }
      .atm-rte-content h1 {
        font-size: 1.6em;
        font-weight: 800;
        line-height: 1.25;
        margin: 0.7em 0 0.35em;
      }
      .atm-rte-content h2 {
        font-size: 1.35em;
        font-weight: 700;
        line-height: 1.3;
        margin: 0.65em 0 0.3em;
      }
      .atm-rte-content h3 {
        font-size: 1.15em;
        font-weight: 600;
        margin: 0.6em 0 0.3em;
      }
      .atm-rte-content h1:first-child,
      .atm-rte-content h2:first-child,
      .atm-rte-content h3:first-child {
        margin-top: 0;
      }
      .atm-rte-content p {
        margin: 0.3em 0;
      }
      .atm-rte-content ul {
        list-style: disc;
        padding-left: 1.5em;
        margin: 0.4em 0;
      }
      .atm-rte-content ol {
        list-style: decimal;
        padding-left: 1.5em;
        margin: 0.4em 0;
      }
      .atm-rte-content blockquote {
        border-left: 3px solid var(--atm-primary);
        background: var(--atm-surface-alt);
        border-radius: 0 8px 8px 0;
        padding: 0.5em 0.9em;
        margin: 0.5em 0;
        color: var(--atm-ink-muted);
        font-style: italic;
      }
      .atm-rte-content pre {
        background: var(--atm-surface-alt);
        border: 1px solid var(--atm-line);
        border-radius: 8px;
        padding: 0.7em 0.9em;
        margin: 0.5em 0;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.9em;
        white-space: pre-wrap;
      }
      .atm-rte-content code {
        background: var(--atm-surface-alt);
        border-radius: 5px;
        padding: 0.1em 0.35em;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 0.9em;
        color: var(--atm-primary);
      }
      .atm-rte-content pre code {
        background: transparent;
        padding: 0;
        color: inherit;
      }
      .atm-rte-content a {
        color: var(--atm-primary);
        text-decoration: underline;
        text-underline-offset: 2px;
      }
      .atm-rte-content.atm-rte-empty::before {
        content: attr(data-placeholder);
        position: absolute;
        top: 0.875rem;
        left: 1rem;
        right: 1rem;
        color: var(--atm-ink-faint);
        pointer-events: none;
      }

      /* Tag de highlight detectada via config. inline-block + nowrap: a tag
         nunca quebra no meio — se não couber na linha, desce inteira. */
      .atm-rte-hl {
        display: inline-block;
        white-space: nowrap;
        max-width: 100%;
        border-radius: 6px;
        padding: 0.05em 0.4em;
        margin: 0 1px;
        line-height: 1.45;
        font-weight: 500;
      }
    `,
  ],
})
export class AtmRichText extends AtmValueAccessor<string> {
  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly zone = inject(NgZone);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly assistantHandler =
    inject(ATM_ASSISTANT_HANDLER, { optional: true }) ?? inject(AtmAssistantMock);

  readonly size = input<AtmSize>('medium');
  readonly placeholder = input('Escreva algo…');
  readonly disabled = input(false);
  readonly invalid = input(false);
  /** Habilita o assistente de IA (bubble + painel da toolbar). */
  readonly assistant = input(false);
  /** Configurações extras — ex.: highlights automáticos. */
  readonly config = input<AtmRichTextConfig>({});
  /** Altura máxima da área editável em px (ou CSS, ex.: '40vh'). Passa disso, rola. */
  readonly scrollHeight = input<number | string | null>(null);
  /** Altura mínima da área editável em px. */
  readonly minHeight = input<number | string>(140);
  /** Exibe o rodapé com contagem de caracteres e palavras. */
  readonly counter = input(true);

  readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  private readonly editorRef = viewChild<ElementRef<HTMLDivElement>>('editor');
  private readonly bubbleRef = viewChild<ElementRef<HTMLDivElement>>('bubble');

  // --- Estado da UI ---
  readonly isEmpty = signal(true);
  readonly charCount = signal(0);
  readonly wordCount = signal(0);
  readonly aiBoxOpen = signal(false);
  readonly aiMenuOpen = signal(false);
  readonly aiBusy = signal(false);
  readonly aiBoxBusy = signal(false);
  readonly aiError = signal('');
  readonly aiPrompt = signal('');
  readonly bubbleVisible = signal(false);
  readonly bubbleTop = signal('0px');
  readonly bubbleLeft = signal('0px');
  /** true quando o bubble abriu abaixo da seleção (menu de IA abre para cima). */
  readonly bubbleBelow = signal(false);
  /** Tooltip flutuante do highlight sob o mouse (fixed, fora do scroll). */
  readonly hlTooltip = signal<{ text: string; top: string; left: string } | null>(null);

  /** Incrementado a cada mudança de seleção — invalida os estados dos botões. */
  private readonly selTick = signal(0);

  readonly aiSelectionActions = AI_SELECTION_ACTIONS;
  readonly aiDocChips = AI_DOC_CHIPS;

  private savedRange: Range | null = null;
  private highlightTimer: ReturnType<typeof setTimeout> | null = null;

  // --- Classes por tamanho ---
  readonly contentClasses = computed(
    () => ({ large: 'text-base', medium: 'text-sm', slim: 'text-sm' })[this.size()],
  );
  readonly btnSize = computed(
    () =>
      ({ large: 'size-9 text-[15px]', medium: 'size-8 text-[13px]', slim: 'size-7 text-xs' })[
        this.size()
      ],
  );

  readonly minHeightCss = computed(() => this.toCss(this.minHeight()));
  readonly scrollHeightCss = computed(() => this.toCss(this.scrollHeight()));

  readonly wrapperClass = computed(() => {
    if (this.isDisabled()) return 'border-line cursor-not-allowed opacity-60';
    if (this.invalid()) return 'border-danger';
    return 'border-line focus-within:border-line-strong';
  });

  /** Botão circular gradiente do assistente (fim da toolbar). */
  readonly assistantBtnClass = computed(
    () =>
      'atm-focus ml-0.5 inline-flex shrink-0 cursor-pointer items-center justify-center ' +
      'rounded-full bg-gradient-to-r from-primary to-info text-white shadow-sm ' +
      'transition-[filter,transform] hover:brightness-110 active:scale-95 ' +
      'disabled:pointer-events-none disabled:opacity-50 ' +
      this.btnSize(),
  );

  constructor() {
    super();

    // Sincroniza valor do form -> DOM (sem clobber enquanto o usuário digita).
    effect(() => {
      const el = this.editorRef()?.nativeElement;
      const value = this.value() ?? '';
      if (!el || document.activeElement === el) return;
      if (el.innerHTML !== value) {
        el.innerHTML = value;
        this.updateStats();
        this.applyHighlights();
      }
    });

    // Reaplica highlights quando a config muda.
    effect(() => {
      this.config();
      const el = this.editorRef()?.nativeElement;
      if (el) this.applyHighlights(true);
    });

    // Listeners globais: seleção (bubble), clique fora e Escape.
    this.zone.runOutsideAngular(() => {
      const onSelectionChange = () => this.zone.run(() => this.updateBubble());
      const onPointerDown = (event: PointerEvent) => {
        const target = event.target as Node;
        if (!this.host.nativeElement.contains(target)) {
          this.zone.run(() => this.closeAllOverlays());
        }
      };
      const onKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') this.zone.run(() => this.closeAllOverlays());
      };
      const onScrollOrResize = () => {
        if (this.bubbleVisible() || this.hlTooltip()) {
          this.zone.run(() => {
            this.hlTooltip.set(null);
            this.updateBubble();
          });
        }
      };

      document.addEventListener('selectionchange', onSelectionChange);
      document.addEventListener('pointerdown', onPointerDown, true);
      document.addEventListener('keydown', onKeydown);
      window.addEventListener('scroll', onScrollOrResize, { passive: true, capture: true });
      window.addEventListener('resize', onScrollOrResize, { passive: true });

      this.destroyRef.onDestroy(() => {
        document.removeEventListener('selectionchange', onSelectionChange);
        document.removeEventListener('pointerdown', onPointerDown, true);
        document.removeEventListener('keydown', onKeydown);
        window.removeEventListener('scroll', onScrollOrResize, true);
        window.removeEventListener('resize', onScrollOrResize);
      });
    });
  }

  // ======================= Toolbar / formatação =======================

  /** Botão circular da toolbar; `cmd` marca ativo via queryCommandState. */
  tbClass(cmd?: string): string {
    return this.circleBtn(cmd ? this.cmdState(cmd) : false, this.btnSize());
  }

  /** Botão circular de bloco (H1, H2, citação...); ativo pelo bloco atual. */
  tbBlockClass(tag: string): string {
    return this.circleBtn(this.currentBlock() === tag, this.btnSize());
  }

  bubbleBtn(cmd?: string): string {
    return this.circleBtn(cmd ? this.cmdState(cmd) : false, 'size-8 text-[13px]');
  }

  private circleBtn(active: boolean, size: string): string {
    return (
      `atm-focus inline-flex shrink-0 cursor-pointer items-center justify-center rounded-full ` +
      `transition-colors disabled:pointer-events-none disabled:opacity-40 ${size} ` +
      (active
        ? 'bg-primary-soft text-primary'
        : 'text-ink-muted hover:bg-surface-alt hover:text-ink')
    );
  }

  exec(command: string, value?: string): void {
    const el = this.editorRef()?.nativeElement;
    if (!el) return;
    el.focus();

    // Comandos de formatação bugam quando a seleção atravessa tags de
    // highlight: o browser fatia os spans e o toggle fica inconsistente.
    // Estratégia: desfaz as tags, executa o comando no texto limpo e
    // reaplica em seguida — a seleção é preservada por offsets de texto
    // (o texto não muda ao tirar/pôr as tags).
    const dance =
      command !== 'undo' && command !== 'redo' && !!el.querySelector('span[data-atm-hl]');
    if (dance) {
      const offsets = this.selectionOffsets(el);
      el.querySelectorAll('span[data-atm-hl]').forEach((span) => this.unwrapElement(span));
      el.normalize();
      if (offsets) this.restoreRange(el, offsets.start, offsets.end);
    }

    try {
      document.execCommand(command, false, value);
    } catch {
      /* comando não suportado */
    }

    if (dance || (this.config()?.highlights?.length ?? 0) > 0) {
      const offsets = this.selectionOffsets(el);
      this.applyHighlights();
      if (offsets) this.restoreRange(el, offsets.start, offsets.end);
    }

    this.selTick.update((t) => t + 1);
    this.syncFromDom();
  }

  setBlock(tag: string): void {
    this.exec('formatBlock', tag.toUpperCase());
  }

  /** Alterna o bloco atual: clicar de novo volta para parágrafo. */
  toggleBlock(tag: string): void {
    this.setBlock(this.currentBlock() === tag ? 'p' : tag);
  }

  setLink(): void {
    const url = window.prompt('URL do link:');
    if (url) this.exec('createLink', url);
  }

  clearFormatting(): void {
    this.exec('removeFormat');
    this.exec('formatBlock', 'P');
  }

  /** Toggle de código inline: dentro de <code> desfaz; com seleção, embrulha. */
  wrapInlineCode(): void {
    const el = this.editorRef()?.nativeElement;
    const sel = document.getSelection();
    if (!el || !sel || sel.rangeCount === 0) return;

    // Toggle OFF: cursor ou seleção dentro de um <code> — desfaz o elemento
    // inteiro, preservando o texto e a seleção (por offsets, texto não muda).
    const code = this.closestInlineCode();
    if (code) {
      const offsets = this.selectionOffsets(el);
      this.unwrapElement(code);
      el.normalize();
      if (offsets) this.restoreRange(el, offsets.start, offsets.end);
      this.selTick.update((t) => t + 1);
      this.syncFromDom();
      return;
    }

    // Toggle ON: embrulha o texto selecionado (plain text, escapado).
    if (sel.isCollapsed) return;
    const text = sel.getRangeAt(0).toString();
    if (!text.trim()) return;
    const escaped = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    // O zero-width space depois do </code> dá ao cursor um lugar FORA do
    // elemento — sem ele, tudo que se digita em seguida vira código também.
    this.exec('insertHTML', `<code>${escaped}</code>&#8203;`);
  }

  /** <code> inline (fora de <pre>) que contém a seleção atual, se houver. */
  private closestInlineCode(): HTMLElement | null {
    const el = this.editorRef()?.nativeElement;
    const node = document.getSelection()?.anchorNode;
    if (!el || !node) return null;
    const element = node instanceof HTMLElement ? node : node.parentElement;
    if (element?.closest('pre')) return null;
    const code = element?.closest('code');
    return code && el.contains(code) ? code : null;
  }

  /** Estado ativo do botão de código inline. */
  inlineCodeActive(): boolean {
    this.selTick();
    return this.closestInlineCode() !== null;
  }

  tbCodeClass(): string {
    return this.circleBtn(this.inlineCodeActive(), this.btnSize());
  }

  bubbleCodeClass(): string {
    return this.circleBtn(this.inlineCodeActive(), 'size-8 text-[13px]');
  }

  currentBlock(): string {
    this.selTick();
    try {
      return (document.queryCommandValue('formatBlock') || 'p').toLowerCase();
    } catch {
      return 'p';
    }
  }

  private cmdState(command: string): boolean {
    this.selTick();
    try {
      return document.queryCommandState(command);
    } catch {
      return false;
    }
  }

  // ======================= Conteúdo / CVA =======================

  onEditorInput(event: Event): void {
    this.selTick.update((t) => t + 1);
    this.hlTooltip.set(null);
    // Correção barata e imediata: se o cursor está dentro de uma tag de
    // highlight e o texto dela mudou (ex.: digitou colado na tag), desfaz a
    // tag na hora — sem varrer o documento.
    this.fixBrokenHighlights();
    this.syncFromDom();

    // Varre o documento só quando faz sentido: ao digitar um separador
    // (espaço, pontuação...) ou em mudanças não tipadas (delete, colar,
    // enter — data === null). Letras/números no meio da palavra não disparam.
    const data = (event as InputEvent).data;
    if (data !== null && data !== '' && !/[^\p{L}\p{N}_]/u.test(data)) return;
    this.scheduleHighlights();
  }

  onEditorBlur(): void {
    this.onTouched();
    // Fecha palavras que ficaram pendentes no meio da digitação.
    this.applyHighlights(true);
  }

  onEditorMouseover(event: MouseEvent): void {
    const target = (event.target as HTMLElement | null)?.closest?.(
      '[data-atm-hl][data-tooltip]',
    ) as HTMLElement | null;
    if (!target) {
      this.hlTooltip.set(null);
      return;
    }
    const rect = target.getBoundingClientRect();
    this.hlTooltip.set({
      text: target.getAttribute('data-tooltip') ?? '',
      top: `${rect.top - 8}px`,
      left: `${rect.left + rect.width / 2}px`,
    });
  }

  private scheduleHighlights(): void {
    if (this.highlightTimer) clearTimeout(this.highlightTimer);
    this.highlightTimer = setTimeout(() => {
      this.applyHighlights(true);
      this.cdr.markForCheck();
    }, 120);
  }

  private syncFromDom(): void {
    const el = this.editorRef()?.nativeElement;
    if (!el) return;
    this.updateStats();
    this.setValue(el.innerHTML);
  }

  private updateStats(): void {
    const el = this.editorRef()?.nativeElement;
    if (!el) return;
    // Zero-width spaces (usados como "âncora" do cursor) não contam.
    const text = (el.textContent ?? '').replace(/\u200B/g, '').trim();
    this.isEmpty.set(text.length === 0 && !el.querySelector('img, hr, li, table'));
    this.charCount.set(text.length);
    this.wordCount.set(text ? text.split(/\s+/).length : 0);
  }

  closeMenus(): void {
    this.aiMenuOpen.set(false);
  }

  closeAllOverlays(): void {
    this.aiMenuOpen.set(false);
    this.aiBoxOpen.set(false);
    this.bubbleVisible.set(false);
  }

  private toCss(value: number | string | null): string | null {
    if (value === null || value === undefined || value === '') return null;
    return typeof value === 'number' ? `${value}px` : value;
  }

  // ======================= Bubble de seleção =======================

  private updateBubble(): void {
    if (this.aiBusy()) return; // mantém o bubble com o loading visível
    const el = this.editorRef()?.nativeElement;
    if (!el || this.isDisabled()) return;

    const sel = document.getSelection();
    const valid =
      !!sel &&
      sel.rangeCount > 0 &&
      !sel.isCollapsed &&
      el.contains(sel.anchorNode) &&
      el.contains(sel.focusNode);

    if (!valid) {
      if (!this.aiMenuOpen()) {
        this.bubbleVisible.set(false);
      }
      return;
    }

    const rect = sel.getRangeAt(0).getBoundingClientRect();
    if (!rect.width && !rect.height) return;

    this.bubbleVisible.set(true);
    this.cdr.detectChanges();

    const bubble = this.bubbleRef()?.nativeElement;
    if (!bubble) return;
    const bw = bubble.offsetWidth;
    const bh = bubble.offsetHeight;

    let top = rect.top - bh - 8;
    let below = false;
    if (top < 8) {
      top = rect.bottom + 8;
      below = true;
    }
    let left = rect.left + rect.width / 2 - bw / 2;
    left = Math.min(Math.max(left, 8), window.innerWidth - bw - 8);

    this.bubbleTop.set(`${top}px`);
    this.bubbleLeft.set(`${left}px`);
    this.bubbleBelow.set(below);
  }

  // ======================= Assistente de IA =======================

  toggleAiBox(): void {
    this.aiError.set('');
    this.aiBoxOpen.set(!this.aiBoxOpen());
  }

  onAiPromptKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.submitAiPrompt();
    }
  }

  submitAiPrompt(): void {
    const prompt = this.aiPrompt().trim();
    if (!prompt || this.aiBoxBusy()) return;
    void this.runDocument({ action: 'custom', prompt });
  }

  runDocumentAction(action: AtmAssistantAction): void {
    if (this.aiBoxBusy()) return;
    void this.runDocument({ action });
  }

  /** Ação rápida sobre o texto selecionado (menu do bubble). */
  runSelectionAction(action: AtmAssistantAction): void {
    const el = this.editorRef()?.nativeElement;
    const sel = document.getSelection();
    if (!el || !sel || sel.rangeCount === 0 || sel.isCollapsed) return;

    const range = sel.getRangeAt(0);
    this.savedRange = range.cloneRange();
    const selectionHtml = this.rangeHtml(range);

    this.aiMenuOpen.set(false);
    this.aiBusy.set(true);

    void this.callAssistant({
      action,
      scope: 'selection',
      selection: selectionHtml,
      document: el.innerHTML,
    })
      .then((html) => {
        if (html === null) return;
        const selection = document.getSelection();
        if (this.savedRange && selection) {
          selection.removeAllRanges();
          selection.addRange(this.savedRange);
        }
        el.focus();
        document.execCommand('insertHTML', false, html);
        this.syncFromDom();
        this.applyHighlights(true);
      })
      .finally(() => {
        this.savedRange = null;
        this.aiBusy.set(false);
        this.bubbleVisible.set(false);
      });
  }

  private async runDocument(opts: { action: AtmAssistantAction; prompt?: string }): Promise<void> {
    const el = this.editorRef()?.nativeElement;
    if (!el) return;
    this.aiError.set('');
    this.aiBoxBusy.set(true);
    try {
      const html = await this.callAssistant({
        action: opts.action,
        scope: 'document',
        prompt: opts.prompt,
        document: el.innerHTML,
      });
      if (html === null) return;
      el.focus();
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = document.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      document.execCommand('insertHTML', false, html);
      this.syncFromDom();
      this.applyHighlights(true);
      this.aiBoxOpen.set(false);
      this.aiPrompt.set('');
    } finally {
      this.aiBoxBusy.set(false);
    }
  }

  private async callAssistant(request: AtmAssistantRequest): Promise<string | null> {
    try {
      const out = this.assistantHandler.run(request);
      const response = isObservable(out) ? await firstValueFrom(out) : await out;
      return response.html;
    } catch {
      this.aiError.set('Não foi possível falar com o assistente. Tente novamente.');
      return null;
    }
  }

  private rangeHtml(range: Range): string {
    const div = document.createElement('div');
    div.appendChild(range.cloneContents());
    return div.innerHTML;
  }

  // ======================= Highlights =======================

  /** Reaplica as tags de highlight; `emit` propaga o HTML resultante ao form. */
  private applyHighlights(emit = false): void {
    const el = this.editorRef()?.nativeElement;
    if (!el) return;

    const highlights = (this.config()?.highlights ?? []).filter((h) => h.text);
    // Nada configurado e nada marcado — sai sem tocar no DOM.
    if (!highlights.length && !el.querySelector('span[data-atm-hl]')) return;

    // Marcador físico na posição do cursor: sobrevive a unwrap/normalize/wrap
    // sem a ambiguidade de offsets de texto (fim de linha vs. início de uma
    // linha vazia têm o mesmo offset — era isso que jogava o cursor de volta
    // para a linha de cima ao dar Enter).
    const marker = document.activeElement === el ? this.insertCaretMarker(el) : null;

    // Remove as marcas antigas (o texto interno é preservado).
    el.querySelectorAll('span[data-atm-hl]').forEach((span) => this.unwrapElement(span));
    el.normalize();

    for (const highlight of highlights) {
      this.wrapMatches(el, highlight);
    }

    if (marker) this.restoreCaretFromMarker(marker);
    if (emit) {
      this.updateStats();
      this.setValue(el.innerHTML);
    }
  }

  private wrapMatches(root: HTMLElement, highlight: AtmRichTextHighlight): void {
    const needle = highlight.text.toLowerCase();
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) =>
        node.parentElement?.closest('[data-atm-hl]')
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT,
    });
    const textNodes: Text[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) textNodes.push(node as Text);

    const isWordChar = (ch: string | undefined) => !!ch && /[\p{L}\p{N}_]/u.test(ch);

    for (const textNode of textNodes) {
      let current = textNode;
      let index = current.data.toLowerCase().indexOf(needle);
      while (index !== -1) {
        // Só marca palavras completas: exige separador (ou borda do texto)
        // antes e depois do trecho — evita pegar 'urgente' em 'urgentemente'
        // ou "engolir" o que ainda está sendo digitado.
        const before = current.data[index - 1];
        const after = current.data[index + needle.length];
        if (isWordChar(before) || isWordChar(after)) {
          index = current.data.toLowerCase().indexOf(needle, index + 1);
          continue;
        }
        const match = current.splitText(index);
        const rest = match.splitText(highlight.text.length);
        const span = document.createElement('span');
        span.setAttribute('data-atm-hl', '');
        span.setAttribute('data-hl-text', needle);
        span.className = 'atm-rte-hl';
        span.style.background = highlight.background;
        if (highlight.color) span.style.color = highlight.color;
        if (highlight.tooltip) span.setAttribute('data-tooltip', highlight.tooltip);
        match.parentNode?.insertBefore(span, match);
        span.appendChild(match);
        current = rest;
        index = current.data.toLowerCase().indexOf(needle);
      }
    }
  }

  /**
   * Se o cursor está dentro de uma tag cujo texto já não bate com o
   * configurado (o browser insere o caractere digitado dentro do span),
   * desfaz só aquela tag — O(1), roda a cada input sem custo perceptível.
   */
  private fixBrokenHighlights(): void {
    const el = this.editorRef()?.nativeElement;
    const node = document.getSelection()?.anchorNode;
    if (!el || !node) return;
    const element = node instanceof HTMLElement ? node : node.parentElement;
    const span = element?.closest('span[data-atm-hl]');
    if (!span || !el.contains(span)) return;
    const expected = span.getAttribute('data-hl-text') ?? '';
    if ((span.textContent ?? '').toLowerCase() !== expected) {
      // Sem normalize() aqui: fundir text nodes moveria o cursor no meio da
      // digitação. A varredura completa normaliza depois, com o caret salvo.
      this.unwrapElement(span);
    }
  }

  private unwrapElement(element: Element): void {
    const parent = element.parentNode;
    if (!parent) return;
    while (element.firstChild) parent.insertBefore(element.firstChild, element);
    parent.removeChild(element);
  }

  /** Início/fim da seleção como offsets de texto dentro do editor. */
  private selectionOffsets(root: HTMLElement): { start: number; end: number } | null {
    const sel = document.getSelection();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    if (!root.contains(range.startContainer) || !root.contains(range.endContainer)) return null;
    const pre = range.cloneRange();
    pre.selectNodeContents(root);
    pre.setEnd(range.startContainer, range.startOffset);
    const start = pre.toString().length;
    return { start, end: start + range.toString().length };
  }

  /** Restaura uma seleção (colapsada ou não) a partir de offsets de texto. */
  private restoreRange(root: HTMLElement, start: number, end: number): void {
    const sel = document.getSelection();
    if (!sel) return;
    const locate = (offset: number): { node: Node; offset: number } => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      let remaining = offset;
      let node: Text | null;
      let last: Text | null = null;
      while ((node = walker.nextNode() as Text | null)) {
        if (remaining <= node.length) return { node, offset: remaining };
        remaining -= node.length;
        last = node;
      }
      return last
        ? { node: last, offset: last.length }
        : { node: root, offset: root.childNodes.length };
    };
    const from = locate(start);
    const to = locate(end);
    const range = document.createRange();
    range.setStart(from.node, from.offset);
    range.setEnd(to.node, to.offset);
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /** Insere um span vazio invisível exatamente onde o cursor está. */
  private insertCaretMarker(root: HTMLElement): HTMLElement | null {
    const sel = document.getSelection();
    if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return null;
    const range = sel.getRangeAt(0);
    if (!root.contains(range.startContainer)) return null;
    const marker = document.createElement('span');
    marker.setAttribute('data-atm-caret', '');
    range.insertNode(marker);
    return marker;
  }

  /** Recoloca o cursor onde o marcador está e o remove do DOM. */
  private restoreCaretFromMarker(marker: HTMLElement): void {
    const parent = marker.parentNode;
    if (!parent) return;
    const index = Array.prototype.indexOf.call(parent.childNodes, marker);
    marker.remove();
    const sel = document.getSelection();
    if (!sel) return;
    const range = document.createRange();
    range.setStart(parent, index);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  }
}
