// /app/historico-humor/historicohumor.js
(function(){
  'use strict';

  // Constantes dos humores e dias
  const EMOJIS = ['😭','😡','👏','😢','😋','🥰','😀'];
  const DIAS = ['SEG','TER','QUA','QUI','SEX','SÁB','DOM'];
  
  // Elements
  const canvasLinha = document.getElementById('graficoLinha');
  const canvasPizza = document.getElementById('graficoPizza');
  const periodoSel = document.getElementById('periodo');

  // Navegação rodapé
  document.getElementById('btnVoltar').addEventListener('click', () => history.back());
  document.getElementById('btnLogo').addEventListener('click', () => location.href = '../minhas-receitas/index.html');
  document.getElementById('btnGeladeira').addEventListener('click', () => location.href = '../minha-geladeira/index.html');

  // MODO DEMONSTRAÇÃO - Auto-preenche histórico se vazio
  (function demoAutoSeed() {
    const historico = JSON.parse(localStorage.getItem("got2cook_mood_history"));
    if (!historico || Object.keys(historico).length === 0) {
      const hoje = new Date();
      const emojisTeste = ['😀','🥰','😋','😢','😭','😡','👏'];
      const demo = {};
      
      for (let i = 0; i < 7; i++) {
        const d = new Date(hoje);
        d.setDate(d.getDate() - (6 - i));
        const data = d.toISOString().slice(0, 10);
        demo[data] = emojisTeste[i];
      }
      
      localStorage.setItem("got2cook_mood_history", JSON.stringify(demo));
      console.log('💡 Modo demonstração ativado - histórico de humor criado!');
    }
  })();

  // Funções de canvas responsivo
  function fitCanvas(canvas, cssWidth){
    const dpr = window.devicePixelRatio || 1;
    const cssHeight = cssWidth * 0.75; // aspect-ratio 4:3
    
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    canvas.style.width = cssWidth + 'px';
    canvas.style.height = cssHeight + 'px';
    
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  function getCssSize(canvas){
    const rect = canvas.getBoundingClientRect();
    return {w: rect.width};
  }

  // Funções de dados
  function getHistorico() {
    try {
      return JSON.parse(localStorage.getItem("got2cook_mood_history")) || {};
    } catch (e) {
      console.warn('Erro ao ler histórico de humor:', e);
      return {};
    }
  }

  function emojiIndex(emoji) {
    return EMOJIS.indexOf(emoji);
  }

  function contarFrequencia(listaEmojis) {
    const freq = Array(7).fill(0);
    listaEmojis.forEach(emoji => {
      const idx = emojiIndex(emoji);
      if (idx >= 0) freq[idx]++;
    });
    return freq;
  }

  // Gráfico de linha
  function drawLineChart(canvas, humores) {
    const { w } = getCssSize(canvas);
    const ctx = fitCanvas(canvas, w);
    const h = canvas.height;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Área do gráfico
    const gx = 40, gy = 20, gw = w - 60, gh = h - 60;

    // Grid horizontal
    ctx.strokeStyle = 'rgba(34,92,24,0.15)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      const y = gy + (gh / 6) * i;
      ctx.beginPath();
      ctx.moveTo(gx, y);
      ctx.lineTo(gx + gw, y);
      ctx.stroke();
    }

    // Labels dos emojis (eixo Y)
    ctx.font = '16px Apple Color Emoji';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < 7; i++) {
      const y = gy + (gh / 6) * i;
      ctx.fillText(EMOJIS[6 - i], gx - 8, y);
    }

    // Labels dos dias (eixo X)
    ctx.fillStyle = '#225c18';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const dx = gw / 6;
    DIAS.forEach((dia, i) => {
      const x = gx + dx * i;
      ctx.fillText(dia, x, gy + gh + 6);
    });

    // Linha de dados
    if (humores.length > 0) {
      ctx.strokeStyle = '#492f70';
      ctx.fillStyle = '#492f70';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      humores.forEach((emoji, i) => {
        if (!emoji) return; // Pular dias sem dados
        
        const idx = emojiIndex(emoji);
        if (idx < 0) return;
        
        const x = gx + dx * i;
        const y = gy + gh - (idx / 6) * gh;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      
      ctx.stroke();

      // Pontos de dados
      humores.forEach((emoji, i) => {
        if (!emoji) return;
        
        const idx = emojiIndex(emoji);
        if (idx < 0) return;
        
        const x = gx + dx * i;
        const y = gy + gh - (idx / 6) * gh;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  // Gráfico de pizza
  function drawPieChart(canvas, frequencias) {
    const { w } = getCssSize(canvas);
    const ctx = fitCanvas(canvas, w);
    const h = canvas.height;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const total = frequencias.reduce((a, b) => a + b, 0) || 1;
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.32;
    
    // Cores harmoniosas para cada emoji
    const cores = ['#d8c5ff','#b8a1ff','#9cc0ff','#add8e6','#c0f0a5','#ffd6a5','#ffbde3'];

    let startAngle = -Math.PI / 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < 7; i++) {
      const frac = frequencias[i] / total;
      if (frac <= 0) continue;

      const endAngle = startAngle + frac * 2 * Math.PI;
      
      // Fatia da pizza
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = cores[i];
      ctx.fill();
      
      // Borda sutil
      ctx.strokeStyle = 'rgba(255,255,255,0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Percentual no centro da fatia
      const midAngle = (startAngle + endAngle) / 2;
      const percentX = cx + Math.cos(midAngle) * r * 0.65;
      const percentY = cy + Math.sin(midAngle) * r * 0.65;
      
      ctx.fillStyle = '#222';
      ctx.font = 'bold 10px Arial';
      ctx.fillText((frac * 100).toFixed(1) + '%', percentX, percentY);

      // Emoji externo
      const emojiX = cx + Math.cos(midAngle) * (r + 35);
      const emojiY = cy + Math.sin(midAngle) * (r + 35);
      ctx.font = '18px Apple Color Emoji';
      ctx.fillText(EMOJIS[i], emojiX, emojiY);

      startAngle = endAngle;
    }
  }

  // Processamento de dados
  function getUltimos7Dias(historico) {
    const resultado = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const chave = d.toISOString().slice(0, 10);
      resultado.push(historico[chave] || null);
    }
    return resultado;
  }

  function getTodosHumores(historico) {
    return Object.values(historico).filter(Boolean);
  }

  function mediaDosDiasSemana(historico) {
    const diasSemana = Array.from({ length: 7 }, () => []);
    
    Object.entries(historico).forEach(([data, emoji]) => {
      if (!emoji) return;
      
      const d = new Date(data);
      const diaSemana = (d.getDay() + 6) % 7; // Segunda = 0
      const emojiIdx = emojiIndex(emoji);
      
      if (emojiIdx >= 0) {
        diasSemana[diaSemana].push(emojiIdx);
      }
    });

    return diasSemana.map(grupo => {
      if (grupo.length === 0) return null;
      
      const media = grupo.reduce((a, b) => a + b, 0) / grupo.length;
      return EMOJIS[Math.round(media)];
    });
  }

  // Atualização principal
  function atualizar() {
    const modo = periodoSel.value;
    const historico = getHistorico();
    
    let humores = [];
    let frequencias = [];

    if (modo === 'semana') {
      // Últimos 7 dias
      humores = getUltimos7Dias(historico);
      frequencias = contarFrequencia(humores.filter(Boolean));
    } else {
      // Por mês - média de cada dia da semana
      const todosHumores = getTodosHumores(historico);
      frequencias = contarFrequencia(todosHumores);
      humores = mediaDosDiasSemana(historico);
    }

    drawLineChart(canvasLinha, humores);
    drawPieChart(canvasPizza, frequencias);
  }

  // Event listeners
  window.addEventListener('resize', () => {
    // Debounce resize para performance
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(atualizar, 100);
  });

  periodoSel.addEventListener('change', atualizar);

  // Inicialização
  document.addEventListener('DOMContentLoaded', () => {
    // Pequeno delay para garantir que o CSS foi aplicado
    setTimeout(atualizar, 50);
  });

})();
