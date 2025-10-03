// /app/perfil/perfil.js
(function() {
  'use strict';

  // ===== Chaves =====
  const STORAGE_KEY = 'got2cook_profiles';
  const CURRENT_PROFILE_KEY = 'got2cook_current_profile_id';
  const LS_HUMOR = 'got2cook_humor';

  let perfilAtual = null;

  // ===== Refs =====
  const fotoPerfil = document.getElementById('fotoPerfil');
  const inputFoto = document.getElementById('inputFoto');
  const btnAlterarFoto = document.getElementById('btnAlterarFoto');

  const campoNome = document.getElementById('campoNome');
  const campoEmail = document.getElementById('campoEmail');
  const btnEditarNome = document.getElementById('btnEditarNome');
  const btnEditarEmail = document.getElementById('btnEditarEmail');

  const preferenciasWrap = document.getElementById('preferencias');
  const inputPref = document.getElementById('preferenciaNova');
  const btnAddPref = document.getElementById('btnAddPreferencia');
  const listaPrefs = document.getElementById('preferenciasLista');

  const nivelBtns = Array.from(document.querySelectorAll('.nivel-btn'));

  const btnVoltar = document.getElementById('btnVoltar');
  const btnLogo = document.getElementById('btnLogo');
  const btnGeladeira = document.getElementById('btnGeladeira');

  const modal = document.getElementById('editorModal');
  const editorInput = document.getElementById('editorInput');
  const editorSalvar = document.getElementById('editorSalvar');
  const editorCancelar = document.getElementById('editorCancelar');
  const editorTitulo = document.getElementById('editorTitulo');

  let editingKey = null;
  let returnFocusEl = null;

  // ===== Storage helpers =====
  function getPerfilAtual() {
    try {
      const perfilId = localStorage.getItem(CURRENT_PROFILE_KEY);
      if (!perfilId) {
        alert('Nenhum perfil selecionado');
        window.location.href = '../login/index.html';
        return null;
      }

      const perfis = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const perfil = perfis.find(p => p.id === perfilId);

      if (!perfil) {
        alert('Perfil não encontrado');
        window.location.href = '../login/index.html';
        return null;
      }

      return perfil;
    } catch (e) {
      console.error('Erro ao carregar perfil:', e);
      return null;
    }
  }

  function salvarPerfil(partial) {
    try {
      const perfilId = localStorage.getItem(CURRENT_PROFILE_KEY);
      const perfis = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const index = perfis.findIndex(p => p.id === perfilId);

      if (index !== -1) {
        perfis[index] = { ...perfis[index], ...partial, atualizadoEm: new Date().toISOString() };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(perfis));
        perfilAtual = perfis[index];
        return perfis[index];
      }
    } catch (e) {
      console.error('Erro ao salvar perfil:', e);
    }
  }

  // ===== Render =====
  function renderPreferencias(persistidas = [], marcadas = []) {
    // livres
    listaPrefs.innerHTML = '';
    persistidas.forEach((p, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<span>${p}</span><button class="remover" data-idx="${i}" aria-label="Remover ${p}">×</button>`;
      listaPrefs.appendChild(li);
    });

    // marcadas (checkboxes base)
    const setMarc = new Set(marcadas);
    document.querySelectorAll('.tag-checkbox').forEach(cb => cb.checked = setMarc.has(cb.value));
  }

  function renderNivel(nivel) {
    nivelBtns.forEach(btn => {
      const active = btn.dataset.nivel === nivel;
      btn.classList.toggle('selecionado', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function renderAll() {
    perfilAtual = getPerfilAtual();
    if (!perfilAtual) return;

    // foto
    if (perfilAtual.foto) {
      if (perfilAtual.foto.startsWith('data:')) {
        fotoPerfil.src = perfilAtual.foto;
      } else {
        fotoPerfil.textContent = perfilAtual.foto;
      }
    }

    // humor (prioriza storage global ou do perfil)
    const humor = localStorage.getItem(LS_HUMOR) || perfilAtual.humorAtual || perfilAtual.emoji || '😀';
    const emojiHumor = document.getElementById('emojiHumor');
    if (emojiHumor) emojiHumor.textContent = humor;

    // campos
    campoNome.textContent = perfilAtual.nome || 'Usuário';
    campoEmail.textContent = perfilAtual.email || 'email@exemplo.com';

    // preferências
    renderPreferencias(
      perfilAtual.preferenciasLivres || perfilAtual.preferencias || [],
      perfilAtual.preferenciasMarcadas || []
    );

    // nível
    renderNivel(perfilAtual.nivel || 'BÁSICO');
  }

  // ===== Modal (mini-widget) =====
  function openEditor(label, valorAtual, key, sourceEl) {
    editorTitulo.textContent = label;
    editorInput.value = valorAtual || '';
    modal.setAttribute('aria-hidden', 'false');
    editingKey = key;
    returnFocusEl = sourceEl;
    setTimeout(() => editorInput.focus(), 0);
  }

  function closeEditor() {
    modal.setAttribute('aria-hidden', 'true');
    editingKey = null;
    if (returnFocusEl) returnFocusEl.focus();
  }

  editorCancelar.addEventListener('click', closeEditor);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeEditor(); });
  document.addEventListener('keydown', (e) => {
    if (modal.getAttribute('aria-hidden') === 'false' && e.key === 'Escape') closeEditor();
  });

  editorSalvar.addEventListener('click', () => {
    const val = editorInput.value.trim();
    if (!editingKey) return closeEditor();
    
    if (editingKey === 'nome') {
      campoNome.textContent = val || campoNome.textContent;
      salvarPerfil({ nome: val });
    }
    if (editingKey === 'email') {
      // Verificar se email já existe em outro perfil
      const perfis = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      const emailExiste = perfis.some(p => p.id !== perfilAtual.id && p.email === val);
      
      if (emailExiste) {
        alert('❌ Este e-mail já está sendo usado por outro perfil!');
        return;
      }
      
      campoEmail.textContent = val || campoEmail.textContent;
      salvarPerfil({ email: val });
    }
    closeEditor();
  });

  // ===== Eventos =====
  // Foto
  if (btnAlterarFoto) {
    btnAlterarFoto.addEventListener('click', () => inputFoto.click());
  }
  
  if (inputFoto) {
    inputFoto.addEventListener('change', () => {
      const f = inputFoto.files?.[0];
      if (!f) return;
      const r = new FileReader();
      r.onload = (e) => {
        fotoPerfil.src = e.target.result;
        salvarPerfil({ foto: e.target.result });
      };
      r.readAsDataURL(f);
    });
  }

  // Abrir modal para editar nome/e-mail
  if (btnEditarNome) {
    btnEditarNome.addEventListener('click', () => openEditor('Editar nome', campoNome.textContent, 'nome', btnEditarNome));
    btnEditarNome.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btnEditarNome.click(); }
    });
  }

  if (btnEditarEmail) {
    btnEditarEmail.addEventListener('click', () => openEditor('Editar e-mail', campoEmail.textContent, 'email', btnEditarEmail));
    btnEditarEmail.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btnEditarEmail.click(); }
    });
  }

  // Preferências marcadas
  if (preferenciasWrap) {
    preferenciasWrap.addEventListener('change', () => {
      const marcadas = Array.from(document.querySelectorAll('.tag-checkbox:checked')).map(cb => cb.value);
      salvarPerfil({ preferenciasMarcadas: marcadas });
    });
  }

  // Preferências livres
  if (btnAddPref) {
    btnAddPref.addEventListener('click', () => {
      const val = (inputPref.value || '').trim();
      if (!val) return;
      
      const livre = Array.isArray(perfilAtual.preferenciasLivres) 
        ? perfilAtual.preferenciasLivres.slice() 
        : (Array.isArray(perfilAtual.preferencias) ? perfilAtual.preferencias.slice() : []);
      
      livre.push(val);
      salvarPerfil({ preferenciasLivres: livre, preferencias: livre });
      inputPref.value = '';
      renderPreferencias(livre, perfilAtual.preferenciasMarcadas || []);
    });
  }

  if (inputPref) {
    inputPref.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); btnAddPref.click(); }
    });
  }

  if (listaPrefs) {
    listaPrefs.addEventListener('click', (e) => {
      const rm = e.target.closest('button.remover');
      if (!rm) return;
      const idx = Number(rm.dataset.idx);
      
      const livre = (perfilAtual.preferenciasLivres || perfilAtual.preferencias || []).slice();
      livre.splice(idx, 1);
      salvarPerfil({ preferenciasLivres: livre, preferencias: livre });
      renderPreferencias(livre, perfilAtual.preferenciasMarcadas || []);
    });
  }

  // Nível culinário
  nivelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const nivel = btn.dataset.nivel;
      salvarPerfil({ nivel });
      renderNivel(nivel);
    });
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); }
    });
  });

  // Rodapé (links padrão)
  if (btnVoltar) btnVoltar.addEventListener('click', () => { window.location.href = '../humor/index.html'; });
  if (btnLogo) btnLogo.addEventListener('click', () => { window.location.href = '../home/index.html'; });
  if (btnGeladeira) btnGeladeira.addEventListener('click', () => { window.location.href = '../geladeira/index.html'; });

  // Boot
  document.addEventListener('DOMContentLoaded', renderAll);

})();
