'use strict';

// Opções fixas exibidas no modal
const OPCOES = [
  'AMENDOIM','CAFEÍNA','CARNE VERMELHA','CASTANHAS','CORANTES','FRANGO',
  'FRUTOS DO MAR','GLÚTEN','LACTOSE','MILHO','OVO','SOJA'
];

// Storage (compatível com sua chave atual)
const LS_PREF = 'gostosPreferidos';
const LS_REST = 'gostosRestritos';
const getArr = (k) => JSON.parse(localStorage.getItem(k) || '[]');
const setArr = (k, v) => localStorage.setItem(k, JSON.stringify(v));

let listaAtual = 'preferido'; // 'preferido' | 'restrito'

/* Util: lê os valores atuais de uma UL (em CAIXA ALTA) */
function getValoresUL(ulId) {
  const ul = document.getElementById(ulId);
  return [...ul.children].map(li => li.textContent.replace('✖','').trim().toUpperCase());
}

/* Modal */
function abrirSelecao(tipo){
  listaAtual = tipo;
  document.getElementById('janelaSelecao').style.display = 'flex';
  document.getElementById('buscaOpcao').value = '';

  // lê o estado atual das listas
  const prefSelecionados = getValoresUL('listaPreferidos');
  const restSelecionados = getValoresUL('listaRestricoes');

  // BLOQUEIO CRUZADO:
  // - Se for adicionar em preferido, esconde o que já está em restrito
  // - Se for adicionar em restrito, esconde o que já está em preferido
  const banidosOposta = new Set(tipo === 'preferido' ? restSelecionados : prefSelecionados);

  // Também escondo o que já está na MESMA lista para evitar clique inútil
  const banidosMesma  = new Set(tipo === 'preferido' ? prefSelecionados : restSelecionados);

  const disponiveis = OPCOES.filter(op => !banidosOposta.has(op) && !banidosMesma.has(op));
  renderOpcoes(disponiveis);

  setTimeout(() => document.getElementById('buscaOpcao').focus(), 0);
}
function fecharSelecao(){
  document.getElementById('janelaSelecao').style.display = 'none';
}

/* Render e filtro do grid de opções */
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

  // Recalcula com o mesmo critério de banidos para garantir consistência
  const prefSelecionados = getValoresUL('listaPreferidos');
  const restSelecionados = getValoresUL('listaRestricoes');
  const banidosOposta = new Set(listaAtual === 'preferido' ? restSelecionados : prefSelecionados);
  const banidosMesma  = new Set(listaAtual === 'preferido' ? prefSelecionados : restSelecionados);

  const baseFiltrada = OPCOES.filter(op => !banidosOposta.has(op) && !banidosMesma.has(op));
  const out = !q ? baseFiltrada : baseFiltrada.filter(x => x.includes(q));
  renderOpcoes(out);
}

/* Barra de adicionar (personalizar) */
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

  // Impede cruzado: se já estiver na outra lista, não permite
  const existeNaOutra = listaAtual === 'preferido'
    ? getValoresUL('listaRestricoes').includes(v)
    : getValoresUL('listaPreferidos').includes(v);
  if(existeNaOutra){
    // mensagem simples; troque por um toast se preferir
    alert('Esse item já está na outra lista.');
    return;
  }

  adicionarIngrediente(listaAtual, v);
  fecharSelecao();
  inp.value = '';
}

/* Add/remove + persistência */
function criarLi(texto, tipoLista){
  const li = document.createElement('li');
  li.innerHTML = `${texto} <button class="excluir" type="button">✖</button>`;
  li.querySelector('.excluir').addEventListener('click', () => removerIngrediente(texto, tipoLista));
  return li;
}
function adicionarIngrediente(tipo, valor){
  // Segurança extra: também bloqueia cruzado aqui
  const existeNaOutra = tipo === 'preferido'
    ? getValoresUL('listaRestricoes').includes(valor)
    : getValoresUL('listaPreferidos').includes(valor);
  if(existeNaOutra){
    alert('Esse item já está na outra lista.');
    return;
  }

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
  const pref = getValoresUL('listaPreferidos');
  const rest = getValoresUL('listaRestricoes');
  setArr(LS_PREF, pref);
  setArr(LS_REST, rest);
}
function carregarLocalStorage(){
  getArr(LS_PREF).forEach(v => adicionarIngrediente('preferido', v));
  getArr(LS_REST).forEach(v => adicionarIngrediente('restrito', v));
}

/* UX: fechar clicando fora e ESC */
document.addEventListener('click', (e) => {
  if(e.target && e.target.id === 'janelaSelecao') fecharSelecao();
});
document.addEventListener('keydown', (e) => {
  if(e.key === 'Escape' && document.getElementById('janelaSelecao').style.display === 'flex'){
    fecharSelecao();
  }
});

// navegação do rodapé (ajuste os caminhos se seu projeto usar outros)
document.getElementById('btnVoltar')?.addEventListener('click', () => {
  window.location.href = '../humor/index.html';
});
document.getElementById('btnLogo')?.addEventListener('click', () => {
  window.location.href = '../home/index.html';
});
document.getElementById('btnGeladeira')?.addEventListener('click', () => {
  window.location.href = '../geladeira/index.html';
});

  carregarLocalStorage();
});
