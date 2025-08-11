// home.js — Lógica da HOME (sem cores; apenas manipulação de dados/DOM)

// Util: tenta parsear JSON; se falhar, retorna string original
function tryJsonParse(value) {
  if (typeof value !== 'string') return value;
  try { return JSON.parse(value); } catch { return value; }
}

// Lê dados do localStorage (nome/emoji/humor)
// Esperados (se existirem):
// - got2cook_nome: "Vitória"
// - got2cook_humor: pode ser "😊" OU objeto { emoji:"😊", label:"Feliz" }
// - historicoHumor: array de registros (opcional)
function getUserState() {
  const nome = localStorage.getItem('got2cook_nome') || '';
  const humorRaw = localStorage.getItem('got2cook_humor');
  const humorParsed = tryJsonParse(humorRaw);

  // Normaliza para { emoji, label }
  let humor = { emoji: '', label: '' };
  if (!humorRaw) {
    humor = { emoji: '', label: '' };
  } else if (typeof humorParsed === 'string') {
    // Se for apenas o emoji
    humor = { emoji: humorParsed, label: '' };
  } else if (humorParsed && typeof humorParsed === 'object') {
    humor = {
      emoji: humorParsed.emoji || '',
      label: humorParsed.label || ''
    };
  }

  return { nome, humor };
}

// (Opcional) Mock de receitas por humor para os 4 cards
function getReceitasPorHumor(humor) {
  const e = humor?.emoji || '🍽️';
  const tag = humor?.label || 'Hoje';

  // Retorna 4 itens mock com pequenos ajustes no título
  return [
    {
      id: 'r1',
      titulo: `${tag} — Bowl Saudável`,
      tempo: '20 min',
      emoji: e,
      // Trocar por imagem quando houver
      imgAlt: 'Imagem ilustrativa de bowl saudável'
    },
    {
      id: 'r2',
      titulo: `${tag} — Massa Cremosa`,
      tempo: '25 min',
      emoji: e,
      imgAlt: 'Imagem ilustrativa de massa cremosa'
    },
    {
      id: 'r3',
      titulo: `${tag} — Wrap Rápido`,
      tempo: '15 min',
      emoji: e,
      imgAlt: 'Imagem ilustrativa de wrap'
    },
    {
      id: 'r4',
      titulo: `${tag} — Doce Prático`,
      tempo: '10 min',
      emoji: e,
      imgAlt: 'Imagem ilustrativa de sobremesa fácil'
    }
  ];
}

// Renderiza saudação
function renderGreeting({ nome, humor }) {
  const nomeEl = document.getElementById('usuarioNome');
  const emojiEl = document.getElementById('usuarioEmoji');

  // Nome (se houver) aparece entre “Olá,” e o emoji
  nomeEl.textContent = nome ? ` ${nome}` : '';

  // Emoji do humor (se houver)
  emojiEl.textContent = humor?.emoji || '';
  if (!emojiEl.textContent) {
    // Se não houver humor salvo, mantém espaço limpo
    emojiEl.setAttribute('aria-hidden', 'true');
  }
}

// Cria DOM de um card de receita
function createCard(item) {
  const article = document.createElement('article');
  article.className = 'card';
  article.setAttribute('role', 'listitem');

  const media = document.createElement('div');
  media.className = 'card__media';
  media.setAttribute('role', 'img');
  media.setAttribute('aria-label', item.imgAlt || 'Imagem da receita');
  // Placeholder visual (pode substituir por <img> quando enviar PNG/SVG)
  media.textContent = '🍽️';

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
  link.setAttribute('aria-label', 'Ver mais sugestões');
  link.innerHTML = 'Ver mais <span aria-hidden="true">›</span>';

  body.append(h3, meta, link);
  article.append(media, body);
  return article;
}

// Renderiza os 4 cards na grade
function renderCards(list) {
  const grid = document.getElementById('cardsGrid');
  grid.innerHTML = '';
  list.slice(0, 4).forEach(item => grid.appendChild(createCard(item)));
}

// (Opcional) Exemplifica como gravar um histórico de humor (desativado por padrão)
// function appendHistorico(humor) {
//   const key = 'historicoHumor';
//   const atual = tryJsonParse(localStorage.getItem(key)) || [];
//   const entry = { at: new Date().toISOString(), humor };
//   atual.push(entry);
//   localStorage.setItem(key, JSON.stringify(atual));
// }

document.addEventListener('DOMContentLoaded', () => {
  const state = getUserState();
  renderGreeting(state);

  const receitas = getReceitasPorHumor(state.humor);
  renderCards(receitas);

  // Navegações já estão nos hrefs:
  // - Landing: ../../index.html
  // - Humor: ../humor/index.html
  // - Gerar: ../gerar/index.html (placeholder)
  // - Geladeira: ../geladeira/index.html (placeholder)
  // - Minhas Receitas (cards/ver mais): ../minhas-receitas/index.html (placeholder)
});
