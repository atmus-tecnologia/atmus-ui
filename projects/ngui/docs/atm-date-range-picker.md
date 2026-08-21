# atm-date-range-picker

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/datepicker/date-range-picker.component.ts`

## Purpose

Range de datas com presets opcionais.

## Notes from source

Date range picker — input + range calendar popover. Value: { start, end }.
Shows preset recommendations on the side ([presets]="[]" hides them) and a
double-month calendar ([months]="1" for a single one). With [confirm]="true"
the selection is only applied when the user clicks "Confirmar".

## Identity

- **Class**: `AtmDateRangePicker`
- **Selector**: `atm-date-range-picker`
- **Kind**: Component
- **Extends**: `AtmOverlayBase implements ControlValueAccessor`
- **Forms**: Supports `ngModel` / `FormControl` (ControlValueAccessor)

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `placeholder` | string | no | 'Período' |
| `disabled` | boolean | no | false |
| `invalid` | boolean | no | false |
| `presets` | AtmDateRangePreset[] | no | ATM_RANGE_PRESETS |
| `presetsTitle` | string | no | 'Período' |
| `months` | number | no | 2 |
| `confirm` | boolean | no | false |
| `minDate` | Date \| undefined | no | undefined |
| `maxDate` | Date \| undefined | no | undefined |

## Outputs

| Name | Payload |
| --- | --- |
| `rangeChange` | AtmDateRange |

## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-date-range-picker [(ngModel)]="range" [presets]="presets" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
