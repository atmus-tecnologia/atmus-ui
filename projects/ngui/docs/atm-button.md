# atm-button

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/button/button.component.ts`

## Purpose

Botão com variantes, cores e tamanhos do design system.

## Identity

- **Class**: `AtmButton`
- **Selector**: `atm-button`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `color` | AtmColor | no | 'primary' |
| `variant` | AtmVariant | no | 'solid' |
| `type` | 'button' \| 'submit' \| 'reset' | no | 'button' |
| `icon` | string \| undefined | no | undefined |
| `iconRight` | string \| undefined | no | undefined |
| `loading` | boolean | no | false |
| `disabled` | boolean | no | false |
| `block` | boolean | no | false |
| `rounded` | boolean | no | false |
| `iconOnly` | boolean | no | false |

## Outputs

| Name | Payload |
| --- | --- |
| `clicked` | MouseEvent |

## Models (two-way)

_Nenhum._
## Content projection

- `default`

## Usage example

```html
<atm-button color="primary" variant="solid" (click)="save()">Salvar</atm-button>
```

## Tips

Prefira color/variant de token. loading desabilita o clique.

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
