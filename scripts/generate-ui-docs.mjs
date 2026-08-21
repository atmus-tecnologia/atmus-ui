import fs from 'fs';
import path from 'path';

const ROOT = 'projects/ngui/src/lib';
const OUT = 'projects/ngui/docs';
fs.mkdirSync(OUT, { recursive: true });

const COMPONENT_FILES = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.ts$/.test(e.name) && !e.name.endsWith('.spec.ts')) COMPONENT_FILES.push(p);
  }
}
walk(path.join(ROOT, 'components'));
walk(path.join(ROOT, 'services'));
for (const f of ['types.ts', 'config.ts']) COMPONENT_FILES.push(path.join(ROOT, f));
for (const f of ['value-accessor.ts', 'overlay-base.ts', 'position.ts']) {
  COMPONENT_FILES.push(path.join(ROOT, 'utils', f));
}

/** Curated purpose + usage tips per selector / class key */
const META = {
  'atm-icon': {
    purpose: 'Renderiza um ícone do Atmus Icons pelo nome.',
    tips:
      'Use nomes sem o prefixo `atm-` (ex.: name="tick-02"). O componente já adiciona a ' +
      'classe base `atm`, obrigatória para o glifo renderizar. Lista completa em ' +
      '`@atmus/icons/icons.json`; o pacote também exporta o tipo `AtmIconName`.',
    example: `<atm-icon name="tick-02" class="text-lg" />`,
  },
  'atm-spinner': {
    purpose: 'Indicador de carregamento circular.',
    example: `<atm-spinner size="medium" />`,
  },
  'atm-button': {
    purpose: 'Botão com variantes, cores e tamanhos do design system.',
    tips: 'Prefira color/variant de token. loading desabilita o clique.',
    example: `<atm-button color="primary" variant="solid" (click)="save()">Salvar</atm-button>`,
  },
  'atm-button-group': {
    purpose: 'Agrupa botões lado a lado (borda compartilhada).',
    example: `<atm-button-group>\n  <atm-button variant="outline">A</atm-button>\n  <atm-button variant="outline">B</atm-button>\n</atm-button-group>`,
  },
  'atm-close-button': {
    purpose: 'Botão de fechar padronizado (X).',
    example: `<atm-close-button (click)="close()" />`,
  },
  'atm-label': { purpose: 'Label de campo de formulário.', example: `<atm-label for="email">E-mail</atm-label>` },
  'atm-description': { purpose: 'Texto de ajuda abaixo do campo.', example: `<atm-description>Usaremos para contato.</atm-description>` },
  'atm-error-message': { purpose: 'Mensagem de erro de validação.', example: `<atm-error-message>Campo obrigatório</atm-error-message>` },
  'atm-fieldset': { purpose: 'Agrupa campos com legenda.', example: `<atm-fieldset legend="Endereço">...</atm-fieldset>` },
  'atm-input': {
    purpose: 'Campo de texto com CVA (ngModel/FormControl).',
    tips: 'Suporta clearable, password toggle, ícones. Use size large|medium|slim.',
    example: `<atm-input [(ngModel)]="email" placeholder="E-mail" clearable />`,
  },
  'atm-input-group': {
    purpose: 'Campo com prefix/suffix (texto ou projeção atmPrefix/atmSuffix).',
    example: `<atm-input-group prefix="R$">\n  <atm-input [(ngModel)]="valor" />\n</atm-input-group>`,
  },
  'atm-textarea': { purpose: 'Área de texto multilinha com CVA.', example: `<atm-textarea [(ngModel)]="bio" rows="4" />` },
  'atm-number-field': { purpose: 'Campo numérico com steppers e CVA.', example: `<atm-number-field [(ngModel)]="qtd" [min]="0" [max]="99" />` },
  'atm-search-field': { purpose: 'Campo de busca com debounce/clear.', example: `<atm-search-field [(ngModel)]="q" placeholder="Buscar..." />` },
  'atm-input-otp': { purpose: 'Input de código OTP (dígitos separados).', example: `<atm-input-otp [(ngModel)]="code" [length]="6" />` },
  'atm-rich-text': {
    purpose: 'Editor rich-text com toolbar e integração de assistente opcional.',
    tips: 'Valor tipicamente HTML string via CVA.',
    example: `<atm-rich-text [(ngModel)]="html" />`,
  },
  'atm-file-input': {
    purpose: 'Upload de arquivos com preview, validação e estados.',
    tips: 'CVA tipicamente File[] / itens. Aceita accept, multiple, maxSize.',
    example: `<atm-file-input [(ngModel)]="files" accept="image/*" multiple />`,
  },
  'atm-image-crop': { purpose: 'Recorte de imagem interativo.', example: `<atm-image-crop [src]="url" (cropped)="onCrop($event)" />` },
  'atm-image-crop-dialog': { purpose: 'Dialog wrapper para recorte de imagem.', example: `<!-- Preferir via AtmDialogService / showcase -->` },
  'atm-signature': { purpose: 'Canvas de assinatura manuscrita.', example: `<atm-signature [(ngModel)]="sigDataUrl" />` },
  'atm-qrcode': { purpose: 'Gera QR Code a partir de texto/URL.', example: `<atm-qrcode value="https://atmus.com" [size]="160" />` },
  'atm-checkbox': { purpose: 'Checkbox com CVA boolean/indeterminate.', example: `<atm-checkbox [(ngModel)]="ok">Aceito</atm-checkbox>` },
  'atm-checkbox-group': { purpose: 'Grupo de checkboxes com valor array.', example: `<atm-checkbox-group [(ngModel)]="selected" [options]="opts" />` },
  'atm-radio-group': { purpose: 'Grupo de radio buttons com CVA.', example: `<atm-radio-group [(ngModel)]="plan" [options]="plans" />` },
  'atm-switch': { purpose: 'Toggle on/off com CVA boolean.', example: `<atm-switch [(ngModel)]="ativo" label="Ativo" />` },
  'atm-slider': { purpose: 'Slider numérico com CVA.', example: `<atm-slider [(ngModel)]="vol" [min]="0" [max]="100" />` },
  'atm-select': {
    purpose: 'Select dropdown com busca, multiple, action button e CVA.',
    tips: 'Estende overlay + CVA. Options: {value,label,description?,disabled?,icon?}.',
    example: `<atm-select [(ngModel)]="id" [options]="options" placeholder="Escolha" />`,
  },
  'atm-listbox': { purpose: 'Lista selecionável estática (single/multi).', example: `<atm-listbox [(ngModel)]="v" [options]="opts" />` },
  'atm-autocomplete': { purpose: 'Autocomplete/combobox com filtro local.', example: `<atm-autocomplete [(ngModel)]="v" [options]="opts" />` },
  'atm-combobox-user': {
    purpose: 'Combobox de usuários com avatar, tabs e multiple chips.',
    tips: 'Options tipicamente com avatar/description.',
    example: `<atm-combobox-user [(ngModel)]="userId" [options]="users" />`,
  },
  'atm-dropdown': { purpose: 'Menu dropdown de ações (não é form field).', example: `<atm-dropdown [items]="menuItems">\n  <atm-button variant="ghost">Ações</atm-button>\n</atm-dropdown>` },
  'atm-dropdown-remote': {
    purpose: 'Dropdown que busca opções via AtmRemoteDataSource (API paginada).',
    tips: 'Requer dataSource. Debounce 300ms, limit ~10. serverUrl via provideAtmusUi.',
    example: `<atm-dropdown-remote [(ngModel)]="id" [dataSource]="contactsDs" labelKey="name" valueKey="id" />`,
  },
  'atm-context-menu': { purpose: 'Menu de contexto (botão direito).', example: `<div [atmContextMenu]="menu">...</div>\n<atm-context-menu #menu [items]="items" />` },
  'atmContextMenu': { purpose: 'Diretiva trigger do context menu.', example: `<div [atmContextMenu]="menuRef">Clique direito</div>` },
  'atm-tooltip': { purpose: 'Diretiva de tooltip no host.', example: `<button [atmTooltip]="'Salvar'" atmTooltipPlacement="top">...</button>` },
  'atmTooltip': { purpose: 'Diretiva de tooltip no host.', example: `<button [atmTooltip]="'Salvar'">...</button>` },
  'atm-tooltip-panel': { purpose: 'Painel interno do tooltip (uso interno).', example: `<!-- criado automaticamente pela diretiva atmTooltip -->` },
  'atm-popover': { purpose: 'Popover/painel flutuante ancorado a um trigger.', example: `<atm-popover>\n  <button>Info</button>\n  <!-- conteúdo do painel -->\n</atm-popover>` },
  'atm-modal': {
    purpose: 'Modal declarativo com open, título, expand e slots.',
    tips: 'Para abrir componente dinamicamente use AtmDialogService.',
    example: `<atm-modal [(open)]="show" header="Detalhes">Conteúdo</atm-modal>`,
  },
  'atm-drawer': { purpose: 'Painel lateral (drawer) com posição e open model.', example: `<atm-drawer [(open)]="open" position="right" header="Filtros">...</atm-drawer>` },
  'atm-toast-container': {
    purpose: 'Host visual dos toasts; use AtmToastService para disparar.',
    tips: 'Coloque uma vez no shell/layout.',
    example: `<atm-toast-container />`,
  },
  'atm-badge': { purpose: 'Badge/etiqueta semântica.', example: `<atm-badge color="success">Ativo</atm-badge>` },
  'atm-chip': { purpose: 'Chip clicável/removível.', example: `<atm-chip removable (remove)="onRemove()">Tag</atm-chip>` },
  'atm-avatar': { purpose: 'Avatar com imagem, iniciais ou ícone.', example: `<atm-avatar src="/a.jpg" name="Ana" size="medium" />` },
  'atm-avatar-group': { purpose: 'Grupo de avatars com overflow (+N).', example: `<atm-avatar-group [max]="3">...</atm-avatar-group>` },
  'atm-alert': { purpose: 'Alerta inline dismissible com cor e ação.', example: `<atm-alert color="warning" title="Atenção" dismissible>Msg</atm-alert>` },
  'atm-card': { purpose: 'Card com header/body/footer via projeção.', example: `<atm-card header="Título" subheader="Descrição">Corpo</atm-card>` },
  'atm-surface': { purpose: 'Superfície genérica com tokens de fundo/borda.', example: `<atm-surface class="p-4">...</atm-surface>` },
  'atm-skeleton': { purpose: 'Placeholder de loading (skeleton).', example: `<atm-skeleton class="h-4 w-40" />` },
  'atm-progress-bar': { purpose: 'Barra de progresso determinada/indeterminada.', example: `<atm-progress-bar [value]="40" />` },
  'atm-progress-circle': { purpose: 'Progresso circular.', example: `<atm-progress-circle [value]="70" />` },
  'atm-meter': { purpose: 'Medidor com faixas (meter).', example: `<atm-meter [value]="80" [max]="100" label="Uso" />` },
  'atm-accordion': { purpose: 'Accordion/disclosure group.', example: `<atm-accordion>\n  <atm-accordion-item header="Item 1">Conteúdo</atm-accordion-item>\n</atm-accordion>` },
  'atm-accordion-item': { purpose: 'Item de accordion com header e conteúdo projetado.', example: `<atm-accordion-item header="Detalhes" [(expanded)]="open">...</atm-accordion-item>` },
  'atm-tabs': { purpose: 'Abas com conteúdo projetado via atm-tab.', example: `<atm-tabs [(value)]="tab">\n  <atm-tab value="a" label="A">...</atm-tab>\n</atm-tabs>` },
  'atm-tab': { purpose: 'Painel de aba (filho de atm-tabs).', example: `<atm-tab value="a" label="Geral">...</atm-tab>` },
  'atm-pagination': { purpose: 'Paginação controlada.', example: `<atm-pagination [page]="page" [totalItems]="total" [pageSize]="10" (pageChange)="load($event)" />` },
  'atm-breadcrumbs': { purpose: 'Trilha de navegação.', example: `<atm-breadcrumbs [items]="crumbs" />` },
  'atm-table': {
    purpose: 'Tabela rica: sort, filter, seleção, templates, paginação e remote dataSource.',
    tips: 'Colunas AtmTableColumn. Remote usa AtmRemoteDataSource (nest-paginator).',
    example: `<atm-table [columns]="cols" [rows]="rows" [selectable]="true" [(selection)]="sel" />`,
  },
  'atm-toggle-button': { purpose: 'Botão toggle (pressionado/não).', example: `<atm-toggle-button [(pressed)]="on">Bold</atm-toggle-button>` },
  'atm-toggle-button-group': { purpose: 'Grupo de toggle (single/multi).', example: `<atm-toggle-button-group [(value)]="align">...</atm-toggle-button-group>` },
  'atm-tag-group': { purpose: 'Grupo de tags selecionáveis.', example: `<atm-tag-group [(ngModel)]="tags" [options]="opts" />` },
  'atm-tags': {
    purpose: 'Input de tags com criação, grupos e action button.',
    example: `<atm-tags [(ngModel)]="tags" [options]="suggestions" creatable />`,
  },
  'atm-toolbar': { purpose: 'Barra de ferramentas com slots.', example: `<atm-toolbar>...</atm-toolbar>` },
  'atm-action-bar': {
    purpose: 'Barra de ações flutuante (seleção em massa).',
    example: `<atm-action-bar [open]="sel.length>0" [count]="sel.length" (closed)="clear()">\n  <atm-button>Excluir</atm-button>\n</atm-action-bar>`,
  },
  'atm-separator': { purpose: 'Separador horizontal/vertical.', example: `<atm-separator />` },
  'atm-kbd': { purpose: 'Representa tecla de atalho.', example: `<atm-kbd>Ctrl</atm-kbd>` },
  'atm-link': { purpose: 'Link estilizado do design system.', example: `<atm-link href="/docs">Docs</atm-link>` },
  'atm-scroll-shadow': { purpose: 'Wrapper que mostra sombra quando há overflow scroll.', example: `<atm-scroll-shadow class="max-h-64">...</atm-scroll-shadow>` },
  'atm-typography': { purpose: 'Texto tipográfico com variantes (title, body, etc).', example: `<atm-typography variant="title">Título</atm-typography>` },
  'atm-calendar': { purpose: 'Calendário de seleção de data (single/range).', example: `<atm-calendar [(value)]="date" />` },
  'atm-date-picker': { purpose: 'Date picker overlay com CVA Date/string.', example: `<atm-date-picker [(ngModel)]="date" />` },
  'atm-date-range-picker': { purpose: 'Range de datas com presets opcionais.', example: `<atm-date-range-picker [(ngModel)]="range" [presets]="presets" />` },
  'atm-time-field': { purpose: 'Campo de horário.', example: `<atm-time-field [(ngModel)]="time" />` },
  'atm-color-swatch': { purpose: 'Swatch de cor visual.', example: `<atm-color-swatch color="#3366ff" />` },
  'atm-color-swatch-picker': { purpose: 'Grade de swatches selecionáveis.', example: `<atm-color-swatch-picker [(ngModel)]="c" [colors]="palette" />` },
  'atm-color-field': { purpose: 'Campo de cor com picker.', example: `<atm-color-field [(ngModel)]="color" />` },
  'atm-chart': { purpose: 'Gráficos (chart) configuráveis.', example: `<atm-chart [type]="'bar'" [data]="chartData" />` },
  'atm-audio-visualizer': { purpose: 'Visualizador de áudio (waveform/bars).', example: `<atm-audio-visualizer [stream]="mediaStream" />` },
  'atm-kanban': {
    purpose: 'Quadro Kanban com colunas, cards e drag-and-drop.',
    example: `<atm-kanban [columns]="cols" [(cards)]="cards" />`,
  },
  'atm-event-calendar': {
    purpose: 'Calendário de eventos (views dia/semana/mês).',
    example: `<atm-event-calendar [events]="events" (eventClick)="onEvent($event)" />`,
  },
  'atm-flow': {
    purpose: 'Editor de fluxos/nodes com edges, zoom e history.',
    tips: 'Defina templates de node com ng-template atmFlowNode. Handles via atm-flow-handle.',
    example: `<atm-flow [(nodes)]="nodes" [(edges)]="edges">\n  <ng-template atmFlowNode="task" let-node>\n    <div>{{ node.data.label }}</div>\n    <atm-flow-handle type="source" />\n  </ng-template>\n</atm-flow>`,
  },
  'atm-flow-handle': { purpose: 'Handle de conexão de node no flow.', example: `<atm-flow-handle type="target" position="left" />` },
  'atm-flow-node': { purpose: 'Diretiva ng-template[atmFlowNode] para registrar tipo de node.', example: `<ng-template atmFlowNode="task" let-node>...</ng-template>` },
  AtmToastService: {
    purpose: 'Serviço imperativo de toasts.',
    example: `inject(AtmToastService).success('Salvo!');`,
  },
  AtmDialogService: {
    purpose: 'Abre componentes em dialog imperativo (createComponent + body).',
    example: `const ref = inject(AtmDialogService).open(MyComp, { data, title: 'Edit' });\nref.onClose.subscribe(...)`,
  },
  AtmAlertDialogService: {
    purpose: 'Confirm/alert dialog retornando Promise.',
    example: `const ok = await inject(AtmAlertDialogService).confirm({ title: 'Excluir?', message: '...' });`,
  },
  AtmThemeService: {
    purpose: 'Tema light/dark/system com persistência.',
    example: `inject(AtmThemeService).setTheme('dark');`,
  },
  AtmDialogShell: {
    purpose: 'Shell interno do dialog imperativo.',
    example: `<!-- uso interno do AtmDialogService -->`,
  },
  AtmAlertDialog: {
    purpose: 'Componente interno do alert dialog.',
    example: `<!-- uso interno do AtmAlertDialogService -->`,
  },
  AtmDialogRef: {
    purpose: 'Referência retornada por AtmDialogService.open.',
    example: `ref.close(result); ref.onClose.subscribe(...)`,
  },
};

