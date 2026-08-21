# atm-checkbox

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/checkbox/checkbox.component.ts`

## Purpose

Checkbox com CVA boolean/indeterminate.

## Notes from source

Checkbox. Works with forms (ngModel/formControl) or controlled via
[checked] + (changed) when used inside groups.

## Identity

- **Class**: `AtmCheckbox`
- **Selector**: `atm-checkbox`
- **Kind**: Component
- **Extends**: `AtmValueAccessor<boolean>`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `label` | string \| undefined | no | undefined |
| `description` | string \| undefined | no | undefined |
| `disabled` | boolean | no | false |
| `indeterminate` | boolean | no | false |
| `checked` | boolean \| undefined | no | undefined |

## Outputs

| Name | Payload |
| --- | --- |
| `changed` | boolean |

## Models (two-way)

_Nenhum._
## Content projection

- `default`

## Usage example

```html
<atm-checkbox [(ngModel)]="ok">Aceito</atm-checkbox>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
