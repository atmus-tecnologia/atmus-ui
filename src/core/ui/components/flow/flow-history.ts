/**
 * Atmus Flow — undo/redo stack. Plain class (one instance per AtmFlow),
 * snapshots are deep-cloned by the caller via cloneState().
 */
import { AtmFlowEdge, AtmFlowNode } from './flow.types';

export interface FlowState {
  nodes: AtmFlowNode[];
  edges: AtmFlowEdge[];
}

export class FlowHistory {
  private past: FlowState[] = [];
  private future: FlowState[] = [];

  constructor(private readonly limit = 60) {}

  /** Records `state` as an undo point and clears the redo stack. */
  push(state: FlowState): void {
    this.past.push(state);
    if (this.past.length > this.limit) this.past.shift();
    this.future = [];
  }

  /** @returns the state to restore, or null when there is nothing to undo. */
  undo(current: FlowState): FlowState | null {
    const prev = this.past.pop();
    if (!prev) return null;
    this.future.push(current);
    return prev;
  }

  /** @returns the state to restore, or null when there is nothing to redo. */
  redo(current: FlowState): FlowState | null {
    const next = this.future.pop();
    if (!next) return null;
    this.past.push(current);
    return next;
  }
}
