// ===== Referências =====
const titulo = document.getElementById("tituloReceita");
const cover  = document.getElementById("coverReceita");
const metaTempo = document.getElementById("metaTempo");
const metaDif   = document.getElementById("metaDificuldade");
const metaPor   = document.getElementById("metaPorcoes");

const ulIng   = document.getElementById("listaIngredientes");
const olPasso = document.getElementById("listaPassos");
const btnMais = document.getElementById("btnLerMais");

const btnSalvar = document.getElementById("btnSalvar");
const btnCompartilhar = document.getElementById("btnCompartilhar");
const liveMsg = document.getElementById("liveMsg");

// ===== Utils =====
function norm(s) {
  return (s || "")
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function setLS(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// ===== Dados =====
function getReceita() {
  const r = getLS("receita_temp", null);
  if (r && typeof r === "object") return r;
  // MOCK no seu formato
  return {
    id: "mock-001",
    titulo: "Receita Exemplo",
    tempo: "30 min",
    dificuldade: "Fácil",
    porcoes: "2 porções",
    imagem: "receita_exemplo.png",
    ingredientes: ["Arroz", "Frango", "Batata"],
    modoPreparo: "Cozinhe, tempere e misture tudo. Sirva quente."
  };
}

function getGeladeira() {
  // seu padrão: chave "geladeira"
  let lista = getLS("geladeira", []);
  // normaliza caso tenham strings
  return lista.map(it => {
    if (typeof it === "string") {
      return { nome: it.split("/").pop().split(".")[0] };
    }
    return it;
  });
}

// ===== Minhas Receitas (salvar/remover no seu app) =====
const KEY_SALVAS = "got2cook_minhasReceitas";

function getSalvas() {
  const arr = getLS(KEY_SALVAS, []);
  return Array.isArray(arr) ? arr : [];
}
function mesmaReceita(a, b) {
  if (!a || !b) return false;
  if (a.id && b.id) return a.id === b.id;
  return norm(a.titulo || a.nome) === norm(b.titulo || b.nome);
}
function isSalva(r) {
  return getSalvas().some(x => mesmaReceita(x, r));
}
function syncHeart(r) {
  const ativa = isSalva(r);
  btnSalvar.setAttribute("aria-pressed", ativa ? "true" : "false");
  const span = btnSalvar.querySelector(".coracao");
  if (span) span.textContent = ativa ? "♥" : "♡";
}
function toggleSalvar(r) {
  const arr = getSalvas();
  const i = arr.findIndex(x => mesmaReceita(x, r));
  if (i >= 0) {
    arr.splice(i, 1);
    setLS(KEY_SALVAS, arr);
    syncHeart(r);
    live("Receita removida de Minhas Receitas.");
  } else {
    if (!r.id) r.id = `r-${Date.now()}`;
    arr.push(r);
    setLS(KEY_SALVAS, arr);
    syncHeart(r);
    live("Receita salva em Minhas Receitas.");
  }
}

// ===== Render =====
function render() {
  const r = getReceita();
  const gel = getGeladeira();
  const nomesGel = new Set(gel.map(g => norm(g.nome)));

  // head
  titulo.textContent = r.titulo || "Receita";
  cover.src = r.imagem || r.coverImg || "receita_exemplo.png";
  cover.alt = `Imagem da receita ${r.titulo || ""}`;

  metaTempo.textContent = `⏱️ ${r.tempo || "—"}`;
  metaDif.textContent   = `• ${r.dificuldade || "—"}`;
  metaPor.textContent   = `• ${r.porcoes || "—"}`;

  // ingredientes
  ulIng.innerHTML = "";
  const listaR = Array.isArray(r.ingredientes) ? r.ingredientes : [];
  listaR.forEach(item => {
    const nome = typeof item === "string" ? item : (item.nome || item.label || "");
    const tenho = nomesGel.has(norm(nome));

    const li = document.createElement("li");
    li.className = tenho ? "tem" : "falta";
    li.innerHTML = `
      <span>${nome}</span>
      <span class="badge">${tenho ? "Tenho" : "Faltando"}</span>
    `;
    ulIng.appendChild(li);
  });

  // passos
  olPasso.innerHTML = "";
  const passos = Array.isArray(r.passos) && r.passos.length
    ? r.passos
    : (r.modoPreparo ? [r.modoPreparo] : ["Siga os passos básicos de preparo."]);
  passos.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p;
    olPasso.appendChild(li);
  });

  // coração
  syncHeart(r);

  // foco acessível
  setTimeout(() => { titulo.focus(); }, 0);
}

// ===== Ler mais =====
function toggleLerMais() {
  const aberto = olPasso.getAttribute("data-collapsed") === "false";
  olPasso.setAttribute("data-collapsed", aberto ? "true" : "false");
  btnMais.setAttribute("aria-expanded", aberto ? "false" : "true");
  btnMais.textContent = aberto ? "Ler mais" : "Ler menos";
}

// ===== Compartilhar =====
async function compartilhar() {
  const r = getReceita();
  const resumo =
    `Receita: ${r.titulo || ""}\n` +
    `Tempo: ${r.tempo || ""}\n` +
    `Ingredientes: ${(r.ingredientes || []).map(i => typeof i === "string" ? i : i.nome).join(", ")}\n\n` +
    `Modo de Preparo: ${(Array.isArray(r.passos) && r.passos[0]) || r.modoPreparo || ""}`;

  try {
    if (navigator.share) {
      await navigator.share({ title: r.titulo || "Receita", text: resumo });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(resumo);
      live("Resumo copiado para a área de transferência!");
      alert("Resumo copiado para a área de transferência!");
    } else {
      prompt("Copie o resumo:", resumo);
    }
  } catch (_) {}
}

// ===== A11y live =====
function live(msg) {
  if (!liveMsg) return;
  liveMsg.textContent = "";
  setTimeout(() => (liveMsg.textContent = msg), 30);
}

// ===== Eventos =====
document.addEventListener("DOMContentLoaded", () => {
  render();

  btnMais?.addEventListener("click", toggleLerMais);

  btnSalvar?.addEventListener("click", () => toggleSalvar(getReceita()));
  btnSalvar?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleSalvar(getReceita());
    }
  });

  btnCompartilhar?.addEventListener("click", compartilhar);
});
