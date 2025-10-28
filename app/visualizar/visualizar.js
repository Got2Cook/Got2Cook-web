// /app/visualizar/visualizar.js

"use strict";

/* ========= UTILITÁRIOS ========= */
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

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
    console.error('Erro ao salvar no localStorage:', e);
  }
}

/* ========= VERIFICAR PLANO ========= */
function isPremium() {
  const status = getLS('got2cook_premium_status', { isPremium: false });
  return status.isPremium === true;
}

/* ========= REFERÊNCIAS DOM ========= */
const elements = {
  titulo: $('#tituloReceita'),
  areaImagem: $('#areaImagem'),
  metaTempo: $('#metaTempo'),
  metaDif: $('#metaDificuldade'),
  metaHumor: $('#metaHumor'),
  textoReceita: $('#textoReceita'),
  listaIng: $('#listaIngredientes'),
  listaPassos: $('#listaPassos'),
  btnMais: $('#btnLerMais'),
  btnSalvar: $('#btnSalvar'),
  btnGerar: $('#btnGerarNovamente'),
  badgePremium: $('#badgePremium'),
  
  // Rodapé
  btnVoltar: $('#btnVoltar'),
  btnLogo: $('#btnLogo'),
  btnGeladeira: $('#btnGeladeira')
};

/* ========= DADOS DA RECEITA ========= */
function getReceitaAtual() {
  const temp = getLS('receita_temp', null);
  if (temp && typeof temp === 'object') return temp;
  
  // Mock para teste
  return {
    id: 'mock_' + Date.now(),
    titulo: 'Arroz Temperado com Carne',
    tempo: '30 min',
    dificuldade: 'Fácil',
    humor: 'Conforto 😊',
    ingredientes: [
      '1 xícara de arroz cru',
      '200g de carne em cubos',
      '1 pimenta fresca picada',
      '2 dentes de alho',
      'Sal a gosto'
    ],
    passos: [
      'Refogue o alho até dourar',
      'Adicione a carne e tempere',
      'Acrescente o arroz e misture bem',
      'Adicione água e deixe cozinhar',
      'Finalize com a pimenta picada'
    ],
    imagem: isPremium() ? '../../assets/receita_exemplo.png' : null
  };
}

/* ========= RENDERIZAR IMAGEM OU PLACEHOLDER ========= */
function renderImagem(receita) {
  if (!elements.areaImagem) return;
  
  elements.areaImagem.innerHTML = '';
  
  if (receita.imagem && isPremium()) {
    // PREMIUM: Mostrar imagem
    const img = document.createElement('img');
    img.src = receita.imagem;
    img.alt = `Imagem da receita ${receita.titulo}`;
    img.onerror = () => {
      // Se erro ao carregar, mostrar placeholder
      renderPlaceholder(receita.titulo);
    };
    elements.areaImagem.appendChild(img);
    
    if (elements.badgePremium) {
      elements.badgePremium.style.display = 'none';
    }
  } else {
    // GRATUITO: Mostrar placeholder com texto
    renderPlaceholder(receita.titulo);
    
    if (elements.badgePremium) {
      elements.badgePremium.style.display = 'block';
    }
  }
}

function renderPlaceholder(titulo) {
  const placeholder = document.createElement('div');
  placeholder.className = 'placeholder-texto';
  
  const emojis = ['🍳', '🥘', '🍲', '🥗', '🍝', '🍕'];
  const emojiAleatorio = emojis[Math.floor(Math.random() * emojis.length)];
  
  placeholder.innerHTML = `
    <span class="emoji-grande">${emojiAleatorio}</span>
    <p><strong>${titulo}</strong></p>
    <p class="subtitulo">Receita gerada com sucesso!</p>
  `;
  
  elements.areaImagem.appendChild(placeholder);
}

/* ========= RENDERIZAR RECEITA ========= */
function renderReceita() {
  const receita = getReceitaAtual();
  
  // Título
  if (elements.titulo) {
    elements.titulo.textContent = receita.titulo || 'RECEITA GERADA';
  }
  
  // Imagem ou Placeholder
  renderImagem(receita);
  
  // Meta informações
  if (elements.metaTempo) {
    elements.metaTempo.textContent = `⏱️ ${receita.tempo || '30 min'}`;
  }
  
  if (elements.metaDif) {
    elements.metaDif.textContent = `Dificuldade ${receita.dificuldade || 'Fácil'}`;
  }
  
  if (elements.metaHumor) {
    const humor = Array.isArray(receita.humores) 
      ? receita.humores.join(', ') 
      : (receita.humor || '—');
    elements.metaHumor.textContent = `Humor ${humor}`;
  }
  
  // Ingredientes
  if (elements.listaIng) {
    elements.listaIng.innerHTML = '';
    const ingredientes = Array.isArray(receita.ingredientes) 
      ? receita.ingredientes 
      : [];
    
    ingredientes.forEach(item => {
      const li = document.createElement('li');
      li.textContent = typeof item === 'string' ? item : (item.nome || item);
      elements.listaIng.appendChild(li);
    });
  }
  
  // Modo de preparo
  if (elements.listaPassos) {
    elements.listaPassos.innerHTML = '';
    const passos = Array.isArray(receita.passos) && receita.passos.length
      ? receita.passos
      : ['Siga as instruções de preparo'];
    
    passos.forEach(passo => {
      const li = document.createElement('li');
      li.textContent = passo;
      elements.listaPassos.appendChild(li);
    });
  }
  
  // Sincronizar botão de favoritar
  sincronizarBotaoSalvar(receita);
  
  // Foco no título
  setTimeout(() => elements.titulo?.focus(), 100);
}

