# atm-number-field

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/input/number-field.component.ts`

## Purpose

Campo numérico com steppers e CVA.

## Notes from source

Numeric input with increment/decrement steppers, min/max and step.

## Identity

- **Class**: `AtmNumberField`
- **Selector**: `atm-number-field`
- **Kind**: Component
- **Extends**: `AtmValueAccessor<number>`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `placeholder` | string | no | '' |
| `min` | number \| undefined | no | undefined |
| `max` | number \| undefined | no | undefined |
| `step` | number | no | 1 |
| `disabled` | boolean | no | false |
| `invalid` | boolean | no | false |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-number-field [(ngModel)]="qtd" [min]="0" [max]="99" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
