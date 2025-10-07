// /blog/blog.js
(function () {
  'use strict';

  const elLista = document.getElementById('lista-posts');
  const elBusca = document.getElementById('busca');
  const elCat = document.getElementById('categoria');

  let posts = [];
  let view = [];

  // Inicialização com loading state
  async function init() {
    elLista.classList.add('loading');
    elLista.innerHTML = '<p>Carregando artigos...</p>';

    try {
      const res = await fetch('./posts.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Falha ao carregar posts.json');
      
      posts = await res.json();
      
      if (!Array.isArray(posts) || posts.length === 0) {
        elLista.innerHTML = '<p>📝 Nenhum artigo disponível no momento. Volte em breve!</p>';
        elLista.classList.remove('loading');
        return;
      }

      popularCategorias(posts);
      view = posts.slice();
      render(view);
      elLista.classList.remove('loading');
    } catch (e) {
      elLista.innerHTML = '<p>❌ Erro ao carregar artigos. Tente novamente mais tarde.</p>';
      elLista.classList.remove('loading');
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

  // Renderizar cards com stagger animation
  function render(arr) {
    if (!arr.length) {
      elLista.innerHTML = '<p>🔍 Nenhum artigo encontrado com os filtros selecionados.</p>';
      return;
    }
    
    // Remove animação de delay ao re-renderizar
    const existingCards = elLista.querySelectorAll('.card');
    existingCards.forEach(card => {
      card.style.animation = 'none';
    });

    elLista.innerHTML = arr.map(cardHTML).join('');
  }

  // Template do card premium
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
            : `<div style="background: linear-gradient(135deg, #e8e8e8 0%, #d5d5d5 100%); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; opacity: 0.3;">📄</div>`
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

  // Filtrar posts com debounce
  let debounceTimer;
  function filtrar() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
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
    }, 300);
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

  // Parallax suave no hero
  let ticking = false;
  function updateParallax() {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-bg');
    if (hero) {
      hero.style.transform = `scale(1.1) translateY(${scrolled * 0.5}px)`;
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateParallax);
      ticking = true;
    }
  }, { passive: true });

  // Iniciar
  init();
})();
