const elLista = document.getElementById('lista-posts');
const elBusca = document.getElementById('busca');
const elCat   = document.getElementById('categoria');

let posts = [];

// Carrega posts.json e inicia
(async function init(){
  try{
    const res = await fetch('./posts.json', {cache:'no-store'});
    posts = await res.json();
    popularCategorias(posts);
    render(posts);
  }catch(e){
    elLista.innerHTML = '<p>Não foi possível carregar os artigos.</p>';
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
  if(!arr.length){
    elLista.innerHTML = '<p>Nenhum artigo encontrado.</p>';
    return;
  }
  elLista.innerHTML = arr.map(p => cardHTML(p)).join('');
}

function cardHTML(p){
  const capa = p.capa ? `<a class="thumb" href="/blog/${p.slug}/"><img src="${p.capa}" alt="${escapeHtml(p.titulo)}"></a>` : '';
  return `
    <article class="card">
      ${capa}
      <div class="pad">
        <h2><a href="/blog/${p.slug}/">${escapeHtml(p.titulo)}</a></h2>
        <div class="meta">${formatarData(p.data)} • ${p.tempoLeitura||'3 min'}</div>
        ${p.resumo ? `<p class="excerpt">${escapeHtml(p.resumo)}</p>` : ''}
        <div class="tags">
          ${(p.categorias||[]).map(t=>`<span class="tag">${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>
    </article>
  `;
}

function filtrar(){
  const q = (elBusca.value||'').toLowerCase();
  const c = elCat.value||'';
  const filtrados = posts.filter(p=>{
    const texto = `${p.titulo} ${p.resumo||''} ${(p.categorias||[]).join(' ')}`.toLowerCase();
    const okQ = !q || texto.includes(q);
    const okC = !c || (p.categorias||[]).includes(c);
    return okQ && okC;
  });
  render(filtrados);
}

elBusca?.addEventListener('input', filtrar);
elCat?.addEventListener('change', filtrar);

function formatarData(iso){
  try{
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'});
  }catch{ return iso }
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

