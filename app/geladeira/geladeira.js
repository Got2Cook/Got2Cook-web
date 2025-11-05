// /app/geladeira/geladeira.js

// ===== CONFIGURAÇÃO =====
const LS_ITENS = 'got2cook_geladeira';
const LS_ITENS_LEGACY = 'geladeira';
const BASE = '/assets/ingredientes';

// Migração automática
if (!localStorage.getItem(LS_ITENS) && localStorage.getItem(LS_ITENS_LEGACY)) {
  localStorage.setItem(LS_ITENS, localStorage.getItem(LS_ITENS_LEGACY));
  console.log('✓ Dados migrados de "geladeira" para "got2cook_geladeira"');
}

// ===== ESTADO GLOBAL =====
let ingredientes = JSON.parse(localStorage.getItem(LS_ITENS) || '[]');

// Normalizar dados legados (strings puras → objetos)
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
  console.log(`💾 ${ingredientes.length} ingredientes salvos no localStorage`);
}

function normalizar(texto) {
  return (texto || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function anunciar(mensagem) {
  const announcer = document.getElementById('ariaAnnouncer');
  if (announcer) {
    announcer.textContent = mensagem;
    setTimeout(() => { announcer.textContent = ''; }, 1000);
  }
}

function mostrarToast(mensagem, icone = '✓') {
  const toast = document.getElementById('toast');
  const toastIcon = document.getElementById('toastIcon');
  const toastMessage = document.getElementById('toastMessage');
  
  toastIcon.textContent = icone;
  toastMessage.textContent = mensagem;
  toast.hidden = false;
  
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.hidden = true;
    }, 300);
  }, 2500);
}

// ===== REFERÊNCIAS DO DOM =====
const wrap = document.getElementById('geladeiraWrap');
const frame = document.querySelector('.geladeira-frame');
const campoBusca = document.getElementById('campoBusca');
const conteudo = document.getElementById('conteudoGeladeira');
const ingredientesCount = document.getElementById('ingredientesCount');

// Modal
const modal = document.getElementById('modalGaleria');
const backdrop = document.getElementById('modalBackdrop');
const abrirBtn = document.getElementById('abrirIngrediente');
const fecharBtn = document.getElementById('fecharModal');
const adicionarBtn = document.getElementById('adicionarSelecao');

// Galeria
const galeriaEl = document.getElementById('galeriaIngredientes');
const tabsEl = document.getElementById('tabsCategorias');
const buscaModalEl = document.getElementById('buscaModal');

// Selecionados (chips)
const selecionadosWrap = document.getElementById('selecionadosWrap');
const selecionadosCountEl = document.getElementById('selecionadosCount');

// Modal Selecionados
const modalSelecionados = document.getElementById('modalSelecionados');
const modalSelecionadosBackdrop = document.getElementById('modalSelecionadosBackdrop');
const chipsListModal = document.getElementById('chipsListModal');

// ===== ANIMAÇÃO DA PORTA (COM CLIQUE NA MOLDURA) =====
if (frame) {
  frame.addEventListener('click', () => {
    wrap.classList.toggle('is-open');
    anunciar(wrap.classList.contains('is-open') 
      ? 'Geladeira aberta' 
      : 'Geladeira fechada'
    );
  });
}

// ===== CATÁLOGO DE INGREDIENTES =====
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

// Index do catálogo (sem subpastas de categoria)
const catalogIndex = {};
const slugCat = cat => normalizar(cat).replace(/\s|&|\/|,/g,'-');
Object.entries(CATEGORIAS).forEach(([cat, lista]) => {
  lista.forEach(([id, nome]) => {
    catalogIndex[id] = { 
      id, 
      nome, 
      cat, 
      img: `${BASE}/${slugCat(cat)}/${id}.png`
    };
  });
});

