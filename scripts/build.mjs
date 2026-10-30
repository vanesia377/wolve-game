import { cpSync, mkdirSync, writeFileSync } from 'node:fs';

// Copy only the site assets, never repository metadata, tests, or credentials.
mkdirSync(new URL('../docs/', import.meta.url), { recursive: true });
for (const file of ['index.html', 'style.css', 'app.js', 'engine.js', 'favicon.svg']) {
  cpSync(new URL(`../public/${file}`, import.meta.url), new URL(`../docs/${file}`, import.meta.url));
}
writeFileSync(new URL('../docs/.nojekyll', import.meta.url), '');
console.log('Static site built in docs/');
