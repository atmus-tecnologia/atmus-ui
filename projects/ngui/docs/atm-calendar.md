# atm-calendar

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/calendar/calendar.component.ts`

## Purpose

Calendário de seleção de data (single/range).

## Notes from source

Month calendar. Single mode: [(value)]. Range mode: [range]=true + [(rangeValue)].
`[months]="2"` renders consecutive months side by side (double calendar).
`[flat]="true"` removes the border/background so it can live inside a panel.

## Identity

- **Class**: `AtmCalendar`
- **Selector**: `atm-calendar`
- **Selector aliases**: `atm-calendar, atm-range-calendar`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `range` | boolean | no | false |
| `minDate` | Date \| undefined | no | undefined |
| `maxDate` | Date \| undefined | no | undefined |
| `months` | number | no | 1 |
| `flat` | boolean | no | false |

## Outputs

| Name | Payload |
| --- | --- |
| `picked` | Date |

## Models (two-way)

| Name | Type | Default |
| --- | --- | --- |
| `value` | Date \| null | null |

## Related interfaces / types

### AtmCalendarDay

```ts
export interface AtmCalendarDay {
  date: Date;
  inMonth: boolean;
  isToday: boolean;
}
```

## Usage example

```html
<atm-calendar [(value)]="date" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
