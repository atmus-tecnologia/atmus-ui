# atm-breadcrumbs

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/breadcrumbs/breadcrumbs.component.ts`

## Purpose

Trilha de navegação.

## Identity

- **Class**: `AtmBreadcrumbs`
- **Selector**: `atm-breadcrumbs`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `items` | AtmBreadcrumb[] | no | [] |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Related interfaces / types

### AtmBreadcrumb

```ts
export interface AtmBreadcrumb {
  label: string;
  link?: string | unknown[];
  icon?: string;
}
```

## Usage example

```html
<atm-breadcrumbs [items]="crumbs" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
