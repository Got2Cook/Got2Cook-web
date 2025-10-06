// /app/cadastro/cadastro.js
(function() {
  'use strict';

  const STORAGE_KEY = 'got2cook_profiles';
  const CURRENT_PROFILE_KEY = 'got2cook_current_profile_id';
  
  const form = document.getElementById('formCadastro');
  const btnVoltar = document.getElementById('voltarLogin');
  
  const nomeInput = document.getElementById('nome');
  const emailInput = document.getElementById('email');
  const senhaInput = document.getElementById('senha');
  const confirmarSenhaInput = document.getElementById('confirmarSenha');
  const nascimentoInput = document.getElementById('nascimento');
  const cepInput = document.getElementById('cep');
  const cidadeInput = document.getElementById('cidade');
  const estadoInput = document.getElementById('estado');
  const checkboxPolitica = document.getElementById('aceitoPolitica');

  const erros = {
    nome: document.getElementById('erroNome'),
    email: document.getElementById('erroEmail'),
    senha: document.getElementById('erroSenha'),
    confirmarSenha: document.getElementById('erroConfirmarSenha'),
    nascimento: document.getElementById('erroNascimento'),
    cep: document.getElementById('erroCep'),
    politica: document.getElementById('erroPolitica')
  };

  const senhaRequisitos = document.getElementById('senhaRequisitos');
  const btnSubmit = form.querySelector('.btn-submit');

  let emojiSelecionado = '😊';
  let validacoes = {
    nome: false,
    email: false,
    senha: false,
    confirmarSenha: false,
    nascimento: false,
    cep: false,
    politica: false
  };

  function showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.className = `toast show ${type}`;
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function atualizarLabels() {
    document.querySelectorAll('.input').forEach(input => {
      if (input.value) {
        input.classList.add('has-value');
      }
      
      input.addEventListener('input', () => {
        if (input.value) {
          input.classList.add('has-value');
        } else {
          input.classList.remove('has-value');
        }
      });

      input.addEventListener('change', () => {
        if (input.value) {
          input.classList.add('has-value');
        } else {
          input.classList.remove('has-value');
        }
      });
    });
  }

  document.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.emoji-btn').forEach(b => b.classList.remove('selecionado'));
      btn.classList.add('selecionado');
      emojiSelecionado = btn.dataset.emoji;
    });
  });

  nomeInput.addEventListener('input', () => {
    const nome = nomeInput.value.trim();
    if (!nome) {
      erros.nome.textContent = 'Nome é obrigatório';
      nomeInput.classList.add('invalido');
      nomeInput.classList.remove('valido');
      validacoes.nome = false;
    } else if (nome.length < 3) {
      erros.nome.textContent = 'Nome deve ter pelo menos 3 caracteres';
      nomeInput.classList.add('invalido');
      nomeInput.classList.remove('valido');
      validacoes.nome = false;
    } else {
      erros.nome.textContent = '';
      nomeInput.classList.remove('invalido');
      nomeInput.classList.add('valido');
      validacoes.nome = true;
    }
    atualizarBotao();
  });

  nomeInput.addEventListener('blur', () => {
    if (!nomeInput.value.trim()) {
      erros.nome.textContent = 'Nome é obrigatório';
      nomeInput.classList.add('invalido');
    }
  });

  emailInput.addEventListener('input', () => {
    const email = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!email) {
      erros.email.textContent = 'E-mail é obrigatório';
      emailInput.classList.add('invalido');
      emailInput.classList.remove('valido');
      validacoes.email = false;
    } else if (!emailRegex.test(email)) {
      erros.email.textContent = 'Insira um e-mail válido';
      emailInput.classList.add('invalido');
      emailInput.classList.remove('valido');
      validacoes.email = false;
    } else {
      erros.email.textContent = '';
      emailInput.classList.remove('invalido');
      emailInput.classList.add('valido');
      validacoes.email = true;
    }
    atualizarBotao();
  });

  emailInput.addEventListener('blur', () => {
    if (!emailInput.value.trim()) {
      erros.email.textContent = 'E-mail é obrigatório';
      emailInput.classList.add('invalido');
    }
  });

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
      erros.senha.textContent = 'Senha é obrigatória';
      senhaInput.classList.add('invalido');
    }
  });

  senhaInput.addEventListener('input', () => {
    const senha = senhaInput.value;
    let todosOk = true;

    if (!senha) {
      erros.senha.textContent = 'Senha é obrigatória';
      senhaInput.classList.add('invalido');
      senhaInput.classList.remove('valido');
      validacoes.senha = false;
      atualizarBotao();
      return;
    }

    Object.keys(requisitos).forEach(req => {
      const el = document.querySelector(`[data-req="${req}"]`);
      const ok = requisitos[req](senha);
      el.classList.toggle('ok', ok);
      if (!ok) todosOk = false;
    });

    validacoes.senha = todosOk;
    
    if (todosOk) {
      erros.senha.textContent = '';
      senhaInput.classList.remove('invalido');
      senhaInput.classList.add('valido');
    } else {
      erros.senha.textContent = 'A senha não atende aos requisitos';
      senhaInput.classList.add('invalido');
      senhaInput.classList.remove('valido');
    }
    
    verificarSenhasConferem();
    atualizarBotao();
  });

  confirmarSenhaInput.addEventListener('input', verificarSenhasConferem);
  confirmarSenhaInput.addEventListener('blur', () => {
    if (!confirmarSenhaInput.value) {
      erros.confirmarSenha.textContent = 'Confirmação de senha é obrigatória';
      confirmarSenhaInput.classList.add('invalido');
    }
  });

  function verificarSenhasConferem() {
    const senha = senhaInput.value;
    const confirmar = confirmarSenhaInput.value;

    if (!confirmar) {
      erros.confirmarSenha.textContent = '';
      confirmarSenhaInput.classList.remove('valido', 'invalido');
      validacoes.confirmarSenha = false;
      atualizarBotao();
      return;
    }

    if (senha === confirmar && validacoes.senha) {
      erros.confirmarSenha.textContent = '';
      confirmarSenhaInput.classList.add('valido');
      confirmarSenhaInput.classList.remove('invalido');
      validacoes.confirmarSenha = true;
    } else {
      erros.confirmarSenha.textContent = 'As senhas não conferem';
      confirmarSenhaInput.classList.add('invalido');
      confirmarSenhaInput.classList.remove('valido');
      validacoes.confirmarSenha = false;
    }

    atualizarBotao();
  }

  nascimentoInput.addEventListener('change', () => {
    const data = new Date(nascimentoInput.value);
    const hoje = new Date();
    const idade = hoje.getFullYear() - data.getFullYear();
    const mesAtual = hoje.getMonth();
    const mesNasc = data.getMonth();
    const idadeReal = mesAtual < mesNasc || (mesAtual === mesNasc && hoje.getDate() < data.getDate()) 
      ? idade - 1 
      : idade;

    if (!nascimentoInput.value) {
      erros.nascimento.textContent = 'Data de nascimento é obrigatória';
      nascimentoInput.classList.add('invalido');
      nascimentoInput.classList.remove('valido');
      validacoes.nascimento = false;
    } else if (data > hoje) {
      erros.nascimento.textContent = 'Data não pode ser futura';
      nascimentoInput.classList.add('invalido');
      nascimentoInput.classList.remove('valido');
      validacoes.nascimento = false;
    } else if (idadeReal < 13) {
      erros.nascimento.textContent = 'Você deve ter pelo menos 13 anos';
      nascimentoInput.classList.add('invalido');
      nascimentoInput.classList.remove('valido');
      validacoes.nascimento = false;
    } else if (idadeReal > 120) {
      erros.nascimento.textContent = 'Data inválida';
      nascimentoInput.classList.add('invalido');
      nascimentoInput.classList.remove('valido');
      validacoes.nascimento = false;
    } else {
      erros.nascimento.textContent = '';
      nascimentoInput.classList.remove('invalido');
      nascimentoInput.classList.add('valido');
      validacoes.nascimento = true;
    }
    atualizarBotao();
  });

  cepInput.addEventListener('input', (e) => {
    let valor = e.target.value.replace(/\D/g, '');
    if (valor.length > 5) {
      valor = valor.substring(0, 5) + '-' + valor.substring(5, 8);
    }
    e.target.value = valor;
  });

  cepInput.addEventListener('blur', async () => {
    const cep = cepInput.value.replace(/\D/g, '');
    
    if (!cep) {
      erros.cep.textContent = 'CEP é obrigatório';
      cepInput.classList.add('invalido');
      validacoes.cep = false;
      atualizarBotao();
      return;
    }

    if (cep.length !== 8) {
      erros.cep.textContent = 'CEP deve ter 8 dígitos';
      cepInput.classList.add('invalido');
      cepInput.classList.remove('valido');
      validacoes.cep = false;
      atualizarBotao();
      return;
    }

    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      
      if (!data.erro) {
        cidadeInput.value = data.localidade;
        estadoInput.value = data.uf;
        cidadeInput.classList.add('has-value');
        estadoInput.classList.add('has-value');
        erros.cep.textContent = '';
        cepInput.classList.remove('invalido');
        cepInput.classList.add('valido');
        validacoes.cep = true;
        showToast('CEP encontrado!', 'success');
      } else {
        erros.cep.textContent = 'CEP não encontrado';
        cepInput.classList.add('invalido');
        cepInput.classList.remove('valido');
        validacoes.cep = false;
      }
    } catch {
      erros.cep.textContent = 'Erro ao buscar CEP';
      cepInput.classList.add('invalido');
      cepInput.classList.remove('valido');
      validacoes.cep = false;
    }
    atualizarBotao();
  });

  checkboxPolitica.addEventListener('change', () => {
    if (checkboxPolitica.checked) {
      erros.politica.textContent = '';
      validacoes.politica = true;
    } else {
      erros.politica.textContent = 'Você deve aceitar a Política de Privacidade';
      validacoes.politica = false;
    }
    atualizarBotao();
  });

  function atualizarBotao() {
    const todasValidas = Object.values(validacoes).every(v => v === true);
    btnSubmit.disabled = !todasValidas;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = nomeInput.value.trim();
    const email = emailInput.value.trim();
    const senha = senhaInput.value;
    const nascimento = nascimentoInput.value;
    const cep = cepInput.value;
    const cidade = cidadeInput.value;
    const estado = estadoInput.value;

    const perfis = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    const emailExiste = perfis.some(p => p.email === email);
    
    if (emailExiste) {
      showToast('Este e-mail já está cadastrado!', 'error');
      emailInput.classList.add('invalido');
      erros.email.textContent = 'Este e-mail já está cadastrado';
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

  btnVoltar.addEventListener('click', () => {
    window.location.href = '../login/index.html';
  });

  atualizarBotao();
  atualizarLabels();

})();
