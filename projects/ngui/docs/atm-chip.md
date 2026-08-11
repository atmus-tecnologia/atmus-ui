# atm-chip

> Doc otimizada para LLMs. Fonte: `src/core/ui/components/chip/chip.component.ts`

## Purpose

Chip clicável/removível.

## Notes from source

Chip / tag with optional icon and remove button.

## Identity

- **Class**: `AtmChip`
- **Selector**: `atm-chip`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `color` | AtmColor | no | 'neutral' |
| `icon` | string \| undefined | no | undefined |
| `removable` | boolean | no | false |

## Outputs

| Name | Payload |
| --- | --- |
| `removed` | void |

## Models (two-way)

_Nenhum._
## Content projection

- `default`

## Usage example

```html
<atm-chip removable (remove)="onRemove()">Tag</atm-chip>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
