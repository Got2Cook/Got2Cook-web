// ===== Porta ↔ Interior =====
const wrap  = document.getElementById('geladeiraWrap');
const porta = document.getElementById('portaImagem');
porta.addEventListener('click', () => wrap.classList.toggle('is-open'));

// ===== Storage =====
const LS_ITENS = 'geladeira';
let ingredientes = JSON.parse(localStorage.getItem(LS_ITENS) || '[]');
ingredientes = ingredientes.map(it => typeof it === 'string'
  ? { id: it.split('/').pop().split('.')[0].toLowerCase(), nome: it.split('/').pop().split('.')[0], url: it }
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
const tabsEl       = document.getElementById('tabsCategorias');
const buscaModalEl = document.getElementById('buscaModal');
const fabAdd       = document.getElementById('fabAdicionar');

// ===== Catálogo com categorias =====
// PNGs em: ../../assets/ingredientes/<slug-categoria>/<id>.png
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

const BASE = '../../assets/ingredientes';
const catalogIndex = {};
function slugCat(cat){
  return normalizar(cat).replace(/\s|&|\/|,/g,'-');
}
Object.entries(CATEGORIAS).forEach(([cat, lista]) => {
  lista.forEach(([id, nome]) => {
    catalogIndex[id] = { id, nome, cat, img: `${BASE}/${slugCat(cat)}/${id}.png` };
  });
});

// ===== Render grade da geladeira =====
function renderIngredientes(filtro=''){
  conteudo.innerHTML = '';
  conteudo.classList.add('conteudo-geladeira');

  const lista = ingredientes.filter(i => normalizar(i.nome).includes(normalizar(filtro)));

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
      salvar();
      renderIngredientes(campoBusca.value);
      marcarSelecionadosGaleria();
    });

    cell.appendChild(img);
    cell.appendChild(btn);
    conteudo.appendChild(cell);
  });
}
campoBusca.addEventListener('input', () => renderIngredientes(campoBusca.value));

// ===== Modal: abrir/fechar =====
function abrirPopup(){
  backdrop.hidden = false;
  if (typeof modal.showModal === 'function') modal.showModal();
  else modal.setAttribute('open','');
  setTimeout(() => {
    const f = modal.querySelector('.tab-btn[aria-selected="true"]') || modal.querySelector('.tab-btn');
    f && f.focus();
  },0);
}
function closeModal(){
  backdrop.hidden = true;
  if (typeof modal.close === 'function') modal.close();
  else modal.removeAttribute('open');
}
window.abrirPopup = abrirPopup;
window.fecharPopup = closeModal;

fecharModal.addEventListener('click', closeModal);
backdrop.addEventListener('click', closeModal);
concluir.addEventListener('click', closeModal);

// ===== Tabs de categorias =====
let currentCategory = Object.keys(CATEGORIAS)[0];
function renderTabs(){
  tabsEl.innerHTML = '';
  Object.keys(CATEGORIAS).forEach((cat, idx) => {
    const b = document.createElement('button');
    b.className = 'tab-btn';
    b.role = 'tab';
    b.setAttribute('aria-selected', String(cat === currentCategory));
    b.textContent = cat;
    b.addEventListener('click', () => {
      currentCategory = cat;
      Array.from(tabsEl.children).forEach(el => el.setAttribute('aria-selected','false'));
      b.setAttribute('aria-selected','true');
      buscaModalEl.value = '';
      renderGaleria();
    });
    tabsEl.appendChild(b);
    if (idx === 0) b.setAttribute('aria-selected','true');
  });
}

// ===== Galeria por categoria + filtro =====
function renderGaleria(){
  const filtro = normalizar(buscaModalEl.value);
  const lista = CATEGORIAS[currentCategory];

  galeriaEl.innerHTML = '';
  lista
    .filter(([id,nome]) => normalizar(nome).includes(filtro))
    .forEach(([id, nome]) => {
      const data = catalogIndex[id];
      const item = document.createElement('div');
      item.className = 'item';
      item.tabIndex = 0;
      item.dataset.id = id;

      const img = document.createElement('img');
      img.src = data.img;
      img.alt = nome;

      const label = document.createElement('div');
      label.className = 'nome';
      label.textContent = nome;

      const toggle = () => toggleSelecionado(data);
      item.addEventListener('click', toggle);
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
      });

      item.appendChild(img);
      item.appendChild(label);
      galeriaEl.appendChild(item);
    });

  marcarSelecionadosGaleria();
}
buscaModalEl.addEventListener('input', renderGaleria);

function marcarSelecionadosGaleria(){
  const ids = new Set(ingredientes.map(i => i.id || normalizar(i.nome)));
  Array.from(galeriaEl.children).forEach((el) => {
    const id = el.dataset.id;
    if (ids.has(id)) el.classList.add('selecionado'); else el.classList.remove('selecionado');
  });
}

function toggleSelecionado(catItem){
  const id = catItem.id;
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

// FAB fixo — confirma e fecha
fabAdd.addEventListener('click', () => {
  salvar();
  renderIngredientes(campoBusca.value);
  closeModal();
});

// ===== Init =====
renderIngredientes();
renderTabs();
renderGaleria();

// ===== Navegação rodapé =====
document.getElementById("btnVoltar").addEventListener("click", () => {
  window.location.href = "../humor/index.html";
});
document.getElementById("btnLogo").addEventListener("click", () => {
  window.location.href = "../home/index.html";
});
document.getElementById("btnGeladeira").addEventListener("click", () => {
  window.location.href = "../geladeira/index.html";
});
