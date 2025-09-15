// Navegação do rodapé (sem localStorage)
(function(){
  const $ = (sel) => document.querySelector(sel);

  const voltar   = $("#btnVoltar");
  const logo     = $("#btnLogo");
  const geladeira= $("#btnGeladeira");

  if (voltar)    voltar.addEventListener("click",   () => location.href = "../config/index.html");
  if (logo)      logo.addEventListener("click",     () => location.href = "../minhas-receitas/index.html");
  if (geladeira) geladeira.addEventListener("click",() => location.href = "../geladeira/index.html");
})();