function extractBlockComments(src, index) {
  const before = src.slice(0, index);
  const m = before.match(/\/\*\*([\s\S]*?)\*\/\s*$/);
  if (!m) return '';
  return m[1].replace(/^\s*\*\s?/gm, '').trim();
}

function extractInterfaces(src) {
  const out = [];
  const re = /export\s+(interface|type)\s+(\w+)/g;
  let m;
  while ((m = re.exec(src))) {
    const kind = m[1];
    const name = m[2];
    const start = m.index;
    let i = m.index + m[0].length;
    // skip generics <...> with nested <>
    while (src[i] === ' ' || src[i] === '\n' || src[i] === '\r' || src[i] === '\t') i++;
    if (src[i] === '<') {
      let depth = 0;
      for (; i < src.length; i++) {
        if (src[i] === '<') depth++;
        else if (src[i] === '>') {
          depth--;
          if (depth === 0) {
            i++;
            break;
          }
        }
      }
    }
    while (src[i] === ' ' || src[i] === '\n' || src[i] === '\r' || src[i] === '\t') i++;
    if (kind === 'interface' || src[i] === '{') {
      const brace = src.indexOf('{', start);
      if (brace < 0) continue;
      let depth = 0;
      let end = brace;
      for (; end < src.length; end++) {
        if (src[end] === '{') depth++;
        else if (src[end] === '}') {
          depth--;
          if (depth === 0) {
            end++;
            break;
          }
        }
      }
      out.push({ name, body: src.slice(start, end).trim() });
    } else {
      // type alias — end at first top-level semicolon
      let end = i;
      let depthAngle = 0;
      let depthBrace = 0;
      let depthParen = 0;
      for (; end < src.length; end++) {
        const ch = src[end];
        if (ch === '<') depthAngle++;
        else if (ch === '>') depthAngle = Math.max(0, depthAngle - 1);
        else if (ch === '{') depthBrace++;
        else if (ch === '}') depthBrace = Math.max(0, depthBrace - 1);
        else if (ch === '(') depthParen++;
        else if (ch === ')') depthParen = Math.max(0, depthParen - 1);
        else if (ch === ';' && depthAngle === 0 && depthBrace === 0 && depthParen === 0) {
          end++;
          break;
        }
      }
      out.push({ name, body: src.slice(start, end).trim() });
    }
  }
  return out;
}

