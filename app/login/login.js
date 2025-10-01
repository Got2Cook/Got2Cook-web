// /app/login/login.js
(function() {
  'use strict';

  const STORAGE_KEY = 'got2cook_profiles';
  
  const perfisList = document.getElementById('perfisList');
  const btnAddPerfil = document.getElementById('btnAddPerfil');
  const modalPerfis = document.getElementById('modalPerfis');
  const modalCriar = document.getElementById('modalCriar');
  const perfisGrid = document.getElementById('perfisGrid');
  const btnCriarNovo = document.getElementById('btnCriarNovo');
  const formPerfil = document.getElementById('formPerfil');

  let emojiSelecionado = '😊';

  // Perfis disponíveis
  const perfisDisponiveis = [
    { emoji: '😊', nome: 'Feliz' },
    { emoji: '🥰', nome: 'Apaixonado' },
    { emoji: '😋', nome: 'Faminto' },
    { emoji: '😎', nome: 'Confiante' },
    { emoji: '🤗', nome: 'Carinhoso' },
    { emoji: '😇', nome: 'Tranquilo' }
  ];

  // Carregar perfis
  function carregarPerfis() {
    try {
      const perfis = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      renderizarPerfis(perfis);
    } catch (e) {
      renderizarPerfis([]);
    }
  }

  function renderizarPerfis(perfis) {
    if (perfis.length === 0) {
      perfisList.innerHTML = '<p style="color:#999;font-size:13px;">Nenhum perfil salvo</p>';
      return;
    }

    perfisList.innerHTML = perfis.map((perfil, idx) => `
      <div class="perfil-badge" data-idx="${idx}">
        <span class="perfil-badge-emoji">${perfil.emoji}</span>
        <span class="perfil-badge-nome">${perfil.nome}</span>
      </div>
    `).join('');

    document.querySelectorAll('.perfil-badge').forEach(badge => {
      badge.addEventListener('click', () => {
        const perfil = perfis[badge.dataset.idx];
        localStorage.setItem('got2cook_current_profile', JSON.stringify(perfil));
        window.location.href = '../humor/index.html';
      });
    });
  }

  // Abrir modal perfis
  btnAddPerfil.addEventListener('click', () => {
    renderizarGaleria();
    abrirModal(modalPerfis);
  });

  function renderizarGaleria() {
    perfisGrid.innerHTML = perfisDisponiveis.map(perfil => `
      <div class="perfil-card" data-emoji="${perfil.emoji}" data-nome="${perfil.nome}">
        <div class="perfil-card-emoji">${perfil.emoji}</div>
        <div class="perfil-card-nome">${perfil.nome}</div>
      </div>
    `).join('');

    perfisGrid.querySelectorAll('.perfil-card').forEach(card => {
      card.addEventListener('click', () => {
        salvarPerfil({
          id: Date.now(),
          emoji: card.dataset.emoji,
          nome: card.dataset.nome
        });
        fecharModal(modalPerfis);
      });
    });
  }

  // Criar perfil customizado
  btnCriarNovo.addEventListener('click', () => {
    fecharModal(modalPerfis);
    abrirModal(modalCriar);
  });

  // Seletor de emoji
  document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selecionado'));
      btn.classList.add('selecionado');
      emojiSelecionado = btn.dataset.emoji;
    });
  });

  // Submit form
  formPerfil.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = e.target.querySelector('input').value.trim();
    
    if (!nome) return;

    salvarPerfil({
      id: Date.now(),
      nome,
      emoji: emojiSelecionado
    });

    fecharModal(modalCriar);
    formPerfil.reset();
  });

  function salvarPerfil(perfil) {
    try {
      const perfis = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      perfis.push(perfil);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(perfis));
      carregarPerfis();
    } catch (e) {
      console.error('Erro ao salvar:', e);
    }
  }

  // Modal helpers
  function abrirModal(modal) {
    modal.classList.add('ativo');
  }

  function fecharModal(modal) {
    modal.classList.remove('ativo');
  }

  document.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', () => {
      fecharModal(modalPerfis);
      fecharModal(modalCriar);
    });
  });

  document.querySelectorAll('.modal-backdrop').forEach(backdrop => {
    backdrop.addEventListener('click', () => {
      fecharModal(modalPerfis);
      fecharModal(modalCriar);
    });
  });

  // Login social
  document.querySelectorAll('.btn-social').forEach(btn => {
    btn.addEventListener('click', () => {
      window.location.href = '../humor/index.html';
    });
  });

  // Link cadastro
  document.getElementById('linkCadastro').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Funcionalidade de cadastro em desenvolvimento');
  });

  carregarPerfis();

})();
