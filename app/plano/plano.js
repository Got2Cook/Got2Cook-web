console.log("Gerenciar Plano - JS carregado ✅");

// Dados mock dos planos (base fiel ao seu padrão)
const PLANOS = {
  "Gratuito": {
    beneficios: [
      "3 receitas por dia",
      "Sem favoritos",
      "Sem relatórios",
      "Sem histórico de humor completo",
      "Sem suporte prioritário"
    ],
    valor: "R$ 0/mês",
    icone: "🥗",
    tema: "gratuito"
  },
  "Premium": {
    beneficios: [
      "Receitas ilimitadas",
      "Salvar favoritas",
      "Relatórios detalhados",
      "Histórico de humor completo",
      "Suporte prioritário"
    ],
    valor: "R$ 9,90/mês",
    icone: "👑",
    tema: "premium"
  }
};

// Atualiza o card superior com base no localStorage
function atualizarPlanoVisual() {
  const plano = localStorage.getItem("got2cook_plano") || "Gratuito";

  const card = document.getElementById("planoAtualCard");
  const icone = document.getElementById("iconePlano");
  const nome = document.getElementById("planoAtual");
  const renov = document.getElementById("dataRenovacao");
  const status = document.getElementById("statusPlano");

  // tema visual simples
  card.classList.remove("tema-premium","tema-gratuito");
  card.classList.add(plano === "Premium" ? "tema-premium" : "tema-gratuito");

  icone.textContent = PLANOS[plano].icone;
  nome.textContent = `${plano} ✅`;

  const validade = new Date();
  validade.setMonth(validade.getMonth() + 1);
  const dataStr = validade.toLocaleDateString("pt-BR");
  renov.textContent = `Renovação: ${dataStr}`;
  status.textContent = `Seu plano atual é válido até ${dataStr}`;

  // Box detalhe
  document.getElementById("nomePlanoBox").textContent = plano;
  document.getElementById("valorPlanoBox").textContent = PLANOS[plano].valor;

  const ul = document.getElementById("beneficiosBox");
  ul.innerHTML = "";
  PLANOS[plano].beneficios.forEach(b => {
    const li = document.createElement("li");
    li.textContent = b;
    ul.appendChild(li);
  });
}

// Ações dos botões (placeholders sem backend)
function bindBotoes() {
  document.getElementById("btnAlterar").addEventListener("click", () => {
    const atual = localStorage.getItem("got2cook_plano") || "Gratuito";
    const novo = atual === "Gratuito" ? "Premium" : "Gratuito";
    localStorage.setItem("got2cook_plano", novo);
    atualizarPlanoVisual();
    alert(`Plano alterado para: ${novo}`);
  });

  document.getElementById("btnCancelar").addEventListener("click", () => {
    const atual = localStorage.getItem("got2cook_plano") || "Gratuito";
    if (atual === "Gratuito") {
      alert("Você já está no plano Gratuito.");
      return;
    }
    localStorage.setItem("got2cook_plano", "Gratuito");
    atualizarPlanoVisual();
    alert("Assinatura cancelada. Você voltou ao plano Gratuito.");
  });

  document.getElementById("btnHistorico").addEventListener("click", () => {
    alert("Histórico de pagamentos indisponível no momento.");
  });
}

// Navegação do rodapé (conforme solicitado)
function bindRodape() {
  document.getElementById("btnVoltar").addEventListener("click", () => {
    window.location.href = "../config/index.html";
  });
  document.getElementById("btnLogo").addEventListener("click", () => {
    window.location.href = "../minhas-receitas/index.html";
  });
  document.getElementById("btnGeladeira").addEventListener("click", () => {
    window.location.href = "../geladeira/index.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  atualizarPlanoVisual();
  bindBotoes();
  bindRodape();
});