function parseMembers(classBody) {
  const inputs = [];
  const outputs = [];
  const models = [];
  const inputRe = /readonly\s+(\w+)\s*=\s*(input(?:\.required)?(?:<[^;]*?>)?\([\s\S]*?\));/g;
  let m;
  while ((m = inputRe.exec(classBody))) {
    const full = m[2];
    const typeM = full.match(/input(?:\.required)?(?:<([\s\S]*?)>)?\(/);
    const defM = full.match(/\(([\s\S]*)\)$/);
    let type = (typeM?.[1] || '').replace(/\s+/g, ' ').trim();
    let def = (defM?.[1] || '').replace(/\s+/g, ' ').trim();
    // drop transform/alias object args for default display
    if (def.startsWith('{')) {
      const alias = def.match(/alias:\s*'([^']+)'/);
      def = alias ? `alias: '${alias[1]}'` : '{...}';
    }
    if (!type) {
      if (def === 'true' || def === 'false') type = 'boolean';
      else if (/^-?\d+(\.\d+)?$/.test(def)) type = 'number';
      else if (/^'.*'$/.test(def) || /^".*"$/.test(def)) type = 'string';
      else if (def === 'null') type = 'null';
      else if (def === 'undefined') type = 'unknown';
      else if (def === '[]') type = 'unknown[]';
    }
    inputs.push({
      name: m[1],
      required: full.startsWith('input.required'),
      type,
      default: def,
    });
  }
  const outRe = /readonly\s+(\w+)\s*=\s*output(?:<([\s\S]*?)>)?\(\s*\);/g;
  while ((m = outRe.exec(classBody))) {
    outputs.push({ name: m[1], type: (m[2] || 'void').replace(/\s+/g, ' ').trim() });
  }
  const modelRe = /readonly\s+(\w+)\s*=\s*(model(?:\.required)?(?:<[^;]*?>)?\([\s\S]*?\));/g;
  while ((m = modelRe.exec(classBody))) {
    const full = m[2];
    const typeM = full.match(/model(?:\.required)?(?:<([\s\S]*?)>)?\(/);
    const defM = full.match(/\(([\s\S]*)\)$/);
    models.push({
      name: m[1],
      required: full.startsWith('model.required'),
      type: (typeM?.[1] || '').replace(/\s+/g, ' ').trim(),
      default: (defM?.[1] || '').replace(/\s+/g, ' ').trim(),
    });
  }
  return { inputs, outputs, models };
}

function findDecoratedClasses(src) {
  const results = [];
  const re = /@(Component|Directive)\(\{([\s\S]*?)\}\)\s*export class (\w+)(?:\s+extends\s+([^{\n]+))?/g;
  let m;
  while ((m = re.exec(src))) {
    const kind = m[1];
    const meta = m[2];
    const className = m[3];
    const extendsWhat = (m[4] || '').trim();
    const selM = meta.match(/selector:\s*'([^']+)'/);
    const selector = selM ? selM[1] : '';
    const hasCva =
      /NG_VALUE_ACCESSOR/.test(meta) ||
      /extends AtmValueAccessor/.test(extendsWhat) ||
      /ControlValueAccessor/.test(extendsWhat);
    const templateM = meta.match(/template:\s*`([\s\S]*?)`/);
    const template = templateM ? templateM[1] : '';
    const slots = [];
    if (/ng-content/.test(template)) {
      const selects = [...template.matchAll(/ng-content[^>]*select="([^"]+)"/g)].map((x) => x[1]);
      if (selects.length) slots.push(...selects);
      else slots.push('default');
    }
    const classStart = src.indexOf('{', m.index + m[0].length - 1);
    let depth = 0;
    let end = classStart;
    for (; end < src.length; end++) {
      if (src[end] === '{') depth++;
      else if (src[end] === '}') {
        depth--;
        if (depth === 0) {
          end++;
          break;
        }
      }
    }
    const body = src.slice(classStart, end);
    const members = parseMembers(body);
    const doc = extractBlockComments(src, m.index);
    results.push({ kind, className, selector, extendsWhat, hasCva, slots, doc, ...members });
  }
  return results;
}

function findServiceClasses(src) {
  const results = [];
  const re = /@Injectable\([\s\S]*?\)\s*export class (\w+)/g;
  let m;
  while ((m = re.exec(src))) {
    const className = m[1];
    const classStart = src.indexOf('{', m.index + m[0].length - 1);
    let depth = 0;
    let end = classStart;
    for (; end < src.length; end++) {
      if (src[end] === '{') depth++;
      else if (src[end] === '}') {
        depth--;
        if (depth === 0) {
          end++;
          break;
        }
      }
    }
    const body = src.slice(classStart, end);
    const methods = [...body.matchAll(/^\s+(?:async\s+)?(\w+)\s*(?:<[^>]*>)?\s*\(([^)]*)\)/gm)]
      .map((x) => ({ name: x[1], params: x[2].replace(/\s+/g, ' ').trim() }))
      .filter((x) => !['constructor', 'if', 'for', 'switch', 'while', 'catch'].includes(x.name));
    const doc = extractBlockComments(src, m.index);
    results.push({
      kind: 'Service',
      className,
      selector: className,
      methods,
      doc,
      inputs: [],
      outputs: [],
      models: [],
      slots: [],
      hasCva: false,
      extendsWhat: '',
    });
  }
  return results;
}

