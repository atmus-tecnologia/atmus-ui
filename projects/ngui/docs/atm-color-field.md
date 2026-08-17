# atm-color-field

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/color/color.components.ts`

## Purpose

Campo de cor com picker.

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

/** Grid of selectable swatches. Value = hex string. */
@Component({
  selector: 'atm-color-swatch-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmColorSwatchPicker), multi: true },
  ],
  template: `
    <div class="flex flex-wrap gap-2" role="radiogroup">
      @for (color of colors(); track color) {
        <button
          type="button"
          class="atm-focus size-7 cursor-pointer rounded-lg border border-black/10 shadow-sm
            transition-transform duration-100 hover:scale-110 active:scale-95"
          [class.ring-2]="value() === color"
          [class.ring-primary]="value() === color"
          [class.ring-offset-2]="value() === color"
          [class.ring-offset-surface]="value() === color"
          [style.background]="color"
          role="radio"
          [attr.aria-checked]="value() === color"
          [attr.aria-label]="color"
          (click)="pick(color)"
        ></button>
      }
    </div>
  `,
})
export class AtmColorSwatchPicker extends AtmValueAccessor<string> {
  readonly colors = input<string[]>(DEFAULT_PRESETS);

  readonly picked = output<string>();

  pick(color: string): void {
    this.setValue(color);
    this.picked.emit(color);
    this.onTouched();
  }
}

/**Hex field + custom popup picker (alias atm-color-picker): presetrecommendations, saturation/value area and hue slider — no native input.

## Identity

- **Class**: `AtmColorField`
- **Selector**: `atm-color-field`
- **Selector aliases**: `atm-color-field, atm-color-picker`
- **Kind**: Component
- **Extends**: `AtmOverlayBase implements ControlValueAccessor`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `disabled` | boolean | no | false |
| `invalid` | boolean | no | false |
| `presets` | string[] | no | DEFAULT_PRESETS |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-color-field [(ngModel)]="color" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
