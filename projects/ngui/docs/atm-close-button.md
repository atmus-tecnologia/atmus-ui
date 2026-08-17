# atm-close-button

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/button/close-button.component.ts`

## Purpose

Botão de fechar padronizado (X).

## Identity

- **Class**: `AtmCloseButton`
- **Selector**: `atm-close-button`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |

## Outputs

| Name | Payload |
| --- | --- |
| `clicked` | MouseEvent |

## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-close-button (click)="close()" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
