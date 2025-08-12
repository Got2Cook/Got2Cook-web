/* ============================================
   MINHA GELADEIRA — Got2Cook (JS)
   - Caminhos relativos respeitados
   - LocalStorage:
       got2cook_geladeira: [{ id, nome, img, quantidade, status }]
       got2cook_ingredientesDisponiveis: catálogo para galeria
       got2cook_portaGeladeiraAberta: true/false
   - A11y: focus trap do modal, Esc para fechar, aria-live
   ============================================ */

/* Utils de LocalStorage */
const LS_KEYS = {
  geladeira: 'got2cook_geladeira',
  catalogo: 'got2cook_ingredientesDisponiveis',
  portaAberta: 'got2cook_portaGeladeiraAberta'
};

const readLS = (k, fallback) => {
  try {
    const v = localStorage.getItem(k);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
};
const writeLS = (k, v) => localStorage.setItem(k, JSON.stringify(v));

/* Estado em memória */
let geladeira = readLS(LS_KEYS.geladeira, []);
let catalogo = readLS(LS_KEYS.catalogo, []);
let portaAberta = readLS(LS_KEYS.portaAberta, false) === true;

/* Mock do catálogo se vazio (pode trocar pelas suas imagens PNG em ../../assets/...) */
if (!Array.isArray(catalogo) || catalogo.length === 0) {
  catalogo = [
    { id: 'tomate', nome: 'Tomate', img: '../../assets/tomate.png' },
    { id: 'alface', nome: 'Alface', img: '../../assets/alface.png' },
    { id: 'queijo', nome: 'Queijo', img: '../../assets/queijo.png' },
    { id: 'ovos', nome: 'Ovos', img: '../../assets/ovos.png' },
    { id: 'leite', nome: 'Leite', img: '../../assets/leite.png' },
    { id: 'manteiga', nome: 'Manteiga', img: '../../assets/manteiga.png' }
  ];
  writeLS(LS_KEYS.catalogo, catalogo);
}

/* Refs do DOM */
const portaBtn = document.getElementById('portaBtn');
const interior = document.getElementById('interior');
const gradeGeladeira = document.getElementById('gradeGeladeira');
const abrirGaleriaBtn = document.getElementById('abrirGaleria');
const modal = document.getElementById('modalGaleria');
const modalBackdrop = document.getElementById('modalBackdrop');
const fecharModalBtn = document.getElementById('fecharModal');
const concluirSelecaoBtn = document.getElementById('concluirSelecao');
const gradeGaleria = document.getElementById('gradeGaleria');
const announcer = document.getElementById('ariaAnnouncer');

/* ======== Porta da geladeira: estado persistente ======== */
function atualizarEstadoPortaUI() {
  if (portaAberta) {
    portaBtn.classList.add('porta--aberta');
    portaBtn.setAttribute('aria-expanded', 'true');
    interior.hidden = false;
  } else {
    portaBtn.classList.remove('porta--aberta');
    portaBtn.setAttribute('aria-expanded', 'false');
    interior.hidden = true;
  }
}

portaBtn.addEventListener('click', () => {
  portaAberta = !portaAberta;
  writeLS(LS_KEYS.portaAberta, portaAberta);
  atualizarEstadoPortaUI();
  announcer.textContent = portaAberta ? 'Porta aberta.' : 'Porta fechada.';
});

/* ======== Renderização dos itens da geladeira ======== */
function renderGeladeira() {
  gradeGeladeira.innerHTML = '';

  if (!Array.isArray(geladeira)) geladeira = [];
  geladeira.forEach(item => {
    const li = document.createElement('li');
    li.className = 'card' + (item.status === 'acabou' ? ' acabou' : '');
    li.setAttribute('data-id', item.id);

    /* Thumb */
    const thumb = document.createElement('div');
    thumb.className = 'card__thumb';
    const img = document.createElement('img');
    img.src = item.img || '';
    img.alt = item.nome || 'Ingrediente';
    img.onerror = () => { img.style.display = 'none'; }; // fallback visual neutro
    thumb.appendChild(img);

    /* Nome */
    const nome = document.createElement('div');
    nome.className = 'card__nome';
    nome.textContent = item.nome || 'Ingrediente';

    /* Ações: status e remover */
    const acoes = document.createElement('div');
    acoes.className = 'card__acoes';

    const badge = document.createElement('span');
    badge.className = 'badge';
    badge.textContent = item.status === 'acabou' ? '❌ acabou' : '✅ ok';
    badge.title = 'Alternar status (ok/acabou)';

    const btnTrash = document.createElement('button');
    btnTrash.className = 'btn-trash';
    btnTrash.type = 'button';
    btnTrash.setAttribute('aria-label', `Remover ${item.nome}`);
    btnTrash.textContent = '🗑';

    acoes.appendChild(badge);
    acoes.appendChild(btnTrash);

    /* Monta o card */
    li.appendChild(thumb);
    li.appendChild(nome);
    li.appendChild(acoes);

    /* Interações:
       - Clique rápido no card: alterna status
       - Long-press: remove
       - Botão lixeira: remove
    */
    // Alternar status no clique
    li.addEventListener('click', (ev) => {
      // evita conflito se clicou na lixeira
      if (ev.target === btnTrash) return;
      alternarStatus(item.id);
    });

    // Botão lixeira
    btnTrash.addEventListener('click', (ev) => {
      ev.stopPropagation();
      removerItem(item.id);
    });

    // Long-press (touch ou mouse)
    let pressTimer = null;
    const startPress = () => {
      clearTimeout(pressTimer);
      pressTimer = setTimeout(() => removerItem(item.id), 650);
    };
    const cancelPress = () => clearTimeout(pressTimer);

    li.addEventListener('mousedown', startPress);
    li.addEventListener('touchstart', startPress);
    ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(evt =>
      li.addEventListener(evt, cancelPress)
    );

    gradeGeladeira.appendChild(li);
  });
}

function alternarStatus(id) {
  geladeira = geladeira.map(it => it.id === id ? { ...it, status: it.status === 'ok' ? 'acabou' : 'ok' } : it);
  writeLS(LS_KEYS.geladeira, geladeira);
  renderGeladeira();
  const nome = (geladeira.find(i => i.id === id) || {}).nome || 'Ingrediente';
  announcer.textContent = `Status alterado: ${nome}.`;
}

function removerItem(id) {
  const item = geladeira.find(i => i.id === id);
  geladeira = geladeira.filter(i => i.id !== id);
  writeLS(LS_KEYS.geladeira, geladeira);
  renderGeladeira();
  // Atualiza seleção na galeria
  marcarSelecionadosNaGaleria();
  announcer.textContent = item ? `${item.nome} removido.` : 'Ingrediente removido.';
}

/* ======== Modal da galeria (adicionar itens) ======== */
function abrirModal() {
  modalBackdrop.hidden = false;
  if (typeof modal.showModal === 'function') modal.showModal();
  else modal.setAttribute('open', ''); // fallback
  // focus trap
  setTimeout(() => {
    const focoInicial = modal.querySelector('.grade .card, .modal__close') || fecharModalBtn;
    if (focoInicial) focoInicial.focus();
  }, 0);
  document.addEventListener('keydown', onKeydownModal);
}

function fecharModal() {
  document.removeEventListener('keydown', onKeydownModal);
  modalBackdrop.hidden = true;
  if (typeof modal.close === 'function') modal.close();
  else modal.removeAttribute('open');
  abrirGaleriaBtn.focus();
}

function onKeydownModal(e) {
  if (e.key === 'Escape') {
    e.preventDefault();
    fecharModal();
    return;
  }
  if (e.key === 'Tab') {
    // Focus trap básico
    const focusables = modal.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    const f = Array.from(focusables).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
    if (f.length === 0) return;
    const first = f[0];
    const last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

/* Render galeria */
function renderGaleria() {
  gradeGaleria.innerHTML = '';
  catalogo.forEach(item => {
    const li = document.createElement('li');
    li.className = 'card';
    li.setAttribute('data-id', item.id);
    li.tabIndex = 0; // acessível

    const thumb = document.createElement('div');
    thumb.className = 'card__thumb';
    const img = document.createElement('img');
    img.src = item.img || '';
    img.alt = item.nome || 'Ingrediente';
    img.onerror = () => { img.style.display = 'none'; };
    thumb.appendChild(img);

    const nome = document.createElement('div');
    nome.className = 'card__nome';
    nome.textContent = item.nome || 'Ingrediente';

    li.appendChild(thumb);
    li.appendChild(nome);

    // Toggle seleção ao clicar/Enter/Espaço
    const toggle = () => toggleSelecionadoNaGaleria(item);
    li.addEventListener('click', toggle);
    li.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });

    gradeGaleria.appendChild(li);
  });
  marcarSelecionadosNaGaleria();
}

function marcarSelecionadosNaGaleria() {
  const idsNaGeladeira = new Set(geladeira.map(i => i.id));
  gradeGaleria.querySelectorAll('.card').forEach(card => {
    const id = card.getAttribute('data-id');
    if (idsNaGeladeira.has(id)) card.classList.add('card--selecionado');
    else card.classList.remove('card--selecionado');
  });
}

function toggleSelecionadoNaGaleria(item) {
  const existe = geladeira.some(i => i.id === item.id);
  if (existe) {
    geladeira = geladeira.filter(i => i.id !== item.id);
    announcer.textContent = `${item.nome} removido da seleção.`;
  } else {
    geladeira.push({
      id: item.id,
      nome: item.nome,
      img: item.img,
      quantidade: 1,
      status: 'ok'
    });
    announcer.textContent = `${item.nome} adicionado.`;
  }
  writeLS(LS_KEYS.geladeira, geladeira);
  renderGeladeira();
  marcarSelecionadosNaGaleria();
}

/* Eventos de abrir/fechar modal */
abrirGaleriaBtn.addEventListener('click', abrirModal);
fecharModalBtn.addEventListener('click', fecharModal);
modalBackdrop.addEventListener('click', fecharModal);
concluirSelecaoBtn.addEventListener('click', fecharModal);

/* ======== Inicialização ======== */
function init() {
  atualizarEstadoPortaUI();
  renderGeladeira();
  renderGaleria();
}
document.addEventListener('DOMContentLoaded', init);
