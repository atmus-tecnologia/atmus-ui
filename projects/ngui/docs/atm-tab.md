# atm-tab

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/tabs/tabs.component.ts`

## Purpose

Painel de aba (filho de atm-tabs).

## Notes from source

Single tab. Content is lazy — only the active tab renders.

## Identity

- **Class**: `AtmTab`
- **Selector**: `atm-tab`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `label` | string | no | '' |
| `icon` | string \| undefined | no | undefined |
| `disabled` | boolean | no | false |
| `badge` | string \| number \| undefined | no | undefined |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Content projection

- `default`

## Usage example

```html
<atm-tab value="a" label="Geral">...</atm-tab>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
