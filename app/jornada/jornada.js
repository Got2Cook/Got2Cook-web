document.addEventListener('DOMContentLoaded', () => {
  // navegação (igual)
  const $=id=>document.getElementById(id);
  $('btnVoltar')?.addEventListener('click',()=>{window.location.href='../home/index.html';});
  $('btnLogo')?.addEventListener('click',()=>{window.location.href='../minhas-receitas/index.html';});
  $('btnGeladeira')?.addEventListener('click',()=>{window.location.href='../geladeira/index.html';});

  // ==== Gráficos com legenda custom (ao lado) ====
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
    const ctx=$(canvasId); const ul=$(legendaId);
    if(!ctx||!ul||!window.Chart) return;

    // Chart sem legenda nativa
    new Chart(ctx,{
      type:'pie',
      data:{ labels:cfg.labels, datasets:[{ data:cfg.data, backgroundColor:cfg.colors }]},
      options:{ responsive:true, plugins:{ legend:{ display:false } } }
    });

    // Legenda custom
    ul.innerHTML = cfg.labels.map((label,i)=>`
      <li tabindex="0" aria-label="${label}: ${cfg.data[i]}%">
        <span class="swatch" style="background:${cfg.colors[i]}"></span>
        <span>${label}</span>
      </li>
    `).join('');
  }

  montaChart('graficoEstilos','legendaEstilos',estilosCfg);
  montaChart('graficoMomentos','legendaMomentos',momentosCfg);

  // ==== Conquistas (3 colunas; imagens em /app/assets) ====
  const conquistas=[{id:'medalha1',titulo:'PRIMEIRA MORDIDA',nivel:0},{id:'medalha2',titulo:'REPETECO',nivel:0},
    {id:'medalha3',titulo:'RECEITA RELÂMPAGO',nivel:0},{id:'medalha4',titulo:'CHEF DO IMPROVISO',nivel:0},
    {id:'medalha5',titulo:'COLECIONADOR',nivel:0},{id:'medalha6',titulo:'INTERNACIONAL',nivel:0},
    {id:'medalha7',titulo:'SAUDÁVEL',nivel:0},{id:'medalha8',titulo:'AGENTE NOTURNO',nivel:0},
    {id:'medalha9',titulo:'COZINHEIRO MESTRE',nivel:0}];

  const container=$('conquistasContainer');
  if(container){
    conquistas.forEach(c=>{
      const div=document.createElement('div'); div.className='medalha';
      const estrelas=Array.from({length:3},(_,i)=>`<span style="color:${i<c.nivel?'#f8c100':'#999'}">★</span>`).join('');
      div.innerHTML=`
        <div class="estrelas">${estrelas}</div>
        <img src="../assets/${c.id}.png" alt="${c.titulo}" />
        <p>${c.titulo}</p>`;
      container.appendChild(div);
    });
  }

  // ==== Contador ====
  const n=localStorage.getItem('totalReceitas')||0;
  const el=$('contador'); if(el) el.textContent=n;
});
