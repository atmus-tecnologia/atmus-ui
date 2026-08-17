# atm-date-picker

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/datepicker/date-picker.component.ts`

## Purpose

Date picker overlay com CVA Date/string.

## Notes from source

Parses a complete 'dd/mm/yyyy' string into a Date; returns null when invalid. */
export function atmParseDate(text: string): Date | null {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  if (!match) return null;
  const [, dd, mm, yyyy] = match;
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  const date = new Date(year, month - 1, day);
  const valid =
    date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
  return valid ? date : null;
}

/**Date picker (alias atm-date-field): input + calendar popover, dd/mm/yyyy.Flips above when there is no viewport space below.With `[editable]="true"` the field becomes a typeable input with add/mm/yyyy mask and the calendar opens only via the icon button.`[presets]` shows recommendation shortcuts beside the calendar and`[confirm]="true"` only applies the change after clicking "Confirmar".

## Identity

- **Class**: `AtmDatePicker`
- **Selector**: `atm-date-picker`
- **Selector aliases**: `atm-date-picker, atm-date-field`
- **Kind**: Component
- **Extends**: `AtmOverlayBase implements ControlValueAccessor`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `placeholder` | string | no | 'dd/mm/aaaa' |
| `disabled` | boolean | no | false |
| `invalid` | boolean | no | false |
| `clearable` | boolean | no | true |
| `editable` | boolean | no | false |
| `presets` | AtmDatePreset[] | no | [] |
| `presetsTitle` | string | no | 'Atalhos' |
| `confirm` | boolean | no | false |
| `minDate` | Date \| undefined | no | undefined |
| `maxDate` | Date \| undefined | no | undefined |

## Outputs

| Name | Payload |
| --- | --- |
| `dateChange` | Date \| null |

## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-date-picker [(ngModel)]="date" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
