import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { AtmColor, AtmSize } from '../../types';

/** Visual styles of the audio intensity visualizer. */
export type AtmAudioVisualizerVariant = 'bars' | 'wave' | 'ring';

const CANVAS_HEIGHT: Record<AtmSize, number> = { large: 160, medium: 112, slim: 72 };
const BUTTON_SIZE: Record<AtmSize, string> = {
  large: 'size-12 text-lg',
  medium: 'size-10 text-base',
  slim: 'size-8 text-xs',
};
const TIME_TEXT: Record<AtmSize, string> = {
  large: 'text-sm',
  medium: 'text-xs',
  slim: 'text-[10px]',
};
const COLOR_VAR: Record<AtmColor, string> = {
  primary: '--atm-primary',
  success: '--atm-success',
  warning: '--atm-warning',
  danger: '--atm-danger',
  info: '--atm-info',
  neutral: '--atm-ink-muted',
};

/** Number of smoothed intensity buckets kept between frames. */
const BINS = 64;

/**
 * Audio intensity visualizer with three animated styles (bars, wave, ring).
 *
 * Sources:
 * - `src`    — audio URL (or blob URL). Renders a play/pause control + time.
 *              For remote URLs the server must allow CORS, otherwise the
 *              Web Audio analyser cannot read the samples.
 * - `stream` — live `MediaStream` (e.g. `getUserMedia`), great for recorders.
 *              Nothing is routed to the speakers (no feedback).
 *
 * While idle it renders a subtle breathing animation so the component
 * always looks alive.
 */
@Component({
  selector: 'atm-audio-visualizer',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full' },
  template: `
    <div class="flex w-full items-center gap-3">
      @if (hasControls()) {
        <button
          type="button"
          class="atm-focus flex shrink-0 cursor-pointer items-center justify-center rounded-full
            bg-primary text-primary-contrast shadow-atm transition-[transform,background-color]
            duration-150 hover:bg-primary-hover active:scale-90 disabled:cursor-not-allowed
            disabled:opacity-50"
          [class]="buttonClass()"
          [attr.aria-label]="isPlaying() ? 'Pausar' : 'Reproduzir'"
          (click)="toggle()"
        >
          <i
            [class]="isPlaying() ? 'icofont-ui-pause' : 'icofont-ui-play'"
            [class.translate-x-px]="!isPlaying()"
            aria-hidden="true"
          ></i>
        </button>
      }

      <canvas
        #canvas
        class="min-w-0 flex-1"
        [style.height.px]="heightPx()"
        role="img"
        [attr.aria-label]="ariaLabel()"
      ></canvas>

      @if (hasControls()) {
        <span
          class="shrink-0 font-mono tabular-nums text-ink-muted select-none"
          [class]="timeClass()"
        >
          {{ formatTime(currentTime()) }} / {{ formatTime(duration()) }}
        </span>
      }
    </div>
  `,
})
export class AtmAudioVisualizer {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly zone = inject(NgZone);
  private readonly destroyRef = inject(DestroyRef);

  /** Audio URL (http(s) or blob). Enables the built-in player controls. */
  readonly src = input<string | null>(null);
  /** Live stream (e.g. microphone). Takes precedence over `src` playback. */
  readonly stream = input<MediaStream | null>(null);
  /** Visual style: `bars`, `wave` (mirrored waves) or `ring` (radial). */
  readonly variant = input<AtmAudioVisualizerVariant>('bars');
  readonly size = input<AtmSize>('medium');
  readonly color = input<AtmColor>('primary');
  /** Hide the play button + time even when `src` is set. */
  readonly showControls = input(true);
  readonly loop = input(false);
  readonly ariaLabel = input('Visualização de intensidade de áudio');

  readonly ended = output<void>();

  readonly isPlaying = signal(false);
  readonly currentTime = signal(0);
  readonly duration = signal(0);

  readonly hasControls = computed(() => !!this.src() && this.showControls());
  readonly heightPx = computed(() => CANVAS_HEIGHT[this.size()]);
  readonly buttonClass = computed(() => BUTTON_SIZE[this.size()]);
  readonly timeClass = computed(() => TIME_TEXT[this.size()]);

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');

  // --- Web Audio graph (created lazily to respect autoplay policies) ---
  private readonly audioEl = new Audio();
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private elementSource: MediaElementAudioSourceNode | null = null;
  private streamSource: MediaStreamAudioSourceNode | null = null;
  private freqData = new Uint8Array(0);

  // --- Canvas / animation state ---
  private ctx2d: CanvasRenderingContext2D | null = null;
  private resizeObserver: ResizeObserver | null = null;
  private rafId = 0;
  private readonly levels = new Float32Array(BINS);

