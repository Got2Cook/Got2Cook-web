// /app/culinaria-pais/pais.js

(function() {
  'use strict';

  // === Banco de dados de países (stub - pode vir da API depois) ===
  const PAISES_DB = {
    brasil: {
      nome: 'Brasil',
      bandeira: '/public/assets/img/bandeiras/brasil.png',
      descricao: 'Explore os sabores vibrantes e diversos da culinária brasileira!',
      receitas: [
        { id: 1, titulo: 'Feijoada', tempo: 180, humores: ['😊', '😋'], imagem: '/public/assets/img/receitas/feijoada.jpg' },
        { id: 2, titulo: 'Moqueca', tempo: 60, humores: ['😊', '🤤'], imagem: '/public/assets/img/receitas/moqueca.jpg' },
        { id: 3, titulo: 'Brigadeiro', tempo: 20, humores: ['😊', '❤️'], imagem: '/public/assets/img/receitas/brigadeiro.jpg' },
        { id: 4, titulo: 'Pão de Queijo', tempo: 40, humores: ['😊', '😋'], imagem: '/public/assets/img/receitas/pao-queijo.jpg' },
        { id: 5, titulo: 'Acarajé', tempo: 90, humores: ['😊', '🔥'], imagem: '/public/assets/img/receitas/acaraje.jpg' },
        { id: 6, titulo: 'Açaí na Tigela', tempo: 15, humores: ['😊', '💪'], imagem: '/public/assets/img/receitas/acai.jpg' }
      ]
    },
    italia: {
      nome: 'Itália',
      bandeira: '/public/assets/img/bandeiras/italia.png',
      descricao: 'Descubra a autêntica culinária italiana, cheia de tradição e sabor!',
      receitas: [
        { id: 7, titulo: 'Pizza Margherita', tempo: 45, humores: ['😊', '🍕'], imagem: '/public/assets/img/receitas/pizza.jpg' },
        { id: 8, titulo: 'Carbonara', tempo: 30, humores: ['😊', '🤤'], imagem: '/public/assets/img/receitas/carbonara.jpg' },
        { id: 9, titulo: 'Tiramisù', tempo: 240, humores: ['😊', '❤️'], imagem: '/public/assets/img/receitas/tiramisu.jpg' },
        { id: 10, titulo: 'Lasanha', tempo: 90, humores: ['😊', '😋'], imagem: '/public/assets/img/receitas/lasanha.jpg' },
        { id: 11, titulo: 'Risoto', tempo: 40, humores: ['😊', '🍷'], imagem: '/public/assets/img/receitas/risoto.jpg' },
        { id: 12, titulo: 'Gelato', tempo: 120, humores: ['😊', '🍦'], imagem: '/public/assets/img/receitas/gelato.jpg' }
      ]
    },
    japao: {
      nome: 'Japão',
      bandeira: '/public/assets/img/bandeiras/japao.png',
      descricao: 'Experimente a delicadeza e precisão da culinária japonesa!',
      receitas: [
        { id: 13, titulo: 'Sushi', tempo: 60, humores: ['😊', '🍣'], imagem: '/public/assets/img/receitas/sushi.jpg' },
        { id: 14, titulo: 'Ramen', tempo: 120, humores: ['😊', '🍜'], imagem: '/public/assets/img/receitas/ramen.jpg' },
        { id: 15, titulo: 'Tempura', tempo: 30, humores: ['😊', '😋'], imagem: '/public/assets/img/receitas/tempura.jpg' },
        { id: 16, titulo: 'Gyoza', tempo: 45, humores: ['😊', '🥟'], imagem: '/public/assets/img/receitas/gyoza.jpg' },
        { id: 17, titulo: 'Teriyaki', tempo: 40, humores: ['😊', '🤤'], imagem: '/public/assets/img/receitas/teriyaki.jpg' },
        { id: 18, titulo: 'Mochi', tempo: 30, humores: ['😊', '🍡'], imagem: '/public/assets/img/receitas/mochi.jpg' }
      ]
    },
    mexico: {
      nome: 'México',
      bandeira: '/public/assets/img/bandeiras/mexico.png',
      descricao: 'Saboreie a intensidade e cores da cozinha mexicana!',
      receitas: [
        { id: 19, titulo: 'Tacos', tempo: 30, humores: ['😊', '🌮'], imagem: '/public/assets/img/receitas/tacos.jpg' },
        { id: 20, titulo: 'Guacamole', tempo: 15, humores: ['😊', '🥑'], imagem: '/public/assets/img/receitas/guacamole.jpg' },
        { id: 21, titulo: 'Enchiladas', tempo: 50, humores: ['😊', '🔥'], imagem: '/public/assets/img/receitas/enchiladas.jpg' },
        { id: 22, titulo: 'Quesadilla', tempo: 20, humores: ['😊', '🧀'], imagem: '/public/assets/img/receitas/quesadilla.jpg' },
        { id: 23, titulo: 'Churros', tempo: 35, humores: ['😊', '❤️'], imagem: '/public/assets/img/receitas/churros.jpg' },
        { id: 24, titulo: 'Pozole', tempo: 180, humores: ['😊', '🌶️'], imagem: '/public/assets/img/receitas/pozole.jpg' }
      ]
    },
    franca: {
      nome: 'França',
      bandeira: '/public/assets/img/bandeiras/franca.png',
      descricao: 'Descubra a elegância e sofisticação da gastronomia francesa!',
      receitas: [
        { id: 25, titulo: 'Croissant', tempo: 240, humores: ['😊', '🥐'], imagem: '/public/assets/img/receitas/croissant.jpg' },
        { id: 26, titulo: 'Ratatouille', tempo: 90, humores: ['😊', '🍆'], imagem: '/public/assets/img/receitas/ratatouille.jpg' },
        { id: 27, titulo: 'Crème Brûlée', tempo: 180, humores: ['😊', '❤️'], imagem: '/public/assets/img/receitas/creme-brulee.jpg' },
        { id: 28, titulo: 'Coq au Vin', tempo: 120, humores: ['😊', '🍷'], imagem: '/public/assets/img/receitas/coq-au-vin.jpg' },
        { id: 29, titulo: 'Quiche Lorraine', tempo: 60, humores: ['😊', '🥧'], imagem: '/public/assets/img/receitas/quiche.jpg' },
        { id: 30, titulo: 'Macaron', tempo: 150, humores: ['😊', '🍬'], imagem: '/public/assets/img/receitas/macaron.jpg' }
      ]
    },
    tailandia: {
      nome: 'Tailândia',
      bandeira: '/public/assets/img/bandeiras/tailandia.png',
      descricao: 'Experimente o equilíbrio perfeito de sabores da culinária tailandesa!',
      receitas: [
        { id: 31, titulo: 'Pad Thai', tempo: 30, humores: ['😊', '🍜'], imagem: '/public/assets/img/receitas/pad-thai.jpg' },
        { id: 32, titulo: 'Tom Yum', tempo: 40, humores: ['😊', '🔥'], imagem: '/public/assets/img/receitas/tom-yum.jpg' },
        { id: 33, titulo: 'Curry Verde', tempo: 45, humores: ['😊', '🌶️'], imagem: '/public/assets/img/receitas/curry-verde.jpg' },
        { id: 34, titulo: 'Som Tam', tempo: 20, humores: ['😊', '🥗'], imagem: '/public/assets/img/receitas/som-tam.jpg' },
        { id: 35, titulo: 'Mango Sticky Rice', tempo: 60, humores: ['😊', '🥭'], imagem: '/public/assets/img/receitas/mango-rice.jpg' },
        { id: 36, titulo: 'Massaman Curry', tempo: 90, humores: ['😊', '🤤'], imagem: '/public/assets/img/receitas/massaman.jpg' }
      ]
    },
    india: {
      nome: 'Índia',
      bandeira: '/public/assets/img/bandeiras/india.png',
      descricao: 'Explore a riqueza de especiarias e tradições da culinária indiana!',
      receitas: [
        { id: 37, titulo: 'Butter Chicken', tempo: 60, humores: ['😊', '🍛'], imagem: '/public/assets/img/receitas/butter-chicken.jpg' },
        { id: 38, titulo: 'Biryani', tempo: 90, humores: ['😊', '🍚'], imagem: '/public/assets/img/receitas/biryani.jpg' },
        { id: 39, titulo: 'Naan', tempo: 40, humores: ['😊', '🫓'], imagem: '/public/assets/img/receitas/naan.jpg' },
        { id: 40, titulo: 'Samosa', tempo: 50, humores: ['😊', '🥟'], imagem: '/public/assets/img/receitas/samosa.jpg' },
        { id: 41, titulo: 'Tandoori', tempo: 120, humores: ['😊', '🔥'], imagem: '/public/assets/img/receitas/tandoori.jpg' },
        { id: 42, titulo: 'Gulab Jamun', tempo: 60, humores: ['😊', '❤️'], imagem: '/public/assets/img/receitas/gulab-jamun.jpg' }
      ]
    },
    espanha: {
      nome: 'Espanha',
      bandeira: '/public/assets/img/bandeiras/espanha.png',
      descricao: 'Descubra os sabores ensolarados da culinária espanhola!',
      receitas: [
        { id: 43, titulo: 'Paella', tempo: 90, humores: ['😊', '🥘'], imagem: '/public/assets/img/receitas/paella.jpg' },
        { id: 44, titulo: 'Gazpacho', tempo: 30, humores: ['😊', '🍅'], imagem: '/public/assets/img/receitas/gazpacho.jpg' },
        { id: 45, titulo: 'Churros con Chocolate', tempo: 40, humores: ['😊', '❤️'], imagem: '/public/assets/img/receitas/churros-chocolate.jpg' },
        { id: 46, titulo: 'Tortilla Española', tempo: 35, humores: ['😊', '🥚'], imagem: '/public/assets/img/receitas/tortilla.jpg' },
        { id: 47, titulo: 'Patatas Bravas', tempo: 45, humores: ['😊', '🥔'], imagem: '/public/assets/img/receitas/bravas.jpg' },
        { id: 48, titulo: 'Crema Catalana', tempo: 120, humores: ['😊', '🍮'], imagem: '/public/assets/img/receitas/crema-catalana.jpg' }
      ]
    },
    argentina: {
      nome: 'Argentina',
      bandeira: '/public/assets/img/bandeiras/argentina.png',
      descricao: 'Experimente a paixão e sabor da culinária argentina!',
      receitas: [
        { id: 49, titulo: 'Asado', tempo: 180, humores: ['😊', '🥩'], imagem: '/public/assets/img/receitas/asado.jpg' },
        { id: 50, titulo: 'Empanadas', tempo: 60, humores: ['😊', '🥟'], imagem: '/public/assets/img/receitas/empanadas.jpg' },
        { id: 51, titulo: 'Dulce de Leche', tempo: 240, humores: ['😊', '❤️'], imagem: '/public/assets/img/receitas/dulce-leche.jpg' },
        { id: 52, titulo: 'Chimichurri', tempo: 15, humores: ['😊', '🌿'], imagem: '/public/assets/img/receitas/chimichurri.jpg' },
        { id: 53, titulo: 'Milanesa', tempo: 40, humores: ['😊', '🍖'], imagem: '/public/assets/img/receitas/milanesa.jpg' },
        { id: 54, titulo: 'Alfajores', tempo: 90, humores: ['😊', '🍪'], imagem: '/public/assets/img/receitas/alfajores.jpg' }
      ]
    },
    grecia: {
      nome: 'Grécia',
      bandeira: '/public/assets/img/bandeiras/grecia.png',
      descricao: 'Descubra os sabores mediterrâneos da culinária grega!',
      receitas: [
        { id: 55, titulo: 'Moussaka', tempo: 120, humores: ['😊', '🍆'], imagem: '/public/assets/img/receitas/moussaka.jpg' },
        { id: 56, titulo: 'Souvlaki', tempo: 45, humores: ['😊', '�串'], imagem: '/public/assets/img/receitas/souvlaki.jpg' },
        { id: 57, titulo: 'Tzatziki', tempo: 20, humores: ['😊', '🥒'], imagem: '/public/assets/img/receitas/tzatziki.jpg' },
        { id: 58, titulo: 'Spanakopita', tempo: 75, humores: ['😊', '🥧'], imagem: '/public/assets/img/receitas/spanakopita.jpg' },
        { id: 59, titulo: 'Baklava', tempo: 150, humores: ['😊', '🍯'], imagem: '/public/assets/img/receitas/baklava.jpg' },
        { id: 60, titulo: 'Greek Salad', tempo: 15, humores: ['😊', '🥗'], imagem: '/public/assets/img/receitas/greek-salad.jpg' }
      ]
    },
    portugal: {
      nome: 'Portugal',
      bandeira: '/public/assets/img/bandeiras/portugal.png',
      descricao: 'Saboreie a tradição e o mar da culinária portuguesa!',
      receitas: [
        { id: 61, titulo: 'Bacalhau à Brás', tempo: 45, humores: ['😊', '🐟'], imagem: '/public/assets/img/receitas/bacalhau-bras.jpg' },
        { id: 62, titulo: 'Pastéis de Nata', tempo: 90, humores: ['😊', '🥐'], imagem: '/public/assets/img/receitas/pasteis-nata.jpg' },
        { id: 63, titulo: 'Francesinha', tempo: 60, humores: ['😊', '🥪'], imagem: '/public/assets/img/receitas/francesinha.jpg' },
        { id: 64, titulo: 'Caldo Verde', tempo: 40, humores: ['😊', '🥬'], imagem: '/public/assets/img/receitas/caldo-verde.jpg' },
        { id: 65, titulo: 'Arroz de Marisco', tempo: 75, humores: ['😊', '🦐'], imagem: '/public/assets/img/receitas/arroz-marisco.jpg' },
        { id: 66, titulo: 'Piri Piri', tempo: 120, humores: ['😊', '🌶️'], imagem: '/public/assets/img/receitas/piri-piri.jpg' }
      ]
    },
    china: {
      nome: 'China',
      bandeira: '/public/assets/img/bandeiras/china.png',
      descricao: 'Explore a milenar e diversa culinária chinesa!',
      receitas: [
        { id: 67, titulo: 'Dim Sum', tempo: 90, humores: ['😊', '🥟'], imagem: '/public/assets/img/receitas/dim-sum.jpg' },
        { id: 68, titulo: 'Pato de Pequim', tempo: 180, humores: ['😊', '🦆'], imagem: '/public/assets/img/receitas/pato-pequim.jpg' },
        { id: 69, titulo: 'Mapo Tofu', tempo: 35, humores: ['😊', '🌶️'], imagem: '/public/assets/img/receitas/mapo-tofu.jpg' },
        { id: 70, titulo: 'Chow Mein', tempo: 30, humores: ['😊', '🍜'], imagem: '/public/assets/img/receitas/chow-mein.jpg' },
        { id: 71, titulo: 'Kung Pao', tempo: 40, humores: ['😊', '🔥'], imagem: '/public/assets/img/receitas/kung-pao.jpg' },
        { id: 72, titulo: 'Baozi', tempo: 120, humores: ['😊', '🥟'], imagem: '/public/assets/img/receitas/baozi.jpg' }
      ]
    }
  };

  // === Estado ===
  let state = {
    paisAtual: null,
    receitas: [],
    receitasFiltradas: [],
    termoBusca: ''
  };

  // === Elementos DOM ===
  const elements = {
    bandeiraHeader: document.getElementById('bandeiraHeader'),
    paisTitulo: document.getElementById('paisTitulo'),
    descricaoPais: document.getElementById('descricaoPais'),
    inputBusca: document.getElementById('inputBusca'),
    receitasGrid: document.getElementById('receitasGrid'),
    emptyState: document.getElementById('emptyState'),
    btnLimparBusca: document.getElementById('btnLimparBusca'),
    btnVoltarMapa: document.getElementById('btnVoltarMapa'),
    btnVoltar: document.getElementById('btnVoltar'),
    btnLogo: document.getElementById('btnLogo'),
    btnGeladeira: document.getElementById('btnGeladeira')
  };

  // === Inicialização ===
  function init() {
    loadPaisFromURL();
    renderPage();
    bindEvents();
  }

  // === Carregar país da URL ===
  function loadPaisFromURL() {
    const params = new URLSearchParams(window.location.search);
    const paisSlug = params.get('pais');
    
    if (paisSlug && PAISES_DB[paisSlug]) {
      state.paisAtual = PAISES_DB[paisSlug];
      state.receitas = state.paisAtual.receitas;
      state.receitasFiltradas = state.receitas;
    } else {
      // Fallback para Brasil
      state.paisAtual = PAISES_DB.brasil;
      state.receitas = state.paisAtual.receitas;
      state.receitasFiltradas = state.receitas;
    }
  }

  // === Renderização ===
  function renderPage() {
    // Header
    elements.bandeiraHeader.src = state.paisAtual.bandeira;
    elements.bandeiraHeader.alt = `Bandeira ${state.paisAtual.nome}`;
    elements.paisTitulo.textContent = state.paisAtual.nome;
    elements.descricaoPais.textContent = state.paisAtual.descricao;

    // Grid de receitas
    renderReceitas();
  }

  function renderReceitas() {
    elements.receitasGrid.innerHTML = '';

    if (state.receitasFiltradas.length === 0) {
      elements.emptyState.style.display = 'block';
      elements.receitasGrid.style.display = 'none';
      return;
    }

    elements.emptyState.style.display = 'none';
    elements.receitasGrid.style.display = 'grid';

    state.receitasFiltradas.forEach(receita => {
      const card = createReceitaCard(receita);
      elements.receitasGrid.appendChild(card);
    });
  }

  function createReceitaCard(receita) {
    const card = document.createElement('a');
    card.className = 'card-receita';
    card.href = `/app/visualizar-receita/index.html?id=${receita.id}`;
    card.setAttribute('aria-label', `Ver receita de ${receita.titulo}`);

    card.innerHTML = `
      <img src="${receita.imagem}" alt="${receita.titulo}" class="receita-imagem" loading="lazy">
      <div class="receita-info">
        <span class="receita-nome">${receita.titulo}</span>
        <div class="receita-tempo">⏱️ ${receita.tempo} min</div>
        <div class="receita-emoji-humor">${receita.humores.join(' ')}</div>
      </div>
    `;

    return card;
  }

  // === Busca ===
  function handleBusca() {
    state.termoBusca = elements.inputBusca.value.toLowerCase().trim();

    if (state.termoBusca === '') {
      state.receitasFiltradas = state.receitas;
    } else {
      state.receitasFiltradas = state.receitas.filter(receita =>
        receita.titulo.toLowerCase().includes(state.termoBusca)
      );
    }

    renderReceitas();
  }

  function limparBusca() {
    elements.inputBusca.value = '';
    state.termoBusca = '';
    state.receitasFiltradas = state.receitas;
    renderReceitas();
    elements.inputBusca.focus();
  }

  // === Event Handlers ===
  function bindEvents() {
    // Busca
    elements.inputBusca.addEventListener('input', debounce(handleBusca, 300));
    elements.btnLimparBusca.addEventListener('click', limparBusca);

    // Navegação
    elements.btnVoltarMapa.addEventListener('click', () => {
      window.location.href = '/app/explorar-mundo/index.html';
    });

    elements.btnVoltar.addEventListener('click', () => {
      window.history.back();
    });

    elements.btnLogo.addEventListener('click', () => {
      window.location.href = '/app/principal/index.html';
    });

    elements.btnGeladeira.addEventListener('click', () => {
      window.location.href = '/app/minha-geladeira/index.html';
    });
  }

  // === Utilitários ===
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // === Execução ===
  init();

})();
