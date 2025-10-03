// /app/cadastro/cadastro.js
(function() {
  'use strict';

  const STORAGE_KEY = 'got2cook_profiles';
  const CURRENT_PROFILE_KEY = 'got2cook_current_profile_id';
  
  const form = document.getElementById('formCadastro');
  const btnVoltar = document.getElementById('voltarLogin');
  const cepInput = document.getElementById('cep');
  const cidadeInput = document.getElementById('cidade');
  const estadoInput = document.getElementById('estado');
  const senhaInput = document.getElementById('senha');
  const confirmarSenhaInput = document.getElementById('confirmarSenha');
  const senhaRequisitos = document.getElementById('senhaRequisitos');
  const senhaMatch = document.getElementById('senhaMatch');
  const btnSubmit = form.querySelector('.btn-submit');

  let emojiSelecionado = '😊';
  let senhaValida = false;
  let senhasConferem = false;

  // Toast helper
  function showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  // Seletor de emoji
  document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selecionado'));
      btn.classList.add('selecionado');
      emojiSelecionado = btn.dataset.emoji;
    });
  });

  // Validação de senha
  const requisitos = {
    length: (s) => s.length >= 8,
    upper: (s) => /[A-Z]/.test(s),
    lower: (s) => /[a-z]/.test(s),
    number: (s) => /[0-9]/.test(s)
  };

  senhaInput.addEventListener('focus', () => {
    senhaRequisitos.classList.add('ativo');
  });

  senhaInput.addEventListener('blur', () => {
    if (!senhaInput.value) {
      senhaRequisitos.classList.remove('ativo');
    }
  });

  senhaInput.addEventListener('input', () => {
    const senha = senhaInput.value;
    let todosOk = true;

    Object.keys(requisitos).forEach(req => {
      const el = document.querySelector(`[data-req="${req}"]`);
      const ok = requisitos[req](senha);
      el.classList.toggle('ok', ok);
      if (!ok) todosOk = false;
    });

    senhaValida = todosOk;
    senhaInput.classList.toggle('valido', senhaValida);
    senhaInput.classList.toggle('invalido', senha.length > 0 && !senhaValida);
    
    verificarSenhasConferem();
    atualizarBotao();
  });

  // Confirmar senha
  confirmarSenhaInput.addEventListener('input', verificarSenhasConferem);
  confirmarSenhaInput.addEventListener('blur', verificarSenhasConferem);

  function verificarSenhasConferem() {
    const senha = senhaInput.value;
    const confirmar = confirmarSenhaInput.value;

    if (!confirmar) {
      senhaMatch.textContent = '';
      senhaMatch.className = 'senha-match';
      senhasConferem = false;
      confirmarSenhaInput.classList.remove('valido', 'invalido');
      return;
    }

    if (senha === confirmar && senhaValida) {
      senhaMatch.textContent = '✓ As senhas conferem';
      senhaMatch.className = 'senha-match match';
      confirmarSenhaInput.classList.add('valido');
      confirmarSenhaInput.classList.remove('invalido');
      senhasConferem = true;
    } else {
      senhaMatch.textContent = '✗ As senhas não conferem';
      senhaMatch.className = 'senha-match nomatch';
      confirmarSenhaInput.classList.add('invalido');
      confirmarSenhaInput.classList.remove('valido');
      senhasConferem = false;
    }

    atualizarBotao();
  }

  function atualizarBotao() {
    const checkbox = document.getElementById('aceitoPolitica');
    const todosPreenchidos = form.checkValidity();
    
    if (senhaValida && senhasConferem && todosPreenchidos && checkbox.checked) {
      btnSubmit.disabled = false;
    } else {
      btnSubmit.disabled = true;
    }
  }

  // Monitorar checkbox
  document.getElementById('aceitoPolitica').addEventListener('change', atualizarBotao);

  // Monitorar todos os inputs
  form.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', atualizarBotao);
  });

  // Auto-preenche cidade e estado pelo CEP
  cepInput.addEventListener('blur', async () => {
    const cep = cepInput.value.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          cidadeInput.value = data.localidade;
          estadoInput.value = data.uf;
          showToast('CEP encontrado!', 'success');
          atualizarBotao();
        } else {
          showToast('CEP inválido!', 'error');
        }
      } catch {
        showToast('Erro ao buscar o CEP. Tente novamente.', 'error');
      }
    }
  });

  // Submit cadastro
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = senhaInput.value;
    const nascimento = document.getElementById('nascimento').value;
    const cep = cepInput.value;
    const cidade = cidadeInput.value;
    const estado = estadoInput.value;
    const checkbox = document.getElementById('aceitoPolitica');

    if (!checkbox.checked) {
      showToast('Por favor, aceite a Política de Privacidade!', 'warning');
      checkbox.focus();
      return;
    }

    if (!senhaValida) {
      showToast('A senha não atende aos requisitos!', 'error');
      senhaInput.focus();
      return;
    }

    if (!senhasConferem) {
      showToast('As senhas não conferem!', 'error');
      confirmarSenhaInput.focus();
      return;
    }

    if (!nome || !email || !senha || !nascimento || !cep || !cidade || !estado) {
      showToast('Preencha todos os campos!', 'warning');
      return;
    }

    // Verificar se email já existe
    const perfis = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const emailExiste = perfis.some(p => p.email === email);
    
    if (emailExiste) {
      showToast('Este e-mail já está cadastrado!', 'error');
      return;
    }

    const novoPerfil = {
      id: Date.now().toString(),
      nome,
      email,
      senha,
      nascimento,
      cep,
      cidade,
      estado,
      emoji: emojiSelecionado,
      foto: emojiSelecionado,
      plano: 'Gratuito',
      nivel: 'BÁSICO',
      humorAtual: null,
      preferencias: [],
      preferenciasLivres: [],
      preferenciasMarcadas: [],
      preferidos: [],
      restritos: [],
      criadoEm: new Date().toISOString()
    };

    salvarPerfil(novoPerfil);

    // Define este perfil como atual
    localStorage.setItem(CURRENT_PROFILE_KEY, novoPerfil.id);

    showToast(`Conta criada com sucesso! Bem-vindo(a), ${nome}!`, 'success');
    
    setTimeout(() => {
      window.location.href = '../login/index.html';
    }, 1500);
  });

  function salvarPerfil(perfil) {
    try {
      const perfis = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      perfis.push(perfil);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(perfis));
    } catch (e) {
      console.error('Erro ao salvar perfil:', e);
      showToast('Erro ao criar conta. Tente novamente.', 'error');
    }
  }

  // Voltar para login
  btnVoltar.addEventListener('click', () => {
    window.location.href = '../login/index.html';
  });

  // Inicializar estado do botão
  atualizarBotao();

})();
