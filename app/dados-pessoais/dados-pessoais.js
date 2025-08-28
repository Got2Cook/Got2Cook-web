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

const emojiHumor = document.getElementById('emojiHumor');

const preferenciasWrap = document.getElementById('preferencias');
const inputPref  = document.getElementById('preferenciaNova');
const btnAddPref = document.getElementById('btnAddPreferencia');
const listaPrefs = document.getElementById('preferenciasLista');

const nivelBtns = Array.from(document.querySelectorAll('.nivel-btn'));

const btnVoltar    = document.getElementById('btnVoltar');
const btnLogo      = document.getElementById('btnLogo');
const btnGeladeira = document.getElementById('btnGeladeira');

// ===== Storage utils =====
const getData = () => JSON.parse(localStorage.getItem(LS) || '{}');
const setData = (obj) => localStorage.setItem(LS, JSON.stringify(obj));
const save = (partial) => { const n = { ...getData(), ...partial }; setData(n); return n; };

// ===== Render =====
function renderPreferencias(persistidas = [], marcadas = []) {
  // Persistidas (livres)
  listaPrefs.innerHTML = '';
  persistidas.forEach((p, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${p}</span><button class="remover" data-idx="${i}" aria-label="Remover ${p}">×</button>`;
    listaPrefs.appendChild(li);
  });

  // Marcadas (checkboxes do bloco base)
  const setMarcadas = new Set(marcadas);
  document.querySelectorAll('.tag-checkbox').forEach(cb => {
    cb.checked = setMarcadas.has(cb.value);
  });
}

function renderNivel(nivel) {
  nivelBtns.forEach(b => b.classList.toggle('selecionado', b.dataset.nivel === nivel));
}

function renderAll() {
  const d = getData();

  if (d.foto) fotoPerfil.src = d.foto;

  const humor = localStorage.getItem(LS_HUMOR) || d.humor || '😀';
  emojiHumor.textContent = humor;

  campoNome.textContent  = d.nome  || 'Usuário';
  campoEmail.textContent = d.email || 'email@exemplo.com';

  renderPreferencias(d.preferenciasLivres || [], d.preferenciasMarcadas || []);
  renderNivel(d.nivel || '');
}

// ===== Editar inline (span → prompt simples para manter seu visual) =====
function editarTexto(spanEl, key, tipo = 'text') {
  const atual = spanEl.textContent.trim();
  const novo = window.prompt('Editar:', atual);
  if (novo === null) return;
  const val = novo.trim();
  if (!val) return;
  spanEl.textContent = val;
  save({ [key]: val });
}

// ===== Eventos =====
// Foto
btnAlterarFoto.addEventListener('click', () => inputFoto.click());
inputFoto.addEventListener('change', () => {
  const f = inputFoto.files?.[0];
  if (!f) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    fotoPerfil.src = e.target.result;
    save({ foto: e.target.result });
  };
  reader.readAsDataURL(f);
});

// Nome/Email
btnEditarNome.addEventListener('click', () => editarTexto(campoNome, 'nome'));
btnEditarEmail.addEventListener('click', () => editarTexto(campoEmail, 'email'));
[btnEditarNome, btnEditarEmail].forEach(btn => {
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
  });
});

// Preferências marcadas (checkboxes base)
preferenciasWrap.addEventListener('change', () => {
  const marcadas = Array.from(document.querySelectorAll('.tag-checkbox:checked')).map(cb => cb.value);
  save({ preferenciasMarcadas: marcadas });
});

// Preferências livres (+ lista)
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

// Nível
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

// Rodapé (links corretos)
btnVoltar.addEventListener('click', () => { window.location.href = '../humor/index.html'; });
btnLogo.addEventListener('click', () => { window.location.href = '../home/index.html'; });
btnGeladeira.addEventListener('click', () => { window.location.href = '../geladeira/index.html'; });

// Boot
document.addEventListener('DOMContentLoaded', renderAll);
