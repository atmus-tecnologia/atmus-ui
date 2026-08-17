# atm-input-otp

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/input/input-otp.component.ts`

## Purpose

Input de código OTP (dígitos separados).

## Notes from source

One-time-password input with auto-advance and paste support.

## Identity

- **Class**: `AtmInputOtp`
- **Selector**: `atm-input-otp`
- **Kind**: Component
- **Extends**: `AtmValueAccessor<string>`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `length` | number | no | 6 |
| `disabled` | boolean | no | false |
| `invalid` | boolean | no | false |

## Outputs

| Name | Payload |
| --- | --- |
| `completed` | string |

## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-input-otp [(ngModel)]="code" [length]="6" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
