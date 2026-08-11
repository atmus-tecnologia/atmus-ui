import {
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  effect,
  input,
  model,
} from '@angular/core';

/** Single collapsible item — use inside atm-accordion or standalone as atm-disclosure. */
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
          <i [class]="'text-ink-muted icofont-' + icon()" aria-hidden="true"></i>
        }
        <span class="flex-1 text-sm font-medium text-ink">{{ header() }}</span>
        <i
          class="icofont-simple-down text-xs text-ink-faint transition-transform duration-300"
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
 * Accordion (alias: atm-disclosure-group):
 *   <atm-accordion [multiple]="false">
 *     <atm-accordion-item header="...">...</atm-accordion-item>
 *   </atm-accordion>
 */
@Component({
  selector: 'atm-accordion, atm-disclosure-group',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'block divide-y divide-line rounded-atm-lg border border-line bg-surface px-4',
  },
  template: `<ng-content />`,
})
export class AtmAccordion {
  /** Allow multiple items expanded simultaneously. */
  readonly multiple = input(false);

  private readonly items = contentChildren(AtmAccordionItem);

  constructor() {
    effect(() => {
      for (const item of this.items()) {
        item._onToggle = (toggled) => {
          const isExpanding = !toggled.expanded();
          if (!this.multiple() && isExpanding) {
            for (const other of this.items()) {
              if (other !== toggled) other.expanded.set(false);
            }
          }
          toggled.expanded.set(isExpanding);
        };
      }
    });
  }
}
