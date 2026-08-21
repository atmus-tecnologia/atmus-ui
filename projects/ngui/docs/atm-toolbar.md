# atm-toolbar

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/toolbar/toolbar.component.ts`

## Purpose

Barra de ferramentas com slots.

## Notes from source

Toolbar with start / center / end slots:  <atm-toolbar>    <div start>...</div><div center>...</div><div end>...</div>  </atm-toolbar>

## Identity

- **Class**: `AtmToolbar`
- **Selector**: `atm-toolbar`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `elevated` | boolean | no | false |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Content projection

- `[start]`
- `[center]`
- `[end]`

## Usage example

```html
<atm-toolbar>...</atm-toolbar>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
