import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AtmSize } from '../../types';

const SIZE: Record<AtmSize, string> = {
  large: 'size-10 text-base',
  medium: 'size-8 text-sm',
  slim: 'size-6 text-xs',
};

@Component({
  selector: 'atm-close-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      [class]="classes()"
      aria-label="Fechar"
      (click)="clicked.emit($event)"
    >
      <i class="atm atm-cancel-01" aria-hidden="true"></i>
    </button>
  `,
})
export class AtmCloseButton {
  readonly size = input<AtmSize>('medium');
  readonly clicked = output<MouseEvent>();

  readonly classes = computed(
    () =>
      `atm-focus inline-flex cursor-pointer items-center justify-center rounded-full text-ink-muted ` +
      `transition-colors duration-150 hover:bg-surface-alt hover:text-ink active:scale-95 ${SIZE[this.size()]}`,
  );
}
