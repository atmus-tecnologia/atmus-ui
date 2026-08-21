import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

/**
 * Showcase building block: renders a titled demo area (projected content)
 * plus a collapsible code snippet with copy button.
 */
@Component({
  selector: 'demo-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // [attr.title]: null removes the static title="" attribute from the DOM,
  // otherwise the browser shows a native tooltip over the section.
  host: { class: 'block', '[attr.title]': 'null' },
  template: `
    <section class="mb-10">
      @if (title()) {
        <h2 class="mb-1 text-lg font-semibold text-ink">{{ title() }}</h2>
      }
      @if (description()) {
        <p class="mb-4 text-sm text-ink-muted">{{ description() }}</p>
      }
      <div class="overflow-hidden rounded-atm-lg border border-line">
        <div class="flex flex-wrap items-center gap-4 bg-surface p-6">
          <ng-content />
        </div>
        @if (code()) {
          <div class="border-t border-line">
            <div class="flex items-center justify-between bg-surface-alt/60 px-4 py-2">
              <span class="text-xs font-medium text-ink-faint">{{ language() }}</span>
              <button
                type="button"
                class="atm-focus flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1 text-xs
                  font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink"
                (click)="copy()"
              >
                <i [class]="copied() ? 'atm atm-tick-02 text-success' : 'atm atm-copy'" aria-hidden="true"></i>
                {{ copied() ? 'Copiado!' : 'Copiar' }}
              </button>
            </div>
            <pre
              class="max-h-96 overflow-auto bg-surface-alt/30 p-4 text-[13px] leading-relaxed text-ink"
            ><code>{{ code() }}</code></pre>
          </div>
        }
      </div>
    </section>
  `,
})
export class DemoSection {
  readonly title = input('');
  readonly description = input('');
  readonly code = input('');
  readonly language = input('html');

  readonly copied = signal(false);

  copy(): void {
    navigator.clipboard.writeText(this.code()).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }
}

/** Page header for showcase pages. */
@Component({
  selector: 'demo-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block', '[attr.title]': 'null' },
  template: `
    <header class="mb-8">
      <h1 class="text-3xl font-bold tracking-tight text-ink">{{ title() }}</h1>
      <p class="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{{ description() }}</p>
      @if (importCode()) {
        <div class="mt-4 flex items-center gap-2 overflow-x-auto rounded-atm bg-surface-alt px-4 py-3">
          <code class="font-mono text-[13px] whitespace-nowrap text-primary">{{ importCode() }}</code>
        </div>
      }
    </header>
    <ng-content />
  `,
})
export class DemoPage {
  readonly title = input('');
  readonly description = input('');
  readonly importCode = input('');
}
