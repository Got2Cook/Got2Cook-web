const LS = 'got2cook_dadosPessoais';
const LS_HUMOR = 'got2cook_humor';

// Refs
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

// Rodapé
document.getElementById('btnVoltar').onclick    = () => location.href = '../humor/index.html';
document.getElementById('btnLogo').onclick      = () => location.href = '../home/index.html';
document.getElementById('btnGeladeira').onclick = () => location.href = '../geladeira/index.html';

// Storage helpers
const getData = () => JSON.parse(localStorage.getItem(LS) || '{}');
const setData = (obj) => localStorage.setItem(LS, JSON.stringify(obj));
const save = (partial) => { const n = { ...getData(), ...partial }; setData(n); return n; };

// Render
function renderPreferencias(persistidas = [], marcadas = []) {
  listaPrefs.innerHTML = '';
  persistidas.forEach((p, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${p}</span><button class="remover" data-idx="${i}" aria-label="Remover ${p}">×</button>`;
    listaPrefs.appendChild(li);
  });
  const setMarc = new Set(marcadas);
  document.querySelectorAll('.tag-checkbox').forEach(cb => cb.checked = setMarc.has(cb.value));
}

function renderNivel(nivel){ nivelBtns.forEach(b=>b.classList.toggle('selecionado', b.dataset.nivel===nivel)); }

function renderAll(){
  const d = getData();
  if (d.foto) fotoPerfil.src = d.foto;
  const humor = localStorage.getItem(LS_HUMOR) || d.humor || '😀';
  emojiHumor.textContent = humor;
  campoNome.textContent  = d.nome  || 'Usuário';
  campoEmail.textContent = d.email || 'email@exemplo.com';
  renderPreferencias(d.preferenciasLivres || [], d.preferenciasMarcadas || []);
  renderNivel(d.nivel || '');
}

// -------- Mini-widget de edição --------
const modal = document.getElementById('editorModal');
const editorInput = document.getElementById('editorInput');
const editorSalvar = document.getElementById('editorSalvar');
const editorCancelar = document.getElementById('editorCancelar');
let editingKey = null;
let returnFocusEl = null;

function openEditor(label, valorAtual, key, sourceEl){
  document.getElementById('editorTitulo').textContent = label;
  editorInput.value = valorAtual || '';
  modal.setAttribute('aria-hidden','false');
  editingKey = key;
  returnFocusEl = sourceEl;
  setTimeout(()=>editorInput.focus(),0);
}

function closeEditor(){
  modal.setAttribute('aria-hidden','true');
  editingKey = null;
  if (returnFocusEl) returnFocusEl.focus();
}

editorCancelar.addEventListener('click', closeEditor);
modal.addEventListener('click', (e)=>{ if(e.target===modal) closeEditor(); });
document.addEventListener('keydown', (e)=>{ if(modal.getAttribute('aria-hidden')==='false' && e.key==='Escape') closeEditor(); });

editorSalvar.addEventListener('click', ()=>{
  const val = editorInput.value.trim();
  if (!editingKey) return closeEditor();
  if (editingKey==='nome'){ campoNome.textContent = val || campoNome.textContent; save({nome:val}); }
  if (editingKey==='email'){ campoEmail.textContent = val || campoEmail.textContent; save({email:val}); }
  closeEditor();
});

// Abrir editor
btnEditarNome.addEventListener('click', ()=> openEditor('Editar nome', campoNome.textContent, 'nome', btnEditarNome));
btnEditarEmail.addEventListener('click', ()=> openEditor('Editar e-mail', campoEmail.textContent, 'email', btnEditarEmail));
[btnEditarNome, btnEditarEmail].forEach(btn=>{
  btn.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); btn.click(); }});
});

// Foto
btnAlterarFoto.addEventListener('click', ()=> inputFoto.click());
inputFoto.addEventListener('change', ()=>{
  const f = inputFoto.files?.[0]; if(!f) return;
  const r = new FileReader();
  r.onload = e => { fotoPerfil.src = e.target.result; save({foto: e.target.result}); };
  r.readAsDataURL(f);
});

// Preferências marcadas
preferenciasWrap.addEventListener('change', ()=>{
  const marcadas = Array.from(document.querySelectorAll('.tag-checkbox:checked')).map(cb=>cb.value);
  save({ preferenciasMarcadas: marcadas });
});

// Preferências livres
btnAddPref.addEventListener('click', ()=>{
  const val = (inputPref.value||'').trim(); if(!val) return;
  const d = getData(); const livre = Array.isArray(d.preferenciasLivres)? d.preferenciasLivres.slice():[];
  livre.push(val); save({preferenciasLivres:livre}); inputPref.value=''; renderPreferencias(livre, d.preferenciasMarcadas||[]);
});
inputPref.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); btnAddPref.click(); }});
listaPrefs.addEventListener('click', e=>{
  const rm = e.target.closest('button.remover'); if(!rm) return;
  const idx = Number(rm.dataset.idx); const d = getData(); const livre = (d.preferenciasLivres||[]).slice();
  livre.splice(idx,1); save({preferenciasLivres:livre}); renderPreferencias(livre, d.preferenciasMarcadas||[]);
});

// Nível
nivelBtns.forEach(btn=>{
  btn.addEventListener('click', ()=>{ save({nivel: btn.dataset.nivel}); renderNivel(btn.dataset.nivel); });
  btn.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); btn.click(); }});
});

// Boot
document.addEventListener('DOMContentLoaded', renderAll);
