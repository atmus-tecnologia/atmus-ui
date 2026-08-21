# atm-listbox

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/listbox/listbox.component.ts`

## Purpose

Lista selecionável estática (single/multi).

## Notes from source

Inline always-visible option list (single or multiple selection).

## Identity

- **Class**: `AtmListbox`
- **Selector**: `atm-listbox`
- **Kind**: Component
- **Extends**: `AtmValueAccessor<unknown>`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `options` | AtmSelectOption[] | no | [] |
| `multiple` | boolean | no | false |

## Outputs

| Name | Payload |
| --- | --- |
| `selectionChange` | unknown |

## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-listbox [(ngModel)]="v" [options]="opts" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
