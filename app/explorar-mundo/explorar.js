// /app/explorar-mundo/explorar.js

(function() {
  'use strict';

  // === Estado e configuração ===
  const CONFIG = {
    minZoom: 1,
    maxZoom: 3,
    zoomStep: 0.3,
    maxPan: 500
  };

  let state = {
    zoom: 1,
    panX: 0,
    panY: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    visitedCountries: []
  };

  // === Elementos DOM ===
  const elements = {
    mapaWrapper: document.getElementById('mapaWrapper'),
    mapaContainer: document.getElementById('mapaContainer'),
    pontosPais: document.querySelectorAll('.ponto-pais'),
    btnZoomIn: document.getElementById('btnZoomIn'),
    btnZoomOut: document.getElementById('btnZoomOut'),
    btnResetZoom: document.getElementById('btnResetZoom'),
    btnVoltar: document.getElementById('btnVoltar'),
    btnLogo: document.getElementById('btnLogo'),
    btnGeladeira: document.getElementById('btnGeladeira')
  };

  // === Inicialização ===
  function init() {
    loadVisitedCountries();
    updateVisitedStatus();
    bindEvents();
    applyTransform();
  }

  // === LocalStorage ===
  function loadVisitedCountries() {
    try {
      const saved = localStorage.getItem('got2cook_visited_countries');
      state.visitedCountries = saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Erro ao carregar países visitados:', e);
      state.visitedCountries = [];
    }
  }

  function saveVisitedCountries() {
    try {
      localStorage.setItem('got2cook_visited_countries', JSON.stringify(state.visitedCountries));
    } catch (e) {
      console.error('Erro ao salvar países visitados:', e);
    }
  }

  function markCountryAsVisited(pais) {
    if (!state.visitedCountries.includes(pais)) {
      state.visitedCountries.push(pais);
      saveVisitedCountries();
    }
  }

  function updateVisitedStatus() {
    elements.pontosPais.forEach(ponto => {
      const pais = ponto.dataset.pais;
      if (state.visitedCountries.includes(pais)) {
        ponto.classList.add('visitado');
      }
    });
  }

  // === Zoom e Pan ===
  function applyTransform() {
    const transform = `scale(${state.zoom}) translate(${state.panX}px, ${state.panY}px)`;
    elements.mapaWrapper.style.transform = transform;
  }

  function setZoom(newZoom) {
    state.zoom = Math.max(CONFIG.minZoom, Math.min(CONFIG.maxZoom, newZoom));
    applyTransform();
  }

  function setPan(x, y) {
    const limit = CONFIG.maxPan;
    state.panX = Math.max(-limit, Math.min(limit, x));
    state.panY = Math.max(-limit, Math.min(limit, y));
    applyTransform();
  }

  function resetView() {
    state.zoom = 1;
    state.panX = 0;
    state.panY = 0;
    applyTransform();
  }

  // === Event Handlers ===
  function handleZoomIn() {
    setZoom(state.zoom + CONFIG.zoomStep);
  }

  function handleZoomOut() {
    setZoom(state.zoom - CONFIG.zoomStep);
  }

  function handleDragStart(e) {
    state.isDragging = true;
    elements.mapaWrapper.classList.add('grabbing');
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    state.startX = clientX - state.panX;
    state.startY = clientY - state.panY;
    
    e.preventDefault();
  }

  function handleDragMove(e) {
    if (!state.isDragging) return;
    
    const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
    const clientY = e.type.includes('touch') ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - state.startX;
    const deltaY = clientY - state.startY;
    
    setPan(deltaX, deltaY);
    
    e.preventDefault();
  }

  function handleDragEnd() {
    state.isDragging = false;
    elements.mapaWrapper.classList.remove('grabbing');
  }

  function handleCountryClick(e) {
    e.stopPropagation();
    const pais = this.dataset.pais;
    
    // Marca como visitado
    markCountryAsVisited(pais);
    this.classList.add('visitado');
    
    // Navega para a página do país
    window.location.href = `/app/culinaria-pais/index.html?pais=${pais}`;
  }

  // === Event Bindings ===
  function bindEvents() {
    // Zoom controls
    elements.btnZoomIn.addEventListener('click', handleZoomIn);
    elements.btnZoomOut.addEventListener('click', handleZoomOut);
    elements.btnResetZoom.addEventListener('click', resetView);

    // Drag/Pan - Mouse
    elements.mapaContainer.addEventListener('mousedown', handleDragStart);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);

    // Drag/Pan - Touch
    elements.mapaContainer.addEventListener('touchstart', handleDragStart, { passive: false });
    document.addEventListener('touchmove', handleDragMove, { passive: false });
    document.addEventListener('touchend', handleDragEnd);

    // Wheel zoom
    elements.mapaContainer.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -CONFIG.zoomStep : CONFIG.zoomStep;
      setZoom(state.zoom + delta);
    }, { passive: false });

    // Países
    elements.pontosPais.forEach(ponto => {
      ponto.addEventListener('click', handleCountryClick);
    });

    // Navegação rodapé
    elements.btnVoltar.addEventListener('click', () => {
      window.history.back();
    });

    elements.btnLogo.addEventListener('click', () => {
      window.location.href = '/app/principal/index.html';
    });

    elements.btnGeladeira.addEventListener('click', () => {
      window.location.href = '/app/minha-geladeira/index.html';
    });

    // Teclas de atalho
    document.addEventListener('keydown', (e) => {
      if (e.key === '+' || e.key === '=') handleZoomIn();
      if (e.key === '-' || e.key === '_') handleZoomOut();
      if (e.key === '0') resetView();
    });
  }

  // === Execução ===
  init();

})();
