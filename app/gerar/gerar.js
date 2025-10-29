// /app/gerar/gerar.js

"use strict";

/* ========= UTILITÁRIOS ========= */
const norm = s => (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

function getLS(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Erro ao salvar:', e);
  }
}

/* ========= ESTADO ========= */
let selecionados = [];
let tipoReceita = "";

/* ========= REFERÊNCIAS DOM ========= */
const elements = {
  listaItens: document.getElementById('listaItens'),
  geladeiraGrid: document.getElementById('geladeiraGrid'),
  inputBusca: document.getElementById('inputBusca'),
  contadorItens: document.getElementById('contadorItens'),
  placeholderVazio: document.getElementById('placeholderVazio'),
  btnGerar: document.getElementById('btnGerar'),
  btnFiltros: document.querySelectorAll('.btn-filtro'),
  
  // Rodapé
  btnVoltar: document.getElementById('btnVoltar'),
  btnLogo: document.getElementById('btnLogo'),
  btnGeladeira: document.getElementById('btnGeladeira')
};

/* ========= CARREGAR INGREDIENTES ========= */
function getGeladeira() {
  const chaves = ['got2cook_geladeira', 'geladeira'];
  for (const key of chaves) {
    const data = getLS(key, null);
    if (data && Array.isArray(data)) return data;
  }
  return [];
}

const ingredientes = getGeladeira();

