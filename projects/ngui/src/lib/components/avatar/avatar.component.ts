import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { AtmSize } from '../../types';

const SIZE: Record<AtmSize, string> = {
  large: 'size-12 text-base',
  medium: 'size-10 text-sm',
  slim: 'size-8 text-xs',
};

const PALETTE = [
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-amber-500',
  'bg-rose-500',
  'bg-sky-500',
  'bg-violet-500',
  'bg-teal-500',
  'bg-orange-500',
];

/**
 * Avatar with image, or initials derived from `name` (deterministic color).
 */
@Component({
  selector: 'atm-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative inline-flex' },
  template: `
    @if (src()) {
      <img
        [src]="src()"
        [alt]="name() || 'Avatar'"
        [class]="baseClasses() + ' object-cover'"
      />
    } @else {
      <span [class]="baseClasses() + ' ' + bgColor() + ' font-semibold text-white'">
        {{ initials() }}
      </span>
    }
    @if (status()) {
      <span
        class="absolute right-0 bottom-0 size-1/4 rounded-full ring-2 ring-surface"
        [class]="statusColor()"
      ></span>
    }
  `,
})
export class AtmAvatar {
  readonly size = input<AtmSize>('medium');
  readonly src = input<string | undefined>(undefined);
  readonly name = input('');
  readonly square = input(false);
  readonly status = input<'online' | 'offline' | 'busy' | 'away' | undefined>(undefined);

  readonly baseClasses = computed(
    () =>
      `flex items-center justify-center select-none ${SIZE[this.size()]} ` +
      (this.square() ? 'rounded-atm' : 'rounded-full'),
  );

  readonly initials = computed(() => {
    const parts = this.name().trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    return ((parts[0][0] ?? '') + (parts.at(-1)?.[0] ?? '')).toUpperCase().slice(0, 2);
  });

  readonly bgColor = computed(() => {
    const name = this.name();
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
    return PALETTE[Math.abs(hash) % PALETTE.length];
  });

  readonly statusColor = computed(
    () =>
      ({
        online: 'bg-success',
        offline: 'bg-ink-faint',
        busy: 'bg-danger',
        away: 'bg-warning',
      })[this.status() ?? 'offline'],
  );
}
