import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { AtmSize } from '../../types';
import { AtmValueAccessor } from '../../utils/value-accessor';

interface Point {
  x: number;
  y: number;
}

/** Signature capture mode. */
export type AtmSignatureMode = 'draw' | 'type';

const BOX_H: Record<AtmSize, string> = { large: 'h-44', medium: 'h-36', slim: 'h-28' };
const TYPED_TEXT: Record<AtmSize, string> = { large: 'text-4xl', medium: 'text-3xl', slim: 'text-2xl' };
const SCRIPT_FONT = `'Segoe Script', 'Bradley Hand', 'Brush Script MT', cursive`;

/**
 * Signature pad integrated with Angular forms (ngModel / formControl).
 * The form value is a transparent PNG data URL (or `null` when empty).
 *
 * Two capture modes: free-hand drawing on canvas (with stroke smoothing and
 * retina-aware rendering) and typed signature rendered in a script font.
 * Switching modes clears the current signature.
 *
 *   <atm-signature [(ngModel)]="signature" />
 *   <atm-signature formControlName="signature" [invalid]="isInvalid('signature')" />
 */
@Component({
  selector: 'atm-signature',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmSignature), multi: true },
  ],
  host: { class: 'block w-full' },
  template: `
    <div class="flex w-full flex-col gap-2">
      <!-- Signature box -->
      <div
        class="atm-field relative overflow-hidden"
        [class]="boxClasses()"
        [class.atm-field--invalid]="invalid()"
        [class.atm-field--disabled]="isDisabled()"
      >
        @if (mode() === 'draw') {
          <canvas
            #canvas
            role="img"
            [attr.aria-label]="placeholder()"
            class="block h-full w-full touch-none"
            [class.cursor-crosshair]="!isDisabled()"
            (pointerdown)="onPointerDown($event)"
            (pointermove)="onPointerMove($event)"
            (pointerup)="onPointerUp($event)"
            (pointercancel)="onPointerUp($event)"
          ></canvas>

          @if (!hasDrawing() && !isDrawing()) {
            <span
              class="pointer-events-none absolute inset-0 flex items-center justify-center
                text-sm font-semibold tracking-[0.35em] text-ink-faint/70 uppercase select-none"
            >
              {{ placeholder() }}
            </span>
          }
        } @else {
          <input
            type="text"
            class="h-full w-full bg-transparent px-4 text-center outline-none
              placeholder:text-sm placeholder:font-semibold placeholder:tracking-[0.35em]
              placeholder:text-ink-faint/70 placeholder:uppercase
              disabled:cursor-not-allowed"
            [class]="typedClasses()"
            [style.font-family]="scriptFont"
            [style.color]="inkColor()"
            [placeholder]="typedPlaceholder()"
            [disabled]="isDisabled()"
            [value]="typedText()"
            (input)="onTypedInput($event)"
            (blur)="onTouched()"
          />
        }

        <!-- Clear -->
        @if (canClear()) {
          <button
            type="button"
            class="atm-focus absolute top-1.5 right-1.5 flex size-7 cursor-pointer items-center
              justify-center rounded-md text-ink-faint transition-colors
              hover:bg-surface-alt hover:text-ink"
            aria-label="Limpar assinatura"
            (click)="clear()"
          >
            <i class="icofont-eraser" aria-hidden="true"></i>
          </button>
        }
      </div>

      <!-- Mode toggle -->
      @if (allowTyped()) {
        <div class="flex rounded-atm bg-surface-alt p-0.5" role="tablist" aria-label="Modo de assinatura">
          @for (m of modeOptions; track m.mode) {
            <button
              type="button"
              role="tab"
              class="atm-focus h-8 flex-1 cursor-pointer rounded-[calc(var(--atm-radius)-3px)]
                text-xs font-semibold transition-colors disabled:cursor-not-allowed
                disabled:opacity-60"
              [attr.aria-selected]="mode() === m.mode"
              [class]="
                mode() === m.mode ? 'bg-surface text-ink shadow-atm' : 'text-ink-muted hover:text-ink'
              "
              [disabled]="isDisabled()"
              (click)="setMode(m.mode)"
            >
              {{ m.label }}
            </button>
          }
        </div>
      }
    </div>
  `,
})
export class AtmSignature extends AtmValueAccessor<string> {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly size = input<AtmSize>('medium');
  readonly disabled = input(false);
  readonly invalid = input(false);
  /** Watermark shown inside the empty drawing area. */
  readonly placeholder = input('Assine aqui');
  /** Placeholder of the typed-signature input. */
  readonly typedPlaceholder = input('Digite sua assinatura');
  /** Allows the "type signature" mode (shows the mode toggle). */
  readonly allowTyped = input(true);
  /** Stroke/text color. Defaults to the primary theme token. */
  readonly penColor = input<string | null>(null);
  /** Stroke width in px. */
  readonly penWidth = input(2.2);

