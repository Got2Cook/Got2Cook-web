"use strict";

/* ===== Utilitários ===== */
const $ = (sel) => document.querySelector(sel);
function getLS(key, fb){ try { return JSON.parse(localStorage.getItem(key)) ?? fb; } catch { return fb; } }
function setLS(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
function norm(s){ return (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase(); }

/* ===== Refs ===== */
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

/* ===== Refs do rodapé (somente navegação; sem alterar estilo/HTML) ===== */
const btnVoltar    = document.getElementById("btnVoltar");
const btnLogo      = document.getElementById("btnLogo");
const btnGeladeira = document.getElementById("btnGeladeira");

/* ===== Navegação do rodapé (NÃO muda classes/estilos/atributos) ===== */
btnVoltar?.addEventListener("click", () => {
  window.location.href = "../humor/index.html";
});
btnLogo?.addEventListener("click", () => {
  // se quiser voltar para gerar, troque para: "../gerar/index.html"
  window.location.href = "../home/index.html";
});
btnGeladeira?.addEventListener("click", () => {
  window.location.href = "../geladeira/index.html";
});

/* ===== Dados ===== */
function getReceita(){
  const r = getLS("receita_temp", null);
  if (r && typeof r === "object") return r;
  // MOCK para teste
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

/* ===== Favoritar ===== */
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
  if (!btnSalvar) return;
  btnSalvar.setAttribute("aria-pressed", on ? "true" : "false");
  const span = btnSalvar.querySelector(".coracao");
  if (span) span.textContent = on ? "♥" : "♡";
}
function toggleSalvar(r){
  const arr = getSalvas();
  const i = arr.findIndex(x=>mesmaReceita(x,r));
  if(i>=0){ arr.splice(i,1); setLS(KEY_SALVAS,arr); }
  else { if(!r.id) r.id=`r-${Date.now()}`; arr.push(r); setLS(KEY_SALVAS,arr); }
  syncHeart(r);
}

/* ===== Render ===== */
function render(){
  const r = getReceita();

  if (hTitulo) hTitulo.textContent = "RECEITA GERADA";

  if (imgCover){
    imgCover.src = r.coverImg || r.imagem || "../../assets/receita_exemplo.png";
    imgCover.alt = `Imagem da receita ${r.titulo || ""}`;
  }
  if (metaTempo) metaTempo.textContent = `⏱️ ${r.tempo || "—"}`;
  if (metaDif)   metaDif.textContent   = `Dificuldade ${r.dificuldade || "—"}`;

  // Humor (no lugar de Porções)
  const humorTxt = Array.isArray(r.humores) ? r.humores.join(", ") : (r.humor || "—");
  if (metaPor) metaPor.textContent = `Humor ${humorTxt}`;

  // Ingredientes
  if (olIng){
    olIng.innerHTML = "";
    (Array.isArray(r.ingredientes) ? r.ingredientes : []).forEach(item => {
      const li = document.createElement("li");
      li.textContent = typeof item === "string" ? item : (item.nome || "");
      olIng.appendChild(li);
    });
  }

  // Passos
  if (olPasso){
    olPasso.innerHTML = "";
    const passos = Array.isArray(r.passos) && r.passos.length
      ? r.passos
      : (r.modoPreparo ? [r.modoPreparo] : ["Siga os passos básicos de preparo."]);
    passos.forEach(p => {
      const li = document.createElement("li");
      li.textContent = p;
      olPasso.appendChild(li);
    });
  }

  syncHeart(r);
  setTimeout(() => hTitulo?.focus(), 0);
}

/* ===== Ler mais ===== */
function toggleLerMais(){
  if (!textoReceita || !btnMais) return;
  const on = textoReceita.getAttribute("data-scroll") === "on";
  textoReceita.setAttribute("data-scroll", on ? "off" : "on");
  btnMais.setAttribute("aria-expanded", on ? "false" : "true");
  btnMais.textContent = on ? "Ler mais" : "Ler menos";
}

/* ===== Eventos ===== */
document.addEventListener("DOMContentLoaded", ()=>{
  render();

  btnMais?.addEventListener("click", toggleLerMais);

  btnSalvar?.addEventListener("click", ()=>toggleSalvar(getReceita()));
  btnSalvar?.addEventListener("keydown", e=>{
    if(e.key==="Enter"||e.key===" "){
      e.preventDefault();
      toggleSalvar(getReceita());
    }
  });

  // Gerar novamente
  btnGerar?.addEventListener("click", ()=>{
    window.location.href = "../gerar/";
  });
});

// Em /app/visualizar-receita/ver.js
function salvarReceita(receita) {
  const receitas = JSON.parse(localStorage.getItem('got2cook_saved_recipes') || '[]');
  receitas.push({...receita, criadoEm: new Date().toISOString()});
  localStorage.setItem('got2cook_saved_recipes', JSON.stringify(receitas));
  
  if (window.G2C) {
    window.G2C.inc('salvas');
    window.G2C.atualizarGraficos();
  }
}

// /app/visualizar-receita/visualizar.js

// ========= INTEGRAÇÃO COM SISTEMA DE CONQUISTAS =========

// Função para salvar receita (botão coração)
function salvarReceita(receita) {
  const receitas = JSON.parse(localStorage.getItem('got2cook_saved_recipes') || '[]');
  
  // Verificar se já existe
  const jaExiste = receitas.some(r => r.id === receita.id);
  
  if (!jaExiste) {
    // Adicionar timestamp de criação
    receitas.push({
      ...receita,
      criadoEm: new Date().toISOString()
    });
    
    localStorage.setItem('got2cook_saved_recipes', JSON.stringify(receitas));
    
    // Incrementar conquista de salvamento
    if (window.G2C) {
      window.G2C.inc('salvas');
      window.G2C.atualizarGraficos();
    }
    
    console.log('✅ Receita salva e conquista atualizada!');
  }
}

// Função para remover receita (desfavoritar)
function removerReceita(receitaId) {
  let receitas = JSON.parse(localStorage.getItem('got2cook_saved_recipes') || '[]');
  receitas = receitas.filter(r => r.id !== receitaId);
  
  localStorage.setItem('got2cook_saved_recipes', JSON.stringify(receitas));
  
  // Atualizar métrica
  if (window.G2C) {
    window.G2C.setMetrics({ salvas: receitas.length });
    window.G2C.atualizarGraficos();
  }
  
  console.log('❌ Receita removida e conquista atualizada!');
}

// Exemplo de uso no botão coração
document.getElementById('btnCoracaoSalvar')?.addEventListener('click', function() {
  const receita = {
    id: 'receita_' + Date.now(),
    titulo: document.querySelector('.titulo-receita')?.textContent || 'Sem título',
    imagem: document.querySelector('.img-receita')?.src || '',
    tempoMinutos: parseInt(document.querySelector('.tempo')?.textContent) || 0,
    ingredientes: Array.from(document.querySelectorAll('.ingrediente')).map(el => el.textContent),
    modoPreparo: Array.from(document.querySelectorAll('.passo')).map(el => el.textContent),
    humorTags: [], // seus humores aqui
    tipo: 'doce' // ou 'salgado'
  };
  
  const salva = this.classList.contains('salva');
  
  if (salva) {
    // Já está salva, então remover
    removerReceita(receita.id);
    this.classList.remove('salva');
  } else {
    // Não está salva, então salvar
    salvarReceita(receita);
    this.classList.add('salva');
  }
});
