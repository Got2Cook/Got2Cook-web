function voltarPagina() {
  // Tenta recuperar página anterior salva
  const origem = localStorage.getItem("pagina_origem");

  if (origem) {
    window.location.href = origem; // volta exatamente para a página que o usuário estava
    localStorage.removeItem("pagina_origem"); // limpa para não acumular
  } else if (document.referrer) {
    window.location.href = document.referrer; // fallback para o histórico
  } else {
    window.location.href = "perfil.html"; // se abriu direto, vai para perfil
  }
}
