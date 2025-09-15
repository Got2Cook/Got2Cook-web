console.log("Configurações carregadas");

document.addEventListener('DOMContentLoaded', () => {
  // rotas do rodapé
  document.getElementById("btnVoltar").addEventListener("click", () => {
    window.location.href = "../humor/index.html";
  });
  document.getElementById("btnLogo").addEventListener("click", () => {
    window.location.href = "../home/index.html";
  });
  document.getElementById("btnGeladeira").addEventListener("click", () => {
    window.location.href = "../geladeira/index.html";
  });

  // perfil → dados pessoais
  document.getElementById('editarPerfil').addEventListener('click', () => {
    window.location.href = "../dados-pessoais/index.html";
  });

  // popup utilitário
  const overlay = document.getElementById('popupOverlay');
  const msg = document.getElementById('popupMessage');
  const ok = document.getElementById('popupOk');
  const cancel = document.getElementById('popupCancel');
  let resolver = null;
  function showPopup(texto, confirm=false){
    msg.textContent = texto;
    cancel.style.display = confirm ? 'inline-block' : 'none';
    overlay.classList.add('show'); overlay.removeAttribute('hidden');
    return new Promise(r=>resolver=r);
  }
  ok.addEventListener('click', ()=>{ overlay.classList.remove('show'); overlay.setAttribute('hidden',''); resolver?.(true) });
  cancel.addEventListener('click', ()=>{ overlay.classList.remove('show'); overlay.setAttribute('hidden',''); resolver?.(false) });

  // switches acessíveis
  function setupSwitch(id, key){
    const el = document.getElementById(id);
    const toggle = () => {
      const val = el.getAttribute('aria-checked') === 'true';
      el.setAttribute('aria-checked', String(!val));
      state[key] = !val; save();
    };
    el.addEventListener('click', toggle);
    el.addEventListener('keydown', (e)=>{ if(e.key==='Enter'||e.key===' '){e.preventDefault();toggle()} });
  }

  // estado
  const state = JSON.parse(localStorage.getItem('got2cook_config')) || {};
  // idioma
  const idiomaSel = document.getElementById('idioma');
  if(state.idioma) idiomaSel.value = state.idioma;
  idiomaSel.addEventListener('change', ()=>{ state.idioma = idiomaSel.value; save() });

  // switches
  setupSwitch('lembreteHumor', 'lembreteHumor');
  setupSwitch('receitaDia', 'receitaDia');
  // refletir estado inicial
  document.getElementById('lembreteHumor').setAttribute('aria-checked', String(!!state.lembreteHumor));
  document.getElementById('receitaDia').setAttribute('aria-checked', String(!!state.receitaDia));

  // ações
  document.getElementById('limparDados').addEventListener('click', ()=>{
    localStorage.removeItem('historicoHumor');
    showPopup('Histórico de humor limpo!');
  });
  document.getElementById('limparPreferencias').addEventListener('click', ()=>{
    localStorage.removeItem('got2cook_config');
    localStorage.removeItem('meusGostos');
    localStorage.removeItem('minhasReceitas');
    showPopup('Dados aprendidos limpos!');
  });
  document.getElementById('apagarConta').addEventListener('click', async ()=>{
    const ok = await showPopup('Tem certeza? Isso apagará todos os dados.', true);
    if(ok){
      localStorage.clear();
      await showPopup('Conta apagada.');
      window.location.href = "../home/index.html";
    }
  });

  function save(){ localStorage.setItem('got2cook_config', JSON.stringify(state)) }
});

// versão
document.getElementById('versaoApp').textContent = "1.0.0"; 
