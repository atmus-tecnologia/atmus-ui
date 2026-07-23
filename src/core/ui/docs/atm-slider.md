# atm-slider

> Doc otimizada para LLMs. Fonte: `src/core/ui/components/slider/slider.component.ts`

## Purpose

Slider numérico com CVA.

## Identity

- **Class**: `AtmSlider`
- **Selector**: `atm-slider`
- **Kind**: Component
- **Extends**: `AtmValueAccessor<number>`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `min` | number | no | 0 |
| `max` | number | no | 100 |
| `step` | number | no | 1 |
| `disabled` | boolean | no | false |
| `showValue` | boolean | no | false |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-slider [(ngModel)]="vol" [min]="0" [max]="100" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
