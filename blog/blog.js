// /blog/blog.js
(function () {
  'use strict';

  // === ELEMENTS ===
  const elBusca = document.getElementById('busca');
  const elFeatured = document.getElementById('featured-posts');
  const elLista = document.getElementById('lista-posts');
  const elLoadMore = document.getElementById('loadMore');
  const elCategories = document.getElementById('popular-categories');
  const elBackToTop = document.getElementById('backToTop');
  const elNewsletterForm = document.getElementById('newsletterForm');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const viewBtns = document.querySelectorAll('.view-btn');
  const statNumbers = document.querySelectorAll('.stat-number');

  // === DATA ===
  let posts = [];
  let filteredPosts = [];
  let currentFilter = 'all';
  let currentView = 'grid';
  let displayedCount = 9;
  const postsPerLoad = 9;

  // === INIT ===
  async function init() {
    showLoading();
    
    try {
      const res = await fetch('./posts.json', { cache: 'no-store' });
      if (!res.ok) throw new Error('Falha ao carregar posts');
      
      posts = await res.json();
      
      if (!Array.isArray(posts) || posts.length === 0) {
        showEmptyState('📝 Nenhum artigo disponível no momento.');
        return;
      }

      filteredPosts = posts.slice();
      renderFeatured();
      renderPosts();
      renderCategories();
      animateStats();
      hideLoading();
    } catch (e) {
      showEmptyState('❌ Erro ao carregar artigos. Tente novamente mais tarde.');
      console.error('Erro ao inicializar blog:', e);
    }
  }

  // === RENDER FEATURED ===
  function renderFeatured() {
    const featured = posts.filter(p => p.destaque).slice(0, 3);
    if (featured.length === 0) return;

    elFeatured.innerHTML = featured.map((p, idx) => {
      const titulo = escapeHtml(p.titulo || 'Sem título');
      const resumo = escapeHtml(p.resumo || '');
      const capa = p.capa || '';
      const slug = p.slug || '';
      const data = formatDate(p.data);
      const tempo = p.tempoLeitura || '5 min';
      const cats = (p.categorias || []).slice(0, 2);

      return `
        <article class="featured-card" style="animation-delay: ${idx * 0.1}s">
          <a href="/blog/${slug}/" class="card-image">
            ${capa 
              ? `<img src="${capa}" alt="${titulo}" loading="lazy">` 
              : `<div style="background: linear-gradient(135deg, #e8e8e8 0%, #d5d5d5 100%); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 64px; opacity: 0.3;">📄</div>`
            }
            ${idx === 0 ? '<div class="featured-badge"><span>⭐</span> Destaque</div>' : ''}
          </a>
          <div class="card-content">
            <div class="card-meta">
              <span class="meta-item">📅 ${data}</span>
              <span class="meta-item">⏱️ ${tempo}</span>
            </div>
            ${cats.length > 0 ? `
              <div class="card-categories">
                ${cats.map(c => `<span class="category-badge">${escapeHtml(c)}</span>`).join('')}
              </div>
            ` : ''}
            <h3 class="card-title">${titulo}</h3>
            ${resumo ? `<p class="card-excerpt">${resumo}</p>` : ''}
            <a href="/blog/${slug}/" class="card-link">
              Ler artigo completo
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </div>
        </article>
      `;
    }).join('');
  }

  // === RENDER POSTS ===
  function renderPosts() {
    const postsToShow = filteredPosts.slice(0, displayedCount);
    
    if (postsToShow.length === 0) {
      elLista.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3>Nenhum artigo encontrado</h3>
          <p>Tente ajustar os filtros ou fazer uma nova busca</p>
        </div>
      `;
      elLoadMore.style.display = 'none';
      return;
    }

    elLista.innerHTML = postsToShow.map((p, idx) => {
      const titulo = escapeHtml(p.titulo || 'Sem título');
      const resumo = escapeHtml(p.resumo || '');
      const capa = p.capa || '';
      const slug = p.slug || '';
      const data = formatDate(p.data);
      const tempo = p.tempoLeitura || '5 min';
      const cats = (p.categorias || []).slice(0, 2);

      return `
        <article class="post-card" style="animation-delay: ${idx * 0.05}s">
          <a href="/blog/${slug}/" class="card-image">
            ${capa 
              ? `<img src="${capa}" alt="${titulo}" loading="lazy">` 
              : `<div style="background: linear-gradient(135deg, #e8e8e8 0%, #d5d5d5 100%); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; opacity: 0.3;">📄</div>`
            }
          </a>
          <div class="card-content">
            <div class="card-meta">
              <span class="meta-item">📅 ${data}</span>
              <span class="meta-item">⏱️ ${tempo}</span>
            </div>
            ${cats.length > 0 ? `
              <div class="card-categories">
                ${cats.map(c => `<span class="category-badge">${escapeHtml(c)}</span>`).join('')}
              </div>
            ` : ''}
            <h3 class="card-title">${titulo}</h3>
            ${resumo ? `<p class="card-excerpt">${resumo}</p>` : ''}
            <a href="/blog/${slug}/" class="card-link">
              Ler mais
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </a>
          </div>
        </article>
      `;
    }).join('');

    // Show/hide load more button
    elLoadMore.style.display = filteredPosts.length > displayedCount ? 'inline-flex' : 'none';
  }

  // === RENDER CATEGORIES ===
  function renderCategories() {
    const catMap = {};
    posts.forEach(p => {
      if (Array.isArray(p.categorias)) {
        p.categorias.forEach(c => {
          catMap[c] = (catMap[c] || 0) + 1;
        });
      }
    });

    const sortedCats = Object.entries(catMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);

    elCategories.innerHTML = sortedCats.map(([cat, count]) => `
      <div class="category-item" data-category="${escapeHtml(cat)}">
        <span>${escapeHtml(cat)}</span>
        <span class="category-count">${count}</span>
      </div>
    `).join('');

    // Add click handlers
    document.querySelectorAll('.category-item').forEach(item => {
      item.addEventListener('click', () => {
        const cat = item.dataset.category;
        filterByCategory(cat);
        // Update filter buttons
        filterBtns.forEach(btn => {
          btn.classList.toggle('active', btn.dataset.filter === cat);
        });
      });
    });
  }

  // === FILTER ===
  function filterPosts() {
    const query = (elBusca.value || '').trim().toLowerCase();
    
    filteredPosts = posts.filter(p => {
      // Search filter
      const searchText = `${p.titulo || ''} ${p.resumo || ''} ${(p.categorias || []).join(' ')}`.toLowerCase();
      const matchesSearch = !query || searchText.includes(query);
      
      // Category filter
      const matchesCategory = currentFilter === 'all' || (p.categorias || []).includes(currentFilter);
      
      return matchesSearch && matchesCategory;
    });

    displayedCount = postsPerLoad;
    renderPosts();
  }

  function filterByCategory(category) {
    currentFilter = category;
    filterPosts();
    
    // Scroll to posts section
    document.querySelector('.posts-section').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // === SEARCH DEBOUNCE ===
  let searchTimeout;
  function handleSearch() {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(filterPosts, 300);
  }

  // === LOAD MORE ===
  function loadMore() {
    displayedCount += postsPerLoad;
    renderPosts();
  }

  // === VIEW TOGGLE ===
  function toggleView(view) {
    currentView = view;
    elLista.classList.remove('view-grid', 'view-list');
    elLista.classList.add(`view-${view}`);
    
    viewBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.view === view);
    });
  }

  // === ANIMATE STATS ===
  function animateStats() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.dataset.count);
          animateValue(entry.target, 0, target, 2000);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(stat => observer.observe(stat));
  }

  function animateValue(element, start, end, duration) {
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor(duration / (end - start)));
    let current = start;

    const timer = setInterval(() => {
      current += increment * Math.ceil((end - start) / 50);
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        current = end;
        clearInterval(timer);
      }
      element.textContent = current.toLocaleString('pt-BR');
    }, stepTime);
  }

  // === BACK TO TOP ===
  function handleScroll() {
    if (window.pageYOffset > 300) {
      elBackToTop.classList.add('show');
    } else {
      elBackToTop.classList.remove('show');
    }
  }

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // === NEWSLETTER ===
  function handleNewsletter(e) {
    e.preventDefault();
    const email = e.target.querySelector('input[type="email"]').value;
    
    // Simulate submission
    alert(`✅ Obrigado! Você será inscrito com o e-mail: ${email}`);
    e.target.reset();
    
    // TODO: Implement actual newsletter subscription
  }

  // === UTILITIES ===
  function showLoading() {
    elLista.classList.add('loading');
    elLista.innerHTML = '<div class="empty-state"><div class="empty-state-icon">⏳</div><h3>Carregando artigos...</h3></div>';
  }

  function hideLoading() {
    elLista.classList.remove('loading');
  }

  function showEmptyState(message) {
    elLista.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📝</div><h3>${message}</h3></div>`;
  }

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

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
  }

  // === EVENT LISTENERS ===
  if (elBusca) {
    elBusca.addEventListener('input', handleSearch);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.dataset.filter;
      currentFilter = filter;
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterPosts();
    });
  });

  viewBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      toggleView(btn.dataset.view);
    });
  });

  if (elLoadMore) {
    elLoadMore.addEventListener('click', loadMore);
  }

  if (elBackToTop) {
    elBackToTop.addEventListener('click', scrollToTop);
    window.addEventListener('scroll', handleScroll, { passive: true });
  }

  if (elNewsletterForm) {
    elNewsletterForm.addEventListener('submit', handleNewsletter);
  }

  // === INITIALIZE ===
  init();

})();
