# atm-time-field

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/datepicker/time-field.component.ts`

## Purpose

Campo de horário.

## Notes from source

Time input (HH:mm). Value is a 'HH:mm' string.

## Identity

- **Class**: `AtmTimeField`
- **Selector**: `atm-time-field`
- **Kind**: Component
- **Extends**: `AtmValueAccessor<string>`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `disabled` | boolean | no | false |
| `invalid` | boolean | no | false |
| `stepSeconds` | number \| undefined | no | undefined |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-time-field [(ngModel)]="time" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
