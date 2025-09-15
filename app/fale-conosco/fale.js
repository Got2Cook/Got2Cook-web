// Navegação do rodapé (conforme solicitado)
document.getElementById('btnVoltar')?.addEventListener('click', () => {
  window.location.href = '../config/index.html';
});

document.getElementById('btnLogo')?.addEventListener('click', () => {
  window.location.href = '../minhas-receitas/index.html';
});

document.getElementById('btnGeladeira')?.addEventListener('click', () => {
  window.location.href = '../geladeira/index.html';
});

// Formulário simples (sem salvar em localStorage)
// Apenas impede recarregar a página por acidente neste MVP
document.getElementById('formFale')?.addEventListener('submit', (e) => {
  e.preventDefault();
  // Aqui futuramente: envio ao back-end / e-mail.
  alert('Mensagem registrada localmente (MVP). Em breve, envio real será habilitado.');
});