/* ========= SISTEMA DE FAVORITOS ========= */
const KEY_SALVAS = 'got2cook_saved_recipes';

function getReceitasSalvas() {
  const arr = getLS(KEY_SALVAS, []);
  return Array.isArray(arr) ? arr : [];
}

function mesmaReceita(a, b) {
  if (!a || !b) return false;
  if (a.id && b.id) return a.id === b.id;
  
  const normA = (a.titulo || '').trim().toLowerCase();
  const normB = (b.titulo || '').trim().toLowerCase();
  return normA === normB && normA.length > 0;
}

function estaSalva(receita) {
  return getReceitasSalvas().some(r => mesmaReceita(r, receita));
}

function sincronizarBotaoSalvar(receita) {
  if (!elements.btnSalvar) return;
  
  const salva = estaSalva(receita);
  elements.btnSalvar.setAttribute('aria-pressed', salva ? 'true' : 'false');
  
  const coracao = elements.btnSalvar.querySelector('.coracao');
  if (coracao) {
    coracao.textContent = salva ? '♥' : '♡';
  }
}

function toggleSalvar(receita) {
  const receitas = getReceitasSalvas();
  const index = receitas.findIndex(r => mesmaReceita(r, receita));
  
  if (index >= 0) {
    // Remover
    receitas.splice(index, 1);
    setLS(KEY_SALVAS, receitas);
    
    // Atualizar conquistas
    const totalSalvas = receitas.length;
    localStorage.setItem('got2cook_salvas', totalSalvas);
    
    if (window.G2C) {
      window.G2C.setMetrics({ salvas: totalSalvas });
      window.G2C.atualizarGraficos();
    }
    
    console.log('❌ Receita removida! Total:', totalSalvas);
  } else {
    // Salvar
    if (!receita.id) {
      receita.id = 'receita_' + Date.now();
    }
    receita.criadoEm = new Date().toISOString();
    
    receitas.push(receita);
    setLS(KEY_SALVAS, receitas);
    
    // Atualizar conquistas
    const totalSalvas = receitas.length;
    localStorage.setItem('got2cook_salvas', totalSalvas);
    
    if (window.G2C) {
      window.G2C.inc('salvas');
      window.G2C.atualizarGraficos();
    }
    
    console.log('✅ Receita salva! Total:', totalSalvas);
  }
  
  sincronizarBotaoSalvar(receita);
}

/* ========= LER MAIS / MENOS ========= */
function toggleLerMais() {
  if (!elements.textoReceita || !elements.btnMais) return;
  
  const ativo = elements.textoReceita.getAttribute('data-scroll') === 'on';
  
  elements.textoReceita.setAttribute('data-scroll', ativo ? 'off' : 'on');
  elements.btnMais.setAttribute('aria-expanded', ativo ? 'false' : 'true');
  elements.btnMais.textContent = ativo ? 'Ler mais' : 'Ler menos';
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
}

/* ========= EVENTOS ========= */
function setupEventos() {
  const receita = getReceitaAtual();
  
  // Ler mais
  elements.btnMais?.addEventListener('click', toggleLerMais);
  
  // Salvar
  elements.btnSalvar?.addEventListener('click', () => {
    toggleSalvar(receita);
    
    // Feedback visual
    const btn = elements.btnSalvar;
    btn.style.transform = estaSalva(receita) ? 'scale(1.3)' : 'scale(0.8)';
    setTimeout(() => { btn.style.transform = 'scale(1)'; }, 200);
  });
  
  // Gerar novamente
  elements.btnGerar?.addEventListener('click', () => {
    window.location.href = '../gerar/';
  });
}

/* ========= INICIALIZAÇÃO ========= */
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎨 Visualizar Receita - Iniciado');
  console.log('💎 Plano:', isPremium() ? 'PREMIUM' : 'GRATUITO');
  
  renderReceita();
  setupNavegacao();
  setupEventos();
  
  console.log('✅ Tela pronta!');
});
