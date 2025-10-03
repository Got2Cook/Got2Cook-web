// /app/login/login.js
(function() {
  'use strict';

  const STORAGE_KEY = 'got2cook_profiles';
  const CURRENT_PROFILE_KEY = 'got2cook_current_profile_id';
  
  const perfisGrid = document.getElementById('perfisGrid');
  const formLogin = document.getElementById('formLogin');
  const modalExcluir = document.getElementById('modalExcluir');
  const formExcluir = document.getElementById('formExcluir');
  const senhaExcluir = document.getElementById('senhaExcluir');
  const nomePerfilExcluir = document.getElementById('nomePerfilExcluir');

  let perfilParaExcluir = null;

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
        <div class="perfil-item">
          <div class="perfil-foto" data-id="${perfil.id}">
            ${foto}
            ${perfil.humorAtual ? `<div class="perfil-emoji-badge">${perfil.humorAtual}</div>` : ''}
          </div>
          <div class="perfil-nome">${perfil.nome}</div>
          <button class="btn-remover-perfil" data-id="${perfil.id}" aria-label="Remover ${perfil.nome} do dispositivo">×</button>
        </div>
      `;
    }).join('');

    // Clicar no perfil para entrar
    document.querySelectorAll('.perfil-foto').forEach(el => {
      el.addEventListener('click', () => {
        const perfilId = el.dataset.id;
        selecionarPerfil(perfilId);
      });
    });

    // Clicar no X para remover
    document.querySelectorAll('.btn-remover-perfil').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const perfilId = btn.dataset.id;
        const perfil = perfis.find(p => p.id === perfilId);
        if (perfil) {
          abrirModalExcluir(perfil);
        }
      });
    });
  }

  function selecionarPerfil(perfilId) {
    localStorage.setItem(CURRENT_PROFILE_KEY, perfilId);
    window.location.href = '../humor/index.html';
  }

  // Modal de exclusão
  function abrirModalExcluir(perfil) {
    perfilParaExcluir = perfil;
    nomePerfilExcluir.textContent = perfil.nome;
    senhaExcluir.value = '';
    modalExcluir.classList.add('ativo');
    setTimeout(() => senhaExcluir.focus(), 100);
  }

  function fecharModalExcluir() {
    modalExcluir.classList.remove('ativo');
    perfilParaExcluir = null;
    senhaExcluir.value = '';
  }

  // Form exclusão
  formExcluir.addEventListener('submit', (e) => {
    e.preventDefault();
    
    if (!perfilParaExcluir) return;

    const senha = senhaExcluir.value;

    if (senha !== perfilParaExcluir.senha) {
      alert('❌ Senha incorreta!');
      senhaExcluir.value = '';
      senhaExcluir.focus();
      return;
    }

    // Remover perfil do localStorage
    try {
      const perfis = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const novosPerfis = perfis.filter(p => p.id !== perfilParaExcluir.id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(novosPerfis));

      // Se era o perfil atual, limpar
      const perfilAtualId = localStorage.getItem(CURRENT_PROFILE_KEY);
      if (perfilAtualId === perfilParaExcluir.id) {
        localStorage.removeItem(CURRENT_PROFILE_KEY);
      }

      alert(`✅ Perfil "${perfilParaExcluir.nome}" removido deste dispositivo!`);
      fecharModalExcluir();
      carregarPerfis();
    } catch (e) {
      console.error('Erro ao remover perfil:', e);
      alert('❌ Erro ao remover perfil. Tente novamente.');
    }
  });

  // Fechar modal
  document.querySelectorAll('[data-close]').forEach(el => {
    el.addEventListener('click', fecharModalExcluir);
  });

  document.querySelector('.modal-backdrop')?.addEventListener('click', fecharModalExcluir);

  document.addEventListener('keydown', (e) => {
    if (modalExcluir.classList.contains('ativo') && e.key === 'Escape') {
      fecharModalExcluir();
    }
  });

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
      
      alert('Funcionalidade de login social em desenvolvimento');
    });
  });

  carregarPerfis();

})();
