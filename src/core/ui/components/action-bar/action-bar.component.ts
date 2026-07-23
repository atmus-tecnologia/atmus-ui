import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { AtmSize } from '../../types';
import { AtmCloseButton } from '../button/close-button.component';

const PILL_SIZE: Record<AtmSize, string> = {
  large: 'h-14 gap-2 px-3 text-base',
  medium: 'h-12 gap-1.5 px-2.5 text-sm',
  slim: 'h-10 gap-1 px-2 text-xs',
};

const BADGE_SIZE: Record<AtmSize, string> = {
  large: 'size-7 text-sm',
  medium: 'size-6 text-xs',
  slim: 'size-5 text-[11px]',
};

const CLOSE_SIZE: Record<AtmSize, AtmSize> = {
  large: 'medium',
  medium: 'slim',
  slim: 'slim',
};

/**
 * Floating toolbar for contextual actions (bulk selection, editing controls…).
 * Appears centered at the bottom (or top) of the viewport — or of the nearest
 * `relative` container when `container="parent"`.
 *
 *   <atm-action-bar
 *     [open]="selection().length > 0"
 *     [count]="selection().length"
 *     (closed)="selection.set([])"
 *   >
 *     <atm-button size="slim" variant="ghost" color="neutral" icon="edit">Editar</atm-button>
 *     <atm-button size="slim" variant="ghost" color="danger" icon="ui-delete">Excluir</atm-button>
 *   </atm-action-bar>
 */
@Component({
  selector: 'atm-action-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmCloseButton],
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
  template: `
    @if (open()) {
      <div [class]="wrapperClasses()">
        <div [class]="pillClasses()" role="toolbar" [attr.aria-label]="ariaLabel()">
          @if (count() !== null) {
            <span
              class="flex shrink-0 items-center justify-center rounded-full bg-surface-alt
                font-semibold text-ink tabular-nums"
              [class]="badgeClasses()"
            >
              {{ count() }}
            </span>
          }

          <ng-content />

          @if (showClose()) {
            <span class="mx-1 h-5 w-px shrink-0 bg-line" aria-hidden="true"></span>
            <atm-close-button [size]="closeSize()" (clicked)="dismiss()" />
          }
        </div>
      </div>
    }
  `,
})
export class AtmActionBar {
  /** Controls visibility (e.g. `[open]="selection().length > 0"`). */
  readonly open = input(false);
  /** Edge where the bar floats. */
  readonly position = input<'bottom' | 'top'>('bottom');
  /** 'viewport' = fixed to the screen; 'parent' = absolute inside the nearest `relative` container. */
  readonly container = input<'viewport' | 'parent'>('viewport');
  readonly size = input<AtmSize>('medium');
  /** Optional selection counter shown as a badge at the start. */
  readonly count = input<number | null>(null);
  /** Shows the trailing close (X) button. */
  readonly showClose = input(true);
  readonly ariaLabel = input('Ações');

  /** Emitted by the close button or Escape — clear the selection / hide the bar here. */
  readonly closed = output<void>();

  readonly closeSize = computed(() => CLOSE_SIZE[this.size()]);
  readonly badgeClasses = computed(() => BADGE_SIZE[this.size()]);

  readonly wrapperClasses = computed(() => {
    const parts = [
      'pointer-events-none inset-x-0 z-40 flex justify-center px-4',
      this.container() === 'viewport' ? 'fixed' : 'absolute',
      this.position() === 'bottom' ? 'bottom-5' : 'top-5',
      this.position() === 'bottom' ? 'animate-atm-slide-up' : 'animate-atm-slide-down',
    ];
    return parts.join(' ');
  });

  readonly pillClasses = computed(
    () =>
      `pointer-events-auto flex max-w-full items-center overflow-x-auto rounded-full border ` +
      `border-line bg-surface shadow-atm-lg ${PILL_SIZE[this.size()]}`,
  );

  dismiss(): void {
    this.closed.emit();
  }

  onEscape(): void {
    if (this.open()) this.dismiss();
  }
}
