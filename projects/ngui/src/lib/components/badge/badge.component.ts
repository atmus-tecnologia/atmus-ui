import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AtmColor, AtmSize, AtmVariant } from '../../types';

const SIZE: Record<AtmSize, string> = {
  large: 'h-7 px-3 text-sm',
  medium: 'h-6 px-2.5 text-xs',
  slim: 'h-5 px-2 text-[10px]',
};

const STYLES: Record<Exclude<AtmVariant, 'ghost'>, Record<AtmColor, string>> = {
  solid: {
    primary: 'bg-primary text-primary-contrast',
    success: 'bg-success text-white',
    warning: 'bg-warning text-white',
    danger: 'bg-danger text-white',
    info: 'bg-info text-white',
    neutral: 'bg-ink text-surface',
  },
  soft: {
    primary: 'bg-primary-soft text-primary',
    success: 'bg-success-soft text-success',
    warning: 'bg-warning-soft text-warning',
    danger: 'bg-danger-soft text-danger',
    info: 'bg-info-soft text-info',
    neutral: 'bg-surface-alt text-ink-muted',
  },
  outline: {
    primary: 'border border-primary/40 text-primary',
    success: 'border border-success/40 text-success',
    warning: 'border border-warning/40 text-warning',
    danger: 'border border-danger/40 text-danger',
    info: 'border border-info/40 text-info',
    neutral: 'border border-line-strong text-ink-muted',
  },
};

@Component({
  selector: 'atm-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="classes()">
      @if (dot()) {
        <span class="size-1.5 rounded-full bg-current"></span>
      }
      <ng-content />
    </span>
  `,
})
export class AtmBadge {
  readonly size = input<AtmSize>('medium');
  readonly color = input<AtmColor>('primary');
  readonly variant = input<'solid' | 'soft' | 'outline'>('soft');
  readonly dot = input(false);

  readonly classes = computed(
    () =>
      `inline-flex items-center gap-1.5 rounded-full font-semibold whitespace-nowrap ` +
      `${SIZE[this.size()]} ${STYLES[this.variant()][this.color()]}`,
  );
}
