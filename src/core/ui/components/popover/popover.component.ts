import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  viewChild,
} from '@angular/core';
import { AtmAlign, AtmPlacement } from '../../utils/position';
import { AtmOverlayBase } from '../../utils/overlay-base';

/**
 * Rich content popover with projected trigger and body:
 *   <atm-popover placement="bottom">
 *     <atm-button trigger>Open</atm-button>
 *     <div body>Any content...</div>
 *   </atm-popover>
 */
@Component({
  selector: 'atm-popover',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block' },
  template: `
    <div #trigger class="inline-block" (click)="toggle()">
      <ng-content select="[trigger]" />
    </div>
    @if (isOpen()) {
      <div
        #panel
        [style]="panelStyle()"
        class="atm-panel animate-atm-pop z-50 w-max max-w-sm overflow-auto p-4"
      >
        <ng-content select="[body]" />
      </div>
    }
  `,
})
export class AtmPopover extends AtmOverlayBase {
  readonly popPlacement = input<AtmPlacement>('bottom', { alias: 'placement' });
  readonly popAlign = input<AtmAlign>('start', { alias: 'align' });

  readonly triggerRef = viewChild<ElementRef<HTMLElement>>('trigger');
  readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');

  constructor() {
    super();
    this.matchTriggerWidth = false;
  }

  override open(): void {
    this.placement = this.popPlacement();
    this.align = this.popAlign();
    super.open();
  }

  protected getTriggerEl(): HTMLElement | null {
    return this.triggerRef()?.nativeElement ?? null;
  }
  protected getPanelEl(): HTMLElement | null {
    return this.panelRef()?.nativeElement ?? null;
  }
}
