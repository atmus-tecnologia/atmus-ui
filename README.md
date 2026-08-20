# Atmus UI

Biblioteca de componentes Angular (standalone, signals, OnPush) com Tailwind CSS 4 e IcoFont, publicada no npm como [`@atmus/ngui`](https://www.npmjs.com/package/@atmus/ngui). O CSS vai pré-compilado no pacote — quem instala não precisa ter Tailwind configurado.

Este repositório é um Angular workspace com dois projetos:

- **`projects/ngui`** — a biblioteca em si (o que é publicado).
- **`src/`** (projeto `atmus-ui`) — o showcase: vitrine com todos os componentes, exemplos e código de uso, e consumidor da lib (dogfooding).

## Rodando o showcase

```bash
npm install
npx ng build ngui   # builda só o JS/tipos da lib para dist/ngui — necessário antes do primeiro serve
npm start
# http://localhost:4200
```

O CSS do showcase é compilado ao vivo pelo Tailwind (escaneando `src/app` e `projects/ngui`), então mudanças de classes aparecem no live-reload normalmente. Só o JS/tipos da lib (`dist/ngui`) precisam de rebuild manual — ao alterar código em `projects/ngui`, rode `npm run watch:ngui` num terminal separado.

`npm run build:ngui` (que também gera o CSS pré-compilado) só é necessário para publicar o pacote — veja "Publicando uma nova versão" abaixo.

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

## Empacotamento: secondary entry points (bloqueado — não reimplementar sem ler isto)

O `@atmus/ngui` publica todo o design system por um único entry point (`src/public-api.ts` → uma FESM só, `fesm2022/atmus-ngui.mjs`). Isso é conhecido e tem custo real: qualquer import eager de um app consumidor (ex.: `AtmThemeService`/`AtmToastContainer`/`provideAtmusUi` referenciados fora de uma rota lazy) arrasta a lib inteira para o bundle inicial, porque o esbuild trata o módulo físico como uma unidade só na hora de decidir o que é "initial" — não importa se a maior parte do que foi importado só é usada em telas lazy nunca visitadas.

A solução correta seria dividir o pacote em **secondary entry points** por família de componente (ex.: `@atmus/ngui/button`, `@atmus/ngui/table`, `@atmus/ngui/autocomplete`), mantendo `@atmus/ngui` funcionando exatamente como hoje para quem já usa o import único — o ng-packagr já usado aqui suporta isso nativamente, sem trocar de ferramenta.

**Isso foi tentado e não é implementável no momento.** Criar um secondary entry point que reexporta um arquivo já exportado pela raiz (o caso normal — é assim que `@atmus/ngui/button` preservaria `import { AtmButton } from '@atmus/ngui'` funcionando ao mesmo tempo) faz o `ng build ngui` falhar com:

```
Cannot destructure property 'pos' of 'file.referencedFiles[index]' as it is undefined.
```

Causa provável (não confirmada oficialmente, mas consistente com o comportamento observado e com o código-fonte do compilador): o `ngtsc` usa o array `referencedFiles` do TypeScript como mecanismo interno para injetar "shims" de compilação (`ShimReferenceTagger`, ver [angular/angular@4213e8d](https://github.com/angular/angular/commit/4213e8d)) — ele modifica esse array e depois o restaura para esconder o detalhe de implementação. Quando dois entry points do ng-packagr compartilham um `SourceFile` no mesmo processo (o cenário normal de qualquer secondary entry point que reexporta algo que a raiz também exporta), a segunda passagem de restauração parece deixar o array num estado inconsistente, e uma chamada posterior de diagnóstico lê um índice que não existe mais.

Testado e confirmado como bloqueador em **todas** as combinações abaixo — nenhuma resolveu:

| Angular / `@angular/compiler-cli` / `ng-packagr` | TypeScript | Resultado |
|---|---|---|
| 20.3.x (versão do projeto) | 5.9.2 | ❌ crash |
| 20.3.x | 5.8.3 (dentro do range suportado, `>=5.8 <6.0`) | ❌ crash idêntico |
| 21.2.x (mais recente disponível, `ng update`) | 5.9.3 (exigido pelo ng-packagr 21) | ❌ crash idêntico |

Também descartado: não é específico de um componente (reproduzido tanto com `atm-flow`, o mais pesado da lib, quanto com `atm-button`, o mais simples, com um único export); não é causado pelos `references` de projeto no `tsconfig.json` raiz (removidos experimentalmente, sem efeito).

Issues públicas relacionadas (nenhuma com fix confirmado até a data deste registro, 2026-08-19): [angular/angular#57850](https://github.com/angular/angular/issues/57850), [angular-cli#31649](https://github.com/angular/angular-cli/issues/31649), [angular-cli#32281](https://github.com/angular/angular-cli/issues/32281), [nrwl/nx#33876](https://github.com/nrwl/nx/issues/33876).

**Estado**: secondary entry points **não devem ser implementados agora**. O repositório foi restaurado ao estado original após os experimentos (nenhum código da lib foi alterado permanentemente).

**Caminho futuro**:
- Acompanhar as issues acima. Quando houver uma versão nova do `@angular/compiler-cli`/`ng-packagr`, repetir o teste mínimo abaixo antes de tentar implementar de novo — é rápido e evita redescobrir o mesmo bloqueio:
  1. Criar `projects/ngui/<algo>/ng-package.json` com `{ "lib": { "entryFile": "public-api.ts" } }`.
  2. Criar `projects/ngui/<algo>/public-api.ts` reexportando um único componente já exportado pela raiz (ex.: `export * from '../src/lib/components/button/button.component';`).
  3. Adicionar `"<algo>/**/*.ts"` ao `include` de `projects/ngui/tsconfig.lib.json`.
  4. Rodar `ng build ngui`. Se o segundo entry point compilar sem o erro acima, o bloqueador foi resolvido upstream.
- Se for necessário abrir um report upstream, os passos acima já são um reprodutor mínimo suficiente — não há um caso de reprodução mantido neste repositório de propósito, para não deixar uma configuração de build quebrada no código publicável.

**Workaround já aplicado no consumidor `atmusos-web`** (não depende de mudança nenhuma aqui): os providers do `@atmus/ngui` (`ATMUS_UI_CONFIG`, `AtmThemeService`, `AtmToastContainer`) foram movidos de `app.ts`/`app.config.ts` (raiz, eager) para os componentes-raiz de cada subárvore carregada via `loadComponent` (shell autenticado, auth, quote pública, impressão, etc.), usando o injector hierárquico comum do Angular em vez de `EnvironmentProviders` na raiz. Isso manteve o chunk do design system lazy sem tocar em nenhum import de rota, e reduziu o bundle inicial de ~731 kB para ~492 kB (−32,6%). É uma solução no lado do app consumidor — continua válida e não precisa ser desfeita nem depende de secondary entry points para funcionar.

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
