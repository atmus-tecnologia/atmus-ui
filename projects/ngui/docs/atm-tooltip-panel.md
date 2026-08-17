# atm-tooltip-panel

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/tooltip/tooltip.directive.ts`

## Purpose

Painel interno do tooltip (uso interno).

## Identity

- **Class**: `AtmTooltipPanel`
- **Selector**: `atm-tooltip-panel`
- **Kind**: Component

## Inputs

_Nenhum._
## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Related interfaces / types

### AtmTooltipPlacement

```ts
export type AtmTooltipPlacement =
  | AtmPlacement
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'left-top'
  | 'left-bottom'
  | 'right-top'
  | 'right-bottom';
```

## Usage example

```html
<!-- criado automaticamente pela diretiva atmTooltip -->
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
