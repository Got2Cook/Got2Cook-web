// /app/explorar-mundo/explorar-mundo.js

(function() {
  'use strict';

  /* ===== Configuração ===== */
  const CONFIG = {
    minScale: 1,
    maxScale: 3,
    friction: 0.88,
    velocityThreshold: 0.3
  };

  /* ===== Estado ===== */
  let state = {
    scale: 1,
    posX: 0,
    posY: 0,
    startX: 0,
    startY: 0,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    velocityX: 0,
    velocityY: 0,
    animationId: null,
    lastTouchDistance: 0,
    visitedCountries: []
  };

  /* ===== Elementos DOM ===== */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const elements = {
    mapaWrapper: $('#mapaWrapper'),
    mapaContainer: $('#mapaContainer'),
    mapaSvg: $('#mapaSvg'),
    pinsPais: $$('.pin-pais')
  };

  /* ===== Inicialização ===== */
  function init() {
    loadVisitedCountries();
    updateVisitedStatus();
    bindEvents();
    applyTransform();
  }

  /* ===== LocalStorage ===== */
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
    elements.pinsPais.forEach(pin => {
      const pais = pin.dataset.pais;
      if (state.visitedCountries.includes(pais)) {
        pin.classList.add('visitado');
      }
    });
  }

  /* ===== Transformação ===== */
  function applyTransform() {
    const transform = `translate(${state.posX}px, ${state.posY}px) scale(${state.scale})`;
    elements.mapaWrapper.style.transform = transform;
  }

  function getBounds() {
    const containerRect = elements.mapaContainer.getBoundingClientRect();
    const wrapperRect = elements.mapaWrapper.getBoundingClientRect();
    
    const maxX = Math.max(0, (wrapperRect.width * state.scale - containerRect.width) / 2);
    const maxY = Math.max(0, (wrapperRect.height * state.scale - containerRect.height) / 2);
    
    return { maxX, maxY };
  }

  function constrainPosition() {
    const bounds = getBounds();
    state.posX = Math.max(-bounds.maxX, Math.min(bounds.maxX, state.posX));
    state.posY = Math.max(-bounds.maxY, Math.min(bounds.maxY, state.posY));
  }

  /* ===== Zoom ===== */
  function setZoom(delta, centerX, centerY) {
    const oldScale = state.scale;
    state.scale = Math.max(CONFIG.minScale, Math.min(CONFIG.maxScale, state.scale + delta));
    
    if (centerX !== undefined && centerY !== undefined) {
      const scaleRatio = state.scale / oldScale - 1;
      const containerRect = elements.mapaContainer.getBoundingClientRect();
      const offsetX = centerX - containerRect.width / 2;
      const offsetY = centerY - containerRect.height / 2;
      
      state.posX -= offsetX * scaleRatio;
      state.posY -= offsetY * scaleRatio;
    }
    
    constrainPosition();
    applyTransform();
  }

  /* ===== Drag (Mouse) ===== */
  function handleMouseDown(e) {
    if (e.target.closest('.pin-pais')) return;
    
    state.isDragging = true;
    elements.mapaWrapper.classList.add('grabbing');
    
    state.startX = e.clientX - state.posX;
    state.startY = e.clientY - state.posY;
    state.lastX = e.clientX;
    state.lastY = e.clientY;
    state.velocityX = 0;
    state.velocityY = 0;
    
    if (state.animationId) {
      cancelAnimationFrame(state.animationId);
      state.animationId = null;
    }
    
    e.preventDefault();
  }

  function handleMouseMove(e) {
    if (!state.isDragging) return;
    
    const deltaX = e.clientX - state.lastX;
    const deltaY = e.clientY - state.lastY;
    
    state.velocityX = deltaX;
    state.velocityY = deltaY;
    
    state.posX = e.clientX - state.startX;
    state.posY = e.clientY - state.startY;
    
    constrainPosition();
    applyTransform();
    
    state.lastX = e.clientX;
    state.lastY = e.clientY;
    
    e.preventDefault();
  }

  function handleMouseUp() {
    if (!state.isDragging) return;
    
    state.isDragging = false;
    elements.mapaWrapper.classList.remove('grabbing');
    
    if (Math.abs(state.velocityX) > CONFIG.velocityThreshold || 
        Math.abs(state.velocityY) > CONFIG.velocityThreshold) {
      applyInertia();
    }
  }

  /* ===== Touch ===== */
  function handleTouchStart(e) {
    if (e.target.closest('.pin-pais')) return;
    
    if (e.touches.length === 1) {
      state.isDragging = true;
      elements.mapaWrapper.classList.add('grabbing');
      
      const touch = e.touches[0];
      state.startX = touch.clientX - state.posX;
      state.startY = touch.clientY - state.posY;
      state.lastX = touch.clientX;
      state.lastY = touch.clientY;
      state.velocityX = 0;
      state.velocityY = 0;
      
      if (state.animationId) {
        cancelAnimationFrame(state.animationId);
        state.animationId = null;
      }
    } else if (e.touches.length === 2) {
      state.isDragging = false;
      elements.mapaWrapper.classList.remove('grabbing');
      
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      state.lastTouchDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
    }
    
    e.preventDefault();
  }

  function handleTouchMove(e) {
    if (e.touches.length === 1 && state.isDragging) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - state.lastX;
      const deltaY = touch.clientY - state.lastY;
      
      state.velocityX = deltaX;
      state.velocityY = deltaY;
      
      state.posX = touch.clientX - state.startX;
      state.posY = touch.clientY - state.startY;
      
      constrainPosition();
      applyTransform();
      
      state.lastX = touch.clientX;
      state.lastY = touch.clientY;
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      if (state.lastTouchDistance > 0) {
        const delta = (distance - state.lastTouchDistance) * 0.008;
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        setZoom(delta, centerX, centerY);
      }
      
      state.lastTouchDistance = distance;
    }
    
    e.preventDefault();
  }

  function handleTouchEnd(e) {
    if (e.touches.length === 0) {
      if (state.isDragging) {
        state.isDragging = false;
        elements.mapaWrapper.classList.remove('grabbing');
        
        if (Math.abs(state.velocityX) > CONFIG.velocityThreshold || 
            Math.abs(state.velocityY) > CONFIG.velocityThreshold) {
          applyInertia();
        }
      }
      
      state.lastTouchDistance = 0;
    }
  }

  /* ===== Inércia ===== */
  function applyInertia() {
    function animate() {
      state.velocityX *= CONFIG.friction;
      state.velocityY *= CONFIG.friction;
      
      state.posX += state.velocityX;
      state.posY += state.velocityY;
      
      constrainPosition();
      applyTransform();
      
      if (Math.abs(state.velocityX) > 0.1 || Math.abs(state.velocityY) > 0.1) {
        state.animationId = requestAnimationFrame(animate);
      } else {
        state.animationId = null;
      }
    }
    
    animate();
  }

  /* ===== Wheel Zoom ===== */
  function handleWheel(e) {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    const rect = elements.mapaContainer.getBoundingClientRect();
    const centerX = e.clientX - rect.left;
    const centerY = e.clientY - rect.top;
    
    setZoom(delta, centerX, centerY);
  }

  /* ===== Países ===== */
  function handleCountryClick(e) {
    e.stopPropagation();
    const pais = this.dataset.pais;
    
    markCountryAsVisited(pais);
    this.classList.add('visitado');
    
    window.location.href = `../culinaria-pais/index.html?pais=${pais}`;
  }

  /* ===== Event Bindings ===== */
  function bindEvents() {
    // Mouse
    elements.mapaContainer.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Touch
    elements.mapaContainer.addEventListener('touchstart', handleTouchStart, { passive: false });
    elements.mapaContainer.addEventListener('touchmove', handleTouchMove, { passive: false });
    elements.mapaContainer.addEventListener('touchend', handleTouchEnd);

    // Wheel
    elements.mapaContainer.addEventListener('wheel', handleWheel, { passive: false });

    // Países
    elements.pinsPais.forEach(pin => {
      pin.addEventListener('click', handleCountryClick);
    });

    // Prevenir scroll do body
    document.body.addEventListener('touchmove', (e) => {
      e.preventDefault();
    }, { passive: false });
  }

  /* ===== Boot ===== */
  document.addEventListener('DOMContentLoaded', init);

})();
