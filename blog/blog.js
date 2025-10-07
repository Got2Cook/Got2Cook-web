// /blog/blog.js
(function () {
  'use strict';

  const elLista = document.getElementById('lista-posts');
  const elBusca = document.getElementById('busca');
  const elCat = document.getElementById('categoria');

  let posts = [];
  let view = [];

  // Inicialização
  async function init() {
    try {
      const res = await fetch('./posts.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Falha ao carregar posts.json');
      
      posts = await res.json();
      
      if (!Array.isArray(posts) || posts.length === 0) {
        elLista.innerHTML = '<p>Nenhum artigo disponível no momento.</p>';
        return;
      }

      popularCategorias(posts);
      view = posts.slice();
      render(view);
    } catch (e) {
      elLista.innerHTML = '<p>Erro ao carregar artigos. Tente novamente mais tarde.</p>';
      console.error('Erro ao inicializar blog:', e);
    }
  }

  // Popular dropdown de categorias
  function popularCategorias(arr) {
    const set = new Set();
    arr.forEach(p => {
      if (Array.isArray(p.categorias)) {
        p.categorias.forEach(c => set.add(c));
      }
    });

    const categorias = [...set].sort();
    categorias.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c;
      opt.textContent = c;
      elCat.appendChild(opt);
    });
  }

  // Renderizar cards
  function render(arr) {
    if (!arr.length) {
      elLista.innerHTML = '<p>Nenhum artigo encontrado com os filtros selecionados.</p>';
      return;
    }
    elLista.innerHTML = arr.map(cardHTML).join('');
  }

  // Template do card
  function cardHTML(p) {
    const titulo = escapeHtml(p.titulo || 'Sem título');
    const resumo = p.resumo ? escapeHtml(p.resumo) : '';
    const capa = p.capa || '';
    const slug = p.slug || '';

    if (!slug) {
      console.warn('Post sem slug:', p);
      return '';
    }

    return `
      <article class="card">
        <a class="thumb" href="/blog/${slug}/" aria-label="Ler artigo: ${titulo}">
          ${capa 
            ? `<img src="${capa}" alt="${titulo}" loading="lazy">` 
            : `<div style="background: linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%); width: 100%; height: 100%;"></div>`
          }
          <div class="ribbon">
            <span>${titulo}</span>
          </div>
        </a>
        ${resumo 
          ? `<div class="content"><p class="excerpt">${resumo}</p></div>` 
          : ''
        }
      </article>
    `;
  }

  // Filtrar posts
  function filtrar() {
    const q = (elBusca.value || '').trim().toLowerCase();
    const c = elCat.value || '';

    view = posts.filter(p => {
      const titulo = (p.titulo || '').toLowerCase();
      const resumo = (p.resumo || '').toLowerCase();
      const cats = (p.categorias || []).join(' ').toLowerCase();
      const texto = `${titulo} ${resumo} ${cats}`;

      const okQ = !q || texto.includes(q);
      const okC = !c || (p.categorias || []).includes(c);

      return okQ && okC;
    });

    render(view);
  }

  // Escape HTML
  function escapeHtml(str) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return String(str).replace(/[&<>"']/g, m => map[m]);
  }

  // Event listeners
  if (elBusca) {
    elBusca.addEventListener('input', filtrar);
  }

  if (elCat) {
    elCat.addEventListener('change', filtrar);
  }

  // Iniciar
  init();
})();
