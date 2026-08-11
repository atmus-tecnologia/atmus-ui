# ng-template[atmFlowNode]

> Doc otimizada para LLMs. Fonte: `src/core/ui/components/flow/flow-node-def.directive.ts`

## Purpose

Declares a custom node renderer inside `<atm-flow>`:```html<atm-flow [(nodes)]="nodes" [(edges)]="edges">  <ng-template atmFlowNode="card" let-node let-selected="selected">    <div class="...">{{ node.data.title }}</div>  </ng-template></atm-flow>```

## Notes from source

Declares a custom node renderer inside `<atm-flow>`:```html<atm-flow [(nodes)]="nodes" [(edges)]="edges">  <ng-template atmFlowNode="card" let-node let-selected="selected">    <div class="...">{{ node.data.title }}</div>  </ng-template></atm-flow>```

## Identity

- **Class**: `AtmFlowNodeDef`
- **Selector**: `ng-template[atmFlowNode]`
- **Kind**: Directive

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `type` | string | yes | alias: 'atmFlowNode' |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Usage example

```html
<ng-template[atmFlowNode] />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
