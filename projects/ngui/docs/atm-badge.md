# atm-badge

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/badge/badge.component.ts`

## Purpose

Badge/etiqueta semântica.

## Identity

- **Class**: `AtmBadge`
- **Selector**: `atm-badge`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `color` | AtmColor | no | 'primary' |
| `variant` | 'solid' \| 'soft' \| 'outline' | no | 'soft' |
| `dot` | boolean | no | false |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Content projection

- `default`

## Usage example

```html
<atm-badge color="success">Ativo</atm-badge>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
