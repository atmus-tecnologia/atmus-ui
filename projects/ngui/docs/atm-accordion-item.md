# atm-accordion-item

> Doc otimizada para LLMs. Fonte: `src/core/ui/components/accordion/accordion.component.ts`

## Purpose

Item de accordion com header e conteúdo projetado.

## Notes from source

Single collapsible item — use inside atm-accordion or standalone as atm-disclosure.

## Identity

- **Class**: `AtmAccordionItem`
- **Selector**: `atm-accordion-item`
- **Selector aliases**: `atm-accordion-item, atm-disclosure`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `header` | string | no | '' |
| `icon` | string \| undefined | no | undefined |

## Outputs

_Nenhum._
## Models (two-way)

| Name | Type | Default |
| --- | --- | --- |
| `expanded` | inferred | false |

## Content projection

- `default`

## Usage example

```html
<atm-accordion-item header="Detalhes" [(expanded)]="open">...</atm-accordion-item>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
