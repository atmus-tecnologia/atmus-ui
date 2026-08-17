# AtmToastService

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/services/toast.service.ts`

## Purpose

Serviço imperativo de toasts.

## Notes from source

Fecha o toast após executar a ação (default: true). */
  closeOnClick?: boolean;
}

export interface AtmToast {
  id: number;
  severity: AtmColor;
  summary: string;
  /** Conteúdo extra exibido no corpo colapsável. */
  detail?: string;
  /** Tempo de auto-close em ms. 0 = não fecha sozinho. */
  life: number;
  /** Exibe rodapé de contagem regressiva + barra de progresso. */
  showTimer: boolean;
  /** Corpo colapsável começa aberto (default: true). */
  expanded: boolean;
  /** Botão de ação exibido no corpo do toast. */
  action?: AtmToastAction;
  // --- estado interno ---
  remaining: number;
  paused?: boolean;
  stopped?: boolean;
  leaving?: boolean;
}

export type AtmToastOptions = Partial<
  Omit<AtmToast, 'id' | 'remaining' | 'paused' | 'stopped' | 'leaving'>
> & { summary: string };

let toastId = 0;
const TICK_MS = 100;

/**Toast notifications. Render <atm-toast-container /> once (e.g. in App) and:  toast.success('Saved', 'Contact created successfully');  toast.add({ severity: 'danger', summary: 'Error', detail: '...', showTimer: true });  toast.add({ summary: 'Are you sure?', life: 0, action: { label: 'Okay', onClick: () => ... } });

## Identity

- **Class**: `AtmToastService`
- **Selector**: `AtmToastService`
- **Kind**: Service

## Inputs

_Nenhum._
## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Public methods

| Method | Params |
| --- | --- |
| `add` | toast: AtmToastOptions |
| `success` | summary: string, detail?: string, options?: Partial<AtmToastOptions> |
| `error` | summary: string, detail?: string, options?: Partial<AtmToastOptions> |
| `warning` | summary: string, detail?: string, options?: Partial<AtmToastOptions> |
| `info` | summary: string, detail?: string, options?: Partial<AtmToastOptions> |
| `dismiss` | id: number |
| `setTimeout` | ( |
| `stopTimer` | id: number |
| `pause` | id: number |
| `resume` | id: number |
| `toggleExpanded` | id: number |
| `clearInterval` | this.ticker |

## Related interfaces / types

### AtmToastAction

```ts
export interface AtmToastAction {
  label: string;
  onClick?: () => void;
  /** Fecha o toast após executar a ação (default: true). */
  closeOnClick?: boolean;
}
```

### AtmToast

```ts
export interface AtmToast {
  id: number;
  severity: AtmColor;
  summary: string;
  /** Conteúdo extra exibido no corpo colapsável. */
  detail?: string;
  /** Tempo de auto-close em ms. 0 = não fecha sozinho. */
  life: number;
  /** Exibe rodapé de contagem regressiva + barra de progresso. */
  showTimer: boolean;
  /** Corpo colapsável começa aberto (default: true). */
  expanded: boolean;
  /** Botão de ação exibido no corpo do toast. */
  action?: AtmToastAction;
  // --- estado interno ---
  remaining: number;
  paused?: boolean;
  stopped?: boolean;
  leaving?: boolean;
}
```

### AtmToastOptions

```ts
export type AtmToastOptions = Partial<
  Omit<AtmToast, 'id' | 'remaining' | 'paused' | 'stopped' | 'leaving'>
> & { summary: string };
```

## Usage example

```html
inject(AtmToastService).success('Salvo!');
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
