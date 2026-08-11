# atm-input-group

> Doc otimizada para LLMs. Fonte: `src/core/ui/components/input/input-group.component.ts`

## Purpose

Campo com prefix/suffix (texto ou projeção atmPrefix/atmSuffix).

## Notes from source

Input with prefix/suffix addons.<atm-input-group prefix="https://" suffix=".com"><atm-input /></atm-input-group>Addons can also be projected: <span atmPrefix>R$</span> / <span atmSuffix>kg</span>.

## Identity

- **Class**: `AtmInputGroup`
- **Selector**: `atm-input-group`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `prefix` | string \| undefined | no | undefined |
| `suffix` | string \| undefined | no | undefined |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Content projection

- `[atmPrefix]`
- `[atmSuffix]`

## Usage example

```html
<atm-input-group prefix="R$">
  <atm-input [(ngModel)]="valor" />
</atm-input-group>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
