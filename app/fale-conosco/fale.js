// Navegação do rodapé (mantida)
document.getElementById("btnVoltar")?.addEventListener("click", () => {
  window.location.href = "humor.html";
});
document.getElementById("btnLogo")?.addEventListener("click", () => {
  window.location.href = "home.html";
});
document.getElementById("btnGeladeira")?.addEventListener("click", () => {
  window.location.href = "minhageladeira.html";
});

// Envelope animado (restaurado)
(function(){
  const form = document.querySelector('.form-contato');
  const btn  = document.querySelector('.btn-enviar');
  if(!form || !btn) return;

  const mailto = btn.getAttribute('href') || '';

  btn.addEventListener('click', function(e){
    e.preventDefault();

    // 1) fecha o envelope (campos somem + aba aparece e fecha)
    form.classList.add('is-closing');

    // 2) dispara o mailto enquanto fecha (não bloqueia animação)
    setTimeout(()=>{ if(mailto) window.location.href = mailto; }, 300);

    // 3) envelope voa para a direita
    setTimeout(()=>{ form.classList.add('is-flying'); }, 400);

    // 4) após o voo, limpa e volta aberto
    setTimeout(()=>{
      try{ form.reset(); }catch(_){}
      form.classList.remove('is-closing','is-flying');

      // reflow para reiniciar animações
      void form.offsetWidth;

      form.classList.add('is-returning');
      setTimeout(()=>{ form.classList.remove('is-returning'); }, 1000);
    }, 1800); // sincronizado com o CSS (1.5s voo + início/fechamento)
  });
})();

// Efeito sutil no botão WhatsApp (opcional)
const btnWhats = document.querySelector(".btn-whatsapp");
if (btnWhats) {
  btnWhats.addEventListener("mouseenter", () => {
    btnWhats.style.boxShadow = "0 0 12px rgba(37, 211, 102, 0.45)";
  });
  btnWhats.addEventListener("mouseleave", () => {
    btnWhats.style.boxShadow = "none";
  });
}
