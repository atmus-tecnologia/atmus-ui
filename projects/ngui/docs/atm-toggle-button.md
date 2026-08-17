# atm-toggle-button

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/toggle/toggle-button.component.ts`

## Purpose

Botão toggle (pressionado/não).

## Notes from source

Pressed/unpressed button. Standalone or inside atm-toggle-button-group.

## Identity

- **Class**: `AtmToggleButton`
- **Selector**: `atm-toggle-button`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `icon` | string \| undefined | no | undefined |
| `disabled` | boolean | no | false |

## Outputs

| Name | Payload |
| --- | --- |
| `changed` | boolean |

## Models (two-way)

| Name | Type | Default |
| --- | --- | --- |
| `pressed` | inferred | false |

## Content projection

- `default`

## Usage example

```html
<atm-toggle-button [(pressed)]="on">Bold</atm-toggle-button>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
