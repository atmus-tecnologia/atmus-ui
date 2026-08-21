# atm-card

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/card/card.component.ts`

## Purpose

Card com header/body/footer via projeção.

## Notes from source

Surface card:  <atm-card header="Title" subheader="Description" [hoverable]="true">    content    <div footer>actions</div>  </atm-card>

## Identity

- **Class**: `AtmCard`
- **Selector**: `atm-card`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `header` | string \| undefined | no | undefined |
| `subheader` | string \| undefined | no | undefined |
| `padded` | boolean | no | true |
| `hoverable` | boolean | no | false |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Content projection

- `[footer]`

## Usage example

```html
<atm-card header="Título" subheader="Descrição">Corpo</atm-card>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
