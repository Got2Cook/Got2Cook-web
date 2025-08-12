// ====== Área porta ↔ interior (toggle MESMO lugar) ======
const wrap  = document.getElementById('geladeiraWrap');
const porta = document.getElementById('portaImagem');
porta.addEventListener('click', () => wrap.classList.toggle('is-open'));

// ====== Ingredientes (usa a mesma chave que você já tinha) ======
const LS_ITENS = 'geladeira'; // mantendo compatibilidade com seu projeto
let ingredientes = JSON.parse(localStorage.getItem(LS_ITENS) || '[]');

// normaliza qualquer item salvo como string (retrocompat)
ingredientes = ingredientes.map(it => {
  if (typeof it === 'string') {
    const nome = it.split('/').pop().split('.')[0];
    return { nome: nome.toLowerCase(), url: it };
  }
  return it;
});
localStorage.setItem(LS_ITENS, JSON.stringify(ingredientes));

// ====== DOM refs ======
const campoBusca   = document.getElementById('campoBusca');
const conteudo     = document.getElementById('conteudoGeladeira');

// Modal (dialog)
const modal        = document.getElementById('modalGaleria');
const backdrop     = document.getElementById('modalBackdrop');
const fecharModal  = document.getElementById('fecharModal');
const concluir     = document.getElementById('concluirSelecao');
const addManualBtn = document.getElementById('adicionarManual');
const galeriaEl    = document.getElementById('galeriaIngredientes');

// Botão “+ Adicionar ingrediente” (aquele dentro do interior tem onClick, mas deixo a função global)
window.abrirPopup = abrirPopup;
window.fecharPopup = closeModal;

// ====== Catálogo da galeria (ajuste nomes se quiser) ======
const catalogo = [
  { id: 'tomate',  nome: 'Tomate',  img: '../../assets/tomate.png' },
  { id: 'alface',  nome: 'Alface',  img: '../../assets/alface.png' },
  { id: 'chocolate', nome: 'Chocolate', img: '../../assets/chocolate.png' },
  { id: 'ovo',     nome: 'Ovo',     img: '../../assets/ovo.png' },
  { id: 'cenoura', nome: 'Cenoura', img: '../../assets/cenoura.png' },
  { id: 'banana',  nome: 'Banana',  img: '../../assets/banana.png' },
  { id: 'maca',    nome: 'Maçã',    img: '../../assets/maca.png' },
  { id: 'limao',   nome: 'Limão',   img: '../../assets/limao.png' },
  { id: 'carne',   nome: 'Carne',   img: '../../assets/carne.png' },
  { id: 'leite',   nome: 'Leite',   img: '../../assets/leite.png' },
  { id: 'arroz',   nome: 'Arroz',   img: '../../assets/arroz.png' },
  { id: 'pao',     nome: 'Pão',     img: '../../assets/pao.png' }
];

// ====== Util ======
function normalizarTexto(t) {
  return (t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}
function salvar() {
  localStorage.setItem(LS_ITENS, JSON.stringify(ingredientes));
}

// ====== Render itens na geladeira ======
function renderIngredientes(filtro = '') {
  conteudo.innerHTML = '';
  const f = normalizarTexto(filtro);

  ingredientes
    .filter(it => normalizarTexto(it.nome).includes(f))
    .forEach((item, index) => {
      const wrap = document.createElement('div');
      wrap.className = 'ingrediente-wrapper';

      const img = document.createElement('img');
      img.src = item.url;
      img.alt = item.nome;
      img.onerror = () => { img.style.display = 'none'; };

      const btn = document.createElement('button');
      btn.className = 'btn-remover';
      btn.textContent = '❌';
      btn.onclick = (e) => {
        e.stopPropagation();
        ingredientes.splice(index, 1);
        salvar();
        renderIngredientes(campoBusca.value);
        // também desmarca na galeria
        marcarSelecionadosGaleria();
      };

      // long-press remove
      let timer = null;
      const start = () => { timer = setTimeout(() => btn.click(), 650); };
      const cancel = () => clearTimeout(timer);
      wrap.addEventListener('mousedown', start);
      wrap.addEventListener('touchstart', start, { passive: true });
      ['mouseup', 'mouseleave', 'touchend', 'touchcancel'].forEach(ev => wrap.addEventListener(ev, cancel));

      wrap.appendChild(img);
      wrap.appendChild(btn);
      conteudo.appendChild(wrap);
    });

  // (opcional) poderia ter um botão extra de adicionar aqui, mas você já tem o de cima
}

campoBusca.addEventListener('input', () => renderIngredientes(campoBusca.value));

// ====== Modal da galeria ======
function abrirPopup() {
  backdrop.hidden = false;
  if (typeof modal.showModal === 'function') modal.showModal();
  else modal.setAttribute('open', '');
  // foco inicial
  setTimeout(() => {
    const f = galeriaEl.querySelector('button, img, [tabindex]');
    if (f) f.focus();
  }, 0);
  document.addEventListener('keydown', trapKeys);
}
function closeModal() {
  document.removeEventListener('keydown', trapKeys);
  backdrop.hidden = true;
  if (typeof modal.close === 'function') modal.close();
  else modal.removeAttribute('open');
}

fecharModal.addEventListener('click', closeModal);
backdrop.addEventListener('click', closeModal);
concluir.addEventListener('click', closeModal);

function trapKeys(e) {
  if (e.key === 'Escape') { e.preventDefault(); closeModal(); }
  if (e.key === 'Tab') {
    const focusables = modal.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    const f = Array.from(focusables).filter(el => !el.disabled && el.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
}

// monta a galeria
function renderGaleria() {
  galeriaEl.innerHTML = '';
  catalogo.forEach(item => {
    const el = document.createElement('img');
    el.src = item.img;
    el.alt = item.nome;
    el.tabIndex = 0;

    const toggle = () => toggleSelecionado(item);

    el.addEventListener('click', toggle);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });

    galeriaEl.appendChild(el);
  });
  marcarSelecionadosGaleria();
}

function marcarSelecionadosGaleria() {
  const ids = new Set(ingredientes.map(i => i.id || normalizarTexto(i.nome)));
  Array.from(galeriaEl.children).forEach((el, idx) => {
    const cat = catalogo[idx];
    const catId = cat.id || normalizarTexto(cat.nome);
    if (ids.has(catId)) el.classList.add('selecionado');
    else el.classList.remove('selecionado');
  });
}

function toggleSelecionado(catItem) {
  const id = catItem.id || normalizarTexto(catItem.nome);
  const existeIdx = ingredientes.findIndex(i => (i.id || normalizarTexto(i.nome)) === id);

  if (existeIdx >= 0) {
    ingredientes.splice(existeIdx, 1);
  } else {
    ingredientes.push({
      id,
      nome: catItem.nome,
      url: catItem.img,   // usa a imagem do catálogo no assets
    });
  }
  salvar();
  renderIngredientes(campoBusca.value);
  marcarSelecionadosGaleria();
}

// “Outro ingrediente?”
addManualBtn.addEventListener('click', () => {
  const nome = prompt('Digite o nome do ingrediente:');
  const url  = prompt('Cole o caminho/arquivo da imagem (PNG/SVG):');
  if (nome && url) {
    const id = normalizarTexto(nome).replace(/\s+/g, '-').slice(0, 40) || `item-${Date.now()}`;
    ingredientes.push({ id, nome, url });
    salvar();
    renderIngredientes(campoBusca.value);
    marcarSelecionadosGaleria();
  }
});

// ====== Inicialização ======
renderIngredientes();
renderGaleria();
