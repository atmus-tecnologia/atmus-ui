import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Groups atm-button elements visually (joined borders / radius).
 * <atm-button-group><atm-button .../><atm-button .../></atm-button-group>
 */
@Component({
  selector: 'atm-button-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'inline-flex items-stretch [&>atm-button:not(:first-child)_button]:rounded-l-none ' +
      '[&>atm-button:not(:last-child)_button]:rounded-r-none [&>atm-button:not(:first-child)]:-ml-px',
    role: 'group',
  },
  template: `<ng-content />`,
})
export class AtmButtonGroup {}
