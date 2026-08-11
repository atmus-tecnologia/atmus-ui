# atm-radio-group

> Doc otimizada para LLMs. Fonte: `src/core/ui/components/radio/radio-group.component.ts`

## Purpose

Grupo de radio buttons com CVA.

## Identity

- **Class**: `AtmRadioGroup`
- **Selector**: `atm-radio-group`
- **Kind**: Component
- **Extends**: `AtmValueAccessor<unknown>`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `options` | AtmRadioOption[] | no | [] |
| `direction` | 'row' \| 'column' | no | 'column' |
| `disabled` | boolean | no | false |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Related interfaces / types

### AtmRadioOption

```ts
export interface AtmRadioOption {
  label: string;
  value: unknown;
  description?: string;
  disabled?: boolean;
}
```

## Usage example

```html
<atm-radio-group [(ngModel)]="plan" [options]="plans" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
