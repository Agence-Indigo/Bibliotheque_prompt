// Small utility to debounce quick typing
const debounce = (fn, wait = 200) => {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
};

const state = {
  prompts: [],
  filtered: [],
  persons: [],
  domains: [],
  filters: { person: '', domain: '', q: '' }
};

const els = {
  grid: document.getElementById('grid'),
  stats: document.getElementById('stats'),
  empty: document.getElementById('emptyState'),
  personFilter: document.getElementById('personFilter'),
  domainFilter: document.getElementById('domainFilter'),
  search: document.getElementById('searchInput'),
  template: document.getElementById('cardTemplate'),
  dialog: document.getElementById('promptDialog'),
  dialogTitle: document.getElementById('dialogTitle'),
  dialogMeta: document.getElementById('dialogMeta'),
  dialogContent: document.getElementById('dialogContent'),
  closeDialog: document.getElementById('closeDialog'),
  copyBtn: document.getElementById('copyBtn'),
  openChatGPTBtn: document.getElementById('openChatGPTBtn'),
  openFileBtn: document.getElementById('openFileBtn'),
};

// Fetch manifest and hydrate UI
async function load() {
  try {
    const res = await fetch('prompts.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('prompts.json introuvable');
    const data = await res.json();
    // Filter out root/"Divers" entries if present in an older manifest
    const cleaned = data.filter(p => p.person !== 'Divers' && !/prompt\/idee_de_prompt\.md$/i.test(p.file));
    state.prompts = cleaned;
    state.persons = Array.from(new Set(cleaned.map(p => p.person))).sort((a,b)=>a.localeCompare(b));
    state.domains = Array.from(new Set(cleaned.map(p => p.domain))).sort((a,b)=>a.localeCompare(b));
    fillFilters();
    applyFilters();
  } catch (e) {
    console.error(e);
    els.grid.innerHTML = `<div class="empty">Impossible de charger prompts.json. Assurez-vous qu'il est généré et que la page est servie via un serveur local (pas file://).</div>`;
  }
}

function fillFilters() {
  for (const p of state.persons) {
    const opt = document.createElement('option'); opt.value = p; opt.textContent = p; els.personFilter.appendChild(opt);
  }
  for (const d of state.domains) {
    const opt = document.createElement('option'); opt.value = d; opt.textContent = d; els.domainFilter.appendChild(opt);
  }
}

function applyFilters() {
  const q = state.filters.q.trim().toLowerCase();
  const person = state.filters.person;
  const domain = state.filters.domain;
  state.filtered = state.prompts.filter(p => {
    if (person && p.person !== person) return false;
    if (domain && p.domain !== domain) return false;
    if (q) {
      const hay = `${p.title} ${p.content} ${p.file}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
  renderGrid();
}

function renderGrid() {
  els.grid.textContent = '';
  els.stats.textContent = `${state.filtered.length} prompt(s) • ${state.persons.length} personne(s) • ${state.domains.length} domaine(s)`;
  els.empty.classList.toggle('hidden', state.filtered.length !== 0);
  const frag = document.createDocumentFragment();
  for (const p of state.filtered) frag.appendChild(cardFor(p));
  els.grid.appendChild(frag);
}

function cardFor(p) {
  const node = document.importNode(els.template.content, true);
  node.querySelector('.card-title').textContent = p.title;
  node.querySelector('.badge.person').textContent = p.person;
  node.querySelector('.badge.domain').textContent = p.domain;
  node.querySelector('.card-excerpt').textContent = computeExcerpt(p.content);

  const open = () => openDialog(p);
  node.querySelector('.viewBtn').addEventListener('click', open);
  node.querySelector('.card').addEventListener('click', (e) => {
    // Avoid double when clicking copy
    if (!(e.target && e.target.classList.contains('copyBtn'))) open();
  });
  node.querySelector('.copyBtn').addEventListener('click', async (e) => {
    e.stopPropagation();
    await copyText(p.content);
    toast('Prompt copié');
  });
  return node;
}

function openDialog(p) {
  els.dialogTitle.textContent = p.title;
  els.dialogMeta.textContent = `${p.person} • ${p.domain}`;
  const html = window.marked ? window.marked.parse(p.content) : `<pre>${escapeHtml(p.content)}</pre>`;
  els.dialogContent.innerHTML = html;
  els.openChatGPTBtn.href = 'https://chat.openai.com/';
  els.openFileBtn.href = p.file;
  els.copyBtn.onclick = async () => { await copyText(p.content); toast('Prompt copié'); };
  if (!els.dialog.open) els.dialog.showModal();
}

els.closeDialog.addEventListener('click', () => els.dialog.close());
els.dialog.addEventListener('click', (e) => { if (e.target === els.dialog) els.dialog.close(); });

els.personFilter.addEventListener('change', (e) => { state.filters.person = e.target.value; applyFilters(); });
els.domainFilter.addEventListener('change', (e) => { state.filters.domain = e.target.value; applyFilters(); });
els.search.addEventListener('input', debounce((e) => { state.filters.q = e.target.value; applyFilters(); }, 200));

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch (e) {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
  }
}

function toast(msg) {
  const el = document.createElement('div');
  el.textContent = msg; el.style.position = 'fixed'; el.style.bottom = '20px'; el.style.left = '50%'; el.style.transform = 'translateX(-50%)'; el.style.background = 'rgba(0,0,0,0.8)'; el.style.color = 'white'; el.style.padding = '8px 12px'; el.style.borderRadius = '8px'; el.style.zIndex = '9999';
  document.body.appendChild(el); setTimeout(() => el.remove(), 1200);
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function computeExcerpt(content) {
  const lines = String(content).split(/\r?\n/).map(l => l.trim());
  const i0 = lines.findIndex(l => l.length > 0);
  const first = i0 >= 0 ? lines[i0] : '';
  let chosen = first;
  if (/^🎯/.test(first)) {
    const next = lines.slice(i0 + 1).find(l => l.length > 0) || '';
    chosen = next;
  }
  const max = 220;
  return chosen.length > max ? chosen.slice(0, max - 1) + '…' : chosen;
}

// Minimal error surface to help diagnose front issues
window.addEventListener('error', (e) => {
  console.error(e.error || e.message);
  try { toast('Erreur: ' + (e.message || 'voir console')); } catch {}
});

load();
