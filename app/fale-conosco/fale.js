(function(){
  const form = document.querySelector('.form-contato');
  const btn  = document.querySelector('.btn-enviar');
  if(!form || !btn) return;

  const mailto = btn.getAttribute('href') || '';

  btn.addEventListener('click', function(e){
    e.preventDefault();

    // 1) Fecha o envelope: some campos, sobe a capa e desce a aba
    form.classList.add('is-closing');

    // 2) Dispara mailto no começo da animação (sem bloquear)
    setTimeout(()=>{ if(mailto) window.location.href = mailto; }, 250);

    // 3) Envelope "voa" para a lateral
    setTimeout(()=>{ form.classList.add('is-flying'); }, 330);

    // 4) Ao finalizar o voo: reset e reaparece aberto e vazio
    setTimeout(()=>{
      try{ form.reset(); }catch(_){}
      form.classList.remove('is-closing','is-flying');

      // força reflow antes de tocar a animação de retorno
      void form.offsetWidth;

      form.classList.add('is-returning');
      setTimeout(()=>{ form.classList.remove('is-returning'); }, 650);
    }, 1200);
  });
})();
