# atm-icon

> Doc otimizada para LLMs. Fonte: `src/core/ui/components/icon/icon.component.ts`

## Purpose

Renderiza ícone icofont pelo nome.

## Notes from source

Icofont wrapper. Usage: <atm-icon name="home" /> renders `icofont-home`.Pass the full class if preferred: <atm-icon name="icofont-ui-search" />.

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
<atm-icon name="check" class="text-lg" />
```

## Tips

Use names sem o prefixo icofont- (ex.: name="check").

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
