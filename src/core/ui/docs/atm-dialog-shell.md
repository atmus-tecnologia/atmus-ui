# atm-dialog-shell

> Doc otimizada para LLMs. Fonte: `src/core/ui/services/dialog.service.ts`

## Purpose

Shell interno do dialog imperativo.

## Identity

- **Class**: `AtmDialogShell`
- **Selector**: `atm-dialog-shell`
- **Kind**: Component

## Inputs

_Nenhum._
## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Related interfaces / types

### AtmDialogConfig

```ts
export interface AtmDialogConfig<D = unknown> {
  header?: string;
  width?: string;
  /** Arbitrary data available in the child via inject(ATM_DIALOG_DATA). */
  data?: D;
  closable?: boolean;
  /** Shows the expand icon (maximize to 90% of viewport). */
  maximizable?: boolean;
  /** Close when clicking the backdrop. */
  dismissableMask?: boolean;
  baseZIndex?: number;
  contentStyle?: Record<string, string>;
}
```

## Usage example

```html
<!-- uso interno do AtmDialogService -->
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
