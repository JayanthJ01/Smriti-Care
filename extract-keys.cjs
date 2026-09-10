const fs = require('fs');
const glob = 'src/components/caregiver/';
const out = new Set();
for (const f of fs.readdirSync(glob)) {
  if (!f.endsWith('.tsx')) continue;
  const t = fs.readFileSync(glob + f, 'utf8');
  for (const m of t.matchAll(/t\('([a-zA-Z.]+)'/g)) {
    out.add(m[1]);
  }
}
fs.writeFileSync('cgkeys.txt', [...out].sort().join('\n'));
console.log([...out].sort().join('\n'));
