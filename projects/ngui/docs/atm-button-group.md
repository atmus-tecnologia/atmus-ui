# atm-button-group

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/button/button-group.component.ts`

## Purpose

Agrupa botões lado a lado (borda compartilhada).

## Notes from source

Groups atm-button elements visually (joined borders / radius).<atm-button-group><atm-button .../><atm-button .../></atm-button-group>

## Identity

- **Class**: `AtmButtonGroup`
- **Selector**: `atm-button-group`
- **Kind**: Component

## Inputs

_Nenhum._
## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Content projection

- `default`

## Usage example

```html
<atm-button-group>
  <atm-button variant="outline">A</atm-button>
  <atm-button variant="outline">B</atm-button>
</atm-button-group>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
