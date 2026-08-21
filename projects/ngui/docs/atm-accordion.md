# atm-accordion

> Doc otimizada para LLMs. Fonte: `projects/ngui/src/lib/components/accordion/accordion.component.ts`

## Purpose

Accordion/disclosure group.

## Notes from source

Single collapsible item — use inside atm-accordion or standalone as atm-disclosure. */
@Component({
  selector: 'atm-accordion-item, atm-disclosure',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="overflow-hidden">
      <button
        type="button"
        class="atm-focus flex w-full cursor-pointer items-center gap-3 px-1 py-3.5 text-left
          transition-colors hover:text-primary"
        [attr.aria-expanded]="expanded()"
        (click)="toggle()"
      >
        @if (icon()) {
          <i [class]="'text-ink-muted atm atm-' + icon()" aria-hidden="true"></i>
        }
        <span class="flex-1 text-sm font-medium text-ink">{{ header() }}</span>
        <i
          class="atm atm-chevron-down text-xs text-ink-faint transition-transform duration-300"
          [class.rotate-180]="expanded()"
          aria-hidden="true"
        ></i>
      </button>
      <div
        class="grid transition-[grid-template-rows] duration-300 ease-out"
        [style.grid-template-rows]="expanded() ? '1fr' : '0fr'"
      >
        <div class="overflow-hidden">
          <div class="px-1 pb-4 text-sm leading-relaxed text-ink-muted">
            <ng-content />
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AtmAccordionItem {
  readonly header = input('');
  readonly icon = input<string | undefined>(undefined);
  readonly expanded = model(false);

  /** Set by the parent accordion for exclusive mode. */
  _onToggle: ((item: AtmAccordionItem) => void) | null = null;

  toggle(): void {
    if (this._onToggle) this._onToggle(this);
    else this.expanded.set(!this.expanded());
  }
}

/**
Accordion (alias: atm-disclosure-group):
  <atm-accordion [multiple]="false">
    <atm-accordion-item header="...">...</atm-accordion-item>
  </atm-accordion>

## Identity

- **Class**: `AtmAccordion`
- **Selector**: `atm-accordion`
- **Selector aliases**: `atm-accordion, atm-disclosure-group`
- **Kind**: Component

## Inputs

| Name | Type | Required | Default |
| --- | --- | --- | --- |
| `multiple` | boolean | no | false |

## Outputs

_Nenhum._
## Models (two-way)

_Nenhum._
## Content projection

- `default`

## Usage example

```html
<atm-accordion>
  <atm-accordion-item header="Item 1">Conteúdo</atm-accordion-item>
</atm-accordion>
```

## Conventions

- Sizes: `large | medium | slim` (when `size` input exists)
- Colors: `primary | success | warning | danger | info | neutral` (when `color` input exists)
- Variants: `solid | soft | outline | ghost` (when `variant` input exists)
- Prefer theme tokens (`bg-primary`, `text-ink`, etc.) — never hardcode palette colors
- Icons via Atmus Icons name or `<atm-icon name="..." />`
