# atm-color-swatch-picker

> Doc otimizada para LLMs. Fonte: `src/core/ui/components/color/color.components.ts`

## Purpose

Grade de swatches selecionáveis.

## Notes from source

Static color square with checkerboard for transparency. */
@Component({
  selector: 'atm-color-swatch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <span
      [class]="sizeClass()"
      class="inline-block rounded-md border border-line shadow-sm"
      [style.background]="color()"
      [attr.title]="color()"
    ></span>
  `,
})
export class AtmColorSwatch {
  readonly color = input('#000000');
  readonly size = input<AtmSize>('medium');
  readonly sizeClass = computed(
    () => ({ large: 'size-8', medium: 'size-6', slim: 'size-4' })[this.size()],
  );
}

/** Grid of selectable swatches. Value = hex string.

## Identity

- **Class**: `AtmColorSwatchPicker`
- **Selector**: `atm-color-swatch-picker`
- **Kind**: Component
- **Extends**: `AtmValueAccessor<string>`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `colors` | string[] | no | DEFAULT_PRESETS |

## Outputs

| Name | Payload |
| --- | --- |
| `picked` | string |

## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-color-swatch-picker [(ngModel)]="c" [colors]="palette" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
