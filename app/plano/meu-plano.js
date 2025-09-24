// /app/meu-plano/meu-plano.js
(function(){
  const STORAGE_KEY = 'got2cook_plano';

  const $ = (s,el=document)=>el.querySelector(s);
  const $$ = (s,el=document)=>[...el.querySelectorAll(s)];

  const meuPlanoIcone = $('#meuPlanoIcone');
  const meuPlanoNome  = $('#meuPlanoNome');
  const meuPlanoStatus= $('#meuPlanoStatus');

  const btnConfirmar  = $('#btnConfirmar');
  const ctaWrap       = $('#ctaWrap');

  // Navegação rodapé
  $('#btnVoltar').addEventListener('click', ()=>location.href='../config/index.html');
  $('#btnLogo').addEventListener('click', ()=>location.href='../minhas-receitas/index.html');
  $('#btnGeladeira').addEventListener('click', ()=>location.href='../geladeira/index.html');

  // Ações extras
  $('#btnAlterar').addEventListener('click', ()=>alert('Tela de alteração de plano (em breve).'));
  $('#btnCancelar').addEventListener('click', ()=>alert('Cancelar assinatura (simulação).'));
  $('#btnHistorico').addEventListener('click', ()=>alert('Histórico de pagamentos (simulação).'));

  function addDays(date, days){ const d=new Date(date); d.setDate(d.getDate()+days); return d; }
  function br(d){ const dd=String(d.getDate()).padStart(2,'0'), mm=String(d.getMonth()+1).padStart(2,'0'); return `${dd}/${mm}/${d.getFullYear()}`; }

  function carregarPlano(){ return localStorage.getItem(STORAGE_KEY) || 'Gratuito'; }
  function salvarPlano(p){ localStorage.setItem(STORAGE_KEY,p); }

  function atualizarUI(plano){
    // Header "Meu Plano Atual"
    meuPlanoNome.textContent = plano;
    meuPlanoIcone.textContent = (plano === 'Premium') ? '👑' : '🥗';
    meuPlanoStatus.textContent = `Válido até ${br(addDays(new Date(), 30))}`;

    // CTA: aparece SÓ no GRATUITO
    if(plano === 'Gratuito'){
      ctaWrap.classList.remove('hidden');
      btnConfirmar.textContent = 'Assinar Premium';
    }else{
      ctaWrap.classList.add('hidden');
    }
  }

  // Clique nos cards (sem radios)
  $$('.card--click').forEach(card=>{
    card.addEventListener('click', ()=>{
      const plano = card.dataset.plano;
      if(plano === 'Premium'){
        // se clicar no card premium, já chama CTA (scroll) ou efetiva no clique do CTA
        document.getElementById('btnConfirmar').focus({preventScroll:false});
        window.scrollTo({top:document.body.scrollHeight, behavior:'smooth'});
      }
    });

    card.addEventListener('keydown', (e)=>{
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        card.click();
      }
    });
  });

  // Confirmar CTA: define Premium e oculta CTA
  btnConfirmar.addEventListener('click', ()=>{
    salvarPlano('Premium');
    alert('🎉 Parabéns! Você agora é Premium.');
    atualizarUI('Premium'); // esconde CTA
  });

  // Init
  atualizarUI(carregarPlano());
})();
