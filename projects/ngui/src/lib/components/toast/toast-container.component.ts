import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AtmToastService, AtmToast } from '../../services/toast.service';

const STYLES: Record<string, { bar: string; icon: string; iconColor: string }> = {
  success: { bar: 'bg-success', icon: 'atm atm-checkmark-circle-01', iconColor: 'text-success' },
  danger: { bar: 'bg-danger', icon: 'atm atm-cancel-circle', iconColor: 'text-danger' },
  warning: { bar: 'bg-warning', icon: 'atm atm-alert-circle', iconColor: 'text-warning' },
  info: { bar: 'bg-info', icon: 'atm atm-information-circle', iconColor: 'text-info' },
  primary: { bar: 'bg-primary', icon: 'atm atm-information-circle', iconColor: 'text-primary' },
  neutral: { bar: 'bg-ink-muted', icon: 'atm atm-information-circle', iconColor: 'text-ink-muted' },
};

/** Render once at app root: <atm-toast-container /> */
@Component({
  selector: 'atm-toast-container',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="pointer-events-none fixed top-4 right-4 z-[80] flex w-full max-w-sm flex-col gap-2">
      @for (toast of service.toasts(); track toast.id) {
        <div
          class="atm-panel pointer-events-auto relative overflow-hidden transition-all duration-200"
          [class]="toast.leaving ? 'translate-x-4 opacity-0' : 'animate-atm-slide-up'"
          role="status"
          (mouseenter)="onHover(toast, true)"
          (mouseleave)="onHover(toast, false)"
        >
          <!-- Header -->
          <div class="flex items-center gap-3 px-4 py-3">
            <i
              [class]="styleOf(toast).icon + ' ' + styleOf(toast).iconColor"
              class="shrink-0 text-xl"
              aria-hidden="true"
            ></i>
            <p class="min-w-0 flex-1 text-sm font-semibold text-ink">{{ toast.summary }}</p>
            @if (isExpandable(toast)) {
              <button
                type="button"
                class="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md
                  text-ink-faint transition-colors hover:bg-surface-alt hover:text-ink"
                [attr.aria-label]="toast.expanded ? 'Recolher' : 'Expandir'"
                [attr.aria-expanded]="toast.expanded"
                (click)="service.toggleExpanded(toast.id)"
              >
                <i
                  class="atm atm-chevron-down text-xs transition-transform duration-200"
                  [class.rotate-180]="toast.expanded"
                  aria-hidden="true"
                ></i>
              </button>
            }
            <button
              type="button"
              class="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md
                text-ink-faint transition-colors hover:bg-surface-alt hover:text-ink"
              aria-label="Fechar"
              (click)="service.dismiss(toast.id)"
            >
              <i class="atm atm-cancel-01 text-xs" aria-hidden="true"></i>
            </button>
          </div>

          <!-- Corpo colapsável: detail + action -->
          @if (isExpandable(toast)) {
            <div
              class="grid transition-[grid-template-rows] duration-200 ease-out"
              [class]="toast.expanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
            >
              <div class="overflow-hidden">
                <div class="flex flex-col items-start gap-3 px-4 pb-4 pl-12">
                  @if (toast.detail) {
                    <p class="text-sm leading-relaxed text-ink-muted">{{ toast.detail }}</p>
                  }
                  @if (toast.action; as action) {
                    <button
                      type="button"
                      class="atm-focus h-8 cursor-pointer rounded-lg border border-line-strong px-3
                        text-xs font-medium text-ink transition-colors hover:bg-surface-alt"
                      (click)="runAction(toast)"
                    >
                      {{ action.label }}
                    </button>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Rodapé de countdown -->
          @if (hasTimer(toast)) {
            <button
              type="button"
              class="w-full cursor-pointer bg-surface-alt px-4 py-2 text-left text-xs
                text-ink-muted transition-colors hover:bg-line/40"
              (click)="service.stopTimer(toast.id)"
            >
              Esta mensagem fecha em
              <b class="font-semibold text-ink">{{ secondsLeft(toast) }}</b>
              {{ secondsLeft(toast) === 1 ? 'segundo' : 'segundos' }}.
              <b class="font-semibold text-ink">Clique para parar.</b>
            </button>
          }

          <!-- Barra de progresso -->
          @if (hasTimer(toast)) {
            <span
              class="absolute bottom-0 left-0 h-1 rounded-r-full transition-[width] duration-100 ease-linear"
              [class]="styleOf(toast).bar"
              [style.width.%]="progressOf(toast)"
              aria-hidden="true"
            ></span>
          }
        </div>
      }
    </div>
  `,
})
export class AtmToastContainer {
  readonly service = inject(AtmToastService);

  styleOf(toast: AtmToast) {
    return STYLES[toast.severity] ?? STYLES['info'];
  }

  isExpandable(toast: AtmToast): boolean {
    return !!toast.detail || !!toast.action;
  }

  hasTimer(toast: AtmToast): boolean {
    return toast.life > 0 && toast.showTimer && !toast.stopped;
  }

  secondsLeft(toast: AtmToast): number {
    return Math.max(1, Math.ceil(toast.remaining / 1000));
  }

  progressOf(toast: AtmToast): number {
    return toast.life > 0 ? (toast.remaining / toast.life) * 100 : 0;
  }

  onHover(toast: AtmToast, hovering: boolean): void {
    if (toast.life <= 0 || toast.stopped) return;
    if (hovering) this.service.pause(toast.id);
    else this.service.resume(toast.id);
  }

  runAction(toast: AtmToast): void {
    toast.action?.onClick?.();
    if (toast.action?.closeOnClick !== false) this.service.dismiss(toast.id);
  }
}
