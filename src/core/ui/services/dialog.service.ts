import {
  ApplicationRef,
  ChangeDetectionStrategy,
  Component,
  ComponentRef,
  EnvironmentInjector,
  Injectable,
  InjectionToken,
  Injector,
  Type,
  createComponent,
  inject,
  signal,
} from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface AtmDialogConfig<D = unknown> {
  header?: string;
  width?: string;
  /** Arbitrary data available in the child via inject(ATM_DIALOG_DATA). */
  data?: D;
  closable?: boolean;
  /** Shows the expand icon (maximize to 90% of viewport). */
  maximizable?: boolean;
  /** Close when clicking the backdrop. */
  dismissableMask?: boolean;
  baseZIndex?: number;
  contentStyle?: Record<string, string>;
}

/** Inject inside dynamically opened components to read config.data. */
export const ATM_DIALOG_DATA = new InjectionToken<unknown>('ATM_DIALOG_DATA');

/** Reference to a dynamically opened dialog. Inject it in the child to close with a result. */
export class AtmDialogRef<R = unknown> {
  private readonly closed$ = new Subject<R | undefined>();
  /** Emits once when the dialog is closed (with the optional result). */
  readonly onClose: Observable<R | undefined> = this.closed$.asObservable();

  /** Assigned by the service. */
  _dispose: () => void = () => {};

  close(result?: R): void {
    this.closed$.next(result);
    this.closed$.complete();
    this._dispose();
  }
}

@Component({
  selector: 'atm-dialog-shell',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 flex items-center justify-center p-4"
      [style.z-index]="config.baseZIndex ?? 60"
      role="dialog"
      aria-modal="true"
    >
      <div
        class="animate-atm-fade absolute inset-0 bg-[var(--atm-overlay)] backdrop-blur-[2px]"
        (click)="config.dismissableMask !== false && ref.close()"
      ></div>
      <div
        class="animate-atm-slide-up relative flex max-h-full flex-col overflow-hidden rounded-atm-lg
          border border-line bg-surface shadow-atm-lg transition-[width,height] duration-300"
        [style.width]="maximized() ? '90vw' : (config.width ?? '36rem')"
        [style.height]="maximized() ? '90vh' : null"
        [style.max-width]="maximized() ? '90vw' : 'calc(100vw - 2rem)'"
      >
        <div class="flex shrink-0 items-center gap-2 border-b border-line px-5 py-4">
          <h2 class="min-w-0 flex-1 truncate text-base font-semibold text-ink">
            {{ config.header }}
          </h2>
          @if (config.maximizable !== false) {
            <button
              type="button"
              class="atm-focus flex size-8 cursor-pointer items-center justify-center rounded-full
                text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink"
              [attr.aria-label]="maximized() ? 'Restaurar' : 'Expandir'"
              (click)="maximized.set(!maximized())"
            >
              <i
                [class]="maximized() ? 'icofont-collapse' : 'icofont-expand-alt'"
                class="text-sm"
                aria-hidden="true"
              ></i>
            </button>
          }
          @if (config.closable !== false) {
            <button
              type="button"
              class="atm-focus flex size-8 cursor-pointer items-center justify-center rounded-full
                bg-surface-alt text-ink-muted transition-colors hover:bg-line hover:text-ink"
              aria-label="Fechar"
              (click)="ref.close()"
            >
              <i class="icofont-close" aria-hidden="true"></i>
            </button>
          }
        </div>
        <div
          data-atm-outlet
          class="min-h-0 flex-1 overflow-auto px-5 py-4"
          [style]="config.contentStyle ?? null"
        ></div>
      </div>
    </div>
  `,
})
export class AtmDialogShell {
  config!: AtmDialogConfig;
  ref!: AtmDialogRef;
  readonly maximized = signal(false);
}

/**
 * Dynamic dialog service (PrimeNG-style):
 *
 *   private dialog = inject(AtmDialogService);
 *   this.ref = this.dialog.open(ProductList, { header: 'Select a Product', width: '50vw' });
 *   this.ref.onClose.subscribe(product => ...);
 *
 * Inside the child component:
 *   private ref = inject(AtmDialogRef);
 *   private data = inject(ATM_DIALOG_DATA);
 *   this.ref.close(selectedProduct);
 */
@Injectable({ providedIn: 'root' })
export class AtmDialogService {
  private readonly appRef = inject(ApplicationRef);
  private readonly envInjector = inject(EnvironmentInjector);

  open<R = unknown, D = unknown>(
    component: Type<unknown>,
    config: AtmDialogConfig<D> = {},
  ): AtmDialogRef<R> {
    const ref = new AtmDialogRef<R>();

    const injector = Injector.create({
      providers: [
        { provide: AtmDialogRef, useValue: ref },
        { provide: ATM_DIALOG_DATA, useValue: config.data ?? null },
      ],
      parent: this.envInjector,
    });

    // Shell
    const shellRef: ComponentRef<AtmDialogShell> = createComponent(AtmDialogShell, {
      environmentInjector: this.envInjector,
      elementInjector: injector,
    });
    shellRef.instance.config = config as AtmDialogConfig;
    shellRef.instance.ref = ref as AtmDialogRef;

    this.appRef.attachView(shellRef.hostView);
    document.body.appendChild(shellRef.location.nativeElement);
    shellRef.changeDetectorRef.detectChanges();

    // Child component inside the shell's outlet
    const contentHost = shellRef.location.nativeElement.querySelector(
      '[data-atm-outlet]',
    ) as HTMLElement;
    const childRef = createComponent(component, {
      environmentInjector: this.envInjector,
      elementInjector: injector,
    });
    this.appRef.attachView(childRef.hostView);
    contentHost.appendChild(childRef.location.nativeElement);
    childRef.changeDetectorRef.detectChanges();

    // Escape key
    const onKeydown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && config.closable !== false) ref.close();
    };
    document.addEventListener('keydown', onKeydown);

    ref._dispose = () => {
      document.removeEventListener('keydown', onKeydown);
      this.appRef.detachView(childRef.hostView);
      childRef.destroy();
      this.appRef.detachView(shellRef.hostView);
      shellRef.destroy();
    };

    return ref;
  }
}