/* ========= RENDERIZAR GELADEIRA ========= */
function renderGeladeira() {
  if (!elements.geladeiraGrid) return;
  
  elements.geladeiraGrid.innerHTML = '';
  
  if (ingredientes.length === 0) {
    elements.geladeiraGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
        <p style="color: var(--verde); opacity: 0.6;">
          Nenhum ingrediente na geladeira. Adicione alguns primeiro!
        </p>
      </div>
    `;
    return;
  }
  
  ingredientes.forEach((item, index) => {
    const nome = item?.nome || item?.name || `Ingrediente ${index + 1}`;
    const url = item?.url || item?.img || item?.imagem || '';
    
    const card = document.createElement('div');
    card.className = 'ingrediente-card';
    card.dataset.nome = nome;
    card.dataset.norm = norm(nome);
    
    card.innerHTML = `
      <img src="${url}" alt="${nome}" onerror="this.style.opacity='0.3'">
      <p class="nome">${nome}</p>
      <div class="check-badge">✓</div>
    `;
    
    card.addEventListener('click', () => toggleIngrediente(card, nome));
    
    elements.geladeiraGrid.appendChild(card);
  });
}

/* ========= TOGGLE INGREDIENTE ========= */
function toggleIngrediente(card, nome) {
  const estaSelecionado = card.classList.contains('selected');
  
  if (estaSelecionado) {
    // Remover
    card.classList.remove('selected');
    selecionados = selecionados.filter(n => n !== nome);
    removerDaLista(nome);
  } else {
    // Adicionar
    card.classList.add('selected');
    selecionados.push(nome);
    adicionarNaLista(nome);
  }
  
  atualizarUI();
}

/* ========= ADICIONAR NA LISTA ========= */
function adicionarNaLista(nome) {
  if (!elements.listaItens) return;
  
  // Esconder placeholder
  if (elements.placeholderVazio) {
    elements.placeholderVazio.style.display = 'none';
  }
  
  const item = document.createElement('div');
  item.className = 'item-lista';
  item.dataset.nome = nome;
  
  item.innerHTML = `
    <span class="check-icon">✓</span>
    <span>${nome}</span>
    <span class="remover">×</span>
  `;
  
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    removerIngrediente(nome);
  });
  
  elements.listaItens.appendChild(item);
}

/* ========= REMOVER DA LISTA ========= */
function removerDaLista(nome) {
  const item = elements.listaItens?.querySelector(`[data-nome="${nome}"]`);
  if (item) {
    item.style.animation = 'none';
    item.style.opacity = '0';
    item.style.transform = 'scale(0.8)';
    setTimeout(() => item.remove(), 200);
  }
  
  // Mostrar placeholder se vazio
  if (selecionados.length === 0 && elements.placeholderVazio) {
    elements.placeholderVazio.style.display = 'flex';
  }
}

/* ========= REMOVER INGREDIENTE ========= */
function removerIngrediente(nome) {
  // Remover da lista
  selecionados = selecionados.filter(n => n !== nome);
  removerDaLista(nome);
  
  // Desmarcar no grid
  const card = elements.geladeiraGrid?.querySelector(`[data-nome="${nome}"]`);
  if (card) {
    card.classList.remove('selected');
  }
  
  atualizarUI();
}

/* ========= ATUALIZAR UI ========= */
function atualizarUI() {
  // Atualizar contador
  if (elements.contadorItens) {
    const count = selecionados.length;
    elements.contadorItens.textContent = `${count} ${count === 1 ? 'item' : 'itens'}`;
  }
  
  // Habilitar/desabilitar botão gerar
  if (elements.btnGerar) {
    const podeGerar = selecionados.length > 0 && tipoReceita !== "";
    elements.btnGerar.disabled = !podeGerar;
  }
}

/* ========= FILTROS ========= */
function setupFiltros() {
  elements.btnFiltros.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remover ativo de todos
      elements.btnFiltros.forEach(b => b.classList.remove('ativo'));
      
      // Ativar clicado
      btn.classList.add('ativo');
      
      // Definir tipo
      tipoReceita = btn.dataset.tipo;
      
      console.log('Tipo selecionado:', tipoReceita);
      
      atualizarUI();
    });
  });
}

/* ========= BUSCA ========= */
function setupBusca() {
  if (!elements.inputBusca || !elements.geladeiraGrid) return;
  
  const aplicarFiltro = () => {
    const query = norm(elements.inputBusca.value);
    const tokens = query.split(/[,\s]+/).filter(Boolean);
    
    const cards = elements.geladeiraGrid.querySelectorAll('.ingrediente-card');
    
    cards.forEach(card => {
      const nomeNorm = card.dataset.norm || "";
      const match = tokens.length === 0 || tokens.every(t => nomeNorm.includes(t));
      
      card.style.display = match ? '' : 'none';
      
      if (match && tokens.length > 0) {
        card.style.animation = 'fadeIn 0.3s ease-out';
      }
    });
  };
  
  elements.inputBusca.addEventListener('input', aplicarFiltro);
}

/* ========= GERAR RECEITA ========= */
function gerarReceita() {
  if (selecionados.length === 0) {
    alert("⚠️ Selecione ao menos um ingrediente!");
    return;
  }
  
  if (!tipoReceita) {
    alert("⚠️ Escolha se a receita é DOCE ou SALGADA!");
    return;
  }
  
  // Criar receita temporária
  const receita = {
    id: 'receita_' + Date.now(),
    titulo: `Receita ${tipoReceita === 'doce' ? 'Doce' : 'Salgada'} Personalizada`,
    tempo: '30 min',
    dificuldade: 'Fácil',
    humor: 'Personalizado',
    ingredientes: selecionados,
    passos: [
      'Separe todos os ingredientes',
      'Prepare os ingredientes conforme necessário',
      'Combine os ingredientes na ordem adequada',
      'Finalize o preparo e sirva'
    ],
    tipo: tipoReceita,
    tempoMinutos: 30,
    imagem: null,
    criadoEm: new Date().toISOString()
  };
  
  // Salvar no localStorage
  setLS('receita_temp', receita);
  
  // ATUALIZAR CONQUISTAS
  if (window.G2C) {
    // Total e criadas
    window.G2C.inc('total');
    window.G2C.inc('criadas');
    
    // Improviso (≤3 ingredientes)
    if (receita.ingredientes.length <= 3) {
      window.G2C.inc('improviso');
    }
    
    // Rápidas (<10 min) - placeholder para quando tiver tempo real
    if (receita.tempoMinutos < 10) {
      window.G2C.inc('rapidas');
    }
    
    // Noturnas (00:00-05:00)
    const hora = new Date().getHours();
    if (hora >= 0 && hora < 5) {
      window.G2C.inc('noturnas');
    }
    
    // Atualizar gráficos
    window.G2C.atualizarGraficos();
    
    console.log('✅ Conquistas atualizadas!');
  }
  
  console.log('📝 Receita gerada:', receita);
  
  // Navegar para visualização
  window.location.href = '../visualizar/index.html';
}

/* ========= NAVEGAÇÃO ========= */
function setupNavegacao() {
  elements.btnVoltar?.addEventListener('click', () => {
    window.location.href = '../humor/index.html';
  });
  
  elements.btnLogo?.addEventListener('click', () => {
    window.location.href = '../home/index.html';
  });
  
  elements.btnGeladeira?.addEventListener('click', () => {
    window.location.href = '../geladeira/index.html';
  });
  
  elements.btnGerar?.addEventListener('click', gerarReceita);
}

/* ========= INICIALIZAÇÃO ========= */
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎨 Gerar Receita - Iniciado');
  
  renderGeladeira();
  setupFiltros();
  setupBusca();
  setupNavegacao();
  atualizarUI();
  
  console.log('✅ Tela pronta!');
  console.log('📦 Ingredientes disponíveis:', ingredientes.length);
});
