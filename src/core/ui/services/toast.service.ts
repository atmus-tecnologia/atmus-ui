import { Injectable, signal } from '@angular/core';
import { AtmColor } from '../types';

export interface AtmToastAction {
  label: string;
  onClick?: () => void;
  /** Fecha o toast após executar a ação (default: true). */
  closeOnClick?: boolean;
}

export interface AtmToast {
  id: number;
  severity: AtmColor;
  summary: string;
  /** Conteúdo extra exibido no corpo colapsável. */
  detail?: string;
  /** Tempo de auto-close em ms. 0 = não fecha sozinho. */
  life: number;
  /** Exibe rodapé de contagem regressiva + barra de progresso. */
  showTimer: boolean;
  /** Corpo colapsável começa aberto (default: true). */
  expanded: boolean;
  /** Botão de ação exibido no corpo do toast. */
  action?: AtmToastAction;
  // --- estado interno ---
  remaining: number;
  paused?: boolean;
  stopped?: boolean;
  leaving?: boolean;
}

export type AtmToastOptions = Partial<
  Omit<AtmToast, 'id' | 'remaining' | 'paused' | 'stopped' | 'leaving'>
> & { summary: string };

let toastId = 0;
const TICK_MS = 100;

/**
 * Toast notifications. Render <atm-toast-container /> once (e.g. in App) and:
 *   toast.success('Saved', 'Contact created successfully');
 *   toast.add({ severity: 'danger', summary: 'Error', detail: '...', showTimer: true });
 *   toast.add({ summary: 'Are you sure?', life: 0, action: { label: 'Okay', onClick: () => ... } });
 */
@Injectable({ providedIn: 'root' })
export class AtmToastService {
  readonly toasts = signal<AtmToast[]>([]);

  private ticker: ReturnType<typeof setInterval> | null = null;

  add(toast: AtmToastOptions): number {
    const life = toast.life ?? 4000;
    const item: AtmToast = {
      id: ++toastId,
      severity: toast.severity ?? 'info',
      summary: toast.summary,
      detail: toast.detail,
      action: toast.action,
      life,
      remaining: life,
      showTimer: toast.showTimer ?? false,
      expanded: toast.expanded ?? true,
    };
    this.toasts.update((list) => [...list, item]);
    if (life > 0) this.ensureTicker();
    return item.id;
  }

  success(summary: string, detail?: string, options?: Partial<AtmToastOptions>): number {
    return this.add({ ...options, severity: 'success', summary, detail });
  }
  error(summary: string, detail?: string, options?: Partial<AtmToastOptions>): number {
    return this.add({ ...options, severity: 'danger', summary, detail });
  }
  warning(summary: string, detail?: string, options?: Partial<AtmToastOptions>): number {
    return this.add({ ...options, severity: 'warning', summary, detail });
  }
  info(summary: string, detail?: string, options?: Partial<AtmToastOptions>): number {
    return this.add({ ...options, severity: 'info', summary, detail });
  }

  dismiss(id: number): void {
    // Mark as leaving for exit animation, then remove
    this.patch(id, { leaving: true });
    setTimeout(() => this.toasts.update((list) => list.filter((t) => t.id !== id)), 200);
  }

  /** "Clique para parar": cancela o auto-close definitivamente. */
  stopTimer(id: number): void {
    this.patch(id, { stopped: true });
  }

  /** Pausa a contagem (ex.: hover). */
  pause(id: number): void {
    this.patch(id, { paused: true });
  }

  /** Retoma a contagem após pause(). */
  resume(id: number): void {
    this.patch(id, { paused: false });
    this.ensureTicker();
  }

  toggleExpanded(id: number): void {
    this.toasts.update((list) =>
      list.map((t) => (t.id === id ? { ...t, expanded: !t.expanded } : t)),
    );
  }

  private patch(id: number, patch: Partial<AtmToast>): void {
    this.toasts.update((list) => list.map((t) => (t.id === id ? { ...t, ...patch } : t)));
  }

  private ensureTicker(): void {
    if (this.ticker) return;
    this.ticker = setInterval(() => this.tick(), TICK_MS);
  }

  private tick(): void {
    const expired: number[] = [];
    this.toasts.update((list) =>
      list.map((t) => {
        if (t.life <= 0 || t.paused || t.stopped || t.leaving) return t;
        const remaining = t.remaining - TICK_MS;
        if (remaining <= 0) expired.push(t.id);
        return { ...t, remaining: Math.max(0, remaining) };
      }),
    );
    for (const id of expired) this.dismiss(id);

    const hasActive = this.toasts().some(
      (t) => t.life > 0 && !t.paused && !t.stopped && !t.leaving,
    );
    if (!hasActive && this.ticker) {
      clearInterval(this.ticker);
      this.ticker = null;
    }
  }
}
