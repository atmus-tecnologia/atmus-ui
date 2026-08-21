// Builda o CSS publicado da lib: Tailwind compilado (escaneando os templates
// de projects/ngui/src/lib) + @atmus/icons + atmus.css, tudo num único arquivo.
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
const iconsDir = join(here, '..', '..', 'node_modules', '@atmus', 'icons');

// O CSS do @atmus/icons referencia as fontes por caminho relativo (./fonts/…),
// inútil fora de node_modules/@atmus/icons. Antes de existir esse pacote, o
// icofont era embutido aqui como data URI (~1,6 MB): isso sozinho estourava o
// orçamento de bundle inicial de QUALQUER consumidor, só de importar o CSS,
// mesmo sem usar nenhum ícone. O padrão usado hoje é o mesmo dos pacotes
// @fontsource*: arquivo de fonte real ao lado do CSS + url() relativa — o
// bundler do consumidor resolve e copia como asset comum, fora do orçamento
// de JS/CSS "initial", em vez de inflar o CSS crítico.
//
// Usamos `solid-core.css`, que declara duas fontes sob a mesma família
// separadas por unicode-range: o subset com os ícones que os componentes desta
// lib usam (~10 kB) e a família Solid completa (~712 kB). Uma app que só use
// os ícones dos componentes baixa apenas o subset; a fonte completa só é
// buscada quando a página realmente renderiza um ícone fora dele.
mkdirSync(outDir, { recursive: true });

const FONT_FILES = ['AtmusIconsSolid-core.woff2', 'AtmusIconsSolid.woff2'];
const fontsOut = join(outDir, 'fonts');
mkdirSync(fontsOut, { recursive: true });
for (const file of FONT_FILES) {
  copyFileSync(join(iconsDir, 'fonts', file), join(fontsOut, file));
}

const iconsCss = readFileSync(join(iconsDir, 'solid-core.css'), 'utf8');

const entryCss = readFileSync(entry, 'utf8');
const combined = `${iconsCss}\n\n${entryCss}`;

const result = await postcss([tailwindcss()]).process(combined, { from: entry, to: outFile });

writeFileSync(outFile, result.css);

console.log(`[build-styles] ${outFile} (${(result.css.length / 1024).toFixed(1)} kB)`);
