import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  computed,
  forwardRef,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { ATM_SIZE_TEXT, AtmSize, atmUid } from '../../types';
import { AtmValueAccessor } from '../../utils/value-accessor';
import { AtmDialogService } from '../../services/dialog.service';
import { AtmProgressBar } from '../progress/progress-bar.component';
import { AtmImageCropDialog, AtmImageCropDialogData } from '../image-crop/image-crop.component';

/** Upload lifecycle status for a single file (driven by the host app). */
export type AtmFileStatus = 'ready' | 'uploading' | 'success' | 'error';

/** A file tracked by the input, with preview + upload state. */
export interface AtmFileItem {
  readonly id: string;
  readonly file: File;
  /** Object URL for image previews (null for non-images). */
  readonly previewUrl: string | null;
  status: AtmFileStatus;
  /** Upload progress 0..100. */
  progress: number;
  error?: string;
}

/** Reason a dropped/selected file was rejected. */
export interface AtmFileRejection {
  file: File;
  reason: 'type' | 'size' | 'maxFiles';
  message: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ['KB', 'MB', 'GB', 'TB'];
  let value = bytes;
  let i = -1;
  do {
    value /= 1024;
    i++;
  } while (value >= 1024 && i < units.length - 1);
  return `${value.toFixed(value < 10 ? 1 : 0)} ${units[i]}`;
}

function fileIcon(file: File): string {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  if (type.startsWith('image/')) return 'atm atm-image-02';
  if (type.startsWith('video/')) return 'atm atm-video-01';
  if (type.startsWith('audio/')) return 'atm atm-music-note-01';
  if (type === 'application/pdf' || name.endsWith('.pdf')) return 'atm atm-pdf-01';
  if (/\.(doc|docx)$/.test(name) || type.includes('word')) return 'atm atm-doc-01';
  if (/\.(xls|xlsx|csv)$/.test(name) || type.includes('sheet') || type.includes('excel'))
    return 'atm atm-xls-01';
  if (/\.(ppt|pptx)$/.test(name) || type.includes('presentation'))
    return 'atm atm-ppt-01';
  if (/\.(zip|rar|7z|gz|tar)$/.test(name) || type.includes('zip') || type.includes('compressed'))
    return 'atm atm-zip-01';
  if (/\.(txt|md|log)$/.test(name) || type.startsWith('text/')) return 'atm atm-txt-01';
  return 'atm atm-file-02';
}

const AREA_PAD: Record<AtmSize, string> = { large: 'p-8', medium: 'p-6', slim: 'p-4' };

/**
 * File input with a drag & drop area, multi-file support, type/size limits,
 * image thumbnails / file-type icons, per-file upload progress, and optional
 * cropping: set `[crop]="true"` and every dropped image opens the
 * {@link AtmImageCropDialog} before being added.
 *
 * Works with template-driven and reactive forms (value is `File[]`, or a
 * single `File | null` when `multiple` is false). Use `(rejected)` to react
 * to files that fail the `accept` / `maxSize` / `maxFiles` rules, and the
 * public `items` signal + `patchItem()` to drive an upload progress UI.
 */
