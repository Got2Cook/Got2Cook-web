/* Configurações - Got2Cook (HTML/CSS/JS puros)
   Persistência total em localStorage + acessibilidade e microinterações.
   Rotas do rodapé e foco visível. */

const LS_KEYS = {
  usuario: 'got2cook_config_usuario',
  prefs: 'got2cook_config_prefs',
  notific: 'got2cook_config_notificacoes',
  priv: 'got2cook_config_privacidade',
  backup: 'got2cook_backup_info',
  // histórico (somente para limpar)
  hist_itens: 'got2cook_historico_itens',
  hist_filtros: 'got2cook_historico_filtros',
};

const DEFAULTS = {
  [LS_KEYS.usuario]: { nome: 'Chef', email: '', avatar: '', idioma: 'pt-BR' },
  [LS_KEYS.prefs]: { tema: 'padrao', unidades: 'metric', densidade: 'padrao' },
  [LS_KEYS.notific]: { receitas: true, atualizacoes: false },
  [LS_KEYS.priv]: { personalizar: true, metricasAnonimas: false },
  [LS_KEYS.backup]: { ultimoBackupISO: null },
};

document.addEventListener('DOMContentLoaded', () => {
  // ========= elementos =========
  const root = document.documentElement;

  // Perfil
  const perfilAvatar = document.getElementById('perfilAvatar');
  const perfilNome = document.getElementById('perfilNome');
  const perfilEmail = document.getElementById('perfilEmail');
  const btnEditarPerfil = document.getElementById('btnEditarPerfil');

  // Modal
  const overlay = document.getElementById('overlay');
  const modal = document.getElementById('modalPerfil');
  const formPerfil = document.getElementById('formPerfil');
  const inpNome = document.getElementById('inpNome');
  const inpEmail = document.getElementById('inpEmail');
  const inpAvatar = document.getElementById('inpAvatar');
  const btnCancelarPerfil = document.getElementById('btnCancelarPerfil');

  // Preferências
  const temaPadrao = document.getElementById('temaPadrao');
  const temaEscuro = document.getElementById('temaEscuro');
  const idiomaSel = document.getElementById('idiomaSel');
  const unidMetric = document.getElementById('unidMetric');
  const unidImperial = document.getElementById('unidImperial');
  const densCompacta = document.getElementById('densCompacta');
  const densPadrao = document.getElementById('densPadrao');

  // Notificações
  const swNotifReceitas = document.getElementById('swNotifReceitas');
  const swNotifAtualiz  = document.getElementById('swNotifAtualiz');

  // Privacidade
  const swPersonalizar  = document.getElementById('swPersonalizar');
  const swMetricas      = document.getElementById('swMetricas');

  // Dados & Backup
  const btnExportar = document.getElementById('btnExportar');
  const btnImportar = document.getElementById('btnImportar');
  const inpImportar = document.getElementById('inpImportar');
  const btnLimparHistorico = document.getElementById('btnLimparHistorico');
  const btnRestaurarPadrao = document.getElementById('btnRestaurarPadrao');

  // Sobre
  const btnNovidades = document.getElementById('btnNovidades');
  const txtVersao = document.getElementById('txtVersao');

  // Footer rotas
  document.getElementById("btnVoltar").addEventListener("click", () => {
    window.location.href = "../home/index.html";
  });
  document.getElementById("btnLogo").addEventListener("click", () => {
    window.location.href = "../minhas-receitas/index.html";
  });
  document.getElementById("btnGeladeira").addEventListener("click", () => {
    window.location.href = "../geladeira/index.html";
  });

  // Toast helper
  const toastEl = document.getElementById('toast');
  function toast(msg){
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    window.setTimeout(() => toastEl.classList.remove('show'), 1500);
  }

  // ========= storage helpers =========
  function getObj(key){
    try{
      const raw = localStorage.getItem(key);
      if(!raw) return null;
      return JSON.parse(raw);
    }catch{ return null }
  }
  function setObj(key, obj){
    localStorage.setItem(key, JSON.stringify(obj));
  }
  function ensureDefaults(){
    Object.entries(DEFAULTS).forEach(([key, val])=>{
      if(getObj(key) == null) setObj(key, val);
    });
  }

  // ========= switches acessíveis =========
  function setupSwitch(sw, onChange){
    // mouse/enter/space
    const toggle = () => {
      const current = sw.getAttribute('aria-checked') === 'true';
      sw.setAttribute('aria-checked', String(!current));
      onChange(!current);
      // feedback
      toast('Preferência atualizada');
    };
    sw.addEventListener('click', toggle);
    sw.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        toggle();
      }
    });
  }

  // ========= modal helpers (focus trap simples) =========
  let lastTrigger = null;
  function openModal(elDialog, elOverlay, trigger){
    lastTrigger = trigger || document.activeElement;
    // preencher campos com estado atual antes de abrir
    const usuario = getObj(LS_KEYS.usuario) || DEFAULTS[LS_KEYS.usuario];
    inpNome.value = usuario.nome || '';
    inpEmail.value = usuario.email || '';
    inpAvatar.value = usuario.avatar || '';

    elOverlay.classList.add('show');
    elOverlay.toggleAttribute('open', true);
    elDialog.showModal();
    // foco inicial
    elDialog.addEventListener('transitionend', ()=> inpNome.focus(), { once:true });
    inpNome.focus();

    // trap básico
    function trap(e){
      if(e.key !== 'Tab') return;
      const focusables = elDialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      if(focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
      else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
    }
    elDialog.addEventListener('keydown', trap);

    // clique fora fecha
    elOverlay.addEventListener('click', closeOnOverlay);
    function closeOnOverlay(){
      closeModal(elDialog, elOverlay);
      elOverlay.removeEventListener('click', closeOnOverlay);
    }
  }

  function closeModal(elDialog, elOverlay){
    elOverlay.classList.remove('show');
    elOverlay.removeAttribute('open');
    elDialog.close();
    if(lastTrigger) lastTrigger.focus();
  }

  // ========= init =========
  ensureDefaults();

  // Carregar estado para UI
  const usuario = getObj(LS_KEYS.usuario);
  const prefs   = getObj(LS_KEYS.prefs);
  const notific = getObj(LS_KEYS.notific);
  const priv    = getObj(LS_KEYS.priv);

  // Perfil UI
  perfilNome.textContent = usuario.nome || 'Chef';
  perfilEmail.textContent = usuario.email || '';
  perfilAvatar.src = usuario.avatar || 'https://placehold.co/100x100/png?text=Avatar';

  // Preferências UI
  (prefs.tema === 'escuro' ? temaEscuro : temaPadrao).checked = true;
  (prefs.unidades === 'imperial' ? unidImperial : unidMetric).checked = true;
  (prefs.densidade === 'compacta' ? densCompacta : densPadrao).checked = true;
  idiomaSel.value = usuario.idioma || 'pt-BR';

  // Aplicar efeitos de tema/densidade
  applyTheme(prefs.tema);
  applyDensity(prefs.densidade);

  // Notificações UI
  swNotifReceitas.setAttribute('aria-checked', String(!!notific.receitas));
  swNotifAtualiz.setAttribute('aria-checked', String(!!notific.atualizacoes));

  // Privacidade UI
  swPersonalizar.setAttribute('aria-checked', String(!!priv.personalizar));
  swMetricas.setAttribute('aria-checked', String(!!priv.metricasAnonimas));

  // Versão (placeholder)
  txtVersao.textContent = '1.0.0';

  // ========= listeners =========
  // Radios/Select salvam imediatamente
  temaPadrao.addEventListener('change', ()=>{ if(temaPadrao.checked){ prefs.tema='padrao'; setObj(LS_KEYS.prefs, prefs); applyTheme(prefs.tema); toast('Tema: Padrão')} });
  temaEscuro.addEventListener('change', ()=>{ if(temaEscuro.checked){ prefs.tema='escuro'; setObj(LS_KEYS.prefs, prefs); applyTheme(prefs.tema); toast('Tema: Escuro')} });

  unidMetric.addEventListener('change', ()=>{ if(unidMetric.checked){ prefs.unidades='metric'; setObj(LS_KEYS.prefs, prefs); toast('Unidades: Métrico')} });
  unidImperial.addEventListener('change', ()=>{ if(unidImperial.checked){ prefs.unidades='imperial'; setObj(LS_KEYS.prefs, prefs); toast('Unidades: Imperial')} });

  densCompacta.addEventListener('change', ()=>{ if(densCompacta.checked){ prefs.densidade='compacta'; setObj(LS_KEYS.prefs, prefs); applyDensity(prefs.densidade); toast('Densidade: Compacta')} });
  densPadrao.addEventListener('change', ()=>{ if(densPadrao.checked){ prefs.densidade='padrao'; setObj(LS_KEYS.prefs, prefs); applyDensity(prefs.densidade); toast('Densidade: Padrão')} });

  idiomaSel.addEventListener('change', ()=>{
    usuario.idioma = idiomaSel.value;
    setObj(LS_KEYS.usuario, usuario);
    toast('Idioma atualizado');
  });

  // Switches acessíveis
  setupSwitch(swNotifReceitas, (val)=>{ notific.receitas = val; setObj(LS_KEYS.notific, notific); });
  setupSwitch(swNotifAtualiz,  (val)=>{ notific.atualizacoes = val; setObj(LS_KEYS.notific, notific); });
  setupSwitch(swPersonalizar,  (val)=>{ priv.personalizar = val; setObj(LS_KEYS.priv, priv); });
  setupSwitch(swMetricas,      (val)=>{ priv.metricasAnonimas = val; setObj(LS_KEYS.priv, priv); });

  // Editar perfil (modal)
  btnEditarPerfil.addEventListener('click', ()=> openModal(modal, overlay, btnEditarPerfil));
  btnCancelarPerfil.addEventListener('click', ()=> closeModal(modal, overlay));
  formPerfil.addEventListener('submit', (e)=>{
    e.preventDefault();
    const nome  = inpNome.value.trim() || 'Chef';
    const email = inpEmail.value.trim();
    const avatar= inpAvatar.value.trim();

    usuario.nome = nome;
    usuario.email = email;
    usuario.avatar = avatar;

    setObj(LS_KEYS.usuario, usuario);

    // Reflete no UI
    perfilNome.textContent = nome;
    perfilEmail.textContent = email;
    perfilAvatar.src = avatar || 'https://placehold.co/100x100/png?text=Avatar';

    closeModal(modal, overlay);
    toast('Perfil salvo');
  });

  // Exportar / Importar / Limpar / Restaurar
  btnExportar.addEventListener('click', ()=>{
    const blobData = {
      [LS_KEYS.usuario]: getObj(LS_KEYS.usuario),
      [LS_KEYS.prefs]: getObj(LS_KEYS.prefs),
      [LS_KEYS.notific]: getObj(LS_KEYS.notific),
      [LS_KEYS.priv]: getObj(LS_KEYS.priv),
      [LS_KEYS.backup]: { ultimoBackupISO: new Date().toISOString() }
    };
    setObj(LS_KEYS.backup, blobData[LS_KEYS.backup]);

    const blob = new Blob([JSON.stringify(blobData, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'got2cook-config.json';
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast('Backup exportado');
  });

  btnImportar.addEventListener('click', ()=> inpImportar.click());
  btnNovidades.addEventListener('click', ()=> { window.location.href = '#'; });

  inpImportar.addEventListener('change', async ()=>{
    const file = inpImportar.files?.[0];
    if(!file){ return; }
    if(file.type !== 'application/json'){ toast('Arquivo inválido'); return; }
    try{
      const text = await file.text();
      const data = JSON.parse(text);

      // valida chaves conhecidas + merge superficial
      const allow = [LS_KEYS.usuario, LS_KEYS.prefs, LS_KEYS.notific, LS_KEYS.priv, LS_KEYS.backup];
      allow.forEach(key=>{
        if(data[key] && typeof data[key] === 'object'){
          const current = getObj(key) || {};
          setObj(key, { ...current, ...data[key] });
        }
      });

      // refletir no UI após importar
      const u = getObj(LS_KEYS.usuario);
      const p = getObj(LS_KEYS.prefs);
      const n = getObj(LS_KEYS.notific);
      const r = getObj(LS_KEYS.priv);

      perfilNome.textContent = u.nome || 'Chef';
      perfilEmail.textContent = u.email || '';
      perfilAvatar.src = u.avatar || 'https://placehold.co/100x100/png?text=Avatar';

      idiomaSel.value = u.idioma || 'pt-BR';

      temaPadrao.checked = (p.tema !== 'escuro');
      temaEscuro.checked = (p.tema === 'escuro');
      unidMetric.checked = (p.unidades !== 'imperial');
      unidImperial.checked = (p.unidades === 'imperial');
      densCompacta.checked = (p.densidade === 'compacta');
      densPadrao.checked = (p.densidade !== 'compacta');
      applyTheme(p.tema);
      applyDensity(p.densidade);

      swNotifReceitas.setAttribute('aria-checked', String(!!n.receitas));
      swNotifAtualiz.setAttribute('aria-checked', String(!!n.atualizacoes));
      swPersonalizar.setAttribute('aria-checked', String(!!r.personalizar));
      swMetricas.setAttribute('aria-checked', String(!!r.metricasAnonimas));

      toast('Configurações importadas');
    }catch{
      toast('Falha ao importar JSON');
    }finally{
      inpImportar.value = '';
    }
  });

  btnLimparHistorico.addEventListener('click', ()=>{
    localStorage.removeItem(LS_KEYS.hist_itens);
    localStorage.removeItem(LS_KEYS.hist_filtros);
    toast('Histórico limpo');
  });

  btnRestaurarPadrao.addEventListener('click', ()=>{
    // reseta as quatro chaves desta tela
    setObj(LS_KEYS.usuario, { ...DEFAULTS[LS_KEYS.usuario] });
    setObj(LS_KEYS.prefs,   { ...DEFAULTS[LS_KEYS.prefs] });
    setObj(LS_KEYS.notific, { ...DEFAULTS[LS_KEYS.notific] });
    setObj(LS_KEYS.priv,    { ...DEFAULTS[LS_KEYS.priv] });

    // refletir no UI
    const u = getObj(LS_KEYS.usuario);
    const p = getObj(LS_KEYS.prefs);
    const n = getObj(LS_KEYS.notific);
    const r = getObj(LS_KEYS.priv);

    perfilNome.textContent = u.nome;
    perfilEmail.textContent = u.email;
    perfilAvatar.src = u.avatar || 'https://placehold.co/100x100/png?text=Avatar';
    idiomaSel.value = u.idioma;

    temaPadrao.checked = (p.tema !== 'escuro');
    temaEscuro.checked = (p.tema === 'escuro');
    unidMetric.checked = (p.unidades !== 'imperial');
    unidImperial.checked = (p.unidades === 'imperial');
    densCompacta.checked = (p.densidade === 'compacta');
    densPadrao.checked = (p.densidade !== 'compacta');
    applyTheme(p.tema);
    applyDensity(p.densidade);

    swNotifReceitas.setAttribute('aria-checked', String(!!n.receitas));
    swNotifAtualiz.setAttribute('aria-checked', String(!!n.atualizacoes));
    swPersonalizar.setAttribute('aria-checked', String(!!r.personalizar));
    swMetricas.setAttribute('aria-checked', String(!!r.metricasAnonimas));

    toast('Configurações restauradas');
  });

  // ========= helpers visuais =========
  function applyTheme(tema){
    if(tema === 'escuro'){
      root.setAttribute('data-tema', 'escuro');
    }else{
      root.removeAttribute('data-tema');
    }
  }
  function applyDensity(dens){
    document.body.classList.toggle('dense', dens === 'compacta');
  }
});
