import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  model,
  OnDestroy,
  output,
  signal,
} from '@angular/core';

export type AtmDrawerPosition = 'left' | 'right' | 'top' | 'bottom';

/** Must match the 0.3s of the .atm-drawer-in/out-* classes in atmus.css. */
const ANIM_MS = 300;

const ENTER_ANIM: Record<AtmDrawerPosition, string> = {
  right: 'atm-drawer-in-right',
  left: 'atm-drawer-in-left',
  top: 'atm-drawer-in-top',
  bottom: 'atm-drawer-in-bottom',
};

const LEAVE_ANIM: Record<AtmDrawerPosition, string> = {
  right: 'atm-drawer-out-right',
  left: 'atm-drawer-out-left',
  top: 'atm-drawer-out-top',
  bottom: 'atm-drawer-out-bottom',
};

/**
 * Slide-in panel with enter/exit animation on every edge.
 * Top/bottom render as a centered sheet (grab handle + rounded corners).
 *
 *   <atm-drawer [(open)]="showDrawer" header="Filters" position="right">...</atm-drawer>
 *   <atm-drawer [(open)]="show" position="bottom" header="Preferences" description="...">...</atm-drawer>
 *
 * Inside a container (e.g. a modal — the nearest `relative` + `overflow-hidden` ancestor):
 *   <atm-drawer [(open)]="show" position="bottom" container="parent">...</atm-drawer>
 */
@Component({
  selector: 'atm-drawer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
  template: `
    @if (visible()) {
      <div [class]="rootClasses()" role="dialog" aria-modal="true">
        <div [class]="backdropClasses()" (click)="dismissable() && close()"></div>
        <div [class]="panelClasses()" [style]="sizeStyle()">
          @if (position() === 'bottom') {
            <div class="flex shrink-0 justify-center pt-3 pb-1" aria-hidden="true">
              <div class="h-1 w-10 rounded-full bg-ink-faint"></div>
            </div>
          }

          <div
            class="flex shrink-0 items-start gap-2 border-b border-line px-5"
            [class]="isSheet() ? 'pt-2 pb-4' : 'py-4'"
          >
            <div class="min-w-0 flex-1">
              <h2 class="truncate text-base font-semibold text-ink">{{ header() }}</h2>
              @if (description()) {
                <p class="mt-0.5 text-sm text-ink-muted">{{ description() }}</p>
              }
            </div>
            <button
              type="button"
              class="atm-focus flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full
                text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink"
              aria-label="Fechar"
              (click)="close()"
            >
              <i class="atm atm-cancel-01" aria-hidden="true"></i>
            </button>
          </div>

          <div class="min-h-0 flex-1 overflow-auto px-5 py-4">
            <ng-content />
          </div>

          <div class="empty:hidden shrink-0 border-t border-line px-5 py-3 empty:border-0 empty:p-0">
            <ng-content select="[footer]" />
          </div>

          @if (position() === 'top') {
            <div class="flex shrink-0 justify-center pt-1 pb-3" aria-hidden="true">
              <div class="h-1 w-10 rounded-full bg-ink-faint"></div>
            </div>
          }
        </div>
      </div>
    }
  `,
})
export class AtmDrawer implements OnDestroy {
  readonly open = model(false);
  readonly header = input('');
  /** Optional subtitle under the header (sheet-style drawers). */
  readonly description = input('');
  readonly position = input<AtmDrawerPosition>('right');
  /** Width (left/right) or height (top/bottom). */
  readonly size = input('24rem');
  /** Sheet width (top/bottom only) — use '100%' for edge-to-edge. */
  readonly width = input('32rem');
  /** 'viewport' = fixed to the screen; 'parent' = absolute inside the nearest positioned container (e.g. a modal). */
  readonly container = input<'viewport' | 'parent'>('viewport');
  readonly dismissable = input(true);

  readonly closed = output<void>();

  /** Keeps the overlay mounted during the exit animation. */
  readonly visible = signal(false);
  readonly leaving = signal(false);

  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  readonly isSheet = computed(() => {
    const pos = this.position();
    return pos === 'top' || pos === 'bottom';
  });

  readonly rootClasses = computed(
    () => `${this.container() === 'parent' ? 'absolute' : 'fixed'} inset-0 z-[60] overflow-hidden`,
  );

  readonly backdropClasses = computed(() => {
    const base = 'absolute inset-0 bg-[var(--atm-overlay)] backdrop-blur-[2px]';
    return this.leaving()
      ? `${base} opacity-0 transition-opacity duration-300`
      : `${base} animate-atm-fade`;
  });

  readonly panelClasses = computed(() => {
    const pos = this.position();
    const anim = this.leaving() ? LEAVE_ANIM[pos] : ENTER_ANIM[pos];
    const base = 'absolute flex flex-col bg-surface shadow-atm-lg';
    const layout: Record<AtmDrawerPosition, string> = {
      right: 'inset-y-0 right-0 border-l border-line',
      left: 'inset-y-0 left-0 border-r border-line',
      top: 'inset-x-0 top-0 mx-auto rounded-b-2xl border border-t-0 border-line',
      bottom: 'inset-x-0 bottom-0 mx-auto rounded-t-2xl border border-b-0 border-line',
    };
    return `${base} ${layout[pos]} ${anim}`;
  });

  readonly sizeStyle = computed(() => {
    if (!this.isSheet()) {
      return { width: this.size(), 'max-width': '90%' };
    }
    return {
      height: this.size(),
      'max-height': '90%',
      width: this.width(),
      'max-width': '100%',
    };
  });

  constructor() {
    effect(() => {
      if (this.open()) {
        this.cancelCloseTimer();
        this.leaving.set(false);
        this.visible.set(true);
      } else if (this.visible() && !this.leaving()) {
        this.beginLeave();
      }
    });
  }

  ngOnDestroy(): void {
    this.cancelCloseTimer();
  }

  close(): void {
    if (!this.visible() || this.leaving() || !this.open()) return;
    this.closed.emit();
    this.open.set(false);
  }

  onEscape(): void {
    if (this.visible() && this.dismissable()) this.close();
  }

  private beginLeave(): void {
    if (this.leaving()) return;
    this.leaving.set(true);
    this.closeTimer = setTimeout(() => {
      this.visible.set(false);
      this.leaving.set(false);
      this.closeTimer = null;
    }, ANIM_MS);
  }

  private cancelCloseTimer(): void {
    if (this.closeTimer) {
      clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }
  }
}
