// Folds the whole game into one HTML file that plays off a double-click: no server, no
// unzip, no missing art. Everything the browser would have fetched — Phaser, the face,
// every PNG — goes in as a data URI, because a page opened off the filesystem is not
// allowed to fetch its neighbours and a playtester should not have to run a web server.
//
//   node tools/build.js            -> build/dreadhollow-playtest.html
//
// The file carries no <html> or <body> tag on purpose. A browser supplies them, and
// leaving them out lets the same file be served as a hosted page as well as opened.

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'build', 'dreadhollow-playtest.html');

const read = (p) => readFileSync(join(ROOT, p));
const b64 = (p, mime) => `data:${mime};base64,${read(p).toString('base64')}`;

// an inline script ends at the first </script in it, whatever it was doing at the time
const inline = (js) => js.replace(/<\/script/gi, '<\\/script');

function walk(dir, out = []) {
  for (const name of readdirSync(join(ROOT, dir))) {
    const rel = `${dir}/${name}`;
    if (statSync(join(ROOT, rel)).isDirectory()) walk(rel, out);
    else out.push(rel);
  }
  return out;
}

// Everything under an export folder ships: those are asked for by paths the game builds at
// run time, so no amount of reading the source tells you which frames it will want. Loose
// files at the top of art/ are the raw generations, and ship only if something names one.
function assets() {
  const source = ['src', 'content'].flatMap((d) => walk(d)).concat(['tuning.js'])
    .map((p) => read(p).toString()).join('\n');
  return walk('art')
    .filter((p) => extname(p) === '.png')
    .filter((p) => p.split('/').length > 2 || source.includes(p.split('/').pop()));
}

const files = assets();
const manifest = Object.fromEntries(files.map((p) => [p, b64(p, 'image/png')]));

// The game asks for its art by path, so the paths are what the manifest is keyed on, and
// the path is swapped for the picture itself before the loader is told about it. Phaser
// reads a data URI perfectly well — but it decides how to read a file the moment the file
// is made, so the swap has to happen before that, which means wrapping the image loader
// where it is registered rather than the copy of it hung off each scene afterwards.
const loader = `
window.DH_ASSETS = ${JSON.stringify(manifest)};
(function () {
  var types = {};
  Phaser.Loader.FileTypesManager.install(types);
  var image = types.image;
  var missing = [];
  // Some art paths are built by stepping out of a folder ('art/x/../y.png'). A browser
  // folds that away before it fetches, so the manifest lookup has to fold it away too.
  var fold = function (url) {
    var out = [];
    url.split('/').forEach(function (part) { if (part === '..') out.pop(); else out.push(part); });
    return out.join('/');
  };
  var swap = function (url) {
    if (typeof url !== 'string' || url.slice(0, 5) === 'data:') return url;
    url = fold(url);
    if (window.DH_ASSETS[url]) return window.DH_ASSETS[url];
    if (missing.indexOf(url) < 0) { missing.push(url); console.warn('not in this build:', url); }
    return url;
  };
  Phaser.Loader.FileTypesManager.register('image', function (key, url, xhr) {
    if (Array.isArray(key)) key = key.map(function (k) { return swap(k.url) === k.url ? k : Object.assign({}, k, { url: swap(k.url) }); });
    else if (key && typeof key === 'object') key = Object.assign({}, key, { url: swap(key.url) });
    else url = swap(url);
    return image.call(this, key, url, xhr);
  });
  window.DH_MISSING = missing;
})();
`;

const bundle = execFileSync('npx', [
  '--yes', 'esbuild@0.25.0', 'src/main.js',
  '--bundle', '--format=esm', '--target=es2022', '--log-level=warning',
], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });

// The shell is index.html's, with the three things it points at pulled inside it.
const shell = read('index.html').toString();
const style = shell.match(/<style>([\s\S]*?)<\/style>/)[1]
  .replace("url('vendor/LibreBaskerville.ttf') format('truetype')",
    `url('${b64('vendor/LibreBaskerville.ttf', 'font/ttf')}') format('truetype')`);

const html = `<title>Dreadhollow</title>
<style>${style}</style>
<div id="game"></div>
<script>${inline(read('vendor/phaser.min.js').toString().replace(/\/\/# sourceMappingURL=.*$/m, ''))}</script>
<script>${inline(loader)}</script>
<script type="module">${inline(bundle)}</script>
`;

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);
console.log(`${OUT}  ${(html.length / 1e6).toFixed(1)} MB  (${files.length} images)`);