function primarySelector(sel) {
  if (!sel) return '';
  return sel.split(',')[0].trim();
}

function fmtTable(rows, headers) {
  if (!rows.length) return '_Nenhum._\n';
  let md = `| ${headers.join(' | ')} |\n| ${headers.map(() => '---').join(' | ')} |\n`;
  for (const r of rows) md += `| ${r.join(' | ')} |\n`;
  return md + '\n';
}

function escapeCell(s) {
  return String(s ?? '')
    .replace(/\|/g, '\\|')
    .replace(/\n/g, ' ');
}

function metaFor(comp) {
  const keys = [primarySelector(comp.selector), comp.selector, comp.className];
  for (const k of keys) if (META[k]) return META[k];
  const clean = primarySelector(comp.selector).replace(/^\[/, '').replace(/\]$/, '');
  if (META[clean]) return META[clean];
  return {
    purpose: comp.doc?.split('\n')[0] || `${comp.className} — componente Atmus UI.`,
    example: `<${primarySelector(comp.selector) || 'component'} />`,
  };
}

function toSlug(comp) {
  let sel = primarySelector(comp.selector);
  // ng-template[atmFlowNode] → atm-flow-node
  const attrInTag = sel.match(/\[([^\]]+)\]/);
  if (attrInTag) sel = attrInTag[1];
  if (sel.startsWith('[') && sel.endsWith(']')) sel = sel.slice(1, -1);
  let slug = sel || comp.className;
  // camelCase directive → kebab
  if (/[a-z][A-Z]/.test(slug)) {
    slug = slug.replace(/([a-z])([A-Z])/g, '$1-$2');
  }
  if (/^Atm[A-Z]/.test(slug) || /^atm[A-Z]/.test(slug)) {
    slug = slug
      .replace(/^Atm/, 'atm-')
      .replace(/^atm([A-Z])/, (_, c) => 'atm-' + c.toLowerCase())
      .replace(/([a-z])([A-Z])/g, '$1-$2');
  }
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function renderComponentMd(comp, interfaces, sourceFile) {
  const sel = primarySelector(comp.selector);
  const aliases = comp.selector.includes(',') ? comp.selector : '';
  const meta = metaFor(comp);
  let md = '';
  md += `# ${sel || comp.className}\n\n`;
  md += `> Doc otimizada para LLMs. Fonte: \`${sourceFile.replace(/\\/g, '/')}\`\n\n`;
  md += `## Purpose\n\n${meta.purpose}\n\n`;
  if (comp.doc) md += `## Notes from source\n\n${comp.doc}\n\n`;
  md += `## Identity\n\n`;
  md += `- **Class**: \`${comp.className}\`\n`;
  if (sel) md += `- **Selector**: \`${sel}\`\n`;
  if (aliases) md += `- **Selector aliases**: \`${aliases}\`\n`;
  md += `- **Kind**: ${comp.kind}\n`;
  if (comp.extendsWhat) md += `- **Extends**: \`${comp.extendsWhat}\`\n`;
  if (comp.hasCva) md += `- **Forms**: Supports \`ngModel\` / \`FormControl\` (ControlValueAccessor)\n`;
  md += `\n`;

  md += `## Inputs\n\n`;
  md += fmtTable(
    comp.inputs.map((i) => [
      escapeCell('`' + i.name + '`'),
      escapeCell(i.type || 'inferred'),
      escapeCell(i.required ? 'yes' : 'no'),
      escapeCell(i.default || '—'),
    ]),
    ['Name', 'Type', 'Required', 'Default'],
  );

  md += `## Outputs\n\n`;
  md += fmtTable(
    comp.outputs.map((o) => [escapeCell('`' + o.name + '`'), escapeCell(o.type || 'void')]),
    ['Name', 'Payload'],
  );

  md += `## Models (two-way)\n\n`;
  md += fmtTable(
    comp.models.map((o) => [
      escapeCell('`' + o.name + '`'),
      escapeCell(o.type || 'inferred'),
      escapeCell(o.default || '—'),
    ]),
    ['Name', 'Type', 'Default'],
  );

  if (comp.slots?.length) {
    md += `## Content projection\n\n`;
    for (const s of comp.slots) md += `- \`${s}\`\n`;
    md += `\n`;
  }

  if (comp.methods?.length) {
    md += `## Public methods\n\n`;
    md += fmtTable(
      comp.methods.map((x) => [escapeCell('`' + x.name + '`'), escapeCell(x.params || '')]),
      ['Method', 'Params'],
    );
  }

  if (interfaces.length) {
    md += `## Related interfaces / types\n\n`;
    for (const iface of interfaces) {
      md += `### ${iface.name}\n\n\`\`\`ts\n${iface.body}\n\`\`\`\n\n`;
    }
  }

  md += `## Usage example\n\n\`\`\`html\n${meta.example}\n\`\`\`\n\n`;
  if (meta.tips) md += `## Tips\n\n${meta.tips}\n\n`;

  md += `## Conventions\n\n`;
  md += `- Sizes: \`large | medium | slim\` (when \`size\` input exists)\n`;
  md += `- Colors: \`primary | success | warning | danger | info | neutral\` (when \`color\` input exists)\n`;
  md += `- Variants: \`solid | soft | outline | ghost\` (when \`variant\` input exists)\n`;
  md += `- Prefer theme tokens (\`bg-primary\`, \`text-ink\`, etc.) — never hardcode palette colors\n`;
  md += `- Icons via Atmus Icons name or \`<atm-icon name="..." />\`\n`;

  return md;
}

