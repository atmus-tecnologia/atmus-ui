# atm-action-bar

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/action-bar/action-bar.component.ts`

## Purpose

Barra de ações flutuante (seleção em massa).

## Notes from source

Floating toolbar for contextual actions (bulk selection, editing controls…).
Appears centered at the bottom (or top) of the viewport — or of the nearest
`relative` container when `container="parent"`.
  <atm-action-bar
    [open]="selection().length > 0"
    [count]="selection().length"
    (closed)="selection.set([])"
  >
    <atm-button size="slim" variant="ghost" color="neutral" icon="edit-02">Editar</atm-button>
    <atm-button size="slim" variant="ghost" color="danger" icon="delete-02">Excluir</atm-button>
  </atm-action-bar>

## Identity

- **Class**: `AtmActionBar`
- **Selector**: `atm-action-bar`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `open` | boolean | no | false |
| `position` | 'bottom' \| 'top' | no | 'bottom' |
| `container` | 'viewport' \| 'parent' | no | 'viewport' |
| `size` | AtmSize | no | 'medium' |
| `count` | number \| null | no | null |
| `showClose` | boolean | no | true |
| `ariaLabel` | string | no | 'Ações' |

## Outputs

| Name | Payload |
| --- | --- |
| `closed` | void |

## Models (two-way)

_Nenhum._
## Content projection

- `default`

## Usage example

```html
<atm-action-bar [open]="sel.length>0" [count]="sel.length" (closed)="clear()">
  <atm-button>Excluir</atm-button>
</atm-action-bar>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
