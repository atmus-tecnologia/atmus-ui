# atm-popover

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/popover/popover.component.ts`

## Purpose

Popover/painel flutuante ancorado a um trigger.

## Notes from source

Rich content popover with projected trigger and body:  <atm-popover placement="bottom">    <atm-button trigger>Open</atm-button>    <div body>Any content...</div>  </atm-popover>

## Identity

- **Class**: `AtmPopover`
- **Selector**: `atm-popover`
- **Kind**: Component
- **Extends**: `AtmOverlayBase`

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `popPlacement` | AtmPlacement | no | 'bottom', { alias: 'placement' } |
| `popAlign` | AtmAlign | no | 'start', { alias: 'align' } |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Content projection

- `[trigger]`
- `[body]`

## Usage example

```html
<atm-popover>
  <button>Info</button>
  <!-- conteúdo do painel -->
</atm-popover>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
