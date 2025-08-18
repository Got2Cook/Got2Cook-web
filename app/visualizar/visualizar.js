// ===== Utilitários =====
const $ = (sel) => document.querySelector(sel);
function getLS(key, fb){ try { return JSON.parse(localStorage.getItem(key)) ?? fb; } catch { return fb; } }
function setLS(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
function norm(s){ return (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase(); }

// ===== Refs =====
const hTitulo = $("#tituloReceita");
const imgCover = $("#coverReceita");
const metaTempo = $("#metaTempo");
const metaDif = $("#metaDificuldade");
const metaPor = $("#metaPorcoes"); // mostra Humor
const textoReceita = $("#textoReceita");
const olIng = $("#listaIngredientes");   // <ol>
const olPasso = $("#listaPassos");       // <ol>
const btnMais = $("#btnLerMais");
const btnSalvar = $("#btnSalvar");
const btnGerar = $("#btnGerarNovamente");

// Rodapé
$("#btnVoltar")?.addEventListener("click", () => { window.location.href = "../humor/"; });
$("#btnLogo")?.addEventListener("click",   () => { window.location.href = "../gerar/"; });
$("#btnGeladeira")?.addEventListener("click", () => { window.location.href = "../geladeira/"; });

// ===== Dados =====
function getReceita(){
  const r = getLS("receita_temp", null);
  if (r && typeof r === "object") return r;
  return {
    id: "mock-001",
    titulo: "Receita Gerada",
    tempo: "30 min",
    dificuldade: "Fácil",
    humor: "Conforto 😊",
    coverImg: "../../assets/receita_exemplo.png",
    ingredientes: [
      { nome: "1 xícara de arroz cru" },
      { nome: "200g de carne em cubos ou desfiada (pode ser sobra de churrasco)" },
      { nome: "1 pimenta fresca ou seca picada (dedo-de-moça, calabresa, etc.)" }
    ],
    passos: [
      "Misture os ingredientes secos.",
      "Adicione os líquidos aos poucos, mexendo.",
      "Leve ao fogo até ganhar consistência.",
      "Sirva em seguida."
    ]
  };
}

// ===== Favoritar =====
const KEY_SALVAS = "got2cook_minhasReceitas";
function getSalvas(){ const a=getLS(KEY_SALVAS,[]); return Array.isArray(a)?a:[]; }
function mesmaReceita(a,b){ if(!a||!b) return false; if(a.id&&b.id) return a.id===b.id; return norm(a.titulo||a.nome)===norm(b.titulo||b.nome); }
function isSalva(r){ return getSalvas().some(x=>mesmaReceita(x,r)); }
function syncHeart(r){
  const on = isSalva(r);
  btnSalvar.setAttribute("aria-pressed", on ? "true" : "false");
  btnSalvar.querySelector(".coracao").textContent = on ? "♥" : "♡";
}
function toggleSalvar(r){
  const arr = getSalvas();
  const i = arr.findIndex(x=>mesmaReceita(x,r));
  if(i>=0){ arr.splice(i,1); setLS(KEY_SALVAS,arr); syncHeart(r); }
  else { if(!r.id) r.id=`r-${Date.now()}`; arr.push(r); setLS(KEY_SALVAS,arr); syncHeart(r); }
}

// ===== Render =====
function render(){
  const r = getReceita();

  // Título fixo
  hTitulo.textContent = "RECEITA GERADA";

  // Capa e metas
  imgCover.src = r.coverImg || r.imagem || "../../assets/receita_exemplo.png";
  imgCover.alt = `Imagem da receita ${r.titulo || ""}`;
  metaTempo.textContent = `⏱️ ${r.tempo || "—"}`;
  metaDif.textContent   = `Dificuldade ${r.dificuldade || "—"}`;

  // Humor (no lugar de Porções)
  let humorTxt = "";
  if (Array.isArray(r.humores)) humorTxt = r.humores.join(", ");
  else humorTxt = r.humor || "—";
  metaPor.textContent = `Humor ${humorTxt}`;

  // Ingredientes
  olIng.innerHTML = "";
  const listaIng = Array.isArray(r.ingredientes) ? r.ingredientes : [];
  listaIng.forEach(item => {
    const li = document.createElement("li");
    li.textContent = typeof item === "string" ? item : (item.nome || "");
    olIng.appendChild(li);
  });

  // Passos
  olPasso.innerHTML = "";
  const passos = Array.isArray(r.passos) && r.passos.length
    ? r.passos
    : (r.modoPreparo ? [r.modoPreparo] : ["Siga os passos básicos de preparo."]);
  passos.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p;
    olPasso.appendChild(li);
  });

  syncHeart(r);
  setTimeout(() => hTitulo.focus(), 0);
}

// ===== Ler mais =====
function toggleLerMais(){
  const on = textoReceita.getAttribute("data-scroll") === "on";
  textoReceita.setAttribute("data-scroll", on ? "off" : "on");
  document.getElementById("btnLerMais").setAttribute("aria-expanded", on ? "false" : "true");
  document.getElementById("btnLerMais").textContent = on ? "Ler mais" : "Ler menos";
}

// ===== Eventos =====
document.addEventListener("DOMContentLoaded", ()=>{
  render();

  document.getElementById("btnLerMais")?.addEventListener("click", toggleLerMais);

  btnSalvar?.addEventListener("click", ()=>toggleSalvar(getReceita()));
  btnSalvar?.addEventListener("keydown", e=>{
    if(e.key==="Enter"||e.key===" "){ e.preventDefault(); toggleSalvar(getReceita()); }
  });

  // Gerar novamente
  document.getElementById("btnGerarNovamente")?.addEventListener("click", ()=>{
    window.location.href = "../gerar/"; // ajuste p/ ../home/ se preferir
  });
});
