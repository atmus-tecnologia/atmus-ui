/**
 * Viewport-aware positioning for floating panels (dropdowns, popovers, tooltips).
 * Panels are rendered with `position: fixed`; this computes top/left and flips
 * the placement automatically when there is not enough room in the viewport.
 */

export type AtmPlacement = 'bottom' | 'top' | 'left' | 'right';
export type AtmAlign = 'start' | 'center' | 'end';

export interface AtmPositionResult {
  top: number;
  left: number;
  /** Final placement after auto-flip. */
  placement: AtmPlacement;
  /** Max height available for the panel (useful for scrollable lists). */
  maxHeight: number;
}

export interface AtmPositionOptions {
  placement?: AtmPlacement;
  align?: AtmAlign;
  /** Gap between trigger and panel, px. */
  offset?: number;
  /** Min margin from viewport edges, px. */
  viewportPadding?: number;
  /** Match panel width to trigger width. */
  matchWidth?: boolean;
}

export function atmComputePosition(
  trigger: DOMRect,
  panel: { width: number; height: number },
  options: AtmPositionOptions = {},
): AtmPositionResult {
  const { placement = 'bottom', align = 'start', offset = 6, viewportPadding = 8 } = options;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let finalPlacement: AtmPlacement = placement;

  // Auto flip on main axis
  if (placement === 'bottom' || placement === 'top') {
    const spaceBelow = vh - trigger.bottom - offset - viewportPadding;
    const spaceAbove = trigger.top - offset - viewportPadding;
    if (placement === 'bottom' && panel.height > spaceBelow && spaceAbove > spaceBelow) {
      finalPlacement = 'top';
    } else if (placement === 'top' && panel.height > spaceAbove && spaceBelow > spaceAbove) {
      finalPlacement = 'bottom';
    }
  } else {
    const spaceRight = vw - trigger.right - offset - viewportPadding;
    const spaceLeft = trigger.left - offset - viewportPadding;
    if (placement === 'right' && panel.width > spaceRight && spaceLeft > spaceRight) {
      finalPlacement = 'left';
    } else if (placement === 'left' && panel.width > spaceLeft && spaceRight > spaceLeft) {
      finalPlacement = 'right';
    }
  }

  let top = 0;
  let left = 0;

  if (finalPlacement === 'bottom' || finalPlacement === 'top') {
    top = finalPlacement === 'bottom' ? trigger.bottom + offset : trigger.top - offset - panel.height;
    if (align === 'start') left = trigger.left;
    else if (align === 'end') left = trigger.right - panel.width;
    else left = trigger.left + trigger.width / 2 - panel.width / 2;
  } else {
    left = finalPlacement === 'right' ? trigger.right + offset : trigger.left - offset - panel.width;
    if (align === 'start') top = trigger.top;
    else if (align === 'end') top = trigger.bottom - panel.height;
    else top = trigger.top + trigger.height / 2 - panel.height / 2;
  }

  // Clamp inside the viewport
  left = Math.min(Math.max(left, viewportPadding), vw - panel.width - viewportPadding);
  top = Math.min(Math.max(top, viewportPadding), Math.max(vh - panel.height - viewportPadding, viewportPadding));

  const maxHeight =
    finalPlacement === 'top'
      ? trigger.top - offset - viewportPadding
      : vh - (finalPlacement === 'bottom' ? trigger.bottom + offset : top) - viewportPadding;

  return { top, left, placement: finalPlacement, maxHeight: Math.max(maxHeight, 120) };
}
