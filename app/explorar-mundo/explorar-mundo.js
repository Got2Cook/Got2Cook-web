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
  
  // Aguardar DOM estar pronto
  setTimeout(() => {
    console.log('%c🗺️ FERRAMENTA DE AJUSTE DE PINS', 'background: #225c18; color: #c0ffa5; font-size: 16px; padding: 8px; font-weight: bold;');
    console.log('%c⌨️  Pressione "A" para ativar/desativar', 'color: #225c18; font-size: 12px;');
    console.log('');
    console.log('%c📖 INSTRUÇÕES:', 'color: #225c18; font-weight: bold;');
    console.log('  1️⃣  Pressione A para ativar');
    console.log('  2️⃣  Clique no pin que deseja ajustar');
    console.log('  3️⃣  Use as setas ⬆️⬇️⬅️➡️ do teclado');
    console.log('  4️⃣  Shift + setas para precisão');
    console.log('  5️⃣  Enter para copiar código');
    console.log('');
    console.log('%c⚠️ REMOVER ESTA FERRAMENTA ANTES DA PRODUÇÃO!', 'background: #dc3545; color: white; font-size: 12px; padding: 4px;');

    // Tecla A para ativar/desativar
    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === 'a' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        state.adjustMode = !state.adjustMode;
        
        if (state.adjustMode) {
          console.clear();
          console.log('%c✅ MODO DE AJUSTE ATIVADO', 'background: #28a745; color: white; font-size: 14px; padding: 6px; font-weight: bold;');
          console.log('');
          console.log('🔒 Navegação do mapa BLOQUEADA');
          console.log('👆 Clique em um pin para selecionar');
          console.log('');
          mapaContainer.style.cursor = 'crosshair';
        } else {
          console.clear();
          console.log('%c❌ MODO DESATIVADO', 'background: #dc3545; color: white; font-size: 14px; padding: 6px; font-weight: bold;');
          console.log('✅ Navegação REATIVADA');
          
          if (state.selectedPin) {
            state.selectedPin.style.filter = '';
            state.selectedPin = null;
          }
          
          mapaContainer.style.cursor = 'grab';
        }
      }
    }, false);

    // Selecionar pin
    pinsPais.forEach(pin => {
      pin.addEventListener('click', (e) => {
        if (!state.adjustMode) return;
        
        e.stopPropagation();
        e.preventDefault();
        
        if (state.selectedPin) {
          state.selectedPin.style.filter = '';
        }
        
        state.selectedPin = pin;
        state.selectedPin.style.filter = 'brightness(1.8) saturate(2) drop-shadow(0 0 10px #ffd700)';
        
        console.clear();
        console.log('%c📍 PIN SELECIONADO', 'background: #007bff; color: white; font-size: 12px; padding: 4px; font-weight: bold;');
        console.log('');
        console.log(`🌍 País: ${pin.dataset.pais.toUpperCase()}`);
        console.log(`📝 Label: ${pin.getAttribute('aria-label')}`);
        console.log('');
        console.log('%cPosição atual:', 'font-weight: bold; color: #007bff;');
        console.log(`  top:  ${pin.style.top}`);
        console.log(`  left: ${pin.style.left}`);
        console.log('');
        console.log('%c⌨️  CONTROLES:', 'font-weight: bold;');
        console.log('  ⬆️⬇️⬅️➡️        : move 0.5%');
        console.log('  Shift + setas : move 0.1%');
        console.log('  Enter         : copiar código');
      }, false);
    });

    // Mover com setas
    window.addEventListener('keydown', (e) => {
      if (!state.adjustMode || !state.selectedPin) return;
      
      const step = e.shiftKey ? 0.1 : 0.5;
      let top = parseFloat(state.selectedPin.style.top) || 0;
      let left = parseFloat(state.selectedPin.style.left) || 0;
      
      let moved = false;
      
      if (e.key === 'ArrowUp') {
        top -= step;
        moved = true;
        e.preventDefault();
      } else if (e.key === 'ArrowDown') {
        top += step;
        moved = true;
        e.preventDefault();
      } else if (e.key === 'ArrowLeft') {
        left -= step;
        moved = true;
        e.preventDefault();
      } else if (e.key === 'ArrowRight') {
        left += step;
        moved = true;
        e.preventDefault();
      } else if (e.key === 'Enter') {
        console.clear();
        console.log('%c✅ CÓDIGO PARA COPIAR', 'background: #28a745; color: white; font-size: 14px; padding: 6px; font-weight: bold;');
        console.log('');
        console.log(`📍 País: ${state.selectedPin.dataset.pais.toUpperCase()}`);
        console.log('');
        console.log('%c📋 Style para copiar:', 'font-weight: bold; color: #007bff;');
        console.log('');
        console.log(`style="top: ${top.toFixed(1)}%; left: ${left.toFixed(1)}%;"`);
        console.log('');
        console.log('%c📝 HTML completo:', 'font-weight: bold; color: #007bff;');
        console.log('');
        console.log(`<button class="pin-pais" data-pais="${state.selectedPin.dataset.pais}" style="top: ${top.toFixed(1)}%; left: ${left.toFixed(1)}%;" aria-label="${state.selectedPin.getAttribute('aria-label')}">`);
        console.log('');
        console.log('%c💡 Cole no HTML e recarregue!', 'color: #6c757d; font-style: italic;');
        e.preventDefault();
        return;
      }
      
      if (moved) {
        state.selectedPin.style.top = `${top}%`;
        state.selectedPin.style.left = `${left}%`;
        
        console.clear();
        console.log('%c📍 MOVENDO PIN', 'background: #007bff; color: white; font-size: 12px; padding: 4px;');
        console.log('');
        console.log(`🌍 ${state.selectedPin.dataset.pais.toUpperCase()}`);
        console.log('');
        console.log('%cPosição:', 'font-weight: bold; color: #28a745;');
        console.log(`  top:  ${top.toFixed(1)}%`);
        console.log(`  left: ${left.toFixed(1)}%`);
        console.log('');
        console.log('%cContinue movendo ou Enter para finalizar', 'color: #6c757d; font-style: italic;');
      }
    }, false);
    
  }, 500); // Delay para garantir que tudo está carregado

  /* ===== FIM DA FERRAMENTA ===== */

})();
