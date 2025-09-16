(function(){
  // Botão de enviar (anchor com mailto)
  const form = document.querySelector('.form-contato');
  const btn  = document.querySelector('.btn-enviar');

  // Garante que o mailto continue funcionando
  const mailto = btn ? (btn.getAttribute('href') || '') : '';

  if(form && btn){
    btn.addEventListener('click', function(e){
      // Evita sair da página antes da animação
      e.preventDefault();

      // 1) Fecha a aba da carta
      form.classList.add('is-closing');

      // 2) Dispara o mailto no começo do voo (não bloqueia animação)
      setTimeout(()=>{ if(mailto) window.location.href = mailto; }, 280);

      // 3) Carta "voa para fora"
      setTimeout(()=>{ form.classList.add('is-flying'); }, 300);

      // 4) Após sair, limpa campos e reaparece aberta
      setTimeout(()=>{
        try{ form.reset(); }catch(_){}
        form.classList.remove('is-closing','is-flying');
        // reforça reflow antes de reabrir
        void form.offsetWidth;
        form.classList.add('is-returning');
        setTimeout(()=>{ form.classList.remove('is-returning'); }, 650);
      }, 1100);
    });
  }
})();