@Component({
  selector: 'atm-file-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AtmProgressBar],
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmFileInput), multi: true },
  ],
  host: { class: 'block w-full' },
  template: `
    <!-- Drop zone -->
    <div
      class="atm-focus group relative flex flex-col items-center justify-center gap-2 rounded-atm-lg
        border-2 border-dashed text-center transition-colors duration-200"
      [class]="areaClasses()"
      [attr.aria-disabled]="isDisabled() || null"
      role="button"
      tabindex="0"
      [attr.aria-label]="dropLabel()"
      (click)="!isDisabled() && fileEl().nativeElement.click()"
      (keydown.enter)="!isDisabled() && fileEl().nativeElement.click()"
      (keydown.space)="$event.preventDefault(); !isDisabled() && fileEl().nativeElement.click()"
      (dragenter)="onDragEnter($event)"
      (dragover)="onDragOver($event)"
      (dragleave)="onDragLeave($event)"
      (drop)="onDrop($event)"
    >
      <span
        class="flex size-11 items-center justify-center rounded-full bg-surface-alt text-lg
          text-ink-muted transition-transform duration-200 group-hover:scale-105"
        [class.text-primary]="dragging()"
      >
        <i [class]="dragging() ? 'atm atm-download-01' : 'atm atm-cloud-upload'" aria-hidden="true"></i>
      </span>
      <div [class]="textSize()">
        <p class="font-medium text-ink">
          {{ dropLabel() }}
          <span class="text-primary">{{ browseLabel() }}</span>
        </p>
        <p class="mt-0.5 text-ink-faint">{{ hintText() }}</p>
      </div>

      <input
        #file
        type="file"
        class="hidden"
        [id]="inputId"
        [attr.accept]="accept() || null"
        [multiple]="multiple()"
        [disabled]="isDisabled()"
        (change)="onSelect($event)"
      />
    </div>

    @if (invalid() && errorText()) {
      <p class="mt-1.5 flex items-center gap-1 text-xs font-medium text-danger" role="alert">
        <i class="atm atm-alert-circle" aria-hidden="true"></i>{{ errorText() }}
      </p>
    }

    <!-- Previews -->
    @if (preview() && items().length) {
      <ul class="mt-3 flex flex-col gap-2">
        @for (item of items(); track item.id) {
          <li
            class="flex items-center gap-3 rounded-atm border border-line bg-surface p-2.5
              animate-atm-fade"
          >
            <!-- Thumbnail / type icon -->
            @if (item.previewUrl) {
              <img
                [src]="item.previewUrl"
                [alt]="item.file.name"
                class="size-11 shrink-0 rounded-md border border-line object-cover"
              />
            } @else {
              <span
                class="flex size-11 shrink-0 items-center justify-center rounded-md bg-surface-alt
                  text-xl text-ink-muted"
              >
                <i [class]="icon(item.file)" aria-hidden="true"></i>
              </span>
            }

            <div class="min-w-0 flex-1">
              <div class="flex items-center gap-2">
                <span class="min-w-0 flex-1 truncate text-sm font-medium text-ink">
                  {{ item.file.name }}
                </span>
                @switch (item.status) {
                  @case ('success') {
                    <i class="atm atm-checkmark-circle-01 text-success" aria-hidden="true"></i>
                  }
                  @case ('error') {
                    <i class="atm atm-cancel-circle text-danger" aria-hidden="true"></i>
                  }
                }
              </div>
              <div class="mt-0.5 flex items-center gap-2 text-xs text-ink-faint">
                <span>{{ formatSize(item.file.size) }}</span>
                @if (item.status === 'error' && item.error) {
                  <span class="truncate text-danger">· {{ item.error }}</span>
                }
              </div>
              @if (item.status === 'uploading') {
                <div class="mt-1.5">
                  <atm-progress-bar size="slim" [value]="item.progress" />
                </div>
              }
            </div>

            <button
              type="button"
              class="atm-focus flex size-8 shrink-0 cursor-pointer items-center justify-center
                rounded-full text-ink-muted transition-colors hover:bg-danger-soft hover:text-danger
                disabled:pointer-events-none disabled:opacity-40"
              [disabled]="isDisabled() || item.status === 'uploading'"
              aria-label="Remover arquivo"
              (click)="remove(item.id)"
            >
              <i class="atm atm-delete-02" aria-hidden="true"></i>
            </button>
          </li>
        }
      </ul>
    }
  `,
})
export class AtmFileInput extends AtmValueAccessor<File | File[]> {
  private readonly dialog = inject(AtmDialogService);
  private readonly destroyRef = inject(DestroyRef);

  readonly size = input<AtmSize>('medium');
  readonly multiple = input(false);
  /** Native accept string, e.g. `image/*` or `.pdf,.docx`. */
  readonly accept = input('');
  /** Max size per file in bytes (0 = unlimited). */
  readonly maxSize = input(0);
  /** Max number of files (0 = unlimited; ignored when not multiple). */
  readonly maxFiles = input(0);
  readonly disabled = input(false);
  readonly invalid = input(false);
  /** Show the thumbnail/preview list below the drop zone. */
  readonly preview = input(true);

