// Navegação do rodapé
document.getElementById("btnVoltar")?.addEventListener("click", () => {
  window.location.href = "humor.html";
});
document.getElementById("btnLogo")?.addEventListener("click", () => {
  window.location.href = "home.html";
});
document.getElementById("btnGeladeira")?.addEventListener("click", () => {
  window.location.href = "minhageladeira.html";
});

// Envelope animado
(function(){
  const form = document.querySelector('.form-contato');
  const btn  = document.querySelector('.btn-enviar');
  if(!form || !btn) return;

  const mailto = btn.getAttribute('href') || '';

  btn.addEventListener('click', function(e){
    e.preventDefault();
    form.classList.add('is-closing');

    setTimeout(()=>{ if(mailto) window.location.href = mailto; }, 300);
    setTimeout(()=>{ form.classList.add('is-flying'); }, 400);

    setTimeout(()=>{
      try{ form.reset(); }catch(_){}
      form.classList.remove('is-closing','is-flying');
      void form.offsetWidth;
      form.classList.add('is-returning');
      setTimeout(()=>{ form.classList.remove('is-returning'); }, 1000);
    }, 1800);
  });
})();

// Efeito WhatsApp
const btnWhats = document.querySelector(".btn-whatsapp");
if (btnWhats) {
  btnWhats.addEventListener("mouseenter", () => {
    btnWhats.style.boxShadow = "0 0 12px rgba(37, 211, 102, 0.45)";
  });
  btnWhats.addEventListener("mouseleave", () => {
    btnWhats.style.boxShadow = "none";
  });
}
