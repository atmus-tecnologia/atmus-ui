# flow-internal-types

> Fonte: `projects/ngui/src/lib/components/flow/flow-internal.types.ts`

## Types / interfaces

### HandleView

```ts
export interface HandleView {
  key: string;
  id: string | undefined;
  type: AtmFlowHandleType;
  handle: AtmFlowHandle;
  left: string | null;
  top: string | null;
  right: string | null;
  bottom: string | null;
}
```

### NodeView

```ts
export interface NodeView {
  node: AtmFlowNode;
  x: number;
  y: number;
  /** Explicit style width/height (groups always get one). */
  w: number | null;
  h: number | null;
  z: number;
  selected: boolean;
  template: TemplateRef<unknown> | null;
  handles: HandleView[];
  isGroup: boolean;
  /** Pre-computed group colors (null on regular nodes). */
  groupBg: string | null;
  groupBgActive: string | null;
  groupBorder: string | null;
  groupAccent: string | null;
}
```

### EdgeView

```ts
export interface EdgeView {
  edge: AtmFlowEdge;
  d: string;
  color: string;
  width: number;
  selected: boolean;
  animated: boolean;
  dashed: boolean;
  dimmed: boolean;
  labelX: number;
  labelY: number;
  markerStart: string | null;
  markerEnd: string | null;
  /** Reconnect grip positions (slightly outside each anchor, on the wire). */
  sx: number;
  sy: number;
  tx: number;
  ty: number;
  /**
   * Draw a visible grip dot at that end. Ends with a marker skip it — the
   * marker itself (already tinted when selected) acts as the grip.
   */
  sGripDot: boolean;
  tGripDot: boolean;
  /** Reroute points (edge.points) already rounded for rendering. */
  waypoints: AtmFlowPoint[];
}
```

### MarkerDef

```ts
export interface MarkerDef {
  id: string;
  type: AtmFlowMarker;
  color: string;
}
```

### Candidate

```ts
export interface Candidate {
  nodeId: string;
  handleId: string | undefined;
  key: string;
  anchor: AtmFlowPoint;
  position: AtmFlowHandlePosition;
}
```

### CustomHandleInfo

```ts
export interface CustomHandleInfo {
  key: string;
  id: string | undefined;
  type: AtmFlowHandleType;
  position: AtmFlowHandlePosition;
  dataType: string | undefined;
  /** Center offset relative to the node's top-left corner (flow units). */
  x: number;
  y: number;
}
```

### FlowHandleRef

```ts
export interface FlowHandleRef {
  readonly key: string;
  id(): string | undefined;
  type(): AtmFlowHandleType;
  position(): AtmFlowHandlePosition | undefined;
  dataType(): string | undefined;
}
```

