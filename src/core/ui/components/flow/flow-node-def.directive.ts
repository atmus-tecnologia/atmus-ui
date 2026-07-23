import { Directive, TemplateRef, inject, input } from '@angular/core';
import { AtmFlowNode } from './flow.types';

/**
 * Declares a custom node renderer inside `<atm-flow>`:
 *
 * ```html
 * <atm-flow [(nodes)]="nodes" [(edges)]="edges">
 *   <ng-template atmFlowNode="card" let-node let-selected="selected">
 *     <div class="...">{{ node.data.title }}</div>
 *   </ng-template>
 * </atm-flow>
 * ```
 */
@Directive({ selector: 'ng-template[atmFlowNode]' })
export class AtmFlowNodeDef {
  readonly type = input.required<string>({ alias: 'atmFlowNode' });
  readonly template = inject(TemplateRef);

  static ngTemplateContextGuard(
    _dir: AtmFlowNodeDef,
    ctx: unknown,
  ): ctx is { $implicit: AtmFlowNode; selected: boolean; zoom: number } {
    return true;
  }
}
