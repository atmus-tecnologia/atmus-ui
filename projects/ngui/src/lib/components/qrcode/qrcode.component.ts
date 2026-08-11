import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { AtmThemeService } from '../../services/theme.service';
import { AtmQrErrorCorrection, AtmQrMatrix, atmEncodeQr } from './qr-encoder';

/** Visual style of the data modules. */
export type AtmQrcodeDotStyle = 'square' | 'rounded' | 'dots';

/**
 * QR code generator rendered on canvas — encoder embutido, sem dependências.
 *
 * Suporta tamanho em px, cores customizadas, estilo dos pontos (quadrado,
 * arredondado ou bolinhas), logo central com fundo/padding e uma moldura
 * decorativa nos 4 cantos (ativável via `frame`).
 *
 *   <atm-qrcode value="https://atmus.dev" />
 *   <atm-qrcode value="..." [size]="240" color="#7c3aed" [frame]="true" logo="/logo.png" />
 */
@Component({
  selector: 'atm-qrcode',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-block' },
  template: `
    <div
      class="relative inline-flex items-center justify-center"
      role="img"
      [attr.aria-label]="resolvedAriaLabel()"
      [style.padding.px]="framePadding()"
    >
      @if (frame()) {
        @for (corner of corners; track corner) {
          <span
            class="pointer-events-none absolute"
            aria-hidden="true"
            [style]="cornerStyle(corner)"
          ></span>
        }
      }
      <canvas #canvas class="block" [style.width.px]="size()" [style.height.px]="size()"></canvas>
    </div>
  `,
})
export class AtmQrcode {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly theme = inject(AtmThemeService);

  /** Conteúdo codificado (URL, texto, payload PIX etc.). */
  readonly value = input.required<string>();
  /** Lado do QR em px. */
  readonly size = input(200);
  /** Cor dos módulos escuros. Padrão: token ink do tema. */
  readonly color = input<string | null>(null);
  /** Cor de fundo do QR. Padrão: transparente. */
  readonly background = input<string | null>(null);
  /** Nível mínimo de correção de erro. Com logo o mínimo efetivo vira H. */
  readonly errorCorrection = input<AtmQrErrorCorrection>('M');
  /** Estilo dos módulos: quadrado clássico, cantos arredondados ou bolinhas. */
  readonly dotStyle = input<AtmQrcodeDotStyle>('square');
  /** Margem interna (quiet zone) em módulos. */
  readonly quietZone = input(2);

  /** URL/dataURL da logo central. */
  readonly logo = input<string | null>(null);
  /** Tamanho da logo como fração do lado do QR (0.15–0.3 recomendado). */
  readonly logoSize = input(0.22);
  /** Respiro em px ao redor da logo. */
  readonly logoPadding = input(6);
  /** Fundo atrás da logo. Padrão: token surface. 'transparent' desativa. */
  readonly logoBackground = input<string | null>(null);

  /** Ativa a moldura decorativa nos 4 cantos. */
  readonly frame = input(false);
  /** Cor da moldura. Padrão: token primary. */
  readonly frameColor = input<string | null>(null);
  /** Rótulo acessível. Padrão: "QR code: {value}". */
  readonly ariaLabel = input<string | null>(null);

  readonly corners = ['tl', 'tr', 'bl', 'br'] as const;

  private readonly canvasRef = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  /** Logo carregada (null enquanto baixa ou sem logo). */
  private readonly logoImage = signal<HTMLImageElement | null>(null);

  readonly resolvedAriaLabel = computed(() => this.ariaLabel() ?? `QR code: ${this.value()}`);

  /** Espaço entre o QR e a moldura, proporcional ao tamanho. */
  readonly framePadding = computed(() =>
    this.frame() ? Math.max(10, Math.round(this.size() * 0.07)) : 0,
  );

  private readonly matrix = computed<AtmQrMatrix>(() =>
    atmEncodeQr(this.value(), this.logo() ? 'H' : this.errorCorrection()),
  );

  constructor() {
    // Carrega (ou limpa) a logo quando a URL muda.
    effect(() => {
      const url = this.logo();
      this.logoImage.set(null);
      if (!url) return;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        // Ignora se a URL mudou enquanto a imagem baixava.
        if (this.logo() === url) this.logoImage.set(img);
      };
      img.src = url;
    });

