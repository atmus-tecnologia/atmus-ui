import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { ATM_SIZE_HEIGHT, ATM_SIZE_TEXT, AtmSize } from '../../types';

/**
 * Input with prefix/suffix addons.
 * <atm-input-group prefix="https://" suffix=".com"><atm-input /></atm-input-group>
 * Addons can also be projected: <span atmPrefix>R$</span> / <span atmSuffix>kg</span>.
 */
@Component({
  selector: 'atm-input-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  template: `
    <div
      [class]="classes()"
      class="flex w-full items-stretch overflow-hidden rounded-atm border border-line bg-surface
        transition-[border-color,box-shadow] duration-200 focus-within:border-primary
        focus-within:shadow-[0_0_0_3px_var(--atm-ring)]"
    >
      @if (prefix()) {
        <span class="flex items-center border-r border-line bg-surface-alt px-3 text-ink-muted">
          {{ prefix() }}
        </span>
      }
      <ng-content select="[atmPrefix]" />
      <div
        class="flex min-w-0 flex-1 items-stretch [&>*]:min-w-0 [&>*]:flex-1
          [&_.atm-field]:h-full! [&_.atm-field]:rounded-none [&_.atm-field]:border-0
          [&_.atm-field]:bg-transparent [&_.atm-field]:shadow-none!
          [&_.atm-field]:focus-within:shadow-none!"
      >
        <ng-content />
      </div>
      <ng-content select="[atmSuffix]" />
      @if (suffix()) {
        <span class="flex items-center border-l border-line bg-surface-alt px-3 text-ink-muted">
          {{ suffix() }}
        </span>
      }
    </div>
  `,
})
export class AtmInputGroup {
  readonly size = input<AtmSize>('medium');
  readonly prefix = input<string | undefined>(undefined);
  readonly suffix = input<string | undefined>(undefined);

  readonly classes = computed(() => `${ATM_SIZE_HEIGHT[this.size()]} ${ATM_SIZE_TEXT[this.size()]}`);
}
