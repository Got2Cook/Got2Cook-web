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
const metaPor = $("#metaPorcoes"); // agora exibe Humor
const textoReceita = $("#textoReceita");
const olIng = $("#listaIngredientes");   // <ol>
const olPasso = $("#listaPassos");       // <ol>
const btnMais = $("#btnLerMais");
const btnSalvar = $("#btnSalvar");
const btnGerar = $("#btnGerarNovamente");
const liveMsg = $("#liveMsg");

// Navegação rodapé
$("#btnVoltar")?.addEventListener("click", () => { window.location.href = "../humor/"; });
$("#btnLogo")?.addEventListener("click",   () => { window.location.href = "../gerar/"; });
$("#btnGeladeira")?.addEventListener("click", () => { window.location.href = "../geladeira/"; });

// ===== Dados =====
function getReceita(){
  const r = getLS("receita_temp", null);
  if (r && typeof r === "object") return r;

  // Fallback simples com quantidades e humor
  return {
    id: "mock-001",
    titulo: "Receita Gerada",
    tempo: "30 min",
    dificuldade: "Fácil",
    humor: "Conforto 😊",
    coverImg: "../../assets/receita_exemplo.png",
    ingredientes: [
      { nome: "Farinha", quantidade: "2", unidade: "xícaras" },
      { nome: "Leite", quantidade: "200", unidade: "ml" },
      { nome: "Ovos", quantidade: "2" },
      { nome: "Sal", quantidade: "1", unidade: "pitada" }
    ],
    passos: [
      "Misture os ingredientes secos.",
      "Adicione os líquidos aos poucos, mexendo.",
      "Leve ao fogo até ganhar consistência.",
      "Sirva em seguida."
    ]
  };
}

// ===== Helpers =====
const KEY_SALVAS = "got2cook_minhasReceitas";
function getSalvas(){ const a=getLS(KEY_SALVAS,[]); return Array.isArray(a)?a:[]; }
function mesmaReceita(a,b){ if(!a||!b) return false; if(a.id&&b.id) return a.id===b.id; return norm(a.titulo||a.nome)===norm(b.titulo||b.nome); }
function isSalva(r){ return getSalvas().some(x=>mesmaReceita(x,r)); }
function syncHeart(r){ const on=isSalva(r); btnSalvar.setAttribute("aria-pressed", on?"true":"false"); btnSalvar.querySelector(".coracao").textContent = on?"♥":"♡"; }
function toggleSalvar(r){
  const arr=getSalvas(); const i=arr.findIndex(x=>mesmaReceita(x,r));
  if(i>=0){ arr.splice(i,1); setLS(KEY_SALVAS,arr); syncHeart(r); live("Removida de Minhas Receitas."); }
  else { if(!r.id) r.id=`r-${Date.now()}`; arr.push(r); setLS(KEY_SALVAS,arr); syncHeart(r); live("Salva em Minhas Receitas."); }
}

function fmtIngrediente(it){
  if (typeof it === "string") return it;
  const nome = it.nome || it.name || it.ingrediente || it.item || "";
  const qtd  = it.quantidade || it.qtd || it.qtde || it.amount || it.qtdade || "";
  const unit = it.unidade || it.unit || it.medida || it.measure || "";
  const hasQtd = (qtd && String(qtd).trim());
  const hasUnit = (unit && String(unit).trim());
  if (hasQtd && hasUnit) return `${qtd} ${unit} ${nome}`.replace(/\s+/g," ").trim();
  if (hasQtd)            return `${qtd} ${nome}`.replace(/\s+/g," ").trim();
  if (hasUnit)           return `${unit} ${nome}`.replace(/\s+/g," ").trim();
  return nome || "";
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

  // Ingredientes (lista numerada, mesmo estilo dos passos)
  olIng.innerHTML = "";
  const listaIng = Array.isArray(r.ingredientes) ? r.ingredientes : [];
  listaIng.forEach(item => {
    const li = document.createElement("li");
    li.textContent = fmtIngrediente(item);
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

  // Coração
  syncHeart(r);

  // Foco acessível
  setTimeout(() => hTitulo.focus(), 0);
}

// ===== Ler mais: só ativa/desativa rolagem do container =====
function toggleLerMais(){
  const on = textoReceita.getAttribute("data-scroll") === "on";
  textoReceita.setAttribute("data-scroll", on ? "off" : "on");
  btnMais.setAttribute("aria-expanded", on ? "false" : "true");
  btnMais.textContent = on ? "Ler mais" : "Ler menos";
}

// ===== A11y =====
function live(msg){ if(!liveMsg) return; liveMsg.textContent=""; setTimeout(()=>liveMsg.textContent=msg, 30); }

// ===== Eventos =====
document.addEventListener("DOMContentLoaded", ()=>{
  render();

  btnMais?.addEventListener("click", toggleLerMais);

  btnSalvar?.addEventListener("click", ()=>toggleSalvar(getReceita()));
  btnSalvar?.addEventListener("keydown", e=>{
    if(e.key==="Enter"||e.key===" "){ e.preventDefault(); toggleSalvar(getReceita()); }
  });

  btnGerar?.addEventListener("click", ()=>{
    window.location.href = "../gerar/"; // troque para ../home/ se preferir
  });
});
