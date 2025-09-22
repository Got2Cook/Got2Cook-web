console.log("JS do Meu Plano carregado ✅");

function atualizarPlanoVisual() {
  const plano = localStorage.getItem('got2cook_plano') || 'Gratuito';

  const card = document.getElementById('planoAtualCard');
  const icone = document.getElementById('iconePlano');
  const nome = document.getElementById('planoAtual');

  // Visual do card topo
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

  // Data fictícia de renovação
  const hoje = new Date();
  hoje.setMonth(hoje.getMonth() + 1);
  document.getElementById('dataRenovacao').textContent =
    `Renovação: ${hoje.toLocaleDateString('pt-BR')}`;

  // Destaque do plano atual nos cards (desktop ganha glow; mobile mantém)
  const cardG = document.querySelector('.card-plano[data-plano="Gratuito"]');
  const cardP = document.querySelector('.card-plano[data-plano="Premium"]');
  [cardG, cardP].forEach(c => c && c.classList.remove('selecionado'));
  (plano === 'Premium' ? cardP : cardG)?.classList.add('selecionado');
}

// Botão Premium (placeholder)
function fazerLoginPremium() {
  alert("Faça login com sua conta Premium.\nSe ainda não assinou, acesse nosso site oficial.");
}

// Mudar para Gratuito (mobile e desktop)
function mudarParaGratuito() {
  localStorage.setItem('got2cook_plano', 'Gratuito');
  atualizarPlanoVisual();
  alert('Plano alterado para: Gratuito');
}

document.addEventListener('DOMContentLoaded', () => {
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
