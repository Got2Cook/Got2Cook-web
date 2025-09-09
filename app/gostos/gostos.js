'use strict';

// ===== Dados-base =====
const OPCOES = [
  'AMENDOIM','CAFEÍNA','CARNE VERMELHA','CASTANHAS','CORANTES','FRANGO',
  'FRUTOS DO MAR','GLÚTEN','LACTOSE','MILHO','OVO','SOJA'
];

// ===== Storage (mantendo como seu código original) =====
const LS_PREF = 'gostosPreferidos';
const LS_REST = 'gostosRestritos';
const getArr = (k) => JSON.parse(localStorage.getItem(k) || '[]');
const setArr = (k, v) => localStorage.setItem(k, JSON.stringify(v));

// ===== Refs globais =====
let listaAtual = 'preferido'; // 'preferido' | 'restrito'

// ===== Abertura modal =====
function abrirSelecao(tipo){
  listaAtual = tipo;
  document.getElementById('janelaSelecao').style.display = 'flex';

  // busca limpa
  const busca = document.getElementById('buscaOpcao');
  busca.value = '';

  // render opções
  renderOpcoes(OPCOES);
  setTimeout(() => busca.focus(), 0);
}

// ===== Fechamento modal =====
function fecharSelecao(){
  document.getElementById('janelaSelecao').style.display = 'none';
}

// ===== Render chips de opções =====
function renderOpcoes(lista){
  const grid = document.getElementById('opcoesGrid');
  grid.innerHTML = '';
  lista.forEach(item => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'opcao-btn';
    b.textContent = item;
    b.onclick = () => { adicionarIngrediente(listaAtual, item); fecharSelecao(); };
    grid.appendChild(b);
  });
}

// ===== Filtro de busca =====
function filtrarOpcoes(){
  const q = (document.getElementById('buscaOpcao').value || '').trim().toUpperCase();
  const base = OPCOES;
  const out = !q ? base : base.filter(x => x.includes(q));
  renderOpcoes(out);
}

// ===== Personalizar =====
function focusPersonalizar(){
  const wrap = document.getElementById('personalizarWrap');
  const inp = document.getElementById('personalizadoInput');
  wrap.classList.remove('pulse'); // reinicia animação
  void wrap.offsetWidth;          // reflow
  wrap.classList.add('pulse');
  inp.focus();
}

// caixa alta em tempo real
document.addEventListener('input', (e) => {
  if(e.target && e.target.id === 'personalizadoInput'){
    const start = e.target.selectionStart;
    const end = e.target.selectionEnd;
    e.target.value = (e.target.value || '').toUpperCase();
    e.target.setSelectionRange(start, end);
  }
});

function confirmarPersonalizado(){
  const inp = document.getElementById('personalizadoInput');
  const v = (inp.value || '').trim().toUpperCase();
  if(!v) return;
  adicionarIngrediente(listaAtual, v);
  fecharSelecao();
}

// ===== Adição/remoção + persistência =====
function criarLi(texto, tipoLista){
  const li = document.createElement('li');
  li.innerHTML = `${texto} <button class="excluir" type="button">✖</button>`;
  li.querySelector('.excluir').addEventListener('click', () => removerIngrediente(texto, tipoLista));
  li.classList.add('anim-pop');
  return li;
}

function adicionarIngrediente(tipo, valor){
  const ul = document.getElementById(tipo === 'preferido' ? 'listaPreferidos' : 'listaRestricoes');
  const jaTem = [...ul.children].some(li => li.textContent.replace('✖','').trim() === valor);
  if(!jaTem){
    ul.appendChild(criarLi(valor, tipo));
    salvarLocalStorage();
  }
}

function removerIngrediente(valor, tipo){
  const ul = document.getElementById(tipo === 'preferido' ? 'listaPreferidos' : 'listaRestricoes');
  [...ul.children].forEach(li => {
    if(li.textContent.replace('✖','').trim() === valor) li.remove();
  });
  salvarLocalStorage();
}

function salvarLocalStorage(){
  const pref = [...document.getElementById('listaPreferidos').children].map(li => li.textContent.replace('✖','').trim());
  const rest = [...document.getElementById('listaRestricoes').children].map(li => li.textContent.replace('✖','').trim());
  setArr(LS_PREF, pref);
  setArr(LS_REST, rest);
}

function carregarLocalStorage(){
  getArr(LS_PREF).forEach(v => adicionarIngrediente('preferido', v));
  getArr(LS_REST).forEach(v => adicionarIngrediente('restrito', v));
}

// ===== UX: fechar clicando fora e ESC =====
document.addEventListener('click', (e) => {
  const modal = document.getElementById('janelaSelecao');
  if(e.target && e.target.id === 'janelaSelecao') fecharSelecao();
});
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape' && document.getElementById('janelaSelecao').style.display === 'flex'){
    fecharSelecao();
  }
});

// ===== Navegação rodapé =====
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnVoltar')?.addEventListener('click', () => {
    window.location.href = '../home/index.html';
  });
  document.getElementById('btnLogo')?.addEventListener('click', () => {
    window.location.href = '../minhas-receitas/index.html';
  });
  document.getElementById('btnGeladeira')?.addEventListener('click', () => {
    window.location.href = '../geladeira/index.html';
  });

  carregarLocalStorage();
});
