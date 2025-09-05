'use strict';

// ===== chaves de armazenamento =====
const LS_PREF = 'got2cook_preferidos';
const LS_REST = 'got2cook_restritos';

// opções (edite à vontade)
const OPCOES = [
  'LACTOSE','GLÚTEN','FRUTOS DO MAR','OVO','CASTANHAS','AMENDOIM','SOJA','MILHO',
  'CORANTES','CAFEÍNA','CARNE VERMELHA','FRANGO','PEIXE','TOMATE','CEBOLA','ALHO',
  'AÇÚCAR','PIMENTA','ARROZ','FEIJÃO','MASSA','LATICÍNIOS','BERINJELA','ABOBRINHA'
];

// helpers storage
const getArr = (k) => JSON.parse(localStorage.getItem(k) || '[]');
const setArr = (k, v) => localStorage.setItem(k, JSON.stringify(v));

document.addEventListener('DOMContentLoaded', () => {
  // refs DOM
  const listaPref  = document.getElementById('listaPreferidos');
  const listaRest  = document.getElementById('listaRestricoes');
  const btnAddPref = document.getElementById('btnAddPreferido');
  const btnAddRest = document.getElementById('btnAddRestrito');

  const janela   = document.getElementById('janelaSelecao');
  const opcoesUl = document.getElementById('opcoesIngrediente');
  const btnFechar= document.getElementById('btnFechar');

  // rodapé (navegação)
  document.getElementById('btnVoltar')?.addEventListener('click', () => {
    window.location.href = '../home/index.html';
  });
  document.getElementById('btnLogo')?.addEventListener('click', () => {
    window.location.href = '../minhas-receitas/index.html';
  });
  document.getElementById('btnGeladeira')?.addEventListener('click', () => {
    window.location.href = '../geladeira/index.html';
  });

  // estado
  let tipoAtual = 'preferido'; // 'preferido' | 'restrito'

  // render
  function criaItemLi(texto, listaTipo){
    const li = document.createElement('li');
    li.textContent = texto;

    const btn = document.createElement('button');
    btn.className = 'excluir';
    btn.type = 'button';
    btn.setAttribute('aria-label', `Remover ${texto}`);
    btn.textContent = '✖';
    btn.addEventListener('click', () => removerItem(texto, listaTipo));

    li.appendChild(btn);
    return li;
  }
  function render(){
    const pref = getArr(LS_PREF);
    const rest = getArr(LS_REST);

    listaPref.innerHTML = '';
    listaRest.innerHTML = '';

    pref.forEach(v => listaPref.appendChild(criaItemLi(v, 'preferido')));
    rest.forEach(v => listaRest.appendChild(criaItemLi(v, 'restrito')));
  }

  // seleção
  function abrirSelecao(tipo){
    tipoAtual = tipo;
    opcoesUl.innerHTML = '';
    OPCOES.forEach(op => {
      const li = document.createElement('li');
      li.tabIndex = 0;
      li.textContent = op;
      li.addEventListener('click', () => selecionar(op));
      li.addEventListener('keypress', (e) => { if(e.key === 'Enter') selecionar(op); });
      opcoesUl.appendChild(li);
    });
    janela.style.display = 'flex';
    opcoesUl.querySelector('li')?.focus();
  }
  function fecharSelecao(){ janela.style.display = 'none'; }
  function selecionar(valor){
    const key = tipoAtual === 'preferido' ? LS_PREF : LS_REST;
    const arr = getArr(key);
    if(!arr.includes(valor)){
      arr.push(valor);
      setArr(key, arr);
      render();
    }
    fecharSelecao();
  }
  function removerItem(valor, listaTipo){
    const key = listaTipo === 'preferido' ? LS_PREF : LS_REST;
    const arr = getArr(key).filter(v => v !== valor);
    setArr(key, arr);
    render();
  }

  // binds (garantidos mesmo sem defer)
  btnAddPref?.addEventListener('click', () => abrirSelecao('preferido'));
  btnAddRest?.addEventListener('click', () => abrirSelecao('restrito'));
  btnFechar?.addEventListener('click', fecharSelecao);
  janela?.addEventListener('click', (e) => { if(e.target === janela) fecharSelecao(); });

  // init
  if(!localStorage.getItem(LS_PREF)) setArr(LS_PREF, []);
  if(!localStorage.getItem(LS_REST)) setArr(LS_REST, []);
  render();
});
