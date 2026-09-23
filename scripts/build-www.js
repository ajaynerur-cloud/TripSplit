const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const out = path.join(root, 'www');

const files = [
  'index.html',
  'app.js',
  'config.js',
  'styles.css',
  'manifest.webmanifest',
  'sw.js'
];
const dirs = ['icons'];

fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });

for (const f of files) {
  const src = path.join(root, f);
  if (fs.existsSync(src)) fs.copyFileSync(src, path.join(out, f));
}
for (const d of dirs) {
  const src = path.join(root, d);
  if (fs.existsSync(src)) fs.cpSync(src, path.join(out, d), { recursive: true });
}

console.log('Copied web assets into ./www');