const docs = [];

for (const file of COMPONENT_FILES) {
  const src = fs.readFileSync(file, 'utf8');
  const rel = file.replace(/\\/g, '/');
  const interfaces = extractInterfaces(src);
  let comps = findDecoratedClasses(src);
  if (!comps.length && /@Injectable/.test(src)) comps = findServiceClasses(src);

  if (!comps.length) {
    if (interfaces.length && /(types|config|rest|date-presets|qr-encoder|flow\.types)/.test(rel)) {
      const slug = path.basename(file).replace(/\.ts$/, '').replace(/\./g, '-');
      let md = `# ${slug}\n\n> Fonte: \`${rel}\`\n\n`;
      md += `## Types / interfaces\n\n`;
      for (const iface of interfaces) {
        md += `### ${iface.name}\n\n\`\`\`ts\n${iface.body}\n\`\`\`\n\n`;
      }
      docs.push({ slug, title: slug, md, comps: [] });
    }
    continue;
  }

  for (const comp of comps) {
    const slug = toSlug(comp);
    const related = interfaces.length <= 8 ? interfaces : interfaces.slice(0, 8);
    const md = renderComponentMd(comp, related, rel);
    docs.push({ slug, title: primarySelector(comp.selector) || comp.className, md, comps: [comp] });
  }
}

