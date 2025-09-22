console.log("JS do Meu Plano carregado ✅");

// 🔹 Controle de proteção de página
const protegerPagina = true; // altere para false se quiser liberar acesso sem login

function atualizarPlanoVisual() {
  const plano = localStorage.getItem('got2cook_plano') || 'Gratuito';
  const card = document.getElementById('planoAtualCard');
  const icone = document.getElementById('iconePlano');
  const nome = document.getElementById('planoAtual');

  // Remove classes antigas
  card.classList.remove('plano-gratuito', 'plano-premium');

  if (plano === 'Premium') {
    card.classList.add('plano-premium');
    icone.textContent = '👑';
    nome.textContent = 'Premium ✅';
  } else {
    card.classList.add('plano-gratuito');
    icone.textContent = '🥗';
    nome.textContent = 'Gratuito ✅';
  }

  // Atualiza data fictícia de renovação
  const hoje = new Date();
  hoje.setMonth(hoje.getMonth() + 1);
  document.getElementById('dataRenovacao').textContent =
    `Renovação: ${hoje.toLocaleDateString('pt-BR')}`;
}

// Botão Premium
function fazerLoginPremium() {
  alert("Faça login com sua conta Premium.\nSe ainda não assinou, acesse nosso site oficial.");
  // Aqui futuramente entra o login real
}

document.addEventListener('DOMContentLoaded', () => {
  // 🔹 Proteção de página: só abre se estiver logado
  if (protegerPagina) {
    const logado = localStorage.getItem('usuarioLogado') === 'true';
    if (!logado) {
      alert("Você precisa estar logado para acessar esta página.");
      window.location.href = "index.html"; // volta para login
      return;
    }
  }

  // Atualiza card do plano ao abrir
  atualizarPlanoVisual();
});

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
