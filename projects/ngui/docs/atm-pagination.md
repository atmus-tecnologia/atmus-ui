# atm-pagination

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/pagination/pagination.component.ts`

## Purpose

Paginação controlada.

## Identity

- **Class**: `AtmPagination`
- **Selector**: `atm-pagination`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `totalItems` | number | no | 0 |
| `pageSize` | number | no | 10 |
| `maxButtons` | number | no | 7 |

## Outputs

| Name | Payload |
| --- | --- |
| `pageChange` | number |

## Models (two-way)

| Name | Type | Default |
| --- | --- | --- |
| `page` | inferred | 1 |

## Usage example

```html
<atm-pagination [page]="page" [totalItems]="total" [pageSize]="10" (pageChange)="load($event)" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
