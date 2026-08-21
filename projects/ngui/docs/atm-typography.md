# atm-typography

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/misc/misc.components.ts`

## Purpose

Texto tipográfico com variantes (title, body, etc).

## Notes from source

Horizontal or vertical separator with optional label. */
@Component({
  selector: 'atm-separator',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'vertical() ? "self-stretch inline-flex" : "block w-full"' },
  template: `
    @if (vertical()) {
      <span class="mx-2 w-px self-stretch bg-line" role="separator"></span>
    } @else if (label()) {
      <div class="flex items-center gap-3" role="separator">
        <span class="h-px flex-1 bg-line"></span>
        <span class="text-xs font-medium text-ink-faint uppercase">{{ label() }}</span>
        <span class="h-px flex-1 bg-line"></span>
      </div>
    } @else {
      <span class="block h-px w-full bg-line" role="separator"></span>
    }
  `,
})
export class AtmSeparator {
  readonly vertical = input(false);
  readonly label = input<string | undefined>(undefined);
}

/** Keyboard shortcut hint. */
@Component({
  selector: 'atm-kbd',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'inline-flex min-w-6 items-center justify-center rounded-md border border-line ' +
      'bg-surface-alt px-1.5 py-0.5 font-sans text-[11px] font-medium text-ink-muted ' +
      'shadow-[inset_0_-1px_0_var(--atm-line-strong)]',
  },
  template: `<ng-content />`,
})
export class AtmKbd {}

/** Themed link. */
@Component({
  selector: 'atm-link',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      [href]="href()"
      [target]="external() ? '_blank' : null"
      [rel]="external() ? 'noopener noreferrer' : null"
      class="atm-focus inline-flex items-center gap-1 rounded font-medium text-primary
        underline-offset-4 transition-colors hover:text-primary-hover hover:underline"
    >
      <ng-content />
      @if (external()) {
        <i class="atm atm-link-square-01 text-xs" aria-hidden="true"></i>
      }
    </a>
  `,
})
export class AtmLink {
  readonly href = input('#');
  readonly external = input(false);
}

/** Scroll container with gradient shadows hinting overflow. */
@Component({
  selector: 'atm-scroll-shadow',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'relative block overflow-hidden' },
  template: `
    <div
      class="max-h-[inherit] overflow-y-auto
        [mask-image:linear-gradient(to_bottom,transparent,black_16px,black_calc(100%-16px),transparent)]"
      [style.max-height]="maxHeight()"
    >
      <ng-content />
    </div>
  `,
})
export class AtmScrollShadow {
  readonly maxHeight = input('16rem');
}

/** Typography helper for consistent headings/body.

## Identity

- **Class**: `AtmTypography`
- **Selector**: `atm-typography`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `variant` | 'h1' \| 'h2' \| 'h3' \| 'h4' \| 'body' \| 'small' \| 'muted' \| 'code' | no | 'body' |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Content projection

- `default`

## Usage example

```html
<atm-typography variant="title">Título</atm-typography>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
