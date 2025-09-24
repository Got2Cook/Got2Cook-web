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

  const radios = $$('.radio-plano');

  // Rodapé navegação
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

  function syncRadios(plano){ $$('.radio-plano').forEach(r=>r.checked = (r.value===plano)); }

  function atualizarUI(plano){
    // Header "Meu Plano Atual"
    meuPlanoNome.textContent = plano;
    meuPlanoIcone.textContent = (plano === 'Premium') ? '👑' : '🥗';
    meuPlanoStatus.textContent = `Válido até ${br(addDays(new Date(), 30))}`;

    // CTA: dourado e pulsante para GRATUITO; oculto no PREMIUM
    if(plano === 'Gratuito'){
      ctaWrap.classList.remove('hidden');
      btnConfirmar.textContent = 'Assinar Premium';
      btnConfirmar.classList.add('btn--ouro');
    }else{
      ctaWrap.classList.add('hidden');          // <<< some quando Premium
      btnConfirmar.classList.remove('btn--ouro');
    }
  }

  // Eventos de seleção
  radios.forEach(r=>{
    const label = r.closest('label');
    if(label){
      label.addEventListener('click', ()=>{ r.checked = true; });
      label.addEventListener('keydown', e=>{
        if(e.key==='Enter' || e.key===' '){ e.preventDefault(); r.checked=true; }
      });
    }
    r.addEventListener('change', ()=>{
      const plano = r.value;
      // Apenas muda o texto/estilo do CTA conforme seleção atual (não salva ainda)
      if(plano === 'Premium'){
        btnConfirmar.textContent = 'Assinar Premium';
        btnConfirmar.classList.add('btn--ouro');
        ctaWrap.classList.remove('hidden');
      }else{
        btnConfirmar.textContent = 'Assinar Premium';
        btnConfirmar.classList.add('btn--ouro');
        ctaWrap.classList.remove('hidden');
      }
    });
  });

  // Confirmar CTA: define Premium e atualiza tudo
  btnConfirmar.addEventListener('click', ()=>{
    salvarPlano('Premium');
    alert('🎉 Parabéns! Você agora é Premium.');
    syncRadios('Premium');
    atualizarUI('Premium'); // isto esconde o CTA
  });

  // Inicialização
  const planoInicial = carregarPlano();
  syncRadios(planoInicial);
  atualizarUI(planoInicial);
})();
