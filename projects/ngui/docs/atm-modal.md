# atm-modal

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/modal/modal.component.ts`

## Purpose

Modal declarativo com open, título, expand e slots.

## Notes from source

Declarative modal:
  <atm-modal [(open)]="showModal" header="Title" [expandable]="true">
    content...
    <div footer>buttons...</div>
  </atm-modal>
The expand icon (next to close) maximizes to 90% of the viewport,
keeping a margin so it never touches the screen edges.

## Identity

- **Class**: `AtmModal`
- **Selector**: `atm-modal`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `header` | string | no | '' |
| `width` | string | no | '32rem' |
| `closable` | boolean | no | true |
| `expandable` | boolean | no | true |
| `dismissable` | boolean | no | true |

## Outputs

| Name | Payload |
| --- | --- |
| `closed` | void |

## Models (two-way)

| Name | Type | Default |
| --- | --- | --- |
| `open` | inferred | false |

## Content projection

- `[footer]`

## Usage example

```html
<atm-modal [(open)]="show" header="Detalhes">Conteúdo</atm-modal>
```

## Tips

Para abrir componente dinamicamente use AtmDialogService.

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
