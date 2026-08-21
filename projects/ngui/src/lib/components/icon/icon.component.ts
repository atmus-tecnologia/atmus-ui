import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Atmus Icons wrapper. Usage: `<atm-icon name="home-01" />` renders
 * `<i class="atm atm-home-01">`. Passing the full class also works:
 * `<atm-icon name="atm-search-01" />`.
 *
 * The `atm` base class carries the font declarations and is required — the
 * `atm-*` class alone only selects the glyph. That split is deliberate: a rule
 * matching every `atm-*` class would also capture design-system classes such as
 * `atm-field` and `atm-panel`, forcing an icon font onto buttons and panels.
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
    const base = n.startsWith('atm-') ? n : `atm-${n}`;
    return `atm ${base} ${this.iconClass_()}`.trim();
  });
}
