document.addEventListener('DOMContentLoaded', () => {
  /* Navegação rodapé */
  document.getElementById("btnVoltar")?.addEventListener("click", () => {
    window.location.href = "../home/index.html";
  });
  document.getElementById("btnLogo")?.addEventListener("click", () => {
    window.location.href = "../minhas-receitas/index.html";
  });
  document.getElementById("btnGeladeira")?.addEventListener("click", () => {
    window.location.href = "../geladeira/index.html";
  });

  /* Gráficos */
  const ctx1 = document.getElementById('graficoEstilos');
  const ctx2 = document.getElementById('graficoMomentos');

  if (ctx1 && ctx2 && window.Chart) {
    new Chart(ctx1, {
      type: 'pie',
      data: {
        labels: ['Massas','Doces','Carnes','Saladas','Petiscos'],
        datasets: [{ data: [44.4,27.8,16.7,9.1,3.0], backgroundColor: ['#705a89','#b47cc5','#c5b4e3','#d3e3d3','#f2f2f2'] }]
      },
      options: { responsive: true }
    });

    new Chart(ctx2, {
      type: 'pie',
      data: {
        labels: ['Manhã','Meio-Dia','Noite','Madrugada','Tarde'],
        datasets: [{ data: [38.9,27.8,22.2,9.1,3.0], backgroundColor: ['#8a9ebf','#a97dac','#c9b9d3','#e0dff2','#f2f2f2'] }]
      },
      options: { responsive: true }
    });
  }

  /* Conquistas (medalhas em /app/assets/) */
  const conquistas = [
    { id: 'medalha1', titulo: 'PRIMEIRA MORDIDA', nivel: 0 },
    { id: 'medalha2', titulo: 'REPETECO', nivel: 0 },
    { id: 'medalha3', titulo: 'RECEITA RELÂMPAGO', nivel: 0 },
    { id: 'medalha4', titulo: 'CHEF DO IMPROVISO', nivel: 0 },
    { id: 'medalha5', titulo: 'COLECIONADOR', nivel: 0 },
    { id: 'medalha6', titulo: 'INTERNACIONAL', nivel: 0 },
    { id: 'medalha7', titulo: 'SAUDÁVEL', nivel: 0 },
    { id: 'medalha8', titulo: 'AGENTE NOTURNO', nivel: 0 },
    { id: 'medalha9', titulo: 'COZINHEIRO MESTRE', nivel: 0 }
  ];

  const container = document.getElementById('conquistasContainer');
  if (container) {
    const appRoot = (function () {
      const p = window.location.pathname;
      const i = p.indexOf('/app/');
      return i >= 0 ? p.slice(0, i + 5) : '/app/';
    })();
    const primaryBase = appRoot + 'assets/';   // /app/assets/
    const fallbackBase = '../assets/';         // relativo a /app/jornada/

    conquistas.forEach((c) => {
      const div = document.createElement('div');
      div.classList.add('medalha');

      const estrelas = Array.from({ length: 3 }, (_, i) =>
        `<span style="color:${i < c.nivel ? '#f8c100' : '#999'}">★</span>`
      ).join('');

      const primary = `${primaryBase}${c.id}.png`;
      const fallback = `${fallbackBase}${c.id}.png`;

      div.innerHTML = `
        <div class="estrelas">${estrelas}</div>
        <img src="${primary}" alt="${c.titulo}"
             onerror="this.onerror=null; this.src='${fallback}';" />
        <p>${c.titulo}</p>
      `;
      container.appendChild(div);
    });
  }

  /* Contador */
  const totalReceitas = localStorage.getItem('totalReceitas') || 0;
  const contador = document.getElementById('contador');
  if (contador) contador.textContent = totalReceitas;
});
