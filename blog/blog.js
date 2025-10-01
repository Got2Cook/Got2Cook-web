// Seletores
const elLista = document.getElementById('lista-posts');
const elBusca = document.getElementById('busca');
const elCat   = document.getElementById('categoria');

let posts = [];
let view  = [];

// Inicialização
(async function init(){
  try{
    const res = await fetch('./posts.json', {cache:'no-store'});
    posts = await res.json();
    popularCategorias(posts);
    view = posts.slice();
    render(view);
  }catch(e){
    console.error(e);
    elLista.innerHTML = '<p>Erro ao carregar os artigos.</p>';
  }
})();

// Popula o <select> de categorias
function popularCategorias(arr){
  const set = new Set(arr.flatMap(p => p.categorias || []));
  [...set].sort().forEach(c => {
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    elCat.appendChild(opt);
  });
}

// Render dos cards
function render(arr){
  if(!arr.length){
    elLista.innerHTML = '<p>Nenhum artigo encontrado.</p>';
    return;
  }
  elLista.innerHTML = arr.map(cardHTML).join('');
}

function cardHTML(p){
  const titulo = escapeHtml(p.titulo);
  const resumo = p.resumo ? escapeHtml(p.resumo) : "";
  const capa   = p.capa ? p.capa : "";

  return `
    <article class="card">
      <a class="thumb" href="/blog/${p.slug}/">
        ${capa ? `<img src="${capa}" alt="${titulo}" onerror="this.style.display='none'; this.parentElement.classList.add('noimg');">` : ``}
        <div class="ribbon"><a href="/blog/${p.slug}/">${titulo}</a></div>
      </a>
      <div class="content">
        ${resumo ? `<p class="excerpt">${resumo}</p>` : ``}
      </div>
    </article>
  `;
}

// Filtro (busca + categoria) com debounce
function filtrar(){
  const q = (elBusca.value || '').toLowerCase();
  const c = elCat.value || '';
  view = posts.filter(p=>{
    const texto = `${p.titulo} ${p.resumo||''} ${(p.categorias||[]).join(' ')}`.toLowerCase();
    const okQ = !q || texto.includes(q);
    const okC = !c || (p.categorias||[]).includes(c);
    return okQ && okC;
  });
  render(view);
}

elBusca?.addEventListener('input', debounce(filtrar, 150));
elCat?.addEventListener('change', filtrar);

// Helpers
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}
function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); } }
