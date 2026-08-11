import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AtmButton,
  AtmFileInput,
  AtmImageCrop,
  AtmLabel,
  AtmToastService,
} from '@atmus/ngui';
import { DemoPage, DemoSection } from '../demo-section.component';

/** Colorful offline sample image (SVG data URL) for the standalone cropper. */
const SAMPLE_SVG = `<svg xmlns='http://www.w3.org/2000/svg' width='960' height='640'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='#6366f1'/>
      <stop offset='1' stop-color='#0ea5e9'/>
    </linearGradient>
  </defs>
  <rect width='960' height='640' fill='url(#g)'/>
  <circle cx='740' cy='150' r='120' fill='#ffffff' opacity='0.15'/>
  <circle cx='200' cy='520' r='170' fill='#ffffff' opacity='0.12'/>
  <text x='50%' y='48%' fill='#ffffff' font-family='sans-serif' font-size='96'
    font-weight='700' text-anchor='middle'>Atmus UI</text>
  <text x='50%' y='60%' fill='#ffffff' font-family='sans-serif' font-size='34'
    text-anchor='middle' opacity='0.85'>image-crop demo</text>
</svg>`;

@Component({
  selector: 'upload-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, AtmFileInput, AtmImageCrop, AtmButton, AtmLabel, DemoPage, DemoSection],
  template: `
    <demo-page
      title="Upload & Crop"
      description="Área de arrastar-e-soltar com preview, múltiplos tipos, envio via FormData e recorte de imagens em diálogo."
      importCode="import { AtmFileInput, AtmImageCrop, AtmImageCropDialog } from '@atmus/ngui';"
    >
      <!-- Básico -->
      <demo-section
        id="file-input"
        title="FileInput — básico"
        description="Um único arquivo, integrado a formulários com [(ngModel)]."
        [code]="basicCode"
      >
        <div class="w-full">
          <atm-label>Anexo</atm-label>
          <atm-file-input [(ngModel)]="single" />
          <p class="mt-2 text-sm text-ink-muted">
            Selecionado: {{ single()?.name ?? 'nenhum' }}
          </p>
        </div>
      </demo-section>

      <!-- Drop area + múltiplos -->
      <demo-section
        id="file-input-dropzone"
        title="Área de drop + múltiplos"
        description="Arraste vários arquivos, com limite de tipo, tamanho e quantidade."
        [code]="dropzoneCode"
      >
        <div class="w-full">
          <atm-file-input
            [multiple]="true"
            accept="image/*,application/pdf"
            [maxSize]="5 * 1024 * 1024"
            [maxFiles]="6"
            (rejected)="onRejected()"
          />
        </div>
      </demo-section>

      <!-- Tamanhos -->
      <demo-section
        id="file-input-sizes"
        title="Tamanhos"
        description="large · medium · slim."
        [code]="sizesCode"
      >
        <div class="flex w-full flex-col gap-4">
          <atm-file-input size="large" [preview]="false" />
          <atm-file-input size="medium" [preview]="false" />
          <atm-file-input size="slim" [preview]="false" />
        </div>
      </demo-section>

      <!-- Envio via FormData -->
      <demo-section
        id="file-input-upload"
        title="Envio para API (FormData)"
        description="Progresso por arquivo via patchItem(). O snippet mostra o upload real com XMLHttpRequest."
        [code]="uploadCode"
      >
        <div class="flex w-full flex-col gap-3">
          <atm-file-input #uploader [multiple]="true" accept="image/*,.pdf,.zip,.docx,.xlsx" />
          <div class="flex gap-2">
            <atm-button
              icon="cloud-upload"
              [loading]="uploading()"
              (clicked)="upload(uploader)"
            >
              Enviar {{ uploader.items().length }} arquivo(s)
            </atm-button>
            <atm-button variant="soft" color="neutral" icon="eraser" (clicked)="uploader.clear()">
              Limpar
            </atm-button>
          </div>
        </div>
      </demo-section>

      <!-- Crop no upload -->
      <demo-section
        id="file-input-crop"
        title="Upload com recorte ([crop])"
        description="Com [crop]=true, toda imagem abre o diálogo de recorte antes de entrar na lista."
        [code]="cropUploadCode"
      >
        <div class="grid w-full gap-6 sm:grid-cols-2">
          <div>
            <atm-label>Avatar (recorte circular 1:1)</atm-label>
            <atm-file-input
              accept="image/*"
              [crop]="true"
              [cropAspect]="1"
              [cropRound]="true"
            />
          </div>
          <div>
            <atm-label>Capa (recorte livre, múltiplas)</atm-label>
            <atm-file-input accept="image/*" [multiple]="true" [crop]="true" />
          </div>
        </div>
      </demo-section>

      <!-- Componente crop standalone -->
      <demo-section
        id="image-crop"
        title="ImageCrop — componente"
        description="Recorte independente: mova/redimensione a caixa e gere o Blob/File na resolução original."
        [code]="cropCode"
      >
        <div class="grid w-full gap-6 md:grid-cols-2">
          <div>
            <atm-image-crop #cropper [src]="sampleSrc" [aspect]="16 / 9" [height]="260" />
            <div class="mt-3 flex items-center gap-2">
              <atm-button icon="crop" (clicked)="generate(cropper)">Gerar recorte</atm-button>
              <atm-button variant="ghost" color="neutral" icon="refresh" (clicked)="cropper.reset()">
                Redefinir
              </atm-button>
            </div>
          </div>
          <div class="flex flex-col">
            <atm-label>Resultado</atm-label>
            @if (result()) {
              <img
                [src]="result()"
                alt="Recorte"
                class="max-h-64 w-full rounded-atm border border-line object-contain bg-surface-alt"
              />
            } @else {
              <div
                class="flex min-h-40 flex-1 items-center justify-center rounded-atm border border-dashed
                  border-line text-sm text-ink-faint"
              >
                Clique em "Gerar recorte"
              </div>
            }
          </div>
        </div>
      </demo-section>
    </demo-page>
  `,
})
export class UploadPage {
  private readonly toast = inject(AtmToastService);

