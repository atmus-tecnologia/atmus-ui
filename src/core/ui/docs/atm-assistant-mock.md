# AtmAssistantMock

> Doc otimizada para LLMs. Fonte: `src/core/ui/services/assistant.service.ts`

## Purpose

AtmAssistantMock — componente Atmus UI.

## Identity

- **Class**: `AtmAssistantMock`
- **Selector**: `AtmAssistantMock`
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
| `run` | request: AtmAssistantRequest |
| `delay` | 1100 |
| `map` | (req |
| `return` | match?.[0] ?? text |

## Related interfaces / types

### AtmAssistantScope

```ts
export type AtmAssistantScope = 'selection' | 'document';
```

### AtmAssistantAction

```ts
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
```

### AtmAssistantRequest

```ts
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
```

### AtmAssistantResponse

```ts
export interface AtmAssistantResponse {
  /** HTML que substitui a seleção (scope 'selection') ou o documento inteiro. */
  html: string;
}
```

### AtmAssistantHandler

```ts
export interface AtmAssistantHandler {
  run(request: AtmAssistantRequest): Observable<AtmAssistantResponse> | Promise<AtmAssistantResponse>;
}
```

## Usage example

```html
<AtmAssistantMock />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
