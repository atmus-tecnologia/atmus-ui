import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  input,
  output,
  signal,
} from '@angular/core';
import {
  AbstractControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import { ATM_SIZE_HEIGHT, ATM_SIZE_PX, ATM_SIZE_TEXT, AtmSize, atmUid } from '../../types';
import { AtmValueAccessor } from '../../utils/value-accessor';

export type AtmInputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'url'
  | 'search'
  | 'currency';

/** Mask tokens: 9 = digit, a = letter, * = alphanumeric. Anything else is a literal. */
const MASK_TOKENS: Record<string, RegExp> = {
  '9': /[0-9]/,
  a: /[a-zA-Z]/,
  '*': /[a-zA-Z0-9]/,
};

/**
 * Base text input — one component for text/email/password/tel/url/search/currency.
 * Alias selectors: atm-input, atm-text-field.
 * Password type gets a visibility toggle automatically.
 *
 * Mask: `mask="(99) 99999-9999"` — 9 = digit, a = letter, * = alphanumeric,
 * other chars are literals. The form value is always UNMASKED (raw chars only).
 * Multiple masks: separate with `||` (e.g. CPF/CNPJ:
 * `mask="999.999.999-99||99.999.999/9999-99"`) — the active mask is picked by
 * the typed length.
 *
 * Incomplete mask: while typing the control is invalid with
 * `{ maskIncomplete: { requiredLength, actualLength } }`; on blur the value is
 * CLEARED if it doesn't fully match any mask. Empty value stays valid —
 * combine with Validators.required if needed.
 *
 * Currency: `type="currency"` formats as money while typing (ATM style) and the
 * form value is a plain `number` (e.g. 1234.56). Configure with `currency` + `locale`.
 */
@Component({
  selector: 'atm-input, atm-text-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => AtmInput), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => AtmInput), multi: true },
  ],
  host: { class: 'block w-full' },
  template: `
    <div [class]="wrapperClasses()">
      @if (icon()) {
        <i [class]="'shrink-0 text-ink-faint atm atm-' + icon()" aria-hidden="true"></i>
      }
      <input
        [id]="inputId()"
        [type]="resolvedType()"
        [placeholder]="placeholder()"
        [disabled]="disabled() || disabledByForm()"
        [readonly]="readonly()"
        [attr.maxlength]="maxlength() ?? null"
        [attr.autocomplete]="autocomplete() ?? null"
        [attr.inputmode]="inputMode()"
        [value]="displayValue()"
        (input)="onInput($event)"
        (blur)="onBlur($event)"
        (focus)="focused.emit()"
        class="h-full w-full min-w-0 bg-transparent outline-none placeholder:text-ink-faint disabled:cursor-not-allowed"
      />
      @if (clearable() && value()) {
        <button
          type="button"
          class="shrink-0 cursor-pointer text-ink-faint transition-colors hover:text-ink"
          aria-label="Limpar"
          (click)="clear()"
        >
          <i class="atm atm-cancel-01" aria-hidden="true"></i>
        </button>
      }
      @if (type() === 'password') {
        <button
          type="button"
          class="shrink-0 cursor-pointer text-ink-faint transition-colors hover:text-ink"
          [attr.aria-label]="showPassword() ? 'Ocultar senha' : 'Mostrar senha'"
          (click)="showPassword.set(!showPassword())"
        >
          <i [class]="showPassword() ? 'atm atm-view-off' : 'atm atm-view'" aria-hidden="true"></i>
        </button>
      }
      @if (iconRight() && type() !== 'password') {
        <i [class]="'shrink-0 text-ink-faint atm atm-' + iconRight()" aria-hidden="true"></i>
      }
    </div>
  `,
})
export class AtmInput extends AtmValueAccessor<string | number> implements Validator {
  readonly size = input<AtmSize>('medium');
  readonly type = input<AtmInputType>('text');
  readonly placeholder = input('');
  readonly icon = input<string | undefined>(undefined);
  readonly iconRight = input<string | undefined>(undefined);
  readonly disabled = input(false);
  readonly readonly = input(false);
  readonly invalid = input(false);
  readonly clearable = input(false);
  readonly maxlength = input<number | undefined>(undefined);
  readonly autocomplete = input<string | undefined>(undefined);
  readonly inputId = input(atmUid('atm-input'));
  /**
   * Format mask, e.g. "(99) 99999-9999", "99/99/9999", "999.999.999-99".
   * Multiple masks separated by "||": "999.999.999-99||99.999.999/9999-99".
   */
  readonly mask = input<string | undefined>(undefined);
  /** ISO 4217 currency code used when type="currency". */
  readonly currency = input('BRL');
  /** Locale used to format currency values. */
  readonly locale = input('pt-BR');

