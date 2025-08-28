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
    // dedupe por id
    const mapa = new Map();
    for (const r of arr) {
      if (r && r.id != null) mapa.set(String(r.id), r);
    }
    return Array.from(mapa.values());
  }catch(e){
    return [];
  }
}

/* ===== Salvar ===== */
function salvarFavoritos(lista){
  localStorage.setItem(KEY_FAVS, JSON.stringify(lista));
}

/* ===== Render ===== */
function chip(texto){ return `<span class="card-meta">${texto}</span>`; }

function criarCard(rec){
  const btnId = `fav_${rec.id}`;
  const pressed = receitasFavoritasTem(rec.id);

  const wrapper = document.createElement('article');
  wrapper.className = 'card-receita';
  wrapper.tabIndex = 0; // acessível
  wrapper.setAttribute('role','group');
  wrapper.setAttribute('aria-label', rec.titulo);

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
      <button type="button" class="btn-favorito" id="${btnId}" aria-pressed="${pressed}" aria-label="Favorito">
        ${pressed ? '💜' : '🤍'}
      </button>
      <button type="button" class="card-link" data-id="${rec.id}">Visualizar</button>
    </div>
  `;

  // Navegar ao visualizar
  wrapper.querySelector('.card-link').addEventListener('click', (ev)=>{
    ev.stopPropagation();
    localStorage.setItem(KEY_TEMP, JSON.stringify(rec));
    window.location.href = '../visualizar/index.html';
  });

  // Enter/Espaço no card abre visualizar
  wrapper.addEventListener('keydown', (e)=>{
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      localStorage.setItem(KEY_TEMP, JSON.stringify(rec));
      window.location.href = '../visualizar/index.html';
    }
  });

  // Favoritar
  const btnFav = wrapper.querySelector(`#${CSS.escape(btnId)}`);
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

  return wrapper;
}

function receitasFavoritasTem(id){
  return receitas.some(r => String(r.id) === String(id));
}

function alternarFavorito(id){
  const idx = receitas.findIndex(r => String(r.id) === String(id));
  if (idx >= 0){
    const removida = receitas.splice(idx,1)[0];
    salvarFavoritos(receitas);
    // Atualiza botão visual
    const btn = document.getElementById(`fav_${id}`);
    if (btn){ btn.setAttribute('aria-pressed','false'); btn.textContent = '🤍'; }
    setLive(`Removido dos favoritos: ${removida.titulo}`);
    // Re-render opcional: só removemos o card visualmente
    const card = btn.closest('.card-receita');
    if (card) card.remove();
    // Estado vazio?
    if (!receitas.length) mostrarVazio(true);
  }else{
    // Para adicionar precisamos ter o objeto; busque no conjunto filtrado/renderizado
    // (nesta tela, add volta a salvar o mesmo item se ele tiver sido removido)
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

/* Monta a lista segundo filtros */
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

/* ===== Eventos UI ===== */
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

/* ===== Boot ===== */
document.addEventListener('DOMContentLoaded', ()=>{
  // carrega favoritos e renderiza
  receitas = carregarFavoritos();
  // Se algum item veio sem id, gere um id estável baseado no título+cover
  receitas = receitas.map((r,i)=>({
    ...r,
    id: (r.id ?? `${normalizar(r.titulo)}_${i}`)
  }));
  salvarFavoritos(receitas); // normaliza/garante dedupe persistido

  conectarEventos();
  render();

  // Acessibilidade: foco no main para leitura imediata
  $('#conteudo').focus();
});
