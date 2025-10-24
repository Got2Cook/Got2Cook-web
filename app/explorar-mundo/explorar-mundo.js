// /app/explorar-mundo/explorar-mundo.js

(function() {
  'use strict';

  /* ===== Configuração ===== */
  const CONFIG = {
    minScale: 1,
    maxScale: 3,
    friction: 0.92,
    velocityThreshold: 0.5
  };

  /* ===== Estado ===== */
  let state = {
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    startX: 0,
    startY: 0,
    isDragging: false,
    lastX: 0,
    lastY: 0,
    velocityX: 0,
    velocityY: 0,
    animationId: null,
    lastTouchDistance: 0,
    hasMoved: false
  };

  /* ===== Elementos DOM ===== */
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);

  const elements = {
    mapaWrapper: $('#mapaWrapper'),
    mapaContainer: $('#mapaContainer'),
    mapaImg: $('#mapaImg'),
    pinsPais: $$('.pin-pais')
  };

  /* ===== Inicialização ===== */
  function init() {
    bindEvents();
    applyTransform();
  }

  /* ===== Transformação ===== */
  function applyTransform() {
    elements.mapaWrapper.style.transform = `translate(${state.offsetX}px, ${state.offsetY}px) scale(${state.scale})`;
  }

  function getBounds() {
    const container = elements.mapaContainer.getBoundingClientRect();
    const wrapper = elements.mapaWrapper.getBoundingClientRect();
    
    const scaledWidth = container.width * state.scale;
    const scaledHeight = container.height * state.scale;
    
    const maxX = Math.max(0, (scaledWidth - container.width) / 2);
    const maxY = Math.max(0, (scaledHeight - container.height) / 2);
    
    return { maxX, maxY };
  }

  function constrainPosition() {
    const bounds = getBounds();
    state.offsetX = Math.max(-bounds.maxX, Math.min(bounds.maxX, state.offsetX));
    state.offsetY = Math.max(-bounds.maxY, Math.min(bounds.maxY, state.offsetY));
  }

  /* ===== Zoom ===== */
  function setZoom(delta, centerX, centerY) {
    const oldScale = state.scale;
    state.scale = Math.max(CONFIG.minScale, Math.min(CONFIG.maxScale, state.scale + delta));
    
    if (centerX !== undefined && centerY !== undefined) {
      const scaleRatio = state.scale / oldScale;
      const containerRect = elements.mapaContainer.getBoundingClientRect();
      
      const pointX = centerX - containerRect.left - containerRect.width / 2;
      const pointY = centerY - containerRect.top - containerRect.height / 2;
      
      state.offsetX = pointX - (pointX - state.offsetX) * scaleRatio;
      state.offsetY = pointY - (pointY - state.offsetY) * scaleRatio;
    }
    
    constrainPosition();
    applyTransform();
  }

  /* ===== Drag (Mouse) ===== */
  function handleMouseDown(e) {
    if (e.target.closest('.pin-pais')) return;
    
    state.isDragging = true;
    state.hasMoved = false;
    elements.mapaWrapper.classList.add('grabbing');
    
    state.startX = e.clientX - state.offsetX;
    state.startY = e.clientY - state.offsetY;
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
    
    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
      state.hasMoved = true;
    }
    
    state.velocityX = deltaX;
    state.velocityY = deltaY;
    
    state.offsetX = e.clientX - state.startX;
    state.offsetY = e.clientY - state.startY;
    
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
      state.hasMoved = false;
      elements.mapaWrapper.classList.add('grabbing');
      
      const touch = e.touches[0];
      state.startX = touch.clientX - state.offsetX;
      state.startY = touch.clientY - state.offsetY;
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
      
      if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) {
        state.hasMoved = true;
      }
      
      state.velocityX = deltaX;
      state.velocityY = deltaY;
      
      state.offsetX = touch.clientX - state.startX;
      state.offsetY = touch.clientY - state.startY;
      
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
        const delta = (distance - state.lastTouchDistance) * 0.01;
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
      
      state.offsetX += state.velocityX;
      state.offsetY += state.velocityY;
      
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
    
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoom(delta, e.clientX, e.clientY);
  }

  /* ===== Países ===== */
  function handleCountryClick(e) {
    e.stopPropagation();
    
    if (state.hasMoved) {
      state.hasMoved = false;
      return;
    }
    
    const pais = this.dataset.pais;
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
  }

  /* ===== Boot ===== */
  document.addEventListener('DOMContentLoaded', init);

})();
