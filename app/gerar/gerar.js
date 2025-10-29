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
  listaLinhas: document.getElementById('listaLinhas'),
  geladeiraGrid: document.getElementById('geladeiraGrid'),
  inputBusca: document.getElementById('inputBusca'),
  contadorItens: document.getElementById('contadorItens'),
  btnGerar: document.getElementById('btnGerar'),
  btnFiltros: document.querySelectorAll('.btn-filtro'),
  
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
      <div style="grid-column: 1/-1; text-align: center; padding: 32px;">
        <p style="color: var(--verde); opacity: 0.6; font-size: 14px;">
          Nenhum ingrediente na geladeira
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
    card.classList.remove('selected');
    selecionados = selecionados.filter(n => n !== nome);
    removerDaLista(nome);
  } else {
    card.classList.add('selected');
    selecionados.push(nome);
    adicionarNaLista(nome);
  }
  
  atualizarUI();
}

/* ========= ADICIONAR NA LISTA (SISTEMA DE 3 LINHAS) ========= */
function adicionarNaLista(nome) {
  if (!elements.listaLinhas) return;
  
  const linhas = elements.listaLinhas.querySelectorAll('.linha-lista');
  
  // Encontrar a linha com menos itens (max 3 por linha)
  let linhaAlvo = null;
  let menorQtd = Infinity;
  
  linhas.forEach(linha => {
    const qtd = linha.querySelectorAll('.item-ingrediente').length;
    if (qtd < 3 && qtd < menorQtd) {
      menorQtd = qtd;
      linhaAlvo = linha;
    }
  });
  
  // Se todas as 3 linhas estão cheias, usar a primeira
  if (!linhaAlvo) {
    linhaAlvo = linhas[0];
  }
  
  const item = document.createElement('div');
  item.className = 'item-ingrediente';
  item.dataset.nome = nome;
  
  item.innerHTML = `
    <span>${nome}</span>
    <span class="remover">×</span>
  `;
  
  item.addEventListener('click', (e) => {
    e.stopPropagation();
    removerIngrediente(nome);
  });
  
  linhaAlvo.appendChild(item);
}

/* ========= REMOVER DA LISTA ========= */
function removerDaLista(nome) {
  const item = elements.listaLinhas?.querySelector(`[data-nome="${nome}"]`);
  if (item) {
    item.style.animation = 'none';
    item.style.opacity = '0';
    item.style.transform = 'scale(0.7)';
    setTimeout(() => item.remove(), 150);
  }
}

/* ========= REMOVER INGREDIENTE ========= */
function removerIngrediente(nome) {
  selecionados = selecionados.filter(n => n !== nome);
  removerDaLista(nome);
  
  const card = elements.geladeiraGrid?.querySelector(`[data-nome="${nome}"]`);
  if (card) {
    card.classList.remove('selected');
  }
  
  atualizarUI();
}

/* ========= ATUALIZAR UI ========= */
function atualizarUI() {
  if (elements.contadorItens) {
    const count = selecionados.length;
    elements.contadorItens.textContent = `${count} ${count === 1 ? 'item' : 'itens'}`;
  }
  
  if (elements.btnGerar) {
    const podeGerar = selecionados.length > 0 && tipoReceita !== "";
    elements.btnGerar.disabled = !podeGerar;
  }
}

