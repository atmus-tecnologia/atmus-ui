import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  OnDestroy,
  TemplateRef,
  afterNextRender,
  computed,
  contentChildren,
  effect,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { AtmSize } from '../../types';

/** Single tab. Content is lazy — only the active tab renders. */
@Component({
  selector: 'atm-tab',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<ng-template #content><ng-content /></ng-template>`,
})
export class AtmTab {
  readonly label = input('');
  readonly icon = input<string | undefined>(undefined);
  readonly disabled = input(false);
  readonly badge = input<string | number | undefined>(undefined);

  readonly content = viewChild.required<TemplateRef<unknown>>('content');
}

const SIZE: Record<AtmSize, string> = {
  large: 'h-12 px-5 text-base',
  medium: 'h-10 px-4 text-sm',
  slim: 'h-8 px-3 text-xs',
};

/** Tab height inside padded tracks (pill / segmented) so the track keeps the standard size. */
const INNER_SIZE: Record<AtmSize, string> = {
  large: 'h-10 px-5 text-base',
  medium: 'h-8 px-4 text-sm',
  slim: 'h-6 px-3 text-xs',
};

/**
 * Tabs:
 *   <atm-tabs [(activeIndex)]="tab" variant="segmented">
 *     <atm-tab label="General" icon="gear">...</atm-tab>
 *   </atm-tabs>
 *
 * When the tab list exceeds the available width, scroll chevrons with fading
 * edges appear automatically (all variants). Arrow keys / Home / End navigate.
 */
@Component({
  selector: 'atm-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgTemplateOutlet],
  host: { class: 'block min-w-0' },
  template: `
    <div [class]="trackClasses()">
      <div
        #list
        role="tablist"
        [class]="listClasses()"
        (scroll)="updateOverflow()"
        (keydown)="onKeydown($event)"
      >
        @for (tab of tabs(); track $index; let i = $index) {
          <button
            type="button"
            role="tab"
            [class]="tabClasses(i)"
            [attr.aria-selected]="i === activeIndex()"
            [attr.tabindex]="i === activeIndex() ? 0 : -1"
            [disabled]="tab.disabled()"
            (click)="select(i)"
          >
            @if (tab.icon()) {
              <i [class]="'icofont-' + tab.icon()" aria-hidden="true"></i>
            }
            {{ tab.label() }}
            @if (tab.badge() !== undefined) {
              <span
                class="ml-1 rounded-full bg-primary-soft px-1.5 py-0.5 text-[10px] font-semibold text-primary"
              >
                {{ tab.badge() }}
              </span>
            }
          </button>
        }
      </div>

      @if (canScrollLeft()) {
        <button
          type="button"
          tabindex="-1"
          aria-label="Rolar para a esquerda"
          class="absolute inset-y-0 left-0 z-10 flex w-10 cursor-pointer items-center justify-start pl-1.5 text-ink-muted transition-colors hover:text-ink"
          [style.background]="fadeStyle('left')"
          (click)="scrollByDir(-1)"
        >
          <i class="icofont-simple-left text-xs" aria-hidden="true"></i>
        </button>
      }
      @if (canScrollRight()) {
        <button
          type="button"
          tabindex="-1"
          aria-label="Rolar para a direita"
          class="absolute inset-y-0 right-0 z-10 flex w-10 cursor-pointer items-center justify-end pr-1.5 text-ink-muted transition-colors hover:text-ink"
          [style.background]="fadeStyle('right')"
          (click)="scrollByDir(1)"
        >
          <i class="icofont-simple-right text-xs" aria-hidden="true"></i>
        </button>
      }
    </div>

    <div class="pt-4" role="tabpanel">
      @if (activeTab(); as tab) {
        <div class="animate-atm-fade">
          <ng-container [ngTemplateOutlet]="tab.content()" />
        </div>
      }
    </div>
  `,
})
export class AtmTabs implements OnDestroy {
  readonly size = input<AtmSize>('medium');
  readonly variant = input<'line' | 'pill' | 'enclosed' | 'segmented'>('line');
  readonly activeIndex = model(0);

  readonly tabs = contentChildren(AtmTab);

  readonly activeTab = computed(() => this.tabs()[this.activeIndex()] ?? null);

