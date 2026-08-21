# atm-meter

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/meter/meter.component.ts`

## Purpose

Medidor com faixas (meter).

## Notes from source

Meter — like progress but color reflects thresholds (good/warn/critical).

## Identity

- **Class**: `AtmMeter`
- **Selector**: `atm-meter`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `value` | number | no | 0 |
| `max` | number | no | 100 |
| `label` | string | no | '' |
| `warnAt` | number | no | 70 |
| `dangerAt` | number | no | 90 |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-meter [value]="80" [max]="100" label="Uso" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