// ===== RENDER DA GRADE DA GELADEIRA =====
function renderIngredientes(filtro = '') {
  const lista = ingredientes.filter(i => 
    normalizar(i.nome).includes(normalizar(filtro))
  );

  // Atualizar contador
  ingredientesCount.textContent = `${lista.length} ${lista.length === 1 ? 'item' : 'itens'}`;

  // Empty state
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

  // Renderizar grid
  conteudo.innerHTML = '';
  conteudo.classList.add('conteudo-geladeira');

  lista.forEach((item, index) => {
    const cell = document.createElement('div');
    cell.className = 'celula';

    const img = document.createElement('img');
    img.src = item.url;
    img.alt = item.nome;
    img.loading = 'lazy';
    img.onerror = () => { 
      img.style.opacity = '0.3';
    };

    const btn = document.createElement('button');
    btn.className = 'btn-remover';
    btn.textContent = '✕';
    btn.setAttribute('aria-label', `Remover ${item.nome}`);
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Animação de saída
      cell.style.transform = 'scale(0)';
      cell.style.opacity = '0';
      
      setTimeout(() => {
        ingredientes.splice(index, 1);
        salvar();
        renderIngredientes(campoBusca.value);
        renderSelecionados();
        renderGaleria(); // Atualiza galeria
        mostrarToast(`${item.nome} removido`, '🗑️');
      }, 200);
    });

    cell.appendChild(img);
    cell.appendChild(btn);
    conteudo.appendChild(cell);

    // Animação de entrada escalonada
    cell.style.animation = `itemIn 0.3s ease-out ${index * 0.03}s backwards`;
  });
}

campoBusca.addEventListener('input', () => renderIngredientes(campoBusca.value));

// ===== MODAL: ABRIR/FECHAR =====
function abrirPopup() {
  renderSelecionados();
  renderGaleria();
  backdrop.hidden = false;
  modal.hidden = false;
  requestAnimationFrame(() => {
    modal.classList.add('ativo');
    modal.focus();
  });
  anunciar('Galeria de ingredientes aberta');
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

// ESC para fechar
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && modal.classList.contains('ativo')) {
    fecharPopup();
  }
});

adicionarBtn.addEventListener('click', () => {
  if (ingredientes.length === 0) {
    mostrarToast('Selecione pelo menos um ingrediente', '⚠️');
    return;
  }
  salvar();
  renderIngredientes(campoBusca.value);
  fecharPopup();
  mostrarToast(`${ingredientes.length} ingredientes adicionados!`, '✓');
});

// ===== TABS DE CATEGORIAS =====
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
      Array.from(tabsEl.children).forEach(el => 
        el.setAttribute('aria-selected', 'false')
      );
      btn.setAttribute('aria-selected', 'true');
      buscaModalEl.value = '';
      renderGaleria();
      anunciar(`Categoria ${cat} selecionada`);
    });
    
    tabsEl.appendChild(btn);
  });
}

// ===== GALERIA DE INGREDIENTES (FILTRA JÁ ADICIONADOS) =====
function renderGaleria() {
  const filtro = normalizar(buscaModalEl.value || '');
  const lista = CATEGORIAS[currentCategory];

  // Remover skeleton loader
  const skeletons = galeriaEl.querySelectorAll('.skeleton-item');
  skeletons.forEach(sk => sk.remove());

  galeriaEl.innerHTML = '';

  // IDs já adicionados (FILTRO PRINCIPAL)
  const idsAdicionados = new Set(ingredientes.map(i => i.id || normalizar(i.nome)));

  const itensFiltrados = lista.filter(([id, nome]) => {
    // FILTRO 1: Não mostrar os já adicionados
    if (idsAdicionados.has(id)) return false;
    // FILTRO 2: Busca textual
    return normalizar(nome).includes(filtro);
  });

  if (itensFiltrados.length === 0) {
    galeriaEl.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: var(--verde);">
        <p style="font-size: 48px; margin-bottom: 16px;">✓</p>
        <p style="font-size: 16px; font-weight: 600;">Todos os ingredientes desta categoria já foram adicionados!</p>
        <p style="font-size: 14px; margin-top: 8px; opacity: 0.7;">Tente outra categoria ou busque manualmente</p>
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
    img.onerror = () => { 
      img.style.opacity = '0.3';
    };

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
    if (el.dataset.id) {
      const id = el.dataset.id;
      if (ids.has(id)) {
        el.classList.add('selecionado');
      } else {
        el.classList.remove('selecionado');
      }
    }
  });
}

// ===== SELECIONAR/REMOVER =====
function toggleSelecionado(catItem) {
  const id = catItem.id;
  const idx = ingredientes.findIndex(i => 
    (i.id || normalizar(i.nome)) === id
  );

  if (idx >= 0) {
    ingredientes.splice(idx, 1);
    mostrarToast(`${catItem.nome} removido`, '➖');
  } else {
    ingredientes.push({ 
      id, 
      nome: catItem.nome, 
      url: catItem.img 
    });
    mostrarToast(`${catItem.nome} adicionado`, '✓');
  }

  salvar();
  renderIngredientes(campoBusca.value);
  renderSelecionados();
  marcarSelecionadosGaleria();
}

