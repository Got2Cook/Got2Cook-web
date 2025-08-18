// ===== Utilitários =====
const $ = (sel) => document.querySelector(sel);
function getLS(key, fb){ try { return JSON.parse(localStorage.getItem(key)) ?? fb; } catch { return fb; } }
function setLS(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
function norm(s){ return (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase(); }

// ===== Refs =====
const hTitulo      = $("#tituloReceita");
const imgCover     = $("#coverReceita");
const metaTempo    = $("#metaTempo");
const metaDif      = $("#metaDificuldade");
const metaPor      = $("#metaPorcoes"); // exibe Humor
const textoReceita = $("#textoReceita");
const olIng        = $("#listaIngredientes");
const olPasso      = $("#listaPassos");
const btnMais      = $("#btnLerMais");
const btnSalvar    = $("#btnSalvar");
const btnGerar     = $("#btnGerarNovamente");

// Rodapé
const navCurva     = document.querySelector("nav.curva");
const btnVoltar    = document.getElementById("btnVoltar");
const btnLogo      = document.getElementById("btnLogo");
const btnGeladeira = document.getElementById("btnGeladeira");

// ===== navegação do rodapé (estrutura nova) =====
btnVoltar?.addEventListener('click', () => {
  window.location.href = '../humor/index.html';
});
btnLogo?.addEventListener('click', () => {
  window.location.href = '../home/index.html'; // conforme você definiu
});
btnGeladeira?.addEventListener('click', () => {
  window.location.href = '../geladeira/index.html';
});

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

  hTitulo.textContent = "RECEITA GERADA";

  imgCover.src = r.coverImg || r.imagem || "../../assets/receita_exemplo.png";
  imgCover.alt = `Imagem da receita ${r.titulo || ""}`;
  metaTempo.textContent = `⏱️ ${r.tempo || "—"}`;
  metaDif.textContent   = `Dificuldade ${r.dificuldade || "—"}`;

  // Humor (no lugar de Porções)
  const humorTxt = Array.isArray(r.humores) ? r.humores.join(", ") : (r.humor || "—");
  metaPor.textContent = `Humor ${humorTxt}`;

  // Ingredientes
  olIng.innerHTML = "";
  (Array.isArray(r.ingredientes) ? r.ingredientes : []).forEach(item => {
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
  btnMais.setAttribute("aria-expanded", on ? "false" : "true");
  btnMais.textContent = on ? "Ler mais" : "Ler menos";
}

/* ===== Fix de rodapé: força medidas exatas da tela GERAR =====
   Usamos style.setProperty(..., 'important') para vencer QUALQUER CSS. */
function fixFooter(){
  const setImp = (el, prop, val) => el?.style.setProperty(prop, val, 'important');

  // nav.curva (curvatura/altura)
  if (navCurva){
    setImp(navCurva, 'width', '100%');
    setImp(navCurva, 'height', '70px');
    setImp(navCurva, 'background-color', '#7b7190');
    setImp(navCurva, 'border-top-left-radius', '100% 50%');
    setImp(navCurva, 'border-top-right-radius', '100% 50%');
    setImp(navCurva, 'position', 'fixed');
    setImp(navCurva, 'left', '0');
    setImp(navCurva, 'bottom', '0');
    setImp(navCurva, 'display', 'flex');
    setImp(navCurva, 'justify-content', 'center');
    setImp(navCurva, 'align-items', 'center');
    setImp(navCurva, 'gap', '40px');
    setImp(navCurva, 'z-index', '10');
  }

  // laterais 55x55
  [btnVoltar, btnGeladeira].forEach(b=>{
    if(!b) return;
    setImp(b, 'width', '55px');
    setImp(b, 'height', '55px');
    setImp(b, 'border-radius', '50%');
    setImp(b, 'padding', '0');
    setImp(b, 'transform', 'translateY(-10px)');
    setImp(b, 'flex', '0 0 55px');
    const bi = b.querySelector('img');
    if (bi){
      setImp(bi, 'width', '250%');
      setImp(bi, 'height', '250%');
      setImp(bi, 'object-fit', 'contain');
    }
  });

  // central 150x150
  if (btnLogo){
    setImp(btnLogo, 'width', '150px');
    setImp(btnLogo, 'height', '150px');
    setImp(btnLogo, 'border-radius', '50%');
    setImp(btnLogo, 'transform', 'translateY(-20px)');
    setImp(btnLogo, 'flex', '0 0 150px');
    const img = btnLogo.querySelector('img');
    if (img){
      setImp(img, 'width', '150%');
      setImp(img, 'height', '150%');
      setImp(img, 'object-fit', 'contain');
    }
  }
}

// ===== Eventos =====
document.addEventListener("DOMContentLoaded", ()=>{
  render();

  btnMais?.addEventListener("click", toggleLerMais);

  btnSalvar?.addEventListener("click", ()=>toggleSalvar(getReceita()));
  btnSalvar?.addEventListener("keydown", e=>{
    if(e.key==="Enter"||e.key===" "){ e.preventDefault(); toggleSalvar(getReceita()); }
  });

  // Gerar novamente
  btnGerar?.addEventListener("click", ()=>{
    window.location.href = "../gerar/"; // ajuste se sua tela de gerar estiver em outro caminho
  });

  // Força o rodapé a ficar EXATO
  fixFooter();
});
