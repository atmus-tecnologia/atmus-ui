import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Surface card:
 *   <atm-card header="Title" subheader="Description" [hoverable]="true">
 *     content
 *     <div footer>actions</div>
 *   </atm-card>
 */
@Component({
  selector: 'atm-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'hostClasses()' },
  template: `
    @if (header() || subheader()) {
      <div class="border-b border-line px-5 py-4">
        <h3 class="text-base font-semibold text-ink">{{ header() }}</h3>
        @if (subheader()) {
          <p class="mt-0.5 text-sm text-ink-muted">{{ subheader() }}</p>
        }
      </div>
    }
    <div [class]="padded() ? 'px-5 py-4' : ''"><ng-content /></div>
    <div class="empty:hidden border-t border-line px-5 py-3 empty:border-0 empty:p-0">
      <ng-content select="[footer]" />
    </div>
  `,
})
export class AtmCard {
  readonly header = input<string | undefined>(undefined);
  readonly subheader = input<string | undefined>(undefined);
  readonly padded = input(true);
  readonly hoverable = input(false);

  readonly hostClasses = computed(
    () =>
      'block overflow-hidden rounded-atm-lg border border-line bg-surface shadow-atm transition-all duration-200 ' +
      (this.hoverable() ? 'hover:-translate-y-0.5 hover:shadow-atm-lg cursor-pointer' : ''),
  );
}
