document.addEventListener('DOMContentLoaded', () => {
  /* ========= Navegação do rodapé ========= */
  const $ = (id) => document.getElementById(id);
  $('btnVoltar')?.addEventListener('click', () => { window.location.href = '../home/index.html'; });
  $('btnLogo')?.addEventListener('click',  () => { window.location.href = '../minhas-receitas/index.html'; });
@@ -7,84 +8,160 @@ document.addEventListener('DOMContentLoaded', () => {
    const el=$(id); el?.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); el.click(); }});
  });

  /* ========= Gráficos ========= */
  const estilosCfg = {
    labels:['Massas','Doces','Carnes','Saladas','Petiscos'],
    data:[44.4,27.8,16.7,9.1,3.0],
    colors:['#705a89','#b47cc5','#c5b4e3','#d3e3d3','#f2f2f2']
  };
  const momentosCfg = {
    labels:['Manhã','Meio-Dia','Noite','Madrugada','Tarde'],
    data:[38.9,27.8,22.2,9.1,3.0],
    colors:['#8a9ebf','#a97dac','#c9b9d3','#e0dff2','#f2f2f2']
  };
  function montaChart(canvasId, legendaId, cfg){
    const canvas = $(canvasId), ul = $(legendaId);
    if(!canvas || !ul || !window.Chart) return;
    new Chart(canvas,{
      type:'pie',
      data:{ labels:cfg.labels, datasets:[{ data:cfg.data, backgroundColor:cfg.colors }]},
      options:{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false } } }
    });
    ul.innerHTML = cfg.labels.map((label,i)=>`
      <li tabindex="0" aria-label="${label}: ${cfg.data[i]}%">
        <span class="swatch" style="background:${cfg.colors[i]}"></span>
        <span>${label}</span>
      </li>
    `).join('');
  }
  montaChart('graficoEstilos','legendaEstilos',estilosCfg);
  montaChart('graficoMomentos','legendaMomentos',momentosCfg);

  /* ========= Conquistas automáticas + tooltip ========= */
  const MEDALHAS = [
    { id:'medalha1',  titulo:'PRIMEIRA MORDIDA',  metric:'criadas',       req:[1,5,15],     descricao:'Crie suas primeiras receitas!' },
    { id:'medalha2',  titulo:'REPETECO',          metric:'repeticoes',    req:[2,7,15],    descricao:'Repita a mesma receita' },
    { id:'medalha3',  titulo:'RECEITA RELÂMPAGO', metric:'rapidas',       req:[3,9,17],     descricao:'Crie receitas em menos de 10 minutos' },
    { id:'medalha4',  titulo:'CHEF DO IMPROVISO', metric:'improviso',     req:[5,10,20],    descricao:'Cozinhe com apenas 3 ingredientes' },
    { id:'medalha5',  titulo:'COLECIONADOR',      metric:'salvas',        req:[5,15,30],   descricao:'Salve suas receitas favoritas' },
    { id:'medalha6',  titulo:'INTERNACIONAL',     metric:'cozinhas',      req:[5,10,20],     descricao:'Explore pratos de países diferentes' },
    { id:'medalha7',  titulo:'SAUDÁVEL',          metric:'saudaveis',     req:[2,5,12],    descricao:'Crie receitas saudáveis' },
    { id:'medalha8',  titulo:'AGENTE NOTURNO',    metric:'noturnas',      req:[1,5,12],    descricao:'Cozinhe entre meia-noite e 5h' },
    { id:'medalha9',  titulo:'COZINHEIRO MESTRE', metric:'total',         req:[100,500,1000],  descricao:'Cozinhe!' }
  ];

  const state = {
    metrics: {
      total: Number(localStorage.getItem('totalReceitas') || 0),
      criadas: 0, repeticoes: 0, rapidas: 0, improviso: 0,
      salvas: 0, cozinhas: 0, saudaveis: 0, noturnas: 0
    },
    niveis: Object.fromEntries(MEDALHAS.map(m => [m.id, 0]))
  };
  if (state.metrics.criadas === 0 && state.metrics.total > 0) {
    state.metrics.criadas = state.metrics.total;
  }

  const grid = $('conquistasContainer');

  function estrelasMarkup(nivel){
    return Array.from({length:3},(_,i)=>`<span style="color:${i<nivel?'#f8c100':'#999'}">★</span>`).join('');
  }

  // Tooltip: descrição + próxima meta + progresso (x/target e faltam N)
  function tooltipMarkup(m, nivel, valor){
    if (nivel >= 3) {
      return `<span class="tooltip" role="tooltip" aria-label="Conquista completa">
        <span class="desc">Tudo completo por aqui ✨</span>
      </span>`;
    }
    const idx = Math.max(0, Math.min(2, nivel));
    const target = m.req[idx];
    const faltam = Math.max(0, target - (valor||0));
    return `<span class="tooltip" role="tooltip" aria-label="${m.descricao}. Próxima: ${target}">
      <span class="desc">${m.descricao}</span>
      <span class="next">Próxima estrela: <strong>${target}</strong></span>
      <span class="progress">${valor||0}/${target} (faltam ${faltam})</span>
    </span>`;
  }

  function renderMedalha(m){
    const nivel = state.niveis[m.id] || 0;
    const valor = Number(state.metrics[m.metric] || 0);
    const div = document.createElement('div');
    div.className = 'medalha';
    div.id = `c_${m.id}`;

    const primary = `../assets/${m.id}.png`;
    const fallback = `/assets/${m.id}.png`;

    div.innerHTML = `
      <div class="estrelas">${estrelasMarkup(nivel)}</div>
      <img src="${primary}" alt="${m.titulo}" onerror="this.onerror=null;this.src='${fallback}'">
      <p>${m.titulo}</p>
      ${tooltipMarkup(m, nivel, valor)}
    `;
    return div;
  }

  function renderTodas(){
    if (!grid) return;
    grid.innerHTML = '';
    MEDALHAS.forEach(m => grid.appendChild(renderMedalha(m)));
  }

  function calcNivel(valor, thresholds){
    let n = 0;
    if (valor >= thresholds[0]) n = 1;
    if (valor >= thresholds[1]) n = 2;
    if (valor >= thresholds[2]) n = 3;
    return n;
  }

  function recomputeLevels(){
    MEDALHAS.forEach(m => {
      const valor = Number(state.metrics[m.metric] || 0);
      const novo = calcNivel(valor, m.req);
      if (novo !== state.niveis[m.id]) {
        state.niveis[m.id] = novo;
      }
      const el = document.getElementById(`c_${m.id}`);
      if (el) {
        el.querySelector('.estrelas').innerHTML = estrelasMarkup(state.niveis[m.id]);
        const tip = el.querySelector('.tooltip');
        if (tip) tip.outerHTML = tooltipMarkup(m, state.niveis[m.id], valor);
      }
    });
  }

  // API para sua app
  function setMetrics(partial){
    Object.assign(state.metrics, partial || {});
    if (partial.total != null && state.metrics.criadas === 0 && state.metrics.total > 0) {
      state.metrics.criadas = state.metrics.total;
    }
    recomputeLevels();
  }
  function inc(metric, delta=1){
    state.metrics[metric] = Number(state.metrics[metric] || 0) + delta;
    recomputeLevels();
  }
  function setNivel(id, nivel){
    const m = MEDALHAS.find(x=>x.id===id); if (!m) return;
    state.niveis[id] = Math.max(0, Math.min(3, Number(nivel)||0));
    const el = document.getElementById(`c_${id}`);
    if (el) {
      el.querySelector('.estrelas').innerHTML = estrelasMarkup(state.niveis[id]);
      const valor = Number(state.metrics[m.metric] || 0);
      const tip = el.querySelector('.tooltip');
      if (tip) tip.outerHTML = tooltipMarkup(m, state.niveis[id], valor);
    }
  }
  window.G2C = Object.assign(window.G2C || {}, { setMetrics, inc, setNivel, _state: state });

  renderTodas();
  recomputeLevels();

  const contador = $('contador');
  if (contador) contador.textContent = state.metrics.total || 0;
});
