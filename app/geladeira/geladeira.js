/* ==============================================
   MINHA GELADEIRA — Got2Cook (JS)
   - Caminhos relativos: ../../assets/...
   - LocalStorage:
       got2cook_geladeira: [{ id, nome, img, quantidade, status }]
       got2cook_ingredientesDisponiveis: catálogo para galeria
       got2cook_portaGeladeiraAberta: true/false
   - Funcional:
       • Porta com persistência
       • Busca
       • Modal acessível (Esc + focus trap)
       • Toggle status (clique) / remover (long-press ou lixeira)
   ============================================== */

const LS = {
  itens: 'got2cook_geladeira',
  catalogo: 'got2cook_ingredientesDisponiveis',
  porta: 'got2cook_portaGeladeiraAberta'
};

const getLS = (k, fb) => {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fb; }
  catch { return fb; }
};
const setLS = (k, v) => localStorage.setItem(k, JSON.stringify(v));

/* Estado */
let geladeira = getLS(LS.itens, []);
let catalogo = getLS(LS.catalogo, []);
let portaAberta = getLS(LS.porta, false) === true;

/* Se não houver catálogo, cria mock padrão (ajuste para suas imagens reais em ../../assets/...) */
if (!Array.isArray(catalogo) || catalogo.length === 0) {
  catalogo = [
    { id: 'tomate', nome: 'Tomate', img: '../../assets/tomate.png' },
    { id: 'alface', nome: 'Alface', img: '../../assets/alface.png' },
    { id: 'chocolate', nome: 'Chocolate', img: '../../assets/chocolate.png' },
    { id: 'ovo', nome: 'Ovo', img: '../../assets/ovo.png' },
    { id: 'cenoura', nome: 'Cenoura', img: '../../assets/cenoura.png' },
    { id: 'banana', nome: 'Banana', img: '../../assets/banana.png' },
    { id: 'maca', nome: 'Maçã', img: '../../assets/maca.png' },
    { id: 'limao', nome: 'Limão', img: '../../assets/limao.png' },
    { id: 'carne', nome: 'Carne', img: '../../assets/carne.png' },
    { id: 'leite', nome: 'Leite', img: '../../assets/leite.png' },
    { id: 'arroz', nome: 'Arroz', img: '../../assets/arroz.png' },
    { id: 'pao', nome: 'Pão', img: '../../assets/pao.png' }
  ];
  setLS(LS.catalogo, catalogo);
}

/* Normalizador p/ busca */
const normalize = (t) =>
  (t || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/* DOM refs */
const portaBtn = document.getElementById('portaBtn');
const interior = document.getElementById('geladeiraAberta');
const conteudoGeladeira = document.getElementById('conteudoGeladeira');
const abrirGaleriaBtn = document.getElementById('abrirGaleria');
const campoBusca = document.getElementById('campoBusca');

const modal = document.getElementById('modalGaleria');
const backdrop = document.getElementById('modalBackdrop');
const fecharModalBtn = document.getElementById('fecharModal');
const concluirSelecaoBtn = document.getElementById('concluirSelecao');
const adicionarManualBtn = document.getElementById('adicionarManual');
const galeria = document.getElementById('galeriaIngredientes');

const announcer = document.getElementById('ariaAnnouncer');

/* ===== Porta com persistência ===== */
function applyDoorUI() {
  if (portaAberta) {
    portaBtn.classList.add('porta--aberta');
    portaBtn.setAttribute('aria-expanded', 'true');
    interior.hidden = false;
    portaBtn.querySelector('img').style.opacity = '0.9';
  } else {
    portaBtn.classList.remove('porta--aberta');
    portaBtn.setAttribute('aria-expanded', 'false');
    interior.hidden = true;
    portaBtn.querySelector('img').style.opacity = '1';
  }
}
portaBtn.addEventListener('click', () => {
  portaAberta = !portaAberta;
  setLS(LS.porta, portaAberta);
  applyDoorUI();
  announcer.textContent = portaAberta ? 'Porta aberta.' : 'Porta fechada.';
});

/* ===== Render da geladeira ===== */
function renderGeladeira(filtro = '') {
  conteudoGeladeira.innerHTML = '';

  const ids = new Set(geladeira.map(i => i.id));
  const lista = geladeira.filter(i => normalize(i.nome).includes(normalize(filtro)));

  lista.forEach((item, index) => {
    const wrap = document.createElement('div');
    wrap.className = 'ingrediente-wrapper';
    wrap.setAttribute('data-id', item.id);

    const img = document.createElement('img');
    img.src = item.img || '';
    img.alt = item.nome || 'Ingrediente';
    img.onerror = () => { img.style.display = 'none'; };

    const btn = document.createElement('button');
    btn.className = 'btn-remover';
    btn.setAttribute('aria-label', `Remover ${item.nome}`);
    btn.textContent = '❌';

    // clique curto: alterna status
    wrap.addEventListener('click', (e) => {
      if (e.target === btn) return;
      toggleStatus(item.id);
    });

    // botão lixeira remove
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      remover(item.id);
    });

    // long-press também remove
    let timer = null;
    const start = () => { timer = setTimeout(() => remover(item.id), 650); };
    const cancel = () => { clearTimeout(timer); };
    wrap.addEventListener('mousedown', start);
    wrap.addEventListener('touchstart', start);
    ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(ev => wrap.addEventListener(ev, cancel));

    wrap.appendChild(img);
    wrap.appendChild(btn);
    conteudoGeladeira.appendChild(wrap);
  });

  // Botão de adicionar dentro da geladeira
  const add = document.createElement('button');
  add.className = 'manual';
  add.textContent = '+ Adicionar ingrediente';
  add.addEventListener('click', openModal);
  conteudoGeladeira.appendChild(add);
}