  readonly single = signal<File | null>(null);
  readonly uploading = signal(false);
  readonly result = signal<string | null>(null);
  readonly sampleSrc = `data:image/svg+xml;utf8,${encodeURIComponent(SAMPLE_SVG)}`;

  onRejected(): void {
    this.toast.warning('Arquivo(s) rejeitado(s)', 'Verifique tipo, tamanho e quantidade.');
  }

  /** Demo upload — builds FormData and simulates per-file progress. */
  async upload(uploader: AtmFileInput): Promise<void> {
    const items = uploader.items();
    if (!items.length) {
      this.toast.info('Nenhum arquivo', 'Selecione arquivos antes de enviar.');
      return;
    }

    // Real code would POST this FormData (see snippet). Here we simulate.
    const formData = new FormData();
    items.forEach((item) => formData.append('files', item.file, item.file.name));

    this.uploading.set(true);
    await Promise.all(items.map((item) => this.fakeUpload(uploader, item.id)));
    this.uploading.set(false);
    this.toast.success('Upload concluído', `${items.length} arquivo(s) enviados.`);
  }

  private fakeUpload(uploader: AtmFileInput, id: string): Promise<void> {
    return new Promise((resolve) => {
      uploader.patchItem(id, { status: 'uploading', progress: 0 });
      let progress = 0;
      const timer = setInterval(() => {
        progress += Math.random() * 22;
        if (progress >= 100) {
          clearInterval(timer);
          uploader.patchItem(id, { status: 'success', progress: 100 });
          resolve();
        } else {
          uploader.patchItem(id, { progress: Math.round(progress) });
        }
      }, 180);
    });
  }

  async generate(cropper: AtmImageCrop): Promise<void> {
    const blob = await cropper.toBlob();
    if (!blob) return;
    const previous = this.result();
    if (previous?.startsWith('blob:')) URL.revokeObjectURL(previous);
    this.result.set(URL.createObjectURL(blob));
  }

  readonly basicCode = `<atm-label>Anexo</atm-label>
<atm-file-input [(ngModel)]="single" />`;

  readonly dropzoneCode = `<atm-file-input
  [multiple]="true"
  accept="image/*,application/pdf"
  [maxSize]="5 * 1024 * 1024"
  [maxFiles]="6"
  (rejected)="onRejected($event)"
/>`;

  readonly sizesCode = `<atm-file-input size="large" />
<atm-file-input size="medium" />
<atm-file-input size="slim" />`;

  readonly uploadCode = `// template
<atm-file-input #uploader [multiple]="true" accept="image/*,.pdf" />
<atm-button [loading]="uploading()" (clicked)="upload(uploader)">Enviar</atm-button>

// component — envio real com progresso por arquivo
async upload(uploader: AtmFileInput) {
  this.uploading.set(true);
  await Promise.all(
    uploader.items().map((item) => {
      const formData = new FormData();
      formData.append('file', item.file, item.file.name);
      uploader.patchItem(item.id, { status: 'uploading', progress: 0 });

      return uploadWithProgress('/api/upload', formData, (p) =>
        uploader.patchItem(item.id, { progress: p }),
      )
        .then(() => uploader.patchItem(item.id, { status: 'success', progress: 100 }))
        .catch((e) => uploader.patchItem(item.id, { status: 'error', error: String(e) }));
    }),
  );
  this.uploading.set(false);
}

// helper reutilizável com XMLHttpRequest (fetch não expõe progresso de upload)
function uploadWithProgress(url: string, body: FormData, onProgress: (p: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };
    xhr.onload = () => (xhr.status < 400 ? resolve() : reject(xhr.statusText));
    xhr.onerror = () => reject('Erro de rede');
    xhr.send(body);
  });
}`;

  readonly cropUploadCode = `<!-- Avatar: recorte circular 1:1 -->
<atm-file-input accept="image/*" [crop]="true" [cropAspect]="1" [cropRound]="true" />

<!-- Capa: recorte livre, múltiplas imagens -->
<atm-file-input accept="image/*" [multiple]="true" [crop]="true" />`;

  readonly cropCode = `// template
<atm-image-crop #cropper [src]="file" [aspect]="16 / 9" [height]="260" />
<atm-button (clicked)="generate(cropper)">Gerar recorte</atm-button>

// component
async generate(cropper: AtmImageCrop) {
  const file = await cropper.toFile('recorte.png'); // ou toBlob()
  // ...envie o file / mostre o preview
}`;
}
