// ===== Constantes de storage (requisito) =====
const LS_PREF = 'got2cook_preferidos';
const LS_REST = 'got2cook_restritos';

// ===== Elementos =====
const chipsPreferidos = document.getElementById('chipsPreferidos');
const chipsRestritos  = document.getElementById('chipsRestritos');
const btnAddPreferido = document.getElementById('btnAddPreferido');
const btnAddRestrito  = document.getElementById('btnAddRestrito');

const modal      = document.getElementById('modalSelecao');
const opcoesBox  = document.getElementById('opcoesContainer');
const btnFechar  = document.getElementById('btnFecharModal');
const modalTitulo= document.getElementById('modalTitulo');

// ===== Navegação do rodapé (paths ajustáveis ao seu projeto) =====
document.getElementById('btnVoltar')?.addEventListener('click', () => {
  // Home
  window.location.href = '../home/index.html';
});
document.getElementById('btnLogo')?.addEventListener('click', () => {
  // Minhas Receitas
  window.location.href = '../minhas-receitas/index.html'; // ajuste se necessário
});
document.getElementById('btnGeladeira')?.addEventListener('click', () => {
  // Minha Geladeira
  window.location.href = '../geladeira/index.html';
});

// ===== Estado =====
let focoLista = 'preferidos'; // 'preferidos' | 'restritos'

// Opções de ingredientes (exemplo; edite à vontade)
const OPCOES = [
  'ARROZ','FEIJÃO','MASSA','CARNE VERMELHA','FRANGO','PEIXE','FRUTOS DO MAR',
  'OVO','LEITE','LATICÍNIOS','GLÚTEN','CASTANHAS','AMENDOIM','SOJA','MILHO',
  'CORANTES','CAFEÍNA','AÇÚCAR','PIMENTA','TOMATE','CEBOLA','ALHO','BERINJELA','ABOBRINHA'
];

// ===== Utilidades de storage =====
const getArray = (key) => JSON.parse(localStorage.getItem(key) || '[]');
const setArray = (key, arr) => localStorage.setItem(key, JSON.stringify(arr));

// ===== Renderização dos chips =====
function criarChip(nome, tipo){
  const chip = document.createElement('div');
  chip.className = 'chip';
  chip.setAttribute('role','listitem');
  chip.innerHTML = `
    <span class="chip-text">${nome}</span>
    <button class="chip-del" type="button" aria-label="Excluir ${nome}" title="Excluir">✖</button>
  `;
  chip.querySelector('.chip-del').addEventListener('click', () => {
    removerItem(nome, tipo);
  });
  return chip;
}

function render(){
  const pref = getArray(LS_PREF);
  const rest = getArray(LS_REST);

  chipsPreferidos.innerHTML = '';
  chipsRestritos.innerHTML  = '';

  pref.forEach(n => chipsPreferidos.appendChild(criarChip(n, 'preferidos')));
  rest.forEach(n => chipsRestritos.appendChild(criarChip(n, 'restritos')));
}

// ===== Ações =====
function abrirSelecao(tipo){
  focoLista = tipo; // 'preferidos' | 'restritos'
  modal.hidden = false;
  modalTitulo.textContent = tipo === 'preferidos' ? 'Selecione preferidos' : 'Selecione restritos';

  const pref = getArray(LS_PREF);
  const rest = getArray(LS_REST);

  // evita duplicados e itens já escolhidos em qualquer lista
  const bloqueados = new Set([...pref, ...rest]);
  opcoesBox.innerHTML = '';
  OPÇÕES_SEM_DUP().forEach(op => {
    if(!bloqueados.has(op)){
      const btn = document.createElement('button');
      btn.className = 'chip';
      btn.type = 'button';
      btn.textContent = op;
      btn.addEventListener('click', () => {
        adicionarItem(op, focoLista);
      });
      opcoesBox.appendChild(btn);
    }
  });

  // foco acessível
  setTimeout(() => {
    opcoesBox.querySelector('.chip')?.focus();
  }, 0);
}

function fecharSelecao(){
  modal.hidden = true;
}

function adicionarItem(nome, tipo){
  const key = tipo === 'preferidos' ? LS_PREF : LS_REST;
  const arr = getArray(key);
  if(!arr.includes(nome)){
    arr.push(nome);
    setArray(key, arr);
    render();
  }
}

function removerItem(nome, tipo){
  const key = tipo === 'preferidos' ? LS_PREF : LS_REST;
  const arr = getArray(key).filter(n => n !== nome);
  setArray(key, arr);
  render();
}

// garante lista única (case-insensitive) para exibição no modal
function OPÇÕES_SEM_DUP(){
  const seen = new Set();
  const out = [];
  for(const s of OPCOES){
    const k = s.trim().toUpperCase();
    if(!seen.has(k)){
      seen.add(k);
      out.push(k);
    }
  }
  return out;
}

// ===== Eventos =====
btnAddPreferido.addEventListener('click', () => abrirSelecao('preferidos'));
btnAddRestrito .addEventListener('click', () => abrirSelecao('restritos'));
btnFechar.addEventListener('click', fecharSelecao);
modal.addEventListener('click', (e) => {
  if(e.target === modal) fecharSelecao();
});

// ===== Boot =====
(function init(){
  // inicializa chaves se não existirem
  if(!localStorage.getItem(LS_PREF)) setArray(LS_PREF, []);
  if(!localStorage.getItem(LS_REST)) setArray(LS_REST, []);
  render();
})();
