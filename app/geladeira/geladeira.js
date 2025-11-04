// /app/geladeira/geladeira.js

// ===== CONFIGURAÇÃO =====
const LS_ITENS = 'got2cook_geladeira';
const LS_ITENS_LEGACY = 'geladeira';
const BASE = '/assets/ingredientes'; // ✓ CORRIGIDO: caminho correto conforme seu código

// Migração automática
if (!localStorage.getItem(LS_ITENS) && localStorage.getItem(LS_ITENS_LEGACY)) {
  localStorage.setItem(LS_ITENS, localStorage.getItem(LS_ITENS_LEGACY));
  console.log('✓ Dados migrados');
}

// ===== ESTADO =====
let ingredientes = JSON.parse(localStorage.getItem(LS_ITENS) || '[]');

ingredientes = ingredientes.map(it => {
  if (typeof it === 'string') {
    const id = it.split('/').pop().split('.')[0].toLowerCase();
    return { id, nome: it.split('/').pop().split('.')[0], url: it };
  }
  return it;
});

salvar();

// ===== HELPERS =====
function salvar() {
  localStorage.setItem(LS_ITENS, JSON.stringify(ingredientes));
}

function normalizar(texto) {
  return (texto || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function anunciar(mensagem) {
  const announcer = document.getElementById('ariaAnnouncer');
  if (announcer) {
    announcer.textContent = mensagem;
    setTimeout(() => { announcer.textContent = ''; }, 1000);
  }
}

// ===== REFERÊNCIAS =====
const wrap = document.getElementById('geladeiraWrap');
const porta = document.getElementById('portaImagem');
const campoBusca = document.getElementById('campoBusca');
const conteudo = document.getElementById('conteudoGeladeira');
const ingredientesCount = document.getElementById('ingredientesCount');

const modal = document.getElementById('modalGaleria');
const backdrop = document.getElementById('modalBackdrop');
const abrirBtn = document.getElementById('abrirIngrediente');
const fecharBtn = document.getElementById('fecharModal');
const adicionarBtn = document.getElementById('adicionarSelecao');

const galeriaEl = document.getElementById('galeriaIngredientes');
const tabsEl = document.getElementById('tabsCategorias');
const buscaModalEl = document.getElementById('buscaModal');

const selecionadosWrap = document.getElementById('selecionadosWrap');
const chipsEl = document.getElementById('chipsSelecionados');
const selecionadosCountEl = document.getElementById('selecionadosCount');
const limparSelBtn = document.getElementById('limparSelecionados');

// ===== PORTA =====
porta.addEventListener('click', () => {
  wrap.classList.toggle('is-open');
  anunciar(wrap.classList.contains('is-open') ? 'Geladeira aberta' : 'Geladeira fechada');
});

// ===== CATÁLOGO =====
const CATEGORIAS = {
  'Legumes e Verduras': [
    ['tomate','Tomate'],['cebola','Cebola'],['alho','Alho'],['batata','Batata'],
    ['batata-doce','Batata-doce'],['cenoura','Cenoura'],['abobora','Abóbora'],
    ['chuchu','Chuchu'],['abobrinha','Abobrinha'],['berinjela','Berinjela'],
    ['beterraba','Beterraba'],['pimentao-vermelho','Pimentão vermelho'],
    ['pimentao-amarelo','Pimentão amarelo'],['pimentao-verde','Pimentão verde'],
    ['pepino','Pepino'],['milho-verde','Milho verde'],['ervilha','Ervilha'],
    ['aipo','Aipo'],['vagem','Vagem'],['brocolis','Brócolis'],['couve-flor','Couve-flor'],
    ['espinafre','Espinafre'],['couve-manteiga','Couve'],['alface','Alface'],
    ['rucula','Rúcula'],['agriao','Agrião'],['almeirao','Almeirão'],['repolho','Repolho'],
    ['cebolinha','Cebolinha'],['salsinha','Salsinha'],['coentro','Coentro'],
    ['manjericao','Manjericão'],['hortela','Hortelã'],['quiabo','Quiabo'],
    ['maxixe','Maxixe'],['jilo','Jiló'],['nabo','Nabo'],['rabanete','Rabanete'],
    ['inhame','Inhame'],['mandioca','Mandioca']
  ],
  'Frutas': [
    ['banana','Banana'],['maca','Maçã'],['pera','Pera'],['laranja','Laranja'],
    ['tangerina','Tangerina'],['limao','Limão'],['abacaxi','Abacaxi'],
    ['melancia','Melancia'],['melao','Melão'],['mamao','Mamão'],['morango','Morango'],
    ['uva','Uva'],['kiwi','Kiwi'],['manga','Manga'],['abacate','Abacate'],
    ['caju','Caju'],['maracuja','Maracujá'],['ameixa','Ameixa'],['cereja','Cereja'],
    ['caqui','Caqui'],['goiaba','Goiaba'],['jabuticaba','Jabuticaba'],
    ['pessego','Pêssego'],['figo','Figo'],['pitaya','Pitaya'],['coco','Coco'],['roma','Romã']
  ],
  'Carnes, Aves e Peixes': [
    ['frango-peito','Frango (peito)'],['frango-coxa','Frango (coxa)'],['carne-moida','Carne moída'],
    ['patinho','Patinho'],['alcatra','Alcatra'],['picanha','Picanha'],['maminha','Maminha'],
    ['lombo-suino','Lombo suíno'],['costelinha','Costelinha suína'],['pernil','Pernil'],
    ['bacon','Bacon'],['linguica-calabresa','Linguiça calabresa'],['salsicha','Salsicha'],
    ['presunto','Presunto'],['mortadela','Mortadela'],
    ['tilapia','Tilápia'],['pescada','Pescada'],['merluza','Merluza'],
    ['salmao','Salmão'],['atum-lata','Atum (lata)'],['sardinha','Sardinha'],
    ['camarao','Camarão'],['lula','Lula'],['marisco','Marisco'],['carne-seca','Carne seca']
  ],
  'Laticínios e Ovos': [
    ['leite-integral','Leite'],['leite-desnatado','Leite desnatado'],
    ['leite-aveia','Leite de aveia'],['leite-amendoa','Leite de amêndoas'],
    ['queijo-mussarela','Queijo muçarela'],['queijo-prato','Queijo prato'],
    ['queijo-minas','Queijo minas'],['parmesao','Parmesão'],['coalho','Queijo coalho'],
    ['cottage','Cottage'],['requeijao','Requeijão'],['cream-cheese','Cream cheese'],
    ['iogurte-natural','Iogurte natural'],['iogurte-grego','Iogurte grego'],
    ['manteiga','Manteiga'],['margarina','Margarina'],
    ['leite-condensado','Leite condensado'],['creme-de-leite','Creme de leite'],
    ['ricota','Ricota'],['ovo','Ovo'],['ovo-codorna','Ovo de codorna']
  ],
  'Grãos, Cereais e Massas': [
    ['arroz-branco','Arroz branco'],['arroz-integral','Arroz integral'],['feijao-carioca','Feijão carioca'],
    ['feijao-preto','Feijão preto'],['lentilha','Lentilha'],['grao-de-bico','Grão-de-bico'],
    ['ervilha-seca','Ervilha seca'],['milho-grao','Milho grão'],['aveia','Aveia em flocos'],
    ['farinha-trigo','Farinha de trigo'],['farinha-rosca','Farinha de rosca'],
    ['farinha-mandioca','Farinha de mandioca'],['fuba','Fubá'],['cuscuz','Cuscuz'],
    ['espaguete','Macarrão espaguete'],['penne','Macarrão penne'],['parafuso','Macarrão parafuso'],
    ['instantaneo','Macarrão instantâneo'],['lasanha','Lasanha'],['nhoque','Nhoque'],
    ['cuscuz-marroquino','Cuscuz marroquino'],['quinoa','Quinoa'],['arroz-7graos','Arroz 7 grãos'],
    ['tapioca','Tapioca'],['wrap','Tortilha / wrap'],['pao-frances','Pão francês'],
    ['pao-forma','Pão de forma'],['pao-integral','Pão integral'],['pao-sirio','Pão sírio'],
    ['massa-pizza','Massa de pizza'],['massa-folhada','Massa folhada']
  ],
  'Temperos e Especiarias': [
    ['sal','Sal'],['pimenta-reino','Pimenta-do-reino'],['paprica-doce','Páprica doce'],
    ['paprica-picante','Páprica picante'],['curcuma','Cúrcuma'],['curry','Curry'],
    ['oregano','Orégano'],['cominho','Cominho'],['louro','Louro'],['noz-moscada','Noz-moscada'],
    ['canela','Canela'],['cravo','Cravo'],['alecrim','Alecrim'],['tomilho','Tomilho'],
    ['chimichurri','Chimichurri'],['alho-po','Alho em pó'],['cebola-po','Cebola em pó'],
    ['molho-pimenta','Molho de pimenta'],['shoyu','Shoyu'],['molho-ingles','Molho inglês'],
    ['barbecue','Barbecue'],['ketchup','Ketchup'],['maionese','Maionese'],['mostarda','Mostarda'],
    ['vinagre','Vinagre'],['azeite','Azeite de oliva'],['oleo-soja','Óleo de soja'],
    ['oleo-girassol','Óleo de girassol']
  ],
  'Enlatados & Conservas': [
    ['milho-lata','Milho (lata)'],['ervilha-lata','Ervilha (lata)'],['molho-tomate','Molho de tomate'],
    ['extrato-tomate','Extrato de tomate'],['tomate-pelado','Tomate pelado'],
    ['palmito','Palmito'],['azeitona-verde','Azeitona verde'],['azeitona-preta','Azeitona preta'],
    ['picles','Picles'],['sardinha-lata','Sardinha (lata)'],['atum-lata2','Atum (lata)'],
    ['feijao-lata','Feijão (lata)'],['grao-bico-lata','Grão-de-bico (lata)'],
    ['cogumelo-conserva','Cogumelo (conserva)']
  ],
  'Doces & Confeitaria': [
    ['acucar','Açúcar'],['acucar-mascavo','Açúcar mascavo'],['mel','Mel'],['melado','Melado'],
    ['chocolate-po','Chocolate em pó'],['cacau-po','Cacau em pó'],['achocolatado','Achocolatado'],
    ['chocolate','Chocolate'],['granulado','Granulado'],['doce-leite','Doce de leite'],
    ['geleia','Geleia'],['goiabada','Goiabada'],['paçoca','Paçoca'],
    ['fermento-quimico','Fermento químico'],['fermento-biologico','Fermento biológico'],
    ['amido-milho','Amido de milho'],['baunilha','Essência de baunilha'],
    ['coco-ralado','Coco ralado'],['uva-passa','Uva-passa'],
    ['castanha-caju','Castanha de caju'],['castanha-para','Castanha-do-pará'],
    ['amendoim','Amendoim'],['nozes','Nozes'],['amendoa','Amêndoas'],['avelã','Avelã']
  ],
  'Bebidas': [
    ['agua','Água'],['agua-gas','Água com gás'],['refrigerante','Refrigerante'],
    ['suco-caixa','Suco de caixinha'],['suco-natural','Suco natural'],['agua-coco','Água de coco'],
    ['cafe','Café'],['cha','Chá'],['cerveja','Cerveja'],['vinho','Vinho'],
    ['energetico','Energético'],['iogurte-bebida','Iogurte para beber']
  ],
  'Congelados & Prontos': [
    ['legumes-congelados','Legumes congelados'],['polpa-fruta','Polpa de fruta'],
    ['sorvete','Sorvete'],['hamburguer','Hambúrguer congelado'],['frango-empanado','Frango empanado'],
    ['peixe-empanado','Peixe empanado'],['batata-frita','Batata frita congelada'],
    ['lasanha-pronta','Lasanha pronta'],['massa-pastel','Massa de pastel'],['pao-queijo','Pão de queijo']
  ],
  'Veg & Plant-based': [
    ['tofu','Tofu'],['proteina-texturizada','Proteína vegetal texturizada'],
    ['seitan','Seitan'],['miso','Miso'],['maionese-vegana','Maionese vegana'],
    ['levedo-cerveja','Levedo de cerveja'],['linhaça','Linhaça'],['chia','Chia'],
    ['gergelim','Gergelim'],['pistache','Pistache'],['sementes-girassol','Sementes de girassol'],
    ['sementes-abobora','Sementes de abóbora']
  ]
};

const catalogIndex = {};
const slugCat = cat => normalizar(cat).replace(/\s|&|\/|,/g,'-');
Object.entries(CATEGORIAS).forEach(([cat, lista]) => {
  lista.forEach(([id, nome]) => {
    catalogIndex[id] = { 
      id, 
      nome, 
      cat, 
      img: `${BASE}/${slugCat(cat)}/${id}.png` // ✓ MANTIDO conforme seu código original
    };
  });
});

// ===== RENDER GELADEIRA =====
function renderIngredientes(filtro = '') {
  const lista = ingredientes.filter(i => normalizar(i.nome).includes(normalizar(filtro)));
  ingredientesCount.textContent = `${lista.length} ${lista.length === 1 ? 'item' : 'itens'}`;

  if (lista.length === 0) {
    conteudo.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🍽️</div>
        <h3 class="empty-state-title">Geladeira vazia</h3>
        <p class="empty-state-text">Adicione ingredientes para começar a criar receitas incríveis!</p>
        <button class="empty-state-cta" onclick="document.getElementById('abrirIngrediente').click()">
          + Adicionar Ingredientes
        </button>
      </div>
    `;
    return;
  }

  conteudo.innerHTML = '';
  conteudo.classList.add('conteudo-geladeira');

  lista.forEach((item, index) => {
    const cell = document.createElement('div');
    cell.className = 'celula';

    const img = document.createElement('img');
    img.src = item.url;
    img.alt = item.nome;
    img.loading = 'lazy';
    img.onerror = () => { img.style.opacity = '0.3'; };

    const btn = document.createElement('button');
    btn.className = 'btn-remover';
    btn.textContent = '✕';
    btn.setAttribute('aria-label', `Remover ${item.nome}`);
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      cell.style.transform = 'scale(0)';
      cell.style.opacity = '0';
      setTimeout(() => {
        ingredientes.splice(index, 1);
        salvar();
        renderIngredientes(campoBusca.value);
        renderSelecionados();
        marcarSelecionadosGaleria();
        anunciar(`${item.nome} removido`);
      }, 200);
    });

    cell.appendChild(img);
    cell.appendChild(btn);
    conteudo.appendChild(cell);
    cell.style.animation = `itemIn 0.3s ease-out ${index * 0.03}s backwards`;
  });
}

campoBusca.addEventListener('input', () => renderIngredientes(campoBusca.value));

// ===== MODAL =====
function abrirPopup() {
  renderSelecionados();
  renderGaleria();
  backdrop.hidden = false;
  modal.hidden = false;
  requestAnimationFrame(() => {
    modal.classList.add('ativo');
    modal.focus();
  });
  anunciar('Galeria aberta');
}

function fecharPopup() {
  modal.classList.remove('ativo');
  setTimeout(() => {
    modal.hidden = true;
    backdrop.hidden = true;
  }, 300);
  anunciar('Galeria fechada');
}

abrirBtn.addEventListener('click', abrirPopup);
fecharBtn.addEventListener('click', fecharPopup);
backdrop.addEventListener('click', fecharPopup);

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('ativo')) {
    fecharPopup();
  }
});

adicionarBtn.addEventListener('click', () => {
  salvar();
  renderIngredientes(campoBusca.value);
  fecharPopup();
  anunciar(`${ingredientes.length} ingredientes na geladeira`);
});

// ===== TABS =====
let currentCategory = Object.keys(CATEGORIAS)[0];

function renderTabs() {
  tabsEl.innerHTML = '';
  Object.keys(CATEGORIAS).forEach((cat) => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.role = 'tab';
    btn.setAttribute('aria-selected', String(cat === currentCategory));
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      currentCategory = cat;
      Array.from(tabsEl.children).forEach(el => el.setAttribute('aria-selected', 'false'));
      btn.setAttribute('aria-selected', 'true');
      buscaModalEl.value = '';
      renderGaleria();
      anunciar(`Categoria ${cat}`);
    });
    tabsEl.appendChild(btn);
  });
}

// ===== GALERIA =====
function renderGaleria() {
  const filtro = normalizar(buscaModalEl.value || '');
  const lista = CATEGORIAS[currentCategory];

  const skeletons = galeriaEl.querySelectorAll('.skeleton-item');
  skeletons.forEach(sk => sk.remove());

  galeriaEl.innerHTML = '';

  const itensFiltrados = lista.filter(([id, nome]) => normalizar(nome).includes(filtro));

  if (itensFiltrados.length === 0) {
    galeriaEl.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--verde);">
        <p style="font-size: 18px;">🔍</p>
        <p style="font-size: 14px; margin-top: 8px;">Nenhum ingrediente encontrado</p>
      </div>
    `;
    return;
  }

  itensFiltrados.forEach(([id, nome], idx) => {
    const data = catalogIndex[id];
    const item = document.createElement('div');
    item.className = 'item';
    item.tabIndex = 0;
    item.dataset.id = id;
    item.style.animationDelay = `${idx * 0.02}s`;

    const img = document.createElement('img');
    img.src = data.img;
    img.alt = nome;
    img.loading = 'lazy';
    img.onerror = () => { img.style.opacity = '0.3'; };

    const label = document.createElement('div');
    label.className = 'nome';
    label.textContent = nome;

    const toggle = () => toggleSelecionado(data);
    item.addEventListener('click', toggle);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggle();
      }
    });

    item.appendChild(img);
    item.appendChild(label);
    galeriaEl.appendChild(item);
  });

  marcarSelecionadosGaleria();
}

