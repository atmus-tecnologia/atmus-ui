# atm-toggle-button-group

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/toggle/toggle-button.component.ts`

## Purpose

Grupo de toggle (single/multi).

## Notes from source

Pressed/unpressed button. Standalone or inside atm-toggle-button-group. */
@Component({
  selector: 'atm-toggle-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <button
      type="button"
      [class]="classes()"
      [attr.aria-pressed]="pressed()"
      [disabled]="disabled()"
      (click)="toggle()"
    >
      @if (icon()) {
        <i [class]="'icofont-' + icon()" aria-hidden="true"></i>
      }
      <ng-content />
    </button>
  `,
})
export class AtmToggleButton {
  readonly size = input<AtmSize>('medium');
  readonly icon = input<string | undefined>(undefined);
  readonly disabled = input(false);
  readonly pressed = model(false);

  readonly changed = output<boolean>();

  readonly classes = computed(
    () =>
      `atm-focus inline-flex cursor-pointer items-center justify-center rounded-atm font-medium ` +
      `transition-all duration-200 select-none active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 ` +
      `${SIZE[this.size()]} ` +
      (this.pressed()
        ? 'bg-primary-soft text-primary inset-ring inset-ring-primary/30'
        : 'border border-line text-ink-muted hover:bg-surface-alt hover:text-ink'),
  );

  toggle(): void {
    this.pressed.set(!this.pressed());
    this.changed.emit(this.pressed());
  }
}

/**Exclusive (or multiple) toggle group bound to a form value:  <atm-toggle-button-group [options]="[{label, value, icon?}]" [(ngModel)]="v" />

## Identity

- **Class**: `AtmToggleButtonGroup`
- **Selector**: `atm-toggle-button-group`
- **Kind**: Component
- **Extends**: `AtmValueAccessor<unknown>`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `disabled` | boolean | no | false |
| `multiple` | boolean | no | false |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-toggle-button-group [(value)]="align">...</atm-toggle-button-group>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
