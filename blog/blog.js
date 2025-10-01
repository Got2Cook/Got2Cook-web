// mantém busca/categorias; gera cards com faixa roxa sobre a imagem
const elLista = document.getElementById('lista-posts');
const elBusca = document.getElementById('busca');
const elCat   = document.getElementById('categoria');

let posts = [];
let view  = [];

(async function init(){
  try{
    const res = await fetch('./posts.json', {cache:'no-store'});
    posts = await res.json();
    popularCategorias(posts);
    view = posts.slice();
    render(view);
  }catch(e){
    elLista.innerHTML = '<p>Erro ao carregar.</p>';
    console.error(e);
  }
})();

function popularCategorias(arr){
  const set = new Set(arr.flatMap(p=>p.categorias||[]));
  [...set].sort().forEach(c=>{
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    elCat.appendChild(opt);
  });
}

function render(arr){
  if(!arr.length){ elLista.innerHTML = '<p>Nenhum artigo encontrado.</p>'; return; }
  elLista.innerHTML = arr.map(cardHTML).join('');
}

function cardHTML(p){
  return `
    <article class="card">
      <a class="thumb" href="/blog/${p.slug}/">
        ${p.capa ? `<img src="${p.capa}" alt="${escapeHtml(p.titulo)}">` : ``}
      </a>
      <div class="ribbon">${escapeHtml(p.titulo)}</div>
      <div class="content">
        <p class="excerpt">${escapeHtml(p.resumo || '')}</p>
      </div>
    </article>
  `;
}

function filtrar(){
  const q = (elBusca.value||'').toLowerCase();
  const c = elCat.value||'';
  view = posts.filter(p=>{
    const texto = `${p.titulo} ${p.resumo||''} ${(p.categorias||[]).join(' ')}`.toLowerCase();
    const okQ = !q || texto.includes(q);
    const okC = !c || (p.categorias||[]).includes(c);
    return okQ && okC;
  });
  render(view);
}

elBusca?.addEventListener('input', filtrar);
elCat?.addEventListener('change', filtrar);

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}
