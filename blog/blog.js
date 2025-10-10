// /blog/blog.js
(function () {
  'use strict';

  // === ELEMENTS ===
  const elBusca = document.getElementById('busca');
  const elLista = document.getElementById('lista-posts');
  const elCategories = document.getElementById('popular-categories');
  const elBackToTop = document.getElementById('backToTop');
  const elNewsletterForm = document.getElementById('newsletterForm');
  const elPagination = document.getElementById('pagination');
  const filterBtns = document.querySelectorAll('.filter-btn');
  const viewBtns = document.querySelectorAll('.view-btn');
  const statNumbers = document.querySelectorAll('.stat-number');

  // === DATA ===
  let posts = [];
  let filteredPosts = [];
  let currentFilter = 'all';
  let currentView = 'grid';
  let currentPage = 1;
  const postsPerPage = 8;

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
      renderPosts();
      renderCategories();
      animateStats();
      hideLoading();
    } catch (e) {
      showEmptyState('❌ Erro ao carregar artigos. Tente novamente mais tarde.');
      console.error('Erro ao inicializar blog:', e);
    }
  }

  // === RENDER POSTS ===
  function renderPosts() {
    const startIndex = (currentPage - 1) * postsPerPage;
    const endIndex = startIndex + postsPerPage;
    const postsToShow = filteredPosts.slice(startIndex, endIndex);
    
    if (postsToShow.length === 0) {
      elLista.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3>Nenhum artigo encontrado</h3>
          <p>Tente ajustar os filtros ou fazer uma nova busca</p>
        </div>
      `;
      renderPagination();
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
  <article class="post-card" onclick="window.location.href='/blog/${slug}/'">
    <div class="card-image">
      ${capa 
        ? `<img src="${capa}" alt="${titulo}" loading="lazy">` 
        : `<div style="background: linear-gradient(135deg, #e8e8e8 0%, #d5d5d5 100%); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 48px; opacity: 0.3;">📄</div>`
      }
    </div>
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
    </div>
  </article>
`;Tentar novamenteClaude ainda não tem a capacidade de executar o código que gera.
    }).join('');

    renderPagination();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // === RENDER PAGINATION ===
  function renderPagination() {
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    
    if (totalPages <= 1) {
      elPagination.innerHTML = '';
      return;
    }

    let paginationHTML = '';

    // Botão anterior
    paginationHTML += `
      <button onclick="changePage(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''}>
        ‹
      </button>
    `;

    // Páginas
    if (totalPages <= 7) {
      // Mostra todas as páginas
      for (let i = 1; i <= totalPages; i++) {
        paginationHTML += `
          <button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
            ${i}
          </button>
        `;
      }
    } else {
      // Lógica com reticências
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          paginationHTML += `
            <button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
              ${i}
            </button>
          `;
        }
        paginationHTML += `<span class="dots">...</span>`;
        paginationHTML += `<button onclick="changePage(${totalPages})">${totalPages}</button>`;
      } else if (currentPage >= totalPages - 2) {
        paginationHTML += `<button onclick="changePage(1)">1</button>`;
        paginationHTML += `<span class="dots">...</span>`;
        for (let i = totalPages - 3; i <= totalPages; i++) {
          paginationHTML += `
            <button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
              ${i}
            </button>
          `;
        }
      } else {
        paginationHTML += `<button onclick="changePage(1)">1</button>`;
        paginationHTML += `<span class="dots">...</span>`;
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          paginationHTML += `
            <button class="${i === currentPage ? 'active' : ''}" onclick="changePage(${i})">
              ${i}
            </button>
          `;
        }
        paginationHTML += `<span class="dots">...</span>`;
        paginationHTML += `<button onclick="changePage(${totalPages})">${totalPages}</button>`;
      }
    }

    // Botão próximo
    paginationHTML += `
      <button onclick="changePage(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''}>
        ›
      </button>
    `;

    elPagination.innerHTML = paginationHTML;
  }

  // === CHANGE PAGE ===
  window.changePage = function(page) {
    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    renderPosts();
  };

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

    currentPage = 1;
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
    // Atualiza contagem de artigos automaticamente
    const statsArticles = document.getElementById('statsArticles');
    if (statsArticles) {
      statsArticles.dataset.count = posts.length;
    }

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
    if (statsArticles) observer.observe(statsArticles);
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
