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

  /* ========= CONFIGURAÇÃO DOS GRÁFICOS ========= */
  const estilosCfg = {
    labels: ['Massas', 'Doces', 'Carnes', 'Saladas', 'Petiscos'],
    data: [44.4, 27.8, 16.7, 9.1, 3.0],
    colors: ['#705a89', '#b47cc5', '#c5b4e3', '#d3e3d3', '#f2f2f2']
  };

  const momentosCfg = {
    labels: ['Manhã', 'Meio-Dia', 'Noite', 'Madrugada', 'Tarde'],
    data: [38.9, 27.8, 22.2, 9.1, 3.0],
    colors: ['#8a9ebf', '#a97dac', '#c9b9d3', '#e0dff2', '#f2f2f2']
  };

  function montaChart(canvasId, legendaId, cfg) {
    const canvas = $(canvasId);
    const ul = $(legendaId);
    if (!canvas || !ul || !window.Chart) return;

    new Chart(canvas, {
      type: 'pie',
      data: {
        labels: cfg.labels,
        datasets: [{
          data: cfg.data,
          backgroundColor: cfg.colors,
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${ctx.parsed}%`
            }
          }
        }
      }
    });

    ul.innerHTML = cfg.labels.map((label, i) => `
      <li tabindex="0" aria-label="${label}: ${cfg.data[i]}%">
        <span class="swatch" style="background:${cfg.colors[i]}"></span>
        <span>${label}</span>
      </li>
    `).join('');
  }

  montaChart('graficoEstilos', 'legendaEstilos', estilosCfg);
  montaChart('graficoMomentos', 'legendaMomentos', momentosCfg);

  /* ========= SISTEMA DE CONQUISTAS ========= */
  const MEDALHAS = [
    {
      id: 'medalha1',
      titulo: 'PRIMEIRA MORDIDA',
      metric: 'criadas',
      req: [1, 5, 15],
      descricao: 'Crie suas primeiras receitas!'
    },
    {
      id: 'medalha2',
      titulo: 'REPETECO',
      metric: 'repeticoes',
      req: [2, 7, 15],
      descricao: 'Repita a mesma receita'
    },
    {
      id: 'medalha3',
      titulo: 'RECEITA RELÂMPAGO',
      metric: 'rapidas',
      req: [3, 9, 17],
      descricao: 'Crie receitas em menos de 10 minutos'
    },
    {
      id: 'medalha4',
      titulo: 'CHEF DO IMPROVISO',
      metric: 'improviso',
      req: [5, 10, 20],
      descricao: 'Cozinhe com apenas 3 ingredientes'
    },
    {
      id: 'medalha5',
      titulo: 'COLECIONADOR',
      metric: 'salvas',
      req: [5, 15, 30],
      descricao: 'Salve suas receitas favoritas'
    },
    {
      id: 'medalha6',
      titulo: 'INTERNACIONAL',
      metric: 'cozinhas',
      req: [5, 10, 20],
      descricao: 'Explore pratos de países diferentes'
    },
    {
      id: 'medalha7',
      titulo: 'SAUDÁVEL',
      metric: 'saudaveis',
      req: [2, 5, 12],
      descricao: 'Crie receitas saudáveis'
    },
    {
      id: 'medalha8',
      titulo: 'AGENTE NOTURNO',
      metric: 'noturnas',
      req: [1, 5, 12],
      descricao: 'Cozinhe entre meia-noite e 5h'
    },
    {
      id: 'medalha9',
      titulo: 'COZINHEIRO MESTRE',
      metric: 'total',
      req: [100, 500, 1000],
      descricao: 'Cozinhe!'
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

  // Sincronizar criadas com total se necessário
  if (state.metrics.criadas === 0 && state.metrics.total > 0) {
    state.metrics.criadas = state.metrics.total;
    localStorage.setItem('got2cook_receitas_criadas', state.metrics.total);
  }

  // Inicializar níveis
  MEDALHAS.forEach(m => {
    state.niveis[m.id] = 0;
  });

  const grid = $('conquistasContainer');

  /* ========= FUNÇÕES DE RENDERIZAÇÃO ========= */
  function estrelasMarkup(nivel) {
    return Array.from({ length: 3 }, (_, i) => 
      `<span style="color:${i < nivel ? '#f8c100' : '#ccc'}">★</span>`
    ).join('');
  }

  function tooltipMarkup(m, nivel, valor) {
    if (nivel >= 3) {
      return `<span class="tooltip" role="tooltip" aria-label="Conquista completa">
        <span class="desc">✨ Conquista completa!</span>
        <span class="next">Parabéns, você alcançou todas as estrelas!</span>
      </span>`;
    }

    const target = m.req[nivel];
    const faltam = Math.max(0, target - valor);

    return `<span class="tooltip" role="tooltip" aria-label="${m.descricao}">
      <span class="desc">${m.descricao}</span>
      <span class="next">Próxima estrela: <strong>${target}</strong></span>
      <span class="progress">${valor}/${target} (faltam ${faltam})</span>
    </span>`;
  }

  function renderMedalha(m) {
    const nivel = state.niveis[m.id] || 0;
    const valor = state.metrics[m.metric] || 0;
    const div = document.createElement('div');
    div.className = 'medalha';
    div.id = `c_${m.id}`;

    const imgPath = `../../assets/${m.id}.png`;

    div.innerHTML = `
      <div class="estrelas">${estrelasMarkup(nivel)}</div>
      <img src="${imgPath}" alt="${m.titulo}" onerror="this.style.display='none'">
      <p>${m.titulo}</p>
      ${tooltipMarkup(m, nivel, valor)}
    `;

    return div;
  }

  function renderTodas() {
    if (!grid) return;
    grid.innerHTML = '';
    MEDALHAS.forEach(m => grid.appendChild(renderMedalha(m)));
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
        el.querySelector('.estrelas').innerHTML = estrelasMarkup(state.niveis[m.id]);
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
        localStorage.setItem(`got2cook_${key === 'total' ? 'total_receitas' : key}`, state.metrics[key]);
      }
    });

    // Sincronizar criadas com total
    if (partial.total != null && state.metrics.criadas === 0 && state.metrics.total > 0) {
      state.metrics.criadas = state.metrics.total;
      localStorage.setItem('got2cook_receitas_criadas', state.metrics.total);
    }

    recomputeLevels();
  }

  function inc(metric, delta = 1) {
    if (!(metric in state.metrics)) return;
    
    state.metrics[metric] = Number(state.metrics[metric] || 0) + delta;
    localStorage.setItem(`got2cook_${metric === 'total' ? 'total_receitas' : metric}`, state.metrics[metric]);
    
    recomputeLevels();
    
    const contador = $('contador');
    if (contador && metric === 'total') {
      contador.textContent = state.metrics.total;
    }
  }

  function setNivel(id, nivel) {
    const m = MEDALHAS.find(x => x.id === id);
    if (!m) return;

    state.niveis[id] = Math.max(0, Math.min(3, Number(nivel) || 0));
    
    const el = document.getElementById(`c_${id}`);
    if (el) {
      el.querySelector('.estrelas').innerHTML = estrelasMarkup(state.niveis[id]);
      const valor = state.metrics[m.metric] || 0;
      const tooltipEl = el.querySelector('.tooltip');
      if (tooltipEl) {
        tooltipEl.outerHTML = tooltipMarkup(m, state.niveis[id], valor);
      }
    }
  }

  // Expor API global
  window.G2C = Object.assign(window.G2C || {}, {
    setMetrics,
    inc,
    setNivel,
    _state: state
  });

  /* ========= INICIALIZAÇÃO ========= */
  renderTodas();
  recomputeLevels();

  const contador = $('contador');
  if (contador) {
    contador.textContent = state.metrics.total || 0;
  }

  // Log para debug (remover em produção)
  console.log('🏆 Sistema de conquistas inicializado');
  console.log('📊 Métricas atuais:', state.metrics);
  console.log('⭐ Níveis atuais:', state.niveis);
});
