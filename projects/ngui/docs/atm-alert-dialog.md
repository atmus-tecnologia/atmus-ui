# atm-alert-dialog

> Doc otimizada para LLMs. Fonte: `src/core/ui/services/alert-dialog.service.ts`

## Purpose

Componente interno do alert dialog.

## Identity

- **Class**: `AtmAlertDialog`
- **Selector**: `atm-alert-dialog`
- **Kind**: Component

## Inputs

_Nenhum._
## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Related interfaces / types

### AtmAlertDialogOptions

```ts
export interface AtmAlertDialogOptions {
  title: string;
  message: string;
  icon?: string;
  color?: AtmColor;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Hide the cancel button (simple "OK" alert). */
  hideCancel?: boolean;
}
```

## Usage example

```html
<!-- uso interno do AtmAlertDialogService -->
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
