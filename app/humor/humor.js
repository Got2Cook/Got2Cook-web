function selecionarHumor(emoji) {
  const resposta = document.getElementById('humorSelecionado');
  resposta.textContent = emoji;
  resposta.style.display = 'block';

  const hoje = new Date().toISOString().slice(0, 10); // Ex: "2025-07-30"

  // 🔹 Salva histórico completo
  let historico = JSON.parse(localStorage.getItem("historicoHumor")) || {};
  historico[hoje] = emoji;
  localStorage.setItem("historicoHumor", JSON.stringify(historico));

  // 🔹 Salva humor atual para o perfil
  localStorage.setItem("got2cook_humor", emoji);

  // Redireciona após 1 segundo
  setTimeout(() => {
    window.location.href = "../home/index.html"; // ajuste para a próxima tela
  }, 1000);
}

function pularHumor() {
  window.location.href = "../home/index.html"; // ajuste para a próxima tela
}
