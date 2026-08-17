# atm-flow

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/flow/flow.component.ts`

## Purpose

Editor de fluxos/nodes com edges, zoom e history.

## Notes from source

Node-based flow editor (React Flow style): pan/zoom canvas, draggablenodes, drag-to-connect handles, custom node templates, edge types(bezier/smoothstep/step/straight) with labels & markers, groups (coloredresizable containers that drag their children along), minimap, controls,dotted background, box selection, snap-to-grid, helper lines, auto layout,undo/redo, copy/paste and JSON import/export.Viewport culling keeps it fast with thousands of nodes.

## Identity

- **Class**: `AtmFlow`
- **Selector**: `atm-flow`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `height` | number \| null | no | 520 |
| `background` | 'dots' \| 'lines' \| 'none' | no | 'dots' |
| `gridSize` | number | no | 20 |
| `snapToGrid` | boolean | no | false |
| `helperLines` | boolean | no | true |
| `minimap` | boolean | no | true |
| `controls` | boolean | no | true |
| `minZoom` | number | no | 0.1 |
| `maxZoom` | number | no | 2.5 |
| `defaultEdgeType` | AtmFlowEdgeType | no | 'bezier' |
| `defaultMarkerEnd` | AtmFlowMarker | no | 'arrow-closed' |
| `direction` | AtmFlowLayoutDirection | no | 'LR' |
| `autoConnect` | boolean | no | true |
| `reconnectable` | boolean | no | true |
| `reconnectSource` | boolean | no | false |
| `preventCycles` | boolean | no | false |
| `connectionValidator` | AtmFlowValidator \| null | no | null |
| `compatibleTypes` | Record<string, string[]> \| null | no | null |
| `cullingThreshold` | number | no | 250 |
| `autoFit` | boolean | no | true |
| `groupModifier` | 'ctrl' \| 'alt' \| 'shift' | no | 'ctrl' |

## Outputs

| Name | Payload |
| --- | --- |
| `nodeClick` | AtmFlowNodeEvent |
| `nodeDoubleClick` | AtmFlowNodeEvent |
| `nodeDragStart` | AtmFlowNodeDragEvent |
| `nodeDragStop` | AtmFlowNodeDragEvent |
| `edgeClick` | AtmFlowEdgeEvent |
| `edgeDoubleClick` | AtmFlowEdgeEvent |
| `edgeReconnect` | AtmFlowReconnectEvent |
| `paneClick` | AtmFlowPoint |
| `connect` | AtmFlowConnection |
| `connectEnd` | AtmFlowConnectEnd |
| `connectInvalid` | AtmFlowConnectInvalid |
| `selectionChange` | AtmFlowSelection |
| `viewportChange` | AtmFlowViewport |
| `contextMenu` | AtmFlowContextMenuEvent |
| `deleted` | AtmFlowDeleteEvent |
| `groupChange` | AtmFlowGroupChange |

## Models (two-way)

| Name | Type | Default |
| --- | --- | --- |
| `nodes` | AtmFlowNode[] | [] |
| `edges` | AtmFlowEdge[] | [] |
| `locked` | inferred | false |

## Usage example

```html
<atm-flow [(nodes)]="nodes" [(edges)]="edges">
  <ng-template atmFlowNode="task" let-node>
    <div>{{ node.data.label }}</div>
    <atm-flow-handle type="source" />
  </ng-template>
</atm-flow>
```

## Tips

Defina templates de node com ng-template atmFlowNode. Handles via atm-flow-handle.

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