  constructor() {
    const audio = this.audioEl;
    audio.preload = 'metadata';
    // Allows the analyser to read samples from CORS-enabled remote files.
    audio.crossOrigin = 'anonymous';
    audio.addEventListener('timeupdate', () => this.currentTime.set(audio.currentTime));
    audio.addEventListener('durationchange', () => {
      if (isFinite(audio.duration)) this.duration.set(audio.duration);
    });
    audio.addEventListener('loadedmetadata', () => {
      // Chrome reports Infinity for MediaRecorder blobs — seek once to fix it.
      if (audio.duration === Infinity) {
        const restore = () => {
          audio.removeEventListener('timeupdate', restore);
          audio.currentTime = 0;
        };
        audio.addEventListener('timeupdate', restore);
        audio.currentTime = 1e7;
      }
    });
    audio.addEventListener('play', () => this.isPlaying.set(true));
    audio.addEventListener('pause', () => this.isPlaying.set(false));
    audio.addEventListener('ended', () => {
      this.isPlaying.set(false);
      this.ended.emit();
    });

    effect(() => {
      audio.loop = this.loop();
    });

    // React to src changes: reset playback state and (re)load.
    effect(() => {
      const src = this.src();
      audio.pause();
      this.currentTime.set(0);
      this.duration.set(0);
      if (src) {
        audio.src = src;
        audio.load();
      } else {
        audio.removeAttribute('src');
      }
    });

    // React to stream changes: pipe the live stream into the analyser.
    effect(() => {
      const stream = this.stream();
      this.streamSource?.disconnect();
      this.streamSource = null;
      if (!stream) return;
      audio.pause();
      const ctx = this.ensureGraph();
      void ctx.resume();
      this.streamSource = ctx.createMediaStreamSource(stream);
      this.streamSource.connect(this.analyser!);
    });

    afterNextRender(() => this.initCanvas());
    this.destroyRef.onDestroy(() => this.cleanup());
  }

  async play(): Promise<void> {
    if (!this.src()) return;
    const ctx = this.ensureGraph();
    if (!this.elementSource) {
      this.elementSource = ctx.createMediaElementSource(this.audioEl);
      this.elementSource.connect(this.analyser!);
      this.analyser!.connect(ctx.destination);
    }
    await ctx.resume();
    await this.audioEl.play().catch(() => {});
  }

  pause(): void {
    this.audioEl.pause();
  }

  toggle(): void {
    if (this.isPlaying()) this.pause();
    else void this.play();
  }

  formatTime(seconds: number): string {
    if (!isFinite(seconds) || seconds < 0) seconds = 0;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  // ------------------------------------------------------------------
  // Audio graph
  // ------------------------------------------------------------------

  private ensureGraph(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.72;
      this.freqData = new Uint8Array(this.analyser.frequencyBinCount);
    }
    return this.audioCtx;
  }

  // ------------------------------------------------------------------
  // Rendering
  // ------------------------------------------------------------------

  private initCanvas(): void {
    const canvas = this.canvasRef().nativeElement;
    this.ctx2d = canvas.getContext('2d');
    this.resizeObserver = new ResizeObserver(() => this.syncCanvasSize());
    this.resizeObserver.observe(canvas);
    this.syncCanvasSize();
    this.zone.runOutsideAngular(() => {
      const tick = (now: number) => {
        this.draw(now);
        this.rafId = requestAnimationFrame(tick);
      };
      this.rafId = requestAnimationFrame(tick);
    });
  }

