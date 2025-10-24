// /app/explorar-mundo/explorar-mundo.js

(function() {
  'use strict';

  /* ===== Elementos DOM ===== */
  const mapaContainer = document.getElementById('mapaContainer');
  const mapaWrapper = document.getElementById('mapaWrapper');
  const pinsPais = document.querySelectorAll('.pin-pais');

  /* ===== Estado ===== */
  let state = {
    scale: 1,
    translateX: 0,
    translateY: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    lastTouchDistance: 0,
    hasMoved: false
  };

  /* ===== Aplicar Transformação ===== */
  function updateTransform() {
    mapaWrapper.style.transform = `translate(${state.translateX}px, ${state.translateY}px) scale(${state.scale})`;
  }

  /* ===== Mouse Events ===== */
  function onMouseDown(e) {
    // Ignorar se clicar em um pin
    if (e.target.closest('.pin-pais')) return;
    
    state.isDragging = true;
    state.hasMoved = false;
    state.startX = e.clientX - state.translateX;
    state.startY = e.clientY - state.translateY;
    
    mapaContainer.style.cursor = 'grabbing';
    e.preventDefault();
  }

  function onMouseMove(e) {
    if (!state.isDragging) return;
    
    const deltaX = Math.abs(e.clientX - (state.startX + state.translateX));
    const deltaY = Math.abs(e.clientY - (state.startY + state.translateY));
    
    if (deltaX > 3 || deltaY > 3) {
      state.hasMoved = true;
    }
    
    state.translateX = e.clientX - state.startX;
    state.translateY = e.clientY - state.startY;
    
    updateTransform();
    e.preventDefault();
  }

  function onMouseUp(e) {
    if (!state.isDragging) return;
    
    state.isDragging = false;
    mapaContainer.style.cursor = 'grab';
    e.preventDefault();
  }

  /* ===== Touch Events ===== */
  function onTouchStart(e) {
    // Ignorar se tocar em um pin
    if (e.target.closest('.pin-pais')) return;
    
    if (e.touches.length === 1) {
      state.isDragging = true;
      state.hasMoved = false;
      const touch = e.touches[0];
      state.startX = touch.clientX - state.translateX;
      state.startY = touch.clientY - state.translateY;
    } else if (e.touches.length === 2) {
      state.isDragging = false;
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      state.lastTouchDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
    }
    
    e.preventDefault();
  }

  function onTouchMove(e) {
    if (e.touches.length === 1 && state.isDragging) {
      const touch = e.touches[0];
      
      const deltaX = Math.abs(touch.clientX - (state.startX + state.translateX));
      const deltaY = Math.abs(touch.clientY - (state.startY + state.translateY));
      
      if (deltaX > 3 || deltaY > 3) {
        state.hasMoved = true;
      }
      
      state.translateX = touch.clientX - state.startX;
      state.translateY = touch.clientY - state.startY;
      
      updateTransform();
    } else if (e.touches.length === 2) {
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      if (state.lastTouchDistance > 0) {
        const delta = distance - state.lastTouchDistance;
        const scaleChange = delta * 0.01;
        state.scale = Math.max(1, Math.min(3, state.scale + scaleChange));
        updateTransform();
      }
      
      state.lastTouchDistance = distance;
    }
    
    e.preventDefault();
  }

  function onTouchEnd(e) {
    if (e.touches.length === 0) {
      state.isDragging = false;
      state.lastTouchDistance = 0;
    }
    e.preventDefault();
  }

  /* ===== Wheel Zoom ===== */
  function onWheel(e) {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(1, Math.min(3, state.scale + delta));
    
    // Zoom em direção ao cursor
    const rect = mapaContainer.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const scaleFactor = newScale / state.scale;
    
    state.translateX = mouseX - (mouseX - state.translateX) * scaleFactor;
    state.translateY = mouseY - (mouseY - state.translateY) * scaleFactor;
    state.scale = newScale;
    
    updateTransform();
  }

  /* ===== Click nos Pins ===== */
  function onPinClick(e) {
    e.stopPropagation();
    
    // Se moveu o mapa, não navegar
    if (state.hasMoved) {
      state.hasMoved = false;
      return;
    }
    
    const pais = this.dataset.pais;
    window.location.href = `../culinaria-pais/index.html?pais=${pais}`;
  }

  /* ===== Inicialização ===== */
  function init() {
    // Mouse events
    mapaContainer.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    
    // Touch events
    mapaContainer.addEventListener('touchstart', onTouchStart, { passive: false });
    mapaContainer.addEventListener('touchmove', onTouchMove, { passive: false });
    mapaContainer.addEventListener('touchend', onTouchEnd, { passive: false });
    
    // Wheel zoom
    mapaContainer.addEventListener('wheel', onWheel, { passive: false });
    
    // Pin clicks
    pinsPais.forEach(pin => {
      pin.addEventListener('click', onPinClick);
    });
    
    // Prevenir comportamento padrão
    mapaContainer.addEventListener('dragstart', (e) => e.preventDefault());
    
    // Aplicar transformação inicial
    updateTransform();
  }

  /* ===== Boot ===== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
