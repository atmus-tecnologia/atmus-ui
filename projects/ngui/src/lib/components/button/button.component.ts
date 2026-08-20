import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { AtmColor, AtmSize, AtmVariant } from '../../types';
import { AtmIcon } from '../icon/icon.component';

// ** Abaixo de sm o alvo de toque sobe pro mínimo recomendado (44px iOS/48dp
// ** Android) — slim/medium eram fixos em 32/40px em qualquer viewport, abaixo
// ** do mínimo em ambas as plataformas. De sm pra cima volta à densidade
// ** original: telas grandes são operadas por mouse, o dedo não é o gargalo.
const SIZE_CLASSES: Record<AtmSize, string> = {
  large: 'h-12 px-5 text-base gap-2.5',
  medium: 'h-11 px-4 text-sm gap-2 sm:h-10',
  slim: 'h-10 px-3 text-xs gap-1.5 sm:h-8',
};

const ICON_ONLY_SIZE: Record<AtmSize, string> = {
  large: 'w-12 px-0',
  medium: 'w-11 px-0 sm:w-10',
  slim: 'w-10 px-0 sm:w-8',
};

const VARIANTS: Record<AtmVariant, Record<AtmColor, string>> = {
  solid: {
    primary:
      'bg-primary text-primary-contrast hover:bg-primary-hover active:bg-primary-active shadow-sm',
    success: 'bg-success text-white hover:brightness-105 active:brightness-95 shadow-sm',
    warning: 'bg-warning text-white hover:brightness-105 active:brightness-95 shadow-sm',
    danger: 'bg-danger text-white hover:brightness-105 active:brightness-95 shadow-sm',
    info: 'bg-info text-white hover:brightness-105 active:brightness-95 shadow-sm',
    neutral: 'bg-ink text-surface hover:opacity-90 active:opacity-80 shadow-sm',
  },
  soft: {
    primary: 'bg-primary-soft text-primary hover:brightness-97 dark:hover:brightness-125',
    success: 'bg-success-soft text-success hover:brightness-97 dark:hover:brightness-125',
    warning: 'bg-warning-soft text-warning hover:brightness-97 dark:hover:brightness-125',
    danger: 'bg-danger-soft text-danger hover:brightness-97 dark:hover:brightness-125',
    info: 'bg-info-soft text-info hover:brightness-97 dark:hover:brightness-125',
    neutral: 'bg-surface-alt text-ink hover:brightness-97 dark:hover:brightness-125',
  },
  outline: {
    primary: 'border border-primary/40 text-primary hover:bg-primary-soft',
    success: 'border border-success/40 text-success hover:bg-success-soft',
    warning: 'border border-warning/40 text-warning hover:bg-warning-soft',
    danger: 'border border-danger/40 text-danger hover:bg-danger-soft',
    info: 'border border-info/40 text-info hover:bg-info-soft',
    neutral: 'border border-line-strong text-ink hover:bg-surface-alt',
  },
  ghost: {
    primary: 'text-primary hover:bg-primary-soft',
    success: 'text-success hover:bg-success-soft',
    warning: 'text-warning hover:bg-warning-soft',
    danger: 'text-danger hover:bg-danger-soft',
    info: 'text-info hover:bg-info-soft',
    neutral: 'text-ink hover:bg-surface-alt',
  },
};

@Component({
  selector: 'atm-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmIcon],
  host: { '[class]': '"inline-flex " + (block() ? "w-full" : "")' },
  template: `
    <button
      [type]="type()"
      [class]="classes()"
      [disabled]="disabled() || loading()"
      (click)="clicked.emit($event)"
    >
      @if (loading()) {
        <!-- Spinner inherits the button text color via currentColor -->
        <svg [class]="spinnerClasses()" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" />
          <path
            d="M22 12a10 10 0 0 0-10-10"
            stroke="currentColor"
            stroke-width="3"
            stroke-linecap="round"
          />
        </svg>
      } @else if (icon()) {
        <atm-icon [name]="icon()!" />
      }
      <ng-content />
      @if (iconRight() && !loading()) {
        <atm-icon [name]="iconRight()!" />
      }
    </button>
  `,
})
export class AtmButton {
  readonly size = input<AtmSize>('medium');
  readonly color = input<AtmColor>('primary');
  readonly variant = input<AtmVariant>('solid');
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly icon = input<string | undefined>(undefined);
  readonly iconRight = input<string | undefined>(undefined);
  readonly loading = input(false);
  readonly disabled = input(false);
  readonly block = input(false);
  readonly rounded = input(false);
  /** Icon-only square button (hide label, keep aspect 1:1). */
  readonly iconOnly = input(false);

  readonly clicked = output<MouseEvent>();

  readonly spinnerClasses = computed(() => {
    const size = { large: 'size-5', medium: 'size-4', slim: 'size-3.5' }[this.size()];
    return `animate-spin ${size}`;
  });

  readonly classes = computed(() => {
    const parts = [
      'atm-focus inline-flex w-full cursor-pointer items-center justify-center font-medium select-none',
      'transition-[background-color,border-color,color,box-shadow,opacity,transform,filter] duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50',
      this.rounded() ? 'rounded-full' : 'rounded-atm',
      SIZE_CLASSES[this.size()],
      this.iconOnly() ? ICON_ONLY_SIZE[this.size()] : '',
      VARIANTS[this.variant()][this.color()],
    ];
    return parts.join(' ');
  });
}
