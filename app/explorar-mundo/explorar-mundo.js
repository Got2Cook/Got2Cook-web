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
    maxScale: 2.5
  };

  /* ===== Atualizar Display do Zoom ===== */
  function updateZoomDisplay() {
    const percentage = Math.round(state.scale * 100);
    zoomLevel.textContent = `${percentage}%`;
  }

  /* ===== Calcular Limites ===== */
  function calculateBounds() {
    const containerRect = mapaContainer.getBoundingClientRect();
    
    // Dimensões reais da imagem com escala aplicada
    const imgNaturalWidth = mapaImg.naturalWidth || mapaImg.width;
    const imgNaturalHeight = mapaImg.naturalHeight || mapaImg.height;
    
    // Como a imagem está em width: 250%, calculamos baseado nisso
    const imgDisplayWidth = containerRect.width * 2.5; // 250% do container
    const imgDisplayHeight = (imgNaturalHeight / imgNaturalWidth) * imgDisplayWidth;
    
    const scaledWidth = imgDisplayWidth * state.scale;
    const scaledHeight = imgDisplayHeight * state.scale;
    
    // Limites para não sair da imagem
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
    if (e.target.closest('.pin-pais') || e.target.closest('.zoom-controls')) return;
    
    state.isDragging = true;
    state.hasMoved = false;
    state.startX = e.clientX - state.posX;
    state.startY = e.clientY - state.posY;
    
    mapaContainer.style.cursor = 'grabbing';
    e.preventDefault();
  }

  function onMouseMove(e) {
    if (!state.isDragging) return;
    
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
    // Aguardar carregamento da imagem
    const initTransform = () => {
      updateTransform();
    };

    if (mapaImg.complete && mapaImg.naturalWidth) {
      initTransform();
    } else {
      mapaImg.addEventListener('load', initTransform);
    }
    
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
    
    // Zoom buttons
    zoomInBtn.addEventListener('click', zoomIn);
    zoomOutBtn.addEventListener('click', zoomOut);
    
    // Pin clicks
    pinsPais.forEach(pin => {
      pin.addEventListener('click', onPinClick);
    });
    
    // Resize
    window.addEventListener('resize', onResize);
    
    // Prevenir comportamento padrão
    mapaContainer.addEventListener('dragstart', (e) => e.preventDefault());
  }

  /* ===== Boot ===== */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
