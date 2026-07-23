import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** Loading placeholder with shimmer effect. */
@Component({
  selector: 'atm-skeleton',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'classes()', '[style.width]': 'width()', '[style.height]': 'height()' },
  template: `
    <span
      class="absolute inset-0 -translate-x-full animate-[atm-skeleton_1.5s_infinite]
        bg-gradient-to-r from-transparent via-white/40 to-transparent dark:via-white/10"
    ></span>
  `,
})
export class AtmSkeleton {
  readonly width = input('100%');
  readonly height = input('1rem');
  readonly shape = input<'text' | 'circle' | 'rect'>('text');

  readonly classes = computed(() => {
    const radius = { text: 'rounded-md', circle: 'rounded-full', rect: 'rounded-atm' }[this.shape()];
    return `relative block overflow-hidden bg-surface-alt ${radius}`;
  });
}