buscaModalEl.addEventListener('input', renderGaleria);

function marcarSelecionadosGaleria() {
  const ids = new Set(ingredientes.map(i => i.id || normalizar(i.nome)));
  Array.from(galeriaEl.children).forEach((el) => {
    const id = el.dataset.id;
    if (ids.has(id)) el.classList.add('selecionado');
    else el.classList.remove('selecionado');
  });
}

function toggleSelecionado(catItem) {
  const id = catItem.id;
  const idx = ingredientes.findIndex(i => (i.id || normalizar(i.nome)) === id);

  if (idx >= 0) {
    ingredientes.splice(idx, 1);
    anunciar(`${catItem.nome} removido`);
  } else {
    ingredientes.push({ id, nome: catItem.nome, url: catItem.img });
    anunciar(`${catItem.nome} adicionado`);
  }

  salvar();
  renderIngredientes(campoBusca.value);
  renderSelecionados();
  marcarSelecionadosGaleria();
}

// ===== CHIPS =====
function renderSelecionados() {
  const total = ingredientes.length;
  selecionadosCountEl.innerHTML = `
    <span class="count-badge">${total}</span>
    <span>${total === 1 ? 'selecionado' : 'selecionados'}</span>
  `;
  selecionadosWrap.hidden = total === 0;

  chipsEl.innerHTML = '';
  ingredientes.forEach(item => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.dataset.id = item.id || normalizar(item.nome);

    const img = document.createElement('img');
    img.src = item.url;
    img.alt = '';
    img.loading = 'lazy';
    img.onerror = () => { img.style.display = 'none'; };

    const name = document.createElement('span');
    name.textContent = item.nome;

    const btn = document.createElement('button');
    btn.className = 'chip-x';
    btn.title = 'Remover';
    btn.setAttribute('aria-label', `Remover ${item.nome}`);
    btn.textContent = '×';
    btn.addEventListener('click', () => {
      const id = item.id || normalizar(item.nome);
      const idx = ingredientes.findIndex(i => (i.id || normalizar(i.nome)) === id);
      if (idx >= 0) {
        ingredientes.splice(idx, 1);
        salvar();
        renderIngredientes(campoBusca.value);
        renderSelecionados();
        marcarSelecionadosGaleria();
        anunciar(`${item.nome} removido`);
      }
    });

    chip.appendChild(img);
    chip.appendChild(name);
    chip.appendChild(btn);
    chipsEl.appendChild(chip);
  });
}

