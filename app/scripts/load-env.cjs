// eslint-disable-next-line @typescript-eslint/no-require-imports -- .cjs preload script, require() is correct here (not an accidental CJS/ESM mix)
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports -- see above
const path = require('path');
const envPath = path.join(__dirname, '..', '.env.local');
const content = fs.readFileSync(envPath, 'utf-8');
for (const line of content.split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
