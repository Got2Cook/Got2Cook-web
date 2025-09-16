// Navegação do rodapé
document.getElementById("btnVoltar").addEventListener("click", () => {
  window.location.href = "humor.html";
});
document.getElementById("btnLogo").addEventListener("click", () => {
  window.location.href = "home.html";
});
document.getElementById("btnGeladeira").addEventListener("click", () => {
  window.location.href = "minhageladeira.html";
});

// Envelope animado no formulário
(function(){
  const form = document.querySelector('.form-contato');
  const btn  = document.querySelector('.btn-enviar');
  if(!form || !btn) return;

  const mailto = btn.getAttribute('href') || '';

  btn.addEventListener('click', function(e){
    e.preventDefault();

    // 1) fecha envelope (campos somem + aba fecha)
    form.classList.add('is-closing');

    // 2) dispara mailto durante a animação
    setTimeout(()=>{ if(mailto) window.location.href = mailto; }, 300);

    // 3) envelope "voa" para a lateral
    setTimeout(()=>{ form.classList.add('is-flying'); }, 400);

    // 4) reaparece aberto e vazio
    setTimeout(()=>{
      try{ form.reset(); }catch(_){}
      form.classList.remove('is-closing','is-flying');
      void form.offsetWidth; // força reflow
      form.classList.add('is-returning');
      setTimeout(()=>{ form.classList.remove('is-returning'); }, 1000);
    }, 1800); // tempo ajustado ao CSS (1.5s voo)
  });
})();

// Efeito no botão WhatsApp
const btnWhats = document.querySelector(".btn-whatsapp");
if (btnWhats) {
  btnWhats.addEventListener("mouseenter", () => {
    btnWhats.style.boxShadow = "0 0 12px rgba(37, 211, 102, 0.6)";
  });
  btnWhats.addEventListener("mouseleave", () => {
    btnWhats.style.boxShadow = "none";
  });
}
