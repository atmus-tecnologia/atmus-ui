# atm-tag-group

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/tag-group/tag-group.component.ts`

## Purpose

Grupo de tags selecionáveis.

## Notes from source

Tag input — type and press Enter to add, Backspace to remove last.Value is string[].

## Identity

- **Class**: `AtmTagGroup`
- **Selector**: `atm-tag-group`
- **Kind**: Component
- **Extends**: `AtmValueAccessor<string[]>`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `placeholder` | string | no | 'Digite e pressione Enter...' |
| `disabled` | boolean | no | false |
| `invalid` | boolean | no | false |
| `maxTags` | number \| undefined | no | undefined |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-tag-group [(ngModel)]="tags" [options]="opts" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