  /** Open the crop dialog for every image before adding it. */
  readonly crop = input(false);
  /** Fixed aspect ratio for cropping (width / height). `null` = free. */
  readonly cropAspect = input<number | null>(null);
  /** Circular crop (avatars). */
  readonly cropRound = input(false);

  /** Custom labels / hint. */
  readonly dropLabel = input('Arraste arquivos aqui ou');
  readonly browseLabel = input('procure');
  readonly hint = input('');

  /** Emits the current File list whenever it changes. */
  readonly filesChange = output<File[]>();
  /** Emits when files are rejected by accept/size/count rules. */
  readonly rejected = output<AtmFileRejection[]>();

  readonly inputId = atmUid('atm-file');
  readonly fileEl = viewChild.required<ElementRef<HTMLInputElement>>('file');
  readonly dragging = signal(false);
  private dragDepth = 0;

  private readonly _items = signal<AtmFileItem[]>([]);
  /** Read-only view of the tracked files (for driving an upload UI). */
  readonly items = this._items.asReadonly();

  readonly isDisabled = computed(() => this.disabled() || this.disabledByForm());
  readonly textSize = computed(() => ATM_SIZE_TEXT[this.size()]);

  readonly areaClasses = computed(() => {
    const parts = [AREA_PAD[this.size()]];
    if (this.isDisabled()) parts.push('cursor-not-allowed opacity-60 border-line bg-surface-alt/40');
    else if (this.dragging()) parts.push('cursor-copy border-primary bg-primary-soft');
    else if (this.invalid()) parts.push('cursor-pointer border-danger/60 bg-surface hover:bg-surface-alt/50');
    else parts.push('cursor-pointer border-line bg-surface hover:border-line-strong hover:bg-surface-alt/50');
    return parts.join(' ');
  });

  readonly hintText = computed(() => {
    if (this.hint()) return this.hint();
    const bits: string[] = [];
    if (this.accept()) bits.push(this.accept());
    if (this.maxSize()) bits.push(`até ${formatBytes(this.maxSize())}`);
    if (this.multiple() && this.maxFiles()) bits.push(`máx. ${this.maxFiles()} arquivos`);
    else if (!this.multiple()) bits.push('1 arquivo');
    return bits.join(' · ');
  });

  readonly errorText = signal('');

  constructor() {
    super();
    this.destroyRef.onDestroy(() => this.revokeAll());
  }

  // --- template helpers -------------------------------------------------
  formatSize(bytes: number): string {
    return formatBytes(bytes);
  }
  icon(file: File): string {
    return fileIcon(file);
  }

  // --- CVA --------------------------------------------------------------
  override writeValue(value: File | File[] | null): void {
    this.revokeAll();
    const files = value ? (Array.isArray(value) ? value : [value]) : [];
    this._items.set(files.map((f) => this.toItem(f)));
    super.writeValue(value);
  }

  // --- drag & drop ------------------------------------------------------
  onDragEnter(event: DragEvent): void {
    if (this.isDisabled()) return;
    event.preventDefault();
    this.dragDepth++;
    this.dragging.set(true);
  }
  onDragOver(event: DragEvent): void {
    if (this.isDisabled()) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
  }
  onDragLeave(event: DragEvent): void {
    if (this.isDisabled()) return;
    event.preventDefault();
    this.dragDepth = Math.max(0, this.dragDepth - 1);
    if (this.dragDepth === 0) this.dragging.set(false);
  }
  onDrop(event: DragEvent): void {
    if (this.isDisabled()) return;
    event.preventDefault();
    this.dragDepth = 0;
    this.dragging.set(false);
    const files = event.dataTransfer?.files;
    if (files?.length) void this.handleFiles(Array.from(files));
  }

  onSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) void this.handleFiles(Array.from(input.files));
    input.value = ''; // allow re-selecting the same file
  }

  // --- core -------------------------------------------------------------
  private async handleFiles(incoming: File[]): Promise<void> {
    this.errorText.set('');
    const rejections: AtmFileRejection[] = [];
    let accepted: File[] = [];

    for (const file of incoming) {
      if (!this.matchesAccept(file)) {
        rejections.push({ file, reason: 'type', message: `Tipo não permitido: ${file.name}` });
        continue;
      }
      if (this.maxSize() && file.size > this.maxSize()) {
        rejections.push({
          file,
          reason: 'size',
          message: `${file.name} excede ${formatBytes(this.maxSize())}`,
        });
        continue;
      }
      accepted.push(file);
    }

    if (!this.multiple()) accepted = accepted.slice(0, 1);

    // Enforce maxFiles against the already-selected files.
    if (this.multiple() && this.maxFiles()) {
      const room = this.maxFiles() - this._items().length;
      if (accepted.length > room) {
        accepted.slice(Math.max(0, room)).forEach((file) =>
          rejections.push({ file, reason: 'maxFiles', message: `Limite de ${this.maxFiles()} arquivos` }),
        );
        accepted = accepted.slice(0, Math.max(0, room));
      }
    }

    if (rejections.length) {
      this.errorText.set(rejections[0].message);
      this.rejected.emit(rejections);
    }

    // Optionally crop images before adding them.
    const finalFiles: File[] = [];
    for (const file of accepted) {
      if (this.crop() && file.type.startsWith('image/')) {
        const cropped = await this.openCrop(file);
        if (cropped) finalFiles.push(cropped);
      } else {
        finalFiles.push(file);
      }
    }

    if (!finalFiles.length) return;

    // Single-file mode replaces the previous selection: revoke its preview.
    if (!this.multiple()) this.revokeAll();

    const newItems = finalFiles.map((f) => this.toItem(f));
    this._items.update((list) => (this.multiple() ? [...list, ...newItems] : newItems));
    this.emit();
  }

  private openCrop(file: File): Promise<File | null> {
    return new Promise((resolve) => {
      const ref = this.dialog.open<File, AtmImageCropDialogData>(AtmImageCropDialog, {
        header: 'Recortar imagem',
        width: '44rem',
        maximizable: false,
        dismissableMask: false,
        data: {
          src: file,
          fileName: file.name,
          aspect: this.cropAspect(),
          round: this.cropRound(),
          outputType: file.type || 'image/png',
        },
      });
      ref.onClose.subscribe((result) => resolve(result ?? null));
    });
  }

  remove(id: string): void {
    const item = this._items().find((i) => i.id === id);
    if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl);
    this._items.update((list) => list.filter((i) => i.id !== id));
    this.emit();
  }

  /** Clear all files. */
  clear(): void {
    this.revokeAll();
    this._items.set([]);
    this.emit();
  }

  /** Patch a tracked item — drive upload progress/status from the host. */
  patchItem(id: string, patch: Partial<Pick<AtmFileItem, 'status' | 'progress' | 'error'>>): void {
    this._items.update((list) => list.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  }

  private toItem(file: File): AtmFileItem {
    return {
      id: atmUid('file'),
      file,
      previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
      status: 'ready',
      progress: 0,
    };
  }

  private emit(): void {
    const files = this._items().map((i) => i.file);
    this.filesChange.emit(files);
    this.setValue(this.multiple() ? files : (files[0] ?? null));
    this.onTouched();
  }

  private matchesAccept(file: File): boolean {
    const accept = this.accept().trim();
    if (!accept) return true;
    const name = file.name.toLowerCase();
    const type = file.type.toLowerCase();
    return accept
      .split(',')
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean)
      .some((pattern) => {
        if (pattern.startsWith('.')) return name.endsWith(pattern);
        if (pattern.endsWith('/*')) return type.startsWith(pattern.slice(0, -1));
        return type === pattern;
      });
  }

  private revokeAll(): void {
    this._items().forEach((i) => i.previewUrl && URL.revokeObjectURL(i.previewUrl));
  }
}
