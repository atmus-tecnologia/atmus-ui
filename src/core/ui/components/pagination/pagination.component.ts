import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { AtmSize } from '../../types';

const SIZE: Record<AtmSize, string> = {
  large: 'size-11 text-base',
  medium: 'size-9 text-sm',
  slim: 'size-7 text-xs',
};

@Component({
  selector: 'atm-pagination',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <nav class="flex items-center gap-1" aria-label="Paginação">
      <button
        type="button"
        [class]="btnClasses(false)"
        [disabled]="page() <= 1"
        aria-label="Página anterior"
        (click)="go(page() - 1)"
      >
        <i class="icofont-simple-left" aria-hidden="true"></i>
      </button>

      @for (item of pages(); track $index) {
        @if (item === '...') {
          <span class="px-1 text-ink-faint">…</span>
        } @else {
          <button
            type="button"
            [class]="btnClasses(item === page())"
            [attr.aria-current]="item === page() ? 'page' : null"
            (click)="go(+item)"
          >
            {{ item }}
          </button>
        }
      }

      <button
        type="button"
        [class]="btnClasses(false)"
        [disabled]="page() >= totalPages()"
        aria-label="Próxima página"
        (click)="go(page() + 1)"
      >
        <i class="icofont-simple-right" aria-hidden="true"></i>
      </button>
    </nav>
  `,
})
export class AtmPagination {
  readonly size = input<AtmSize>('medium');
  readonly page = model(1);
  readonly totalItems = input(0);
  readonly pageSize = input(10);
  /** Max numbered buttons shown. */
  readonly maxButtons = input(7);

  readonly pageChange = output<number>();

  readonly totalPages = computed(() =>
    Math.max(Math.ceil(this.totalItems() / this.pageSize()), 1),
  );

  readonly pages = computed<(number | '...')[]>(() => {
    const total = this.totalPages();
    const current = this.page();
    const max = this.maxButtons();
    if (total <= max) return Array.from({ length: total }, (_, i) => i + 1);

    const items: (number | '...')[] = [1];
    const windowSize = max - 2;
    let start = Math.max(current - Math.floor(windowSize / 2), 2);
    let end = start + windowSize - 1;
    if (end >= total) {
      end = total - 1;
      start = end - windowSize + 1;
    }
    if (start > 2) items.push('...');
    for (let i = start; i <= end; i++) items.push(i);
    if (end < total - 1) items.push('...');
    items.push(total);
    return items;
  });

  btnClasses(active: boolean): string {
    return (
      `atm-focus flex cursor-pointer items-center justify-center rounded-atm font-medium ` +
      `transition-all duration-150 disabled:pointer-events-none disabled:opacity-40 ${SIZE[this.size()]} ` +
      (active
        ? 'bg-primary text-primary-contrast shadow-sm'
        : 'text-ink-muted hover:bg-surface-alt hover:text-ink')
    );
  }

  go(page: number): void {
    const clamped = Math.min(Math.max(page, 1), this.totalPages());
    if (clamped === this.page()) return;
    this.page.set(clamped);
    this.pageChange.emit(clamped);
  }
}