  private syncCanvasSize(): void {
    const canvas = this.canvasRef().nativeElement;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(this.heightPx() * dpr));
  }

  private updateLevels(now: number): void {
    const target = new Float32Array(BINS);
    const analysing = (this.isPlaying() || !!this.stream()) && !!this.analyser;

    if (analysing) {
      this.analyser!.getByteFrequencyData(this.freqData as Uint8Array<ArrayBuffer>);
      // Keep the lower 80% of the spectrum — that's where music/voice lives.
      const usable = Math.max(BINS, Math.floor(this.freqData.length * 0.8));
      for (let i = 0; i < BINS; i++) {
        const start = Math.floor((i * usable) / BINS);
        const end = Math.max(start + 1, Math.floor(((i + 1) * usable) / BINS));
        let sum = 0;
        for (let j = start; j < end; j++) sum += this.freqData[j] ?? 0;
        target[i] = Math.pow(sum / (end - start) / 255, 0.8);
      }
    } else {
      // Idle: gentle breathing so the component looks alive.
      const t = now / 1000;
      for (let i = 0; i < BINS; i++) {
        target[i] =
          0.045 +
          0.035 * (1 + Math.sin(t * 1.4 + i * 0.5)) * 0.5 +
          0.02 * (1 + Math.sin(t * 2.3 - i * 0.22)) * 0.5;
      }
    }

    // Fast attack, slow release — the classic VU-meter feel.
    for (let i = 0; i < BINS; i++) {
      const diff = target[i] - this.levels[i];
      this.levels[i] += diff * (diff > 0 ? 0.4 : 0.12);
    }
  }

  private resolveColor(): string {
    const css = getComputedStyle(this.host.nativeElement)
      .getPropertyValue(COLOR_VAR[this.color()])
      .trim();
    return css || '#6366f1';
  }

  private draw(now: number): void {
    const ctx = this.ctx2d;
    if (!ctx) return;
    const canvas = this.canvasRef().nativeElement;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    if (w < 4 || h < 4) return;

    this.updateLevels(now);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = ctx.strokeStyle = this.resolveColor();

    switch (this.variant()) {
      case 'wave':
        this.drawWave(ctx, w, h);
        break;
      case 'ring':
        this.drawRing(ctx, w, h, now);
        break;
      default:
        this.drawBars(ctx, w, h);
    }
    ctx.globalAlpha = 1;
  }

  /** Symmetric level lookup — strongest (bass) buckets in the middle. */
  private levelAt(i: number, count: number): number {
    const ratio = Math.abs(i - (count - 1) / 2) / ((count - 1) / 2);
    return this.levels[Math.min(BINS - 1, Math.round(ratio * (BINS - 1)))];
  }

  private drawBars(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const n = Math.max(12, Math.min(56, Math.floor(w / 7)));
    const gap = 3;
    const bw = (w - gap * (n - 1)) / n;
    const midY = h / 2;
    for (let i = 0; i < n; i++) {
      const lv = this.levels[Math.floor((i * BINS) / n)];
      const bh = Math.max(bw, lv * (h - 6));
      ctx.globalAlpha = 0.3 + lv * 0.7;
      ctx.beginPath();
      ctx.roundRect(i * (bw + gap), midY - bh / 2, bw, bh, bw / 2);
      ctx.fill();
    }
  }

  private drawWave(ctx: CanvasRenderingContext2D, w: number, h: number): void {
    const points = 40;
    const base = h * 0.5;
    const topAmp = h * 0.46;
    const bottomAmp = topAmp * 0.62;
    // Back-to-front layers, like overlapping translucent waves.
    const layers: Array<{ amp: number; alpha: number; shift: number }> = [
      { amp: 1, alpha: 0.16, shift: 9 },
      { amp: 0.8, alpha: 0.32, shift: 4 },
      { amp: 0.6, alpha: 0.9, shift: 0 },
    ];

    for (const layer of layers) {
      const ys: number[] = [];
      for (let i = 0; i <= points; i++) {
        const idx = Math.min(points, Math.max(0, i + layer.shift));
        ys.push(Math.max(0.02, this.levelAt(idx, points + 1)) * layer.amp);
      }
      const x = (i: number) => (i / points) * w;

      ctx.globalAlpha = layer.alpha;
      ctx.beginPath();
      ctx.moveTo(0, base - ys[0] * topAmp);
      for (let i = 0; i < points; i++) {
        const xc = (x(i) + x(i + 1)) / 2;
        const yc = base - ((ys[i] + ys[i + 1]) / 2) * topAmp;
        ctx.quadraticCurveTo(x(i), base - ys[i] * topAmp, xc, yc);
      }
      ctx.lineTo(w, base - ys[points] * topAmp);
      // Mirrored (smaller) bottom half.
      ctx.lineTo(w, base + ys[points] * bottomAmp);
      for (let i = points; i > 0; i--) {
        const xc = (x(i) + x(i - 1)) / 2;
        const yc = base + ((ys[i] + ys[i - 1]) / 2) * bottomAmp;
        ctx.quadraticCurveTo(x(i), base + ys[i] * bottomAmp, xc, yc);
      }
      ctx.closePath();
      ctx.fill();
    }

    // Center energy band.
    ctx.globalAlpha = 0.95;
    ctx.beginPath();
    ctx.roundRect(0, base - 1.5, w, 3, 1.5);
    ctx.fill();
  }

  private drawRing(ctx: CanvasRenderingContext2D, w: number, h: number, now: number): void {
    const cx = w / 2;
    const cy = h / 2;
    const R = Math.min(w, h) / 2 - 4;
    let avg = 0;
    for (let i = 0; i < BINS; i++) avg += this.levels[i];
    avg /= BINS;

    const r0 = R * 0.42 + avg * R * 0.16;
    const rotation = (now / 1000) * 0.35;
    const spokes = 72;

    // Pulsing core.
    ctx.globalAlpha = 0.12;
    ctx.beginPath();
    ctx.arc(cx, cy, r0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(2, r0 * 0.16 + avg * r0 * 0.5), 0, Math.PI * 2);
    ctx.fill();

    // Radial spokes.
    ctx.lineWidth = Math.max(2, (Math.PI * r0 * 2) / spokes / 2.4);
    ctx.lineCap = 'round';
    for (let s = 0; s < spokes; s++) {
      const lv = this.levelAt(s, spokes);
      const angle = rotation + (s / spokes) * Math.PI * 2;
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const inner = r0 + 3;
      const len = 2 + lv * (R - r0 - 6);
      ctx.globalAlpha = 0.3 + lv * 0.7;
      ctx.beginPath();
      ctx.moveTo(cx + cos * inner, cy + sin * inner);
      ctx.lineTo(cx + cos * (inner + len), cy + sin * (inner + len));
      ctx.stroke();
    }
  }

  private cleanup(): void {
    cancelAnimationFrame(this.rafId);
    this.resizeObserver?.disconnect();
    this.audioEl.pause();
    this.audioEl.removeAttribute('src');
    this.streamSource?.disconnect();
    this.elementSource?.disconnect();
    void this.audioCtx?.close().catch(() => {});
  }
}