function toggleStatus(id) {
  geladeira = geladeira.map(i => i.id === id ? { ...i, status: i.status === 'ok' ? 'acabou' : 'ok' } : i);
  setLS(LS.itens, geladeira);
  renderGeladeira(campoBusca.value);
  const n = (geladeira.find(i => i.id === id) || {}).nome || 'Ingrediente';
  announcer.textContent = `Status alterado: ${n}.`;
}
function remover(id) {
  const item = geladeira.find(i => i.id === id);
  geladeira = geladeira.filter(i => i.id !== id);
  setLS(LS.itens, geladeira);
  renderGeladeira(campoBusca.value);
  // desmarca na galeria
  marcarSelecionadosGaleria();
  announcer.textContent = item ? `${item.nome} removido.` : 'Ingrediente removido.';
}

/* ===== Modal ===== */
function openModal() {
  backdrop.hidden = false;
  if (typeof modal.showModal === 'function') modal.showModal();
  else modal.setAttribute('open', '');
  // foco inicial
  setTimeout(() => {
    const f = galeria.querySelector('img,button,[tabindex]');
    if (f) f.focus();
  }, 0);
  document.addEventListener('keydown', trapKeys);
}
function closeModal() {
  document.removeEventListener('keydown', trapKeys);
  backdrop.hidden = true;
  if (typeof modal.close === 'function') modal.close();
  else modal.removeAttribute('open');
  abrirGaleriaBtn.focus();
}
function trapKeys(e) {
  if (e.key === 'Escape') { e.preventDefault(); closeModal(); return; }
  if (e.key === 'Tab') {
    const focusables = modal.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    const f = Array.from(focusables).filter(el => !el.disabled && el.offsetParent !== null);
    if (f.length === 0) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
}
abrirGaleriaBtn.addEventListener('click', openModal);
fecharModalBtn.addEventListener('click', closeModal);
backdrop.addEventListener('click', closeModal);
concluirSelecaoBtn.addEventListener('click', closeModal);

/* Render galeria (com seleção) */
function renderGaleria() {
  galeria.innerHTML = '';
  catalogo.forEach(item => {
    const img = document.createElement('img');
    img.src = item.img || '';
    img.alt = item.nome || 'Ingrediente';
    img.tabIndex = 0;

    const toggle = () => toggleSelectCatalog(item);
    img.addEventListener('click', toggle);
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });

    galeria.appendChild(img);
  });
  marcarSelecionadosGaleria();
}
function marcarSelecionadosGaleria() {
  const ids = new Set(geladeira.map(i => i.id));
  Array.from(galeria.children).forEach((el, idx) => {
    const cat = catalogo[idx];
    if (!cat) return;
    if (ids.has(cat.id)) el.classList.add('selecionado');
    else el.classList.remove('selecionado');
  });
}
function toggleSelectCatalog(item) {
  const existe = geladeira.some(i => i.id === item.id);
  if (existe) {
    geladeira = geladeira.filter(i => i.id !== item.id);
    announcer.textContent = `${item.nome} removido.`;
  } else {
    geladeira.push({ id: item.id, nome: item.nome, img: item.img, quantidade: 1, status: 'ok' });
    announcer.textContent = `${item.nome} adicionado.`;
  }
  setLS(LS.itens, geladeira);
  renderGeladeira(campoBusca.value);
  marcarSelecionadosGaleria();
}

/* Adição manual rápida (placeholder simples) */
adicionarManualBtn.addEventListener('click', () => {
  const nome = prompt('Digite o nome do ingrediente:');
  const url = prompt('Cole o caminho/arquivo da imagem (PNG/SVG):');
  if (nome && url) {
    const id = normalize(nome).replace(/\s+/g, '-').slice(0, 40) || `item-${Date.now()}`;
    geladeira.push({ id, nome, img: url, quantidade: 1, status: 'ok' });
    setLS(LS.itens, geladeira);
    renderGeladeira(campoBusca.value);
    marcarSelecionadosGaleria();
    announcer.textContent = `${nome} adicionado.`;
  }
});

/* Busca */
campoBusca.addEventListener('input', () => renderGeladeira(campoBusca.value));

/* ===== Inicialização ===== */
function init() {
  applyDoorUI();
  renderGeladeira('');
  renderGaleria();
}
document.addEventListener('DOMContentLoaded', init);
