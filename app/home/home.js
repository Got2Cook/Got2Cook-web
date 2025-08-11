// home.js — Adaptação para o site (sem cores no JS; só DOM/dados)

// Utilitário: tenta parsear JSON com segurança
function safeParse(v){
  if(typeof v!=='string') return v;
  try{ return JSON.parse(v);}catch{ return v;}
}

// Estado do usuário a partir do localStorage
// Chaves esperadas (se existirem):
//  - got2cook_nome: "Vitória"
//  - got2cook_humor: "😊" OU { emoji:"😊", label:"Feliz" }
function getUserState(){
  const nome = localStorage.getItem('got2cook_nome') || '';
  const humorRaw = localStorage.getItem('got2cook_humor');
  const parsed = safeParse(humorRaw);

  let humor = { emoji:'', label:'' };
  if(typeof parsed === 'string'){
    humor.emoji = parsed;
  }else if(parsed && typeof parsed === 'object'){
    humor.emoji = parsed.emoji || '';
    humor.label = parsed.label || '';
  }
  return { nome, humor };
}

// (Opcional) Mock de receitas por humor
function getReceitasPorHumor(humor){
  const e = humor?.emoji || '🍽️';
  const tag = humor?.label || 'Hoje';
  return [
    { id:'r1', titulo:`${tag} — Bowl Saudável`, tempo:'20 min', emoji:e, imgAlt:'Bowl saudável' },
    { id:'r2', titulo:`${tag} — Massa Cremosa`, tempo:'25 min', emoji:e, imgAlt:'Massa cremosa' },
    { id:'r3', titulo:`${tag} — Wrap Rápido`,   tempo:'15 min', emoji:e, imgAlt:'Wrap rápido' },
    { id:'r4', titulo:`${tag} — Doce Prático`,  tempo:'10 min', emoji:e, imgAlt:'Sobremesa prática' }
  ];
}

// Render da saudação
function renderGreeting(state){
  const nomeEl = document.getElementById('usuarioNome');
  const emojiEl = document.getElementById('usuarioEmoji');

  nomeEl.textContent = state.nome ? ` ${state.nome}` : '';
  emojiEl.textContent = state.humor?.emoji || '';
  if(!emojiEl.textContent) emojiEl.setAttribute('aria-hidden','true');
}

// Cria um card (placeholders visuais; troque por <img> quando tiver arquivo)
function createCard(item){
  const article = document.createElement('article');
  article.className = 'card';
  article.setAttribute('role','listitem');

  const media = document.createElement('div');
  media.className = 'card__media';
  media.setAttribute('role','img');
  media.setAttribute('aria-label', item.imgAlt || 'Imagem da receita');
  // Substitua por <img src="../../assets/receita1.png" alt="..."> quando enviar imagens
  media.textContent = '🍲';

  const body = document.createElement('div');
  body.className = 'card__body';

  const h3 = document.createElement('h3');
  h3.className = 'card__title';
  h3.textContent = item.titulo;

  const meta = document.createElement('p');
  meta.className = 'card__meta';
  meta.textContent = `⏱ ${item.tempo} • ${item.emoji || '😋'}`;

  const link = document.createElement('a');
  link.className = 'card__more';
  link.href = '../minhas-receitas/index.html'; // placeholder
  link.setAttribute('aria-label','Ver mais sugestões');
  link.innerHTML = 'Ver mais <span aria-hidden="true">›</span>';

  body.append(h3, meta, link);
  article.append(media, body);
  return article;
}

function renderCards(list){
  const grid = document.getElementById('cardsGrid');
  grid.innerHTML = '';
  list.slice(0,4).forEach(i => grid.appendChild(createCard(i)));
}

// Menu simples (abrir/fechar)
function setupMenu(){
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('menu');
  if(!btn || !menu) return;

  const close = (e)=>{
    if(!menu.contains(e.target) && e.target !== btn){
      menu.classList.remove('open');
      document.removeEventListener('click', close);
    }
  };

  btn.addEventListener('click', (e)=>{
    e.stopPropagation();
    menu.classList.toggle('open');
    if(menu.classList.contains('open')){
      setTimeout(()=>document.addEventListener('click', close), 0);
    }
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  const state = getUserState();
  renderGreeting(state);

  const receitas = getReceitasPorHumor(state.humor);
  renderCards(receitas);

  setupMenu();
  // Navegação já está nos hrefs:
  //  - Landing: ../../index.html (logo)
  //  - Humor: ../humor/index.html
  //  - Gerar: ../gerar/index.html (placeholder)
  //  - Geladeira: ../geladeira/index.html (placeholder)
  //  - Minhas Receitas: ../minhas-receitas/index.html (placeholder)
});