const bySlug = new Map();
for (const d of docs) {
  if (!bySlug.has(d.slug)) bySlug.set(d.slug, d);
  else {
    const prev = bySlug.get(d.slug);
    prev.md += `\n---\n\n` + d.md;
    prev.comps.push(...d.comps);
  }
}

const written = [];
for (const [slug, d] of bySlug) {
  fs.writeFileSync(path.join(OUT, `${slug}.md`), d.md, 'utf8');
  written.push(slug);
}

const overview = `# Atmus UI — LLM Catalog

This file is a complete reference for LLMs to correctly use the Atmus UI library (\`@atmus/ngui\`).
Prefer importing individual standalone components for tree-shaking, or \`AtmusUiModule\` for prototyping.

## Setup

1. \`npm install @atmus/ngui\` (or yarn/pnpm/bun).
2. Import \`@atmus/ngui/styles.css\` in global styles.
3. Provide config:
\`\`\`ts
import { provideAtmusUi } from '@atmus/ngui';
provideAtmusUi({ theme: 'system', serverUrl: environment.serverUrl })
\`\`\`
4. Import components or \`AtmusUiModule\` from \`@atmus/ngui\`.

## Design system conventions

- Prefix selectors: \`atm-*\`
- Class names: \`Atm*\` (no Component suffix)
- Standalone + OnPush + signal inputs/outputs/models
- Size scale: \`large | medium | slim\` → heights h-12 / h-10 / h-8
- Colors: \`primary | success | warning | danger | info | neutral\`
- Variants: \`solid | soft | outline | ghost\`
- Theme tokens only: \`bg-primary\`, \`text-ink\`, \`text-ink-muted\`, \`bg-surface\`, \`border-line\`, etc. Dark mode via \`.dark\`
- Icons: Atmus Icons via \`<atm-icon name="name" />\` or \`<i class="atm atm-name">\` (base class \`atm\` required)
- Shared CSS utils: \`.atm-field\`, \`.atm-focus\`, \`.atm-panel\`, \`.atm-option\`, animations \`animate-atm-fade|pop|slide-up\`
- Form fields extend \`AtmValueAccessor<T>\` (CVA)
- Overlays extend \`AtmOverlayBase\` (fixed position, flip, escape, outside click)
- Remote lists use \`AtmRemoteDataSource\` (\`?sortBy=id:DESC&page=1&search=x\`)

## Shared types

\`\`\`ts
type AtmSize = 'large' | 'medium' | 'slim';
type AtmColor = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';
type AtmVariant = 'solid' | 'soft' | 'outline' | 'ghost';
\`\`\`

## Services (imperative APIs)

- \`AtmToastService\` — toast.success/error/info/warning/show; needs \`<atm-toast-container />\` in layout
- \`AtmDialogService.open(Component, config)\` — returns \`AtmDialogRef\` with \`onClose\`
- \`AtmAlertDialogService.confirm/alert\` — Promise-based
- \`AtmThemeService\` — light/dark/system
- \`provideAtmusUi({ theme, serverUrl })\`

## When to pick what

| Need | Use |
| --- | --- |
| Text input | \`atm-input\` / \`atm-textarea\` / \`atm-number-field\` |
| Select local options | \`atm-select\` / \`atm-listbox\` / \`atm-autocomplete\` |
| Select from API | \`atm-dropdown-remote\` |
| Users with avatar | \`atm-combobox-user\` |
| Date / range / time | \`atm-date-picker\` / \`atm-date-range-picker\` / \`atm-time-field\` |
| Boolean | \`atm-checkbox\` / \`atm-switch\` |
| Actions menu | \`atm-dropdown\` / \`atm-context-menu\` |
| Modal declarative | \`atm-modal\` |
| Modal imperative | \`AtmDialogService\` |
| Confirm | \`AtmAlertDialogService\` |
| Toast | \`AtmToastService\` + \`atm-toast-container\` |
| Data grid | \`atm-table\` |
| Board | \`atm-kanban\` |
| Node editor | \`atm-flow\` |

## Component index

`;

