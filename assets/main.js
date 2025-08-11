// Ano automático no rodapé
document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// (Opcional) Fallback de rolagem suave para navegadores antigos:
// Mantém acessibilidade e não fixa cores via JS.
(function enableSmoothScrollFallback() {
  if ("scrollBehavior" in document.documentElement.style) return;

  const anchorLinks = document.querySelectorAll('a[href^="#"]');
  anchorLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      const targetId = a.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top, left: 0 }); // sem comportamento suave se não suportado
    });
  });
})();
