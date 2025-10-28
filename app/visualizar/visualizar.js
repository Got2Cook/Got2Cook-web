// /app/visualizar/visualizar.js

"use strict";

/* ========= UTILITÁRIOS ========= */
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

/* ========= DADOS DA RECEITA ========= */
function getReceitaAtual() {
  const temp = getLS('receita_temp', null);
  if (temp && typeof temp === 'object') return temp;
  
  // Mock para teste
  return {
    id: 'mock_' + Date.now(),
    titulo: 'Arroz Temperado com Carne e Pimenta',
    tempo: '30 min',
    dificuldade: 'Fácil',
    humor: 'Conforto 😊',
    ingredientes: [
      '1 xícara de arroz cru',
      '200g de carne em cubos ou desfiada',
      '1 pimenta fresca picada (dedo-de-moça)',
      '2 dentes de alho amassados',
      '1 cebola média picada',
      'Sal e pimenta-do-reino a gosto',
      '2 colheres de óleo'
    ],
    passos: [
      'Aqueça o óleo em uma panela e refogue o alho até dourar',
      'Adicione a cebola e deixe murchar',
      'Acrescente a carne e tempere com sal e pimenta',
      'Refogue até a carne ficar dourada',
      'Adicione o arroz e misture bem',
      'Acrescente água (2 xícaras) e deixe cozinhar',
      'Quando o arroz estiver quase pronto, adicione a pimenta picada',
      'Finalize e sirva quente'
    ],
    imagem: isPremium() ? '../../assets/receita_exemplo.png' : null
  };
}

/* ========= RENDERIZAR LAYOUT ========= */
function renderLayout() {
  const receita = getReceitaAtual();
  const wrapper = document.getElementById('wrapperReceita');
  
  if (!wrapper) return;
  
  const premium = isPremium() && receita.imagem;
  
  if (premium) {
    // LAYOUT PREMIUM: Grid com imagem
    wrapper.className = 'layout-premium';
    wrapper.innerHTML = `
      ${renderImagem(receita)}
      ${renderConteudoTexto(receita)}
    `;
  } else {
    // LAYOUT GRATUITO: Apenas texto centralizado
    wrapper.className = 'layout-gratuito';
    wrapper.innerHTML = renderConteudoTexto(receita, true);
  }
  
  setupEventos(receita);
}

/* ========= RENDERIZAR IMAGEM ========= */
function renderImagem(receita) {
  return `
    <figure class="imagem-receita">
      <img 
        src="${receita.imagem || '../../assets/receita_exemplo.png'}" 
        alt="Imagem da receita ${receita.titulo}"
        onerror="this.src='../../assets/receita_exemplo.png'"
      />
    </figure>
  `;
}

/* ========= RENDERIZAR CONTEÚDO DE TEXTO ========= */
function renderConteudoTexto(receita, mostrarBadge = false) {
  const ingredientes = Array.isArray(receita.ingredientes) ? receita.ingredientes : [];
  const passos = Array.isArray(receita.passos) && receita.passos.length 
    ? receita.passos 
    : ['Siga as instruções de preparo'];
  
  const humor = Array.isArray(receita.humores) 
    ? receita.humores.join(', ') 
    : (receita.humor || '—');
  
  return `
    <div class="conteudo-texto">
      <h1 class="titulo-receita">${receita.titulo || 'RECEITA GERADA'}</h1>
      
      <div class="meta-info">
        <span class="chip">⏱️ ${receita.tempo || '30 min'}</span>
        <span class="chip">📊 ${receita.dificuldade || 'Fácil'}</span>
        <span class="chip">😊 ${humor}</span>
      </div>
      
      <div class="card-receita">
        <section class="secao">
          <h2 class="secao-titulo">
            <span class="emoji">🥣</span>
            Ingredientes
          </h2>
          <ul class="lista-items">
            ${ingredientes.map(ing => `
              <li>${typeof ing === 'string' ? ing : (ing.nome || ing)}</li>
            `).join('')}
          </ul>
        </section>
        
        <section class="secao">
          <h2 class="secao-titulo">
            <span class="emoji">🍳</span>
            Modo de Preparo
          </h2>
          <ol class="lista-items passos">
            ${passos.map(passo => `<li>${passo}</li>`).join('')}
          </ol>
        </section>
      </div>
      
      <div class="acoes">
        <button id="btnSalvar" class="btn-coracao" type="button" aria-pressed="false" aria-label="Salvar receita">
          <span class="coracao">♡</span>
        </button>
        <button id="btnGerarNovamente" class="btn-gerar" type="button">
          🔄 Gerar Novamente
        </button>
      </div>
      
      ${mostrarBadge ? `
        <div class="badge-premium">
          <h3 class="badge-premium-titulo">
            <span class="icone">🖼️</span>
            Desbloqueie Imagens das Receitas
          </h3>
          <p class="badge-premium-texto">
            Com o <strong>Plano Premium</strong>, todas as suas receitas ganham fotos incríveis que vão te inspirar ainda mais na cozinha!
          </p>
          <a href="../gerenciar-plano/" class="btn-premium">
            ✨ Assinar Premium
          </a>
        </div>
      ` : ''}
    </div>
  `;
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
  const btn = document.getElementById('btnSalvar');
  if (!btn) return;
  
  const salva = estaSalva(receita);
  btn.setAttribute('aria-pressed', salva ? 'true' : 'false');
  
  const coracao = btn.querySelector('.coracao');
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

/* ========= SETUP DE EVENTOS ========= */
function setupEventos(receita) {
  // Salvar receita
  const btnSalvar = document.getElementById('btnSalvar');
  if (btnSalvar) {
    sincronizarBotaoSalvar(receita);
    
    btnSalvar.addEventListener('click', () => {
      toggleSalvar(receita);
    });
  }
  
  // Gerar novamente
  const btnGerar = document.getElementById('btnGerarNovamente');
  if (btnGerar) {
    btnGerar.addEventListener('click', () => {
      window.location.href = '../gerar/';
    });
  }
  
  // Navegação do rodapé
  const btnVoltar = document.getElementById('btnVoltar');
  const btnLogo = document.getElementById('btnLogo');
  const btnGeladeira = document.getElementById('btnGeladeira');
  
  btnVoltar?.addEventListener('click', () => {
    window.location.href = '../humor/index.html';
  });
  
  btnLogo?.addEventListener('click', () => {
    window.location.href = '../home/index.html';
  });
  
  btnGeladeira?.addEventListener('click', () => {
    window.location.href = '../geladeira/index.html';
  });
}

/* ========= INICIALIZAÇÃO ========= */
document.addEventListener('DOMContentLoaded', () => {
  console.log('🎨 Visualizar Receita - Iniciado');
  console.log('💎 Plano:', isPremium() ? 'PREMIUM ✨' : 'GRATUITO');
  
  renderLayout();
  
  console.log('✅ Tela renderizada com sucesso!');
});
