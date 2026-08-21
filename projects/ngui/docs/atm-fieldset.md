# atm-fieldset

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/field/field.components.ts`

## Purpose

Agrupa campos com legenda.

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

/** Muted helper text below a field. */
@Component({
  selector: 'atm-description',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'mt-1.5 block text-xs text-ink-muted' },
  template: `<ng-content />`,
})
export class AtmDescription {}

/** Error message below a field (alias: atm-field-error). */
@Component({
  selector: 'atm-error-message, atm-field-error',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'mt-1.5 flex items-center gap-1 text-xs font-medium text-danger animate-atm-fade',
    role: 'alert',
  },
  template: `<i class="atm atm-alert-circle" aria-hidden="true"></i><ng-content />`,
})
export class AtmErrorMessage {}

/** Groups related fields with an optional legend.

## Identity

- **Class**: `AtmFieldset`
- **Selector**: `atm-fieldset`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `legend` | string \| undefined | no | undefined |
| `disabled` | boolean | no | false |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Content projection

- `default`

## Usage example

```html
<atm-fieldset legend="Endereço">...</atm-fieldset>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
