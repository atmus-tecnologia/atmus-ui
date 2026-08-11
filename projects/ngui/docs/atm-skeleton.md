# atm-skeleton

> Doc otimizada para LLMs. Fonte: `src/core/ui/components/skeleton/skeleton.component.ts`

## Purpose

Placeholder de loading (skeleton).

## Notes from source

Loading placeholder with shimmer effect.

## Identity

- **Class**: `AtmSkeleton`
- **Selector**: `atm-skeleton`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `width` | string | no | '100%' |
| `height` | string | no | '1rem' |
| `shape` | 'text' \| 'circle' \| 'rect' | no | 'text' |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-skeleton class="h-4 w-40" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
