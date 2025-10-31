// /app/humor/humor.js

(function() {
  'use strict';

  function selecionarHumor(emoji) {
    // Adiciona feedback visual rápido ao botão clicado
    const botoes = document.querySelectorAll('.emojis button');
    botoes.forEach(btn => {
      if (btn.textContent.trim() === emoji) {
        btn.classList.add('selected');
      }
    });

    // Salva no localStorage
    const hoje = new Date().toISOString().slice(0, 10);

    // Histórico completo
    let historico = JSON.parse(localStorage.getItem('historicoHumor')) || {};
    historico[hoje] = emoji;
    localStorage.setItem('historicoHumor', JSON.stringify(historico));

    // Humor atual
    localStorage.setItem('got2cook_humor', emoji);

    // Salva no histórico padrão do sistema
    let moodHistory = JSON.parse(localStorage.getItem('got2cook_mood_history')) || [];
    moodHistory.push({
      at: new Date().toISOString(),
      humor: emoji
    });
    localStorage.setItem('got2cook_mood_history', JSON.stringify(moodHistory));
    localStorage.setItem('got2cook_mood_current', emoji);

    // Redireciona IMEDIATAMENTE
    setTimeout(() => {
      window.location.href = '../home/index.html';
    }, 300);
  }

  function pularHumor() {
    window.location.href = '../home/index.html';
  }

  // Expõe funções globalmente
  window.selecionarHumor = selecionarHumor;
  window.pularHumor = pularHumor;

  // Inicialização
  document.addEventListener('DOMContentLoaded', () => {
    // Adiciona suporte a teclado para os emojis
    const botoes = document.querySelectorAll('.emojis button');
    botoes.forEach((btn) => {
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  });
})();
