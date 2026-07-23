import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AtmSize } from '../../types';

const HEIGHT: Record<AtmSize, string> = { large: 'h-3', medium: 'h-2', slim: 'h-1' };

/** Meter — like progress but color reflects thresholds (good/warn/critical). */
@Component({
  selector: 'atm-meter',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  template: `
    @if (label()) {
      <div class="mb-1.5 flex items-center justify-between text-xs">
        <span class="font-medium text-ink">{{ label() }}</span>
        <span class="text-ink-muted tabular-nums">{{ value() }}/{{ max() }}</span>
      </div>
    }
    <div
      [class]="trackClasses()"
      role="meter"
      [attr.aria-valuenow]="value()"
      [attr.aria-valuemin]="0"
      [attr.aria-valuemax]="max()"
    >
      <div
        [class]="barColor()"
        class="h-full rounded-full transition-all duration-500"
        [style.width.%]="percent()"
      ></div>
    </div>
  `,
})
export class AtmMeter {
  readonly size = input<AtmSize>('medium');
  readonly value = input(0);
  readonly max = input(100);
  readonly label = input('');
  /** Above this % turns warning. */
  readonly warnAt = input(70);
  /** Above this % turns danger. */
  readonly dangerAt = input(90);

  readonly percent = computed(() => Math.min((this.value() / this.max()) * 100, 100));
  readonly trackClasses = computed(
    () => `w-full overflow-hidden rounded-full bg-surface-alt ${HEIGHT[this.size()]}`,
  );
  readonly barColor = computed(() => {
    const p = this.percent();
    if (p >= this.dangerAt()) return 'bg-danger';
    if (p >= this.warnAt()) return 'bg-warning';
    return 'bg-success';
  });
}
