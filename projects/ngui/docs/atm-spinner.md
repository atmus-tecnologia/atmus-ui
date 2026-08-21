# atm-spinner

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/spinner/spinner.component.ts`

## Purpose

Indicador de carregamento circular.

## Identity

- **Class**: `AtmSpinner`
- **Selector**: `atm-spinner`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `color` | AtmColor | no | 'primary' |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-spinner size="medium" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