let llm = overview;
const sorted = [...bySlug.values()].sort((a, b) => a.slug.localeCompare(b.slug));
for (const d of sorted) {
  const purpose = META[d.slug]?.purpose || d.title;
  llm += `- [\`${d.slug}\`](./${d.slug}.md) — ${purpose}\n`;
}
llm += `\n---\n\n# Full component reference\n\n`;
llm += `Each section below is the full doc for that component. Individual files also live next to this catalog as \`<selector>.md\`.\n\n`;

for (const d of sorted) {
  llm += `\n\n${'='.repeat(80)}\n\n`;
  llm += d.md;
}

fs.writeFileSync(path.join(OUT, 'llm.txt'), llm, 'utf8');

let readme = `# Atmus UI Docs\n\nDocumentação por componente otimizada para LLMs.\n\n`;
readme += `- **Catálogo completo para IA**: [\`llm.txt\`](./llm.txt)\n`;
readme += `- Um \`.md\` por componente/serviço/tipo\n`;
readme += `- Regenerar: \`node scripts/generate-ui-docs.mjs\`\n\n`;
readme += `## Índice\n\n`;
for (const d of sorted) {
  readme += `- [\`${d.slug}\`](./${d.slug}.md)\n`;
}
fs.writeFileSync(path.join(OUT, 'README.md'), readme, 'utf8');

console.log('Wrote', written.length, 'component docs + llm.txt + README.md');
console.log(written.sort().join('\n'));
console.log('llm.txt bytes', fs.statSync(path.join(OUT, 'llm.txt')).size);
