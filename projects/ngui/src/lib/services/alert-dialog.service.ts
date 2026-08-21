import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  EnvironmentInjector,
  Injectable,
  createComponent,
  inject,
  signal,
} from '@angular/core';
import { AtmColor } from '../types';
import { AtmButton } from '../components/button/button.component';

export interface AtmAlertDialogOptions {
  title: string;
  message: string;
  icon?: string;
  color?: AtmColor;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Hide the cancel button (simple "OK" alert). */
  hideCancel?: boolean;
}

@Component({
  selector: 'atm-alert-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmButton],
  template: `
    <div class="fixed inset-0 z-[70] flex items-center justify-center p-4" role="alertdialog" aria-modal="true">
      <div class="animate-atm-fade absolute inset-0 bg-[var(--atm-overlay)] backdrop-blur-[2px]"></div>
      <div
        class="animate-atm-slide-up relative w-full max-w-md overflow-hidden rounded-atm-lg border
          border-line bg-surface p-6 shadow-atm-lg"
      >
        <button
          type="button"
          class="atm-focus absolute top-4 right-4 flex size-8 cursor-pointer items-center
            justify-center rounded-full bg-surface-alt text-ink-muted transition-colors
            hover:bg-line hover:text-ink"
          aria-label="Fechar"
          (click)="resolve(false)"
        >
          <i class="atm atm-cancel-01" aria-hidden="true"></i>
        </button>
        <div
          class="mb-4 flex size-11 items-center justify-center rounded-full"
          [class]="iconWrapClass()"
        >
          <i [class]="'text-xl atm atm-' + (options().icon ?? defaultIcon())" aria-hidden="true"></i>
        </div>
        <h2 class="text-lg font-semibold text-ink">{{ options().title }}</h2>
        <p class="mt-2 text-sm leading-relaxed text-ink-muted">{{ options().message }}</p>
        <div class="mt-6 flex justify-end gap-3">
          @if (!options().hideCancel) {
            <atm-button variant="soft" color="neutral" [rounded]="true" (clicked)="resolve(false)">
              {{ options().cancelLabel ?? 'Cancelar' }}
            </atm-button>
          }
          <atm-button [color]="options().color ?? 'primary'" [rounded]="true" (clicked)="resolve(true)">
            {{ options().confirmLabel ?? 'Confirmar' }}
          </atm-button>
        </div>
      </div>
    </div>
  `,
})
export class AtmAlertDialog {
  readonly options = signal<AtmAlertDialogOptions>({ title: '', message: '' });
  resolve: (confirmed: boolean) => void = () => {};

  defaultIcon(): string {
    const color = this.options().color ?? 'primary';
    return { danger: 'warning-alt', warning: 'warning', success: 'check-circled', info: 'info-circle', primary: 'question-circle', neutral: 'question-circle' }[color];
  }

  iconWrapClass(): string {
    const color = this.options().color ?? 'primary';
    return {
      primary: 'bg-primary-soft text-primary',
      success: 'bg-success-soft text-success',
      warning: 'bg-warning-soft text-warning',
      danger: 'bg-danger-soft text-danger',
      info: 'bg-info-soft text-info',
      neutral: 'bg-surface-alt text-ink-muted',
    }[color];
  }
}

/**
 * Confirmation / alert dialog:
 *   const ok = await this.alertDialog.confirm({
 *     title: 'Excluir contato', message: 'Essa ação não pode ser desfeita.', color: 'danger',
 *   });
 */
@Injectable({ providedIn: 'root' })
export class AtmAlertDialogService {
  private readonly appRef = inject(ApplicationRef);
  private readonly envInjector = inject(EnvironmentInjector);

  confirm(options: AtmAlertDialogOptions): Promise<boolean> {
    return new Promise((resolvePromise) => {
      const ref = createComponent(AtmAlertDialog, { environmentInjector: this.envInjector });
      ref.instance.options.set(options);
      ref.instance.resolve = (confirmed) => {
        this.appRef.detachView(ref.hostView);
        ref.destroy();
        document.removeEventListener('keydown', onKeydown);
        resolvePromise(confirmed);
      };
      const onKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') ref.instance.resolve(false);
      };
      document.addEventListener('keydown', onKeydown);
      this.appRef.attachView(ref.hostView);
      document.body.appendChild(ref.location.nativeElement);
    });
  }

  alert(options: Omit<AtmAlertDialogOptions, 'hideCancel'>): Promise<boolean> {
    return this.confirm({ ...options, hideCancel: true, confirmLabel: options.confirmLabel ?? 'OK' });
  }
}
