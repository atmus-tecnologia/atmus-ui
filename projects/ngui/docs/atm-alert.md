# atm-alert

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/alert/alert.component.ts`

## Purpose

Alerta inline dismissible com cor e ação.

## Identity

- **Class**: `AtmAlert`
- **Selector**: `atm-alert`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `color` | AtmColor | no | 'info' |
| `title` | string \| undefined | no | undefined |
| `icon` | string \| undefined | no | undefined |
| `dismissible` | boolean | no | false |
| `actionLabel` | string \| undefined | no | undefined |
| `loading` | boolean | no | false |

## Outputs

| Name | Payload |
| --- | --- |
| `dismissed` | void |
| `action` | void |

## Models (two-way)

_Nenhum._
## Content projection

- `default`

## Usage example

```html
<atm-alert color="warning" title="Atenção" dismissible>Msg</atm-alert>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
