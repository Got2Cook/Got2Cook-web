// Hooks principais (placeholders) — prontos para receber conteúdo/lógica
const areaFiltros   = document.getElementById('area-filtros');
const areaResumos   = document.getElementById('area-resumos');
const areaLista     = document.getElementById('area-lista');
const areaGraficos  = document.getElementById('area-graficos');

const overlay       = document.getElementById('overlay');
const btnFecharOv   = document.getElementById('btnFecharOverlay');

// Navegação do rodapé (caminhos definidos por você)
const btnVoltar     = document.getElementById('btnVoltar');
const btnLogo       = document.getElementById('btnLogo');
const btnGeladeira  = document.getElementById('btnGeladeira');

// ====== Navegação do rodapé ======
function wireFooterNav(){
  if(btnVoltar){
    btnVoltar.addEventListener('click', () => {
      window.location.href = '../home/index.html';
    });
  }
  if(btnLogo){
    btnLogo.addEventListener('click', () => {
      window.location.href = '../minhas-receitas/index.html';
    });
  }
  if(btnGeladeira){
    btnGeladeira.addEventListener('click', () => {
      window.location.href = '../geladeira/index.html';
    });
  }
}

// ====== Overlay básico (placeholder) ======
function openOverlay(){
  overlay?.removeAttribute('hidden');
  overlay?.setAttribute('aria-hidden','false');
}
function closeOverlay(){
  overlay?.setAttribute('hidden','');
  overlay?.setAttribute('aria-hidden','true');
}
btnFecharOv?.addEventListener('click', closeOverlay);

// Fecha overlay em clique externo (quando ativo)
overlay?.addEventListener('click', (e) => {
  if(e.target === overlay) closeOverlay();
});

// ====== Inicialização ======
document.addEventListener('DOMContentLoaded', () => {
  wireFooterNav();

  // Exemplos de placeholders seguros:
  // areaFiltros.innerHTML = '<!-- criar select/chips aqui -->';
  // areaResumos.innerHTML = '<!-- cards de resumo aqui -->';
  // areaLista.innerHTML   = '<!-- lista com divisórias aqui -->';
  // areaGraficos.innerHTML= '<!-- gráficos/visualizações aqui -->';
});
