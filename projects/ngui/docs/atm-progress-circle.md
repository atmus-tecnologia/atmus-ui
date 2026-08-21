# atm-progress-circle

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/progress/progress-circle.component.ts`

## Purpose

Progresso circular.

## Identity

- **Class**: `AtmProgressCircle`
- **Selector**: `atm-progress-circle`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `color` | AtmColor | no | 'primary' |
| `value` | number | no | 0 |
| `showLabel` | boolean | no | true |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-progress-circle [value]="70" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
