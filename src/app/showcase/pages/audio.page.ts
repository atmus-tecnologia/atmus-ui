import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { AtmAudioVisualizer, AtmButton } from '../../../core/ui';
import { DemoPage, DemoSection } from '../demo-section.component';

/** Música de demonstração com CORS liberado (necessário para o analyser). */
const DEMO_URL = 'https://d1j1y3gb82cpmr.cloudfront.net/audio_player/download_song_direct/22484103/c96552dccd36161151d40bd8f30fa9e0';

@Component({
  selector: 'audio-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmAudioVisualizer, AtmButton, DemoPage, DemoSection],
  template: `
    <demo-page
      title="Áudio"
      description="Visualizador de intensidade de áudio com Web Audio API — toca URLs, reage a
        streams do microfone e anima em três estilos diferentes."
      importCode="import { AtmAudioVisualizer } from 'src/core/ui';"
    >
      <demo-section
        id="audio-url"
        title="Player com URL"
        description="Passe um src e o componente cuida do play/pause, tempo e visualização.
          Para URLs remotas o servidor precisa permitir CORS."
        [code]="urlCode"
      >
        <atm-audio-visualizer [src]="demoUrl" />
      </demo-section>

      <demo-section
        id="audio-styles"
        title="Três estilos"
        description="bars (barras arredondadas), wave (ondas espelhadas) e ring (radial pulsante).
          Dê play em cada um para ver a animação."
        [code]="stylesCode"
      >
        <div class="flex w-full flex-col gap-8">
          <div class="flex w-full flex-col gap-1.5">
            <span class="text-xs font-semibold text-ink-faint uppercase">variant="bars"</span>
            <atm-audio-visualizer [src]="demoUrl" variant="bars" />
          </div>
          <div class="flex w-full flex-col gap-1.5">
            <span class="text-xs font-semibold text-ink-faint uppercase">variant="wave"</span>
            <atm-audio-visualizer [src]="demoUrl" variant="wave" color="warning" />
          </div>
          <div class="flex w-full flex-col gap-1.5">
            <span class="text-xs font-semibold text-ink-faint uppercase">variant="ring"</span>
            <atm-audio-visualizer [src]="demoUrl" variant="ring" size="large" color="info" />
          </div>
        </div>
      </demo-section>

      <demo-section
        id="audio-recorder"
        title="Gravador do navegador"
        description="MediaRecorder + getUserMedia: o stream do microfone entra no [stream] e a
          intensidade da sua voz aparece ao vivo. Ao parar, o blob gravado vira um player."
        [code]="recorderCode"
      >
        <div class="flex w-full flex-col gap-4">
          <div class="flex items-center gap-4">
            <atm-button
              [color]="recording() ? 'danger' : 'primary'"
              [icon]="recording() ? 'square' : 'mic'"
              [rounded]="true"
              (clicked)="toggleRecording()"
            >
              {{ recording() ? 'Parar gravação' : 'Gravar' }}
            </atm-button>
            @if (recording()) {
              <span class="flex items-center gap-2 text-sm text-ink-muted">
                <span class="size-2 animate-pulse rounded-full bg-danger"></span>
                Gravando — {{ recordingLabel() }}
              </span>
            }
          </div>

          @if (micError()) {
            <p class="text-sm text-danger">{{ micError() }}</p>
          }

          <atm-audio-visualizer [stream]="recStream()" variant="wave" color="danger" />

          @if (recordedUrl(); as url) {
            <div class="flex w-full flex-col gap-1.5">
              <span class="text-xs font-semibold text-ink-faint uppercase">Sua gravação</span>
              <atm-audio-visualizer [src]="url" variant="bars" color="success" />
            </div>
          }
        </div>
      </demo-section>

      <demo-section
        id="audio-colors"
        title="Cores & tamanhos"
        description="Tokens semânticos de cor e a escala large / medium / slim."
        [code]="colorsCode"
      >
        <div class="flex w-full flex-col gap-6">
          <atm-audio-visualizer [src]="demoUrl" size="large" color="success" />
          <atm-audio-visualizer [src]="demoUrl" size="medium" color="danger" variant="wave" />
          <atm-audio-visualizer [src]="demoUrl" size="slim" color="neutral" />
        </div>
      </demo-section>
    </demo-page>
  `,
})
export class AudioPage {
  private readonly destroyRef = inject(DestroyRef);

