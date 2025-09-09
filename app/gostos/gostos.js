'use strict';

// Opções fixas
const OPCOES = [
  'AMENDOIM','CAFEÍNA','CARNE VERMELHA','CASTANHAS','CORANTES','FRANGO',
  'FRUTOS DO MAR','GLÚTEN','LACTOSE','MILHO','OVO','SOJA'
];

// Storage (compatível com seu padrão anterior)
const LS_PREF = 'gostosPreferidos';
const LS_REST = 'gostosRestritos';
const getArr = (k) => JSON.parse(localStorage.getItem(k) || '[]');
const setArr = (k, v) => localStorage.setItem(k, JSON.stringify(v));

let listaAtual = 'preferido'; // 'preferido' | 'restrito'

function abrirSelecao(tipo){
  listaAtual = tipo;
  document.getElementById('janelaSelecao').style.display = 'flex';
  document.getElementById('buscaOpcao').value = '';
  renderOpcoes(OPCOES);
  setTimeout(() => document.getElementById('buscaOpcao').focus(), 0);
}
function fecharSelecao(){
  document.getElementById('janelaSelecao').style.display = 'none';
}

// Render e filtro
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
function filtrarOpcoes(){
  const q = (document.getElementById('buscaOpcao').value || '').trim().toUpperCase();
  const out = !q ? OPCOES : OPCOES.filter(x => x.includes(q));
  renderOpcoes(out);
}

// Personalizar (barra de adicionar)
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

// Add/remove + persistência
function criarLi(texto, tipoLista){
  const li = document.createElement('li');
  li.innerHTML = `${texto} <button class="excluir" type="button">✖</button>`;
  li.querySelector('.excluir').addEventListener('click', () => removerIngrediente(texto, tipoLista));
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

// UX: fechar clicando fora e ESC
document.addEventListener('click', (e) => {
  if(e.target && e.target.id === 'janelaSelecao') fecharSelecao();
});
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape' && document.getElementById('janelaSelecao').style.display === 'flex'){
    fecharSelecao();
  }
});

// Rodapé
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btnVoltar')?.addEventListener('click', () => { window.location.href = '../home/index.html'; });
  document.getElementById('btnLogo')?.addEventListener('click', () => { window.location.href = '../minhas-receitas/index.html'; });
  document.getElementById('btnGeladeira')?.addEventListener('click', () => { window.location.href = '../geladeira/index.html'; });

  carregarLocalStorage();
});
