/* ===== Constantes/Helpers ===== */
const KEY_FAVS = 'got2cook_minhasReceitas';
const KEY_TEMP = 'receita_temp';

const $ = (sel, el=document) => el.querySelector(sel);
const normalizar = (s='') =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const setLive = (msg) => { const n=$('#ariaFeedback'); if(n) n.textContent = msg; };

/* ===== Estado ===== */
let receitas = [];
let filtroTexto = '';
let filtroDif = '';
let filtroHumor = '';

/* ===== Storage ===== */
function carregarFavoritos(){
  try{
    const arr = JSON.parse(localStorage.getItem(KEY_FAVS) || '[]');
    return Array.isArray(arr) ? arr : [];
  }catch{ return []; }
}
function salvarFavoritos(lista){
  localStorage.setItem(KEY_FAVS, JSON.stringify(lista));
}

/* ===== Render ===== */
function chip(t){ return `<span class="card-meta">${t}</span>`; }

function criarCard(rec){
  const wrapper = document.createElement('article');
  wrapper.className = 'card-receita';
  wrapper.tabIndex = 0;
  wrapper.setAttribute('role','group');
  wrapper.setAttribute('aria-label', rec.titulo);
  wrapper.dataset.cardId = String(rec.id ?? '');

  wrapper.innerHTML = `
    <img class="card-cover" src="${rec.coverImg || '../../assets/placeholder.jpg'}"
         alt="Imagem da receita ${rec.titulo}">
    <h3 class="card-titulo">${rec.titulo}</h3>
    <div class="meta">
      ${rec.tempo ? chip('⏱ ' + rec.tempo) : ''}
      ${rec.dificuldade ? chip('🎯 ' + rec.dificuldade) : ''}
      ${Array.isArray(rec.humores) && rec.humores.length ? chip(rec.humores.join(' ')) : ''}
    </div>
    <div class="card-acoes">
      <button type="button" class="btn-excluir" aria-label="Excluir">🗑️</button>
      <button type="button" class="card-link" data-id="${rec.id}">Visualizar</button>
    </div>
  `;

  // Visualizar
  wrapper.querySelector('.card-link').addEventListener('click', (ev)=>{
    ev.stopPropagation();
    localStorage.setItem(KEY_TEMP, JSON.stringify(rec));
    window.location.href = '../visualizar/index.html';
  });
  wrapper.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      localStorage.setItem(KEY_TEMP, JSON.stringify(rec));
      window.location.href = '../visualizar/index.html';
    }
  });

  // Excluir
  const onDelete = (e)=>{
    e.stopPropagation();
    const id = String(rec.id);
    const idx = receitas.findIndex(r => String(r.id) === id);
    if (idx >= 0){
      const [rem] = receitas.splice(idx,1);
      salvarFavoritos(receitas);
      wrapper.remove();
      setLive(`Removido: ${rem?.titulo || 'receita'}`);
      if (!receitas.length) mostrarVazio(true);
    }
  };
  wrapper.querySelector('.btn-excluir').addEventListener('click', onDelete);
  wrapper.querySelector('.btn-excluir').addEventListener('keydown', (e)=>{
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onDelete(e); }
  });

  return wrapper;
}

function aplicarFiltros(base){
  return base.filter(r=>{
    const okTexto = !filtroTexto || normalizar(r.titulo).includes(normalizar(filtroTexto));
    const okDif   = !filtroDif || normalizar(r.dificuldade||'') === normalizar(filtroDif);
    const humorStr = Array.isArray(r.humores) ? r.humores.join(' ') : (r.humores||'');
    const okHumor = !filtroHumor || humorStr.includes(filtroHumor);
    return okTexto && okDif && okHumor;
  });
}

function mostrarVazio(v){
  const vz = $('#estadoVazio'), ls = $('#listaReceitas');
  if (vz) vz.hidden = !v;
  if (ls) ls.hidden = v;
}

function render(){
  const lista = $('#listaReceitas');
  lista.innerHTML = '';
  const filtradas = aplicarFiltros(receitas);
  if (!filtradas.length){
    mostrarVazio(true);
    return;
  }
  mostrarVazio(false);
  for (const r of filtradas){
    lista.appendChild(criarCard(r));
  }
}

/* ===== Eventos ===== */
function conectarEventos(){
  $('#campoBusca').addEventListener('input', e=>{ filtroTexto = e.target.value || ''; render(); });
  $('#filtroDificuldade').addEventListener('change', e=>{ filtroDif = e.target.value; render(); });
  $('#filtroHumor').addEventListener('change', e=>{ filtroHumor = e.target.value; render(); });
  $('#btnLimparFiltros').addEventListener('click', ()=>{
    filtroTexto=filtroDif=filtroHumor='';
    $('#campoBusca').value=''; $('#filtroDificuldade').value=''; $('#filtroHumor').value='';
    render();
  });
}

/* ===== Boot ===== */
document.addEventListener('DOMContentLoaded', ()=>{
  receitas = carregarFavoritos().map((r,i)=>({ ...r, id: (r.id ?? `${normalizar(r.titulo)}_${i}`) }));
  salvarFavoritos(receitas);   // normaliza
  conectarEventos();
  render();
});
