# atm-rich-text

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/rich-text/rich-text.component.ts`

## Purpose

Editor rich-text com toolbar e integração de assistente opcional.

## Notes from source

Trecho de texto destacado automaticamente dentro do editor. */
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

/**Editor de texto rico (contenteditable) com:- toolbar completa (blocos, marcas inline, alinhamento, listas, link, undo/redo);- bubble de formatação rápida ao selecionar texto;- assistente de IA opcional (`[assistant]="true"`): reescreve a seleção  (bubble) ou o documento inteiro (painel na toolbar). A chamada é delegada  ao token `ATM_ASSISTANT_HANDLER` — sem provider registrado usa o mock;- `[config].highlights`: detecção automática de trechos com tag colorida  e tooltip;- `[scrollHeight]`: altura máxima da área editável (scroll interno).Integra ngModel / formControl (o valor é o HTML do conteúdo).

## Identity

- **Class**: `AtmRichText`
- **Selector**: `atm-rich-text`
- **Kind**: Component
- **Extends**: `AtmValueAccessor<string>`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `placeholder` | string | no | 'Escreva algo…' |
| `disabled` | boolean | no | false |
| `invalid` | boolean | no | false |
| `assistant` | boolean | no | false |
| `config` | AtmRichTextConfig | no | {...} |
| `scrollHeight` | number \| string \| null | no | null |
| `minHeight` | number \| string | no | 140 |
| `counter` | boolean | no | true |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Related interfaces / types

### AtmRichTextHighlight

```ts
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
```

### AtmRichTextConfig

```ts
export interface AtmRichTextConfig {
  highlights?: AtmRichTextHighlight[];
}
```

## Usage example

```html
<atm-rich-text [(ngModel)]="html" />
```

## Tips

Valor tipicamente HTML string via CVA.

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
