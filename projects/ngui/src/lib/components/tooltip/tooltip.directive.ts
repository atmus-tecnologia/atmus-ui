import {
  ApplicationRef,
  Directive,
  ElementRef,
  NgZone,
  OnDestroy,
  computed,
  createComponent,
  inject,
  input,
  ChangeDetectionStrategy,
  Component,
  signal,
} from '@angular/core';
import { AtmAlign, AtmPlacement, atmComputePosition } from '../../utils/position';

/**
 * Compound placements: side or side + alignment along that side.
 * e.g. 'top' (centered), 'top-left' (above, aligned to the left edge),
 * 'right-bottom' (to the right, aligned to the bottom edge).
 */
export type AtmTooltipPlacement =
  | AtmPlacement
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'left-top'
  | 'left-bottom'
  | 'right-top'
  | 'right-bottom';

function parsePlacement(value: AtmTooltipPlacement): { placement: AtmPlacement; align: AtmAlign } {
  const [placement, alignPart] = value.split('-') as [AtmPlacement, string | undefined];
  const align: AtmAlign =
    alignPart === 'left' || alignPart === 'top' ? 'start'
    : alignPart === 'right' || alignPart === 'bottom' ? 'end'
    : 'center';
  return { placement, align };
}

@Component({
  selector: 'atm-tooltip-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="animate-atm-fade pointer-events-none fixed z-[70] max-w-xs rounded-lg bg-ink px-2.5 py-1.5
        text-xs font-medium text-surface shadow-atm"
      [style.top.px]="top()"
      [style.left.px]="left()"
      role="tooltip"
    >
      {{ text() }}
      <span
        class="absolute h-2 w-2 rotate-45 bg-ink"
        [class]="arrowClass()"
        [style.left.px]="arrowLeft()"
        [style.top.px]="arrowTop()"
        aria-hidden="true"
      ></span>
    </div>
  `,
})
export class AtmTooltipPanel {
  readonly text = signal('');
  readonly top = signal(0);
  readonly left = signal(0);
  readonly placement = signal<AtmPlacement>('top');
  /** Arrow offset within the panel (px), so it keeps pointing at the trigger even when clamped. */
  readonly arrowLeft = signal<number | null>(null);
  readonly arrowTop = signal<number | null>(null);

  readonly arrowClass = computed(() => {
    switch (this.placement()) {
      case 'top':
        return '-bottom-1';
      case 'bottom':
        return '-top-1';
      case 'left':
        return '-right-1';
      case 'right':
        return '-left-1';
    }
  });
}

/**
 * Tooltip directive: <button atmTooltip="Save changes" tooltipPlacement="top">
 * Placements: top | bottom | left | right | top-left | top-right | bottom-left |
 * bottom-right | left-top | left-bottom | right-top | right-bottom.
 * Auto-flips near viewport edges.
 */
@Directive({
  selector: '[atmTooltip]',
  host: {
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focusin)': 'show()',
    '(focusout)': 'hide()',
  },
})
export class AtmTooltip implements OnDestroy {
  private readonly el = inject(ElementRef<HTMLElement>);
  private readonly appRef = inject(ApplicationRef);
  private readonly zone = inject(NgZone);

  readonly atmTooltip = input('');
  readonly tooltipPlacement = input<AtmTooltipPlacement>('top');
  readonly tooltipDelay = input(0);

  private panelRef: ReturnType<typeof createComponent<AtmTooltipPanel>> | null = null;
  private timer: ReturnType<typeof setTimeout> | null = null;

  show(): void {
    if (!this.atmTooltip() || this.panelRef) return;
    this.timer = setTimeout(() => this.create(), this.tooltipDelay());
  }

  hide(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.destroyPanel();
  }

  private create(): void {
    this.panelRef = createComponent(AtmTooltipPanel, {
      environmentInjector: this.appRef.injector,
    });
    this.panelRef.instance.text.set(this.atmTooltip());
    this.appRef.attachView(this.panelRef.hostView);
    document.body.appendChild(this.panelRef.location.nativeElement);

    // Render synchronously so the panel has its real size before measuring —
    // with the zoneless scheduler, attachView alone renders asynchronously.
    this.panelRef.changeDetectorRef.detectChanges();

    const panelEl = (this.panelRef.location.nativeElement as HTMLElement)
      .firstElementChild as HTMLElement;
    if (!panelEl) return;
    const rect = panelEl.getBoundingClientRect();
    const triggerRect = this.el.nativeElement.getBoundingClientRect();
    const { placement, align } = parsePlacement(this.tooltipPlacement());
    const pos = atmComputePosition(
      triggerRect,
      { width: rect.width, height: rect.height },
      { placement, align: 'center', offset: 8 },
    );

    // Compound placements shift the whole panel toward the named side while
    // the arrow stays anchored to the trigger center (qTip/PowerTip style):
    // e.g. top-left = panel extends up-left, arrow at its bottom-right corner.
    // 16 = corner inset (12px) + half the 8px arrow; 8 = viewport padding.
    const cx = triggerRect.left + triggerRect.width / 2;
    const cy = triggerRect.top + triggerRect.height / 2;
    let { top, left } = pos;
    if (pos.placement === 'top' || pos.placement === 'bottom') {
      if (align === 'start') left = cx + 16 - rect.width; // extends to the left
      else if (align === 'end') left = cx - 16; // extends to the right
      left = Math.min(Math.max(left, 8), window.innerWidth - rect.width - 8);
    } else {
      if (align === 'start') top = cy + 16 - rect.height; // extends upward
      else if (align === 'end') top = cy - 16; // extends downward
      top = Math.min(Math.max(top, 8), window.innerHeight - rect.height - 8);
    }
    this.panelRef.instance.top.set(top);
    this.panelRef.instance.left.set(left);
    this.panelRef.instance.placement.set(pos.placement);

    // Arrow always points at the trigger center, clamped to the panel edges.
    // 4 = half the arrow, 8 = min distance from the corners.
    if (pos.placement === 'top' || pos.placement === 'bottom') {
      this.panelRef.instance.arrowLeft.set(
        Math.min(Math.max(cx - left - 4, 8), rect.width - 16),
      );
    } else {
      this.panelRef.instance.arrowTop.set(
        Math.min(Math.max(cy - top - 4, 8), rect.height - 16),
      );
    }
    // Apply the final position in the same frame (avoids a flash at 0,0).
    this.panelRef.changeDetectorRef.detectChanges();
  }

  private destroyPanel(): void {
    if (this.panelRef) {
      this.appRef.detachView(this.panelRef.hostView);
      this.panelRef.destroy();
      this.panelRef = null;
    }
  }

  ngOnDestroy(): void {
    this.hide();
  }
}
