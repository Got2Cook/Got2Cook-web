console.log("JS de configurações carregado ✅");

document.addEventListener('DOMContentLoaded', () => {
  // === ELEMENTOS ===
  const lembreteHumor = document.getElementById('lembreteHumor');
  const receitaDia = document.getElementById('receitaDia');

  const btnLimparHistorico = document.getElementById('limparDados');
  const btnLimparPreferencias = document.getElementById('limparPreferencias');
  const btnApagarConta = document.getElementById('apagarConta');

  // Elementos do pop-up
  const popupOverlay = document.getElementById('popupOverlay');
  const popupMessage = document.getElementById('popupMessage');
  const popupOk = document.getElementById('popupOk');
  const popupCancel = document.getElementById('popupCancel');

  popupOverlay.style.display = 'none';

  let popupResolve;

  function showPopup(message, type='info', confirm=false) {
    popupMessage.textContent = message;
    popupOk.textContent = confirm ? 'Confirmar' : 'OK';
    popupCancel.style.display = confirm ? 'inline-block' : 'none';

    popupOk.classList.toggle('danger', type==='danger');
    popupOverlay.style.display = 'flex';

    return new Promise((resolve) => {
      popupResolve = resolve;
    });
  }

  popupOk.addEventListener('click', () => {
    popupOverlay.style.display = 'none';
    if (popupResolve) popupResolve(true);
  });

  popupCancel.addEventListener('click', () => {
    popupOverlay.style.display = 'none';
    if (popupResolve) popupResolve(false);
  });

  // === CARREGAR CONFIG SALVA ===
  const config = JSON.parse(localStorage.getItem('got2cook_config')) || {};
  if (config.lembreteHumor) lembreteHumor.checked = true;
  if (config.receitaDia) receitaDia.checked = true;

  // === EVENTOS ===
  lembreteHumor.addEventListener('change', () => {
    config.lembreteHumor = lembreteHumor.checked;
    salvarConfig();
  });

  receitaDia.addEventListener('change', () => {
    config.receitaDia = receitaDia.checked;
    salvarConfig();
  });

  btnLimparHistorico.addEventListener('click', () => {
    localStorage.removeItem('historicoHumor');
    showPopup('✅ Histórico de humor limpo com sucesso!');
  });

  btnLimparPreferencias.addEventListener('click', () => {
    localStorage.removeItem('got2cook_config');    
    localStorage.removeItem('meusGostos');         
    localStorage.removeItem('minhasReceitas');     
    showPopup('✅ Dados aprendidos e preferências foram limpos!');
  });

  btnApagarConta.addEventListener('click', async () => {
    const confirmDelete = await showPopup(
      '⚠️ Tem certeza que deseja apagar sua conta? Todos os dados serão perdidos.',
      'danger',
      true
    );
    if (confirmDelete) {
      localStorage.clear();
      showPopup('❌ Conta apagada e dados removidos.', 'danger');
      setTimeout(() => {
        window.location.href = 'home.html';
      }, 1500);
    }
  });

  function salvarConfig() {
    localStorage.setItem('got2cook_config', JSON.stringify(config));
  }
});