  readonly demoUrl = DEMO_URL;

  // --- Recorder demo state ---
  readonly recording = signal(false);
  readonly recStream = signal<MediaStream | null>(null);
  readonly recordedUrl = signal<string | null>(null);
  readonly recSeconds = signal(0);
  readonly micError = signal('');

  readonly recordingLabel = computed(() => {
    const total = this.recSeconds();
    const m = Math.floor(total / 60);
    const s = (total % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  });

  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.recorder?.stream.getTracks().forEach((t) => t.stop());
      if (this.timer) clearInterval(this.timer);
      const url = this.recordedUrl();
      if (url) URL.revokeObjectURL(url);
    });
  }

  toggleRecording(): void {
    if (this.recording()) this.stopRecording();
    else void this.startRecording();
  }

  private async startRecording(): Promise<void> {
    this.micError.set('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const old = this.recordedUrl();
      if (old) URL.revokeObjectURL(old);
      this.recordedUrl.set(null);
      this.chunks = [];
      this.recorder = new MediaRecorder(stream);
      this.recorder.ondataavailable = (e) => {
        if (e.data.size) this.chunks.push(e.data);
      };
      this.recorder.onstop = () => {
        const blob = new Blob(this.chunks, { type: this.recorder?.mimeType || 'audio/webm' });
        this.recordedUrl.set(URL.createObjectURL(blob));
        stream.getTracks().forEach((t) => t.stop());
        this.recStream.set(null);
      };
      this.recorder.start();
      this.recStream.set(stream);
      this.recording.set(true);
      this.recSeconds.set(0);
      this.timer = setInterval(() => this.recSeconds.update((s) => s + 1), 1000);
    } catch {
      this.micError.set('Não foi possível acessar o microfone. Verifique as permissões do navegador.');
    }
  }

  private stopRecording(): void {
    this.recorder?.stop();
    this.recording.set(false);
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  // --- Snippets ---

  readonly urlCode = `<atm-audio-visualizer src="https://exemplo.com/musica.mp3" />`;

  readonly stylesCode = `<atm-audio-visualizer [src]="url" variant="bars" />
<atm-audio-visualizer [src]="url" variant="wave" color="warning" />
<atm-audio-visualizer [src]="url" variant="ring" size="large" color="info" />`;

  readonly recorderCode = `<!-- template -->
<atm-audio-visualizer [stream]="recStream()" variant="wave" color="danger" />
@if (recordedUrl(); as url) {
  <atm-audio-visualizer [src]="url" variant="bars" color="success" />
}

// componente
readonly recStream = signal<MediaStream | null>(null);
readonly recordedUrl = signal<string | null>(null);
private recorder!: MediaRecorder;
private chunks: Blob[] = [];

async start() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  this.recorder = new MediaRecorder(stream);
  this.recorder.ondataavailable = (e) => this.chunks.push(e.data);
  this.recorder.onstop = () => {
    this.recordedUrl.set(URL.createObjectURL(new Blob(this.chunks)));
    stream.getTracks().forEach((t) => t.stop());
    this.recStream.set(null);
  };
  this.recorder.start();
  this.recStream.set(stream);
}

stop() {
  this.recorder.stop();
}`;

  readonly colorsCode = `<atm-audio-visualizer [src]="url" size="large" color="success" />
<atm-audio-visualizer [src]="url" size="medium" color="danger" variant="wave" />
<atm-audio-visualizer [src]="url" size="slim" color="neutral" />`;
}
