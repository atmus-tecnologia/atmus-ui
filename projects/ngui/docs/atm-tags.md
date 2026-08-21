# atm-tags

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/tags/tags.component.ts`

## Purpose

Input de tags com criação, grupos e action button.

## Notes from source

Option for atm-tags — same shape as select options + optional group header. */
export interface AtmTagsOption<T = unknown> extends AtmSelectOption<T> {
  /** Optional group header shown in the suggestions panel. */
  group?: string;
}

const MIN_HEIGHT: Record<AtmSize, string> = {
  large: 'min-h-12',
  medium: 'min-h-10',
  slim: 'min-h-8',
};

/**
Tags input with suggestions panel (multi-select).
The form value is `T[]` — option values can be any object coming from the
backend; use `compareWith` to match by id and `displayWith` to render
labels for values that are not in the options list.
With `allowCustom`, free text becomes a tag via `createTag` (string by default).

## Identity

- **Class**: `AtmTags`
- **Selector**: `atm-tags`
- **Kind**: Component
- **Extends**: `AtmOverlayBase implements ControlValueAccessor`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `options` | AtmTagsOption[] | no | [] |
| `placeholder` | string | no | 'Digite para pesquisar...' |
| `disabled` | boolean | no | false |
| `invalid` | boolean | no | false |
| `allowCustom` | boolean | no | false |
| `createTag` | (label: string) => unknown | no | label: string) => unknown>((label) => label |
| `maxTags` | number \| undefined | no | undefined |
| `compareWith` | (a: unknown, b: unknown) => boolean | no | a: unknown, b: unknown) => boolean>((a, b) => a === b |
| `displayWith` | ((value: unknown) => string) \| undefined | no | (value: unknown) => string) \| undefined>(undefined |
| `hasActionButton` | boolean | no | false |
| `actionButtonLabel` | string | no | 'Adicionar novo' |

## Outputs

| Name | Payload |
| --- | --- |
| `actionClick` | void |
| `selectionChange` | unknown[] |

## Models (two-way)

_Nenhum._
## Related interfaces / types

### AtmTagsOption

```ts
export interface AtmTagsOption<T = unknown> extends AtmSelectOption<T> {
  /** Optional group header shown in the suggestions panel. */
  group?: string;
}
```

## Usage example

```html
<atm-tags [(ngModel)]="tags" [options]="suggestions" creatable />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
