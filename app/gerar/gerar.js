// ===== referências =====
const lista = document.getElementById('lista-compras');
const geladeiraScroll = document.getElementById('geladeira-scroll');
const btnVoltar = document.getElementById('btnVoltar');
const btnLogo = document.getElementById('btnLogo');
const btnGeladeira = document.getElementById('btnGeladeira');
const btnFiltros = document.querySelectorAll('.btn-filtro');

let selecionados = [];
let tipoReceita = ""; // "doce" | "salgado"

// ===== navegação do rodapé (estrutura nova) =====
btnVoltar?.addEventListener('click', () => {
  window.location.href = '../humor/index.html';
});
btnLogo?.addEventListener('click', () => {
  window.location.href = '../home/index.html';
});
btnGeladeira?.addEventListener('click', () => {
  window.location.href = '../geladeira/index.html';
});

// ===== carregar ingredientes da geladeira (legado + chave nova) =====
const getGeladeira = () => {
  const ordemChaves = ['got2cook_geladeira', 'geladeira'];
  for (const k of ordemChaves) {
    const raw = localStorage.getItem(k);
    if (raw) {
      try { return JSON.parse(raw); } catch { /* ignora e tenta próxima */ }
    }
  }
  return [];
};

const ingredientes = getGeladeira();

// monta grade de ingredientes
ingredientes.forEach((item) => {
  // aceita formatos {nome,url} ou {nome,img} ou {id,nome,url}
  const nome = item?.nome || 'ingrediente';
  const url = item?.url || item?.img || '';
  const div = document.createElement("div");
  div.className = "ingrediente";
  div.onclick = () => toggleIngrediente(div, nome);

  const img = document.createElement("img");
  img.src = url;
  img.alt = nome;

  const check = document.createElement("div");
  check.className = "check";

  div.appendChild(img);
  div.appendChild(check);
  geladeiraScroll.appendChild(div);
});

// selecionar/deselecionar ingrediente
function toggleIngrediente(elem, nome) {
  elem.classList.toggle('selected');

  if (elem.classList.contains('selected')) {
    selecionados.push(nome);
    const itemChip = document.createElement('p');
    itemChip.textContent = nome + ' ✔';
    itemChip.classList.add('ingrediente-item');
    itemChip.setAttribute('data-nome', nome);
    lista.appendChild(itemChip);
  } else {
    selecionados = selecionados.filter(n => n !== nome);
    const itemChip = lista.querySelector(`[data-nome="${nome}"]`);
    if (itemChip) itemChip.remove();
  }
}

// botões de filtro (DOCE/SALGADO)
btnFiltros.forEach(btn => {
  btn.addEventListener('click', () => {
    btnFiltros.forEach(b => b.classList.remove('ativo'));
    btn.classList.add('ativo');
    tipoReceita = btn.textContent.toLowerCase(); // "doce" | "salgado"
  });
});

// ===== gerar receita (placeholder) =====
function gerarReceita() {
  if (selecionados.length === 0) {
    alert("Selecione ao menos um ingrediente!");
    return;
  }
  if (!tipoReceita) {
    alert("Escolha se a receita é DOCE ou SALGADA!");
    return;
  }

  const receitaTemporaria = {
    titulo: "Receita Gerada com IA",
    tempo: "30 min",
    ingredientes: selecionados,
    tipo: tipoReceita,
    modoPreparo: "Misture os ingredientes selecionados e prepare ao seu gosto.",
    imagem: "../../assets/receita_exemplo.png"
  };

  localStorage.setItem("receita_temp", JSON.stringify(receitaTemporaria));

  // ajuste o destino quando a tela de visualização estiver pronta
  // exemplo sugerido: ../visualizar/index.html
  window.location.href = "../visualizar/index.html";
}

// expõe para o onclick do HTML
window.selecionarTipo = (t) => {
  // ativa visualmente o botão correspondente
  btnFiltros.forEach(b => {
    if (b.textContent.toLowerCase() === t) b.classList.add('ativo');
    else b.classList.remove('ativo');
  });
  tipoReceita = t;
};

window.gerarReceita = gerarReceita;