    // Redesenha quando qualquer entrada visual (ou o tema) muda.
    effect(() => {
      this.matrix();
      this.size();
      this.color();
      this.background();
      this.dotStyle();
      this.quietZone();
      this.logoImage();
      this.logoSize();
      this.logoPadding();
      this.logoBackground();
      this.theme.isDark();
      this.draw();
    });
  }

  /** Exporta o QR como data URL (png por padrão). */
  toDataUrl(type = 'image/png'): string {
    return this.canvasRef().nativeElement.toDataURL(type);
  }

  /** Baixa o QR como arquivo de imagem. */
  download(filename = 'qrcode.png'): void {
    const a = document.createElement('a');
    a.href = this.toDataUrl();
    a.download = filename;
    a.click();
  }

  cornerStyle(corner: 'tl' | 'tr' | 'bl' | 'br'): Record<string, string> {
    const len = Math.max(16, Math.round(this.size() * 0.16));
    const thick = Math.max(2, Math.round(this.size() * 0.016));
    const color = this.frameColor() ?? 'var(--atm-primary)';
    const radius = `${Math.round(thick * 2.5)}px`;
    const style: Record<string, string> = {
      width: `${len}px`,
      height: `${len}px`,
      'border-color': color,
      'border-style': 'solid',
      'border-width': '0',
    };
    if (corner.startsWith('t')) {
      style['top'] = '0';
      style['border-top-width'] = `${thick}px`;
    } else {
      style['bottom'] = '0';
      style['border-bottom-width'] = `${thick}px`;
    }
    if (corner.endsWith('l')) {
      style['left'] = '0';
      style['border-left-width'] = `${thick}px`;
    } else {
      style['right'] = '0';
      style['border-right-width'] = `${thick}px`;
    }
    style[`border-${corner === 'tl' ? 'top-left' : corner === 'tr' ? 'top-right' : corner === 'bl' ? 'bottom-left' : 'bottom-right'}-radius`] = radius;
    return style;
  }

  // ── Rendering ─────────────────────────────────────────────────────────────

  private resolveColor(css: string, fallback: string): string {
    if (!css.includes('var(')) return css;
    const style = getComputedStyle(this.host.nativeElement);
    return css.replace(
      /var\((--[\w-]+)[^)]*\)/g,
      (_, name: string) => style.getPropertyValue(name).trim() || fallback,
    );
  }

  private draw(): void {
    const canvas = this.canvasRef().nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cssSize = this.size();
    const dpr = Math.max(1, window.devicePixelRatio || 1);
    canvas.width = Math.round(cssSize * dpr);
    canvas.height = Math.round(cssSize * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, cssSize, cssSize);

    const dark = this.resolveColor(this.color() ?? 'var(--atm-ink)', '#1e293b');
    const bg = this.background();
    if (bg && bg !== 'transparent') {
      ctx.fillStyle = this.resolveColor(bg, '#ffffff');
      ctx.fillRect(0, 0, cssSize, cssSize);
    }

    const matrix = this.matrix();
    const quiet = Math.max(0, this.quietZone());
    const total = matrix.size + quiet * 2;
    const cell = cssSize / total;
    const offset = quiet * cell;
    const style = this.dotStyle();

    // Área reservada para a logo (em coordenadas de módulo) — módulos ali não são pintados.
    let logoHole: { min: number; max: number } | null = null;
    const logoImg = this.logoImage();
    if (logoImg) {
      const holePx = cssSize * this.logoSize() + this.logoPadding() * 2;
      const holeModules = holePx / cell;
      const center = matrix.size / 2;
      logoHole = { min: center - holeModules / 2, max: center + holeModules / 2 };
    }

    ctx.fillStyle = dark;

    for (let y = 0; y < matrix.size; y++) {
      for (let x = 0; x < matrix.size; x++) {
        if (!matrix.modules[y][x]) continue;
        // Os "olhos" são desenhados à parte para ficarem contínuos.
        if (style !== 'square' && matrix.isFinder(x, y)) continue;
        if (
          logoHole &&
          x + 0.5 > logoHole.min &&
          x + 0.5 < logoHole.max &&
          y + 0.5 > logoHole.min &&
          y + 0.5 < logoHole.max
        )
          continue;

        const px = offset + x * cell;
        const py = offset + y * cell;
        if (style === 'dots') {
          ctx.beginPath();
          ctx.arc(px + cell / 2, py + cell / 2, (cell / 2) * 0.85, 0, Math.PI * 2);
          ctx.fill();
        } else if (style === 'rounded') {
          ctx.beginPath();
          ctx.roundRect(px + cell * 0.06, py + cell * 0.06, cell * 0.88, cell * 0.88, cell * 0.28);
          ctx.fill();
        } else {
          // +0.5px de sobreposição evita hairlines entre módulos por arredondamento.
          ctx.fillRect(px, py, cell + 0.5, cell + 0.5);
        }
      }
    }

    // Olhos estilizados (quando os pontos não são quadrados).
    if (style !== 'square') {
      const eyes: [number, number][] = [
        [0, 0],
        [matrix.size - 7, 0],
        [0, matrix.size - 7],
      ];
      for (const [ex, ey] of eyes) {
        const x0 = offset + ex * cell;
        const y0 = offset + ey * cell;
        const outer = 7 * cell;
        const ring = cell;
        // Anel externo 7x7 com furo 5x5 (evenodd).
        ctx.beginPath();
        ctx.roundRect(x0, y0, outer, outer, outer * 0.3);
        ctx.roundRect(x0 + ring, y0 + ring, outer - ring * 2, outer - ring * 2, (outer - ring * 2) * 0.3);
        ctx.fill('evenodd');
        // Miolo 3x3.
        ctx.beginPath();
        if (style === 'dots') {
          ctx.arc(x0 + outer / 2, y0 + outer / 2, (3 * cell) / 2, 0, Math.PI * 2);
        } else {
          ctx.roundRect(x0 + 2 * cell, y0 + 2 * cell, 3 * cell, 3 * cell, cell * 0.9);
        }
        ctx.fill();
      }
    }

    // Logo central.
    if (logoImg) {
      const logoPx = cssSize * this.logoSize();
      const pad = this.logoPadding();
      const lx = (cssSize - logoPx) / 2;
      const ly = (cssSize - logoPx) / 2;
      const bgColor = this.logoBackground() ?? 'var(--atm-surface)';
      if (bgColor !== 'transparent') {
        ctx.fillStyle = this.resolveColor(bgColor, '#ffffff');
        ctx.beginPath();
        ctx.roundRect(lx - pad, ly - pad, logoPx + pad * 2, logoPx + pad * 2, (logoPx + pad * 2) * 0.22);
        ctx.fill();
      }
      // Mantém a proporção da imagem dentro do quadrado da logo.
      const ratio = logoImg.width / logoImg.height || 1;
      let dw = logoPx;
      let dh = logoPx;
      if (ratio > 1) dh = logoPx / ratio;
      else dw = logoPx * ratio;
      ctx.drawImage(logoImg, lx + (logoPx - dw) / 2, ly + (logoPx - dh) / 2, dw, dh);
    }
  }
}
