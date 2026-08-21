# atm-label

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/field/field.components.ts`

## Purpose

Label de campo de formulário.

## Notes from source

Form field label. <atm-label [required]="true">Name</atm-label>

## Identity

- **Class**: `AtmLabel`
- **Selector**: `atm-label`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `for` | string \| undefined | no | undefined |
| `required` | boolean | no | false |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Content projection

- `default`

## Usage example

```html
<atm-label for="email">E-mail</atm-label>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
