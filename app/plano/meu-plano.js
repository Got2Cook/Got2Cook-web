// /app/meu-plano/meu-plano.js — SUBSTITUA PELO ARQUIVO COMPLETO ABAIXO
(function(){
  const STORAGE_KEY = 'got2cook_plano';

  const $ = (s,el=document)=>el.querySelector(s);
  const $$ = (s,el=document)=>[...el.querySelectorAll(s)];

  // Header "Meu Plano Atual"
  const meuPlanoIcone = $('#meuPlanoIcone');
  const meuPlanoNome  = $('#meuPlanoNome');
  const meuPlanoStatus= $('#meuPlanoStatus');

  // CTA
  const btnConfirmar  = $('#btnConfirmar');
  const ctaWrap       = $('#ctaWrap');

  // Botões de ação
  const btnAlterar    = $('#btnAlterar');
  const btnCancelar   = $('#btnCancelar');
  const btnHistorico  = $('#btnHistorico');

  // Cards (sem radios)
  const cardFree      = document.querySelector('.card[data-plano="Gratuito"]') || null;
  const cardPremium   = document.querySelector('.card[data-plano="Premium"]')  || document.querySelector('.plano--premium');

  // Navegação rodapé
  $('#btnVoltar').addEventListener('click', ()=>location.href='../config/index.html');
  $('#btnLogo').addEventListener('click', ()=>location.href='../minhas-receitas/index.html');
  $('#btnGeladeira').addEventListener('click', ()=>location.href='../geladeira/index.html');

  // Helpers
  function addDays(date, days){ const d=new Date(date); d.setDate(d.getDate()+days); return d; }
  function br(d){ const dd=String(d.getDate()).padStart(2,'0'), mm=String(d.getMonth()+1).padStart(2,'0'); return `${dd}/${mm}/${d.getFullYear()}`; }

  function getPlano(){ return localStorage.getItem(STORAGE_KEY) || 'Gratuito'; }
  function setPlano(p){ localStorage.setItem(STORAGE_KEY,p); }

  function atualizarUI(plano){
    // header
    meuPlanoNome.textContent = plano;
    meuPlanoIcone.textContent = (plano === 'Premium') ? '👑' : '🥗';
    meuPlanoStatus.textContent = `Válido até ${br(addDays(new Date(), 30))}`;

    // CTA: aparece SÓ no GRATUITO
    if(plano === 'Gratuito'){
      ctaWrap.classList.remove('hidden');
      btnConfirmar.textContent = 'Assinar Premium';
      btnConfirmar.classList.add('btn--ouro');
    }else{
      ctaWrap.classList.add('hidden');
      btnConfirmar.classList.remove('btn--ouro');
    }
  }

  // ====== AÇÕES SOLICITADAS ======

  // 1) Alterar plano
  // - Se estiver no GRATUITO: rola até os cards e destaca o card Premium.
  // - Se estiver no PREMIUM: oferece downgrade para Gratuito.
  function onAlterarPlano(){
    const atual = getPlano();

    if(atual === 'Gratuito'){
      // foco nos cards e destaque no premium
      const sec = document.querySelector('.selecao-planos') || document.body;
      sec.scrollIntoView({behavior:'smooth', block:'center'});
      if(cardPremium){
        cardPremium.classList.remove('pulse-gold'); // reset
        void cardPremium.offsetWidth;               // reflow p/ reiniciar anim
        cardPremium.classList.add('pulse-gold');
        cardPremium.focus({preventScroll:true});
      }
    }else{
      const sim = confirm('Você está no Premium. Deseja alterar para o plano Gratuito?');
      if(sim){
        setPlano('Gratuito');
        atualizarUI('Gratuito');
        alert('Plano alterado para Gratuito.');
      }
    }
  }

  // 2) Cancelar assinatura
  // - Se Premium: confirma, volta para Gratuito.
  // - Se Gratuito: informa que não há assinatura ativa.
  function onCancelarAssinatura(){
    const atual = getPlano();
    if(atual !== 'Premium'){
      alert('Você não possui uma assinatura ativa no momento.');
      return;
    }
    const ok = confirm('Confirmar cancelamento da assinatura Premium? Você continuará com o plano Gratuito.');
    if(ok){
      setPlano('Gratuito');
      atualizarUI('Gratuito');
      alert('Assinatura cancelada. Você voltou para o plano Gratuito.');
    }
  }

  // 3) Histórico de Pagamentos → vai para outra página
  // Ajuste o caminho abaixo conforme sua estrutura:
  function onHistoricoPagamentos(){
    window.location.href = '../pagamentos/index.html';
  }

  // 4) Clique nos cards (atalhos)
  // - Clicar no Premium só rola até o CTA (não ativa nada sozinho).
  // - Clicar no Gratuito apenas informa o estado.
  function wireCardClicks(){
    $$('.card--click').forEach(card=>{
      card.addEventListener('click', ()=>{
        const alvo = card.dataset.plano;
        if(alvo === 'Premium'){
          // chamar atenção do CTA
          ctaWrap.classList.remove('hidden');
          btnConfirmar.focus({preventScroll:false});
          window.scrollTo({top:document.body.scrollHeight, behavior:'smooth'});
        }else{
          // opcional: feedback simples
          alert('Você já está vendo o plano Gratuito.');
        }
      });
      card.addEventListener('keydown', e=>{
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); card.click(); }
      });
    });
  }

  // 5) CTA confirma upgrade para Premium
  function onConfirmar(){
    setPlano('Premium');
    alert('🎉 Parabéns! Você agora é Premium.');
    atualizarUI('Premium'); // esconde CTA
  }

  // Listeners dos botões
  btnAlterar.addEventListener('click', onAlterarPlano);
  btnCancelar.addEventListener('click', onCancelarAssinatura);
  btnHistorico.addEventListener('click', onHistoricoPagamentos);
  btnConfirmar.addEventListener('click', onConfirmar);

  // Init
  wireCardClicks();
  atualizarUI(getPlano());
})();
