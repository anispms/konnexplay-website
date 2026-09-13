const fs = require('fs');
const crypto = require('crypto');

/**
 * Cache stamping. Run this before committing any change to the files below.
 *
 * GitHub Pages tells browsers to cache files for ten minutes. Without a stamp a
 * change can be live on the server while the person looking at the site still
 * sees the old version, which is indistinguishable from the fix not working.
 *
 * Two kinds of stamping happen here:
 *   1. Our own scripts and stylesheets get a content hash in their URL in
 *      index.html, so each updates only when it actually changes.
 *   2. The .dc.html page files are fetched by the runtime under fixed names, so
 *      they cannot carry a hash in the markup. Instead a single build id, taken
 *      from the contents of all of them, is written into config.js, and
 *      cache.js appends it to those requests.
 */

const OURS = [
  'config.js',
  'cache.js',
  'perf.js',
  'content-apply.js',
  'polish.css',
  'actionbar.js',
  'zoho.js',
  'update-check.js',
  'anchors.js',
  'sw-register.js',
  'lightbox.js',
  'shots.js',
  'leads.js'
];

function sha(buf) {
  return crypto.createHash('sha1').update(buf).digest('hex').slice(0, 8);
}

/* ---- 1. build id from every page file ---- */

const pages = fs.readdirSync('.').filter((f) => f.endsWith('.dc.html')).sort();
const h = crypto.createHash('sha1');
pages.forEach((p) => h.update(fs.readFileSync(p)));
const BUILD = h.digest('hex').slice(0, 8);

let cfg = fs.readFileSync('config.js', 'utf8').replace(/\r\n/g, '\n');
const line = 'window.KX_BUILD = ';
if (cfg.indexOf(line) === -1) {
  cfg += '\n/* Build id for the page files. Rewritten by tools-stamp-version.js. */\nwindow.KX_BUILD = ' + JSON.stringify(BUILD) + ';\n';
} else {
  cfg = cfg.replace(/window\.KX_BUILD = '[^']*';/, "window.KX_BUILD = '" + BUILD + "';");
  cfg = cfg.replace(/window\.KX_BUILD = "[^"]*";/, "window.KX_BUILD = '" + BUILD + "';");
}
fs.writeFileSync('config.js', cfg);
console.log('build id (' + pages.length + ' page files) -> ' + BUILD);

/* A tiny file the open page polls, so a browser already showing the site
   learns that a new version exists instead of silently staying stale. */
fs.writeFileSync(
  'version.json',
  JSON.stringify({ build: BUILD, published: new Date().toISOString() }, null, 2) + '\n'
);
console.log('version.json written');

/* ---- 2. content hashes in index.html ---- */

const F = 'index.html';
let s = fs.readFileSync(F, 'utf8').replace(/\r\n/g, '\n');
const before = s;

OURS.forEach(function (file) {
  if (!fs.existsSync(file)) return;
  const v = sha(fs.readFileSync(file));
  const re = new RegExp('(\\./' + file.replace('.', '\\.') + ')(\\?v=[a-f0-9]+)?', 'g');
  if (!re.test(s)) return;
  s = s.replace(re, '$1?v=' + v);
  console.log('  ' + file + ' -> ' + v);
});

if (s !== before) fs.writeFileSync(F, s);

const refs = [...s.matchAll(/\.\/([a-z-]+\.(?:js|css))\?v=[a-f0-9]+/g)].map((m) => m[1]);
const missing = refs.filter((f) => !fs.existsSync(f));
console.log('references: ' + refs.length + ', missing: ' + (missing.length ? missing.join(', ') : 'none'));
