# [atmTooltip]

> Doc otimizada para LLMs. Fonte: `src/core/ui/components/tooltip/tooltip.directive.ts`

## Purpose

Diretiva de tooltip no host.

## Notes from source

Compound placements: side or side + alignment along that side.e.g. 'top' (centered), 'top-left' (above, aligned to the left edge),'right-bottom' (to the right, aligned to the bottom edge)./
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

/**Tooltip directive: <button atmTooltip="Save changes" tooltipPlacement="top">Placements: top | bottom | left | right | top-left | top-right | bottom-left |bottom-right | left-top | left-bottom | right-top | right-bottom.Auto-flips near viewport edges.

## Identity

- **Class**: `AtmTooltip`
- **Selector**: `[atmTooltip]`
- **Kind**: Directive

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `atmTooltip` | string | no | '' |
| `tooltipPlacement` | AtmTooltipPlacement | no | 'top' |
| `tooltipDelay` | number | no | 0 |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Related interfaces / types

### AtmTooltipPlacement

```ts
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
```

## Usage example

```html
<button [atmTooltip]="'Salvar'">...</button>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