/* ========= FILTROS ========= */
function setupFiltros() {
  elements.btnFiltros.forEach(btn => {
    btn.addEventListener('click', () => {
      elements.btnFiltros.forEach(b => b.classList.remove('ativo'));
      btn.classList.add('ativo');
      tipoReceita = btn.dataset.tipo;
      console.log('🎯 Tipo selecionado:', tipoReceita);
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
    });
  };
  
  elements.inputBusca.addEventListener('input', aplicarFiltro);
}

/* ========= DETECTAR CARACTERÍSTICAS DA RECEITA ========= */
function analisarReceita(receita) {
  const analise = {
    ehRapida: false,
    ehImproviso: false,
    ehSaudavel: false,
    ehInternacional: false,
    ehNoturna: false
  };
  
  // 1. RECEITA RÁPIDA (tempo < 10 min)
  if (receita.tempoMinutos < 10) {
    analise.ehRapida = true;
  }
  
  // 2. CHEF DO IMPROVISO (≤ 3 ingredientes)
  if (receita.ingredientes.length <= 3) {
    analise.ehImproviso = true;
  }
  
  // 3. SAUDÁVEL (detectar palavras-chave)
  const ingredientesTexto = receita.ingredientes.join(' ').toLowerCase();
  const palavrasSaudaveis = [
    'integral', 'light', 'diet', 'aveia', 'quinoa', 'chia',
    'salada', 'vegetal', 'verdura', 'legume', 'frutas',
    'natural', 'orgânico', 'sem açúcar', 'sem gordura'
  ];
  
  analise.ehSaudavel = palavrasSaudaveis.some(palavra => 
    ingredientesTexto.includes(palavra)
  );
  
  // 4. INTERNACIONAL (detectar ingredientes/pratos típicos)
  const palavrasInternacionais = [
    'sushi', 'yakisoba', 'curry', 'paella', 'risoto',
    'pasta', 'pizza', 'spaghetti', 'macarrão italiano',
    'wasabi', 'shoyu', 'gengibre', 'açafrão', 'páprica',
    'molho inglês', 'molho de soja', 'molho agridoce'
  ];
  
  const tituloTexto = receita.titulo.toLowerCase();
  analise.ehInternacional = palavrasInternacionais.some(palavra =>
    ingredientesTexto.includes(palavra) || tituloTexto.includes(palavra)
  );
  
  // 5. AGENTE NOTURNO (entre 00:00 e 05:00)
  const hora = new Date().getHours();
  if (hora >= 0 && hora < 5) {
    analise.ehNoturna = true;
  }
  
  return analise;
}

/* ========= ATUALIZAR CONQUISTAS ========= */
function atualizarConquistas(receita, analise) {
  console.log('🏆 Atualizando conquistas...');
  console.log('📊 Análise da receita:', analise);
  
  // Verificar se o sistema G2C está disponível
  if (!window.G2C) {
    console.warn('⚠️ Sistema de conquistas (G2C) não disponível');
    console.log('💡 As métricas serão salvas no localStorage para sincronização futura');
  }
  
  // ===== CONQUISTA 1: PRIMEIRA MORDIDA (total de receitas) =====
  const totalAtual = Number(localStorage.getItem('got2cook_total_receitas') || 0);
  const novoTotal = totalAtual + 1;
  localStorage.setItem('got2cook_total_receitas', novoTotal);
  
  if (window.G2C) {
    window.G2C.inc('total');
  }
  console.log('✅ Total de receitas:', novoTotal);
  
  // ===== CONQUISTA 1 (continuação): CRIADAS =====
  const criadasAtual = Number(localStorage.getItem('got2cook_receitas_criadas') || 0);
  localStorage.setItem('got2cook_receitas_criadas', criadasAtual + 1);
  
  if (window.G2C) {
    window.G2C.inc('criadas');
  }
  console.log('✅ Receitas criadas:', criadasAtual + 1);
  
  // ===== CONQUISTA 3: RECEITA RELÂMPAGO (<10 min) =====
  if (analise.ehRapida) {
    const rapidasAtual = Number(localStorage.getItem('got2cook_rapidas') || 0);
    localStorage.setItem('got2cook_rapidas', rapidasAtual + 1);
    
    if (window.G2C) {
      window.G2C.inc('rapidas');
    }
    console.log('⚡ Receita rápida! Total:', rapidasAtual + 1);
  }
  
  // ===== CONQUISTA 4: CHEF DO IMPROVISO (≤3 ingredientes) =====
  if (analise.ehImproviso) {
    const improvisoAtual = Number(localStorage.getItem('got2cook_improviso') || 0);
    localStorage.setItem('got2cook_improviso', improvisoAtual + 1);
    
    if (window.G2C) {
      window.G2C.inc('improviso');
    }
    console.log('🎨 Chef do improviso! Total:', improvisoAtual + 1);
  }
  
  // ===== CONQUISTA 6: INTERNACIONAL =====
  if (analise.ehInternacional) {
    const cozinhasAtual = Number(localStorage.getItem('got2cook_cozinhas') || 0);
    localStorage.setItem('got2cook_cozinhas', cozinhasAtual + 1);
    
    if (window.G2C) {
      window.G2C.inc('cozinhas');
    }
    console.log('🌍 Receita internacional! Total:', cozinhasAtual + 1);
  }
  
  // ===== CONQUISTA 7: SAUDÁVEL =====
  if (analise.ehSaudavel) {
    const saudaveisAtual = Number(localStorage.getItem('got2cook_saudaveis') || 0);
    localStorage.setItem('got2cook_saudaveis', saudaveisAtual + 1);
    
    if (window.G2C) {
      window.G2C.inc('saudaveis');
    }
    console.log('🥗 Receita saudável! Total:', saudaveisAtual + 1);
  }
  
  // ===== CONQUISTA 8: AGENTE NOTURNO (00:00-05:00) =====
  if (analise.ehNoturna) {
    const noturnasAtual = Number(localStorage.getItem('got2cook_noturnas') || 0);
    localStorage.setItem('got2cook_noturnas', noturnasAtual + 1);
    
    if (window.G2C) {
      window.G2C.inc('noturnas');
    }
    console.log('🌙 Agente noturno! Total:', noturnasAtual + 1);
  }
  
  // ===== ATUALIZAR GRÁFICOS =====
  if (window.G2C && typeof window.G2C.atualizarGraficos === 'function') {
    window.G2C.atualizarGraficos();
    console.log('📊 Gráficos atualizados!');
  }
  
  console.log('🎉 Conquistas atualizadas com sucesso!');
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
  
  // Criar receita
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
      'Cozinhe em fogo médio por alguns minutos',
      'Finalize o preparo e sirva'
    ],
    tipo: tipoReceita,
    tempoMinutos: 30, // Padrão 30 min (ajustar quando tiver input de tempo)
    imagem: null,
    criadoEm: new Date().toISOString()
  };
  
  // Salvar receita temporária
  setLS('receita_temp', receita);
  
  // Analisar características da receita
  const analise = analisarReceita(receita);
  
  // Atualizar conquistas
  atualizarConquistas(receita, analise);
  
  // Exibir resumo no console
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📝 RECEITA GERADA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏷️  Título:', receita.titulo);
  console.log('🍽️  Tipo:', tipoReceita);
  console.log('🥘 Ingredientes:', selecionados.length);
  console.log('⏱️  Tempo:', receita.tempo);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏆 CONQUISTAS DESBLOQUEADAS:');
  if (analise.ehRapida) console.log('  ⚡ Receita Relâmpago');
  if (analise.ehImproviso) console.log('  🎨 Chef do Improviso');
  if (analise.ehSaudavel) console.log('  🥗 Saudável');
  if (analise.ehInternacional) console.log('  🌍 Internacional');
  if (analise.ehNoturna) console.log('  🌙 Agente Noturno');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
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
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎨 GOT2COOK - GERAR RECEITA');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  renderGeladeira();
  setupFiltros();
  setupBusca();
  setupNavegacao();
  atualizarUI();
  
  console.log('✅ Tela pronta!');
  console.log('📦 Ingredientes disponíveis:', ingredientes.length);
  console.log('🏆 Sistema de conquistas:', window.G2C ? 'CONECTADO' : 'OFFLINE (será sincronizado)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});
