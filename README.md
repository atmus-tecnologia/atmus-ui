# Atmus UI

Biblioteca de componentes Angular (standalone, signals, OnPush) com Tailwind CSS 4 e IcoFont, feita para ser **copiada entre projetos**: toda a lib vive em `src/core/ui`.

## Rodando o showcase

```bash
npm install
npm start
# http://localhost:4200
```

O app principal é uma vitrine com todos os componentes, exemplos e código de uso, separados por menu.

## Usando em outro projeto

1. Copie a pasta `src/core/ui` para o novo projeto.
2. Instale as dependências de estilo:
   ```bash
   npm install tailwindcss @tailwindcss/postcss postcss @icon/icofont
   ```
   E crie o `.postcssrc.json`:
   ```json
   { "plugins": { "@tailwindcss/postcss": {} } }
   ```
3. No `styles.css` global:
   ```css
   @import '@icon/icofont/icofont.css';
   @import 'tailwindcss';
   @import './core/ui/styles/atmus.css';
   ```
4. No `app.config.ts`:
   ```ts
   import { provideAtmusUi } from './core/ui';

   providers: [
     provideHttpClient(withFetch()),
     provideAtmusUi({
       theme: 'system', // 'light' | 'dark' | 'system'
       serverUrl: environment.serverUrl, // usado pelo atm-dropdown-remote
     }),
   ]
   ```
5. Importe os componentes individualmente (tree-shaking) ou o `AtmusUiModule` inteiro.

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
