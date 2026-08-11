// Builda o CSS publicado da lib: Tailwind compilado (escaneando os templates
// de projects/ngui/src/lib) + icofont + atmus.css, tudo num único arquivo.
// Roda depois de `ng build ngui`, escrevendo em dist/ngui/styles.css.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
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
// fora de node_modules/@icon/icofont. Embute só woff2/woff (cobre todo
// browser evergreen; Angular 20 não suporta os alvos legados que
// justificariam eot/ttf/svg) como data URI direto no @font-face.
const icofontCssRaw = readFileSync(join(icofontDir, 'icofont.css'), 'utf8');
const woff2 = readFileSync(join(icofontDir, 'icofont.woff2')).toString('base64');
const woff = readFileSync(join(icofontDir, 'icofont.woff')).toString('base64');
const icofontCss = icofontCssRaw.replace(
  /@font-face\s*\{[^}]*\}/,
  `@font-face {
  font-family: "icofont";
  font-display: swap;
  src: url('data:font/woff2;base64,${woff2}') format('woff2'),
    url('data:font/woff;base64,${woff}') format('woff');
}`,
);

const entryCss = readFileSync(entry, 'utf8');
const combined = `${icofontCss}\n\n${entryCss}`;

const result = await postcss([tailwindcss()]).process(combined, { from: entry, to: outFile });

mkdirSync(outDir, { recursive: true });
writeFileSync(outFile, result.css);

console.log(`[build-styles] ${outFile} (${(result.css.length / 1024).toFixed(1)} kB)`);
