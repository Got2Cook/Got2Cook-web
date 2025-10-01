// /app/login/login.js
(function() {
  'use strict';

  const STORAGE_KEY = 'got2cook_profiles';
  
  // Elements
  const perfisGrid = document.getElementById('perfisGrid');
  const btnAddPerfil = document.getElementById('btnAddPerfil');
  const modalPerfis = document.getElementById('modalPerfis');
  const modalCriar = document.getElementById('modalCriar');
  const perfisGaleria = document.getElementById('perfisGaleria');
  const btnCriarPerfil = document.getElementById('btnCriarPerfil');
  const formPerfil = document.getElementById('formPerfil');

  // Perfis exemplo
  const perfisDisponiveis = [
    { emoji: '😊', nome: 'Feliz' },
    { emoji: '🥰', nome: 'Apaixonado' },
    { emoji: '😋', nome: 'Com Fome' },
    { emoji: '😎', nome: 'Confiante' },
    { emoji: '🤗', nome: 'Carinhoso' },
    { emoji: '😇', nome: 'Tranquilo' },
    { emoji: '😴', nome: 'Cansado' },
    { emoji: '🤩', nome: 'Animado' }
  ];

  // Carregar perfis salvos
  function carregarPerfis() {
    try {
      const perfis = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      renderizarPerfis(perfis);
    } catch (e) {
      console.error('Erro ao carregar perfis:', e);
      renderizarPerfis([]);
    }
  }

  // Renderizar perfis na grid
  function renderizarPerfis(perfis) {
    if (perfis.length === 0) {
      perfisGrid.innerHTML = '<p style="text-align:center;color:#999;grid-column:1/-1;padding:20px 0;">Nenhum perfil salvo ainda</p>';
      return;
    }

    perfisGrid.innerHTML = perfis.map((perfil, idx) => `
      <div class="perfil-item" data-idx="${idx}">
        <div class="perfil-emoji">${perfil.emoji}</div>
        <div class="perfil-nome">${perfil.nome}</div>
      </div>
    `).join('');

    // Event listeners
    document.querySelectorAll('.perfil-item').forEach(item => {
      item.addEventListener('click', () => {
        const idx = item.dataset.idx;
        const perfil = perfis[idx];
        selecionarPerfil(perfil);
      });
    });
  }

  // Selecionar perfil e continuar
  function selecionarPerfil(perfil) {
    localStorage.setItem('got2cook_current_profile', JSON.stringify(perfil));
    // Redirecionar para tela de humor
    window.location.href = '../humor/index.html';
  }

  // Abrir modal de perfis
  btnAddPerfil.addEventListener('click', () => {
    renderizarGaleria();
    abrirModal(modalPerfis);
  });

  // Renderizar galeria
  function renderizarGaleria() {
    perfisGaleria.innerHTML = perfisDisponiveis.map(perfil => `
      <div class="perfil-item" data-emoji="${perfil.emoji}" data-nome="${perfil.nome}">
        <div class="perfil-emoji">${perfil.emoji}</div>
        <div class="perfil-nome">${perfil.nome}</div>
      </div>
    `).join('');

    perfisGaleria.querySelectorAll('.perfil-item').forEach(item => {
      item.addEventListener('click', () => {
        const perfil = {
          emoji: item.dataset.emoji,
          nome: item.dataset.nome,
          id: Date.now()
        };
        salvarPerfil(perfil);
        fecharModal(modalPerfis);
      });
    });
  }

  // Abrir modal criar perfil
  btnCriarPerfil.addEventListener('click', () => {
    fecharModal(modalPerfis);
    abrirModal(modalCriar);
  });

  // Seletor de emoji
  const emojiBtns = document.querySelectorAll('.emoji-btn');
  let emojiSelecionado = '😊';

  emojiBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      emojiBtns.forEach(b => b.classList.remove('selecionado'));
      btn.classList.add('selecionado');
      emojiSelecionado = btn.dataset.emoji;
    });
  });

  // Submit form
  formPerfil.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = e.target.querySelector('input[type="text"]').value.trim();
    
    if (!nome) return;

    const perfil = {
      id: Date.now(),
      nome,
      emoji: emojiSelecionado
    };

    salvarPerfil(perfil);
    fecharModal(modalCriar);
    formPerfil.reset();
  });

  // Salvar perfil
  function salvarPerfil(perfil) {
    try {
      const perfis = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      perfis.push(perfil);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(perfis));
      carregarPerfis();
    } catch (e) {
      console.error('Erro ao salvar perfil:', e);
    }
  }

  // Modal helpers
  function abrirModal(modal) {
    modal.classList.add('ativo');
    modal.setAttribute('aria-hidden', 'false');
  }

  function fecharModal(modal) {
    modal.classList.remove('ativo');
    modal.setAttribute('aria-hidden', 'true');
  }

  // Fechar modais ao clicar no backdrop ou botão fechar
  document.querySelectorAll('[data-close="true"]').forEach(el => {
    el.addEventListener('click', (e) => {
      const modal = e.target.closest('.modal');
      if (modal) fecharModal(modal);
    });
  });

  // Login social (placeholder)
  document.querySelectorAll('.btn-social').forEach(btn => {
    btn.addEventListener('click', () => {
      const tipo = btn.classList.contains('btn-google') ? 'Google' :
                   btn.classList.contains('btn-apple') ? 'Apple' : 'E-mail';
      
      // TODO: Implementar autenticação real
      console.log('Login com:', tipo);
      
      // Por enquanto, redirecionar direto
      window.location.href = '../humor/index.html';
    });
  });

  // Link cadastro
  document.getElementById('linkCadastro').addEventListener('click', (e) => {
    e.preventDefault();
    // TODO: Abrir modal/página de cadastro
    alert('Funcionalidade de cadastro em desenvolvimento');
  });

  // Inicializar
  carregarPerfis();

})();
