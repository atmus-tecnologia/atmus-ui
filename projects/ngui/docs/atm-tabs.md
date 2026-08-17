# atm-tabs

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/tabs/tabs.component.ts`

## Purpose

Abas com conteúdo projetado via atm-tab.

## Notes from source

Single tab. Content is lazy — only the active tab renders. */
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

/**Tabs:  <atm-tabs [(activeIndex)]="tab" variant="segmented">    <atm-tab label="General" icon="gear">...</atm-tab>  </atm-tabs>When the tab list exceeds the available width, scroll chevrons with fadingedges appear automatically (all variants). Arrow keys / Home / End navigate.

## Identity

- **Class**: `AtmTabs`
- **Selector**: `atm-tabs`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `size` | AtmSize | no | 'medium' |
| `variant` | 'line' \| 'pill' \| 'enclosed' \| 'segmented' | no | 'line' |

## Outputs

_Nenhum._
## Models (two-way)

| Name | Type | Default |
| --- | --- | --- |
| `activeIndex` | inferred | 0 |

## Usage example

```html
<atm-tabs [(value)]="tab">
  <atm-tab value="a" label="A">...</atm-tab>
</atm-tabs>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via icofont name or `<atm-icon name="..." />`
