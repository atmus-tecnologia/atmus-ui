# atm-separator

> Doc otimizada para LLMs. Fonte: `src/core/ui/components/misc/misc.components.ts`

## Purpose

Separador horizontal/vertical.

## Notes from source

Horizontal or vertical separator with optional label.

## Identity

- **Class**: `AtmSeparator`
- **Selector**: `atm-separator`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `vertical` | boolean | no | false |
| `label` | string \| undefined | no | undefined |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-separator />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
