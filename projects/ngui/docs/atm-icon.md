# atm-icon

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/icon/icon.component.ts`

## Purpose

Renderiza um ícone do Atmus Icons pelo nome.

## Notes from source

Atmus Icons wrapper. Usage: `<atm-icon name="home-01" />` renders
`<i class="atm atm-home-01">`. Passing the full class also works:
`<atm-icon name="atm-search-01" />`.
The `atm` base class carries the font declarations and is required — the
`atm-*` class alone only selects the glyph. That split is deliberate: a rule
matching every `atm-*` class would also capture design-system classes such as
`atm-field` and `atm-panel`, forcing an icon font onto buttons and panels.

## Identity

- **Class**: `AtmIcon`
- **Selector**: `atm-icon`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `name` | string | yes | — |
| `iconClass_` | string | no | '', { alias: 'className' } |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-icon name="tick-02" class="text-lg" />
```

## Tips

Use nomes sem o prefixo `atm-` (ex.: name="tick-02"). O componente já adiciona a classe base `atm`, obrigatória para o glifo renderizar. Lista completa em `@atmus/icons/icons.json`; o pacote também exporta o tipo `AtmIconName`.

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
