import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Toolbar with start / center / end slots:
 *   <atm-toolbar>
 *     <div start>...</div><div center>...</div><div end>...</div>
 *   </atm-toolbar>
 */
@Component({
  selector: 'atm-toolbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  template: `
    <div
      class="flex w-full items-center gap-3 rounded-atm-lg border border-line bg-surface px-4 py-2.5"
      [class.shadow-atm]="elevated()"
      role="toolbar"
    >
      <div class="flex items-center gap-2"><ng-content select="[start]" /></div>
      <div class="flex flex-1 items-center justify-center gap-2"><ng-content select="[center]" /></div>
      <div class="flex items-center gap-2"><ng-content select="[end]" /></div>
    </div>
  `,
})
export class AtmToolbar {
  readonly elevated = input(false);
}
