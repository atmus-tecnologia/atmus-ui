import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  forwardRef,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { ATM_SIZE_HEIGHT, ATM_SIZE_PX, ATM_SIZE_TEXT, AtmSize } from '../../types';
import { AtmOverlayBase } from '../../utils/overlay-base';
import { AtmValueAccessor } from '../../utils/value-accessor';

const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const HUE_GRADIENT =
  'linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)';

const DEFAULT_PRESETS = [
  '#ef4444', '#f97316', '#f59e0b', '#10b981', '#14b8a6',
  '#0ea5e9', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
];

interface Hsv {
  h: number; // 0..360
  s: number; // 0..1
  v: number; // 0..1
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}

function hsvToHex({ h, s, v }: Hsv): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  const to = (x: number) =>
    Math.round(x * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${to(f(5))}${to(f(3))}${to(f(1))}`;
}

function hexToHsv(hex: string): Hsv {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = 60 * (((g - b) / d) % 6);
    else if (max === g) h = 60 * ((b - r) / d + 2);
    else h = 60 * ((r - g) / d + 4);
  }
  if (h < 0) h += 360;
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

/** Static color square with checkerboard for transparency. */
@Component({
  selector: 'atm-color-swatch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  template: `
    <span
      [class]="sizeClass()"
      class="inline-block rounded-md border border-line shadow-sm"
      [style.background]="color()"
      [attr.title]="color()"
    ></span>
  `,
})
export class AtmColorSwatch {
  readonly color = input('#000000');
  readonly size = input<AtmSize>('medium');
  readonly sizeClass = computed(
    () => ({ large: 'size-8', medium: 'size-6', slim: 'size-4' })[this.size()],
  );
}

/** Grid of selectable swatches. Value = hex string. */
@Component({
  selector: 'atm-color-swatch-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmColorSwatchPicker), multi: true },
  ],
  template: `
    <div class="flex flex-wrap gap-2" role="radiogroup">
      @for (color of colors(); track color) {
        <button
          type="button"
          class="atm-focus size-7 cursor-pointer rounded-lg border border-black/10 shadow-sm
            transition-transform duration-100 hover:scale-110 active:scale-95"
          [class.ring-2]="value() === color"
          [class.ring-primary]="value() === color"
          [class.ring-offset-2]="value() === color"
          [class.ring-offset-surface]="value() === color"
          [style.background]="color"
          role="radio"
          [attr.aria-checked]="value() === color"
          [attr.aria-label]="color"
          (click)="pick(color)"
        ></button>
      }
    </div>
  `,
})
export class AtmColorSwatchPicker extends AtmValueAccessor<string> {
  readonly colors = input<string[]>(DEFAULT_PRESETS);

  readonly picked = output<string>();

  pick(color: string): void {
    this.setValue(color);
    this.picked.emit(color);
    this.onTouched();
  }
}

/**
 * Hex field + custom popup picker (alias atm-color-picker): preset
 * recommendations, saturation/value area and hue slider — no native input.
 */
@Component({
  selector: 'atm-color-field, atm-color-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmColorField), multi: true },
  ],
  host: { class: 'block w-full' },
  template: `
    <div #trigger [class]="wrapperClasses()">
      <button
        type="button"
        class="atm-focus relative inline-flex shrink-0 cursor-pointer rounded-md
          disabled:cursor-not-allowed"
        [disabled]="isDisabled()"
        aria-haspopup="dialog"
        [attr.aria-expanded]="isOpen()"
        aria-label="Abrir seletor de cor"
        (click)="togglePicker()"
      >
        <span
          class="block size-6 rounded-md border border-line shadow-sm"
          [style.background]="value() ?? '#000000'"
        ></span>
      </button>
      <input
        type="text"
        class="h-full w-full min-w-0 bg-transparent font-mono uppercase outline-none
          placeholder:text-ink-faint disabled:cursor-not-allowed"
        placeholder="#000000"
        maxlength="7"
        [disabled]="isDisabled()"
        [value]="value() ?? ''"
        (input)="onText($event)"
        (blur)="touchedFn()"
      />
    </div>

    @if (isOpen()) {
      <div
        #panel
        [style]="panelStyle()"
        class="atm-panel animate-atm-pop z-50 flex w-64 flex-col gap-3 p-3"
        role="dialog"
        aria-label="Seletor de cor"
      >
        @if (presets().length) {
          <div class="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Cores sugeridas">
            @for (preset of presets(); track preset) {
              <button
                type="button"
                class="atm-focus size-4.5 cursor-pointer rounded-full border border-black/10 shadow-sm
                  transition-transform duration-100 hover:scale-110 active:scale-95"
                [class.ring-2]="value() === preset"
                [class.ring-primary]="value() === preset"
                [class.ring-offset-2]="value() === preset"
                [class.ring-offset-surface]="value() === preset"
                [style.background]="preset"
                role="radio"
                [attr.aria-checked]="value() === preset"
                [attr.aria-label]="preset"
                (click)="pickPreset(preset)"
              ></button>
            }
          </div>
        }

        <div
          #svArea
          class="atm-focus relative h-44 w-full touch-none cursor-crosshair overflow-hidden rounded-lg"
          [style.background]="svBackground()"
          role="slider"
          tabindex="0"
          aria-label="Saturação e brilho"
          [attr.aria-valuetext]="hexValue()"
          (pointerdown)="startDrag($event, 'sv')"
          (pointermove)="onDragMove($event, 'sv')"
          (keydown)="onSvKeydown($event)"
        >
          <div class="absolute inset-0" style="background: linear-gradient(to right, #fff, transparent)"></div>
          <div class="absolute inset-0" style="background: linear-gradient(to top, #000, transparent)"></div>
          <div
            class="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full
              border-2 border-white shadow-md ring-1 ring-black/20"
            [style.left.%]="hsv().s * 100"
            [style.top.%]="(1 - hsv().v) * 100"
            [style.background]="hexValue()"
          ></div>
        </div>

        <div>
          <div class="mb-1.5 flex items-center justify-between text-sm">
            <span class="font-medium text-ink">Hue</span>
            <span class="text-ink-muted">{{ hueDegrees() }}°</span>
          </div>
          <div
            #hueBar
            class="atm-focus relative h-3 w-full touch-none cursor-pointer rounded-full"
            [style.background]="hueGradient"
            role="slider"
            tabindex="0"
            aria-label="Matiz"
            aria-valuemin="0"
            aria-valuemax="360"
            [attr.aria-valuenow]="hueDegrees()"
            (pointerdown)="startDrag($event, 'hue')"
            (pointermove)="onDragMove($event, 'hue')"
            (keydown)="onHueKeydown($event)"
          >
            <div
              class="pointer-events-none absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2
                rounded-full border-2 border-white shadow-md ring-1 ring-black/20"
              [style.left.%]="(hsv().h / 360) * 100"
              [style.background]="hueOnlyColor()"
            ></div>
          </div>
        </div>

        <div class="flex items-center gap-2.5 rounded-lg bg-surface-alt px-2.5 py-2">
          <span
            class="block size-5 shrink-0 rounded-full border border-line shadow-sm"
            [style.background]="value() ?? '#000000'"
          ></span>
          <span class="font-mono text-sm uppercase text-ink">{{ value() ?? '—' }}</span>
        </div>
      </div>
    }
  `,
})
export class AtmColorField extends AtmOverlayBase implements ControlValueAccessor {
  readonly size = input<AtmSize>('medium');
  readonly disabled = input(false);
  readonly invalid = input(false);
  /** Recommended colors shown at the top of the popup. `[]` hides the row. */
  readonly presets = input<string[]>(DEFAULT_PRESETS);

  readonly triggerRef = viewChild<ElementRef<HTMLElement>>('trigger');
  readonly panelRef = viewChild<ElementRef<HTMLElement>>('panel');
  readonly svAreaRef = viewChild<ElementRef<HTMLElement>>('svArea');
  readonly hueBarRef = viewChild<ElementRef<HTMLElement>>('hueBar');

  protected readonly hueGradient = HUE_GRADIENT;

  readonly value = signal<string | null>(null);
  readonly disabledByForm = signal(false);
  /** Internal HSV state — source of truth while interacting with the popup. */
  readonly hsv = signal<Hsv>({ h: 217, s: 0.8, v: 0.75 });

  private valueChangeFn: (v: string | null) => void = () => {};
  touchedFn: () => void = () => {};

  constructor() {
    super();
    this.matchTriggerWidth = false;
  }

  writeValue(value: string | null): void {
    this.value.set(value);
    this.syncHsvFromValue();
  }
  registerOnChange(fn: (v: string | null) => void): void {
    this.valueChangeFn = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.touchedFn = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabledByForm.set(isDisabled);
  }

  readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());

  readonly hexValue = computed(() => hsvToHex(this.hsv()));
  readonly hueDegrees = computed(() => Math.round(this.hsv().h));
  readonly hueOnlyColor = computed(() => `hsl(${this.hsv().h}, 100%, 50%)`);
  readonly svBackground = computed(() => `hsl(${this.hsv().h}, 100%, 50%)`);

  readonly wrapperClasses = computed(() =>
    [
      'atm-field flex items-center gap-2.5',
      ATM_SIZE_HEIGHT[this.size()],
      ATM_SIZE_PX[this.size()],
      ATM_SIZE_TEXT[this.size()],
      this.invalid() ? 'atm-field--invalid' : '',
      this.isDisabled() ? 'atm-field--disabled' : '',
    ].join(' '),
  );

  protected getTriggerEl(): HTMLElement | null {
    return this.triggerRef()?.nativeElement ?? null;
  }
  protected getPanelEl(): HTMLElement | null {
    return this.panelRef()?.nativeElement ?? null;
  }

  togglePicker(): void {
    if (this.isDisabled()) return;
    if (!this.isOpen()) this.syncHsvFromValue();
    this.toggle();
  }

  protected override onClosed(): void {
    this.touchedFn();
  }

  pickPreset(color: string): void {
    this.value.set(color);
    this.valueChangeFn(color);
    this.syncHsvFromValue();
  }

  onText(event: Event): void {
    const raw = (event.target as HTMLInputElement).value.trim();
    if (HEX_RE.test(raw) || raw === '') {
      this.value.set(raw || null);
      this.valueChangeFn(raw || null);
      this.syncHsvFromValue();
    }
  }

  // --- popup interaction -------------------------------------------------

  startDrag(event: PointerEvent, kind: 'sv' | 'hue'): void {
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.applyPointer(event, kind);
  }

  onDragMove(event: PointerEvent, kind: 'sv' | 'hue'): void {
    if (event.buttons & 1) this.applyPointer(event, kind);
  }

  private applyPointer(event: PointerEvent, kind: 'sv' | 'hue'): void {
    const el = kind === 'sv' ? this.svAreaRef()?.nativeElement : this.hueBarRef()?.nativeElement;
    if (!el) return;
    event.preventDefault();
    const rect = el.getBoundingClientRect();
    if (kind === 'sv') {
      const s = clamp01((event.clientX - rect.left) / rect.width);
      const v = 1 - clamp01((event.clientY - rect.top) / rect.height);
      this.hsv.update((c) => ({ ...c, s, v }));
    } else {
      const h = clamp01((event.clientX - rect.left) / rect.width) * 360;
      this.hsv.update((c) => ({ ...c, h }));
    }
    this.commitHsv();
  }

  onSvKeydown(event: KeyboardEvent): void {
    const step = event.shiftKey ? 0.1 : 0.02;
    const delta: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    const move = delta[event.key];
    if (!move) return;
    event.preventDefault();
    this.hsv.update((c) => ({ ...c, s: clamp01(c.s + move[0]), v: clamp01(c.v + move[1]) }));
    this.commitHsv();
  }

  onHueKeydown(event: KeyboardEvent): void {
    const step = event.shiftKey ? 10 : 2;
    const dir = event.key === 'ArrowLeft' ? -1 : event.key === 'ArrowRight' ? 1 : 0;
    if (!dir) return;
    event.preventDefault();
    this.hsv.update((c) => ({ ...c, h: Math.min(360, Math.max(0, c.h + dir * step)) }));
    this.commitHsv();
  }

  private commitHsv(): void {
    const hex = this.hexValue();
    this.value.set(hex);
    this.valueChangeFn(hex);
  }

  private syncHsvFromValue(): void {
    const v = this.value();
    if (v && HEX_RE.test(v)) {
      const next = hexToHsv(v);
      // Preserve hue when the color is achromatic (black/white/gray) so the
      // hue slider doesn't jump back to 0.
      this.hsv.update((c) => (next.s === 0 ? { ...next, h: c.h } : next));
    }
  }
}
