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

  let emojiSelecionado = '😊';

  // Seletor de emoji
  document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selecionado'));
      btn.classList.add('selecionado');
      emojiSelecionado = btn.dataset.emoji;
    });
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
        } else {
          alert('❌ CEP inválido!');
        }
      } catch {
        alert('⚠️ Erro ao buscar o CEP. Tente novamente.');
      }
    }
  });

  // Submit cadastro
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value.trim();
    const email = document.getElementById('email').value.trim();
    const senha = document.getElementById('senha').value;
    const nascimento = document.getElementById('nascimento').value;
    const cep = cepInput.value;
    const cidade = cidadeInput.value;
    const estado = estadoInput.value;

    if (!nome || !email || !senha || !nascimento || !cep || !cidade || !estado) {
      alert('⚠️ Preencha todos os campos!');
      return;
    }

    // Verificar se email já existe
    const perfis = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const emailExiste = perfis.some(p => p.email === email);
    
    if (emailExiste) {
      alert('❌ Este e-mail já está cadastrado!');
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
      preferidos: [],
      restritos: [],
      criadoEm: new Date().toISOString()
    };

    salvarPerfil(novoPerfil);

    // Define este perfil como atual
    localStorage.setItem(CURRENT_PROFILE_KEY, novoPerfil.id);

    alert(`✅ Conta criada com sucesso!\nBem-vindo(a), ${nome}!`);
    window.location.href = '../login/index.html';
  });

  function salvarPerfil(perfil) {
    try {
      const perfis = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
      perfis.push(perfil);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(perfis));
    } catch (e) {
      console.error('Erro ao salvar perfil:', e);
      alert('❌ Erro ao criar conta. Tente novamente.');
    }
  }

  // Voltar para login
  btnVoltar.addEventListener('click', () => {
    window.location.href = '../login/index.html';
  });

})();
