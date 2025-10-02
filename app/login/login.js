// /app/login/login.js
(function() {
  'use strict';

  const STORAGE_KEY = 'got2cook_profiles';
  
  const perfisGrid = document.getElementById('perfisGrid');
  const btnAddPerfil = document.getElementById('btnAddPerfil');
  const modalPerfis = document.getElementById('modalPerfis');
  const formPerfil = document.getElementById('formPerfil');
  const formLogin = document.getElementById('formLogin');

  let emojiSelecionado = '😊';

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
      perfisGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#999;font-size:14px;">Nenhum perfil salvo</p>';
      return;
    }

    perfisGrid.innerHTML = perfis.map((perfil, idx) => `
      <div class="perfil-round" data-idx="${idx}">
        <div class="perfil-emoji">${perfil.emoji}</div>
        <div class="perfil-nome">${perfil.nome}</div>
      </div>
    `).join('');

    document.querySelectorAll('.perfil-round').forEach(el => {
      el.addEventListener('click', () => {
        const perfil = perfis[el.dataset.idx];
        // Salvar perfil atual e redirecionar para perfil/dados pessoais
        localStorage.setItem('got2cook_current_profile', JSON.stringify(perfil));
        window.location.href = '../perfil/index.html';
      });
    });
  }

  // Abrir modal adicionar
  btnAddPerfil.addEventListener('click', () => {
    abrirModal(modalPerfis);
  });

  // Seletor de emoji
  document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selecionado'));
      btn.classList.add('selecionado');
      emojiSelecionado = btn.dataset.emoji;
    });
  });

  // Submit form criar perfil
  formPerfil.addEventListener('submit', (e) => {
    e.preventDefault();
    const nome = e.target.querySelector('input').value.trim();
    
    if (!nome) return;

    const perfil = {
      id: Date.now(),
      nome,
      emoji: emojiSelecionado
    };

    salvarPerfil(perfil);
    fecharModal(modalPerfis);
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

  // Form login com e-mail/senha
  formLogin.addEventListener('submit', (e) => {
    e.preventDefault();
    const checkbox = document.getElementById('aceitoPolitica');
    
    if (!checkbox.checked) {
      alert('Por favor, aceite a Política de Privacidade para continuar.');
      checkbox.focus();
      return;
    }

    // TODO: Implementar autenticação real
    window.location.href = '../humor/index.html';
  });

  // Login social
  document.querySelectorAll('.btn-social').forEach(btn => {
    btn.addEventListener('click', () => {
      const checkbox = document.getElementById('aceitoPolitica');
      
      if (!checkbox.checked) {
        alert('Por favor, aceite a Política de Privacidade para continuar.');
        checkbox.focus();
        return;
      }
      
      // TODO: Implementar OAuth
      window.location.href = '../humor/index.html';
    });
  });

  // Link cadastro
  document.getElementById('linkCadastro').addEventListener('click', (e) => {
    e.preventDefault();
    alert('Funcionalidade de cadastro em desenvolvimento');
  });

  // Modal helpers
  function abrirModal(modal) {
    modal.classList.add('ativo');
  }

  function fecharModal(modal) {
    modal.classList.remove('ativo');
  }

  document.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', () => fecharModal(modalPerfis));
  });

  document.querySelector('.modal-backdrop')?.addEventListener('click', () => {
    fecharModal(modalPerfis);
  });

  carregarPerfis();

})();
