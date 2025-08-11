// HOME — JS separado (sem frameworks)
// - Ajusta nome do usuário a partir do localStorage (fallback: "Usuário")
// - Liga/desliga menus (perfil e principal)
// - Botões do rodapé com a navegação do site
// - Botão central abre/fecha "acessos rápidos"

(function () {
  // Nome do usuário
  const nome = localStorage.getItem('got2cook_nome') || 'Usuário';
  const usuarioSpan = document.getElementById('usuario');
  const perfilNome = document.getElementById('perfil-nome');
  if (usuarioSpan) usuarioSpan.textContent = nome;
  if (perfilNome)  perfilNome.textContent = nome;

  // Menus (perfil e principal)
  const perfilBtn = document.getElementById("perfilBtn");
  const perfilMenu = document.getElementById("perfilMenu");
  const menuBtn = document.getElementById("menuBtn");
  const menuPrincipal = document.getElementById("menuPrincipal");

  if (perfilBtn && perfilMenu) {
    perfilBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      perfilMenu.classList.toggle("hidden");
      // Fecha o outro menu se estiver aberto
      if (!menuPrincipal?.classList.contains("hidden")) menuPrincipal.classList.add("hidden");
    });
  }

  if (menuBtn && menuPrincipal) {
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      menuPrincipal.classList.toggle("hidden");
      // Fecha o outro menu se estiver aberto
      if (!perfilMenu?.classList.contains("hidden")) perfilMenu.classList.add("hidden");
    });
  }

  // Fechar menus ao clicar fora
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".menu-perfil") && !e.target.closest("#perfilBtn")) {
      perfilMenu?.classList.add("hidden");
    }
    if (!e.target.closest(".menu-principal") && !e.target.closest("#menuBtn")) {
      menuPrincipal?.classList.add("hidden");
    }
  });

  // Rodapé: navegação
  const btnVoltar = document.getElementById("btnVoltar");
  const btnGeladeira = document.getElementById("btnGeladeira");
  const btnLogo = document.getElementById("btnLogo");
  const atalhos = document.getElementById("atalhosRapidos");

  btnVoltar?.addEventListener("click", () => {
    window.location.href = "../humor/index.html"; // voltar para Humor
  });

  btnGeladeira?.addEventListener("click", () => {
    window.location.href = "../geladeira/index.html"; // placeholder
  });

  // Central abre/fecha os atalhos (como no seu app)
  btnLogo?.addEventListener("click", () => {
    atalhos?.classList.toggle("mostrar");
  });
})();
