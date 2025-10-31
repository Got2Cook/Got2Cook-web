// /app/humor/humor.js

(function() {
  'use strict';

  function selecionarHumor(emoji) {
    // Adiciona feedback visual ao botão clicado
    const botoes = document.querySelectorAll('.emojis button');
    botoes.forEach(btn => {
      if (btn.textContent.trim() === emoji) {
        btn.classList.add('selected');
      } else {
        btn.style.opacity = '0.5';
      }
    });

    // Exibe o balão de resposta
    const resposta = document.getElementById('humorSelecionado');
    resposta.textContent = emoji;
    resposta.style.display = 'block';

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

    // Redireciona após animação
    setTimeout(() => {
      window.location.href = '../home/index.html';
    }, 1200);
  }

  function pularHumor() {
    // Animação suave ao pular
    const container = document.querySelector('.container');
    container.style.opacity = '0';
    container.style.transform = 'translateY(-20px)';
    
    setTimeout(() => {
      window.location.href = '../home/index.html';
    }, 300);
  }

  // Expõe funções globalmente
  window.selecionarHumor = selecionarHumor;
  window.pularHumor = pularHumor;

  // Inicialização
  document.addEventListener('DOMContentLoaded', () => {
    // Adiciona suporte a teclado para os emojis
    const botoes = document.querySelectorAll('.emojis button');
    botoes.forEach((btn, index) => {
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  });
})();
