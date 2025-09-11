document.addEventListener('DOMContentLoaded', () => {
  /* ===================== Navegação do rodapé ===================== */
  const $ = (id) => document.getElementById(id);
  $('btnVoltar')?.addEventListener('click', () => { window.location.href = '../home/index.html'; });
  $('btnLogo')?.addEventListener('click',  () => { window.location.href = '../minhas-receitas/index.html'; });
  $('btnGeladeira')?.addEventListener('click', () => { window.location.href = '../geladeira/index.html'; });
  ['btnVoltar','btnLogo','btnGeladeira'].forEach(id=>{
    const el=$(id); el?.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); el.click(); }});
  });

  /* ===================== Gráficos (pizza + legenda custom) ===================== */
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

  /* ===================== Conquistas automáticas + tooltips ===================== */
  // Texto curto e direto: "o que fazer" — sem títulos, sem metas numéricas no tooltip
  const MEDALHAS = [
    { id:'medalha1',  titulo:'PRIMEIRA MORDIDA',  metric:'criadas',       req:[1,3,5],     descricao:'Crie receitas no app.' },
    { id:'medalha2',  titulo:'REPETECO',          metric:'repeticoes',    req:[2,5,10],    descricao:'Repita a mesma receita.' },
    { id:'medalha3',  titulo:'RECEITA RELÂMPAGO', metric:'rapidas',       req:[1,3,7],     descricao:'Crie receitas em menos de 10 minutos.' },
    { id:'medalha4',  titulo:'CHEF DO IMPROVISO', metric:'improviso',     req:[1,5,12],    descricao:'Cozinhe usando só o que tem disponível.' },
    { id:'medalha5',  titulo:'COLECIONADOR',      metric:'salvas',        req:[5,15,30],   descricao:'Salve suas receitas favoritas.' },
    { id:'medalha6',  titulo:'INTERNACIONAL',     metric:'cozinhas',      req:[1,3,6],     descricao:'Explore cozinhas de países diferentes.' },
    { id:'medalha7',  titulo:'SAUDÁVEL',          metric:'saudaveis',     req:[1,5,12],    descricao:'Crie receitas marcadas como saudáveis.' },
    { id:'medalha8',  titulo:'AGENTE NOTURNO',    metric:'noturnas',      req:[1,5,12],    descricao:'Cozinhe entre meia-noite e 5h.' },
    { id:'medalha9',  titulo:'COZINHEIRO MESTRE', metric:'total',         req:[10,25,50],  descricao:'Cozinhe com frequência e evolua.' }
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
  // Tooltip minimalista (apenas a descrição/ação a fazer)
  function tooltipMarkup(m){
    return `<span class="tooltip" role="tooltip" aria-label="${m.descricao}">${m.descricao}</span>`;
  }

  function renderMedalha(m){
    const nivel = state.niveis[m.id] || 0;
    const div = document.createElement('div');
    div.className = 'medalha';
    div.id = `c_${m.id}`;

    const primary = `../assets/${m.id}.png`;
    const fallback = `/assets/${m.id}.png`;

    div.innerHTML = `
      <div class="estrelas">${estrelasMarkup(nivel)}</div>
      <img src="${primary}" alt="${m.titulo}" onerror="this.onerror=null;this.src='${fallback}'">
      <p>${m.titulo}</p>
      ${tooltipMarkup(m)}
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
        const el = document.getElementById(`c_${m.id}`);
        if (el) {
          el.querySelector('.estrelas').innerHTML = estrelasMarkup(novo);
          // tooltip permanece somente com a descrição (não muda com o nível)
        }
      }
    });
  }

  // API para sua app ligar eventos → conquistas automáticas
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
    }
  }
  window.G2C = Object.assign(window.G2C || {}, { setMetrics, inc, setNivel, _state: state });

  // Render inicial + recompute
  renderTodas();
  recomputeLevels();

  /* Contador exibido no topo (usa totalReceitas se existir) */
  const contador = $('contador');
  if (contador) contador.textContent = state.metrics.total || 0;
});
