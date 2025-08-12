// ====== MINHA GELADEIRA (toggle no MESMO lugar + expandir) ======

const wrap        = document.getElementById("geladeiraWrap");
const porta       = document.getElementById("portaImagem");
const interior    = document.getElementById("geladeiraAberta");
const conteudo    = document.getElementById("conteudoGeladeira");
const popup       = document.getElementById("popupGaleria");
const galeria     = document.getElementById("galeriaIngredientes");
const campoBusca  = document.getElementById("campoBusca");
const btnExpandir = document.getElementById("btnExpandir");

// Estado persistente (SEM mudar seu storage de itens)
const LS_PORTA   = "got2cook_portaGeladeiraAberta";
const LS_EXPAND  = "got2cook_geladeiraExpandida";

// Ingredientes (mantém sua chave antiga)
let ingredientes = JSON.parse(localStorage.getItem("geladeira")) || [];

// Corrige itens antigos em string
ingredientes = ingredientes.map(item => {
  if (typeof item === "string") {
    const nomeExtraido = item.split("/").pop().split(".")[0];
    return { nome: nomeExtraido.toLowerCase(), url: item };
  }
  return item;
});
localStorage.setItem("geladeira", JSON.stringify(ingredientes));

// Normaliza texto
function normalizarTexto(texto) {
  return (texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

// Catálogo da galeria (mantém seus nomes/arquivos)
const imagensGaleria = [
  { nome: "Tomate", arquivo: "tomate.png" },
  { nome: "Alface", arquivo: "alface.png" },
  { nome: "Chocolate", arquivo: "chocolate.png" },
  { nome: "Ovo", arquivo: "ovo.png" },
  { nome: "Cenoura", arquivo: "cenoura.png" },
  { nome: "Banana", arquivo: "banana.png" },
  { nome: "Maçã", arquivo: "maca.png" },
  { nome: "Limão", arquivo: "limao.png" },
  { nome: "Carne", arquivo: "carne.png" },
  { nome: "Leite", arquivo: "leite.png" },
  { nome: "Arroz", arquivo: "arroz.png" },
  { nome: "Pão", arquivo: "pao.png" }
];

// ===== Porta no MESMO lugar (toggle + persistência) =====
let portaAberta = JSON.parse(localStorage.getItem(LS_PORTA) || "false");
let expandida   = JSON.parse(localStorage.getItem(LS_EXPAND) || "false");

function aplicarEstadoUI() {
  if (!wrap) return;
  wrap.classList.toggle("is-open", portaAberta);
  wrap.classList.toggle("is-expanded", expandida);
  if (interior) interior.setAttribute("aria-hidden", portaAberta ? "false" : "true");
  if (btnExpandir) {
    btnExpandir.setAttribute("aria-pressed", expandida ? "true" : "false");
    btnExpandir.textContent = expandida ? "↕ Recolher" : "↕ Expandir";
  }
}

porta?.addEventListener("click", () => {
  portaAberta = !portaAberta;
  localStorage.setItem(LS_PORTA, JSON.stringify(portaAberta));
  aplicarEstadoUI();
});

btnExpandir?.addEventListener("click", () => {
  expandida = !expandida;
  localStorage.setItem(LS_EXPAND, JSON.stringify(expandida));
  aplicarEstadoUI();
});

// ===== Render da geladeira =====
function renderIngredientes(filtro = "") {
  if (!conteudo) return;
  conteudo.innerHTML = "";
  const f = normalizarTexto(filtro);

  ingredientes
    .filter((item) => normalizarTexto(item.nome).includes(f))
    .forEach((item, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "ingrediente-wrapper";

      const img = document.createElement("img");
      img.src = item.url;
      img.alt = item.nome;
      img.onerror = () => { img.style.display = "none"; };

      const btn = document.createElement("button");
      btn.className = "btn-remover";
      btn.textContent = "❌";
      btn.onclick = (e) => {
        e.stopPropagation();
        ingredientes.splice(index, 1);
        localStorage.setItem("geladeira", JSON.stringify(ingredientes));
        renderIngredientes(campoBusca.value);
      };

      // Clique curto alterna "ok/acabou" (visual leve: opacidade)
      wrapper.addEventListener("click", () => {
        // Alterna um flag leve só para visual (sem mudar sua estrutura)
        if (wrapper.style.opacity === "0.55") wrapper.style.opacity = "";
        else wrapper.style.opacity = "0.55";
      });

      // Long-press remove também
      let timer = null;
      const start = () => { timer = setTimeout(() => btn.click(), 650); };
      const cancel = () => { clearTimeout(timer); };
      wrapper.addEventListener("mousedown", start);
      wrapper.addEventListener("touchstart", start, { passive: true });
      ["mouseup", "mouseleave", "touchend", "touchcancel"].forEach(ev => wrapper.addEventListener(ev, cancel));

      wrapper.appendChild(img);
      wrapper.appendChild(btn);
      conteudo.appendChild(wrapper);
    });
}

// ===== Popup da galeria =====
function abrirPopup() { if (popup) popup.style.display = "block"; }
function fecharPopup() { if (popup) popup.style.display = "none"; }
window.abrirPopup = abrirPopup;   // mantém sua chamada inline no HTML
window.fecharPopup = fecharPopup;

function adicionarDaGaleria(caminho, nome) {
  ingredientes.push({ nome: normalizarTexto(nome), url: caminho });
  localStorage.setItem("geladeira", JSON.stringify(ingredientes));
  renderIngredientes(campoBusca?.value || "");
  fecharPopup();
}
window.adicionarDaGaleria = adicionarDaGaleria;

function adicionarManual() {
  const nome = prompt("Digite o nome do ingrediente:");
  const url = prompt("Cole o caminho ou link da imagem PNG:");
  if (nome && url) {
    ingredientes.push({ nome: normalizarTexto(nome), url });
    localStorage.setItem("geladeira", JSON.stringify(ingredientes));
    renderIngredientes(campoBusca?.value || "");
    fecharPopup();
  }
}
window.adicionarManual = adicionarManual;

// Carrega galeria (se existir o contêiner)
if (galeria) {
  galeria.innerHTML = "";
  imagensGaleria.forEach((item) => {
    const img = document.createElement("img");
    img.src = item.arquivo;
    img.alt = item.nome;
    img.onclick = () => adicionarDaGaleria(item.arquivo, item.nome);
    galeria.appendChild(img);
  });
}

// Busca
campoBusca?.addEventListener("input", () => renderIngredientes(campoBusca.value));

// Init
document.addEventListener("DOMContentLoaded", () => {
  aplicarEstadoUI();
  renderIngredientes();
});
