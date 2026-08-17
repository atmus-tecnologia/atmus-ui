# atm-flow-handle

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/flow/flow-handle.component.ts`

## Purpose

Handle de conexão de node no flow.

## Notes from source

Connection port to be placed **inside a custom node template** — theequivalent of Foundation Flow's `fNodeInput`/`fNodeOutput`. Position itfreely with utility classes; edges anchor to its real rendered position.```html<atm-flow [(nodes)]="nodes" [(edges)]="edges">  <ng-template atmFlowNode="send-message" let-node let-selected="selected">    <node-send-message [nodeId]="node.id" [nodeData]="node.data" [selected]="selected" />  </ng-template></atm-flow><!-- dentro do template de node-send-message: --><div class="relative ...">  ...  <atm-flow-handle type="target" position="left" class="top-1/2 -left-[5px] -translate-y-1/2" />  <atm-flow-handle type="source" id="sent" position="right" class="-right-[5px] bottom-3" /></div>```Use `handles: []` no node para remover os handles default das bordas.

## Identity

- **Class**: `AtmFlowNodeHandle`
- **Selector**: `atm-flow-handle`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `type` | AtmFlowHandleType | no | 'source' |
| `id` | string \| undefined | no | undefined |
| `position` | AtmFlowHandlePosition \| undefined | no | undefined |
| `dataType` | string \| undefined | no | undefined |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Usage example

```html
<atm-flow-handle type="target" position="left" />
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
