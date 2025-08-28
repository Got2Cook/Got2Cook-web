/* ===== Helpers ===== */
const KEY_FAVS = 'got2cook_minhasReceitas';
const KEY_TEMP = 'receita_temp';

const $ = (sel, el=document) => el.querySelector(sel);
const $$ = (sel, el=document) => Array.from(el.querySelectorAll(sel));

const normalizar = (s='') =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();

const setLive = (msg) => { $('#ariaFeedback').textContent = msg; };

/* ===== Estado ===== */
let receitas = [];
let filtroTexto = '';
let filtroDif = '';
let filtroHumor = '';

/* ===== Carregar do localStorage ===== */
function carregarFavoritos(){
  try{
    const arr = JSON.parse(localStorage.getItem(KEY_FAVS) || '[]');
    if (!Array.isArray(arr)) return [];
    const mapa = new Map();
    for (const r of arr) {
      if (r && r.id != null) mapa.set(String(r.id), r);
    }
    return Array.from(mapa.values());
  }catch{ return []; }
}

/* ===== Salvar ===== */
function salvarFavoritos(lista){
  localStorage.setItem(KEY_FAVS, JSON.stringify(lista));
}

/* ===== Utils ===== */
function receitasFavoritasTem(id){
  return receitas.some(r => String(r.id) === String(id));
}

function removerReceita(id){
  const idx = receitas.findIndex(r => String(r.id) === String(id));
  if (idx >= 0){
    const [removida] = receitas.splice(idx,1);
    salvarFavoritos(receitas);
    const card = document.querySelector(`[data-card-id="${CSS.escape(String(id))}"]`);
    if (card) card.remove();
    setLive(`Removido: ${removida?.titulo || 'receita'}`);
    if (!receitas.length) mostrarVazio(true);
  }
}

/* ===== Render ===== */
function chip(texto){ return `<span class="card-meta">${texto}</span>`; }

function criarCard(rec){
  const btnFavId = `fav_${rec.id}`;
  const btnDelId = `del_${rec.id}`;
  const pressed = receitasFavoritasTem(rec.id);

  const wrapper = document.createElement('article');
  wrapper.className = 'card-receita';
  wrapper.tabIndex = 0;
  wrapper.setAttribute('role','group');
  wrapper.setAttribute('aria-label', rec.titulo);
  wrapper.dataset.cardId = String(rec.id);

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
      <button type="button" class="btn-favorito" id="${btnFavId}" aria-pressed="${pressed}" aria-label="Favorito">
        ${pressed ? '💜' : '🤍'}
      </button>
      <button type="button" class="btn-excluir" id="${btnDelId}" aria-label="Excluir">🗑️</button>
      <button type="button" class="card-link" data-id="${rec.id}">Visualizar</button>
    </div>
  `;

  // Visualizar
  wrapper.querySelector('.card-link').addEventListener('click', (ev)=>{
    ev.stopPropagation();
    localStorage.setItem(KEY_TEMP, JSON.stringify(rec));
    window.location.href = '../visualizar/index.html';
  });

  // Enter/Espaço no card → visualizar
  wrapper.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      localStorage.setItem(KEY_TEMP, JSON.stringify(rec));
      window.location.href = '../visualizar/index.html';
    }
  });

  // Favoritar (toggle)
  const btnFav = wrapper.querySelector(`#${CSS.escape(btnFavId)}`);
  btnFav.addEventListener('click', (e)=>{
    e.stopPropagation();
    alternarFavorito(rec.id);
  });
  btnFav.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      alternarFavorito(rec.id);
    }
  });

  // Excluir (sempre remover)
  const btnDel = wrapper.querySelector(`#${CSS.escape(btnDelId)}`);
  const onDelete = (e)=>{
    e.stopPropagation();
    removerReceita(rec.id);
  };
  btnDel.addEventListener('click', onDelete);
  btnDel.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onDelete(e);
    }
  });

  return wrapper;
}

function alternarFavorito(id){
  const idx = receitas.findIndex(r => String(r.id) === String(id));
  if (idx >= 0){
    const removida = receitas.splice(idx,1)[0];
    salvarFavoritos(receitas);
    const btn = document.getElementById(`fav_${id}`);
    if (btn){ btn.setAttribute('aria-pressed','false'); btn.textContent = '🤍'; }
    const card = btn?.closest('.card-receita');
    if (card) card.remove();
    setLive(`Removido dos favoritos: ${removida?.titulo || 'receita'}`);
    if (!receitas.length) mostrarVazio(true);
  }else{
    // recriar a partir do card visível
    const card = document.getElementById(`fav_${id}`)?.closest('.card-receita');
    if (!card) return;
    const titulo = card.querySelector('.card-titulo')?.textContent?.trim() || '';
    const coverImg = card.querySelector('.card-cover')?.getAttribute('src') || '';
    const metas = Array.from(card.querySelectorAll('.card-meta')).map(n=>n.textContent);
    const tempo = metas.find(m=>m.startsWith('⏱'))?.replace('⏱ ','') || '';
    const dificuldade = metas.find(m=>m.startsWith('🎯'))?.replace('🎯 ','') || '';
    const humores = metas.filter(m=>!m.startsWith('⏱') && !m.startsWith('🎯'));
    const novo = { id, titulo, tempo, dificuldade, humores, coverImg };
    receitas.push(novo);
    salvarFavoritos(receitas);
    const btn = document.getElementById(`fav_${id}`);
    if (btn){ btn.setAttribute('aria-pressed','true'); btn.textContent = '💜'; }
    setLive(`Adicionado aos favoritos: ${novo.titulo}`);
  }
}

/* Filtros */
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
  $('#estadoVazio').hidden = !v;
  $('#listaReceitas').hidden = v;
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

/* Eventos UI */
function conectarEventos(){
  $('#campoBusca').addEventListener('input', (e)=>{
    filtroTexto = e.target.value || '';
    render();
  });

  $('#filtroDificuldade').addEventListener('change', (e)=>{
    filtroDif = e.target.value;
    render();
  });

  $('#filtroHumor').addEventListener('change', (e)=>{
    filtroHumor = e.target.value;
    render();
  });

  $('#btnLimparFiltros').addEventListener('click', ()=>{
    filtroTexto = ''; filtroDif = ''; filtroHumor = '';
    $('#campoBusca').value = '';
    $('#filtroDificuldade').value = '';
    $('#filtroHumor').value = '';
    render();
  });
}

/* Boot */
document.addEventListener('DOMContentLoaded', ()=>{
  receitas = carregarFavoritos();
  receitas = receitas.map((r,i)=>({
    ...r,
    id: (r.id ?? `${normalizar(r.titulo)}_${i}`)
  }));
  salvarFavoritos(receitas);

  conectarEventos();
  render();

  // Removido o foco automático no #conteudo para evitar contorno inicial
});
