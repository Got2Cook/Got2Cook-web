const elLista = document.getElementById('lista-posts');
const elBusca = document.getElementById('busca');
const elCat   = document.getElementById('categoria');
const btnPrev = document.getElementById('prev');
const btnNext = document.getElementById('next');
const pageLbl = document.getElementById('pageLabel');
const toTop   = document.getElementById('toTop');

let posts = [];
let view = [];      // posts após filtro
let page = 1;
const perPage = 9;

// carregar
(async function init(){
  try{
    skeleton(9);
    const res = await fetch('./posts.json', {cache:'no-store'});
    posts = await res.json();
    popularCategorias(posts);
    applyFilters();
  }catch(e){
    elLista.innerHTML = '<p>Não foi possível carregar os artigos.</p>';
    console.error(e);
  }
})();

// popular categorias
function popularCategorias(arr){
  const set = new Set(arr.flatMap(p=>p.categorias||[]));
  [...set].sort().forEach(c=>{
    const opt = document.createElement('option');
    opt.value = c; opt.textContent = c;
    elCat.appendChild(opt);
  });
}

// filtros
function applyFilters(){
  const q = (elBusca?.value || '').toLowerCase();
  const c = elCat?.value || '';

  view = posts.filter(p=>{
    const texto = `${p.titulo} ${p.resumo||''} ${(p.categorias||[]).join(' ')}`.toLowerCase();
    const okQ = !q || texto.includes(q);
    const okC = !c || (p.categorias||[]).includes(c);
    return okQ && okC;
  });

  page = 1;
  render();
}

elBusca?.addEventListener('input', debounce(applyFilters, 120));
elCat?.addEventListener('change', applyFilters);

// render
function render(){
  if(!view.length){
    elLista.innerHTML = '<p>Nenhum artigo encontrado.</p>';
    btnPrev.disabled = true; btnNext.disabled = true;
    pageLbl.textContent = 'Página 1';
    return;
  }
  const totalPages = Math.ceil(view.length / perPage);
  page = Math.max(1, Math.min(page, totalPages));
  const start = (page - 1) * perPage;
  const slice = view.slice(start, start + perPage);

  elLista.innerHTML = slice.map(cardHTML).join('');
  btnPrev.disabled = page === 1;
  btnNext.disabled = page === totalPages;
  pageLbl.textContent = `Página ${page} de ${totalPages}`;
}

btnPrev?.addEventListener('click', ()=>{ page--; render(); scrollToTop(); });
btnNext?.addEventListener('click', ()=>{ page++; render(); scrollToTop(); });

// helpers
function cardHTML(p){
  const capa = p.capa ? `<a class="thumb" href="/blog/${p.slug}/"><img src="${p.capa}" alt="${escapeHtml(p.titulo)}"></a>` : `<a class="thumb" href="/blog/${p.slug}/"></a>`;
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

function skeleton(n=6){
  elLista.innerHTML = Array.from({length:n}).map(()=>`
    <article class="card">
      <div class="thumb" style="background:linear-gradient(90deg,#eee,#f5f5f5,#eee);background-size:200% 100%;animation:sh 1.2s infinite"></div>
      <div class="pad">
        <div style="height:16px;width:70%;background:#eee;border-radius:6px;margin:8px 0"></div>
        <div style="height:12px;width:40%;background:#eee;border-radius:6px;margin:8px 0"></div>
        <div style="height:12px;width:90%;background:#eee;border-radius:6px;margin:8px 0"></div>
      </div>
    </article>
  `).join('');
}
const st = document.createElement('style'); st.textContent=`@keyframes sh{0%{background-position:0 0}100%{background-position:-200% 0}}`; document.head.appendChild(st);

function formatarData(iso){
  try{
    const d = new Date(iso);
    return d.toLocaleDateString('pt-BR',{day:'2-digit',month:'short',year:'numeric'});
  }catch{ return iso }
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}
function debounce(fn, ms){ let t; return (...a)=>{ clearTimeout(t); t=setTimeout(()=>fn(...a), ms); } }

toTop?.addEventListener('click', scrollToTop);
function scrollToTop(){ window.scrollTo({top:0, behavior:'smooth'}); }
window.addEventListener('scroll', ()=>{ if(window.scrollY>600) toTop.classList.add('show'); else toTop.classList.remove('show'); });