  readonly focused = output<void>();
  readonly cleared = output<void>();

  readonly showPassword = signal(false);

  readonly resolvedType = computed(() => {
    if (this.type() === 'password') return this.showPassword() ? 'text' : 'password';
    if (this.type() === 'currency' || this.mask()) return 'text';
    return this.type();
  });

  readonly inputMode = computed(() => {
    if (this.type() === 'currency') return 'numeric';
    const masks = this.masks();
    if (masks.length && !masks.some((m) => [...m].some((c) => c === 'a' || c === '*'))) {
      return 'numeric';
    }
    return null;
  });

  /** What the <input> element shows (masked / currency-formatted). */
  readonly displayValue = computed(() => {
    const v = this.value();
    if (v === null || v === undefined || v === '') return '';
    if (this.type() === 'currency') {
      const n = typeof v === 'number' ? v : Number(v);
      return Number.isFinite(n) ? this.formatCurrency(n) : '';
    }
    if (this.masks().length) {
      const raw = String(v);
      return this.applyMask(raw, this.activeMaskFor(raw.length)).masked;
    }
    return String(v);
  });

  readonly wrapperClasses = computed(() => {
    const size = this.size();
    return [
      'atm-field flex items-center gap-2',
      ATM_SIZE_HEIGHT[size],
      ATM_SIZE_PX[size],
      ATM_SIZE_TEXT[size],
      this.invalid() ? 'atm-field--invalid' : '',
      this.disabled() || this.disabledByForm() ? 'atm-field--disabled' : '',
    ].join(' ');
  });

  private onValidatorChange: (() => void) | undefined;

  constructor() {
    super();
    // Re-run form validation when the mask changes at runtime.
    effect(() => {
      this.masks();
      this.onValidatorChange?.();
    });
  }

