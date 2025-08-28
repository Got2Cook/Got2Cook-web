// ===== Chaves =====
const LS = 'got2cook_dadosPessoais';
const LS_HUMOR = 'got2cook_humor';

// ===== Refs =====
const fotoPerfil = document.getElementById('fotoPerfil');
const inputFoto  = document.getElementById('inputFoto');
const btnAlterarFoto = document.getElementById('btnAlterarFoto');

const campoNome  = document.getElementById('campoNome');
const campoEmail = document.getElementById('campoEmail');
const btnEditarNome  = document.getElementById('btnEditarNome');
const btnEditarEmail = document.getElementById('btnEditarEmail');

const preferenciasWrap = document.getElementById('preferencias');
const inputPref  = document.getElementById('preferenciaNova');
const btnAddPref = document.getElementById('btnAddPreferencia');
const listaPrefs = document.getElementById('preferenciasLista');

const nivelBtns = Array.from(document.querySelectorAll('.nivel-btn'));

const btnVoltar    = document.getElementById('btnVoltar');
const btnLogo      = document.getElementById('btnLogo');
const btnGeladeira = document.getElementById('btnGeladeira');

const modal         = document.getElementById('editorModal');
const editorInput   = document.getElementById('editorInput');
const editorSalvar  = document.getElementById('editorSalvar');
const editorCancelar= document.getElementById('editorCancelar');
const editorTitulo  = document.getElementById('editorTitulo');

let editingKey = null;
let returnFocusEl = null;

// ===== Storage helpers =====
const getData = () => JSON.parse(localStorage.getItem(LS) || '{}');
const setData = (obj) => localStorage.setItem(LS, JSON.stringify(obj));
const save    = (partial) => { const next = { ...getData(), ...partial }; setData(next); return next; };

// ===== Render =====
function renderPreferencias(persistidas = [], marcadas = []) {
  // livres
  listaPrefs.innerHTML = '';
  persistidas.forEach((p, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${p}</span><button class="remover" data-idx="${i}" aria-label="Remover ${p}">×</button>`;
    listaPrefs.appendChild(li);
  });

  // marcadas (checkboxes base)
  const setMarc = new Set(marcadas);
  document.querySelectorAll('.tag-checkbox').forEach(cb => cb.checked = setMarc.has(cb.value));
}

function renderNivel(nivel) {
  nivelBtns.forEach(btn => {
    const active = btn.dataset.nivel === nivel;
    btn.classList.toggle('selecionado', active);
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function renderAll() {
  const d = getData();
  // foto
  if (d.foto) fotoPerfil.src = d.foto;
  // humor (prioriza storage global)
  const humor = localStorage.getItem(LS_HUMOR) || d.humor || '😀';
  document.getElementById('emojiHumor').textContent = humor;
  // campos
  campoNome.textContent  = d.nome  || 'Usuário';
  campoEmail.textContent = d.email || 'email@exemplo.com';
  // preferências
  renderPreferencias(d.preferenciasLivres || [], d.preferenciasMarcadas || []);
  // nível
  renderNivel(d.nivel || '');
}

// ===== Modal (mini-widget) =====
function openEditor(label, valorAtual, key, sourceEl) {
  editorTitulo.textContent = label;
  editorInput.value = valorAtual || '';
  modal.setAttribute('aria-hidden', 'false');
  editingKey = key;
  returnFocusEl = sourceEl;
  setTimeout(() => editorInput.focus(), 0);
}

function closeEditor() {
  modal.setAttribute('aria-hidden', 'true');
  editingKey = null;
  if (returnFocusEl) returnFocusEl.focus();
}

editorCancelar.addEventListener('click', closeEditor);
modal.addEventListener('click', (e) => { if (e.target === modal) closeEditor(); });
document.addEventListener('keydown', (e) => {
  if (modal.getAttribute('aria-hidden') === 'false' && e.key === 'Escape') closeEditor();
});

editorSalvar.addEventListener('click', () => {
  const val = editorInput.value.trim();
  if (!editingKey) return closeEditor();
  if (editingKey === 'nome')  { campoNome.textContent  = val || campoNome.textContent;   save({ nome:  val }); }
  if (editingKey === 'email') { campoEmail.textContent = val || campoEmail.textContent;  save({ email: val }); }
  closeEditor();
});

// ===== Eventos =====
// Foto
btnAlterarFoto.addEventListener('click', () => inputFoto.click());
inputFoto.addEventListener('change', () => {
  const f = inputFoto.files?.[0];
  if (!f) return;
  const r = new FileReader();
  r.onload = (e) => { fotoPerfil.src = e.target.result; save({ foto: e.target.result }); };
  r.readAsDataURL(f);
});

// Abrir modal para editar nome/e-mail
btnEditarNome .addEventListener('click', () => openEditor('Editar nome',  campoNome.textContent,  'nome',  btnEditarNome));
btnEditarEmail.addEventListener('click', () => openEditor('Editar e-mail', campoEmail.textContent, 'email', btnEditarEmail));
[btnEditarNome, btnEditarEmail].forEach(btn => {
  btn.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }});
});

// Preferências marcadas
preferenciasWrap.addEventListener('change', () => {
  const marcadas = Array.from(document.querySelectorAll('.tag-checkbox:checked')).map(cb => cb.value);
  save({ preferenciasMarcadas: marcadas });
});

// Preferências livres
btnAddPref.addEventListener('click', () => {
  const val = (inputPref.value || '').trim();
  if (!val) return;
  const d = getData();
  const livre = Array.isArray(d.preferenciasLivres) ? d.preferenciasLivres.slice() : [];
  livre.push(val);
  save({ preferenciasLivres: livre });
  inputPref.value = '';
  renderPreferencias(livre, d.preferenciasMarcadas || []);
});
inputPref.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventDefault(); btnAddPref.click(); }
});
listaPrefs.addEventListener('click', (e) => {
  const rm = e.target.closest('button.remover');
  if (!rm) return;
  const idx = Number(rm.dataset.idx);
  const d = getData();
  const livre = (d.preferenciasLivres || []).slice();
  livre.splice(idx, 1);
  save({ preferenciasLivres: livre });
  renderPreferencias(livre, d.preferenciasMarcadas || []);
});

// Nível culinário
nivelBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const nivel = btn.dataset.nivel;
    save({ nivel });
    renderNivel(nivel);
  });
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
  });
});

// Rodapé (links padrão)
btnVoltar.addEventListener('click', () => { window.location.href = '../humor/index.html'; });
btnLogo.addEventListener('click', () => { window.location.href = '../home/index.html'; });
btnGeladeira.addEventListener('click', () => { window.location.href = '../geladeira/index.html'; });

// Boot
document.addEventListener('DOMContentLoaded', renderAll);
