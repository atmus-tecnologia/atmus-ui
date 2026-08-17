# atm-input

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/input/input.component.ts`

## Purpose

Campo de texto com CVA (ngModel/FormControl).

## Notes from source

Mask tokens: 9 = digit, a = letter, * = alphanumeric. Anything else is a literal. */
const MASK_TOKENS: Record<string, RegExp> = {
  '9': /[0-9]/,
  a: /[a-zA-Z]/,
  '*': /[a-zA-Z0-9]/,
};

/**Base text input — one component for text/email/password/tel/url/search/currency.Alias selectors: atm-input, atm-text-field.Password type gets a visibility toggle automatically.Mask: `mask="(99) 99999-9999"` — 9 = digit, a = letter, * = alphanumeric,other chars are literals. The form value is always UNMASKED (raw chars only).Multiple masks: separate with `||` (e.g. CPF/CNPJ:`mask="999.999.999-99||99.999.999/9999-99"`) — the active mask is picked bythe typed length.Incomplete mask: while typing the control is invalid with`{ maskIncomplete: { requiredLength, actualLength } }`; on blur the value isCLEARED if it doesn't fully match any mask. Empty value stays valid —combine with Validators.required if needed.Currency: `type="currency"` formats as money while typing (ATM style) and theform value is a plain `number` (e.g. 1234.56). Configure with `currency` + `locale`.

## Identity

- **Class**: `AtmInput`
- **Selector**: `atm-input`
- **Selector aliases**: `atm-input, atm-text-field`
- **Kind**: Component
- **Extends**: `AtmValueAccessor<string | number> implements Validator`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `type` | AtmInputType | no | 'text' |
| `placeholder` | string | no | '' |
| `icon` | string \| undefined | no | undefined |
| `iconRight` | string \| undefined | no | undefined |
| `disabled` | boolean | no | false |
| `readonly` | boolean | no | false |
| `invalid` | boolean | no | false |
| `clearable` | boolean | no | false |
| `maxlength` | number \| undefined | no | undefined |
| `autocomplete` | string \| undefined | no | undefined |
| `inputId` | inferred | no | atmUid('atm-input') |
| `mask` | string \| undefined | no | undefined |
| `currency` | string | no | 'BRL' |
| `locale` | string | no | 'pt-BR' |

## Outputs

| Name | Payload |
| --- | --- |
| `focused` | void |
| `cleared` | void |

## Models (two-way)

_Nenhum._
## Related interfaces / types

### AtmInputType

```ts
export type AtmInputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'currency';
```

## Usage example

```html
<atm-input [(ngModel)]="email" placeholder="E-mail" clearable />
```

## Tips

Suporta clearable, password toggle, ícones. Use size large|medium|slim.

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
