# atm-progress-bar

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/progress/progress-bar.component.ts`

## Purpose

Barra de progresso determinada/indeterminada.

## Identity

- **Class**: `AtmProgressBar`
- **Selector**: `atm-progress-bar`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `color` | AtmColor | no | 'primary' |
| `value` | number | no | 0 |
| `label` | string | no | '' |
| `showLabel` | boolean | no | false |
| `indeterminate` | boolean | no | false |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-progress-bar [value]="40" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
