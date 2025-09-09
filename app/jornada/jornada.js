// /app/jornada/jornada.js
document.addEventListener('DOMContentLoaded', () => {
  /* ===== Navegação do rodapé ===== */
  const $ = (id) => document.getElementById(id);
  $('btnVoltar')?.addEventListener('click', () => { window.location.href = '../home/index.html'; });
  $('btnLogo')?.addEventListener('click', () => { window.location.href = '../minhas-receitas/index.html'; });
  $('btnGeladeira')?.addEventListener('click', () => { window.location.href = '../geladeira/index.html'; });
  ['btnVoltar','btnLogo','btnGeladeira'].forEach(id=>{
    const el=$(id);
    el?.addEventListener('keydown',e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); el.click(); }});
  });

  /* ===== Gráficos (altura reduzida) ===== */
  const ctx1 = $('graficoEstilos');
  const ctx2 = $('graficoMomentos');
  if (window.Chart && ctx1 && ctx2) {
    new Chart(ctx1, {
      type:'pie',
      data:{ labels:['Massas','Doces','Carnes','Saladas','Petiscos'],
        datasets:[{ data:[44.4,27.8,16.7,9.1,3.0],
          backgroundColor:['#705a89','#b47cc5','#c5b4e3','#d3e3d3','#f2f2f2'] }] },
      options:{ responsive:true }
    });
    new Chart(ctx2, {
      type:'pie',
      data:{ labels:['Manhã','Meio-Dia','Noite','Madrugada','Tarde'],
        datasets:[{ data:[38.9,27.8,22.2,9.1,3.0],
          backgroundColor:['#8a9ebf','#a97dac','#c9b9d3','#e0dff2','#f2f2f2'] }] },
      options:{ responsive:true }
    });
  }

  /* ===== Conquistas (com tentativa de múltiplos caminhos) ===== */
  const conquistas = [
    { id:'medalha1', titulo:'PRIMEIRA MORDIDA', nivel:0 },
    { id:'medalha2', titulo:'REPETECO', nivel:0 },
    { id:'medalha3', titulo:'RECEITA RELÂMPAGO', nivel:0 },
    { id:'medalha4', titulo:'CHEF DO IMPROVISO', nivel:0 },
    { id:'medalha5', titulo:'COLECIONADOR', nivel:0 },
    { id:'medalha6', titulo:'INTERNACIONAL', nivel:0 },
    { id:'medalha7', titulo:'SAUDÁVEL', nivel:0 },
    { id:'medalha8', titulo:'AGENTE NOTURNO', nivel:0 },
    { id:'medalha9', titulo:'COZINHEIRO MESTRE', nivel:0 }
  ];
  const container = $('conquistasContainer');

  const PATHS = [
    '../../assets/',   // raiz/assets  (ex.: https://site.com/assets/)
    '../assets/',      // /app/assets
    '/assets/',        // absoluto raiz
    '/app/assets/',    // absoluto /app
    'assets/'          // dentro da própria pasta
  ];

  function tryLoad(srcs, onSuccess, onFail) {
    if (!srcs.length) return onFail?.();
    const src = srcs[0];
    const img = new Image();
    img.onload = () => onSuccess(src);
    img.onerror = () => tryLoad(srcs.slice(1), onSuccess, onFail);
    img.src = src;
  }

  if (container) {
    conquistas.forEach((c) => {
      const card = document.createElement('div');
      card.className = 'medalha';

      const estrelas = Array.from({ length: 3 }, (_, i) =>
        `<span style="color:${i < c.nivel ? '#f8c100' : '#999'}">★</span>`
      ).join('');

      const sources = PATHS.map(p => `${p}${c.id}.png`);
      tryLoad(
        sources,
        (okSrc) => {
          card.innerHTML = `
            <div class="estrelas">${estrelas}</div>
            <img src="${okSrc}" alt="${c.titulo}" />
            <p>${c.titulo}</p>
          `;
        },
        () => {
          card.innerHTML = `
            <div class="estrelas">${estrelas}</div>
            <div style="width:130px;height:130px;display:flex;align-items:center;justify-content:center;border:2px dashed #3e6529;border-radius:12px;">
              <span style="font-size:12px;color:#492f70">imagem não encontrada</span>
            </div>
            <p>${c.titulo}</p>
          `;
        }
      );

      container.appendChild(card);
    });
  }

  /* ===== Contador ===== */
  const totalReceitas = localStorage.getItem('totalReceitas') || 0;
  const contador = $('contador');
  if (contador) contador.textContent = totalReceitas;
});
