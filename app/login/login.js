// /app/login/login.js
(function() {
  'use strict';

  const STORAGE_KEY = 'got2cook_profiles';
  const CURRENT_PROFILE_KEY = 'got2cook_current_profile_id';
  
  const perfisGrid = document.getElementById('perfisGrid');
  const formLogin = document.getElementById('formLogin');

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
      perfisGrid.innerHTML = '';
      return;
    }

    perfisGrid.innerHTML = perfis.map(perfil => {
      const foto = perfil.foto || perfil.emoji || '😊';
      const nivel = perfil.nivel || 'BÁSICO';
      
      return `
        <div class="perfil-card" data-id="${perfil.id}">
          <div class="perfil-foto">
            ${foto}
            ${perfil.humorAtual ? `<div class="perfil-emoji-badge">${perfil.humorAtual}</div>` : ''}
          </div>
          <div class="perfil-nome">${perfil.nome}</div>
          <div class="perfil-info">Nível ${nivel}</div>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.perfil-card').forEach(el => {
      el.addEventListener('click', () => {
        const perfilId = el.dataset.id;
        localStorage.setItem(CURRENT_PROFILE_KEY, perfilId);
        window.location.href = '../humor/index.html';
      });
    });
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

  carregarPerfis();

})();
