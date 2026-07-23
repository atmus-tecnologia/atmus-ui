import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Generic themed surface (background variations without card semantics). */
@Component({
  selector: 'atm-surface',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()' },
  template: `<ng-content />`,
})
export class AtmSurface {
  readonly variant = input<'default' | 'alt' | 'raised'>('default');
  readonly bordered = input(true);
  readonly padded = input(true);

  readonly classes = computed(() => {
    const bg = {
      default: 'bg-surface',
      alt: 'bg-surface-alt',
      raised: 'bg-surface-raised shadow-atm',
    }[this.variant()];
    return [
      'block rounded-atm-lg',
      bg,
      this.bordered() ? 'border border-line' : '',
      this.padded() ? 'p-4' : '',
    ].join(' ');
  });
}
