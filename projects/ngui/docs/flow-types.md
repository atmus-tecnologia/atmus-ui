# flow-types

> Fonte: `projects/ngui/src/lib/components/flow/flow.types.ts`

## Types / interfaces

### AtmFlowPoint

```ts
export interface AtmFlowPoint {
  x: number;
  y: number;
}
```

### AtmFlowHandleType

```ts
export type AtmFlowHandleType = 'source' | 'target';
```

### AtmFlowHandlePosition

```ts
export type AtmFlowHandlePosition = 'top' | 'right' | 'bottom' | 'left';
```

### AtmFlowHandle

```ts
export interface AtmFlowHandle {
  /** Needed when a node has several handles of the same type. */
  id?: string;
  type: AtmFlowHandleType;
  position: AtmFlowHandlePosition;
  /** 0..1 offset along the side (default 0.5 = centered). */
  offset?: number;
  /**
   * Port data type. When both source and target declare one, they must be
   * compatible (equal, or allowed by the flow-level `compatibleTypes` map) —
   * otherwise the connection is silently rejected and `connectInvalid` fires.
   */
  dataType?: string;
}
```

### AtmFlowNode

```ts
export interface AtmFlowNode<T = any> {
  id: string;
  position: AtmFlowPoint;
  /** Text shown by the default node renderer. */
  label?: string;
  /** Matches a custom `<ng-template atmFlowNode="type">`. Empty = default node. */
  type?: string;
  /** Arbitrary payload forwarded to custom node templates. */
  data?: T;
  /** Fixed size. When omitted the node is auto-measured after render. */
  width?: number;
  height?: number;
  /** Accent color (any CSS color or var). Shown as a dot on the default node. */
  color?: string;
  /** Atmus Icons name, without the `atm-` prefix (default node renderer). */
  icon?: string;
  /** Custom handles. Defaults to target-left + source-right (LR) or top/bottom (TB). */
  handles?: AtmFlowHandle[];
  draggable?: boolean;
  connectable?: boolean;
  deletable?: boolean;
  /** Shows a resize grip when the node is selected (groups default to true). */
  resizable?: boolean;
  /**
   * Renders the node as a group: a resizable colored rectangle drawn behind
   * the other nodes. Dragging the group moves every node whose `parentId`
   * points to it. Groups are not connectable unless `connectable: true`.
   */
  group?: boolean;
  /**
   * Id of the group node this node belongs to. Set it directly, via the
   * `createGroup()/addToGroup()` API, or by the user: hold the group
   * modifier (Ctrl by default — see the flow-level `groupModifier` input)
   * while dropping a node inside (or outside) a group. Without the modifier
   * a member can't escape: the group auto-grows to keep containing it.
   */
  parentId?: string;
}
```

### AtmFlowEdgeType

```ts
export type AtmFlowEdgeType = 'bezier' | 'smoothstep' | 'step' | 'straight';
```

### AtmFlowMarker

```ts
export type AtmFlowMarker = 'arrow' | 'arrow-closed' | 'dot' | 'none';
```

### AtmFlowEdge

```ts
export interface AtmFlowEdge<T = any> {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  /** Path style — falls back to the flow-level `defaultEdgeType`. */
  type?: AtmFlowEdgeType;
  /** Marching-ants animation. */
  animated?: boolean;
  dashed?: boolean;
  /** Any CSS color or var. Defaults to the theme line color. */
  color?: string;
  /** Stroke width (default 1.5). */
  width?: number;
  markerStart?: AtmFlowMarker;
  markerEnd?: AtmFlowMarker;
  deletable?: boolean;
  /**
   * Reroute points (waypoints) the edge passes through, in flow coordinates.
   * Double-click on the wire adds one at that spot; drag the dot to move it;
   * Delete (or double-click on the dot) removes the point without deleting
   * the edge itself.
   */
  points?: AtmFlowPoint[];
  data?: T;
}
```

### AtmFlowViewport

```ts
export interface AtmFlowViewport {
  x: number;
  y: number;
  zoom: number;
}
```

### AtmFlowConnection

```ts
export interface AtmFlowConnection {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}
```

### AtmFlowConnectEnd

```ts
export interface AtmFlowConnectEnd {
  /** null when dropped on empty canvas — useful for "add node on edge drop". */
  connection: AtmFlowConnection | null;
  /** Drop position in flow coordinates. */
  position: AtmFlowPoint;
  source: string;
  sourceHandle?: string;
}
```

### AtmFlowJson

```ts
export interface AtmFlowJson {
  nodes: AtmFlowNode[];
  edges: AtmFlowEdge[];
  viewport?: AtmFlowViewport;
}
```

### AtmFlowNodeEvent

```ts
export interface AtmFlowNodeEvent {
  node: AtmFlowNode;
  event: MouseEvent;
}
```

### AtmFlowEdgeEvent

```ts
export interface AtmFlowEdgeEvent {
  edge: AtmFlowEdge;
  event: MouseEvent;
}
```

### AtmFlowContextMenuEvent

```ts
export interface AtmFlowContextMenuEvent {
  node?: AtmFlowNode;
  edge?: AtmFlowEdge;
  /** Position in flow coordinates (handy to add a node there). */
  position: AtmFlowPoint;
  event: MouseEvent;
}
```

### AtmFlowSelection

```ts
export interface AtmFlowSelection {
  nodes: string[];
  edges: string[];
}
```

### AtmFlowNodeDragEvent

```ts
export interface AtmFlowNodeDragEvent {
  node: AtmFlowNode;
  nodes: AtmFlowNode[];
}
```

### AtmFlowReconnectEvent

```ts
export interface AtmFlowReconnectEvent {
  /** The edge after reconnection. */
  edge: AtmFlowEdge;
  /** The previous endpoints. */
  previous: AtmFlowConnection;
  connection: AtmFlowConnection;
}
```

### AtmFlowDeleteEvent

```ts
export interface AtmFlowDeleteEvent {
  nodes: AtmFlowNode[];
  edges: AtmFlowEdge[];
}
```

### AtmFlowGroupChange

```ts
export interface AtmFlowGroupChange {
  node: AtmFlowNode;
  group: AtmFlowNode | null;
}
```

### AtmFlowInvalidReason

```ts
export type AtmFlowInvalidReason = 'type-mismatch' | 'duplicate' | 'cycle' | 'validator' | 'invalid';
```

### AtmFlowConnectInvalid

```ts
export interface AtmFlowConnectInvalid {
  connection: AtmFlowConnection;
  reason: AtmFlowInvalidReason;
  /** dataType of the source/target ports (when declared). */
  sourceType?: string;
  targetType?: string;
}
```

### AtmFlowLayoutDirection

```ts
export type AtmFlowLayoutDirection = 'LR' | 'TB';
```

### AtmFlowValidator

```ts
export type AtmFlowValidator = (
  connection: AtmFlowConnection,
  nodes: AtmFlowNode[],
  edges: AtmFlowEdge[],
) => boolean;
```

