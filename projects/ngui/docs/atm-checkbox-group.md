# atm-checkbox-group

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/checkbox/checkbox-group.component.ts`

## Purpose

Grupo de checkboxes com valor array.

## Notes from source

Group of checkboxes bound to an array value.

## Identity

- **Class**: `AtmCheckboxGroup`
- **Selector**: `atm-checkbox-group`
- **Kind**: Component
- **Extends**: `AtmValueAccessor<unknown[]>`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `options` | AtmCheckboxOption[] | no | [] |
| `direction` | 'row' \| 'column' | no | 'column' |
| `disabled` | boolean | no | false |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Related interfaces / types

### AtmCheckboxOption

```ts
export interface AtmCheckboxOption {
  label: string;
  value: unknown;
  description?: string;
  disabled?: boolean;
}
```

## Usage example

```html
<atm-checkbox-group [(ngModel)]="selected" [options]="opts" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
