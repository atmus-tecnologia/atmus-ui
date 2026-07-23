import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { ATM_DIALOG_DATA, AtmDialogRef } from '../../services/dialog.service';
import { AtmButton } from '../button/button.component';

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Accepted image source: a URL/dataURL string or a Blob/File. */
export type AtmImageCropSource = string | Blob | File;

const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max));

/**
 * Interactive image cropper. Shows the image (contain-fit) with a movable /
 * resizable crop box, dimmed surroundings, thirds grid and optional circular
 * mask + fixed aspect ratio. Export the selected region as a Blob/File at the
 * image's native resolution via `toBlob()` / `toFile()`.
 *
 *   <atm-image-crop [src]="file" [aspect]="1" [round]="true" #cropper />
 *   const file = await cropper.toFile('avatar.png');
 */
@Component({
  selector: 'atm-image-crop',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block w-full select-none' },
  styles: `
    :host {
      --atm-crop-overlay: rgb(2 6 23 / 0.6);
    }
  `,
  template: `
    <div
      #container
      class="relative w-full overflow-hidden rounded-atm border border-line
        [background:repeating-conic-gradient(var(--atm-surface-alt)_0_25%,transparent_0_50%)_50%/16px_16px]"
      [style.height.px]="height()"
    >
      @if (displaySrc()) {
        <img
          #img
          [src]="displaySrc()"
          alt=""
          draggable="false"
          class="pointer-events-none absolute inset-0 h-full w-full object-contain"
          (load)="onImgLoad()"
        />

        @if (box(); as b) {
          <div
            class="absolute inset-0 touch-none"
            (pointerdown)="onPointerDown($event)"
            (pointermove)="onPointerMove($event)"
            (pointerup)="onPointerUp($event)"
            (pointercancel)="onPointerUp($event)"
          >
            <!-- Crop box: the huge box-shadow dims everything outside it. -->
            <div
              data-h="move"
              class="absolute cursor-move border-2 border-white/90 shadow-[0_0_0_9999px_var(--atm-crop-overlay)]"
              [class.rounded-full]="round()"
              [style.left.px]="b.x"
              [style.top.px]="b.y"
              [style.width.px]="b.w"
              [style.height.px]="b.h"
            >
              <!-- Thirds grid -->
              <div
                class="pointer-events-none absolute inset-0 opacity-60"
                [class.overflow-hidden]="round()"
                [class.rounded-full]="round()"
              >
                <div class="absolute inset-y-0 left-1/3 w-px bg-white/40"></div>
                <div class="absolute inset-y-0 left-2/3 w-px bg-white/40"></div>
                <div class="absolute inset-x-0 top-1/3 h-px bg-white/40"></div>
                <div class="absolute inset-x-0 top-2/3 h-px bg-white/40"></div>
              </div>

              <!-- Handles -->
              @for (hd of handles(); track hd.h) {
                <span
                  [attr.data-h]="hd.h"
                  class="absolute size-3 rounded-full border-2 border-primary bg-surface shadow-sm"
                  [class]="hd.pos"
                  [style.cursor]="hd.cur"
                ></span>
              }
            </div>
          </div>
        }
      } @else {
        <div class="flex h-full items-center justify-center text-sm text-ink-faint">
          Nenhuma imagem carregada
        </div>
      }
    </div>
  `,
})
export class AtmImageCrop {
  private readonly destroyRef = inject(DestroyRef);

  /** Image source — a URL/dataURL string or a Blob/File. */
  readonly src = input<AtmImageCropSource | null>(null);
  /** Fixed aspect ratio (width / height). `null` = free crop. */
  readonly aspect = input<number | null>(null);
  /** Circular crop mask (exports PNG with transparency). */
  readonly round = input(false);
  /** Height of the editing area in px. */
  readonly height = input(340);
  /** Output mime type (ignored when `round`, which forces image/png). */
  readonly outputType = input('image/png');
  /** Output quality 0..1 for lossy types (jpeg/webp). */
  readonly outputQuality = input(0.92);
  /** Minimum crop box size in displayed px. */
  readonly minSize = input(32);

  /** Emits whenever the crop box changes (debounce yourself if needed). */
  readonly changed = output<void>();

  private readonly containerEl = viewChild<ElementRef<HTMLElement>>('container');
  private readonly imgEl = viewChild<ElementRef<HTMLImageElement>>('img');

  readonly displaySrc = signal<string | null>(null);
  private readonly naturalW = signal(0);
  private readonly naturalH = signal(0);
  private readonly containerW = signal(0);
  private readonly containerH = signal(0);
  readonly box = signal<Rect | null>(null);

  private objectUrl: string | null = null;
  private drag: { mode: string; startX: number; startY: number; box: Rect } | null = null;

