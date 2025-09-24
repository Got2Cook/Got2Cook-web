// /app/meu-plano/meu-plano.js
(function(){
  const STORAGE_KEY = 'got2cook_plano';

  const $  = (s,el=document)=>el.querySelector(s);
  const $$ = (s,el=document)=>[...el.querySelectorAll(s)];

  // Header "Meu Plano Atual"
  const meuPlanoIcone  = $('#meuPlanoIcone');
  const meuPlanoNome   = $('#meuPlanoNome');
  const meuPlanoStatus = $('#meuPlanoStatus');

  // Ações
  const btnCancelar  = $('#btnCancelar');
  const btnHistorico = $('#btnHistorico');

  // CTA upgrade
  const btnConfirmar = $('#btnConfirmar');
  const ctaWrap      = $('#ctaWrap');

  // Modal
  const modal       = $('#modal');
  const modalTitle  = $('#modalTitle');
  const modalDesc   = $('#modalDesc');
  const modalOk     = $('#modalOk');
  const modalCancel = $('#modalCancel');
  const modalClose  = $('#modalClose');

  // Navegação rodapé
  $('#btnVoltar').addEventListener('click', ()=>location.href='../config/index.html');
  $('#btnLogo').addEventListener('click',  ()=>location.href='../minhas-receitas/index.html');
  $('#btnGeladeira').addEventListener('click', ()=>location.href='../geladeira/index.html');

  // Helpers
  function addDays(date, days){ const d=new Date(date); d.setDate(d.getDate()+days); return d; }
  function br(d){ const dd=String(d.getDate()).padStart(2,'0'), mm=String(d.getMonth()+1).padStart(2,'0'); return `${dd}/${mm}/${d.getFullYear()}`; }

  function getPlano(){
    const val = localStorage.getItem(STORAGE_KEY);
    if(!val){ localStorage.setItem(STORAGE_KEY,'Gratuito'); return 'Gratuito'; }
    return val;
  }
  function setPlano(p){ localStorage.setItem(STORAGE_KEY,p); }

  // ---- Modal helper (info/confirm) ----
  let lastFocusEl = null;
  function openModal({title, desc, confirm=false, warn=false, onOk=null}){
    lastFocusEl = document.activeElement;
    modalTitle.textContent = title || 'Aviso';
    modalDesc.textContent  = desc || '';
    modal.classList.add('is-open');
    modal.classList.toggle('modal--warn', !!warn);
    modal.setAttribute('aria-hidden','false');

    // exibir/ocultar botão "Cancelar"
    modalCancel.style.display = confirm ? '' : 'none';
    modalOk.textContent = confirm ? 'Confirmar' : 'OK';

    function close(){
      modal.classList.remove('is-open','modal--warn');
      modal.setAttribute('aria-hidden','true');
      modalOk.onclick = null;
      modalCancel.onclick = null;
      // RE-SYNC ao fechar o modal, garantindo que tudo reflita o estado atual
      atualizarUI(getPlano());
      if(lastFocusEl) lastFocusEl.focus({preventScroll:true});
    }

    modalOk.onclick     = ()=>{ if(onOk) onOk(); close(); };
    modalCancel.onclick = close;
    modalClose.onclick  = close;
    modal.addEventListener('click', (e)=>{ if(e.target.dataset.close) close(); }, {once:true});

    modalOk.focus({preventScroll:true});
  }

  // ---- UI sync central ----
  function atualizarUI(plano){
    // Cabeçalho
    meuPlanoNome.textContent   = plano;
    meuPlanoIcone.textContent  = (plano === 'Premium') ? '👑' : '🥗';
    meuPlanoStatus.textContent = `Válido até ${br(addDays(new Date(), 30))}`;

    // CTA: aparece SÓ no Gratuito
    if(plano === 'Gratuito'){
      ctaWrap.classList.remove('hidden');
      btnConfirmar.textContent = 'Assinar Premium';
    }else{
      ctaWrap.classList.add('hidden');
    }
  }

  // ---- Cards (sem radios) ----
  $$('.card--click').forEach(card=>{
    card.addEventListener('click', ()=>{
      const alvo = card.dataset.plano;
      const atual = getPlano();

      if(alvo === 'Premium'){
        // Leva ao CTA (não altera por clique no card)
        ctaWrap.classList.remove('hidden');
        btnConfirmar.focus({preventScroll:false});
        window.scrollTo({top:document.body.scrollHeight, behavior:'smooth'});
        return;
      }

      // Card do Gratuito
      if(atual === 'Gratuito'){
        openModal({
          title:'Plano Gratuito',
          desc:'O plano Gratuito já está selecionado.'
        });
      }else{
        openModal({
          title:'Mudar para Gratuito?',
          desc:'Você está no Premium. Deseja alterar para o plano Gratuito?',
          confirm:true,
          warn:true,
          onOk:()=>{ setPlano('Gratuito'); }
        });
      }
    });

    // acessibilidade
    card.addEventListener('keydown', e=>{
      if(e.key==='Enter' || e.key===' '){ e.preventDefault(); card.click(); }
    });
  });

  // ---- Cancelar assinatura ----
  btnCancelar.addEventListener('click', ()=>{
    const atual = getPlano();
    if(atual !== 'Premium'){
      openModal({
        title:'Sem assinatura ativa',
        desc:'Você não possui uma assinatura ativa no momento.'
      });
      return;
    }
    openModal({
      title:'Cancelar assinatura',
      desc:'Deseja mesmo cancelar o Premium? Você continuará com o plano Gratuito.',
      confirm:true,
      warn:true,
      onOk:()=>{ setPlano('Gratuito'); }
    });
  });

  // ---- Histórico de pagamentos ----
  btnHistorico.addEventListener('click', ()=>{
    window.location.href = '../pagamentos/index.html'; // ajuste se necessário
  });

  // ---- CTA (upgrade) ----
  btnConfirmar.addEventListener('click', ()=>{
    setPlano('Premium');
    openModal({
      title:'Bem-vindo ao Premium ✨',
      desc:'Assinatura realizada com sucesso!'
    });
  });

  // Init: garanta que há valor e sincronize tudo
  atualizarUI(getPlano());
})();
