import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
} from '@angular/core';

export type AtmDrawerPosition = 'left' | 'right' | 'top' | 'bottom';

/**
 * Slide-in panel:
 *   <atm-drawer [(open)]="showDrawer" header="Filters" position="right">...</atm-drawer>
 */
@Component({
  selector: 'atm-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="fixed inset-0 z-[60]" role="dialog" aria-modal="true">
        <div
          class="animate-atm-fade absolute inset-0 bg-[var(--atm-overlay)] backdrop-blur-[2px]"
          (click)="dismissable() && close()"
        ></div>
        <div [class]="panelClasses()" [style]="sizeStyle()">
          <div class="flex shrink-0 items-center gap-2 border-b border-line px-5 py-4">
            <h2 class="min-w-0 flex-1 truncate text-base font-semibold text-ink">{{ header() }}</h2>
            <button
              type="button"
              class="atm-focus flex size-8 cursor-pointer items-center justify-center rounded-full
                text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink"
              aria-label="Fechar"
              (click)="close()"
            >
              <i class="icofont-close" aria-hidden="true"></i>
            </button>
          </div>
          <div class="min-h-0 flex-1 overflow-auto px-5 py-4">
            <ng-content />
          </div>
          <div class="empty:hidden shrink-0 border-t border-line px-5 py-3 empty:border-0 empty:p-0">
            <ng-content select="[footer]" />
          </div>
        </div>
      </div>
    }
  `,
})
export class AtmDrawer {
  readonly open = model(false);
  readonly header = input('');
  readonly position = input<AtmDrawerPosition>('right');
  /** Width (left/right) or height (top/bottom). */
  readonly size = input('24rem');
  readonly dismissable = input(true);

  readonly closed = output<void>();

  readonly panelClasses = computed(() => {
    const base =
      'absolute flex flex-col bg-surface border-line shadow-atm-lg ' +
      'transition-transform duration-300';
    const map: Record<AtmDrawerPosition, string> = {
      right: 'inset-y-0 right-0 border-l animate-[atm-drawer-right_0.3s_cubic-bezier(0.16,1,0.3,1)]',
      left: 'inset-y-0 left-0 border-r animate-[atm-drawer-left_0.3s_cubic-bezier(0.16,1,0.3,1)]',
      top: 'inset-x-0 top-0 border-b animate-[atm-drawer-top_0.3s_cubic-bezier(0.16,1,0.3,1)]',
      bottom: 'inset-x-0 bottom-0 border-t animate-[atm-drawer-bottom_0.3s_cubic-bezier(0.16,1,0.3,1)]',
    };
    return `${base} ${map[this.position()]}`;
  });

  readonly sizeStyle = computed(() => {
    const pos = this.position();
    return pos === 'left' || pos === 'right'
      ? { width: this.size(), 'max-width': '90vw' }
      : { height: this.size(), 'max-height': '90vh' };
  });

  close(): void {
    this.open.set(false);
    this.closed.emit();
  }
}