  /** Rendered image rectangle inside the container (object-contain letterbox). */
  readonly imgRect = computed<Rect | null>(() => {
    const nW = this.naturalW();
    const nH = this.naturalH();
    const cW = this.containerW();
    const cH = this.containerH();
    if (!nW || !nH || !cW || !cH) return null;
    const scale = Math.min(cW / nW, cH / nH);
    const w = nW * scale;
    const h = nH * scale;
    return { x: (cW - w) / 2, y: (cH - h) / 2, w, h };
  });

  readonly handles = computed(() => {
    const corners = [
      { h: 'nw', pos: '-top-1.5 -left-1.5', cur: 'nwse-resize' },
      { h: 'ne', pos: '-top-1.5 -right-1.5', cur: 'nesw-resize' },
      { h: 'sw', pos: '-bottom-1.5 -left-1.5', cur: 'nesw-resize' },
      { h: 'se', pos: '-bottom-1.5 -right-1.5', cur: 'nwse-resize' },
    ];
    if (this.aspect()) return corners;
    return [
      ...corners,
      { h: 'n', pos: '-top-1.5 left-1/2 -translate-x-1/2', cur: 'ns-resize' },
      { h: 's', pos: '-bottom-1.5 left-1/2 -translate-x-1/2', cur: 'ns-resize' },
      { h: 'w', pos: 'top-1/2 -left-1.5 -translate-y-1/2', cur: 'ew-resize' },
      { h: 'e', pos: 'top-1/2 -right-1.5 -translate-y-1/2', cur: 'ew-resize' },
    ];
  });

  constructor() {
    // Normalize the source into a displayable URL, managing object URLs.
    effect(() => {
      const s = this.src();
      this.releaseUrl();
      if (!s) {
        this.displaySrc.set(null);
        return;
      }
      if (typeof s === 'string') {
        this.displaySrc.set(s);
      } else {
        this.objectUrl = URL.createObjectURL(s);
        this.displaySrc.set(this.objectUrl);
      }
    });

    // Reset the crop box when aspect changes (after image is known).
    effect(() => {
      this.aspect();
      if (this.imgRect()) this.initBox();
    });

    afterNextRender(() => {
      const el = this.containerEl()?.nativeElement;
      if (!el) return;
      // Deferred to rAF to avoid "ResizeObserver loop completed with
      // undelivered notifications" (the callback re-renders and can resize
      // the observed container).
      let raf = 0;
      const ro = new ResizeObserver(() => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          this.containerW.set(el.clientWidth);
          this.containerH.set(el.clientHeight);
          this.clampBox();
        });
      });
      ro.observe(el);
      this.containerW.set(el.clientWidth);
      this.containerH.set(el.clientHeight);
      this.destroyRef.onDestroy(() => {
        cancelAnimationFrame(raf);
        ro.disconnect();
      });
    });

    this.destroyRef.onDestroy(() => this.releaseUrl());
  }

  onImgLoad(): void {
    const img = this.imgEl()?.nativeElement;
    if (!img) return;
    this.naturalW.set(img.naturalWidth);
    this.naturalH.set(img.naturalHeight);
    this.initBox();
  }

  /** Reset the crop box to a centered region covering ~90% of the image. */
  reset(): void {
    this.initBox();
  }

  private initBox(): void {
    const r = this.imgRect();
    if (!r) return;
    const aspect = this.aspect();
    let w = r.w * 0.9;
    let h = r.h * 0.9;
    if (aspect) {
      if (w / h > aspect) w = h * aspect;
      else h = w / aspect;
    }
    this.box.set({ x: r.x + (r.w - w) / 2, y: r.y + (r.h - h) / 2, w, h });
    this.changed.emit();
  }

  private clampBox(): void {
    const r = this.imgRect();
    const b = this.box();
    if (!r || !b) return;
    const w = Math.min(b.w, r.w);
    const h = Math.min(b.h, r.h);
    const x = clamp(b.x, r.x, r.x + r.w - w);
    const y = clamp(b.y, r.y, r.y + r.h - h);
    this.box.set({ x, y, w, h });
  }

  onPointerDown(event: PointerEvent): void {
    const target = event.target as HTMLElement;
    const mode = target.dataset['h'];
    if (!mode || !this.box()) return;
    event.preventDefault();
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
    this.drag = { mode, startX: event.clientX, startY: event.clientY, box: { ...this.box()! } };
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.drag) return;
    const dx = event.clientX - this.drag.startX;
    const dy = event.clientY - this.drag.startY;
    if (this.drag.mode === 'move') this.moveBox(dx, dy);
    else this.resizeBox(this.drag.mode, dx, dy);
  }

  onPointerUp(event: PointerEvent): void {
    if (!this.drag) return;
    (event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId);
    this.drag = null;
  }

  private moveBox(dx: number, dy: number): void {
    const r = this.imgRect();
    if (!r || !this.drag) return;
    const s = this.drag.box;
    const x = clamp(s.x + dx, r.x, r.x + r.w - s.w);
    const y = clamp(s.y + dy, r.y, r.y + r.h - s.h);
    this.box.set({ ...s, x, y });
    this.changed.emit();
  }

  private resizeBox(mode: string, dx: number, dy: number): void {
    const r = this.imgRect();
    if (!r || !this.drag) return;
    const s = this.drag.box;
    const min = this.minSize();
    const aspect = this.aspect();

    let left = s.x;
    let top = s.y;
    let right = s.x + s.w;
    let bottom = s.y + s.h;

    if (mode.includes('w')) left = clamp(s.x + dx, r.x, right - min);
    if (mode.includes('e')) right = clamp(s.x + s.w + dx, left + min, r.x + r.w);
    if (mode.includes('n')) top = clamp(s.y + dy, r.y, bottom - min);
    if (mode.includes('s')) bottom = clamp(s.y + s.h + dy, top + min, r.y + r.h);

    let w = right - left;
    let h = bottom - top;
    let x = left;
    let y = top;

    if (aspect) {
      // Anchor is the corner opposite to the one being dragged.
      const anchorX = mode.includes('w') ? right : left;
      const anchorY = mode.includes('n') ? bottom : top;
      const availX = mode.includes('w') ? anchorX - r.x : r.x + r.w - anchorX;
      const availY = mode.includes('n') ? anchorY - r.y : r.y + r.h - anchorY;

      w = Math.max(w, min);
      h = w / aspect;
      if (w > availX) {
        w = availX;
        h = w / aspect;
      }
      if (h > availY) {
        h = availY;
        w = h * aspect;
      }
      x = mode.includes('w') ? anchorX - w : anchorX;
      y = mode.includes('n') ? anchorY - h : anchorY;
    }

    this.box.set({ x, y, w, h });
    this.changed.emit();
  }

  /** Export the current selection as a Blob at the image's native resolution. */
  async toBlob(): Promise<Blob | null> {
    const img = this.imgEl()?.nativeElement;
    const r = this.imgRect();
    const b = this.box();
    if (!img || !r || !b) return null;

    const scale = this.naturalW() / r.w; // native px per displayed px
    const sx = (b.x - r.x) * scale;
    const sy = (b.y - r.y) * scale;
    const sw = b.w * scale;
    const sh = b.h * scale;

    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(sw));
    canvas.height = Math.max(1, Math.round(sh));
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (this.round()) {
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();
    }

    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    const type = this.round() ? 'image/png' : this.outputType();
    return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), type, this.outputQuality()));
  }

  /** Export the current selection as a File. */
  async toFile(name: string): Promise<File | null> {
    const blob = await this.toBlob();
    if (!blob) return null;
    return new File([blob], name, { type: blob.type });
  }

  private releaseUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }
}

