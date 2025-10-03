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
      
      return `
        <div class="perfil-item" data-id="${perfil.id}">
          <div class="perfil-foto">
            ${foto}
            ${perfil.humorAtual ? `<div class="perfil-emoji-badge">${perfil.humorAtual}</div>` : ''}
          </div>
          <div class="perfil-nome">${perfil.nome}</div>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.perfil-item').forEach(el => {
      el.addEventListener('click', () => {
        const perfilId = el.dataset.id;
        selecionarPerfil(perfilId);
      });
    });
  }

  function selecionarPerfil(perfilId) {
    localStorage.setItem(CURRENT_PROFILE_KEY, perfilId);
    window.location.href = '../humor/index.html';
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

    const email = e.target.querySelector('input[type="email"]').value;
    const senha = e.target.querySelector('input[type="password"]').value;

    // Buscar perfil por email e senha
    const perfis = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const perfil = perfis.find(p => p.email === email && p.senha === senha);

    if (perfil) {
      selecionarPerfil(perfil.id);
    } else {
      alert('❌ E-mail ou senha incorretos!');
    }
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
      alert('Funcionalidade de login social em desenvolvimento');
    });
  });

  carregarPerfis();

})();
