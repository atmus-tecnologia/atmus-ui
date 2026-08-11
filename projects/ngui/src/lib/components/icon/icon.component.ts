import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Icofont wrapper. Usage: <atm-icon name="home" /> renders `icofont-home`.
 * Pass the full class if preferred: <atm-icon name="icofont-ui-search" />.
 */
@Component({
  selector: 'atm-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex items-center justify-center leading-none' },
  template: `<i [class]="iconClass()" aria-hidden="true"></i>`,
})
export class AtmIcon {
  readonly name = input.required<string>();
  /** Extra classes for sizing/color, e.g. 'text-lg text-primary'. */
  readonly iconClass_ = input<string>('', { alias: 'className' });

  readonly iconClass = computed(() => {
    const n = this.name();
    const base = n.startsWith('icofont-') ? n : `icofont-${n}`;
    return `${base} ${this.iconClass_()}`.trim();
  });
}