  protected readonly listRef = viewChild.required<ElementRef<HTMLElement>>('list');
  protected readonly canScrollLeft = signal(false);
  protected readonly canScrollRight = signal(false);

  private resizeObserver?: ResizeObserver;

  constructor() {
    afterNextRender(() => {
      this.resizeObserver = new ResizeObserver(() => this.updateOverflow());
      this.resizeObserver.observe(this.listRef().nativeElement);
      this.updateOverflow();
    });

    // Re-measure when tabs change; keep the active tab visible when it changes.
    effect(() => {
      this.tabs();
      const i = this.activeIndex();
      queueMicrotask(() => {
        this.updateOverflow();
        this.scrollTabIntoView(i);
      });
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  readonly trackClasses = computed(() => {
    const map = {
      line: 'relative flex min-w-0 shadow-[inset_0_-1px_0_0_var(--atm-line)]',
      pill: 'relative inline-flex min-w-0 max-w-full overflow-hidden rounded-atm bg-surface-alt p-1',
      enclosed: 'relative flex min-w-0',
      segmented:
        'relative inline-flex min-w-0 max-w-full overflow-hidden rounded-full bg-surface-alt p-1',
    };
    return map[this.variant()];
  });

  readonly listClasses = computed(
    () =>
      'flex min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
  );

  tabClasses(i: number): string {
    const active = i === this.activeIndex();
    const variant = this.variant();
    const padded = variant === 'pill' || variant === 'segmented';
    const base =
      `atm-focus inline-flex shrink-0 cursor-pointer items-center gap-2 whitespace-nowrap font-medium ` +
      `transition-all duration-200 disabled:pointer-events-none disabled:opacity-40 ` +
      `${padded ? INNER_SIZE[this.size()] : SIZE[this.size()]}`;
    switch (variant) {
      case 'pill':
        return `${base} rounded-[calc(var(--atm-radius)-2px)] ${
          active ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
        }`;
      case 'segmented':
        return `${base} rounded-full ${
          active ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'
        }`;
      case 'enclosed':
        return `${base} rounded-atm ${
          active
            ? 'bg-primary-soft text-primary'
            : 'text-ink-muted hover:bg-surface-alt hover:text-ink'
        }`;
      default:
        return `${base} border-b-2 ${
          active
            ? 'border-primary text-primary'
            : 'border-transparent text-ink-muted hover:border-line-strong hover:text-ink'
        }`;
    }
  }

  select(i: number): void {
    this.activeIndex.set(i);
  }

  protected onKeydown(event: KeyboardEvent): void {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    const enabled = this.tabs()
      .map((tab, i) => ({ tab, i }))
      .filter(({ tab }) => !tab.disabled());
    if (!enabled.length) return;
    event.preventDefault();

    const pos = enabled.findIndex(({ i }) => i === this.activeIndex());
    let next: number;
    switch (event.key) {
      case 'ArrowRight':
        next = (pos + 1) % enabled.length;
        break;
      case 'ArrowLeft':
        next = (pos - 1 + enabled.length) % enabled.length;
        break;
      case 'Home':
        next = 0;
        break;
      default:
        next = enabled.length - 1;
    }
    this.select(enabled[next].i);
    this.tabElement(enabled[next].i)?.focus();
  }

  protected updateOverflow(): void {
    const el = this.listRef().nativeElement;
    const max = el.scrollWidth - el.clientWidth;
    this.canScrollLeft.set(el.scrollLeft > 1);
    this.canScrollRight.set(max - el.scrollLeft > 1);
  }

  protected scrollByDir(dir: 1 | -1): void {
    const el = this.listRef().nativeElement;
    el.scrollBy({ left: dir * el.clientWidth * 0.6, behavior: 'smooth' });
  }

  protected fadeStyle(edge: 'left' | 'right'): string {
    const variant = this.variant();
    const color =
      variant === 'pill' || variant === 'segmented'
        ? 'var(--atm-surface-alt)'
        : 'var(--atm-surface)';
    const to = edge === 'left' ? 'right' : 'left';
    return `linear-gradient(to ${to}, ${color} 55%, transparent)`;
  }

  private scrollTabIntoView(i: number): void {
    this.tabElement(i)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }

  private tabElement(i: number): HTMLElement | null {
    const el = this.listRef().nativeElement.querySelectorAll<HTMLElement>('[role="tab"]')[i];
    return el ?? null;
  }
}
