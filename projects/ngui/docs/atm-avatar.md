# atm-avatar

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/avatar/avatar.component.ts`

## Purpose

Avatar com imagem, iniciais ou ícone.

## Notes from source

Avatar with image, or initials derived from `name` (deterministic color).

## Identity

- **Class**: `AtmAvatar`
- **Selector**: `atm-avatar`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `src` | string \| undefined | no | undefined |
| `name` | string | no | '' |
| `square` | boolean | no | false |
| `status` | 'online' \| 'offline' \| 'busy' \| 'away' \| undefined | no | undefined |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-avatar src="/a.jpg" name="Ana" size="medium" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
