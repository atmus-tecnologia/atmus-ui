# atm-file-input

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/file-input/file-input.component.ts`

## Purpose

Upload de arquivos com preview, validação e estados.

## Notes from source

Upload lifecycle status for a single file (driven by the host app). */
export type AtmFileStatus = 'ready' | 'uploading' | 'success' | 'error';

/** A file tracked by the input, with preview + upload state. */
export interface AtmFileItem {
  readonly id: string;
  readonly file: File;
  /** Object URL for image previews (null for non-images). */
  readonly previewUrl: string | null;
  status: AtmFileStatus;
  /** Upload progress 0..100. */
  progress: number;
  error?: string;
}

/** Reason a dropped/selected file was rejected. */
export interface AtmFileRejection {
  file: File;
  reason: 'type' | 'size' | 'maxFiles';
  message: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let i = -1;
  do {
    value /= 1024;
    i++;
  } while (value >= 1024 && i < units.length - 1);
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[i]}`;
}

function fileIcon(file: File): string {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  if (type.startsWith('image/')) return 'atm atm-image-02';
  if (type.startsWith('video/')) return 'atm atm-video-01';
  if (type.startsWith('audio/')) return 'atm atm-music-note-01';
  if (type === 'application/pdf' || name.endsWith('.pdf')) return 'atm atm-pdf-01';
  if (/\.(doc|docx)$/.test(name) || type.includes('word')) return 'atm atm-doc-01';
  if (/\.(xls|xlsx|csv)$/.test(name) || type.includes('sheet') || type.includes('excel'))
    return 'atm atm-xls-01';
  if (/\.(ppt|pptx)$/.test(name) || type.includes('presentation'))
    return 'atm atm-ppt-01';
  if (/\.(zip|rar|7z|gz|tar)$/.test(name) || type.includes('zip') || type.includes('compressed'))
    return 'atm atm-zip-01';
  if (/\.(txt|md|log)$/.test(name) || type.startsWith('text/')) return 'atm atm-txt-01';
  return 'atm atm-file-02';
}

const AREA_PAD: Record<AtmSize, string> = { large: 'p-8', medium: 'p-6', slim: 'p-4' };

/**
File input with a drag & drop area, multi-file support, type/size limits,
image thumbnails / file-type icons, per-file upload progress, and optional
cropping: set `[crop]="true"` and every dropped image opens the
{@link AtmImageCropDialog} before being added.
Works with template-driven and reactive forms (value is `File[]`, or a
single `File | null` when `multiple` is false). Use `(rejected)` to react
to files that fail the `accept` / `maxSize` / `maxFiles` rules, and the
public `items` signal + `patchItem()` to drive an upload progress UI.

## Identity

- **Class**: `AtmFileInput`
- **Selector**: `atm-file-input`
- **Kind**: Component
- **Extends**: `AtmValueAccessor<File | File[]>`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `multiple` | boolean | no | false |
| `accept` | string | no | '' |
| `maxSize` | number | no | 0 |
| `maxFiles` | number | no | 0 |
| `disabled` | boolean | no | false |
| `invalid` | boolean | no | false |
| `preview` | boolean | no | true |
| `crop` | boolean | no | false |
| `cropAspect` | number \| null | no | null |
| `cropRound` | boolean | no | false |
| `dropLabel` | string | no | 'Arraste arquivos aqui ou' |
| `browseLabel` | string | no | 'procure' |
| `hint` | string | no | '' |

## Outputs

| Name | Payload |
| --- | --- |
| `filesChange` | File[] |
| `rejected` | AtmFileRejection[] |

## Models (two-way)

_Nenhum._
## Related interfaces / types

### AtmFileStatus

```ts
export type AtmFileStatus = 'ready' | 'uploading' | 'success' | 'error';
```

### AtmFileItem

```ts
export interface AtmFileItem {
  readonly id: string;
  readonly file: File;
  /** Object URL for image previews (null for non-images). */
  readonly previewUrl: string | null;
  status: AtmFileStatus;
  /** Upload progress 0..100. */
  progress: number;
  error?: string;
}
```

### AtmFileRejection

```ts
export interface AtmFileRejection {
  file: File;
  reason: 'type' | 'size' | 'maxFiles';
  message: string;
}
```

## Usage example

```html
<atm-file-input [(ngModel)]="files" accept="image/*" multiple />
```

## Tips

CVA tipicamente File[] / itens. Aceita accept, multiple, maxSize.

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