  /** NG_VALIDATORS: partially filled mask ⇒ { maskIncomplete }. Empty value is valid. */
  validate(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!this.masks().length || value === null || value === undefined || value === '') return null;
    const actualLength = String(value).length;
    if (this.maskTokenCounts().includes(actualLength)) return null;
    const requiredLength = this.tokenCount(this.activeMaskFor(actualLength));
    return { maskIncomplete: { requiredLength, actualLength } };
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onValidatorChange = fn;
  }

  onInput(event: Event): void {
    const el = event.target as HTMLInputElement;
    if (this.type() === 'currency') {
      this.handleCurrencyInput(el);
      return;
    }
    if (this.masks().length) {
      this.handleMaskInput(el);
      return;
    }
    this.setValue(el.value);
  }

  onBlur(event: Event): void {
    // Value that doesn't fully match any mask is discarded on blur.
    if (this.masks().length) {
      const raw = String(this.value() ?? '');
      if (raw && !this.maskTokenCounts().includes(raw.length)) {
        (event.target as HTMLInputElement).value = '';
        this.setValue('');
        this.cleared.emit();
      }
    }
    this.onTouched();
  }

  clear(): void {
    this.setValue(this.type() === 'currency' ? null : '');
    this.cleared.emit();
  }

  // ── Mask ────────────────────────────────────────────────────────────────

  /** Parsed masks (multi-mask via "||"), sorted from shortest to longest. */
  private readonly masks = computed(() => {
    const raw = this.mask();
    if (!raw) return [];
    return raw
      .split('||')
      .map((m) => m.trim())
      .filter(Boolean)
      .sort((a, b) => this.tokenCount(a) - this.tokenCount(b));
  });

  /** Complete lengths accepted (token count of each mask). */
  private readonly maskTokenCounts = computed(() => this.masks().map((m) => this.tokenCount(m)));

  /** How many token chars (9/a/*) a mask requires to be complete. */
  private tokenCount(mask: string): number {
    return [...mask].filter((c) => MASK_TOKENS[c] !== undefined).length;
  }

  /** Shortest mask that fits `rawLength` chars; falls back to the longest one. */
  private activeMaskFor(rawLength: number): string {
    const masks = this.masks();
    return masks.find((m) => this.tokenCount(m) >= rawLength) ?? masks[masks.length - 1];
  }

  private handleMaskInput(el: HTMLInputElement): void {
    const caret = el.selectionStart ?? el.value.length;
    // Raw chars typed before the caret (literals are punctuation, so alnum ≈ raw).
    const rawBefore = (el.value.slice(0, caret).match(/[a-zA-Z0-9]/g) ?? []).length;

    // Pick the mask by a rough raw length, then re-apply if the real raw disagrees.
    const roughLength = (el.value.match(/[a-zA-Z0-9]/g) ?? []).length;
    let mask = this.activeMaskFor(roughLength);
    let result = this.applyMask(el.value, mask);
    const bestMask = this.activeMaskFor(result.raw.length);
    if (bestMask !== mask) {
      mask = bestMask;
      result = this.applyMask(el.value, mask);
    }

    el.value = result.masked;
    const pos = this.caretForRawCount(result.masked, mask, Math.min(rawBefore, result.raw.length));
    el.setSelectionRange(pos, pos);
    this.setValue(result.raw);
  }

  /** Applies a mask to free text; returns the display string and the unmasked value. */
  private applyMask(text: string, mask: string): { masked: string; raw: string } {
    let masked = '';
    let raw = '';
    let ti = 0;
    for (let mi = 0; mi < mask.length && ti < text.length; mi++) {
      const m = mask[mi];
      const token = MASK_TOKENS[m];
      if (token) {
        while (ti < text.length && !token.test(text[ti])) ti++;
        if (ti >= text.length) break;
        masked += text[ti];
        raw += text[ti];
        ti++;
      } else {
        masked += m;
        if (text[ti] === m) ti++;
      }
    }
    return { masked, raw };
  }

  /** Caret position in the masked string right after the nth raw char. */
  private caretForRawCount(masked: string, mask: string, rawCount: number): number {
    if (rawCount === 0) return 0;
    let count = 0;
    for (let i = 0; i < masked.length; i++) {
      if (MASK_TOKENS[mask[i]]) count++;
      if (count === rawCount) return i + 1;
    }
    return masked.length;
  }

  // ── Currency ────────────────────────────────────────────────────────────

  private handleCurrencyInput(el: HTMLInputElement): void {
    const digits = el.value.replace(/\D/g, '');
    if (!digits) {
      el.value = '';
      this.setValue(null);
      return;
    }
    const num = Number(digits) / 10 ** this.currencyFractionDigits();
    el.value = this.formatCurrency(num);
    el.setSelectionRange(el.value.length, el.value.length);
    this.setValue(num);
  }

  private readonly currencyFormatter = computed(
    () =>
      new Intl.NumberFormat(this.locale(), {
        style: 'currency',
        currency: this.currency(),
      }),
  );

  private readonly currencyFractionDigits = computed(
    () => this.currencyFormatter().resolvedOptions().maximumFractionDigits ?? 2,
  );

  private formatCurrency(value: number): string {
    return this.currencyFormatter().format(value);
  }
}
