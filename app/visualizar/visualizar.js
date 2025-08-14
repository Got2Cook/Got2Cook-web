// (sem mudanças estruturais; mantém a mesma API/IDs)
const $ = (sel) => document.querySelector(sel);
function getLS(k,f){ try{ return JSON.parse(localStorage.getItem(k)) ?? f; }catch{ return f; } }
function setLS(k,v){ localStorage.setItem(k, JSON.stringify(v)); }
function norm(s){ return (s||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim().toLowerCase(); }

const hTitulo=$("#tituloReceita"), imgCover=$("#coverReceita");
const metaTempo=$("#metaTempo"), metaDif=$("#metaDificuldade"), metaPor=$("#metaPorcoes");
const ulIng=$("#listaIngredientes"), olPasso=$("#listaPassos"), btnMais=$("#btnLerMais");
const btnSalvar=$("#btnSalvar"), liveMsg=$("#liveMsg");

$("#btnVoltar")?.addEventListener("click",()=>{ window.location.href="../humor/"; });
$("#btnLogo")?.addEventListener("click",()=>{ window.location.href="../gerar/"; });
$("#btnGeladeira")?.addEventListener("click",()=>{ window.location.href="../geladeira/"; });

function getReceita(){
  const r=getLS("receita_temp",null);
  if(r&&typeof r==="object") return r;
  return {
    id:"mock-001", titulo:"Receita Gerada", tempo:"30 min", dificuldade:"Fácil", porcoes:"2 porções",
    coverImg:"../../assets/receita_exemplo.png",
    ingredientes:["Ingrediente 1","Ingrediente 2","Ingrediente 3"],
    passos:["Passo 1 da receita.","Passo 2 da receita.","Passo 3 da receita.","Passo 4 (texto longo)."]
  };
}

const KEY="got2cook_minhasReceitas";
function getSalvas(){ const a=getLS(KEY,[]); return Array.isArray(a)?a:[]; }
function mesma(a,b){ if(!a||!b) return false; if(a.id&&b.id) return a.id===b.id; return norm(a.titulo||a.nome)===norm(b.titulo||b.nome); }
function isSalva(r){ return getSalvas().some(x=>mesma(x,r)); }
function syncHeart(r){ const on=isSalva(r); btnSalvar.setAttribute("aria-pressed", on?"true":"false"); btnSalvar.querySelector(".coracao").textContent=on?"♥":"♡"; }
function toggleSalvar(r){
  const arr=getSalvas(); const i=arr.findIndex(x=>mesma(x,r));
  if(i>=0){ arr.splice(i,1); setLS(KEY,arr); syncHeart(r); live("Removida de Minhas Receitas."); }
  else { if(!r.id) r.id=`r-${Date.now()}`; arr.push(r); setLS(KEY,arr); syncHeart(r); live("Salva em Minhas Receitas."); }
}

function render(){
  const r=getReceita();
  hTitulo.textContent="RECEITA GERADA";
  imgCover.src=r.coverImg||r.imagem||"../../assets/receita_exemplo.png";
  imgCover.alt=`Imagem da receita ${r.titulo||""}`;
  metaTempo.textContent=`⏱️ ${r.tempo||"—"}`;
  metaDif.textContent=`Dificuldade ${r.dificuldade||"—"}`;
  metaPor.textContent=`Porções ${r.porcoes||"—"}`;

  ulIng.innerHTML="";
  (Array.isArray(r.ingredientes)?r.ingredientes:[]).forEach(item=>{
    const nome=typeof item==="string"?item:(item.nome||item.label||"");
    const li=document.createElement("li"); li.textContent=nome; ulIng.appendChild(li);
  });

  olPasso.innerHTML="";
  const passos=Array.isArray(r.passos)&&r.passos.length?r.passos:(r.modoPreparo?[r.modoPreparo]:["Siga os passos básicos de preparo."]);
  passos.forEach(p=>{ const li=document.createElement("li"); li.textContent=p; olPasso.appendChild(li); });

  syncHeart(r);
  setTimeout(()=>hTitulo.focus(),0);
}

function toggleLerMais(){
  const open=olPasso.getAttribute("data-collapsed")==="false";
  olPasso.setAttribute("data-collapsed", open?"true":"false");
  btnMais.setAttribute("aria-expanded", open?"false":"true");
  btnMais.textContent=open?"Ler mais":"Ler menos";
}

function live(msg){ if(!liveMsg) return; liveMsg.textContent=""; setTimeout(()=>liveMsg.textContent=msg,30); }

document.addEventListener("DOMContentLoaded", ()=>{
  render();
  btnMais?.addEventListener("click", toggleLerMais);
  btnSalvar?.addEventListener("click", ()=>toggleSalvar(getReceita()));
  btnSalvar?.addEventListener("keydown", e=>{ if(e.key==="Enter"||e.key===" "){ e.preventDefault(); toggleSalvar(getReceita()); }});
});
