# atm-signature

> Doc otimizada para LLMs. Fonte: `src/core/ui/components/signature/signature.component.ts`

## Purpose

Canvas de assinatura manuscrita.

## Notes from source

Signature capture mode. */
export type AtmSignatureMode = 'draw' | 'type';

const BOX_H: Record<AtmSize, string> = { large: 'h-44', medium: 'h-36', slim: 'h-28' };
const TYPED_TEXT: Record<AtmSize, string> = { large: 'text-4xl', medium: 'text-3xl', slim: 'text-2xl' };
const SCRIPT_FONT = `'Segoe Script', 'Bradley Hand', 'Brush Script MT', cursive`;

/**Signature pad integrated with Angular forms (ngModel / formControl).The form value is a transparent PNG data URL (or `null` when empty).Two capture modes: free-hand drawing on canvas (with stroke smoothing andretina-aware rendering) and typed signature rendered in a script font.Switching modes clears the current signature.  <atm-signature [(ngModel)]="signature" />  <atm-signature formControlName="signature" [invalid]="isInvalid('signature')" />

## Identity

- **Class**: `AtmSignature`
- **Selector**: `atm-signature`
- **Kind**: Component
- **Extends**: `AtmValueAccessor<string>`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `disabled` | boolean | no | false |
| `invalid` | boolean | no | false |
| `placeholder` | string | no | 'Assine aqui' |
| `typedPlaceholder` | string | no | 'Digite sua assinatura' |
| `allowTyped` | boolean | no | true |
| `penColor` | string \| null | no | null |
| `penWidth` | number | no | 2.2 |

## Outputs

| Name | Payload |
| --- | --- |
| `changed` | string \| null |

## Models (two-way)

_Nenhum._
## Related interfaces / types

### AtmSignatureMode

```ts
export type AtmSignatureMode = 'draw' | 'type';
```

## Usage example

```html
<atm-signature [(ngModel)]="sigDataUrl" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