/** Data passed to {@link AtmImageCropDialog} via ATM_DIALOG_DATA. */
export interface AtmImageCropDialogData {
  src: AtmImageCropSource;
  fileName?: string;
  aspect?: number | null;
  round?: boolean;
  outputType?: string;
}

/**
 * Dialog host that wraps {@link AtmImageCrop} with confirm/cancel/reset
 * actions. Opened via `AtmDialogService.open(AtmImageCropDialog, { data })`;
 * resolves the dialog with the cropped `File` (or `undefined` if cancelled).
 */
@Component({
  selector: 'atm-image-crop-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmImageCrop, AtmButton],
  template: `
    <div class="flex flex-col gap-4">
      <atm-image-crop
        #cropper
        [src]="data.src"
        [aspect]="data.aspect ?? null"
        [round]="data.round ?? false"
        [outputType]="data.outputType ?? 'image/png'"
        [height]="360"
      />

      <div class="flex items-center justify-between gap-2">
        <atm-button variant="ghost" color="neutral" icon="refresh" (clicked)="cropper.reset()">
          Redefinir
        </atm-button>
        <div class="flex items-center gap-2">
          <atm-button variant="soft" color="neutral" (clicked)="ref.close()">Cancelar</atm-button>
          <atm-button icon="crop" [loading]="saving()" (clicked)="confirm(cropper)">
            Aplicar recorte
          </atm-button>
        </div>
      </div>
    </div>
  `,
})
export class AtmImageCropDialog {
  readonly ref = inject<AtmDialogRef<File>>(AtmDialogRef);
  readonly data = inject<AtmImageCropDialogData>(ATM_DIALOG_DATA);
  readonly saving = signal(false);

  async confirm(cropper: AtmImageCrop): Promise<void> {
    this.saving.set(true);
    const name = this.data.fileName ?? 'imagem.png';
    const file = await cropper.toFile(name);
    this.saving.set(false);
    this.ref.close(file ?? undefined);
  }
}
