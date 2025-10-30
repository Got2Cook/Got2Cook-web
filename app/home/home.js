// /app/home/home.js

(function () {
  'use strict';

  // ========== Constantes e configuração ==========
  const TYPING_SPEED = 50; // ms por caractere
  const HUMOR_EMOJIS = {
    feliz: '😊',
    triste: '😢',
    animado: '🤩',
    calmo: '😌',
    estressado: '😤',
    entediado: '😐',
    default: '🍽️'
  };

  // Receitas de fallback (stub para quando API não estiver disponível)
  const RECEITAS_FALLBACK = [
    {
      id: 'rec1',
      titulo: 'Panqueca de Banana',
      imagem: '../../assets/receita1.png',
      tempoMin: 15,
      humor: ['feliz', 'animado']
    },
    {
      id: 'rec2',
      titulo: 'Sopa Reconfortante',
      imagem: '../../assets/receita2.png',
      tempoMin: 30,
      humor: ['triste', 'calmo']
    },
    {
      id: 'rec3',
      titulo: 'Salada Energética',
      imagem: '../../assets/receita3.png',
      tempoMin: 10,
      humor: ['animado', 'feliz']
    },
    {
      id: 'rec4',
      titulo: 'Bolo de Chocolate',
      imagem: '../../assets/receita4.png',
      tempoMin: 45,
      humor: ['feliz', 'estressado']
    },
    {
      id: 'rec5',
      titulo: 'Smoothie Tropical',
      imagem: '../../assets/receita1.png',
      tempoMin: 5,
      humor: ['animado', 'calmo']
    },
    {
      id: 'rec6',
      titulo: 'Pizza Caseira',
      imagem: '../../assets/receita2.png',
      tempoMin: 60,
      humor: ['feliz', 'entediado']
    }
  ];

  // ========== Helpers do localStorage ==========
  const storage = {
    get(key, fallback = null) {
      try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    }
  };

  // ========== Obter dados do perfil atual ==========
  function obterPerfilAtual() {
    const profileId = storage.get('got2cook_current_profile_id');
    if (!profileId) return null;

    const profiles = storage.get('got2cook_profiles', []);
    return profiles.find(p => p.id === profileId) || null;
  }

  // ========== Obter nome do usuário (com fallback) ==========
  function obterNomeUsuario() {
    // 1. Tenta pegar do perfil atual
    const perfil = obterPerfilAtual();
    if (perfil?.nome) return perfil.nome;

    // 2. Tenta pegar de dados pessoais (se cadastrado separadamente)
    const dadosPessoais = storage.get('got2cook_dados_pessoais');
    if (dadosPessoais?.nome) return dadosPessoais.nome;

    // 3. Fallback antigo
    const nomeAntigo = storage.get('got2cook_nome');
    if (nomeAntigo) return nomeAntigo;

    // 4. Default
    return 'Usuário';
  }

  // ========== Obter humor atual ==========
  function obterHumorAtual() {
    return storage.get('got2cook_mood_current', 'feliz');
  }

  // ========== Efeito de digitação no balão ==========
  function animarDigitacao(elemento, texto, callback) {
    let index = 0;
    elemento.textContent = '';
    
    const cursor = document.querySelector('.cursor-digitacao');
    if (cursor) cursor.style.display = 'inline';

    const interval = setInterval(() => {
      if (index < texto.length) {
        elemento.textContent += texto[index];
        index++;
      } else {
        clearInterval(interval);
        if (cursor) {
          setTimeout(() => {
            cursor.style.display = 'none';
          }, 1000);
        }
        if (callback) callback();
      }
    }, TYPING_SPEED);
  }

  // ========== Atualizar saudação ==========
  function atualizarSaudacao() {
    const nome = obterNomeUsuario();
    const textoFala = document.getElementById('textoFala');
    const perfilNome = document.getElementById('perfil-nome');
    
    const mensagem = `Olá, ${nome}! O que vamos cozinhar hoje?`;
    
    if (textoFala) {
      animarDigitacao(textoFala, mensagem);
    }
    
    if (perfilNome) {
      perfilNome.textContent = nome;
    }

    // Atualizar foto do perfil no menu
    const perfil = obterPerfilAtual();
    const perfilFotoMenu = document.getElementById('perfilFotoMenu');
    const perfilBtn = document.querySelector('#perfilBtn');
    
    if (perfil?.foto) {
      if (perfilFotoMenu) perfilFotoMenu.src = perfil.foto;
      if (perfilBtn) perfilBtn.src = perfil.foto;
    }
  }

  // ========== Buscar receitas (com stub para API futura) ==========
  async function buscarReceitas(humor) {
    // TODO: Quando a API estiver pronta, descomentar e usar:
    /*
    try {
      const response = await fetch('/api/recipes/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ humor })
      });
      
      if (!response.ok) throw new Error('Erro ao buscar receitas');
      
      const data = await response.json();
      return data.recipes || [];
    } catch (error) {
      console.error('Erro ao buscar receitas da API:', error);
      return filtrarReceitasPorHumor(humor);
    }
    */

    // Por enquanto, usar fallback local
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(filtrarReceitasPorHumor(humor));
      }, 800); // Simula delay de rede
    });
  }

  // ========== Filtrar receitas por humor (fallback) ==========
  function filtrarReceitasPorHumor(humor) {
    const receitasFiltradas = RECEITAS_FALLBACK.filter(
      receita => receita.humor.includes(humor)
    );

    // Se não houver receitas para o humor específico, retorna todas
    return receitasFiltradas.length > 0 
      ? receitasFiltradas.slice(0, 4)
      : RECEITAS_FALLBACK.slice(0, 4);
  }

  // ========== Renderizar card de receita ==========
  function criarCardReceita(receita) {
    const card = document.createElement('a');
    card.href = `../visualizar-receita/index.html?id=${receita.id}`;
    card.className = 'card';
    card.role = 'listitem';
    
    card.innerHTML = `
      <img 
        src="${receita.imagem}" 
        alt="${receita.titulo}" 
        class="card-img"
        loading="lazy"
      />
      <div class="card-info">
        <h3 class="card-titulo">${receita.titulo}</h3>
        <div class="card-tempo">⏱️ ${receita.tempoMin} min</div>
      </div>
    `;
    
    return card;
  }

  // ========== Renderizar sugestões ==========
  async function renderizarSugestoes() {
    const grid = document.getElementById('sugestoesGrid');
    const emptyState = document.getElementById('emptyState');
    const emojiHumor = document.getElementById('emojiHumor');
    
    if (!grid) return;

    const humor = obterHumorAtual();
    
    // Atualizar emoji do humor
    if (emojiHumor) {
      emojiHumor.textContent = HUMOR_EMOJIS[humor] || HUMOR_EMOJIS.default;
    }

    try {
      // Buscar receitas
      const receitas = await buscarReceitas(humor);

      // Limpar grid
      grid.innerHTML = '';

      if (receitas.length === 0) {
        // Mostrar estado vazio
        if (emptyState) emptyState.classList.remove('hidden');
      } else {
        // Esconder estado vazio e renderizar cards
        if (emptyState) emptyState.classList.add('hidden');
        
        receitas.forEach((receita, index) => {
          const card = criarCardReceita(receita);
          card.style.animation = `fadeInUp 0.6s ease-out ${0.1 * index}s both`;
          grid.appendChild(card);
        });
      }
    } catch (error) {
      console.error('Erro ao renderizar sugestões:', error);
      grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--roxo);">Erro ao carregar receitas. Tente novamente.</p>';
    }
  }

  // ========== Recarregar sugestões ==========
  function recarregarSugestoes() {
    const btnRecarregar = document.getElementById('btnRecarregar');
    const grid = document.getElementById('sugestoesGrid');
    
    if (btnRecarregar) {
      btnRecarregar.disabled = true;
      btnRecarregar.style.opacity = '0.5';
    }

    // Mostrar skeleton
    if (grid) {
      grid.innerHTML = `
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
      `;
    }

    // Recarregar após um delay
    setTimeout(() => {
      renderizarSugestoes().then(() => {
        if (btnRecarregar) {
          btnRecarregar.disabled = false;
          btnRecarregar.style.opacity = '1';
        }
      });
    }, 600);
  }

  // ========== Menus (toggle) ==========
  function setupMenus() {
    const perfilBtn = document.getElementById('perfilBtn');
    const perfilMenu = document.getElementById('perfilMenu');
    const menuBtn = document.getElementById('menuBtn');
    const menuPrincipal = document.getElementById('menuPrincipal');

    if (perfilBtn && perfilMenu) {
      perfilBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        perfilMenu.classList.toggle('hidden');
        if (menuPrincipal) menuPrincipal.classList.add('hidden');
      });
    }

    if (menuBtn && menuPrincipal) {
      menuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        menuPrincipal.classList.toggle('hidden');
        if (perfilMenu) perfilMenu.classList.add('hidden');
      });
    }

    // Fechar ao clicar fora
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.menu-perfil') && !e.target.closest('#perfilBtn')) {
        if (perfilMenu) perfilMenu.classList.add('hidden');
      }
      if (!e.target.closest('.menu-principal') && !e.target.closest('#menuBtn')) {
        if (menuPrincipal) menuPrincipal.classList.add('hidden');
      }
    });
  }

  // ========== Rodapé: navegação ==========
  function setupRodape() {
    const btnVoltar = document.getElementById('btnVoltar');
    const btnGeladeira = document.getElementById('btnGeladeira');
    const btnLogo = document.getElementById('btnLogo');
    const atalhos = document.getElementById('atalhosRapidos');

    if (btnVoltar) {
      btnVoltar.addEventListener('click', () => {
        window.location.href = '../humor/index.html';
      });
    }

    if (btnGeladeira) {
      btnGeladeira.addEventListener('click', () => {
        window.location.href = '../geladeira/index.html';
      });
    }

    if (btnLogo && atalhos) {
      btnLogo.addEventListener('click', () => {
        atalhos.classList.toggle('mostrar');
      });
    }
  }

  // ========== Inicialização ==========
  function init() {
    atualizarSaudacao();
    renderizarSugestoes();
    setupMenus();
    setupRodape();

    // Event listener para recarregar
    const btnRecarregar = document.getElementById('btnRecarregar');
    if (btnRecarregar) {
      btnRecarregar.addEventListener('click', recarregarSugestoes);
    }
  }

  // Executar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
