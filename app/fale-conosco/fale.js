(function(){
  const form = document.querySelector('.form-contato');
  const btn  = document.querySelector('.btn-enviar');
  if(!form || !btn) return;

  const mailto = btn.getAttribute('href') || '';

  btn.addEventListener('click', function(e){
    e.preventDefault();

    // 1) fecha envelope (aba + capa por cima dos campos)
    form.classList.add('is-closing');

    // 2) dispara mailto enquanto fecha
    setTimeout(()=>{ if(mailto) window.location.href = mailto; }, 250);

    // 3) envelope "voa" para fora
    setTimeout(()=>{ form.classList.add('is-flying'); }, 320);

    // 4) ao sair, limpa e volta aberto
    setTimeout(()=>{
      try{ form.reset(); }catch(_){}
      form.classList.remove('is-closing','is-flying');

      // garante reflow antes de reabrir
      void form.offsetWidth;

      form.classList.add('is-returning');
      // reabre (remove classes que fecham a aba/capa)
      setTimeout(()=>{ form.classList.remove('is-returning'); }, 650);
    }, 1100);
  });
})();
