# atm-surface

> Doc otimizada para LLMs. Fonte: `src/core/ui/components/surface/surface.component.ts`

## Purpose

Superfície genérica com tokens de fundo/borda.

## Notes from source

Generic themed surface (background variations without card semantics).

## Identity

- **Class**: `AtmSurface`
- **Selector**: `atm-surface`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `variant` | 'default' \| 'alt' \| 'raised' | no | 'default' |
| `bordered` | boolean | no | true |
| `padded` | boolean | no | true |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Content projection

- `default`

## Usage example

```html
<atm-surface class="p-4">...</atm-surface>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
