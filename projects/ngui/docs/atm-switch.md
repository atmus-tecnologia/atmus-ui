# atm-switch

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/switch/switch.component.ts`

## Purpose

Toggle on/off com CVA boolean.

## Identity

- **Class**: `AtmSwitch`
- **Selector**: `atm-switch`
- **Kind**: Component
- **Extends**: `AtmValueAccessor<boolean>`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `label` | string \| undefined | no | undefined |
| `disabled` | boolean | no | false |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Content projection

- `default`

## Usage example

```html
<atm-switch [(ngModel)]="ativo" label="Ativo" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
