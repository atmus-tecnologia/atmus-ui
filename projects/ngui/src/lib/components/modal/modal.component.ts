import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  model,
  output,
  signal,
} from '@angular/core';

/**
 * Declarative modal:
 *   <atm-modal [(open)]="showModal" header="Title" [expandable]="true">
 *     content...
 *     <div footer>buttons...</div>
 *   </atm-modal>
 *
 * The expand icon (next to close) maximizes to 90% of the viewport,
 * keeping a margin so it never touches the screen edges.
 */
@Component({
  selector: 'atm-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-[60] flex items-end justify-center p-4 sm:items-center"
        role="dialog"
        aria-modal="true"
      >
        <div
          class="animate-atm-fade absolute inset-0 bg-[var(--atm-overlay)] backdrop-blur-[2px]"
          (click)="dismissable() && close()"
        ></div>
        <div
          class="animate-atm-slide-up relative flex max-h-full flex-col overflow-hidden rounded-atm-lg
            border border-line bg-surface shadow-atm-lg transition-[width,height] duration-300"
          [style.width]="maximized() ? '90vw' : width()"
          [style.height]="maximized() ? '90vh' : null"
          [style.max-width]="maximized() ? '90vw' : 'calc(100vw - 2rem)'"
        >
          <!-- Header -->
          <div class="flex shrink-0 items-center gap-2 border-b border-line px-5 py-4">
            <h2 class="min-w-0 flex-1 truncate text-base font-semibold text-ink">
              {{ header() }}
            </h2>
            @if (expandable()) {
              <button
                type="button"
                class="atm-focus flex size-8 cursor-pointer items-center justify-center rounded-full
                  text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink"
                [attr.aria-label]="maximized() ? 'Restaurar' : 'Expandir'"
                (click)="maximized.set(!maximized())"
              >
                <i
                  [class]="maximized() ? 'icofont-collapse' : 'icofont-expand-alt'"
                  class="text-sm"
                  aria-hidden="true"
                ></i>
              </button>
            }
            @if (closable()) {
              <button
                type="button"
                class="atm-focus flex size-8 cursor-pointer items-center justify-center rounded-full
                  bg-surface-alt text-ink-muted transition-colors hover:bg-line hover:text-ink"
                aria-label="Fechar"
                (click)="close()"
              >
                <i class="icofont-close" aria-hidden="true"></i>
              </button>
            }
          </div>

          <!-- Body -->
          <div class="min-h-0 flex-1 overflow-auto px-5 py-4">
            <ng-content />
          </div>

          <!-- Footer -->
          <div class="empty:hidden shrink-0 border-t border-line px-5 py-3 empty:border-0 empty:p-0">
            <ng-content select="[footer]" />
          </div>
        </div>
      </div>
    }
  `,
})
export class AtmModal {
  readonly open = model(false);
  readonly header = input('');
  readonly width = input('32rem');
  readonly closable = input(true);
  readonly expandable = input(true);
  /** Close when clicking the backdrop. */
  readonly dismissable = input(true);

  readonly closed = output<void>();

  readonly maximized = signal(false);

  close(): void {
    this.open.set(false);
    this.maximized.set(false);
    this.closed.emit();
  }
}
