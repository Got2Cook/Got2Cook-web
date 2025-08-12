// ===== Utilidades =====
const $ = (sel) => document.querySelector(sel);

function norm(str) {
  return (str || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function focusOnTitle() {
  const h1 = $("#tituloReceita");
  if (h1) {
    setTimeout(() => h1.focus(), 0);
  }
}

// ===== Carrega dados =====
function getReceitaTemp() {
  const raw = localStorage.getItem("receita_temp");
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (_) {}
  }

  // MOCK (compatível com sua estrutura)
  return {
    id: "mock-001",
    titulo: "Receita Exemplo",
    tempo: "30 min",
    dificuldade: "Fácil",
    porcoes: "2 porções",
    coverImg: "receita_exemplo.png",
    ingredientes: ["Arroz", "Frango", "Batata"],
    passos: [
      "Cozinhe o arroz até ficar macio.",
      "Tempere o frango e grelhe.",
      "Corte a batata em cubos e asse.",
      "Misture tudo e sirva."
    ],
    tipo: "salgado"
  };
}

function getGeladeira() {
  // Suporta chave nova e legada, mantendo igual ao seu gerar
  const nova = JSON.parse(localStorage.getItem("got2cook_geladeira") || "[]");
  let antiga = JSON.parse(localStorage.getItem("geladeira") || "[]");

  // Normaliza legado que pode ser array de strings
  antiga = antiga.map(it => {
    if (typeof it === "string") {
      return { nome: it.split("/").pop().split(".")[0].toLowerCase(), url: it, status: "ok" };
    }
    return it;
  });

  const juntos = [...nova, ...antiga];
  // Extrai nomes únicos normalizados
  const nomes = new Set(
    juntos
      .map(it => it?.nome || it?.title || it?.label || "")
      .map(norm)
      .filter(Boolean)
  );
  return { itens: juntos, nomes };
}

function getMinhasReceitas() {
  try {
    return JSON.parse(localStorage.getItem("got2cook_minhasReceitas") || "[]");
  } catch (_) {
    return [];
  }
}

function setMinhasReceitas(arr) {
  localStorage.setItem("got2cook_minhasReceitas", JSON.stringify(arr));
}

// ===== Renderização =====
function render() {
  const receita = getReceitaTemp();
  const { nomes: nomesGeladeira } = getGeladeira();

  // Compat: campos vindos da sua gerar (gerareceita.js)
  const titulo = receita.titulo || receita.nome || "Receita";
  const tempo = receita.tempo || "—";
  const dificuldade = receita.dificuldade || "—";
  const porcoes = receita.porcoes || "—";
  const cover = receita.coverImg || receita.imagem || "receita_exemplo.png";

  $("#tituloReceita").textContent = titulo;
  $("#coverReceita").src = cover;
  $("#coverReceita").alt = `Imagem da receita ${titulo}`;
  $("#metaTempo").textContent = `⏱️ ${tempo}`;
  $("#metaDificuldade").textContent = `• ${dificuldade}`;
  $("#metaPorcoes").textContent = `• ${porcoes}`;

  // Ingredientes (array pode ser de strings ou objetos)
  const listaIng = $("#listaIngredientes");
  listaIng.innerHTML = "";
  const itensReceita = (receita.ingredientes || []).map(it => {
    if (typeof it === "string") return { nome: it };
    return it;
  });

  itensReceita.forEach((ing) => {
    const nome = ing.nome || ing.titulo || ing.label || "";
    const tem = nomesGeladeira.has(norm(nome));
    const li = document.createElement("li");
    li.className = tem ? "tem" : "falta";
    li.innerHTML = `
      <span>${nome}</span>
      <span class="badge">${tem ? "Tenho ✔" : "Faltando"}</span>
    `;
    listaIng.appendChild(li);
  });

  // Passos: suporta array "passos" ou string "modoPreparo"
  const listaPassos = $("#listaPassos");
  listaPassos.innerHTML = "";
  let passos = receita.passos;
  if (!Array.isArray(passos) || !passos.length) {
    if (receita.modoPreparo) {
      passos = [receita.modoPreparo];
    } else {
      passos = ["Siga os passos básicos de preparo e ajuste ao seu gosto."];
    }
  }
  passos.forEach((p) => {
    const li = document.createElement("li");
    li.textContent = p;
    listaPassos.appendChild(li);
  });

  // Define estado inicial do coração
  updateCoracaoState(isSaved(receita));
}

// ===== Coração (salvar/remover) =====
function getReceitaKey(r) {
  return r.id ? `id:${r.id}` : `title:${norm(r.titulo || r.nome || "")}`;
}

function isSaved(receita) {
  const key = getReceitaKey(receita);
  return getMinhasReceitas().some(item => {
    const ikey = getReceitaKey(item);
    return ikey === key;
  });
}

function toggleSalvar() {
  const receita = getReceitaTemp();
  const salvas = getMinhasReceitas();
  const jaTem = isSaved(receita);

  if (jaTem) {
    const chave = getReceitaKey(receita);
    const filtrado = salvas.filter(item => getReceitaKey(item) !== chave);
    setMinhasReceitas(filtrado);
    updateCoracaoState(false);
    live("Receita removida de Minhas Receitas.");
  } else {
    // Gera id se não existir (compatível)
    if (!receita.id) receita.id = `r-${Date.now()}`;
    salvas.push(receita);
    setMinhasReceitas(salvas);
    updateCoracaoState(true);
    live("Receita salva em Minhas Receitas.");
  }
}

function updateCoracaoState(ativo) {
  const btn = $("#btnSalvar");
  if (!btn) return;
  btn.setAttribute("aria-pressed", ativo ? "true" : "false");
  const span = btn.querySelector(".coracao");
  if (span) span.textContent = ativo ? "♥" : "♡";
}

// ===== Compartilhar =====
async function compartilhar() {
  const receita = getReceitaTemp();
  const titulo = receita.titulo || "Receita";
  const tempo = receita.tempo || "";
  const txt = `Receita: ${titulo}\nTempo: ${tempo}\nIngredientes: ${(receita.ingredientes || []).map(i => typeof i === "string" ? i : i.nome).join(", ")}`;

  try {
    if (navigator.share) {
      await navigator.share({ title: titulo, text: txt });
    } else {
      await navigator.clipboard.writeText(txt);
      live("Resumo copiado para a área de transferência!");
      alert("Resumo copiado para a área de transferência!");
    }
  } catch (_) {}
}

// ===== Ler mais (expandir/colapsar) =====
function toggleLerMais() {
  const lista = $("#listaPassos");
  const btn = $("#btnLerMais");
  const aberto = lista.getAttribute("data-collapsed") === "false";
  lista.setAttribute("data-collapsed", aberto ? "true" : "false");
  btn.setAttribute("aria-expanded", aberto ? "false" : "true");
  btn.textContent = aberto ? "Ler mais" : "Ler menos";
}

// ===== A11y feedback =====
function live(msg) {
  const el = $("#liveMsg");
  if (!el) return;
  el.textContent = "";
  setTimeout(() => (el.textContent = msg), 30);
}

// ===== Eventos =====
document.addEventListener("DOMContentLoaded", () => {
  render();
  focusOnTitle();

  $("#btnSalvar")?.addEventListener("click", toggleSalvar);
  $("#btnSalvar")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); toggleSalvar();
    }
  });

  $("#btnCompartilhar")?.addEventListener("click", compartilhar);

  $("#btnLerMais")?.addEventListener("click", toggleLerMais);
  $("#btnLerMais")?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault(); toggleLerMais();
    }
  });
});
