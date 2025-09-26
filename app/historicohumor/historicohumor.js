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
    offset: 0, // 0 = atual, -1 = anterior, 1 = próximo
    filtroEmoji: 'todos'
  };

  // Elements
  const canvasLinha = document.getElementById('graficoLinha');
  const canvasPizza = document.getElementById('graficoPizza');
  const periodoSel = document.getElementById('periodo');
  const periodoAtual = document.getElementById('periodoAtual');
  const btnAnterior = document.getElementById('btnAnterior');
  const btnProximo = document.getElementById('btnProximo');
  const resumoStats = document.getElementById('resumoStats');
  const totalDias = document.getElementById('totalDias');
  const humorDominante = document.getElementById('humorDominante');
  const tendencia = document.getElementById('tendencia');

  // Modal elements
  const modal = document.getElementById('modal');
  const modalTitulo = document.getElementById('modalTitulo');
  const modalMensagem = document.getElementById('modalMensagem');
  const modalConfirmar = document.getElementById('modalConfirmar');
  const modalCancelar = document.getElementById('modalCancelar');

  // Navegação rodapé
  document.getElementById('btnVoltar').addEventListener('click', () => history.back());
  document.getElementById('btnLogo').addEventListener('click', () => location.href = '../minhas-receitas/index.html');
  document.getElementById('btnGeladeira').addEventListener('click', () => location.href = '../minha-geladeira/index.html');

  // MODO DEMONSTRAÇÃO - Gera dados mais realistas para 3 meses
  (function demoAutoSeed() {
    const historico = getHistorico();
    if (Object.keys(historico).length < 20) { // Se tem poucos dados, gerar mais
      const hoje = new Date();
      const demo = {};
      
      // Gerar dados para últimos 90 dias com padrões realistas
      for (let i = 0; i < 90; i++) {
        const d = new Date(hoje);
        d.setDate(d.getDate() - i);
        const data = d.toISOString().slice(0, 10);
        
        // Simular padrões mais realistas baseados no dia da semana
        const diaSemana = d.getDay();
        let emojiProb;
        
        if (diaSemana === 0 || diaSemana === 6) { // Fins de semana mais felizes
          emojiProb = [0.1, 0.05, 0.15, 0.1, 0.2, 0.3, 0.1]; // Mais felicidade
        } else if (diaSemana === 1) { // Segunda mais difícil
          emojiProb = [0.2, 0.15, 0.1, 0.2, 0.15, 0.15, 0.05]; // Mais negatividade
        } else { // Dias normais
          emojiProb = [0.1, 0.1, 0.15, 0.15, 0.2, 0.2, 0.1];
        }
        
        // Escolher emoji baseado nas probabilidades
        const rand = Math.random();
        let acum = 0;
        let emojiIdx = 0;
        for (let j = 0; j < emojiProb.length; j++) {
          acum += emojiProb[j];
          if (rand <= acum) {
            emojiIdx = j;
            break;
          }
        }
        
        demo[data] = EMOJIS[emojiIdx];
      }
      
      localStorage.setItem("got2cook_mood_history", JSON.stringify({...historico, ...demo}));
      console.log('Modo demonstração ativado - histórico expandido para', Object.keys(demo).length, 'dias');
    }
  })();

  // Funções de dados
  function getHistorico() {
    try {
      return JSON.parse(localStorage.getItem("got2cook_mood_history")) || {};
    } catch (e) {
      console.warn('Erro ao ler histórico de humor:', e);
      return {};
    }
  }

  function salvarHistorico(dados) {
    localStorage.setItem("got2cook_mood_history", JSON.stringify(dados));
  }

  function emojiIndex(emoji) {
    return EMOJIS.indexOf(emoji);
  }

  // Funções de período e navegação
  function getDatasPeriodo() {
    const hoje = new Date();
    let inicio, fim;

    if (estadoAtual.periodo === 'semana') {
      // Semana (domingo a sábado)
      const diaAtual = hoje.getDay();
      inicio = new Date(hoje);
      inicio.setDate(hoje.getDate() - diaAtual - (estadoAtual.offset * 7));
      fim = new Date(inicio);
      fim.setDate(inicio.getDate() + 6);
    } else if (estadoAtual.periodo === 'mes') {
      // Mês
      inicio = new Date(hoje.getFullYear(), hoje.getMonth() - estadoAtual.offset, 1);
      fim = new Date(hoje.getFullYear(), hoje.getMonth() - estadoAtual.offset + 1, 0);
    } else if (estadoAtual.periodo === 'trimestre') {
      // Trimestre
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
      return `${inicio.getDate()}/${inicio.getMonth()+1} - ${fim.getDate()}/${fim.getMonth()+1}`;
    } else if (estadoAtual.periodo === 'mes') {
      if (estadoAtual.offset === 0) return 'Este mês';
      if (estadoAtual.offset === -1) return 'Mês passado';
      return `${MESES[inicio.getMonth()]} ${inicio.getFullYear()}`;
    } else {
      const trimestre = Math.floor(inicio.getMonth() / 3) + 1;
      return `${trimestre}º Tri ${inicio.getFullYear()}`;
    }
  }

  function getDadosPeriodo() {
    const historico = getHistorico();
    const { inicio, fim } = getDatasPeriodo();
    const dados = [];
    const labels = [];

    if (estadoAtual.periodo === 'semana') {
      // 7 dias da semana
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
    } else if (estadoAtual.periodo === 'mes') {
      // Semanas do mês
      const semanas = [];
      let dataAtual = new Date(inicio);
      
      while (dataAtual <= fim) {
        const fimSemana = new Date(dataAtual);
        fimSemana.setDate(dataAtual.getDate() + 6);
        if (fimSemana > fim) fimSemana.setTime(fim.getTime());
        
        const humojesSemana = [];
        for (let d = new Date(dataAtual); d <= fimSemana; d.setDate(d.getDate() + 1)) {
          const chave = d.toISOString().slice(0, 10);
          const emoji = historico[chave];
          if (emoji && (estadoAtual.filtroEmoji === 'todos' || emoji === estadoAtual.filtroEmoji)) {
            humojesSemana.push(emojiIndex(emoji));
          }
        }
        
        // Média da semana
        if (humojesSemana.length > 0) {
          const media = humojesSemana.reduce((a, b) => a + b, 0) / humojesSemana.length;
          semanas.push(EMOJIS[Math.round(media)]);
        } else {
          semanas.push(null);
        }
        
        labels.push(`Sem ${Math.ceil(dataAtual.getDate() / 7)}`);
        dataAtual.setDate(dataAtual.getDate() + 7);
      }
      dados = semanas;
    } else if (estadoAtual.periodo === 'trimestre') {
      // 3 meses do trimestre
      for (let mes = 0; mes < 3; mes++) {
        const inicioMes = new Date(inicio.getFullYear(), inicio.getMonth() + mes, 1);
        const fimMes = new Date(inicio.getFullYear(), inicio.getMonth() + mes + 1, 0);
        
        const humoresMes = [];
        for (let d = new Date(inicioMes); d <= fimMes; d.setDate(d.getDate() + 1)) {
          const chave = d.toISOString().slice(0, 10);
          const emoji = historico[chave];
          if (emoji && (estadoAtual.filtroEmoji === 'todos' || emoji === estadoAtual.filtroEmoji)) {
            humoresMes.push(emojiIndex(emoji));
          }
        }
        
        if (humoresMes.length > 0) {
          const media = humoresMes.reduce((a, b) => a + b, 0) / humoresMes.length;
          dados.push(EMOJIS[Math.round(media)]);
        } else {
          dados.push(null);
        }
        
        labels.push(MESES[inicioMes.getMonth()]);
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

  // Funções de análise
  function contarFrequencia(listaEmojis) {
    const freq = Array(7).fill(0);
    listaEmojis.forEach(emoji => {
      const idx = emojiIndex(emoji);
      if (idx >= 0) freq[idx]++;
    });
    return freq;
  }

  function calcularTendencia(dados) {
    const valores = dados.filter(Boolean).map(emoji => emojiIndex(emoji)).filter(idx => idx >= 0);
    if (valores.length < 2) return '➡️'; // Neutro se poucos dados
    
    const metadeAnterior = valores.slice(0, Math.floor(valores.length / 2));
    const metadePosterior = valores.slice(-Math.floor(valores.length / 2));
    
    const mediaAnterior = metadeAnterior.reduce((a, b) => a + b, 0) / metadeAnterior.length;
    const mediaPosterior = metadePosterior.reduce((a, b) => a + b, 0) / metadePosterior.length;
    
    if (mediaPosterior > mediaAnterior + 0.5) return '↗️'; // Melhorando
    if (mediaPosterior < mediaAnterior - 0.5) return '↘️'; // Piorando
    return '➡️'; // Estável
  }

  // Funções de canvas responsivo
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

  // Gráfico de linha melhorado
  function drawLineChart(canvas, dados, labels) {
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

    // Área do gráfico
    const margin = 50;
    const gx = margin, gy = margin, gw = w - margin * 2, gh = h - margin * 2;

    // Grid e eixos
    ctx.strokeStyle = 'rgba(34,92,24,0.1)';
    ctx.lineWidth = 1;
    
    // Linhas horizontais
    for (let i = 0; i <= 6; i++) {
      const y = gy + (gh / 6) * i;
      ctx.beginPath();
      ctx.moveTo(gx, y);
      ctx.lineTo(gx + gw, y);
      ctx.stroke();
    }

    // Labels dos emojis (eixo Y)
    ctx.font = '14px Apple Color Emoji';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < 7; i++) {
      const y = gy + (gh / 6) * i;
      ctx.fillText(EMOJIS[6 - i], gx - 8, y);
    }

    // Labels do período (eixo X)
    ctx.fillStyle = '#225c18';
    ctx.font = '11px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    const dx = gw / Math.max(1, labels.length - 1);
    
    labels.forEach((label, i) => {
      const x = gx + (i * dx);
      ctx.fillText(label, x, gy + gh + 8);
    });

    // Linha de dados
    const dadosValidos = dados.map((emoji, i) => ({ emoji, index: i })).filter(d => d.emoji);
    
    if (dadosValidos.length > 0) {
      ctx.strokeStyle = '#492f70';
      ctx.lineWidth = 3;
      ctx.beginPath();
      
      dadosValidos.forEach((d, i) => {
        const emojiIdx = emojiIndex(d.emoji);
        const x = gx + (d.index * dx);
        const y = gy + gh - (emojiIdx / 6) * gh;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      
      ctx.stroke();

      // Pontos de dados
      ctx.fillStyle = '#492f70';
      dadosValidos.forEach(d => {
        const emojiIdx = emojiIndex(d.emoji);
        const x = gx + (d.index * dx);
        const y = gy + gh - (emojiIdx / 6) * gh;
        
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Emoji no ponto
        ctx.font = '12px Apple Color Emoji';
        ctx.textAlign = 'center';
        ctx.fillText(d.emoji, x, y - 12);
      });
    }
  }

  // Gráfico de pizza melhorado
  function drawPieChart(canvas, frequencias) {
    const { w, h } = getCssSize(canvas);
    const ctx = fitCanvas(canvas, w, h);
    
    ctx.clearRect(0, 0, w, h);
    
    const total = frequencias.reduce((a, b) => a + b, 0);
    if (total === 0) {
      ctx.fillStyle = '#666';
      ctx.font = '14px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Sem dados para mostrar', w/2, h/2);
      return;
    }

    const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.3;
    
    // Cores harmoniosas para cada emoji
    const cores = [
      '#ff6b6b', // 😭 - vermelho suave
      '#ff8e53', // 😡 - laranja
      '#4ecdc4', // 👏 - teal
      '#45b7d1', // 😢 - azul claro
      '#96ceb4', // 😋 - verde suave
      '#ffeaa7', // 🥰 - amarelo suave
      '#a8e6cf'  // 😀 - verde claro
    ];

    let startAngle = -Math.PI / 2;
    
    // Desenhar fatias
    for (let i = 0; i < 7; i++) {
      const freq = frequencias[i];
      if (freq === 0) continue;
      
      const frac = freq / total;
      const endAngle = startAngle + frac * 2 * Math.PI;
      
      // Fatia
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = cores[i];
      ctx.fill();
      
      // Borda
      ctx.strokeStyle = 'rgba(255,255,255,0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Percentual no centro da fatia (só se > 5%)
      if (frac > 0.05) {
        const midAngle = (startAngle + endAngle) / 2;
        const textX = cx + Math.cos(midAngle) * r * 0.7;
        const textY = cy + Math.sin(midAngle) * r * 0.7;
        
        ctx.fillStyle = '#000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(Math.round(frac * 100) + '%', textX, textY);
      }

      // Emoji e label externos
      const midAngle = (startAngle + endAngle) / 2;
      const emojiX = cx + Math.cos(midAngle) * (r + 35);
      const emojiY = cy + Math.sin(midAngle) * (r + 35);
      
      ctx.font = '20px Apple Color Emoji';
      ctx.textAlign = 'center';
      ctx.fillText(EMOJIS[i], emojiX, emojiY);

      startAngle = endAngle;
    }
    
    // Centro com total
    ctx.fillStyle = '#225c18';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(total, cx, cy - 8);
    ctx.font = '10px Arial';
    ctx.fillText('registros', cx, cy + 8);
  }

  // Atualizar resumo estatístico
  function atualizarResumo() {
    const humores = getTodosHumoresPeriodo();
    const { dados } = getDadosPeriodo();
    
    // Total de dias
    totalDias.textContent = humores.length;
    
    // Humor dominante
    const freq = contarFrequencia(humores);
    const maxIdx = freq.indexOf(Math.max(...freq));
    humorDominante.textContent = freq[maxIdx] > 0 ? EMOJIS[maxIdx] : '😐';
    
    // Tendência
    tendencia.textContent = calcularTendencia(dados);
  }

  // Modal helper
  function mostrarModal(titulo, mensagem, callback = null) {
    modalTitulo.textContent = titulo;
    modalMensagem.textContent = mensagem;
    modal.classList.add('ativo');
    modal.setAttribute('aria-hidden', 'false');
    
    const fecharModal = () => {
      modal.classList.remove('ativo');
      modal.setAttribute('aria-hidden', 'true');
      modalConfirmar.onclick = null;
    };
    
    modalConfirmar.onclick = () => {
      if (callback) callback();
      fecharModal();
    };
    
    modalCancelar.onclick = fecharModal;
    
    // Fechar ao clicar no backdrop
    modal.addEventListener('click', (e) => {
      if (e.target.dataset.close) fecharModal();
    }, { once: true });
    
    modalConfirmar.focus();
  }

  // Atualização principal
  function atualizar() {
    const { dados, labels } = getDadosPeriodo();
    const todosHumores = getTodosHumoresPeriodo();
    const frequencias = contarFrequencia(todosHumores);

    drawLineChart(canvasLinha, dados, labels);
    drawPieChart(canvasPizza, frequencias);
    atualizarResumo();
    
    // Atualizar texto do período
    periodoAtual.textContent = formatarPeriodoAtual();
    
    // Habilitar/desabilitar botões de navegação
    const hoje = new Date();
    const { fim } = getDatasPeriodo();
    btnProximo.disabled = (fim >= hoje);
  }

  // Event listeners
  periodoSel.addEventListener('change', () => {
    estadoAtual.periodo = periodoSel.value;
    estadoAtual.offset = 0; // Resetar para período atual
    atualizar();
  });

  btnAnterior.addEventListener('click', () => {
    estadoAtual.offset--;
    atualizar();
  });

  btnProximo.addEventListener('click', () => {
    if (!btnProximo.disabled) {
      estadoAtual.offset++;
      atualizar();
    }
  });

  // Filtros de emoji
  document.querySelectorAll('.filtro-emoji').forEach(btn => {
    btn.addEventListener('click', () => {
      // Remover ativo de todos
      document.querySelectorAll('.filtro-emoji').forEach(b => b.classList.remove('ativo'));
      
      // Ativar clicado
      btn.classList.add('ativo');
      estadoAtual.filtroEmoji = btn.dataset.emoji;
      
      atualizar();
    });
  });

  // Exportar dados
  document.getElementById('btnExportar').addEventListener('click', () => {
    const historico = getHistorico();
    const dataStr = JSON.stringify(historico, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `historico-humor-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  });

  // Limpar histórico
  document.getElementById('btnLimpar').addEventListener('click', () => {
    mostrarModal(
      'Limpar Histórico',
      'Tem certeza de que deseja apagar todo o histórico de humor? Esta ação não pode ser desfeita.',
      () => {
        localStorage.removeItem('got2cook_mood_history');
        atualizar();
      }
    );
  });

  // Resize handler com debounce
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(atualizar, 100);
  });

  // Inicialização
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(atualizar, 50);
  });

})();)
