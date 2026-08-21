# atm-qrcode

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/qrcode/qrcode.component.ts`

## Purpose

Gera QR Code a partir de texto/URL.

## Notes from source

Visual style of the data modules. */
export type AtmQrcodeDotStyle = 'square' | 'rounded' | 'dots';

/**QR code generator rendered on canvas — encoder embutido, sem dependências.Suporta tamanho em px, cores customizadas, estilo dos pontos (quadrado,arredondado ou bolinhas), logo central com fundo/padding e uma molduradecorativa nos 4 cantos (ativável via `frame`).  <atm-qrcode value="https://atmus.dev" />  <atm-qrcode value="..." [size]="240" color="#7c3aed" [frame]="true" logo="/logo.png" />

## Identity

- **Class**: `AtmQrcode`
- **Selector**: `atm-qrcode`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `value` | string | yes | — |
| `size` | number | no | 200 |
| `color` | string \| null | no | null |
| `background` | string \| null | no | null |
| `errorCorrection` | AtmQrErrorCorrection | no | 'M' |
| `dotStyle` | AtmQrcodeDotStyle | no | 'square' |
| `quietZone` | number | no | 2 |
| `logo` | string \| null | no | null |
| `logoSize` | number | no | 0.22 |
| `logoPadding` | number | no | 6 |
| `logoBackground` | string \| null | no | null |
| `frame` | boolean | no | false |
| `frameColor` | string \| null | no | null |
| `ariaLabel` | string \| null | no | null |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Related interfaces / types

### AtmQrcodeDotStyle

```ts
export type AtmQrcodeDotStyle = 'square' | 'rounded' | 'dots';
```

## Usage example

```html
<atm-qrcode value="https://atmus.com" [size]="160" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
