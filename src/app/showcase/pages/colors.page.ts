import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AtmColorField,
  AtmColorSwatch,
  AtmColorSwatchPicker,
  AtmLabel,
} from '@atmus/ngui';
import { DemoPage, DemoSection } from '../demo-section.component';

@Component({
  selector: 'colors-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    AtmColorSwatch,
    AtmColorSwatchPicker,
    AtmColorField,
    AtmLabel,
    DemoPage,
    DemoSection,
  ],
  template: `
    <demo-page
      title="Cores"
      description="Componentes de seleção e exibição de cor."
      importCode="import { AtmColorSwatch, AtmColorSwatchPicker, AtmColorField } from '@atmus/ngui';"
    >
      <demo-section id="color-swatch" title="ColorSwatch" [code]="swatchCode">
        <atm-color-swatch color="#6366f1" size="large" />
        <atm-color-swatch color="#10b981" />
        <atm-color-swatch color="#ef4444" size="slim" />
      </demo-section>

      <demo-section id="color-swatch-picker" title="ColorSwatchPicker" [code]="pickerCode">
        <div class="flex w-full flex-col gap-3">
          <atm-color-swatch-picker [(ngModel)]="brandColor" />
          <span class="text-sm text-ink-muted">
            selecionado:
            <code class="font-mono text-primary">{{ brandColor() ?? '—' }}</code>
          </span>
        </div>
      </demo-section>

      <demo-section
        id="color-field"
        title="ColorField / ColorPicker"
        description="Hex digitável + popup próprio com cores sugeridas, área de saturação/brilho e slider de matiz."
        [code]="fieldCode"
      >
        <div class="flex w-full max-w-xs flex-col gap-4">
          <div>
            <atm-label>Cor da marca</atm-label>
            <atm-color-field [(ngModel)]="brandColor" />
          </div>
          <div>
            <atm-label>Sem sugestões</atm-label>
            <atm-color-field [(ngModel)]="brandColor" [presets]="[]" size="slim" />
          </div>
        </div>
      </demo-section>

      <demo-section
        title="Tokens do tema"
        description="Sobrescreva no :root do projeto para mudar a marca inteira."
        [code]="tokensCode"
        language="css"
      >
        <div class="flex flex-wrap gap-3">
          @for (token of tokens; track token.name) {
            <div class="flex items-center gap-2 rounded-atm border border-line px-3 py-2">
              <span class="size-5 rounded-md border border-line" [style.background]="token.css"></span>
              <code class="font-mono text-xs text-ink-muted">{{ token.name }}</code>
            </div>
          }
        </div>
      </demo-section>
    </demo-page>
  `,
})
export class ColorsPage {
  readonly brandColor = signal<string | null>('#6366f1');

  readonly tokens = [
    { name: '--atm-primary', css: 'var(--atm-primary)' },
    { name: '--atm-success', css: 'var(--atm-success)' },
    { name: '--atm-warning', css: 'var(--atm-warning)' },
    { name: '--atm-danger', css: 'var(--atm-danger)' },
    { name: '--atm-info', css: 'var(--atm-info)' },
    { name: '--atm-surface', css: 'var(--atm-surface)' },
  ];

  readonly swatchCode = `<atm-color-swatch color="#6366f1" size="large" />`;

  readonly pickerCode = `<atm-color-swatch-picker [colors]="['#ef4444', '#6366f1', ...]" [(ngModel)]="color" />`;

  readonly fieldCode = `<atm-color-field [(ngModel)]="brandColor" />
<!-- presets customizados ou [] para esconder a linha de sugestões -->
<atm-color-field [(ngModel)]="brandColor" [presets]="['#1655BA', '#4DD186']" />`;

  readonly tokensCode = `:root {
  --atm-primary: #6366f1;
  --atm-radius: 0.625rem;
  /* ... veja @atmus/ngui/styles/atmus.css */
}`;
}
