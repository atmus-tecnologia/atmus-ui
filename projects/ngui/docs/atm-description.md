# atm-description

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/field/field.components.ts`

## Purpose

Texto de ajuda abaixo do campo.

## Notes from source

Form field label. <atm-label [required]="true">Name</atm-label> */
@Component({
  selector: 'atm-label',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <label [attr.for]="for()" class="mb-1.5 block text-sm font-medium text-ink select-none">
      <ng-content />
      @if (required()) {
        <span class="ml-0.5 text-danger">*</span>
      }
    </label>
  `,
})
export class AtmLabel {
  readonly for = input<string | undefined>(undefined);
  readonly required = input(false);
}

/** Muted helper text below a field.

## Identity

- **Class**: `AtmDescription`
- **Selector**: `atm-description`
- **Kind**: Component

## Inputs

_Nenhum._
## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Content projection

- `default`

## Usage example

```html
<atm-description>Usaremos para contato.</atm-description>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
