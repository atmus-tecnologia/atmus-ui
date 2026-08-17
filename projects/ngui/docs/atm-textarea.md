# atm-textarea

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/input/textarea.component.ts`

## Purpose

Área de texto multilinha com CVA.

## Identity

- **Class**: `AtmTextarea`
- **Selector**: `atm-textarea`
- **Kind**: Component
- **Extends**: `AtmValueAccessor<string>`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `placeholder` | string | no | '' |
| `rows` | number | no | 3 |
| `disabled` | boolean | no | false |
| `readonly` | boolean | no | false |
| `invalid` | boolean | no | false |
| `resizable` | boolean | no | true |
| `maxlength` | number \| undefined | no | undefined |
| `showCounter` | boolean | no | true |
| `inputId` | inferred | no | atmUid('atm-textarea') |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-textarea [(ngModel)]="bio" rows="4" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
