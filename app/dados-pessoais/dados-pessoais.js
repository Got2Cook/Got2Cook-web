/* ===== Chaves de storage ===== */
const LS_DADOS = 'got2cook_dadosPessoais';
const LS_HUMOR = 'got2cook_humor';

/* ===== Referências ===== */
const fotoPerfil = document.getElementById('fotoPerfil');
const emojiHumor = document.getElementById('emojiHumor');
const inputFoto  = document.getElementById('inputFoto');
const btnEditarFoto = document.getElementById('btnEditarFoto');

const campoNomeSpan  = document.getElementById('campoNome');
const campoEmailSpan = document.getElementById('campoEmail');
const inputNome  = document.getElementById('inputNome');
const inputEmail = document.getElementById('inputEmail');
const btnEditarNome  = document.getElementById('btnEditarNome');
const btnEditarEmail = document.getElementById('btnEditarEmail');

const listaPrefs = document.getElementById('preferenciasLista');
const inputPref  = document.getElementById('preferenciaNova');
const btnAddPref = document.getElementById('btnAddPreferencia');

const nivelBtns = Array.from(document.querySelectorAll('.nivel-btn'));

const btnVoltar    = document.getElementById('btnVoltar');
const btnLogo      = document.getElementById('btnLogo');
const btnGeladeira = document.getElementById('btnGeladeira');

/* ===== Util ===== */
const getData = () => JSON.parse(localStorage.getItem(LS_DADOS) || '{}');
const setData = (obj) => localStorage.setItem(LS_DADOS, JSON.stringify(obj));

function mergeSave(partial) {
  const curr = getData();
  const next = { ...curr, ...partial };
  setData(next);
  return next;
}

/* ===== Render ===== */
function renderPreferencias(prefs = []) {
  listaPrefs.innerHTML = '';
  prefs.forEach((p, idx) => {
    const li = document.createElement('li');
    li.innerHTML = `
      <span>${p}</span>
      <button class="remover" aria-label="Remover ${p}" title="Remover" data-idx="${idx}">×</button>
    `;
    listaPrefs.appendChild(li);
  });
}

function renderNivel(nivel) {
  nivelBtns.forEach(btn => {
    const active = btn.dataset.nivel === nivel;
    btn.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
}

function renderAll() {
  const data = getData();

  // Foto
  if (data.foto) fotoPerfil.src = data.foto;

  // Humor (prioriza storage global se existir)
  const humor = localStorage.getItem(LS_HUMOR) || data.humor || '😀';
  emojiHumor.textContent = humor;

  // Campos
  campoNomeSpan.textContent  = data.nome  || 'Usuário';
  campoEmailSpan.textContent = data.email || 'email@exemplo.com';

  // Preferências
  renderPreferencias(Array.isArray(data.preferencias) ? data.preferencias : []);

  // Nível
  renderNivel(data.nivel || '');
}

/* ===== Edição inline (troca span ↔ input) ===== */
function editarCampo(spanEl, inputEl, key) {
  inputEl.value = spanEl.textContent.trim();
  spanEl.style.display = 'none';
  inputEl.style.display = 'block';
  inputEl.focus();
  inputEl.select();

  const commit = () => {
    const val = inputEl.value.trim();
    spanEl.textContent = val || spanEl.textContent;
    inputEl.style.display = 'none';
    spanEl.style.display = 'flex';
    mergeSave({ [key]: val });
    inputEl.removeEventListener('keydown', onKey);
    inputEl.removeEventListener('blur', commit);
  };

  const onKey = (e) => {
    if (e.key === 'Enter') commit();
    if (e.key === 'Escape') { // cancelar
      inputEl.style.display = 'none';
      spanEl.style.display = 'flex';
    }
  };

  inputEl.addEventListener('keydown', onKey);
  inputEl.addEventListener('blur', commit);
}

/* ===== Handlers ===== */
// Foto
btnEditarFoto.addEventListener('click', () => inputFoto.click());
inputFoto.addEventListener('change', () => {
  const file = inputFoto.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    const dataUrl = e.target.result;
    fotoPerfil.src = dataUrl;
    mergeSave({ foto: dataUrl });
  };
  reader.readAsDataURL(file);
});

// Nome / Email
btnEditarNome.addEventListener('click', () => editarCampo(campoNomeSpan, inputNome, 'nome'));
btnEditarEmail.addEventListener('click', () => editarCampo(campoEmailSpan, inputEmail, 'email'));

// Teclado (Enter/Espaço) nos botões de lápis
[btnEditarFoto, btnEditarNome, btnEditarEmail].forEach(btn => {
  btn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
  });
});

// Preferências
btnAddPref.addEventListener('click', () => {
  const val = (inputPref.value || '').trim();
  if (!val) return;
  const curr = getData();
  const prefs = Array.isArray(curr.preferencias) ? curr.preferencias.slice() : [];
  prefs.push(val);
  mergeSave({ preferencias: prefs });
  inputPref.value = '';
  renderPreferencias(prefs);
});
inputPref.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') { e.preventD
