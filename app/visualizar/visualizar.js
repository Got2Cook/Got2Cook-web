console.log("visualizar.js build", Date.now());
// ===== Utilitários =====
const $ = (sel) => document.querySelector(sel);
function getLS(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
  catch { return fallback; }
}
function setLS(key, val) { localStorage.setItem(key, JSON.stringify(val)); }
function norm(s){ return (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase(); }

// ===== Refs =====
const hTitulo   = $("#tituloReceita");
const imgCover  = $("#coverReceita");
const metaTempo = $("#metaTempo");
const metaDif   = $("#metaDificuldade");
const metaPor   = $("#metaPorcoes");

const ulIng   = $("#listaIngredientes");
const olPasso = $("#listaPassos");
const btnMais = $("#btnLerMais");

const btnSalvar = $("#btnSalvar");
const liveMsg   = $("#liveMsg");

// Rodapé (padrão)
const btnVoltar    = $("#btnVoltar");
const btnLogo      = $("#btnLogo");
const btnGeladeira = $("#btnGeladeira");

// ===== Dados =====
function getReceita() {
  const r = getLS("receita_temp", null);
  if (r && typeof r === "object") return r;
  // Fallback simples para teste
  return {
    id: "mock-001",
    titulo: "Receita Gerada",
    tempo: "30 min",
    dificuldade: "Fácil",
    porcoes: "2 porções",
    coverImg: "../../assets/receita_exemplo.png",
    ingredientes: ["Ingrediente 1", "Ingrediente 2", "Ingrediente 3"],
    passos: [
      "Passo 1 da receita.",
      "Passo 2 da receita.",
      "Passo 3 da receita.",
      "Passo 4 da receita (texto longo)."
    ]
  };
}

// ===== Minhas Receitas =====
const KEY_SALVAS = "got2cook_minhasReceitas";
function getSalvas(){ const a=getLS(KEY_SALVAS,[]); return Array.isArray(a)?a:[]; }
function mesmaReceita(a,b){
  if(!a||!b) return false;
  if(a.id&&b.id) return a.id===b.id;
  return norm(a.titulo||a.nome)===norm(b.titulo||b.nome);
}
function isSalva(r){ return getSalvas().some(x=>mesmaReceita(x,r)); }
function syncHeart(r){
  const on = isSalva(r);
  btnSalvar.setAttribute("aria-pressed", on ? "true" : "false");
  btnSalvar.querySelector(".coracao").textContent = on ? "♥" : "♡";
}
function toggleSalvar(r){
  const arr = getSalvas();
  const i = arr.findIndex(x=>mesmaReceita(x,r));
  if(i>=0){
    arr.splice(i,1);
    setLS(KEY_SALVAS,arr);
    syncHeart(r);
    live("Removida de Minhas Receitas.");
  }else{
    if(!r.id) r.id=`r-${Date.now()}`;
    arr.push(r);
    setLS(KEY_SALVAS,arr);
    syncHeart(r);
    live("Salva em Minhas Receitas.");
  }
}

// ===== Render =====
function render(){
  const r = getReceita();

  // Título fixo
  hTitulo.textContent = "RECEITA GERADA";

  // Capa e metas
  imgCover.src = r.coverImg || r.imagem || "../../assets/receita_exemplo.png";
  imgCover.alt = `Imagem da receita ${r.titulo||""}`;
  metaTempo.textContent = `⏱️ ${r.tempo || "—"}`;
  metaDif.textContent   = `• ${r.dificuldade || "—"}`;
  metaPor.textContent   = `• ${r.porcoes || "—"}`;

  // Ingredientes (sem status)
  ulIng.innerHTML = "";
  const listaR = Array.isArray(r.ingredientes)? r.ingredientes : [];
  listaR.forEach(item=>{
    const nome = typeof item==="string" ? item : (item.nome || item.label || "");
    const li = document.createElement("li");
    li.innerHTML = `<span>${nome}</span>`;
    ulIng.appendChild(li);
  });

  // Passos
  olPasso.innerHTML = "";
  const passos = Array.isArray(r.passos)&&r.passos.length
    ? r.passos
    : (r.modoPreparo ? [r.modoPreparo] : ["Siga os passos básicos de preparo."]);
  passos.forEach(p=>{
    const li=document.createElement("li");
    li.textContent=p;
    olPasso.appendChild(li);
  });

  // Coração
  syncHeart(r);

  // Acessibilidade: foco no título
  setTimeout(()=>hTitulo.focus(),0);
}

// ===== Ler mais =====
function toggleLerMais(){
  const open = olPasso.getAttribute("data-collapsed")==="false";
  olPasso.setAttribute("data-collapsed", open ? "true":"false");
  btnMais.setAttribute("aria-expanded", open ? "false":"true");
  btnMais.textContent = open ? "Ler mais" : "Ler menos";
}

// ===== A11y =====
function live(msg){
  if(!liveMsg) return;
  liveMsg.textContent="";
  setTimeout(()=>liveMsg.textContent=msg, 30);
}

// ===== Navegação do rodapé =====
btnVoltar?.addEventListener("click", ()=>{ window.location.href="../humor/index.html"; });
btnLogo?.addEventListener("click",   ()=>{ window.location.href="../gerar/index.html"; });
btnGeladeira?.addEventListener("click", ()=>{ window.location.href="../geladeira/index.html"; });

// ===== Eventos =====
document.addEventListener("DOMContentLoaded", ()=>{
  render();
  btnMais?.addEventListener("click", toggleLerMais);
  btnSalvar?.addEventListener("click", ()=>toggleSalvar(getReceita()));
  btnSalvar?.addEventListener("keydown", e=>{
    if(e.key==="Enter"||e.key===" "){ e.preventDefault(); toggleSalvar(getReceita()); }
  });
});
