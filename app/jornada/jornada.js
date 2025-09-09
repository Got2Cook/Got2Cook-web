// ===== JORNADA – esqueleto =====
// Mantém o padrão: scripts com defer no HTML, sem sobrescrever estilos do rodapé.

/* ---------- Hooks preparados para receber conteúdo depois ---------- */
const bloco1 = document.getElementById('jornada-bloco-1'); // ex.: gráfico/visão 01
const bloco2 = document.getElementById('jornada-bloco-2'); // ex.: gráfico/visão 02
const bloco3 = document.getElementById('jornada-bloco-3'); // ex.: conquistas/estatísticas

// Futuros seletores (exemplos) — deixam claro onde ligar lógica depois:
// const modalJornada = document.getElementById('modalJornada');
// const listaConquistas = document.getElementById('listaConquistas');
// const graficoEstilos = document.getElementById('graficoEstilos');

/* ---------- Navegação do rodapé (placeholders de clique) ---------- */
document.addEventListener('DOMContentLoaded', () => {
  const btnVoltar = document.getElementById('btnVoltar');
  const btnLogo = document.getElementById('btnLogo');
  const btnGeladeira = document.getElementById('btnGeladeira');

  btnVoltar?.addEventListener('click', () => {
    // Ir para Home
    window.location.href = '../home/index.html';
  });

  btnLogo?.addEventListener('click', () => {
    // Ir para Minhas Receitas
    window.location.href = '../minhas-receitas/index.html';
  });

  btnGeladeira?.addEventListener('click', () => {
    // Ir para Minha Geladeira
    window.location.href = '../geladeira/index.html';
  });
});

/* ---------- Acessibilidade mínima para teclado ---------- */
// Permite "Enter" ou "Space" acionar os botões quando focados (reforço)
['btnVoltar','btnLogo','btnGeladeira'].forEach(id => {
  const el = document.getElementById(id);
  el?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      el.click();
    }
  });
});

/* ---------- Observações ----------
- Nada de localStorage nesta etapa (apenas se você pedir depois).
- Nada de conteúdo funcional ainda. Apenas estrutura e navegação.
- Os três blocos .placeholder estão prontos para receber os componentes
  que você descrever na próxima mensagem.
*/
