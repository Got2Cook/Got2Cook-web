const wrap = document.querySelector(".geladeira-container");
const porta = document.getElementById("portaImagem");
const geladeiraAberta = document.getElementById("geladeiraAberta");
const conteudo = document.getElementById("conteudoGeladeira");
const popup = document.getElementById("popupGaleria");
const galeria = document.getElementById("galeriaIngredientes");
const campoBusca = document.getElementById("campoBusca");

let ingredientes = JSON.parse(localStorage.getItem("geladeira")) || [];

// Corrige ingredientes antigos
ingredientes = ingredientes.map(item => {
  if (typeof item === "string") {
    const nomeExtraido = item.split("/").pop().split(".")[0];
    return { nome: nomeExtraido.toLowerCase(), url: item };
  }
  return item;
});
localStorage.setItem("geladeira", JSON.stringify(ingredientes));

function normalizarTexto(texto) {
  return (texto || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

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

// Renderiza ingredientes
function renderIngredientes(filtro = "") {
  conteudo.innerHTML = "";
  const f = normalizarTexto(filtro);

  ingredientes
    .filter(item => normalizarTexto(item.nome).includes(f))
    .forEach((item, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "ingrediente-wrapper";

      const img = document.createElement("img");
      img.src = item.url;
      img.alt = item.nome;

      const btn = document.createElement("button");
      btn.className = "btn-remover";
      btn.textContent = "❌";
      btn.onclick = () => {
        ingredientes.splice(index, 1);
        localStorage.setItem("geladeira", JSON.stringify(ingredientes));
        renderIngredientes(campoBusca.value);
      };

      wrapper.appendChild(img);
      wrapper.appendChild(btn);
      conteudo.appendChild(wrapper);
    });

  const botao = document.createElement("button");
  botao.className = "botao-add";
  botao.innerHTML = "+";
  botao.onclick = abrirPopup;
  conteudo.appendChild(botao);
}

// Toggle da porta no mesmo lugar
porta.addEventListener("click", () => {
  wrap.classList.toggle("is-open");
});

// Popup
function abrirPopup() {
  popup.style.display = "block";
}
function fecharPopup() {
  popup.style.display = "none";
}
function adicionarDaGaleria(caminho, nome) {
  ingredientes.push({ nome: normalizarTexto(nome), url: caminho });
  localStorage.setItem("geladeira", JSON.stringify(ingredientes));
  renderIngredientes(campoBusca.value);
  fecharPopup();
}
function adicionarManual() {
  const nome = prompt("Digite o nome do ingrediente:");
  const url = prompt("Cole o caminho ou link da imagem PNG:");
  if (nome && url) {
    ingredientes.push({ nome: normalizarTexto(nome), url });
    localStorage.setItem("geladeira", JSON.stringify(ingredientes));
    renderIngredientes(campoBusca.value);
    fecharPopup();
  }
}

// Galeria
imagensGaleria.forEach(item => {
  const img = document.createElement("img");
  img.src = item.arquivo;
  img.alt = item.nome;
  img.onclick = () => adicionarDaGaleria(item.arquivo, item.nome);
  galeria.appendChild(img);
});

campoBusca.addEventListener("input", () => {
  renderIngredientes(campoBusca.value);
});

renderIngredientes();
