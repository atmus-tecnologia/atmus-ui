# atm-drawer

> Doc otimizada para LLMs. Fonte: `src/core/ui/components/drawer/drawer.component.ts`

## Purpose

Painel lateral (drawer) com posição e open model.

## Notes from source

Slide-in panel:  <atm-drawer [(open)]="showDrawer" header="Filters" position="right">...</atm-drawer>

## Identity

- **Class**: `AtmDrawer`
- **Selector**: `atm-drawer`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `header` | string | no | '' |
| `position` | AtmDrawerPosition | no | 'right' |
| `size` | string | no | '24rem' |
| `dismissable` | boolean | no | true |

## Outputs

| Name | Payload |
| --- | --- |
| `closed` | void |

## Models (two-way)

| Name | Type | Default |
| --- | --- | --- |
| `open` | inferred | false |

## Content projection

- `[footer]`

## Related interfaces / types

### AtmDrawerPosition

```ts
export type AtmDrawerPosition = 'left' | 'right' | 'top' | 'bottom';
```

## Usage example

```html
<atm-drawer [(open)]="open" position="right" title="Filtros">...</atm-drawer>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
