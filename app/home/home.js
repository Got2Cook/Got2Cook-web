// home.js — usando imagens reais dos cards

function safeParse(v) {
  if (typeof v !== 'string') return v;
  try { return JSON.parse(v); } catch { return v; }
}

function getUserState() {
  const nome = localStorage.getItem('got2cook_nome') || '';
  const humorRaw = localStorage.getItem('got2cook_humor');
  const parsed = safeParse(humorRaw);

  let humor = { emoji: '', label: '' };
  if (typeof parsed === 'string') {
    humor.emoji = parsed;
  } else if (parsed && typeof parsed === 'object') {
    humor.emoji = parsed.emoji || '';
    humor.label = parsed.label || '';
  }
  return { nome, humor };
}

// Mock de receitas com imagens reais
function getReceitasPorHumor(humor) {
  const e = humor?.emoji || '🍽️';
  const tag = humor?.label || 'Hoje';
  return [
    { id: 'r1', titulo: `${tag} — Bowl Saudável`, tempo: '20 min', emoji: e, img: '../../assets/receita1.png', imgAlt: 'Bowl saudável' },
    { id: 'r2', titulo: `${tag} — Massa Cremosa`, tempo: '25 min', emoji: e, img: '../../assets/receita2.png', imgAlt: 'Massa cremosa' },
    { id: 'r3', titulo: `${tag} — Wrap Rápido`, tempo: '15 min', emoji: e, img: '../../assets/receita3.png', imgAlt: 'Wrap rápido' },
    { id: 'r4', titulo: `${tag} — Doce Prático`, tempo: '10 min', emoji: e, img: '../../assets/receita4.png', imgAlt: 'Sobremesa prática' }
  ];
}

function renderGreeting(state) {
  const nomeEl = document.getElementById('usuarioNome');
  const emojiEl = document.getElementById('usuarioEmoji');

  nomeEl.textContent = state.nome ? ` ${state.nome}` : '';
  emojiEl.textContent = state.humor?.emoji || '';
  if (!emojiEl.textContent) emojiEl.setAttribute('aria-hidden', 'true');
}

function createCard(item) {
  const article = document.createElement('article');
  article.className = 'card';
  article.setAttribute('role', 'listitem');

  const media = document.createElement('div');
  media.className = 'card__media';

  const img = document.createElement('img');
  img.src = item.img;
  img.alt = item.imgAlt || 'Imagem da receita';
  img.style.width = '100%';
  img.style.height = '100%';
  img.style.objectFit = 'cover';
  media.appendChild(img);

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
  link.href = '../minhas-receitas/index.html';
  link.setAttribute('aria-label', 'Ver mais sugestões');
  link.innerHTML = 'Ver mais <span aria-hidden="true">›</span>';

  body.append(h3, meta, link);
  article.append(media, body);
  return article;
}

function renderCards(list) {
  const grid = document.getElementById('cardsGrid');
  grid.innerHTML = '';
  list.slice(0, 4).forEach(i => grid.appendChild(createCard(i)));
}

function setupMenu() {
  const btn = document.getElementById('menuBtn');
  const menu = document.getElementById('menu');
  if (!btn || !menu) return;

  const close = (e) => {
    if (!menu.contains(e.target) && e.target !== btn) {
      menu.classList.remove('open');
      document.removeEventListener('click', close);
    }
  };

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    menu.classList.toggle('open');
    if (menu.classList.contains('open')) {
      setTimeout(() => document.addEventListener('click', close), 0);
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const state = getUserState();
  renderGreeting(state);

  const receitas = getReceitasPorHumor(state.humor);
  renderCards(receitas);

  setupMenu();
});
