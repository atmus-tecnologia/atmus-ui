import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AtmSize } from '../../types';
import { AtmAvatar } from './avatar.component';
import { AtmTooltip } from '../tooltip/tooltip.directive';

/** Negative margin (overlap) per size. */
const OVERLAP: Record<AtmSize, string> = {
  large: '-ml-3',
  medium: '-ml-2.5',
  slim: '-ml-2',
};

const SIZE: Record<AtmSize, string> = {
  large: 'size-12 text-base',
  medium: 'size-10 text-sm',
  slim: 'size-8 text-xs',
};

/** Resolves a (possibly nested) key path like "user.name" from an object. */
function resolvePath(obj: unknown, path: string): unknown {
  if (obj == null || !path) return undefined;
  return path.split('.').reduce<unknown>((acc, key) => {
    return acc == null ? undefined : (acc as Record<string, unknown>)[key];
  }, obj);
}

/**
 * Stacked/overlapping avatars for a list of items, with a configurable
 * visible limit and a "+N" overflow bubble.
 *
 * Each item is a plain object; use `srcKey` / `nameKey` to point at its
 * image and label. When `tooltipKey` is set, hovering an avatar shows the
 * value at that key path (e.g. "name" or "user.name").
 */
@Component({
  selector: 'atm-avatar-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmAvatar, AtmTooltip],
  host: { class: 'inline-flex items-center' },
  template: `
    @for (item of visible(); track $index; let i = $index) {
      <span
        [class]="ringClass() + (i > 0 ? ' ' + overlapClass() : '')"
        [atmTooltip]="tooltipFor(item)"
        [tooltipPlacement]="tooltipPlacement()"
        (click)="itemClick.emit(i)"
      >
        <atm-avatar
          [size]="size()"
          [square]="square()"
          [src]="srcFor(item)"
          [name]="nameFor(item)"
        />
      </span>
    }
    @if (remaining() > 0) {
      <span
        [class]="
          ringClass() + ' ' + overlapClass() + ' ' + sizeClass() +
          ' flex select-none items-center justify-center font-semibold ' +
          'bg-surface-alt text-ink-muted' + (square() ? ' rounded-atm' : ' rounded-full')
        "
        [atmTooltip]="remainingTooltip()"
        [tooltipPlacement]="tooltipPlacement()"
      >
        +{{ remaining() }}
      </span>
    }
  `,
})
export class AtmAvatarGroup {
  /** List of arbitrary objects to render as avatars. */
  readonly items = input<readonly unknown[]>([]);
  /** Maximum number of avatars shown before collapsing into "+N". */
  readonly max = input(4);
  readonly size = input<AtmSize>('medium');
  readonly square = input(false);
  /** Key path to the image URL on each item (e.g. "src", "avatar", "user.photo"). */
  readonly srcKey = input('src');
  /** Key path to the name used for initials/fallback (e.g. "name", "user.name"). */
  readonly nameKey = input('name');
  /** Key path used for the hover tooltip. Falls back to `nameKey` when empty. */
  readonly tooltipKey = input('');
  readonly tooltipPlacement = input<'top' | 'bottom' | 'left' | 'right'>('top');

  /** Emits the clicked item's index. */
  readonly itemClick = output<number>();

  readonly visible = computed(() => this.items().slice(0, Math.max(0, this.max())));
  readonly remaining = computed(() => Math.max(0, this.items().length - this.visible().length));

  readonly overlapClass = computed(() => OVERLAP[this.size()]);
  readonly sizeClass = computed(() => SIZE[this.size()]);
  readonly ringClass = computed(
    () => 'inline-flex ring-2 ring-surface' + (this.square() ? ' rounded-atm' : ' rounded-full'),
  );

  srcFor(item: unknown): string | undefined {
    const value = resolvePath(item, this.srcKey());
    return typeof value === 'string' ? value : undefined;
  }

  nameFor(item: unknown): string {
    const value = resolvePath(item, this.nameKey());
    return value == null ? '' : String(value);
  }

  tooltipFor(item: unknown): string {
    const key = this.tooltipKey() || this.nameKey();
    const value = resolvePath(item, key);
    return value == null ? '' : String(value);
  }

  readonly remainingTooltip = computed(() => {
    const key = this.tooltipKey() || this.nameKey();
    return this.items()
      .slice(this.visible().length)
      .map((item) => {
        const value = resolvePath(item, key);
        return value == null ? '' : String(value);
      })
      .filter(Boolean)
      .join(', ');
  });
}
