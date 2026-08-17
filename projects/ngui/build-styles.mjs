// Builda o CSS publicado da lib: Tailwind compilado (escaneando os templates
// de projects/ngui/src/lib) + icofont + atmus.css, tudo num único arquivo.
// Roda depois de `ng build ngui`, escrevendo em dist/ngui/styles.css.
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import postcss from 'postcss';
import tailwindcss from '@tailwindcss/postcss';

const here = dirname(fileURLToPath(import.meta.url));
const entry = join(here, 'src', 'styles-entry.css');
const outDir = join(here, '..', '..', 'dist', 'ngui');
const outFile = join(outDir, 'styles.css');
const icofontDir = join(here, '..', '..', 'node_modules', '@icon', 'icofont');

// icofont.css referencia os arquivos de font por caminho relativo — inútil
// fora de node_modules/@icon/icofont. Antes disso aqui embutia woff2+woff
// como data URI (~1,6 MB, metade disso era só o fallback woff redundante —
// Angular 20 não suporta os alvos legados que justificariam eot/ttf/svg nem
// o próprio woff). Achado ao integrar no nails-web: isso sozinho estourava o
// orçamento de bundle inicial de QUALQUER consumidor, só de importar o CSS,
// mesmo sem usar nenhum ícone icofont diretamente. Troca pro mesmo padrão que
// os pacotes @fontsource* já usam (que o próprio nails-web consome sem
// problema): arquivo de fonte real ao lado do CSS + url() relativa — o
// bundler do consumidor resolve e copia como asset comum, fora do
// orçamento de JS/CSS "initial", em vez de inflar o CSS crítico.
mkdirSync(outDir, { recursive: true });

const icofontCssRaw = readFileSync(join(icofontDir, 'icofont.css'), 'utf8');
copyFileSync(join(icofontDir, 'icofont.woff2'), join(outDir, 'icofont.woff2'));
const icofontCss = icofontCssRaw
  .replace(
    /@font-face\s*\{[^}]*\}/,
    `@font-face {
  font-family: "icofont";
  font-display: swap;
  src: url('./icofont.woff2') format('woff2');
}`,
  )
  // O icofont.css declara @charset na linha 7. A regra só é válida no primeiro
  // byte do arquivo, e aqui ela sempre acaba depois do banner do Tailwind — o
  // que faz TODO consumidor que importa este CSS no meio de outro arquivo
  // receber "@charset must be the first rule" a cada build. O CSS publicado é
  // inteiramente ASCII (os ícones usam escapes \eXXX), então a declaração não
  // tem função: sem ela, o arquivo continua sendo lido como UTF-8.
  .replace(/@charset\s+["'][^"']*["']\s*;/gi, '');

const entryCss = readFileSync(entry, 'utf8');
const combined = `${icofontCss}\n\n${entryCss}`;

const result = await postcss([tailwindcss()]).process(combined, { from: entry, to: outFile });

writeFileSync(outFile, result.css);

console.log(`[build-styles] ${outFile} (${(result.css.length / 1024).toFixed(1)} kB)`);
