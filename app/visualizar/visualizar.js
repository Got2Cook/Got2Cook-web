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

// ========= INTEGRAÇÃO COM SISTEMA DE CONQUISTAS (JORNADA) =========

(function() {
  
  function iniciarIntegracao() {
    console.log('🔍 Procurando botão de salvar...');
    
    // Seu botão é: id="btnSalvar" class="btn-coracao"
    const btnCoracao = document.querySelector('#btnSalvar');
    
    if (!btnCoracao) {
      console.error('❌ Botão #btnSalvar não encontrado');
      return;
    }
    
    console.log('✅ Botão encontrado:', btnCoracao);
    
    // Função para salvar receita
    function salvarReceita(receita) {
      const receitas = JSON.parse(localStorage.getItem('got2cook_saved_recipes') || '[]');
      
      const jaExiste = receitas.some(r => r.titulo === receita.titulo);
      
      if (!jaExiste) {
        receitas.push({
          ...receita,
          criadoEm: new Date().toISOString()
        });
        
        localStorage.setItem('got2cook_saved_recipes', JSON.stringify(receitas));
        
        // Atualizar conquistas
        const salvasAtual = Number(localStorage.getItem('got2cook_salvas') || 0) + 1;
        localStorage.setItem('got2cook_salvas', salvasAtual);
        
        console.log('✅ Receita salva! Total:', salvasAtual);
        
        // Tentar atualizar G2C se estiver disponível
        if (window.G2C) {
          window.G2C.inc('salvas');
          window.G2C.atualizarGraficos();
        }
        
        return true;
      }
      
      console.log('ℹ️ Receita já estava salva');
      return false;
    }
    
    // Função para remover receita
    function removerReceita(tituloReceita) {
      let receitas = JSON.parse(localStorage.getItem('got2cook_saved_recipes') || '[]');
      const tamanhoAntes = receitas.length;
      
      receitas = receitas.filter(r => r.titulo !== tituloReceita);
      
      if (receitas.length < tamanhoAntes) {
        localStorage.setItem('got2cook_saved_recipes', JSON.stringify(receitas));
        localStorage.setItem('got2cook_salvas', receitas.length);
        
        console.log('❌ Receita removida! Total:', receitas.length);
        
        if (window.G2C) {
          window.G2C.setMetrics({ salvas: receitas.length });
          window.G2C.atualizarGraficos();
        }
        
        return true;
      }
      
      return false;
    }
    
    // Verificar se já está salva
    function verificarSeEstaSalva() {
      const titulo = document.querySelector('h1')?.textContent?.trim();
      if (!titulo) return false;
      
      const receitas = JSON.parse(localStorage.getItem('got2cook_saved_recipes') || '[]');
      return receitas.some(r => r.titulo === titulo);
    }
    
    // Definir estado inicial do botão
    if (verificarSeEstaSalva()) {
      btnCoracao.classList.add('salva', 'ativo');
      console.log('ℹ️ Receita já estava salva');
    }
    
    // Adicionar evento de clique
    btnCoracao.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const estaSalva = this.classList.contains('salva');
      
      // Coletar dados da receita
      const tituloEl = document.querySelector('h1');
      const imagemEl = document.querySelector('img[alt*="receita"]');
      const tempoEl = document.querySelector('.tempo, [class*="tempo"]');
      
      // Pegar ingredientes
      const ingredientesEls = document.querySelectorAll('ul li');
      const ingredientes = [];
      ingredientesEls.forEach(el => {
        const texto = el.textContent.trim();
        if (texto && texto.length > 2 && !texto.toLowerCase().includes('modo de preparo')) {
          ingredientes.push(texto);
        }
      });
      
      const receita = {
        id: 'receita_' + Date.now(),
        titulo: tituloEl?.textContent?.trim() || 'RECEITA GERADA',
        imagem: imagemEl?.src || '',
        tempoMinutos: 30,
        ingredientes: ingredientes.slice(0, 10), // Primeiros 10 itens
        modoPreparo: ['Misture os ingredientes selecionados e prepare ao seu gosto.'],
        tipo: 'todos'
      };
      
      console.log('📝 Dados da receita:', receita);
      
      if (estaSalva) {
        // Remover
        if (removerReceita(receita.titulo)) {
          this.classList.remove('salva', 'ativo');
          
          // Feedback visual
          this.style.transform = 'scale(0.8)';
          setTimeout(() => { this.style.transform = 'scale(1)'; }, 200);
        }
      } else {
        // Salvar
        if (salvarReceita(receita)) {
          this.classList.add('salva', 'ativo');
          
          // Feedback visual
          this.style.transform = 'scale(1.3)';
          setTimeout(() => { this.style.transform = 'scale(1)'; }, 200);
        }
      }
    });
    
    console.log('🎯 Integração ativada! Clique no botão vermelho para testar.');
  }
  
  // Iniciar quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciarIntegracao);
  } else {
    iniciarIntegracao();
  }
  
})();
```
