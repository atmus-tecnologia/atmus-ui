import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AtmColor, AtmSize } from '../../types';

const SIZE: Record<AtmSize, string> = {
  large: 'h-9 px-3.5 text-sm gap-2',
  medium: 'h-7 px-3 text-xs gap-1.5',
  slim: 'h-6 px-2.5 text-[11px] gap-1',
};

const COLORS: Record<AtmColor, string> = {
  primary: 'bg-primary-soft text-primary',
  success: 'bg-success-soft text-success',
  warning: 'bg-warning-soft text-warning',
  danger: 'bg-danger-soft text-danger',
  info: 'bg-info-soft text-info',
  neutral: 'bg-surface-alt text-ink',
};

/** Chip / tag with optional icon and remove button. */
@Component({
  selector: 'atm-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="classes()">
      @if (icon()) {
        <i [class]="'atm atm-' + icon()" aria-hidden="true"></i>
      }
      <ng-content />
      @if (removable()) {
        <button
          type="button"
          class="-mr-1 flex size-4 cursor-pointer items-center justify-center rounded-full
            transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          aria-label="Remover"
          (click)="removed.emit()"
        >
          <i class="atm atm-cancel-01 text-[9px]" aria-hidden="true"></i>
        </button>
      }
    </span>
  `,
})
export class AtmChip {
  readonly size = input<AtmSize>('medium');
  readonly color = input<AtmColor>('neutral');
  readonly icon = input<string | undefined>(undefined);
  readonly removable = input(false);

  readonly removed = output<void>();

  readonly classes = computed(
    () =>
      `inline-flex items-center rounded-full font-medium whitespace-nowrap select-none ` +
      `${SIZE[this.size()]} ${COLORS[this.color()]}`,
  );
}
