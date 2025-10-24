// /app/explorar-mundo/explorar-mundo.js

(function() {
  'use strict';

  /* ===== Elementos DOM ===== */
  const mapaContainer = document.getElementById('mapaContainer');
  const mapaWrapper = document.getElementById('mapaWrapper');
  const mapaImg = document.getElementById('mapaImg');
  const pinsPais = document.querySelectorAll('.pin-pais');
  const zoomInBtn = document.getElementById('zoomIn');
  const zoomOutBtn = document.getElementById('zoomOut');
  const zoomLevel = document.getElementById('zoomLevel');

  /* ===== Estado GLOBAL ===== */
  window.mapState = {
    scale: 0.6,
    posX: 0,
    posY: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    lastTouchDistance: 0,
    hasMoved: false,
    minScale: 0.5,
    maxScale: 2.5,
    adjustMode: false,
    selectedPin: null
  };
  
  const state = window.mapState; // Alias local

  /* ===== Atualizar Display do Zoom ===== */
  function updateZoomDisplay() {
    const percentage = Math.round(state.scale * 100);
    zoomLevel.textContent = `${percentage}%`;
  }

  /* ===== Calcular Limites ===== */
  function calculateBounds() {
    const containerRect = mapaContainer.getBoundingClientRect();
    
    const imgNaturalWidth = mapaImg.naturalWidth || mapaImg.width;
    const imgNaturalHeight = mapaImg.naturalHeight || mapaImg.height;
    
    const imgDisplayWidth = containerRect.width * 2.5;
    const imgDisplayHeight = (imgNaturalHeight / imgNaturalWidth) * imgDisplayWidth;
    
    const scaledWidth = imgDisplayWidth * state.scale;
    const scaledHeight = imgDisplayHeight * state.scale;
    
    const maxX = 0;
    const minX = Math.min(0, containerRect.width - scaledWidth);
    const maxY = 0;
    const minY = Math.min(0, containerRect.height - scaledHeight);
    
    return { minX, maxX, minY, maxY };
  }

  /* ===== Restringir Posição ===== */
  function constrainPosition() {
    const bounds = calculateBounds();
    state.posX = Math.max(bounds.minX, Math.min(bounds.maxX, state.posX));
    state.posY = Math.max(bounds.minY, Math.min(bounds.maxY, state.posY));
  }

  /* ===== Aplicar Transformação ===== */
  function updateTransform() {
    constrainPosition();
    mapaWrapper.style.transform = `translate(${state.posX}px, ${state.posY}px) scale(${state.scale})`;
    updateZoomDisplay();
  }

  /* ===== Zoom Functions ===== */
  function zoomIn() {
    const oldScale = state.scale;
    state.scale = Math.min(state.maxScale, state.scale + 0.2);
    
    const containerRect = mapaContainer.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;
    
    const scaleRatio = state.scale / oldScale;
    state.posX = centerX - (centerX - state.posX) * scaleRatio;
    state.posY = centerY - (centerY - state.posY) * scaleRatio;
    
    updateTransform();
  }

  function zoomOut() {
    const oldScale = state.scale;
    state.scale = Math.max(state.minScale, state.scale - 0.2);
    
    const containerRect = mapaContainer.getBoundingClientRect();
    const centerX = containerRect.width / 2;
    const centerY = containerRect.height / 2;
    
    const scaleRatio = state.scale / oldScale;
    state.posX = centerX - (centerX - state.posX) * scaleRatio;
    state.posY = centerY - (centerY - state.posY) * scaleRatio;
    
    updateTransform();
  }

  /* ===== Mouse Events ===== */
  function onMouseDown(e) {
    if (state.adjustMode) return;
    if (e.target.closest('.pin-pais') || e.target.closest('.zoom-controls')) return;
    
    state.isDragging = true;
    state.hasMoved = false;
    state.startX = e.clientX - state.posX;
    state.startY = e.clientY - state.posY;
    
    mapaContainer.style.cursor = 'grabbing';
    e.preventDefault();
  }

  function onMouseMove(e) {
    if (!state.isDragging || state.adjustMode) return;
    
    const newX = e.clientX - state.startX;
    const newY = e.clientY - state.startY;
    
    const deltaX = Math.abs(newX - state.posX);
    const deltaY = Math.abs(newY - state.posY);
    
    if (deltaX > 3 || deltaY > 3) {
      state.hasMoved = true;
    }
    
    state.posX = newX;
    state.posY = newY;
    
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
    if (state.adjustMode) return;
    if (e.target.closest('.pin-pais') || e.target.closest('.zoom-controls')) return;
    
    if (e.touches.length === 1) {
      state.isDragging = true;
      state.hasMoved = false;
      const touch = e.touches[0];
      state.startX = touch.clientX - state.posX;
      state.startY = touch.clientY - state.posY;
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
    if (state.adjustMode) return;
    
    if (e.touches.length === 1 && state.isDragging) {
      const touch = e.touches[0];
      
      const newX = touch.clientX - state.startX;
      const newY = touch.clientY - state.startY;
      
      const deltaX = Math.abs(newX - state.posX);
      const deltaY = Math.abs(newY - state.posY);
      
      if (deltaX > 3 || deltaY > 3) {
        state.hasMoved = true;
      }
      
      state.posX = newX;
      state.posY = newY;
      
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
        const oldScale = state.scale;
        state.scale = Math.max(state.minScale, Math.min(state.maxScale, state.scale + scaleChange));
        
        const centerX = (touch1.clientX + touch2.clientX) / 2;
        const centerY = (touch1.clientY + touch2.clientY) / 2;
        const containerRect = mapaContainer.getBoundingClientRect();
        const pointX = centerX - containerRect.left;
        const pointY = centerY - containerRect.top;
        
        const scaleRatio = state.scale / oldScale;
        state.posX = pointX - (pointX - state.posX) * scaleRatio;
        state.posY = pointY - (pointY - state.posY) * scaleRatio;
        
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
    if (state.adjustMode) return;
    
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? -0.15 : 0.15;
    const oldScale = state.scale;
    state.scale = Math.max(state.minScale, Math.min(state.maxScale, state.scale + delta));
    
    const rect = mapaContainer.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const scaleRatio = state.scale / oldScale;
    state.posX = mouseX - (mouseX - state.posX) * scaleRatio;
    state.posY = mouseY - (mouseY - state.posY) * scaleRatio;
    
    updateTransform();
  }

  /* ===== Click nos Pins ===== */
  function onPinClick(e) {
    if (state.adjustMode) return;
    
    e.stopPropagation();
    
    if (state.hasMoved) {
      state.hasMoved = false;
      return;
    }
    
    const pais = this.dataset.pais;
    window.location.href = `../culinaria-pais/index.html?pais=${pais}`;
  }

  /* ===== Resize Handler ===== */
  function onResize() {
    updateTransform();
  }

  /* ===== Inicialização ===== */
  function init() {
    const initTransform = () => {
      updateTransform();
    };

    if (mapaImg.complete && mapaImg.naturalWidth) {
      initTransform();
    } else {
      mapaImg.addEventListener('load', initTransform);
    }
    
    mapaContainer.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    
    mapaContainer.addEventListener('touchstart', onTouchStart, { passive: false });
    mapaContainer.addEventListener('touchmove', onTouchMove, { passive: false });
    mapaContainer.addEventListener('touchend', onTouchEnd, { passive: false });
    
    mapaContainer.addEventListener('wheel', onWheel, { passive: false });
    
    zoomInBtn.addEventListener('click', zoomIn);
    zoomOutBtn.addEventListener('click', zoomOut);
    
    pinsPais.forEach(pin => {
      pin.addEventListener('click', onPinClick);
    });
    
    window.addEventListener('resize', onResize);
    
    mapaContainer.addEventListener('dragstart', (e) => e.preventDefault());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  /* ================================================================ */
  /* ===== FERRAMENTA DE AJUSTE DE PINS (REMOVER EM PRODUÇÃO) ===== */
  /* ================================================================ */
  
  setTimeout(() => {
    const state = window.mapState; // Usar state global
    
    console.log('%c🗺️ FERRAMENTA DE AJUSTE DE PINS', 'background: #225c18; color: #c0ffa5; font-size: 16px; padding: 8px; font-weight: bold;');
    console.log('%c⌨️  Pressione "A" para ativar', 'color: #225c18; font-size: 12px;');
    console.log('');
    console.log('%c📖 INSTRUÇÕES:', 'color: #225c18; font-weight: bold;');
    console.log('  1️⃣  Pressione A');
    console.log('  2️⃣  CLIQUE no pin');
    console.log('  3️⃣  Use setas ⬆️⬇️⬅️➡️');
    console.log('  4️⃣  Enter para copiar');
    console.log('');

    // Ativar modo
    document.addEventListener('keydown', function handleAdjustMode(e) {
      if (e.key.toLowerCase() === 'a' && !e.ctrlKey && !e.metaKey) {
        state.adjustMode = !state.adjustMode;
        
        if (state.adjustMode) {
          console.clear();
          console.log('%c✅ MODO ATIVADO', 'background: #28a745; color: white; font-size: 14px; padding: 6px; font-weight: bold;');
          console.log('');
          console.log('🔒 Mapa BLOQUEADO');
          console.log('👆 CLIQUE em um pin');
          console.log('');
          mapaContainer.style.cursor = 'crosshair';
          document.body.style.cursor = 'crosshair';
        } else {
          console.clear();
          console.log('%c❌ MODO DESATIVADO', 'background: #dc3545; color: white; font-size: 14px; padding: 6px;');
          
          if (state.selectedPin) {
            state.selectedPin.style.filter = '';
            state.selectedPin = null;
          }
          
          mapaContainer.style.cursor = 'grab';
          document.body.style.cursor = 'default';
        }
      }
    });

    // Selecionar pin - EVENTO DIRETO em cada pin
    document.querySelectorAll('.pin-pais').forEach(pin => {
      pin.addEventListener('mousedown', function selectPin(e) {
        if (!state.adjustMode) return;
        
        e.stopPropagation();
        e.preventDefault();
        
        console.log('🖱️ CLIQUE DETECTADO no pin:', pin.dataset.pais);
        
        if (state.selectedPin) {
          state.selectedPin.style.filter = '';
        }
        
        state.selectedPin = pin;
        pin.style.filter = 'brightness(2) saturate(3) drop-shadow(0 0 15px gold)';
        
        console.clear();
        console.log('%c📍 PIN SELECIONADO!', 'background: #007bff; color: white; font-size: 14px; padding: 6px; font-weight: bold;');
        console.log('');
        console.log(`🌍 ${pin.dataset.pais.toUpperCase()}`);
        console.log(`📝 ${pin.getAttribute('aria-label')}`);
        console.log('');
        console.log('%cPosição:', 'font-weight: bold;');
        console.log(`  top:  ${pin.style.top}`);
        console.log(`  left: ${pin.style.left}`);
        console.log('');
        console.log('%c⌨️  USE AS SETAS AGORA!', 'background: yellow; color: black; font-weight: bold; padding: 4px;');
        console.log('  ⬆️⬇️⬅️➡️     : move 0.5%');
        console.log('  Shift+setas: move 0.1%');
        console.log('  Enter      : copiar código');
      });
    });

    // Mover com setas
    document.addEventListener('keydown', function movePinWithKeys(e) {
      if (!state.adjustMode || !state.selectedPin) return;
      
      const step = e.shiftKey ? 0.1 : 0.5;
      let top = parseFloat(state.selectedPin.style.top) || 0;
      let left = parseFloat(state.selectedPin.style.left) || 0;
      
      let moved = false;
      
      switch(e.key) {
        case 'ArrowUp':
          top -= step;
          moved = true;
          break;
        case 'ArrowDown':
          top += step;
          moved = true;
          break;
        case 'ArrowLeft':
          left -= step;
          moved = true;
          break;
        case 'ArrowRight':
          left += step;
          moved = true;
          break;
        case 'Enter':
          console.clear();
          console.log('%c✅ CÓDIGO FINAL', 'background: #28a745; color: white; font-size: 14px; padding: 6px; font-weight: bold;');
          console.log('');
          console.log(`📍 ${state.selectedPin.dataset.pais.toUpperCase()}`);
          console.log('');
          console.log('%c📋 COPIE ESTE CÓDIGO:', 'font-weight: bold; color: #007bff; font-size: 13px;');
          console.log('');
          console.log(`style="top: ${top.toFixed(1)}%; left: ${left.toFixed(1)}%;"`);
          console.log('');
          console.log('%c📝 HTML completo:', 'font-weight: bold;');
          console.log('');
          console.log(`<button class="pin-pais" data-pais="${state.selectedPin.dataset.pais}" style="top: ${top.toFixed(1)}%; left: ${left.toFixed(1)}%;" aria-label="${state.selectedPin.getAttribute('aria-label')}">`);
          e.preventDefault();
          return;
      }
      
      if (moved) {
        e.preventDefault();
        state.selectedPin.style.top = `${top}%`;
        state.selectedPin.style.left = `${left}%`;
        
        console.clear();
        console.log('%c📍 MOVENDO', 'background: #007bff; color: white; font-size: 12px; padding: 4px;');
        console.log('');
        console.log(`🌍 ${state.selectedPin.dataset.pais.toUpperCase()}`);
        console.log('');
        console.log(`  top:  ${top.toFixed(1)}%`);
        console.log(`  left: ${left.toFixed(1)}%`);
        console.log('');
        console.log('%cContinue ou Enter para finalizar', 'color: #6c757d;');
      }
    });
    
  }, 1000); // Delay maior para garantir

  /* ===== FIM DA FERRAMENTA ===== */

})();
