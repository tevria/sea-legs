// Builds Sea Legs from src/ into:
//   www/index.html + www/capacitor.js   the iPhone/Android app (Capacitor's webDir)
//   index.html                          the web version (GitHub Pages serves the repo root)
//   privacy.html, terms.html, support.html   public pages for the App Store and Google Play listings
// Everything is self-contained: the font is embedded, so the app works fully offline.
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const write = (p, s) => { mkdirSync(dirname(join(root, p)), { recursive: true }); writeFileSync(join(root, p), s); };

const cfg = JSON.parse(read('src/config.json'));
const pkg = JSON.parse(read('package.json'));
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const site = cfg.siteUrl.replace(/\/$/, '');
const siteShort = site.replace(/^https?:\/\//, '');

const contact = cfg.supportEmail
  ? `Email <a href="mailto:${cfg.supportEmail}">${cfg.supportEmail}</a>.`
  : `Open an issue at <a href="${cfg.supportUrl}" target="_blank" rel="noopener">${cfg.supportUrl.replace(/^https?:\/\//, '')}</a>.`;
const tokens = {
  APP_NAME: cfg.appName,
  VERSION: pkg.version,
  SITE_URL: siteShort,
  EFFECTIVE_DATE: cfg.legalEffectiveDate,
  CONTACT_HTML: contact,
};
const fill = (s) => s.replace(/\{\{([A-Z_]+)\}\}/g, (m, k) => {
  if (!(k in tokens)) throw new Error(`Unknown token ${m}`);
  return tokens[k];
});

// Manrope (SIL OFL 1.1), embedded so nothing loads from the network
const fontDir = 'node_modules/@fontsource-variable/manrope';
const fontB64 = readFileSync(join(root, fontDir, 'files/manrope-latin-wght-normal.woff2')).toString('base64');
const range = (read(`${fontDir}/index.css`).match(/manrope-latin-wght-normal\.woff2[\s\S]*?unicode-range:\s*([^;]+);/) || [])[1];
if (!range) throw new Error('Could not read the Manrope unicode range');
const fontCss = `@font-face{font-family:"Manrope";font-style:normal;font-display:swap;font-weight:200 800;` +
  `src:url(data:font/woff2;base64,${fontB64}) format("woff2");unicode-range:${range.trim()}}`;

// Open-source notices shown in the app's Licenses page
const notices = [
  ['Manrope typeface', 'The typeface used throughout the app.', `${fontDir}/LICENSE`],
  ['Capacitor', 'Runs the iPhone and Android apps.', 'node_modules/@capacitor/core/LICENSE'],
  ['Capacitor App, Haptics and Splash Screen plugins', '', 'node_modules/@capacitor/haptics/LICENSE'],
  ['Keep Awake plugin', 'Keeps the screen on during a session.', 'node_modules/@capacitor-community/keep-awake/LICENSE'],
];
const licensesHtml = '<p>' + esc(cfg.appName) + ' is built with these open-source components. Their licence notices follow.</p>' +
  notices.map(([name, what, file]) =>
    `<h3>${esc(name)}</h3>${what ? `<p>${esc(what)}</p>` : ''}<pre>${esc(read(file).trim())}</pre>`).join('');

const privacy = fill(read('src/legal/privacy.html'));
const terms = fill(read('src/legal/terms.html'));
const support = fill(read('src/legal/support.html'));

// The page itself: title + style + markup + script, artifact style
const page = fill(read('src/index.html'))
  .replace('/*@fonts*/', fontCss)
  .replace('<!--@privacy-->', privacy)
  .replace('<!--@terms-->', terms)
  .replace('<!--@licenses-->', licensesHtml);

// Split the page so <title> and <style> can sit in a real <head>
const title = page.match(/<title>[\s\S]*?<\/title>/)[0];
const styleStart = page.indexOf('<style>'), styleEnd = page.indexOf('</style>') + '</style>'.length;
const style = page.slice(styleStart, styleEnd);
const body = page.slice(styleEnd).trim();

function doc({ app }) {
  const viewport = app
    ? 'width=device-width,initial-scale=1,viewport-fit=cover,maximum-scale=1,user-scalable=no'
    : 'width=device-width,initial-scale=1,viewport-fit=cover';
  return [
    '<!DOCTYPE html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8">',
    `<meta name="viewport" content="${viewport}">`,
    title,
    `<meta name="description" content="Breathe with a steady horizon at sea.">`,
    '<meta name="color-scheme" content="light dark">',
    '<meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)">',
    '<meta name="theme-color" content="#0a0a0b" media="(prefers-color-scheme: dark)">',
    '<meta name="format-detection" content="telephone=no">',
    ...(app ? ['<script src="capacitor.js"></script>'] : [
      '<meta name="apple-mobile-web-app-capable" content="yes">',
      '<meta name="mobile-web-app-capable" content="yes">',
      `<meta name="apple-mobile-web-app-title" content="${esc(cfg.appName)}">`,
      '<link rel="apple-touch-icon" href="apple-touch-icon.png">',
      '<link rel="icon" type="image/png" href="apple-touch-icon.png">',
    ]),
    style,
    '</head>',
    '<body>',
    body,
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

const mark = '<svg viewBox="0 0 44 44" width="28" height="28" aria-hidden="true"><rect width="44" height="44" rx="11" fill="currentColor"/>' +
  '<path d="M0 24h44" stroke="var(--bg)" stroke-width="3"/><circle cx="22" cy="24" r="8.5" fill="var(--bg)"/><circle cx="22" cy="24" r="3" fill="currentColor"/></svg>';
function sitePage(file, heading, content) {
  const nav = [['index.html', 'Open the app'], ['support.html', 'Support'], ['privacy.html', 'Privacy'], ['terms.html', 'Terms']]
    .filter(([f]) => f !== 'index.html')
    .map(([f, label]) => `<a href="${f}"${f === file ? ' aria-current="page"' : ''}>${label}</a>`).join('');
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${esc(heading)} · ${esc(cfg.appName)}</title>
<meta name="color-scheme" content="light dark">
<link rel="icon" type="image/png" href="apple-touch-icon.png">
<style>
${fontCss}
:root{--bg:#ffffff;--fg:#000000;--muted:#5d6067;--faint:#a3a6ad;--line:#e8e9ec;--accent:#276ef1;--font:"Manrope",-apple-system,BlinkMacSystemFont,"Segoe UI","Helvetica Neue",Arial,sans-serif}
@media (prefers-color-scheme:dark){:root{--bg:#0a0a0b;--fg:#ffffff;--muted:#a6a9af;--faint:#64676d;--line:#222326;--accent:#5b91f5;color-scheme:dark}}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--fg);font:500 16px/1.6 var(--font);-webkit-font-smoothing:antialiased}
.wrap{max-width:680px;margin:0 auto;padding-block:24px 64px;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px))}
nav{display:flex;align-items:center;flex-wrap:wrap;gap:8px 20px;padding-bottom:20px;border-bottom:1px solid var(--line);margin-bottom:36px}
.brand{display:flex;align-items:center;gap:10px;margin-right:auto;color:var(--fg);text-decoration:none;font-weight:800;font-size:1.125rem;letter-spacing:-.02em}
nav a:not(.brand){color:var(--muted);text-decoration:none;font-weight:700;font-size:.9375rem}
nav a[aria-current]{color:var(--fg)}
h1{font-size:2.25rem;font-weight:800;letter-spacing:-.035em;line-height:1.1;margin:0 0 16px;text-wrap:balance}
h3{font-size:1.125rem;font-weight:800;letter-spacing:-.01em;margin:28px 0 8px}
p,li{color:var(--muted)}
p{margin:0 0 12px}
ul{padding-left:1.2em}
li{margin-bottom:6px}
.eff{color:var(--faint);font-size:.875rem}
a{color:var(--accent)}
footer{margin-top:48px;padding-top:20px;border-top:1px solid var(--line);color:var(--faint);font-size:.875rem}
footer a{color:var(--muted)}
</style>
</head>
<body>
<div class="wrap">
<nav><a class="brand" href="index.html">${mark}${esc(cfg.appName)}</a>${nav}</nav>
<main>
<h1>${esc(heading)}</h1>
${content}
</main>
<footer>${esc(cfg.appName)} ${esc(pkg.version)} · <a href="index.html">Open the web version</a></footer>
</div>
</body>
</html>
`;
}

write('www/index.html', doc({ app: true }));
copyFileSync(join(root, 'node_modules/@capacitor/core/dist/capacitor.js'), join(root, 'www/capacitor.js'));
write('index.html', doc({ app: false }));
write('privacy.html', sitePage('privacy.html', 'Privacy policy', privacy));
write('terms.html', sitePage('terms.html', 'Terms of use', terms));
write('support.html', sitePage('support.html', 'Support', support));

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1) + ' KB';
console.log(`Built ${cfg.appName} ${pkg.version}: www/index.html ${kb(read('www/index.html'))}, index.html ${kb(read('index.html'))}, plus privacy, terms and support pages.`);
