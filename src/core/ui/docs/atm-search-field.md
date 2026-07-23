# atm-search-field

> Doc otimizada para LLMs. Fonte: `src/core/ui/components/input/search-field.component.ts`

## Purpose

Campo de busca com debounce/clear.

## Notes from source

Search input with debounced (search) output.

## Identity

- **Class**: `AtmSearchField`
- **Selector**: `atm-search-field`
- **Kind**: Component
- **Extends**: `AtmValueAccessor<string>`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `placeholder` | string | no | 'Pesquisar...' |
| `disabled` | boolean | no | false |
| `debounce` | number | no | 300 |

## Outputs

| Name | Payload |
| --- | --- |
| `search` | string |

## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-search-field [(ngModel)]="q" placeholder="Buscar..." />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
