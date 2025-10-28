// /app/jornada/jornada.js

document.addEventListener('DOMContentLoaded', () => {
  const $ = (id) => document.getElementById(id);

  /* ========= NAVEGAÇÃO DO RODAPÉ ========= */
  const nav = {
    btnVoltar: () => { window.location.href = '../humor/index.html'; },
    btnLogo: () => { window.location.href = '../home/index.html'; },
    btnGeladeira: () => { window.location.href = '../geladeira/index.html'; }
  };

  Object.keys(nav).forEach(id => {
    const el = $(id);
    if (!el) return;
    el.addEventListener('click', nav[id]);
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        nav[id]();
      }
    });
  });

  /* ========= DADOS DOS GRÁFICOS (DINÂMICOS) ========= */
  function calcularEstatisticas() {
    // Pegar receitas salvas do localStorage
    const receitasSalvas = JSON.parse(localStorage.getItem('got2cook_saved_recipes') || '[]');
    
    // Inicializar contadores
    const estilos = {
      'Massas': 0,
      'Doces': 0,
      'Carnes': 0,
      'Saladas': 0,
      'Petiscos': 0
    };
    
    const momentos = {
      'Manhã': 0,
      'Meio-Dia': 0,
      'Tarde': 0,
      'Noite': 0,
      'Madrugada': 0
    };

    // Se não houver receitas, usar dados de exemplo
    if (receitasSalvas.length === 0) {
      return {
        estilos: {
          labels: Object.keys(estilos),
          data: [35, 25, 20, 15, 5],
          colors: ['#705a89', '#b47cc5', '#c5b4e3', '#d3e3d3', '#f2f2f2']
        },
        momentos: {
          labels: Object.keys(momentos),
          data: [30, 25, 20, 15, 10],
          colors: ['#8a9ebf', '#a97dac', '#c9b9d3', '#e0dff2', '#f2f2f2']
        }
      };
    }

    // Contar estilos e momentos baseado nas receitas
    receitasSalvas.forEach(receita => {
      // Categorizar por tipo/estilo
      if (receita.titulo) {
        const titulo = receita.titulo.toLowerCase();
        if (titulo.includes('massa') || titulo.includes('macarrão') || titulo.includes('espaguete') || titulo.includes('lasanha')) {
          estilos['Massas']++;
        } else if (titulo.includes('doce') || titulo.includes('bolo') || titulo.includes('sobremesa') || titulo.includes('torta')) {
          estilos['Doces']++;
        } else if (titulo.includes('carne') || titulo.includes('frango') || titulo.includes('peixe') || titulo.includes('bife')) {
          estilos['Carnes']++;
        } else if (titulo.includes('salada') || titulo.includes('vegetal') || titulo.includes('verdura')) {
          estilos['Saladas']++;
        } else {
          estilos['Petiscos']++;
        }
      }

      // Categorizar por momento (se tiver timestamp)
      if (receita.criadoEm) {
        const hora = new Date(receita.criadoEm).getHours();
        if (hora >= 5 && hora < 12) {
          momentos['Manhã']++;
        } else if (hora >= 12 && hora < 14) {
          momentos['Meio-Dia']++;
        } else if (hora >= 14 && hora < 18) {
          momentos['Tarde']++;
        } else if (hora >= 18 && hora < 24) {
          momentos['Noite']++;
        } else {
          momentos['Madrugada']++;
        }
      }
    });

    // Converter para porcentagens
    const totalEstilos = Object.values(estilos).reduce((a, b) => a + b, 0) || 1;
    const totalMomentos = Object.values(momentos).reduce((a, b) => a + b, 0) || 1;

    const estilosData = Object.values(estilos).map(v => Math.round((v / totalEstilos) * 100));
    const momentosData = Object.values(momentos).map(v => Math.round((v / totalMomentos) * 100));

    return {
      estilos: {
        labels: Object.keys(estilos),
        data: estilosData,
        colors: ['#705a89', '#b47cc5', '#c5b4e3', '#d3e3d3', '#f2f2f2']
      },
      momentos: {
        labels: Object.keys(momentos),
        data: momentosData,
        colors: ['#8a9ebf', '#a97dac', '#c9b9d3', '#e0dff2', '#f2f2f2']
      }
    };
  }

  const stats = calcularEstatisticas();

  /* ========= MONTAGEM DOS GRÁFICOS ========= */
  function montaChart(canvasId, legendaId, cfg) {
    const canvas = $(canvasId);
    const ul = $(legendaId);
    if (!canvas || !ul || !window.Chart) return;

    const ctx = canvas.getContext('2d');
    
    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: cfg.labels,
        datasets: [{
          data: cfg.data,
          backgroundColor: cfg.colors,
          borderWidth: 3,
          borderColor: '#fff',
          hoverOffset: 15,
          hoverBorderWidth: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(73, 47, 112, 0.95)',
            titleColor: '#fff',
            bodyColor: '#fff',
            padding: 12,
            cornerRadius: 8,
            displayColors: true,
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.parsed}%`
            }
          }
        },
        animation: {
          animateRotate: true,
          animateScale: true,
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    });

    // Montar legenda
    ul.innerHTML = cfg.labels.map((label, i) => `
      <li tabindex="0" aria-label="${label}: ${cfg.data[i]}%">
        <span class="swatch" style="background:${cfg.colors[i]}"></span>
        <span>${label}</span>
        <span class="percentual">${cfg.data[i]}%</span>
      </li>
    `).join('');
  }

  montaChart('graficoEstilos', 'legendaEstilos', stats.estilos);
  montaChart('graficoMomentos', 'legendaMomentos', stats.momentos);

  /* ========= SISTEMA DE CONQUISTAS ========= */
  const MEDALHAS = [
    {
      id: 'medalha1',
      titulo: 'PRIMEIRA MORDIDA',
      metric: 'criadas',
      req: [1, 5, 15],
      descricao: 'Crie suas primeiras receitas e comece sua jornada culinária!'
    },
    {
      id: 'medalha2',
      titulo: 'REPETECO',
      metric: 'repeticoes',
      req: [2, 7, 15],
      descricao: 'Repita receitas que você ama!'
    },
    {
      id: 'medalha3',
      titulo: 'RECEITA RELÂMPAGO',
      metric: 'rapidas',
      req: [3, 9, 17],
      descricao: 'Crie receitas rápidas em menos de 10 minutos'
    },
    {
      id: 'medalha4',
      titulo: 'CHEF DO IMPROVISO',
      metric: 'improviso',
      req: [5, 10, 20],
      descricao: 'Cozinhe com poucos ingredientes e muita criatividade'
    },
    {
      id: 'medalha5',
      titulo: 'COLECIONADOR',
      metric: 'salvas',
      req: [5, 15, 30],
      descricao: 'Salve suas receitas favoritas para ter sempre à mão'
    },
    {
      id: 'medalha6',
      titulo: 'INTERNACIONAL',
      metric: 'cozinhas',
      req: [5, 10, 20],
      descricao: 'Explore sabores de diferentes países e culturas'
    },
    {
      id: 'medalha7',
      titulo: 'SAUDÁVEL',
      metric: 'saudaveis',
      req: [2, 5, 12],
      descricao: 'Crie receitas nutritivas e balanceadas'
    },
    {
      id: 'medalha8',
      titulo: 'AGENTE NOTURNO',
      metric: 'noturnas',
      req: [1, 5, 12],
      descricao: 'Cozinhe nas horas mais silenciosas da noite'
    },
    {
      id: 'medalha9',
      titulo: 'COZINHEIRO MESTRE',
      metric: 'total',
      req: [100, 500, 1000],
      descricao: 'Alcance a maestria culinária com centenas de receitas!'
    }
  ];

  // Estado inicial das métricas
  const state = {
    metrics: {
      total: Number(localStorage.getItem('got2cook_total_receitas') || 0),
      criadas: Number(localStorage.getItem('got2cook_receitas_criadas') || 0),
      repeticoes: Number(localStorage.getItem('got2cook_repeticoes') || 0),
      rapidas: Number(localStorage.getItem('got2cook_rapidas') || 0),
      improviso: Number(localStorage.getItem('got2cook_improviso') || 0),
      salvas: Number(localStorage.getItem('got2cook_salvas') || 0),
      cozinhas: Number(localStorage.getItem('got2cook_cozinhas') || 0),
      saudaveis: Number(localStorage.getItem('got2cook_saudaveis') || 0),
      noturnas: Number(localStorage.getItem('got2cook_noturnas') || 0)
    },
    niveis: {}
  };

  // Sincronizar com receitas salvas
  const receitasSalvas = JSON.parse(localStorage.getItem('got2cook_saved_recipes') || '[]');
  if (state.metrics.salvas === 0 && receitasSalvas.length > 0) {
    state.metrics.salvas = receitasSalvas.length;
    localStorage.setItem('got2cook_salvas', receitasSalvas.length);
  }

  if (state.metrics.criadas === 0 && state.metrics.total > 0) {
    state.metrics.criadas = state.metrics.total;
    localStorage.setItem('got2cook_receitas_criadas', state.metrics.total);
  }

  MEDALHAS.forEach(m => {
    state.niveis[m.id] = 0;
  });

  const grid = $('conquistasContainer');

  /* ========= FUNÇÕES DE RENDERIZAÇÃO ========= */
  function estrelasMarkup(nivel) {
    return Array.from({ length: 3 }, (_, i) => 
      `<span style="color:${i < nivel ? '#f8c100' : '#ddd'};text-shadow:${i < nivel ? '0 2px 4px rgba(248,193,0,0.3)' : 'none'}">★</span>`
    ).join('');
  }

  function calcularProgresso(valor, req, nivel) {
    if (nivel >= 3) return 100;
    const target = req[nivel];
    return Math.min(100, Math.round((valor / target) * 100));
  }

  function tooltipMarkup(m, nivel, valor) {
    if (nivel >= 3) {
      return `<span class="tooltip" role="tooltip" aria-label="Conquista completa">
        <span class="desc">✨ Conquista Completa!</span>
        <span class="next">Parabéns! Você dominou esta conquista!</span>
      </span>`;
    }

    const target = m.req[nivel];
    const faltam = Math.max(0, target - valor);
    const estrelaAtual = nivel + 1;

    return `<span class="tooltip" role="tooltip" aria-label="${m.descricao}">
      <span class="desc">${m.descricao}</span>
      <span class="next">${estrelaAtual}ª Estrela: <strong>${target}</strong> ${m.metric === 'total' ? 'receitas' : 'vezes'}</span>
      <span class="progress">Progresso: ${valor}/${target} • Faltam ${faltam}</span>
    </span>`;
  }

  function renderMedalha(m) {
    const nivel = state.niveis[m.id] || 0;
    const valor = state.metrics[m.metric] || 0;
    const progresso = calcularProgresso(valor, m.req, nivel);
    const completa = nivel >= 3;

    const div = document.createElement('div');
    div.className = `medalha ${completa ? 'completa' : ''}`;
    div.id = `c_${m.id}`;

    const imgPath = `../../assets/${m.id}.png`;

    div.innerHTML = `
      <div class="estrelas">${estrelasMarkup(nivel)}</div>
      <img src="${imgPath}" alt="${m.titulo}" onerror="this.style.opacity='0.3'">
      <p class="medalha-titulo">${m.titulo}</p>
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" style="width:${progresso}%"></div>
        </div>
        <p class="progress-text">${valor}/${m.req[nivel] || m.req[2]}</p>
      </div>
      ${tooltipMarkup(m, nivel, valor)}
    `;

    return div;
  }

  function renderTodas() {
    if (!grid) return;
    grid.innerHTML = '';
    MEDALHAS.forEach(m => {
      const medalhaEl = renderMedalha(m);
      grid.appendChild(medalhaEl);
      // Animar entrada
      setTimeout(() => {
        medalhaEl.style.animation = 'fadeIn 0.5s ease-out backwards';
      }, MEDALHAS.indexOf(m) * 50);
    });
  }

  /* ========= CÁLCULO DE NÍVEIS ========= */
  function calcNivel(valor, thresholds) {
    if (valor >= thresholds[2]) return 3;
    if (valor >= thresholds[1]) return 2;
    if (valor >= thresholds[0]) return 1;
    return 0;
  }

  function recomputeLevels() {
    MEDALHAS.forEach(m => {
      const valor = state.metrics[m.metric] || 0;
      const novoNivel = calcNivel(valor, m.req);
      
      if (novoNivel !== state.niveis[m.id]) {
        state.niveis[m.id] = novoNivel;
      }

      const el = document.getElementById(`c_${m.id}`);
      if (el) {
        const progresso = calcularProgresso(valor, m.req, state.niveis[m.id]);
        const completa = state.niveis[m.id] >= 3;
        
        el.className = `medalha ${completa ? 'completa' : ''}`;
        el.querySelector('.estrelas').innerHTML = estrelasMarkup(state.niveis[m.id]);
        
        const progressFill = el.querySelector('.progress-fill');
        if (progressFill) {
          progressFill.style.width = `${progresso}%`;
        }
        
        const progressText = el.querySelector('.progress-text');
        if (progressText) {
          const target = m.req[state.niveis[m.id]] || m.req[2];
          progressText.textContent = `${valor}/${target}`;
        }
        
        const tooltipEl = el.querySelector('.tooltip');
        if (tooltipEl) {
          tooltipEl.outerHTML = tooltipMarkup(m, state.niveis[m.id], valor);
        }
      }
    });
  }

  /* ========= API GLOBAL ========= */
  function setMetrics(partial) {
    Object.keys(partial).forEach(key => {
      if (key in state.metrics) {
        state.metrics[key] = Number(partial[key]);
        const storageKey = key === 'total' ? 'got2cook_total_receitas' : `got2cook_${key}`;
        localStorage.setItem(storageKey, state.metrics[key]);
      }
    });

    if (partial.total != null && state.metrics.criadas === 0 && state.metrics.total > 0) {
      state.metrics.criadas = state.metrics.total;
      localStorage.setItem('got2cook_receitas_criadas', state.metrics.total);
    }

    recomputeLevels();
    atualizarContador();
  }

  function inc(metric, delta = 1) {
    if (!(metric in state.metrics)) return;
    
    state.metrics[metric] = Number(state.metrics[metric] || 0) + delta;
    const storageKey = metric === 'total' ? 'got2cook_total_receitas' : `got2cook_${metric}`;
    localStorage.setItem(storageKey, state.metrics[metric]);
    
    recomputeLevels();
    atualizarContador();
  }

  function setNivel(id, nivel) {
    const m = MEDALHAS.find(x => x.id === id);
    if (!m) return;

    state.niveis[id] = Math.max(0, Math.min(3, Number(nivel) || 0));
    
    const el = document.getElementById(`c_${id}`);
    if (el) {
      const valor = state.metrics[m.metric] || 0;
      const progresso = calcularProgresso(valor, m.req, state.niveis[id]);
      const completa = state.niveis[id] >= 3;
      
      el.className = `medalha ${completa ? 'completa' : ''}`;
      el.querySelector('.estrelas').innerHTML = estrelasMarkup(state.niveis[id]);
      
      const progressFill = el.querySelector('.progress-fill');
      if (progressFill) {
        progressFill.style.width = `${progresso}%`;
      }
      
      const tooltipEl = el.querySelector('.tooltip');
      if (tooltipEl) {
        tooltipEl.outerHTML = tooltipMarkup(m, state.niveis[id], valor);
      }
    }
  }

  function atualizarContador() {
    const contador = $('contador');
    if (contador) {
      contador.textContent = state.metrics.total || 0;
    }
  }

  // Expor API global
  window.G2C = Object.assign(window.G2C || {}, {
    setMetrics,
    inc,
    setNivel,
    atualizarGraficos: () => {
      const novasStats = calcularEstatisticas();
      // Recriar gráficos com novos dados
      Chart.getChart('graficoEstilos')?.destroy();
      Chart.getChart('graficoMomentos')?.destroy();
      montaChart('graficoEstilos', 'legendaEstilos', novasStats.estilos);
      montaChart('graficoMomentos', 'legendaMomentos', novasStats.momentos);
    },
    _state: state
  });

  /* ========= INICIALIZAÇÃO ========= */
  renderTodas();
  recomputeLevels();
  atualizarContador();

  console.log('🎮 Got2Cook - Sistema de Jornada Iniciado');
  console.log('📊 Métricas:', state.metrics);
  console.log('⭐ Níveis:', state.niveis);
});
