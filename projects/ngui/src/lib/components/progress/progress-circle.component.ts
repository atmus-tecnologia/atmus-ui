import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AtmColor, AtmSize } from '../../types';

const SIZE: Record<AtmSize, number> = { large: 96, medium: 64, slim: 40 };
const COLOR: Record<AtmColor, string> = {
  primary: 'text-primary',
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-danger',
  info: 'text-info',
  neutral: 'text-ink-muted',
};

@Component({
  selector: 'atm-progress-circle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <div class="relative inline-flex items-center justify-center">
      <svg [attr.width]="px()" [attr.height]="px()" viewBox="0 0 100 100" class="-rotate-90">
        <circle
          cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="10"
          class="text-line"
        />
        <circle
          cx="50" cy="50" r="42" fill="none" stroke="currentColor" stroke-width="10"
          stroke-linecap="round"
          [class]="colorClass()"
          [attr.stroke-dasharray]="circumference"
          [attr.stroke-dashoffset]="dashOffset()"
          style="transition: stroke-dashoffset 0.5s ease"
        />
      </svg>
      @if (showLabel()) {
        <span class="absolute text-xs font-semibold text-ink tabular-nums">{{ clamped() }}%</span>
      }
    </div>
  `,
})
export class AtmProgressCircle {
  readonly size = input<AtmSize>('medium');
  readonly color = input<AtmColor>('primary');
  readonly value = input(0);
  readonly showLabel = input(true);

  readonly circumference = 2 * Math.PI * 42;

  readonly px = computed(() => SIZE[this.size()]);
  readonly clamped = computed(() => Math.min(Math.max(Math.round(this.value()), 0), 100));
  readonly dashOffset = computed(() => this.circumference * (1 - this.clamped() / 100));
  readonly colorClass = computed(() => COLOR[this.color()]);
}
