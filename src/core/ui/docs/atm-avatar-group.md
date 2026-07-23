# atm-avatar-group

> Doc otimizada para LLMs. Fonte: `src/core/ui/components/avatar/avatar-group.component.ts`

## Purpose

Grupo de avatars com overflow (+N).

## Notes from source

Negative margin (overlap) per size. */
const OVERLAP: Record<AtmSize, string> = {
  large: '-ml-3',
  medium: '-ml-2.5',
  slim: '-ml-2',
};

const SIZE: Record<AtmSize, string> = {
  large: 'size-12 text-base',
  medium: 'size-10 text-sm',
  slim: 'size-8 text-xs',
};

/** Resolves a (possibly nested) key path like "user.name" from an object. */
function resolvePath(obj: unknown, path: string): unknown {
  if (obj == null || !path) return undefined;
  return path.split('.').reduce<unknown>((acc, key) => {
    return acc == null ? undefined : (acc as Record<string, unknown>)[key];
  }, obj);
}

/**Stacked/overlapping avatars for a list of items, with a configurablevisible limit and a "+N" overflow bubble.Each item is a plain object; use `srcKey` / `nameKey` to point at itsimage and label. When `tooltipKey` is set, hovering an avatar shows thevalue at that key path (e.g. "name" or "user.name").

## Identity

- **Class**: `AtmAvatarGroup`
- **Selector**: `atm-avatar-group`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `items` | readonly unknown[] | no | [] |
| `max` | number | no | 4 |
| `size` | AtmSize | no | 'medium' |
| `square` | boolean | no | false |
| `srcKey` | string | no | 'src' |
| `nameKey` | string | no | 'name' |
| `tooltipKey` | string | no | '' |
| `tooltipPlacement` | 'top' \| 'bottom' \| 'left' \| 'right' | no | 'top' |

## Outputs

| Name | Payload |
| --- | --- |
| `itemClick` | number |

## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-avatar-group [max]="3">...</atm-avatar-group>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
