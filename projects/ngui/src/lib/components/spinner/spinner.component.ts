import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AtmColor, AtmSize } from '../../types';

const SIZE: Record<AtmSize, string> = { large: 'size-8', medium: 'size-6', slim: 'size-4' };
const COLOR: Record<AtmColor, string> = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
  neutral: 'text-ink-muted',
};

@Component({
  selector: 'atm-spinner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex', role: 'status', '[attr.aria-label]': '"Loading"' },
  template: `
    <svg [class]="classes()" viewBox="0 0 24 24" fill="none">
      <circle class="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        stroke-width="3"
        stroke-linecap="round"
      />
    </svg>
  `,
})
export class AtmSpinner {
  readonly size = input<AtmSize>('medium');
  readonly color = input<AtmColor>('primary');

  readonly classes = computed(() => `animate-spin ${SIZE[this.size()]} ${COLOR[this.color()]}`);
}