  /** Emits the PNG data URL (or null) whenever the signature changes. */
  readonly changed = output<string | null>();

  readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());
  readonly mode = signal<AtmSignatureMode>('draw');
  readonly typedText = signal('');
  /** True while the pointer is down drawing a stroke. */
  readonly isDrawing = signal(false);

  readonly scriptFont = SCRIPT_FONT;
  readonly modeOptions: { mode: AtmSignatureMode; label: string }[] = [
    { mode: 'draw', label: 'Desenhar assinatura' },
    { mode: 'type', label: 'Digitar assinatura' },
  ];

  private readonly canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  /** Strokes in coordinates normalized to 0..1 (survive box resizes). */
  private strokes: Point[][] = [];
  private currentStroke: Point[] | null = null;
  private readonly strokeCount = signal(0);
  /** Image loaded from an external writeValue (e.g. saved signature). */
  private readonly bgImage = signal<HTMLImageElement | null>(null);

  private ctx: CanvasRenderingContext2D | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private resizeRaf = 0;
  private last: Point | null = null;
  private lastMid: Point | null = null;

  readonly hasDrawing = computed(() => this.strokeCount() > 0 || this.bgImage() !== null);
  readonly canClear = computed(
    () =>
      !this.isDisabled() &&
      (this.mode() === 'draw' ? this.hasDrawing() : this.typedText().length > 0),
  );

  readonly boxClasses = computed(() => BOX_H[this.size()]);
  readonly typedClasses = computed(() => TYPED_TEXT[this.size()]);
  readonly inkColor = computed(() => this.penColor() ?? 'var(--atm-primary)');

  constructor() {
    super();

    // (Re)binds the canvas whenever it enters/leaves the DOM (mode switch).
    effect(() => {
      const canvas = this.canvasRef()?.nativeElement ?? null;
      this.teardownCanvas();
      if (!canvas) return;
      this.ctx = canvas.getContext('2d');
      this.resizeObserver = new ResizeObserver(() => {
        cancelAnimationFrame(this.resizeRaf);
        this.resizeRaf = requestAnimationFrame(() => this.fitCanvas(canvas));
      });
      this.resizeObserver.observe(canvas);
      this.fitCanvas(canvas);
    });

    // Redraws when the saved image finishes loading.
    effect(() => {
      this.bgImage();
      this.redraw();
    });

    this.destroyRef.onDestroy(() => this.teardownCanvas());
  }

  // ── ControlValueAccessor ────────────────────────────────────────────────

  override writeValue(value: string | null): void {
    super.writeValue(value);
    this.strokes = [];
    this.strokeCount.set(0);
    this.typedText.set('');
    if (value) {
      // A saved signature is displayed as an image on the drawing canvas.
      this.mode.set('draw');
      const img = new Image();
      img.onload = () => this.bgImage.set(img);
      img.src = value;
    } else {
      this.bgImage.set(null);
      this.redraw();
    }
  }

  // ── Modes ───────────────────────────────────────────────────────────────

  setMode(mode: AtmSignatureMode): void {
    if (mode === this.mode() || this.isDisabled()) return;
    this.mode.set(mode);
    this.resetState();
    if (this.value() !== null) this.emitValue(null);
  }

  /** Clears the signature and resets the form value to null. */
  clear(): void {
    this.resetState();
    this.redraw();
    if (this.value() !== null) this.emitValue(null);
    this.onTouched();
  }

  // ── Drawing ─────────────────────────────────────────────────────────────

  onPointerDown(event: PointerEvent): void {
    if (this.isDisabled() || !this.ctx) return;
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    const p = this.toCanvasPoint(event);
    this.last = p;
    this.lastMid = p;
    this.currentStroke = [this.normalize(p)];
    this.isDrawing.set(true);
    // Draws a dot so a simple tap leaves a mark.
    const ctx = this.ctx;
    ctx.fillStyle = this.resolvePen();
    ctx.beginPath();
    ctx.arc(p.x, p.y, this.penWidth() / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.currentStroke || !this.ctx || !this.last || !this.lastMid) return;
    const p = this.toCanvasPoint(event);
    const mid = { x: (this.last.x + p.x) / 2, y: (this.last.y + p.y) / 2 };
    const ctx = this.ctx;
    ctx.strokeStyle = this.resolvePen();
    ctx.lineWidth = this.penWidth();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(this.lastMid.x, this.lastMid.y);
    ctx.quadraticCurveTo(this.last.x, this.last.y, mid.x, mid.y);
    ctx.stroke();
    this.lastMid = mid;
    this.last = p;
    this.currentStroke.push(this.normalize(p));
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.currentStroke) return;
    (event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId);
    this.strokes.push(this.currentStroke);
    this.strokeCount.set(this.strokes.length);
    this.currentStroke = null;
    this.last = null;
    this.lastMid = null;
    this.isDrawing.set(false);
    this.commitDrawing();
    this.onTouched();
  }

  // ── Typed signature ─────────────────────────────────────────────────────

  onTypedInput(event: Event): void {
    const text = (event.target as HTMLInputElement).value;
    this.typedText.set(text);
    this.emitValue(text.trim() ? this.renderTypedSignature(text.trim()) : null);
  }

  // ── Export helpers ──────────────────────────────────────────────────────

  /** Current signature as a PNG data URL (null when empty). */
  toDataUrl(): string | null {
    return this.value();
  }

  /** Current signature as a Blob (null when empty). */
  toBlob(): Blob | null {
    const dataUrl = this.value();
    if (!dataUrl) return null;
    const [meta, base64] = dataUrl.split(',');
    const type = meta.match(/data:(.*?);/)?.[1] ?? 'image/png';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new Blob([bytes], { type });
  }

  /** Current signature as a File (null when empty). */
  toFile(name = 'assinatura.png'): File | null {
    const blob = this.toBlob();
    return blob ? new File([blob], name, { type: blob.type }) : null;
  }

  // ── Internals ───────────────────────────────────────────────────────────

  private resetState(): void {
    this.strokes = [];
    this.currentStroke = null;
    this.strokeCount.set(0);
    this.typedText.set('');
    this.bgImage.set(null);
  }

  private emitValue(value: string | null): void {
    this.setValue(value);
    this.changed.emit(value);
  }

  private commitDrawing(): void {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas) return;
    this.emitValue(this.hasDrawing() ? canvas.toDataURL('image/png') : null);
  }

  private resolvePen(): string {
    const custom = this.penColor();
    if (custom) return custom;
    const token = getComputedStyle(this.host.nativeElement).getPropertyValue('--atm-primary');
    return token.trim() || '#6366f1';
  }

  private toCanvasPoint(event: PointerEvent): Point {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  }

  private normalize(p: Point): Point {
    const canvas = this.canvasRef()?.nativeElement;
    if (!canvas || !canvas.clientWidth || !canvas.clientHeight) return p;
    return { x: p.x / canvas.clientWidth, y: p.y / canvas.clientHeight };
  }

  /** Resizes the backing store to the CSS size × devicePixelRatio and redraws. */
  private fitCanvas(canvas: HTMLCanvasElement): void {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h || !this.ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.redraw();
  }

  private redraw(): void {
    const canvas = this.canvasRef()?.nativeElement;
    const ctx = this.ctx;
    if (!canvas || !ctx) return;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // Saved signature image, contain-fit and centered.
    const img = this.bgImage();
    if (img) {
      const scale = Math.min(w / img.width, h / img.height, 1);
      const iw = img.width * scale;
      const ih = img.height * scale;
      ctx.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
    }

    // Re-plays every stroke from the normalized points.
    ctx.strokeStyle = this.resolvePen();
    ctx.fillStyle = ctx.strokeStyle;
    ctx.lineWidth = this.penWidth();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const stroke of this.strokes) {
      if (!stroke.length) continue;
      const pts = stroke.map((p) => ({ x: p.x * w, y: p.y * h }));
      if (pts.length === 1) {
        ctx.beginPath();
        ctx.arc(pts[0].x, pts[0].y, this.penWidth() / 2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length - 1; i++) {
        const mid = { x: (pts[i].x + pts[i + 1].x) / 2, y: (pts[i].y + pts[i + 1].y) / 2 };
        ctx.quadraticCurveTo(pts[i].x, pts[i].y, mid.x, mid.y);
      }
      ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
      ctx.stroke();
    }
  }

  /** Renders the typed text on an offscreen canvas and returns the data URL. */
  private renderTypedSignature(text: string): string {
    const box = this.host.nativeElement;
    const w = Math.max(box.clientWidth, 320) * 2;
    const h = 320;
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = this.resolvePen();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Shrinks the font until the text fits with some breathing room.
    let fontSize = h * 0.5;
    do {
      ctx.font = `${fontSize}px ${SCRIPT_FONT}`;
      if (ctx.measureText(text).width <= w - 80) break;
      fontSize -= 4;
    } while (fontSize > 16);
    ctx.fillText(text, w / 2, h / 2);
    return canvas.toDataURL('image/png');
  }

  private teardownCanvas(): void {
    cancelAnimationFrame(this.resizeRaf);
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.ctx = null;
    this.currentStroke = null;
    this.last = null;
    this.lastMid = null;
  }
}
