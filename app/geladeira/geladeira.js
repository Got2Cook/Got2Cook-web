// ===== Porta ↔ Interior (mesmo lugar; sem botão expandir) =====
const wrap  = document.getElementById('geladeiraWrap');
const porta = document.getElementById('portaImagem');
porta.addEventListener('click', () => wrap.classList.toggle('is-open'));

// ===== Storage (mantendo sua chave antiga para compatibilidade) =====
const LS_ITENS = 'geladeira';
let ingredientes = JSON.parse(localStorage.getItem(LS_ITENS) || '[]');
ingredientes = ingredientes.map(it => typeof it === 'string'
  ? { nome: it.split('/').pop().split('.')[0].toLowerCase(), url: it }
  : it
);
salvar();

function salvar(){ localStorage.setItem(LS_ITENS, JSON.stringify(ingredientes)); }
function normalizar(t){ return (t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(); }

// ===== DOM =====
const campoBusca   = document.getElementById('campoBusca');
const conteudo     = document.getElementById('conteudoGeladeira');
const modal        = document.getElementById('modalGaleria');
const backdrop     = document.getElementById('modalBackdrop');
const fecharModal  = document.getElementById('fecharModal');
const concluir     = document.getElementById('concluirSelecao');
const addManualBtn = document.getElementById('adicionarManual');
const galeriaEl    = document.getElementById('galeriaIngredientes');

// Catálogo (ajuste os nomes/arquivos conforme /assets)
const catalogo = [
  { id:'tomate',  nome:'Tomate',  img:'../../assets/tomate.png' },
  { id:'alface',  nome:'Alface',  img:'../../assets/alface.png' },
  { id:'chocolate', nome:'Chocolate', img:'../../assets/chocolate.png' },
  { id:'ovo',     nome:'Ovo',     img:'../../assets/ovo.png' },
  { id:'cenoura', nome:'Cenoura', img:'../../assets/cenoura.png' },
  { id:'banana',  nome:'Banana',  img:'../../assets/banana.png' },
  { id:'maca',    nome:'Maçã',    img:'../../assets/maca.png' },
  { id:'limao',   nome:'Limão',   img:'../../assets/limao.png' },
  { id:'carne',   nome:'Carne',   img:'../../assets/carne.png' },
  { id:'leite',   nome:'Leite',   img:'../../assets/leite.png' },
  { id:'arroz',   nome:'Arroz',   img:'../../assets/arroz.png' },
  { id:'pao',     nome:'Pão',     img:'../../assets/pao.png' }
];

// ===== Renderiza a grade (2 colunas, linhas automáticas) =====
function renderIngredientes(filtro = '') {
  if (!conteudo) return;

  // garante a classe da grade
  conteudo.classList.add('conteudo-geladeira');
  conteudo.innerHTML = '';

  const f = normalizar(filtro);
  const lista = ingredientes.filter(i => normalizar(i.nome).includes(f));

  lista.forEach((item, index) => {
    const cell = document.createElement('div');
    cell.className = 'celula';

    const img = document.createElement('img');
    img.src = item.url;
    img.alt = item.nome;
    img.onerror = () => { img.style.display = 'none'; };

    const btn = document.createElement('button');
    btn.className = 'btn-remover';
    btn.textContent = '✕';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      ingredientes.splice(index, 1);
      localStorage.setItem(LS_ITENS, JSON.stringify(ingredientes));
      renderIngredientes(campoBusca?.value || '');
      marcarSelecionadosGaleria && marcarSelecionadosGaleria();
    });

    cell.appendChild(img);
    cell.appendChild(btn);
    conteudo.appendChild(cell);
  });

  // (opcional) mantém número par de células por estética:
  // if (lista.length % 2 === 1) {
  //   const vazio = document.createElement('div');
  //   vazio.className = 'celula';
  //   conteudo.appendChild(vazio);
  // }
}

  // cria uma célula para cada ingrediente
lista.forEach((item, index) => {
  const cell = document.createElement('div');
  cell.className = 'celula';

  const img = document.createElement('img');
  img.src = item.url;
  img.alt = item.nome;
  img.onerror = () => { img.style.display = 'none'; };

  // botão remover
  const btn = document.createElement('button');
  btn.className = 'btn-remover';
  btn.textContent = '✕';
  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    ingredientes.splice(index, 1);
    salvar();
    renderIngredientes(campoBusca.value);
    marcarSelecionadosGaleria();
  });

  cell.appendChild(img);
  cell.appendChild(btn);
  conteudo.appendChild(cell);
});

  // se quiser manter sempre número par de células (estética), descomente:
  // if (lista.length % 2 === 1) {
  //   const vazio = document.createElement('div');
  //   vazio.className = 'celula';
  //   conteudo.appendChild(vazio);
  // }
}

campoBusca.addEventListener('input', () => renderIngredientes(campoBusca.value));

// ===== Modal da galeria (abrir/fechar) =====
function abrirPopup(){
  backdrop.hidden = false;
  if (typeof modal.showModal === 'function') modal.showModal();
  else modal.setAttribute('open','');
  setTimeout(() => {
    const f = galeriaEl.querySelector('img,button,[tabindex]');
    f && f.focus();
  },0);
}
function closeModal(){
  backdrop.hidden = true;
  if (typeof modal.close === 'function') modal.close();
  else modal.removeAttribute('open');
}
window.abrirPopup = abrirPopup; // botão do HTML chama essa
window.fecharPopup = closeModal;

fecharModal.addEventListener('click', closeModal);
backdrop.addEventListener('click', closeModal);
concluir.addEventListener('click', closeModal);

// monta a galeria
function renderGaleria(){
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

function marcarSelecionadosGaleria(){
  const ids = new Set(ingredientes.map(i => i.id || normalizar(i.nome)));
  Array.from(galeriaEl.children).forEach((el, idx) => {
    const cat = catalogo[idx];
    const catId = cat.id || normalizar(cat.nome);
    if (ids.has(catId)) el.classList.add('selecionado'); else el.classList.remove('selecionado');
  });
}

function toggleSelecionado(catItem){
  const id = catItem.id || normalizar(catItem.nome);
  const idx = ingredientes.findIndex(i => (i.id || normalizar(i.nome)) === id);
  if (idx >= 0) ingredientes.splice(idx,1);
  else ingredientes.push({ id, nome: catItem.nome, url: catItem.img });
  salvar();
  renderIngredientes(campoBusca.value);
  marcarSelecionadosGaleria();
}

// “Outro ingrediente?”
addManualBtn.addEventListener('click', () => {
  const nome = prompt('Digite o nome do ingrediente:');
  const url  = prompt('Cole o caminho/arquivo da imagem (PNG/SVG):');
  if (nome && url) {
    const id = normalizar(nome).replace(/\s+/g,'-').slice(0,40) || `item-${Date.now()}`;
    ingredientes.push({ id, nome, url });
    salvar();
    renderIngredientes(campoBusca.value);
    marcarSelecionadosGaleria();
  }
});

// init
renderIngredientes();
renderGaleria();
