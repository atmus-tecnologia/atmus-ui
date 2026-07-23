import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';
import { atmUid } from '../../types';
import { AtmFlow } from './flow.component';
import { AtmFlowHandlePosition, AtmFlowHandleType } from './flow.types';

/**
 * Connection port to be placed **inside a custom node template** — the
 * equivalent of Foundation Flow's `fNodeInput`/`fNodeOutput`. Position it
 * freely with utility classes; edges anchor to its real rendered position.
 *
 * ```html
 * <atm-flow [(nodes)]="nodes" [(edges)]="edges">
 *   <ng-template atmFlowNode="send-message" let-node let-selected="selected">
 *     <node-send-message [nodeId]="node.id" [nodeData]="node.data" [selected]="selected" />
 *   </ng-template>
 * </atm-flow>
 *
 * <!-- dentro do template de node-send-message: -->
 * <div class="relative ...">
 *   ...
 *   <atm-flow-handle type="target" position="left" class="top-1/2 -left-[5px] -translate-y-1/2" />
 *   <atm-flow-handle type="source" id="sent" position="right" class="-right-[5px] bottom-3" />
 * </div>
 * ```
 *
 * Use `handles: []` no node para remover os handles default das bordas.
 */
@Component({
  selector: 'atm-flow-handle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'absolute z-10 block size-2.5 rounded-full border-2 border-surface bg-ink-faint transition-transform hover:scale-125 hover:bg-primary',
    '[class.cursor-crosshair]': '!flow?.locked()',
    '[class.bg-primary]': 'isCandidate()',
    '[class.scale-125]': 'isCandidate()',
    '[attr.data-flow-handle]': 'id() ?? ""',
    '[attr.data-flow-handle-type]': 'type()',
    '[attr.data-flow-key]': 'key',
    '(pointerdown)': 'onPointerDown($event)',
  },
  template: '',
})
export class AtmFlowNodeHandle {
  readonly type = input<AtmFlowHandleType>('source');
  /** Necessário quando o node tem vários handles do mesmo tipo. */
  readonly id = input<string | undefined>(undefined);
  /** Lado por onde a edge entra/sai. Inferido da posição no node se omitido. */
  readonly position = input<AtmFlowHandlePosition | undefined>(undefined);
  /** Tipo do port — só conecta em ports compatíveis (ver compatibleTypes do atm-flow). */
  readonly dataType = input<string | undefined>(undefined);

  /** @internal */
  readonly key = atmUid('atm-fh');
  protected readonly flow = inject(AtmFlow, { optional: true });
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

  protected readonly isCandidate = computed(() => this.flow?.candidateKey() === this.key);

  constructor() {
    afterNextRender(() => this.flow?.registerCustomHandle(this.el, this));
    // Re-measure when inputs change after registration.
    effect(() => {
      this.type();
      this.id();
      this.position();
      this.dataType();
      untracked(() => this.flow?.refreshCustomHandle(this.el));
    });
    inject(DestroyRef).onDestroy(() => this.flow?.unregisterCustomHandle(this.el));
  }

  protected onPointerDown(e: PointerEvent): void {
    this.flow?.startCustomConnection(this.el, e);
  }
}
