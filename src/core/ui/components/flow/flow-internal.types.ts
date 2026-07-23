/**
 * Atmus Flow — internal view models used by the AtmFlow template.
 * Nothing here is part of the public API (see flow.types.ts for that).
 */
import { TemplateRef } from '@angular/core';
import {
  AtmFlowEdge,
  AtmFlowHandle,
  AtmFlowHandlePosition,
  AtmFlowHandleType,
  AtmFlowMarker,
  AtmFlowNode,
  AtmFlowPoint,
} from './flow.types';

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
}

export interface MarkerDef {
  id: string;
  type: AtmFlowMarker;
  color: string;
}

/** Potential drop target while dragging a connection. */
export interface Candidate {
  nodeId: string;
  handleId: string | undefined;
  key: string;
  anchor: AtmFlowPoint;
  position: AtmFlowHandlePosition;
}

/** Measured info of an <atm-flow-handle> placed inside a custom node. */
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

/**
 * Contract AtmFlow needs from an <atm-flow-handle> instance. Keeps the
 * component → handle dependency one-directional (the handle imports AtmFlow,
 * not the other way around).
 */
export interface FlowHandleRef {
  readonly key: string;
  id(): string | undefined;
  type(): AtmFlowHandleType;
  position(): AtmFlowHandlePosition | undefined;
  dataType(): string | undefined;
}
