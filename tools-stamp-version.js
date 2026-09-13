const fs = require('fs');
const crypto = require('crypto');

/**
 * GitHub Pages tells browsers to cache files for ten minutes. That means a
 * change can ship, be live on the server, and still not appear for the person
 * looking at it, which is indistinguishable from the fix not working.
 *
 * Stamping each of our own scripts and stylesheets with a hash of its contents
 * changes the URL whenever the file changes, so a browser fetches the new one
 * immediately and keeps caching the unchanged ones.
 */
const OURS = [
  'config.js',
  'perf.js',
  'content-apply.js',
  'polish.css',
  'actionbar.js',
  'zoho.js'
];

function hash(file) {
  return crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex').slice(0, 8);
}

const F = 'index.html';
let s = fs.readFileSync(F, 'utf8').replace(/\r\n/g, '\n');
const before = s;
const stamped = [];

OURS.forEach(function (file) {
  if (!fs.existsSync(file)) return;
  const v = hash(file);
  // Match ./file with or without an existing ?v=
  const re = new RegExp('(\\./' + file.replace('.', '\\.') + ')(\\?v=[a-f0-9]+)?', 'g');
  if (!re.test(s)) return;
  s = s.replace(re, '$1?v=' + v);
  stamped.push(file + ' -> ' + v);
});

if (s === before) {
  console.log('nothing to stamp');
  process.exit(0);
}
fs.writeFileSync(F, s);
stamped.forEach(function (x) { console.log('  ' + x); });

// Sanity: every stamped reference must still point at a file that exists.
const refs = [...s.matchAll(/\.\/([a-z-]+\.(?:js|css))\?v=[a-f0-9]+/g)].map((m) => m[1]);
const missing = refs.filter((f) => !fs.existsSync(f));
console.log('references checked: ' + refs.length + ', missing: ' + (missing.length ? missing.join(', ') : 'none'));