limparSelBtn.addEventListener('click', () => {
  if (!ingredientes.length) return;
  if (confirm(`Remover todos os ${ingredientes.length} ingredientes?`)) {
    ingredientes = [];
    salvar();
    renderIngredientes(campoBusca.value);
    renderSelecionados();
    marcarSelecionadosGaleria();
    anunciar('Todos removidos');
  }
});

document.getElementById('adicionarManual').addEventListener('click', () => {
  const nome = prompt('Digite o nome do ingrediente:');
  if (!nome || !nome.trim()) return;
  const nomeClean = nome.trim();
  const url = prompt('Cole o caminho da imagem (opcional):', '/assets/placeholder.png');
  const id = normalizar(nomeClean).replace(/\s+/g, '-').slice(0, 40) || `item-${Date.now()}`;
  ingredientes.push({ id, nome: nomeClean, url: url || '/assets/placeholder.png' });
  salvar();
  renderIngredientes(campoBusca.value);
  renderSelecionados();
  marcarSelecionadosGaleria();
  anunciar(`${nomeClean} adicionado`);
});

// ===== NAVEGAÇÃO =====
document.getElementById('btnVoltar').addEventListener('click', () => {
  window.location.href = '/app/humor/index.html';
});

document.getElementById('btnLogo').addEventListener('click', () => {
  window.location.href = '/app/home/index.html';
});

document.getElementById('btnGeladeira').addEventListener('click', () => {
  window.location.href = '/app/geladeira/index.html';
});

// ===== INIT =====
renderIngredientes();
renderTabs();
renderGaleria();

console.log('🚀 Geladeira OK!');
