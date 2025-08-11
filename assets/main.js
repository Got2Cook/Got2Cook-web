// Ano automático no rodapé
document.addEventListener("DOMContentLoaded", () => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});

// Fallback simples para rolagem suave (quando CSS não suportar)
(function enableSmoothScrollFallback() {
  if ("scrollBehavior" in document.documentElement.style) return;
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top, left: 0 });
    });
  });
})();
