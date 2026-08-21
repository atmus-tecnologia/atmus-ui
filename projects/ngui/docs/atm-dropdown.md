# atm-dropdown

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/dropdown/dropdown.component.ts`

## Purpose

Menu dropdown de ações (não é form field).

## Notes from source

Action menu dropdown. The trigger is projected content:
  <atm-dropdown [items]="items" (itemClick)="...">
    <atm-button>Options</atm-button>
  </atm-dropdown>
Flips up automatically when there is no viewport space below.

## Identity

- **Class**: `AtmDropdown`
- **Selector**: `atm-dropdown`
- **Kind**: Component
- **Extends**: `AtmOverlayBase`

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `items` | AtmDropdownItem[] | no | [] |
| `disabled` | boolean | no | false |
| `hasActionButton` | boolean | no | false |
| `actionButtonLabel` | string | no | 'Adicionar novo' |

## Outputs

| Name | Payload |
| --- | --- |
| `itemClick` | AtmDropdownItem |
| `actionClick` | void |

## Models (two-way)

_Nenhum._
## Content projection

- `default`

## Related interfaces / types

### AtmDropdownItem

```ts
export interface AtmDropdownItem {
  label: string;
  value?: unknown;
  icon?: string;
  shortcut?: string;
  danger?: boolean;
  disabled?: boolean;
  separatorBefore?: boolean;
}
```

## Usage example

```html
<atm-dropdown [items]="menuItems">
  <atm-button variant="ghost">Ações</atm-button>
</atm-dropdown>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
