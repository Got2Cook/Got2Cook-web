'use strict';

/* =========================
   Configurações e constantes
   ========================= */
const OPCOES = [
  'AMENDOIM','CAFEÍNA','CARNE VERMELHA','CASTANHAS','CORANTES','FRANGO',
  'FRUTOS DO MAR','GLÚTEN','LACTOSE','MILHO','OVO','SOJA'
];

// Chaves de armazenamento (mantidas como você usa hoje)
const LS_PREF = 'gostosPreferidos';
const LS_REST = 'gostosRestritos';

/* =========================
   Utilitários de Storage/DOM
   ========================= */
const getArr = (k) => JSON.parse(localStorage.getItem(k) || '[]');
const setArr = (k, v) => localStorage.setItem(k, JSON.stringify(v));

function getValoresUL(ulId) {
  const ul = document.getElementById(ulId);
  if (!ul) return [];
  return [...ul.children].map(li => li.textContent.replace('✖', '').trim().toUpperCase());
}

/* =========================
   Estado do Modal
   ========================= */
let listaAtual = 'preferido'; // 'preferido' | 'restrito'

function baseDisponiveisPara(tipo) {
  // Bloqueia itens que já existem na lista oposta e na própria lista
  const prefSelecionados = getValoresUL('listaPreferidos');
  const restSelecionados = getValoresUL('listaRestricoes');

  const banidosOposta = new Set(tipo === 'preferido' ? restSelecionados : prefSelecionados);
  const banidosMesma  = new Set(tipo === 'preferido' ? prefSelecionados : restSelecionados);

  return OPCOES
    .filter(op => !banidosOposta.has(op) && !banidosMesma.has(op))
    .sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

/* =========================
   Abertura/fechamento do modal
   (expostas no escopo global por causa do HTML inline)
   ========================= */
window.abrirSelecao = function abrirSelecao(tipo) {
  listaAtual = tipo;
  const modal = document.getElementById('janelaSelecao');
  const busca = document.getElementById('buscaOpcao');

  if (!modal) return;

  modal.style.display = 'flex';
  if (busca) {
    busca.value = '';
    setTimeout(() => busca.focus(), 0);
  }
  renderOpcoes(baseDisponiveisPara(listaAtual));
};

window.fecharSelecao = function fecharSelecao() {
  const modal = document.getElementById('janelaSelecao');
  if (modal) modal.style.display = 'none';
};

/* =========================
   Renderização e Filtro do grid
   ========================= */
function renderOpcoes(lista) {
  const grid = document.getElementById('opcoesGrid');
  if (!grid) return;
  grid.innerHTML = '';

  lista.forEach(item => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'opcao-btn';
    b.textContent = item;
    b.onclick = () => { adicionarIngrediente(listaAtual, item); window.fecharSelecao(); };
    grid.appendChild(b);
  });
}

// Também é chamado inline no HTML (oninput), por isso vai pro escopo global
window.filtrarOpcoes = function filtrarOpcoes() {
  const q = (document.getElementById('buscaOpcao')?.value || '').trim().toUpperCase();
  const base = baseDisponiveisPara(listaAtual);
  const out = !q ? base : base.filter(x => x.includes(q));
  renderOpcoes(out);
};

/* =========================
   Barra de adicionar (personalizar)
   ========================= */
// Caixa alta em tempo real
document.addEventListener('input', (e) => {
  if (e.target && e.target.id === 'personalizadoInput') {
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    e.target.value = (e.target.value || '').toUpperCase();
    e.target.setSelectionRange(start, end);
  }
});

// Também é chamado inline no HTML (onclick)
window.confirmarPersonalizado = function confirmarPersonalizado() {
  const inp = document.getElementById('personalizadoInput');
  if (!inp) return;

  const v = (inp.value || '').trim().toUpperCase();
  if (!v) return;

  // Bloqueio cruzado: não permite se já existir na outra lista
  const existeNaOutra = listaAtual === 'preferido'
    ? getValoresUL('listaRestricoes').includes(v)
    : getValoresUL('listaPreferidos').includes(v);

  if (existeNaOutra) {
    alert('Esse item já está na outra lista.');
    return;
  }

  adicionarIngrediente(listaAtual, v);
  window.fecharSelecao();
  inp.value = '';
};

/* =========================
   Adição / Remoção / Persistência
   ========================= */
function criarLi(texto, tipoLista) {
  const li = document.createElement('li');
  li.innerHTML = `${texto} <button class="excluir" type="button">✖</button>`;
  li.querySelector('.excluir').addEventListener('click', () => removerIngrediente(texto, tipoLista));
  return li;
}

function adicionarIngrediente(tipo, valor) {
  // Segurança extra: bloqueio cruzado aqui também
  const existeNaOutra = tipo === 'preferido'
    ? getValoresUL('listaRestricoes').includes(valor)
    : getValoresUL('listaPreferidos').includes(valor);
  if (existeNaOutra) {
    alert('Esse item já está na outra lista.');
    return;
  }

  const ul = document.getElementById(tipo === 'preferido' ? 'listaPreferidos' : 'listaRestricoes');
  if (!ul) return;

  const jaTem = [...ul.children].some(li => li.textContent.replace('✖', '').trim() === valor);
  if (!jaTem) {
    ul.appendChild(criarLi(valor, tipo));
    salvarLocalStorage();
  }
}

function removerIngrediente(valor, tipo) {
  const ul = document.getElementById(tipo === 'preferido' ? 'listaPreferidos' : 'listaRestricoes');
  if (!ul) return;

  [...ul.children].forEach(li => {
    if (li.textContent.replace('✖', '').trim() === valor) li.remove();
  });
  salvarLocalStorage();
}

function salvarLocalStorage() {
  setArr(LS_PREF, getValoresUL('listaPreferidos'));
  setArr(LS_REST, getValoresUL('listaRestricoes'));
}

function carregarLocalStorage() {
  getArr(LS_PREF).forEach(v => adicionarIngrediente('preferido', v));
  getArr(LS_REST).forEach(v => adicionarIngrediente('restrito', v));
}

/* =========================
   UX do modal e navegação do rodapé
   ========================= */
window.addEventListener('DOMContentLoaded', () => {
  // Fechar modal clicando fora
  document.getElementById('janelaSelecao')?.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'janelaSelecao') window.fecharSelecao();
  });

  // Fechar modal com ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.getElementById('janelaSelecao')?.style.display === 'flex') {
      window.fecharSelecao();
    }
  });

  // Navegação do rodapé (ajuste os caminhos se necessário)
  document.getElementById('btnVoltar')?.addEventListener('click', () => {
    window.location.href = '../humor/index.html';
  });
  document.getElementById('btnLogo')?.addEventListener('click', () => {
    window.location.href = '../home/index.html';
  });
  document.getElementById('btnGeladeira')?.addEventListener('click', () => {
    window.location.href = '../geladeira/index.html';
  });

  // Carrega dados salvos
  carregarLocalStorage();
});