// ===== SELECIONADOS (CONTADOR COMPACTO) =====
function renderSelecionados() {
  const total = ingredientes.length;
  
  selecionadosCountEl.innerHTML = `
    <span class="count-badge">${total}</span>
    <span>${total === 1 ? 'selecionado' : 'selecionados'}</span>
  `;
  
  selecionadosWrap.hidden = total === 0;
}

// Ver selecionados (modal popup)
document.getElementById('verSelecionados').addEventListener('click', () => {
  chipsListModal.innerHTML = '';
  
  ingredientes.forEach(item => {
    const chip = document.createElement('div');
    chip.className = 'chip-full';

    const img = document.createElement('img');
    img.src = item.url;
    img.alt = '';
    img.loading = 'lazy';
    img.onerror = () => { img.style.display = 'none'; };

    const name = document.createElement('span');
    name.className = 'chip-full-nome';
    name.textContent = item.nome;

    const btn = document.createElement('button');
    btn.className = 'chip-full-remove';
    btn.textContent = '×';
    btn.setAttribute('aria-label', `Remover ${item.nome}`);
    btn.addEventListener('click', () => {
      const idx = ingredientes.findIndex(i => i.id === item.id);
      if (idx >= 0) {
        ingredientes.splice(idx, 1);
        salvar();
        renderIngredientes(campoBusca.value);
        renderSelecionados();
        renderGaleria();
        chip.remove();
        if (ingredientes.length === 0) {
          fecharModalSelecionados();
        }
        mostrarToast(`${item.nome} removido`, '🗑️');
      }
    });

    chip.appendChild(img);
    chip.appendChild(name);
    chip.appendChild(btn);
    chipsListModal.appendChild(chip);
  });

  modalSelecionadosBackdrop.hidden = false;
  modalSelecionados.hidden = false;
  requestAnimationFrame(() => {
    modalSelecionados.classList.add('ativo');
  });
});

function fecharModalSelecionados() {
  modalSelecionados.classList.remove('ativo');
  setTimeout(() => {
    modalSelecionados.hidden = true;
    modalSelecionadosBackdrop.hidden = true;
  }, 300);
}

document.getElementById('fecharSelecionados').addEventListener('click', fecharModalSelecionados);
document.getElementById('fecharModalSelecionados').addEventListener('click', fecharModalSelecionados);
modalSelecionadosBackdrop.addEventListener('click', fecharModalSelecionados);

// Limpar todos
document.getElementById('limparTodosSelecionados').addEventListener('click', () => {
  if (confirm(`Remover todos os ${ingredientes.length} ingredientes selecionados?`)) {
    ingredientes = [];
    salvar();
    renderIngredientes(campoBusca.value);
    renderSelecionados();
    renderGaleria();
    fecharModalSelecionados();
    mostrarToast('Todos removidos', '🗑️');
  }
});

// Adicionar ingrediente manual
document.getElementById('adicionarManual').addEventListener('click', () => {
  const nome = prompt('Digite o nome do ingrediente:');
  
  if (!nome || !nome.trim()) return;
  
  const nomeClean = nome.trim();
  const url = prompt(
    'Cole o caminho da imagem (opcional):\nEx: /assets/ingredientes/categoria/item.png',
    '/assets/placeholder.png'
  );
  
  const id = normalizar(nomeClean).replace(/\s+/g, '-').slice(0, 40) || 
    `item-${Date.now()}`;
  
  ingredientes.push({ 
    id, 
    nome: nomeClean, 
    url: url || '/assets/placeholder.png' 
  });
  
  salvar();
  renderIngredientes(campoBusca.value);
  renderSelecionados();
  renderGaleria();
  mostrarToast(`${nomeClean} adicionado manualmente`, '✏️');
});

// ===== NAVEGAÇÃO DO RODAPÉ =====
document.getElementById('btnVoltar').addEventListener('click', () => {
  window.location.href = '/app/humor/index.html';
});

document.getElementById('btnLogo').addEventListener('click', () => {
  window.location.href = '/app/home/index.html';
});

document.getElementById('btnGeladeira').addEventListener('click', () => {
  window.location.href = '/app/geladeira/index.html';
});

// ===== INICIALIZAÇÃO =====
renderIngredientes();
renderTabs();
renderGaleria();

console.log('🚀 Geladeira inicializada com sucesso!');
console.log(`📦 ${ingredientes.length} ingredientes carregados`);
console.log(`🗂️ ${Object.keys(CATEGORIAS).length} categorias disponíveis`);
console.log(`🏷️ ${Object.keys(catalogIndex).length} ingredientes no catálogo`);
