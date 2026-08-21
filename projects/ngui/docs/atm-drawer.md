# atm-drawer

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/drawer/drawer.component.ts`

## Purpose

Painel lateral (drawer) com posição e open model.

## Notes from source

Must match the 0.3s of the .atm-drawer-in/out-* classes in atmus.css. */
const ANIM_MS = 300;

const ENTER_ANIM: Record<AtmDrawerPosition, string> = {
  right: 'atm-drawer-in-right',
  left: 'atm-drawer-in-left',
  top: 'atm-drawer-in-top',
  bottom: 'atm-drawer-in-bottom',
};

const LEAVE_ANIM: Record<AtmDrawerPosition, string> = {
  right: 'atm-drawer-out-right',
  left: 'atm-drawer-out-left',
  top: 'atm-drawer-out-top',
  bottom: 'atm-drawer-out-bottom',
};

/**
Slide-in panel with enter/exit animation on every edge.
Top/bottom render as a centered sheet (grab handle + rounded corners).
  <atm-drawer [(open)]="showDrawer" header="Filters" position="right">...</atm-drawer>
  <atm-drawer [(open)]="show" position="bottom" header="Preferences" description="...">...</atm-drawer>
Inside a container (e.g. a modal — the nearest `relative` + `overflow-hidden` ancestor):
  <atm-drawer [(open)]="show" position="bottom" container="parent">...</atm-drawer>

## Identity

- **Class**: `AtmDrawer`
- **Selector**: `atm-drawer`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `header` | string | no | '' |
| `description` | string | no | '' |
| `position` | AtmDrawerPosition | no | 'right' |
| `size` | string | no | '24rem' |
| `width` | string | no | '32rem' |
| `container` | 'viewport' \| 'parent' | no | 'viewport' |
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
<atm-drawer [(open)]="open" position="right" header="Filtros">...</atm-drawer>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
