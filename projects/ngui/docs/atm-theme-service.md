# AtmThemeService

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/services/theme.service.ts`

## Purpose

Tema light/dark/system com persistência.

## Identity

- **Class**: `AtmThemeService`
- **Selector**: `AtmThemeService`
- **Kind**: Service

## Inputs

_Nenhum._
## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Public methods

| Method | Params |
| --- | --- |
| `effect` | ( |
| `effect` | ( |
| `toggle` |  |
| `set` | mode: 'light' \| 'dark' \| 'system' |

## Usage example

```html
inject(AtmThemeService).setTheme('dark');
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
