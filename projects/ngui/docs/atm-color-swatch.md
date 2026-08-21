# atm-color-swatch

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/color/color.components.ts`

## Purpose

Swatch de cor visual.

## Notes from source

Static color square with checkerboard for transparency.

## Identity

- **Class**: `AtmColorSwatch`
- **Selector**: `atm-color-swatch`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `color` | string | no | '#000000' |
| `size` | AtmSize | no | 'medium' |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-color-swatch color="#3366ff" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
