// /app/historico-humor/historicohumor.js
(function(){
  'use strict';

  // Constantes dos humores e períodos
  const EMOJIS = ['😭','😡','👏','😢','😋','🥰','😀'];
  const DIAS = ['SEG','TER','QUA','QUI','SEX','SÁB','DOM'];
  const MESES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  
  // Estado da aplicação
  let estadoAtual = {
    periodo: 'semana',
    offset: 0,
    filtroEmoji: 'todos'
  };

  // Elements
  const canvasLinha = document.getElementById('graficoLinha');
  const canvasPizza = document.getElementById('graficoPizza');
  const periodoSel = document.getElementById('periodo');
  const periodoAtual = document.getElementById('periodoAtual');
  const btnAnterior = document.getElementById('btnAnterior');
  const btnProximo = document.getElementById('btnProximo');
  const totalDias = document.getElementById('totalDias');
  const humorDominante = document.getElementById('humorDominante');
  const tendencia = document.getElementById('tendencia');

  // Navegação rodapé
  if (document.getElementById('btnVoltar')) {
    document.getElementById('btnVoltar').addEventListener('click', () => history.back());
  }
  if (document.getElementById('btnLogo')) {
    document.getElementById('btnLogo').addEventListener('click', () => location.href = '../minhas-receitas/index.html');
  }
  if (document.getElementById('btnGeladeira')) {
    document.getElementById('btnGeladeira').addEventListener('click', () => location.href = '../minha-geladeira/index.html');
  }

  // Geração de dados para teste
  function gerarDadosTeste() {
    const urlParams = new URLSearchParams(window.location.search);
    const isDev = urlParams.get('dev') === 'vitoria';
    
    if (isDev) {
      console.log('🔧 Modo desenvolvedor ativado');
      
      const hoje = new Date();
      const demo = {};
      
      for (let i = 0; i < 60; i++) {
        const d = new Date(hoje);
        d.setDate(d.getDate() - i);
        const data = d.toISOString().slice(0, 10);
        
        // Padrões realistas
        const diaSemana = d.getDay();
        const semana = Math.floor(i / 7);
        let emojiIdx;
        
        if (semana < 2) {
          // Semanas recentes - melhor
          if (diaSemana === 1) emojiIdx = 3; // Segunda OK
          else if (diaSemana === 5 || diaSemana === 0 || diaSemana === 6) emojiIdx = 5; // Sexta/fim de semana feliz
          else emojiIdx = 4; // Outros dias bom
        } else if (semana < 5) {
          // Meio - variado
          if (diaSemana === 1) emojiIdx = 1; // Segunda difícil
          else if (diaSemana === 5) emojiIdx = 5; // Sexta boa
          else emojiIdx = 3; // Outros neutro
        } else {
          // Antigas - mais difícil
          if (diaSemana === 1) emojiIdx = 0; // Segunda ruim
          else if (diaSemana === 0 || diaSemana === 6) emojiIdx = 3; // Fim de semana OK
          else emojiIdx = 2; // Outros variado
        }
        
        demo[data] = EMOJIS[emojiIdx];
      }
      
      localStorage.setItem("got2cook_mood_history", JSON.stringify(demo));
      return true;
    } else {
      const historico = getHistorico();
      if (Object.keys(historico).length < 5) {
        const hoje = new Date();
        const demo = {};
        
        for (let i = 0; i < 7; i++) {
          const d = new Date(hoje);
          d.setDate(d.getDate() - (6 - i));
          const data = d.toISOString().slice(0, 10);
          demo[data] = EMOJIS[4 + Math.floor(Math.random() * 3)];
        }
        
        localStorage.setItem("got2cook_mood_history", JSON.stringify(demo));
        console.log('📱 Dados de exemplo criados');
        return true;
      }
    }
    return false;
  }

  // Funções de dados
  function getHistorico() {
    try {
      return JSON.parse(localStorage.getItem("got2cook_mood_history")) || {};
    } catch (e) {
      console.warn('Erro ao ler histórico:', e);
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

  // Funções de período
  function getDatasPeriodo() {
    const hoje = new Date();
    let inicio, fim;

    if (estadoAtual.periodo === 'semana') {
      const diaAtual = hoje.getDay();
      inicio = new Date(hoje);
      inicio.setDate(hoje.getDate() - diaAtual - (estadoAtual.offset * 7));
      fim = new Date(inicio);
      fim.setDate(inicio.getDate() + 6);
    } else if (estadoAtual.periodo === 'mes') {
      inicio = new Date(hoje.getFullYear(), hoje.getMonth() - estadoAtual.offset, 1);
      fim = new Date(hoje.getFullYear(), hoje.getMonth() - estadoAtual.offset + 1, 0);
    } else if (estadoAtual.periodo === 'trimestre') {
      const trimestreAtual = Math.floor(hoje.getMonth() / 3);
      const trimestreOffset = trimestreAtual - estadoAtual.offset;
      inicio = new Date(hoje.getFullYear(), trimestreOffset * 3, 1);
      fim = new Date(hoje.getFullYear(), (trimestreOffset + 1) * 3, 0);
    }

    return { inicio, fim };
  }

  function formatarPeriodoAtual() {
    const { inicio, fim } = getDatasPeriodo();
    
    if (estadoAtual.periodo === 'semana') {
      if (estadoAtual.offset === 0) return 'Esta semana';
      if (estadoAtual.offset === -1) return 'Semana passada';
      return inicio.getDate() + '/' + (inicio.getMonth()+1) + ' - ' + fim.getDate() + '/' + (fim.getMonth()+1);
    } else if (estadoAtual.periodo === 'mes') {
      if (estadoAtual.offset === 0) return 'Este mês';
      if (estadoAtual.offset === -1) return 'Mês passado';
      return MESES[inicio.getMonth()] + ' ' + inicio.getFullYear();
    } else {
      const trimestre = Math.floor(inicio.getMonth() / 3) + 1;
      return trimestre + 'º Tri ' + inicio.getFullYear();
    }
  }

  function getDadosPeriodo() {
    const historico = getHistorico();
    const { inicio, fim } = getDatasPeriodo();
    const dados = [];
    const labels = [];

    if (estadoAtual.periodo === 'semana') {
      for (let i = 0; i < 7; i++) {
        const data = new Date(inicio);
        data.setDate(inicio.getDate() + i);
        const chave = data.toISOString().slice(0, 10);
        const emoji = historico[chave];
        
        if (estadoAtual.filtroEmoji === 'todos' || emoji === estadoAtual.filtroEmoji) {
          dados.push(emoji || null);
        } else {
          dados.push(null);
        }
        labels.push(DIAS[i]);
      }
    } else {
      // Simplificado para outros períodos
      const dataAtual = new Date(inicio);
      while (dataAtual <= fim) {
        const chave = dataAtual.toISOString().slice(0, 10);
        const emoji = historico[chave];
        if (emoji && (estadoAtual.filtroEmoji === 'todos' || emoji === estadoAtual.filtroEmoji)) {
          dados.push(emoji);
        }
        labels.push(dataAtual.getDate().toString());
        dataAtual.setDate(dataAtual.getDate() + 1);
      }
    }

    return { dados, labels };
  }

  function getTodosHumoresPeriodo() {
    const historico = getHistorico();
    const { inicio, fim } = getDatasPeriodo();
    const humores = [];

    for (let d = new Date(inicio); d <= fim; d.setDate(d.getDate() + 1)) {
      const chave = d.toISOString().slice(0, 10);
      const emoji = historico[chave];
      if (emoji && (estadoAtual.filtroEmoji === 'todos' || emoji === estadoAtual.filtroEmoji)) {
        humores.push(emoji);
      }
    }

    return humores;
  }

  // Canvas functions
  function fitCanvas(canvas, cssWidth, cssHeight) {
    const dpr = window.devicePixelRatio || 1;
    
    canvas.width = Math.round(cssWidth * dpr);
    canvas.height = Math.round(cssHeight * dpr);
    canvas.style.width = cssWidth + 'px';
    canvas.style.height = cssHeight + 'px';
    
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  function getCssSize(canvas) {
    const rect = canvas.getBoundingClientRect();
    return { w: rect.width, h: rect.height };
  }

  // Gráficos
  function drawLineChart(canvas, dados, labels) {
    if (!canvas) return;
    
    const { w, h } = getCssSize(canvas);
    const ctx = fitCanvas(canvas, w, h);
    
    ctx.clearRect(0, 0, w, h);
    
    if (dados.length === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Sem dados para o período', w/2, h/2);
      return;
    }

    const margin = 40;
    const gx = margin, gy = margin, gw = w - margin * 2, gh = h - margin * 2;

    // Grid
    ctx.strokeStyle = 'rgba(34,92,24,0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= 6; i++) {
      const y = gy + (gh / 6) * i;
      ctx.beginPath();
      ctx.moveTo(gx, y);
      ctx.lineTo(gx + gw, y);
      ctx.stroke();
    }

    // Labels Y
    ctx.font = '14px Apple Color Emoji';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < 7; i++) {
      const y = gy + (gh / 6) * i;
      ctx.fillText(EMOJIS[6 - i], gx - 8, y);
    }

    // Labels X
    ctx.fillStyle = '#225c18';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const dx = gw / Math.max(1, labels.length - 1);
    
    labels.forEach((label, i) => {
      const x = gx + (i * dx);
      ctx.fillText(label, x, gy + gh + 8);
    });

    // Linha
    const dadosValidos = dados.map((emoji, i) => ({ emoji, index: i })).filter(d => d.emoji);
    
    if (dadosValidos.length > 0) {
      ctx.strokeStyle = '#492f70';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      dadosValidos.forEach((d, i) => {
        const emojiIdx = emojiIndex(d.emoji);
        const x = gx + (d.index * dx);
        const y = gy + gh - (emojiIdx / 6) * gh;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      
      ctx.stroke();

      // Pontos
      ctx.fillStyle = '#492f70';
      dadosValidos.forEach(d => {
        const emojiIdx = emojiIndex(d.emoji);
        const x = gx + (d.index * dx);
        const y = gy + gh - (emojiIdx / 6) * gh;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  function drawPieChart(canvas, frequencias) {
    if (!canvas) return;
    
    const { w, h } = getCssSize(canvas);
    const ctx = fitCanvas(canvas, w, h);
    
    ctx.clearRect(0, 0, w, h);
    
    const total = frequencias.reduce((a, b) => a + b, 0);
    if (total === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Sem dados', w/2, h/2);
      return;
    }

    const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.3;
    const cores = ['#ff6b6b', '#ff8e53', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#a8e6cf'];

    let startAngle = -Math.PI / 2;
    
    for (let i = 0; i < 7; i++) {
      const freq = frequencias[i];
      if (freq === 0) continue;
      
      const frac = freq / total;
      const endAngle = startAngle + frac * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = cores[i];
      ctx.fill();
      
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      if (frac > 0.05) {
        const midAngle = (startAngle + endAngle) / 2;
        const textX = cx + Math.cos(midAngle) * r * 0.7;
        const textY = cy + Math.sin(midAngle) * r * 0.7;
        
        ctx.fillStyle = '#000';
        ctx.font = 'bold 10px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(frac * 100) + '%', textX, textY);
      }

      const midAngle = (startAngle + endAngle) / 2;
      const emojiX = cx + Math.cos(midAngle) * (r + 30);
      const emojiY = cy + Math.sin(midAngle) * (r + 30);
      
      ctx.font = '18px Apple Color Emoji';
      ctx.textAlign = 'center';
      ctx.fillText(EMOJIS[i], emojiX, emojiY);

      startAngle = endAngle;
    }
  }

  // Atualizar resumo
  function atualizarResumo() {
    const humores = getTodosHumoresPeriodo();
    
    if (totalDias) totalDias.textContent = humores.length;
    
    const freq = contarFrequencia(humores);
    const maxIdx = freq.indexOf(Math.max(...freq));
    if (humorDominante) humorDominante.textContent = freq[maxIdx] > 0 ? EMOJIS[maxIdx] : '😐';
    
    if (tendencia) tendencia.textContent = '➡️';
  }

  // Atualização principal
  function atualizar() {
    const { dados, labels } = getDadosPeriodo();
    const todosHumores = getTodosHumoresPeriodo();
    const frequencias = contarFrequencia(todosHumores);

    drawLineChart(canvasLinha, dados, labels);
    drawPieChart(canvasPizza, frequencias);
    atualizarResumo();
    
    if (periodoAtual) periodoAtual.textContent = formatarPeriodoAtual();
    
    const hoje = new Date();
    const { fim } = getDatasPeriodo();
    if (btnProximo) btnProximo.disabled = (fim >= hoje);
  }

  // Event listeners
  if (periodoSel) {
    periodoSel.addEventListener('change', () => {
      estadoAtual.periodo = periodoSel.value;
      estadoAtual.offset = 0;
      atualizar();
    });
  }

  if (btnAnterior) {
    btnAnterior.addEventListener('click', () => {
      estadoAtual.offset--;
      atualizar();
    });
  }

  if (btnProximo) {
    btnProximo.addEventListener('click', () => {
      if (!btnProximo.disabled) {
        estadoAtual.offset++;
        atualizar();
      }
    });
  }

  // Filtros
  document.querySelectorAll('.filtro-emoji').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filtro-emoji').forEach(b => b.classList.remove('ativo'));
      btn.classList.add('ativo');
      estadoAtual.filtroEmoji = btn.dataset.emoji;
      atualizar();
    });
  });

  // Exportar
  if (document.getElementById('btnExportar')) {
    document.getElementById('btnExportar').addEventListener('click', () => {
      const historico = getHistorico();
      const dataStr = JSON.stringify(historico, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'historico-humor-' + new Date().toISOString().slice(0, 10) + '.json';
      a.click();
      
      URL.revokeObjectURL(url);
    });
  }

  // Resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(atualizar, 100);
  });

  // Inicialização
  document.addEventListener('DOMContentLoaded', () => {
    gerarDadosTeste();
    setTimeout(atualizar, 100);
  });

  // Expor função globalmente para debug
  window.atualizar = atualizar;
  window.getHistorico = getHistorico;

})();
