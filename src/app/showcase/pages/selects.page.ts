import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  AtmAutocomplete,
  AtmLabel,
  AtmListbox,
  AtmSelect,
  AtmSelectOption,
  AtmTags,
  AtmTagsOption,
  AtmToastService,
} from '../../../core/ui';
import { DemoPage, DemoSection } from '../demo-section.component';

interface Tech {
  id: number;
  name: string;
}

@Component({
  selector: 'selects-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    AtmSelect,
    AtmListbox,
    AtmAutocomplete,
    AtmTags,
    AtmLabel,
    DemoPage,
    DemoSection,
  ],
  template: `
    <demo-page
      title="Select, ListBox e Autocomplete"
      description="Seleção de opções locais. O painel detecta o espaço disponível na viewport e abre para cima quando necessário."
      importCode="import { AtmSelect, AtmListbox, AtmAutocomplete } from 'src/core/ui';"
    >
      <demo-section
        id="select"
        title="Select"
        description="Com teclado (setas + Enter), clearable e footer opcional de ação."
        [code]="selectCode"
      >
        <div class="grid w-full gap-4 sm:grid-cols-2">
          <div>
            <atm-label>Status</atm-label>
            <atm-select [options]="statusOptions" [(ngModel)]="status" [clearable]="true" />
          </div>
          <div>
            <atm-label>Com botão de ação</atm-label>
            <atm-select
              [options]="statusOptions"
              [hasActionButton]="true"
              actionButtonLabel="Novo status"
              (actionClick)="toast.info('Ação!', 'Abriria um modal de cadastro aqui.')"
            />
          </div>
        </div>
      </demo-section>

      <demo-section id="listbox" title="ListBox" description="Lista sempre visível, seleção única ou múltipla." [code]="listboxCode">
        <div class="grid w-full gap-4 sm:grid-cols-2">
          <div>
            <atm-label>Única</atm-label>
            <atm-listbox [options]="statusOptions" [(ngModel)]="status" />
          </div>
          <div>
            <atm-label>Múltipla</atm-label>
            <atm-listbox [options]="statusOptions" [multiple]="true" [(ngModel)]="multiStatus" />
          </div>
        </div>
      </demo-section>

      <demo-section
        id="autocomplete"
        title="Autocomplete / ComboBox"
        description="Filtro local com highlight do termo digitado."
        [code]="autocompleteCode"
      >
        <div class="w-full max-w-sm">
          <atm-label>País</atm-label>
          <atm-autocomplete
            [options]="countries"
            [(ngModel)]="country"
            placeholder="Digite para filtrar..."
          />
        </div>
        <span class="text-sm text-ink-muted">valor: {{ country() ?? '—' }}</span>
      </demo-section>

      <demo-section
        id="tags"
        title="Tags"
        description="Multi-select com sugestões (e grupos). O valor do form é um array com os values das opções — pode ser objeto vindo do backend (use compareWith). Com allowCustom, texto livre vira tag."
        [code]="tagsCode"
      >
        <div class="grid w-full gap-4 sm:grid-cols-2">
          <div>
            <atm-label>Tecnologias (values são objetos)</atm-label>
            <atm-tags
              [options]="techOptions"
              [(ngModel)]="techs"
              [compareWith]="compareById"
              placeholder="Pesquise..."
            />
            <span class="mt-1 block text-xs text-ink-muted">valor: {{ techsJson() }}</span>
          </div>
          <div>
            <atm-label>Com texto livre (allowCustom)</atm-label>
            <atm-tags
              [options]="techOptions"
              [(ngModel)]="freeTags"
              [compareWith]="compareById"
              [displayWith]="displayTag"
              [allowCustom]="true"
              [maxTags]="6"
              placeholder="Digite e pressione Enter..."
            />
          </div>
        </div>
      </demo-section>
    </demo-page>
  `,
})
export class SelectsPage {
  readonly toast = inject(AtmToastService);

  readonly status = signal<string | null>('active');
  readonly multiStatus = signal<string[]>([]);
  readonly country = signal<string | null>(null);

  /** Objetos como viriam do backend. */
  readonly techOptions: AtmTagsOption<Tech>[] = [
    { label: 'React', value: { id: 1, name: 'React' }, group: 'Frontend' },
    { label: 'Angular', value: { id: 2, name: 'Angular' }, group: 'Frontend' },
    { label: 'Vue', value: { id: 3, name: 'Vue' }, group: 'Frontend' },
    { label: 'Java', value: { id: 4, name: 'Java' }, group: 'Backend' },
    { label: 'Node.js', value: { id: 5, name: 'Node.js' }, group: 'Backend' },
    { label: 'Python', value: { id: 6, name: 'Python' }, group: 'Backend' },
  ];

  readonly techs = signal<Tech[]>([this.techOptions[1].value]);
  readonly freeTags = signal<(Tech | string)[]>([]);

  readonly compareById = (a: unknown, b: unknown) =>
    a === b || (a as Tech)?.id === (b as Tech)?.id;
  readonly displayTag = (v: unknown) => (v as Tech)?.name ?? String(v);

  techsJson(): string {
    return JSON.stringify(this.techs());
  }

  readonly statusOptions: AtmSelectOption[] = [
    { label: 'Ativo', value: 'active', icon: 'check-circled', description: 'Visível para todos' },
    { label: 'Pausado', value: 'paused', icon: 'pause' },
    { label: 'Arquivado', value: 'archived', icon: 'archive', disabled: true },
    { label: 'Rascunho', value: 'draft', icon: 'edit' },
  ];

  readonly countries: AtmSelectOption[] = [
    { label: 'Brasil', value: 'br' },
    { label: 'Portugal', value: 'pt' },
    { label: 'Argentina', value: 'ar' },
    { label: 'Alemanha', value: 'de' },
    { label: 'Austrália', value: 'au' },
    { label: 'Canadá', value: 'ca' },
    { label: 'Estados Unidos', value: 'us' },
    { label: 'Japão', value: 'jp' },
  ];

  readonly selectCode = `<atm-select
  [options]="[{ label: 'Ativo', value: 'active', icon: 'check-circled' }]"
  [(ngModel)]="status"
  [clearable]="true"
  [hasActionButton]="true"
  actionButtonLabel="Novo status"
  (actionClick)="openCreateModal()"
/>`;

  readonly listboxCode = `<atm-listbox [options]="options" [(ngModel)]="value" />
<atm-listbox [options]="options" [multiple]="true" [(ngModel)]="values" />`;

  readonly autocompleteCode = `<atm-autocomplete
  [options]="countries"
  [(ngModel)]="country"
  placeholder="Digite para filtrar..."
/>`;

  readonly tagsCode = `// options aceitam qualquer objeto como value (+ group opcional)
techOptions: AtmTagsOption<Tech>[] = [
  { label: 'React', value: { id: 1, name: 'React' }, group: 'Frontend' },
  { label: 'Java', value: { id: 4, name: 'Java' }, group: 'Backend' },
];
techs = signal<Tech[]>([]);
compareById = (a: unknown, b: unknown) => (a as Tech)?.id === (b as Tech)?.id;

<atm-tags [options]="techOptions" [(ngModel)]="techs" [compareWith]="compareById" />

<!-- texto livre vira tag (string por padrão; customize com [createTag]) -->
<atm-tags [options]="techOptions" [allowCustom]="true" [maxTags]="6" [(ngModel)]="freeTags" />`;
}
