# atm-autocomplete

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/autocomplete/autocomplete.component.ts`

## Purpose

Autocomplete/combobox com filtro local.

## Notes from source

Autocomplete / ComboBox — text input with filtered local suggestions.Alias selectors: atm-autocomplete, atm-combobox.

## Identity

- **Class**: `AtmAutocomplete`
- **Selector**: `atm-autocomplete`
- **Selector aliases**: `atm-autocomplete, atm-combobox`
- **Kind**: Component
- **Extends**: `AtmOverlayBase implements ControlValueAccessor`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `options` | AtmSelectOption[] | no | [] |
| `placeholder` | string | no | 'Digite para pesquisar...' |
| `disabled` | boolean | no | false |
| `invalid` | boolean | no | false |
| `minChars` | number | no | 0 |

## Outputs

| Name | Payload |
| --- | --- |
| `selectionChange` | AtmSelectOption \| null |

## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-autocomplete [(ngModel)]="v" [options]="opts" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
