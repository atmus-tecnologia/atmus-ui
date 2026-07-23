import { DOCUMENT } from '@angular/common';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { ATMUS_UI_CONFIG } from '../config';

const STORAGE_KEY = 'atmus-theme';

@Injectable({ providedIn: 'root' })
export class AtmThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly config = inject(ATMUS_UI_CONFIG);

  /** Current mode. 'system' follows prefers-color-scheme. */
  readonly mode = signal<'light' | 'dark' | 'system'>(this.restore());

  private readonly systemDark = signal(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : false,
  );

  /** Resolved boolean — true when dark theme is active. */
  readonly isDark = computed(() =>
    this.mode() === 'system' ? this.systemDark() : this.mode() === 'dark',
  );

  constructor() {
    if (typeof window !== 'undefined') {
      window
        .matchMedia('(prefers-color-scheme: dark)')
        .addEventListener('change', (e) => this.systemDark.set(e.matches));
    }
    effect(() => {
      this.document.documentElement.classList.toggle('dark', this.isDark());
    });
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEY, this.mode());
      } catch {
        /* storage unavailable */
      }
    });
  }

  toggle(): void {
    this.mode.set(this.isDark() ? 'light' : 'dark');
  }

  set(mode: 'light' | 'dark' | 'system'): void {
    this.mode.set(mode);
  }

  private restore(): 'light' | 'dark' | 'system' {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    } catch {
      /* storage unavailable */
    }
    return this.config.theme ?? 'system';
  }
}
