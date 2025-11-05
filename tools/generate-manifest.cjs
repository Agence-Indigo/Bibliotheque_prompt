const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const PROMPT_DIR = path.join(ROOT, 'prompt');
const OUT = path.join(ROOT, 'prompts.json');

function titleFromFilename(name) {
  const base = name.replace(/\.md$/i, '').replace(/^\d+[_-]?/, '');
  const spaced = base.replace(/[_-]+/g, ' ').trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

function parseFolder(folder) {
  if (folder === 'Commun') {
    return { person: 'Commun CNL', domain: 'Commun' };
  }
  const parts = folder.split('-');
  const person = parts.shift() || folder;
  const domain = parts.join(' ').replace(/\s+/g, ' ').trim();
  return { person, domain: domain || 'Général' };
}

function collect() {
  const entries = fs.readdirSync(PROMPT_DIR, { withFileTypes: true });
  const results = [];
  for (const ent of entries) {
    if (!ent.isDirectory()) continue;
    const folder = ent.name;
    const { person, domain } = parseFolder(folder);
    const abs = path.join(PROMPT_DIR, folder);
    const files = fs.readdirSync(abs, { withFileTypes: true });
    for (const f of files) {
      if (!f.isFile() || !f.name.toLowerCase().endsWith('.md')) continue;
      const fileAbs = path.join(abs, f.name);
      const content = fs.readFileSync(fileAbs, 'utf8');
      const title = titleFromFilename(f.name);
      const firstLine = (content.split(/\r?\n/).find(l => l.trim().length > 0) || '').trim();
      const excerpt = (firstLine || '').slice(0, 200);
      const rel = path.posix.join('prompt', folder, f.name).replace(/\\/g, '/');
      results.push({ person, domain, title, file: rel, excerpt, content });
    }
  }
  results.sort((a, b) => a.person.localeCompare(b.person) || a.title.localeCompare(b.title));
  return results;
}

function main() {
  try {
    const data = collect();
    fs.writeFileSync(OUT, JSON.stringify(data, null, 2), 'utf8');
    console.log(`OK • ${data.length} prompts → ${path.relative(ROOT, OUT)}`);
  } catch (e) {
    console.error('Erreur de génération:', e.message);
    process.exit(1);
  }
}

main();
