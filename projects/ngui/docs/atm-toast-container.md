# atm-toast-container

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/toast/toast-container.component.ts`

## Purpose

Host visual dos toasts; use AtmToastService para disparar.

## Notes from source

Render once at app root: <atm-toast-container />

## Identity

- **Class**: `AtmToastContainer`
- **Selector**: `atm-toast-container`
- **Kind**: Component

## Inputs

_Nenhum._
## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-toast-container />
```

## Tips

Coloque uma vez no shell/layout.

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
