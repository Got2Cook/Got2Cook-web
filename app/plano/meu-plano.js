// /app/meu-plano/meu-plano.js
(function(){
  const STORAGE_KEY = 'got2cook_plano';

  const $ = (s,el=document)=>el.querySelector(s);
  const $$ = (s,el=document)=>[...el.querySelectorAll(s)];

  const meuPlanoIcone = $('#meuPlanoIcone');
  const meuPlanoNome  = $('#meuPlanoNome');
  const meuPlanoStatus= $('#meuPlanoStatus');

  const btnCancelar   = $('#btnCancelar');
  const btnHistorico  = $('#btnHistorico');

  const btnConfirmar  = $('#btnConfirmar');
  const ctaWrap       = $('#ctaWrap');

  // Modal elements
  const modal = $('#modal');
  const modalTitle = $('#modalTitle');
  const modalDesc  = $('#modalDesc');
  const modalOk    = $('#modalOk');
  const modalCancel= $('#modalCancel');
  const modalClose = $('#modalClose');

  // Footer nav
  $('#btnVoltar').addEventListener('click', ()=>location.href='../config/index.html');
  $('#btnLogo').addEventListener('click', ()=>location.href='../minhas-receitas/index.html');
  $('#btnGeladeira').addEventListener('click', ()=>location.href='../geladeira/index.html');

  function addDays(date, days){ const d=new Date(date); d.setDate(d.getDate()+days); return d; }
  function br(d){ const dd=String(d.getDate()).padStart(2,'0'), mm=String(d.getMonth()+1).padStart(2,'0'); return `${dd}/${mm}/${d.getFullYear()}`; }

  function getPlano(){ return localStorage.getItem(STORAGE_KEY) || 'Gratuito'; }
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

    // show/hide cancel based on confirm
    modalCancel.style.display = confirm ? '' : 'none';
    modalOk.textContent = confirm ? 'Confirmar' : 'OK';

    function close(){
      modal.classList.remove('is-open','modal--warn');
      modal.setAttribute('aria-hidden','true');
      modalOk.onclick = null;
      modalCancel.onclick = null;
      if(lastFocusEl) lastFocusEl.focus({preventScroll:true});
    }

    modalOk.onclick = ()=>{
      if(onOk) onOk();
      close();
    };
    modalCancel.onclick = close;
    modalClose.onclick = close;
    modal.addEventListener('click', (e)=>{ if(e.target.dataset.close) close(); }, {once:true});

    // focus first action
    modalOk.focus({preventScroll:true});
  }

  function atualizarUI(plano){
    meuPlanoNome.textContent = plano;
    meuPlanoIcone.textContent = (plano === 'Premium') ? '👑' : '🥗';
    meuPlanoStatus.textContent = `Válido até ${br(addDays(new Date(), 30))}`;

    if(plano === 'Gratuito'){
      ctaWrap.classList.remove('hidden');
      btnConfirmar.textContent = 'Assinar Premium';
    }else{
      ctaWrap.classList.add('hidden'); // esconde no Premium
    }
  }

  // Cards (atalhos)
  $$('.card--click').forEach(card=>{
    card.addEventListener('click', ()=>{
      const alvo = card.dataset.plano;
      if(alvo === 'Premium'){
        // leva ao CTA
        ctaWrap.classList.remove('hidden');
        btnConfirmar.focus({preventScroll:false});
        window.scrollTo({top:document.body.scrollHeight, behavior:'smooth'});
      }else{
        openModal({
          title:'Plano Gratuito',
          desc:'O plano Gratuito já está selecionado.',
        });
      }
    });
    card.addEventListener('keydown', e=>{
      if(e.key==='Enter' || e.key===' '){ e.preventDefault(); card.click(); }
    });
  });

  // Cancelar assinatura -> popup agradável
  btnCancelar.addEventListener('click', ()=>{
    const atual = getPlano();
    if(atual !== 'Premium'){
      openModal({
        title:'Sem assinatura ativa',
        desc:'Você não possui uma assinatura ativa no momento.',
      });
      return;
    }
    openModal({
      title:'Cancelar assinatura',
      desc:'Deseja mesmo cancelar o Premium? Você continuará com o plano Gratuito.',
      confirm:true,
      warn:true,
      onOk:()=>{
        setPlano('Gratuito');
        atualizarUI('Gratuito');
        openModal({
          title:'Assinatura cancelada',
          desc:'Você voltou para o plano Gratuito.',
        });
      }
    });
  });

  // Histórico de pagamentos -> navega
  btnHistorico.addEventListener('click', ()=>{
    // ajuste se o caminho for diferente
    window.location.href = '../pagamentos/index.html';
  });

  // CTA upgrade
  btnConfirmar.addEventListener('click', ()=>{
    setPlano('Premium');
    atualizarUI('Premium');
    openModal({
      title:'Bem-vindo ao Premium ✨',
      desc:'Assinatura realizada com sucesso!',
    });
  });

  // Init
  atualizarUI(getPlano());
})();
