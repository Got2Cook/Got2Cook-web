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

  /* ===== Estado ===== */
  let state = {
    scale: 1,
    posX: 0,
    posY: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
    lastTouchDistance: 0,
    hasMoved: false,
    minScale: 1,
    maxScale: 4,
    adjustMode: false,
    selectedPin: null
  };

  /* ===== Atualizar Display do Zoom ===== */
  function updateZoomDisplay() {
    const percentage = Math.round(state.scale * 100);
    zoomLevel.textContent = `${percentage}%`;
  }

  /* ===== Calcular Limites ===== */
  function calculateBounds() {
    const containerRect = mapaContainer.getBoundingClientRect();
    const imgRect = mapaImg.getBoundingClientRect();
    
    const baseWidth = imgRect.width;
    const baseHeight = imgRect.height;
    
    const scaledWidth = baseWidth * state.scale;
    const scaledHeight = baseHeight * state.scale;
    
    const maxX = Math.max(0, (scaledWidth - containerRect.width) / 2);
    const minX = -maxX;
    const maxY = Math.max(0, (scaledHeight - containerRect.height) / 2);
    const minY = -maxY;
    
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
    
    // MUDANÇA CRÍTICA: aplicar translação E escala no wrapper
    // Assim os pins (que estão dentro) se movem junto
    mapaWrapper.style.transform = `translate(${state.posX}px, ${state.posY}px) scale(${state.scale})`;
    
    updateZoomDisplay();
  }

  /* ===== Zoom Functions ===== */
  function zoomIn() {
    state.scale = Math.min(state.maxScale, state.scale + 0.3);
    updateTransform();
  }

  function zoomOut() {
    state.scale = Math.max(state.minScale, state.scale - 0.3);
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
        state.scale = Math.max(state.minScale, Math.min(state.maxScale, state.scale + scaleChange));
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
    
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    state.scale = Math.max(state.minScale, Math.min(state.maxScale, state.scale + delta));
    
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
  /* ===== FERRAMENTA DE AJUSTE ===== */
  /* ================================================================ */
  
  window.addEventListener('load', function() {
    console.log('%c🗺️ AJUSTE DE PINS', 'background: #28a745; color: white; font-size: 16px; padding: 8px; font-weight: bold;');
    console.log('Pressione A para ativar');
    
    document.body.addEventListener('keydown', function(e) {
      if (e.key === 'a' || e.key === 'A') {
        state.adjustMode = !state.adjustMode;
        console.clear();
        
        if (state.adjustMode) {
          console.log('%c✅ ATIVADO', 'background: green; color: white; padding: 8px; font-size: 16px;');
          console.log('Clique em um pin!');
          mapaContainer.style.cursor = 'crosshair';
        } else {
          console.log('%c❌ DESATIVADO', 'background: red; color: white; padding: 8px;');
          if (state.selectedPin) {
            state.selectedPin.style.filter = '';
            state.selectedPin.style.outline = '';
          }
          state.selectedPin = null;
          mapaContainer.style.cursor = 'grab';
        }
      }
    });
    
    document.querySelectorAll('.pin-pais').forEach(function(pin) {
      pin.addEventListener('click', function(e) {
        if (!state.adjustMode) return;
        
        e.stopPropagation();
        e.preventDefault();
        
        if (state.selectedPin) {
          state.selectedPin.style.filter = '';
          state.selectedPin.style.outline = '';
        }
        
        state.selectedPin = pin;
        pin.style.filter = 'brightness(3) drop-shadow(0 0 20px gold)';
        pin.style.outline = '3px solid yellow';
        
        console.clear();
        console.log('%c📍 SELECIONADO: ' + pin.dataset.pais.toUpperCase(), 'background: blue; color: white; padding: 8px; font-size: 14px;');
        console.log('Posição: ' + pin.style.top + ', ' + pin.style.left);
        console.log('USE AS SETAS! ⬆️⬇️⬅️➡️');
      });
    });
    
    document.body.addEventListener('keydown', function(e) {
      if (!state.adjustMode || !state.selectedPin) return;
      
      let top = parseFloat(state.selectedPin.style.top) || 0;
      let left = parseFloat(state.selectedPin.style.left) || 0;
      const step = e.shiftKey ? 0.1 : 0.5;
      
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        top -= step;
        state.selectedPin.style.top = top + '%';
        console.log('⬆️ top: ' + top.toFixed(1) + '%');
      }
      else if (e.key === 'ArrowDown') {
        e.preventDefault();
        top += step;
        state.selectedPin.style.top = top + '%';
        console.log('⬇️ top: ' + top.toFixed(1) + '%');
      }
      else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        left -= step;
        state.selectedPin.style.left = left + '%';
        console.log('⬅️ left: ' + left.toFixed(1) + '%');
      }
      else if (e.key === 'ArrowRight') {
        e.preventDefault();
        left += step;
        state.selectedPin.style.left = left + '%';
        console.log('➡️ left: ' + left.toFixed(1) + '%');
      }
      else if (e.key === 'Enter') {
        e.preventDefault();
        
        const pais = state.selectedPin.dataset.pais.toUpperCase();
        const label = state.selectedPin.getAttribute('aria-label');
        const codigoStyle = `style="top: ${top.toFixed(1)}%; left: ${left.toFixed(1)}%;"`;
        const htmlCompleto = `<button class="pin-pais" data-pais="${state.selectedPin.dataset.pais}" ${codigoStyle} aria-label="${label}">`;
        
        navigator.clipboard.writeText(codigoStyle).then(() => {
          console.clear();
          console.log('%c✅ COPIADO!', 'background: green; color: white; padding: 10px; font-size: 18px;');
          console.log('');
          console.log('País: ' + pais);
          console.log('');
          console.log('📋 Código:');
          console.log(codigoStyle);
          console.log('');
          console.log('📝 HTML completo:');
          console.log(htmlCompleto);
          console.log('');
          console.log('💡 Cole com Ctrl+V!');
        }).catch(() => {
          console.clear();
          console.log('%c⚠️ Copie manualmente:', 'background: orange; padding: 8px;');
          console.log('');
          console.log(codigoStyle);
        });
      }
    });
  });

})();
