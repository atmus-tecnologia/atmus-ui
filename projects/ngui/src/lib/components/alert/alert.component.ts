import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { AtmColor } from '../../types';

const STYLES: Record<AtmColor, { icon: string; title: string; button: string; defaultIcon: string }> = {
  primary: {
    icon: 'text-primary',
    title: 'text-primary',
    button: 'bg-primary text-primary-contrast hover:bg-primary-hover active:bg-primary-active',
    defaultIcon: 'information-circle',
  },
  success: {
    icon: 'text-success',
    title: 'text-success',
    button: 'bg-success text-white hover:brightness-105 active:brightness-95',
    defaultIcon: 'checkmark-circle-01',
  },
  warning: {
    icon: 'text-warning',
    title: 'text-warning',
    button: 'bg-warning text-white hover:brightness-105 active:brightness-95',
    defaultIcon: 'alert-circle',
  },
  danger: {
    icon: 'text-danger',
    title: 'text-danger',
    button: 'bg-danger text-white hover:brightness-105 active:brightness-95',
    defaultIcon: 'cancel-circle',
  },
  info: {
    icon: 'text-info',
    title: 'text-info',
    button: 'bg-info text-white hover:brightness-105 active:brightness-95',
    defaultIcon: 'information-circle',
  },
  neutral: {
    icon: 'text-ink-muted',
    title: 'text-ink',
    button: 'bg-ink text-surface hover:opacity-90 active:opacity-80',
    defaultIcon: 'information-circle',
  },
};

@Component({
  selector: 'atm-alert',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // Remove the static title="" attribute so the browser doesn't show a native tooltip.
  host: { '[attr.title]': 'null' },
  template: `
    @if (visible()) {
      <div
        class="animate-atm-fade flex items-start gap-3.5 rounded-atm-lg border border-line bg-surface p-4 shadow-sm"
        role="alert"
      >
        @if (loading()) {
          <span
            [class]="style().icon"
            class="mt-0.5 inline-block size-4.5 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          ></span>
        } @else {
          <i [class]="iconClasses()" class="mt-0.5 shrink-0 text-lg leading-none" aria-hidden="true"></i>
        }

        <div class="min-w-0 flex-1 text-sm">
          @if (title()) {
            <p [class]="style().title" class="font-semibold">{{ title() }}</p>
          }
          <div class="text-ink-muted" [class.mt-1]="title()"><ng-content /></div>
        </div>

        @if (actionLabel()) {
          <button
            type="button"
            [class]="style().button"
            class="atm-focus h-8 shrink-0 cursor-pointer rounded-full px-4 text-sm font-medium shadow-sm transition"
            (click)="action.emit()"
          >
            {{ actionLabel() }}
          </button>
        }

        @if (dismissible()) {
          <button
            type="button"
            class="atm-focus flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface-alt text-ink-muted transition-colors hover:bg-line hover:text-ink"
            aria-label="Fechar"
            (click)="dismiss()"
          >
            <i class="atm atm-cancel-01 text-xs" aria-hidden="true"></i>
          </button>
        }
      </div>
    }
  `,
})
export class AtmAlert {
  readonly color = input<AtmColor>('info');
  readonly title = input<string | undefined>(undefined);
  readonly icon = input<string | undefined>(undefined);
  readonly dismissible = input(false);
  /** Label do botão de ação à direita (ex.: "Refresh", "Retry"). */
  readonly actionLabel = input<string | undefined>(undefined);
  /** Mostra um spinner no lugar do ícone (estado de processamento). */
  readonly loading = input(false);

  readonly dismissed = output<void>();
  readonly action = output<void>();

  readonly visible = signal(true);

  readonly style = computed(() => STYLES[this.color()]);
  readonly iconClasses = computed(
    () => `atm atm-${this.icon() ?? STYLES[this.color()].defaultIcon} ${STYLES[this.color()].icon}`,
  );

  dismiss(): void {
    this.visible.set(false);
    this.dismissed.emit();
  }
}
