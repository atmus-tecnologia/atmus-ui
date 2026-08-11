import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AtmColor, AtmSize } from '../../types';

const HEIGHT: Record<AtmSize, string> = { large: 'h-3', medium: 'h-2', slim: 'h-1' };
const COLOR: Record<AtmColor, string> = {
  primary: 'bg-primary',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  neutral: 'bg-ink-muted',
};

@Component({
  selector: 'atm-progress-bar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  template: `
    @if (showLabel()) {
      <div class="mb-1.5 flex items-center justify-between text-xs">
        <span class="font-medium text-ink">{{ label() }}</span>
        <span class="text-ink-muted tabular-nums">{{ clamped() }}%</span>
      </div>
    }
    <div
      [class]="trackClasses()"
      role="progressbar"
      [attr.aria-valuenow]="indeterminate() ? null : clamped()"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      @if (indeterminate()) {
        <div
          [class]="barColor()"
          class="h-full w-1/3 animate-[atm-progress-slide_1.2s_ease-in-out_infinite] rounded-full"
        ></div>
      } @else {
        <div
          [class]="barColor()"
          class="h-full rounded-full transition-[width] duration-500 ease-out"
          [style.width.%]="clamped()"
        ></div>
      }
    </div>
  `,
})
export class AtmProgressBar {
  readonly size = input<AtmSize>('medium');
  readonly color = input<AtmColor>('primary');
  readonly value = input(0);
  readonly label = input('');
  readonly showLabel = input(false);
  readonly indeterminate = input(false);

  readonly clamped = computed(() => Math.min(Math.max(Math.round(this.value()), 0), 100));
  readonly trackClasses = computed(
    () => `w-full overflow-hidden rounded-full bg-surface-alt ${HEIGHT[this.size()]}`,
  );
  readonly barColor = computed(() => COLOR[this.color()]);
}
