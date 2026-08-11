# atm-image-crop

> Doc otimizada para LLMs. Fonte: `src/core/ui/components/image-crop/image-crop.component.ts`

## Purpose

Recorte de imagem interativo.

## Notes from source

Accepted image source: a URL/dataURL string or a Blob/File. */
export type AtmImageCropSource = string | Blob | File;

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

/**Interactive image cropper. Shows the image (contain-fit) with a movable /resizable crop box, dimmed surroundings, thirds grid and optional circularmask + fixed aspect ratio. Export the selected region as a Blob/File at theimage's native resolution via `toBlob()` / `toFile()`.  <atm-image-crop [src]="file" [aspect]="1" [round]="true" #cropper />  const file = await cropper.toFile('avatar.png');

## Identity

- **Class**: `AtmImageCrop`
- **Selector**: `atm-image-crop`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `src` | AtmImageCropSource \| null | no | null |
| `aspect` | number \| null | no | null |
| `round` | boolean | no | false |
| `height` | number | no | 340 |
| `outputType` | string | no | 'image/png' |
| `outputQuality` | number | no | 0.92 |
| `minSize` | number | no | 32 |

## Outputs

| Name | Payload |
| --- | --- |
| `changed` | void |

## Models (two-way)

_Nenhum._
## Related interfaces / types

### AtmImageCropSource

```ts
export type AtmImageCropSource = string | Blob | File;
```

### AtmImageCropDialogData

```ts
export interface AtmImageCropDialogData {
  src: AtmImageCropSource;
  fileName?: string;
  aspect?: number | null;
  round?: boolean;
  outputType?: string;
}
```

## Usage example

```html
<atm-image-crop [src]="url" (cropped)="onCrop($event)" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
