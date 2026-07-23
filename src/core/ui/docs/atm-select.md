# atm-select

> Doc otimizada para LLMs. Fonte: `src/core/ui/components/select/select.component.ts`

## Purpose

Select dropdown com busca, multiple, action button e CVA.

## Notes from source

Custom select with viewport-aware panel (flips up when there is no spacebelow), keyboard navigation and optional footer action button.

## Identity

- **Class**: `AtmSelect`
- **Selector**: `atm-select`
- **Kind**: Component
- **Extends**: `AtmOverlayBase implements ControlValueAccessor`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `options` | AtmSelectOption[] | no | [] |
| `placeholder` | string | no | 'Selecione...' |
| `disabled` | boolean | no | false |
| `invalid` | boolean | no | false |
| `clearable` | boolean | no | false |
| `hasActionButton` | boolean | no | false |
| `actionButtonLabel` | string | no | 'Adicionar novo' |

## Outputs

| Name | Payload |
| --- | --- |
| `actionClick` | void |
| `selectionChange` | AtmSelectOption \| null |

## Models (two-way)

_Nenhum._
## Related interfaces / types

### AtmSelectOption

```ts
export interface AtmSelectOption<T = unknown> {
  label: string;
  value: T;
  description?: string;
  icon?: string;
  disabled?: boolean;
}
```

## Usage example

```html
<atm-select [(ngModel)]="id" [options]="options" placeholder="Escolha" />
```

## Tips

Estende overlay + CVA. Options: {value,label,description?,disabled?,icon?}.

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
