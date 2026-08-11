# Atmus UI

Biblioteca de componentes Angular (standalone, signals, OnPush) com Tailwind CSS 4 e IcoFont, publicada no npm como [`@atmus/ngui`](https://www.npmjs.com/package/@atmus/ngui). O CSS vai pré-compilado no pacote — quem instala não precisa ter Tailwind configurado.

Este repositório é um Angular workspace com dois projetos:

- **`projects/ngui`** — a biblioteca em si (o que é publicado).
- **`src/`** (projeto `atmus-ui`) — o showcase: vitrine com todos os componentes, exemplos e código de uso, e consumidor da lib (dogfooding).

## Rodando o showcase

```bash
npm install
npm run build:ngui   # builda a lib (JS + CSS) para dist/ngui — necessário antes do primeiro serve
npm start
# http://localhost:4200
```

Ao alterar código em `projects/ngui`, rode `npm run watch:ngui` num terminal separado (rebuild incremental do JS/tipos) e `npm run build:ngui` de novo quando mudar classes Tailwind/CSS, já que o CSS não é observado em modo watch.

## Instalando em outro projeto

```bash
npm install @atmus/ngui
# yarn add @atmus/ngui
# pnpm add @atmus/ngui
# bun add @atmus/ngui
```

No `styles.css` global:

```css
@import '@atmus/ngui/styles.css';
```

No `app.config.ts`:

```ts
import { provideAtmusUi } from '@atmus/ngui';

providers: [
  provideHttpClient(withFetch()),
  provideAtmusUi({
    theme: 'system', // 'light' | 'dark' | 'system'
    serverUrl: environment.serverUrl, // usado pelo atm-dropdown-remote
  }),
]
```

Importe os componentes individualmente (tree-shaking) ou o `AtmusUiModule` inteiro, ambos de `@atmus/ngui`.

## Publicando uma nova versão

```bash
# em projects/ngui/package.json, suba a versão (semver)
npm run build:ngui
npm run pack:ngui      # opcional: inspeciona o conteúdo do tarball antes de publicar
npm run publish:ngui   # publica dist/ngui no npm com --access public
```

## Padrões

- **Prefixo**: `atm-` em todos os seletores.
- **Tamanhos**: todo componente aceita `[size]="'large' | 'medium' | 'slim'"` (h-12 / h-10 / h-8).
- **Tema**: cores definidas como tokens CSS em `:root` (`--atm-primary`, `--atm-surface`, ...) — o dark mode troca os tokens pela classe `.dark` no `<html>` (gerenciada pelo `AtmThemeService`).
- **Forms**: campos implementam ControlValueAccessor (funcionam com `ngModel` e Reactive Forms).
- **Overlays**: dropdowns/popovers/pickers detectam o espaço na viewport e abrem para cima quando necessário.

## Destaques

- `atm-dropdown-remote` — dropdown alimentado por API (padrão nest-paginator): passe um service que estenda `AtmRestService`, busca server-side com debounce, máx. 10 registros por página, `[hasActionButton]` para o botão de "adicionar novo" no footer.
- `AtmDialogService` — dynamic dialog estilo PrimeNG: `dialog.open(MeuComponente, { header, width, data })` retorna ref com `onClose`. Todo modal tem botão de expandir para 90% da viewport.
- `AtmAlertDialogService` — confirmações por Promise: `await alertDialog.confirm({...})`.
- `AtmToastService` — toasts com severidades (`<atm-toast-container />` uma vez no App).

## Criando novos componentes

Use a skill do Cursor em `.cursor/skills/atmus-component/SKILL.md` — ela descreve o design system, as classes utilitárias compartilhadas e as receitas (campo de formulário, overlay, componente remoto).
