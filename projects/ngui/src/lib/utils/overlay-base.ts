import {
  ChangeDetectorRef,
  DestroyRef,
  Directive,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { AtmAlign, AtmPlacement, atmComputePosition } from './position';

/**
 * Base class for components that open a floating panel (`position: fixed`).
 * Handles: outside-click / Escape to close, viewport-aware positioning with
 * auto-flip, and repositioning on scroll / resize (passive listeners, run
 * outside Angular for performance).
 *
 * Subclasses must provide `triggerEl()` and `panelEl()` getters.
 */
@Directive()
export abstract class AtmOverlayBase implements OnDestroy {
  protected readonly host = inject(ElementRef<HTMLElement>);
  protected readonly zone = inject(NgZone);
  protected readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly isOpen = signal(false);
  readonly panelStyle = signal<Record<string, string>>({});
  readonly resolvedPlacement = signal<AtmPlacement>('bottom');

  protected placement: AtmPlacement = 'bottom';
  protected align: AtmAlign = 'start';
  protected matchTriggerWidth = true;

  private cleanupFns: Array<() => void> = [];

  protected abstract getTriggerEl(): HTMLElement | null;
  protected abstract getPanelEl(): HTMLElement | null;

  open(): void {
    if (this.isOpen()) return;
    // Park the panel off-flow before first paint to avoid a position flash.
    this.panelStyle.set({ position: 'fixed', top: '0px', left: '0px', visibility: 'hidden' });
    this.isOpen.set(true);
    // Render the panel synchronously so it can be measured right away
    // (works with zoneless change detection too).
    this.cdr.detectChanges();
    this.reposition();
    this.attachGlobalListeners();
  }

  close(): void {
    if (!this.isOpen()) return;
    this.isOpen.set(false);
    this.detachGlobalListeners();
    this.onClosed();
  }

  toggle(): void {
    this.isOpen() ? this.close() : this.open();
  }

  /** Hook for subclasses. */
  protected onClosed(): void {}

  protected reposition(): void {
    const trigger = this.getTriggerEl();
    const panel = this.getPanelEl();
    if (!trigger || !panel) return;

    const triggerRect = trigger.getBoundingClientRect();
    if (this.matchTriggerWidth) {
      panel.style.minWidth = `${triggerRect.width}px`;
    }
    const panelRect = panel.getBoundingClientRect();
    const result = atmComputePosition(
      triggerRect,
      { width: panelRect.width, height: panelRect.height },
      { placement: this.placement, align: this.align },
    );
    this.resolvedPlacement.set(result.placement);
    this.panelStyle.set({
      position: 'fixed',
      top: `${result.top}px`,
      left: `${result.left}px`,
      'max-height': `${result.maxHeight}px`,
      ...(this.matchTriggerWidth ? { 'min-width': `${triggerRect.width}px` } : {}),
    });
  }

  private attachGlobalListeners(): void {
    this.zone.runOutsideAngular(() => {
      const onPointerDown = (event: PointerEvent) => {
        const target = event.target as Node;
        if (!this.host.nativeElement.contains(target)) {
          this.zone.run(() => this.close());
        }
      };
      const onKeydown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') this.zone.run(() => this.close());
      };
      // `scroll` não borbulha, então é capturado na fase de captura do window
      // pra pegar rolagem de qualquer ancestral do trigger — mas isso também
      // pega rolagem *dentro* do próprio painel (uma lista interna com
      // overflow), onde o trigger não se moveu e reposicionar é só ruído
      // (e pode até piscar, se a largura calculada variar por causa da
      // scrollbar). Ignora quando o scroll nasce dentro do painel.
      const onScroll = (event: Event) => {
        const panel = this.getPanelEl();
        if (panel && event.target instanceof Node && panel.contains(event.target)) return;
        this.zone.run(() => this.reposition());
      };
      const onResize = () => this.zone.run(() => this.reposition());

      // Delay pointerdown registration so the opening click doesn't close it
      const timer = setTimeout(() => {
        document.addEventListener('pointerdown', onPointerDown, true);
      });
      document.addEventListener('keydown', onKeydown);
      window.addEventListener('scroll', onScroll, { passive: true, capture: true });
      window.addEventListener('resize', onResize, { passive: true });

      this.cleanupFns.push(() => {
        clearTimeout(timer);
        document.removeEventListener('pointerdown', onPointerDown, true);
        document.removeEventListener('keydown', onKeydown);
        window.removeEventListener('scroll', onScroll, true);
        window.removeEventListener('resize', onResize);
      });
    });
  }

  private detachGlobalListeners(): void {
    this.cleanupFns.forEach((fn) => fn());
    this.cleanupFns = [];
  }

  ngOnDestroy(): void {
    this.detachGlobalListeners();
  }
}
