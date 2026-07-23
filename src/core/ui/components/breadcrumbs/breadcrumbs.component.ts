import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface AtmBreadcrumb {
  label: string;
  link?: string | unknown[];
  icon?: string;
}

@Component({
  selector: 'atm-breadcrumbs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  template: `
    <nav aria-label="Breadcrumb">
      <ol class="flex flex-wrap items-center gap-1.5 text-sm">
        @for (item of items(); track item.label; let last = $last) {
          <li class="flex items-center gap-1.5">
            @if (item.link && !last) {
              <a
                [routerLink]="item.link"
                class="flex items-center gap-1 text-ink-muted transition-colors hover:text-primary"
              >
                @if (item.icon) {
                  <i [class]="'icofont-' + item.icon" aria-hidden="true"></i>
                }
                {{ item.label }}
              </a>
            } @else {
              <span
                class="flex items-center gap-1"
                [class]="last ? 'font-medium text-ink' : 'text-ink-muted'"
                [attr.aria-current]="last ? 'page' : null"
              >
                @if (item.icon) {
                  <i [class]="'icofont-' + item.icon" aria-hidden="true"></i>
                }
                {{ item.label }}
              </span>
            }
            @if (!last) {
              <i class="icofont-simple-right text-[10px] text-ink-faint" aria-hidden="true"></i>
            }
          </li>
        }
      </ol>
    </nav>
  `,
})
export class AtmBreadcrumbs {
  readonly items = input<AtmBreadcrumb[]>([]);
}
