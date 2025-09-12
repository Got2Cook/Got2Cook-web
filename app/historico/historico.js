/* Histórico – cards e calendário iguais ao seu meuhistorico.* */
(function(){
  "use strict";

  // ===== Seletores principais
  const diasContainer = document.getElementById('dias');
  const mesAno = document.getElementById('mesAno');
  const btnMesAnterior = document.getElementById('mesAnterior');
  const btnMesProximo  = document.getElementById('mesProximo');
  const btnLimparDia   = document.getElementById('btnLimparDia');

  const tituloDia   = document.getElementById('titulo-dia');
  const grid        = document.getElementById('receitas-grid');

  const inpBusca       = document.getElementById('inpBusca');
  const btnLimparBusca = document.getElementById('btnLimparBusca');
  const chipsPeriodo   = Array.from(document.querySelectorAll('.chip'));

  // ===== Navegação rodapé (placeholders)
  document.getElementById('btnVoltar')?.addEventListener('click', ()=> window.location.href = '../home/index.html');
  document.getElementById('btnLogo')?.addEventListener('click',  ()=> window.location.href = '../minhas-receitas/index.html');
  document.getElementById('btnGeladeira')?.addEventListener('click', ()=> window.location.href = '../geladeira/index.html');

  // ===== LocalStorage keys
  const LS_ITENS   = 'got2cook_historico_itens';
  const LS_FILTROS = 'got2cook_historico_filtros';

  const lsGet = (k,f)=>{ try{ return JSON.parse(localStorage.getItem(k)) ?? f; }catch{ return f; } };
  const lsSet = (k,v)=> localStorage.setItem(k, JSON.stringify(v));

  // Seed de exemplo apenas se estiver vazio (local)
  function seedIfEmpty(){
    let itens = lsGet(LS_ITENS, []);
    if(Array.isArray(itens) && itens.length) return;
    const agora = new Date();
    const iso = (d)=> d.toISOString();
    const exemplos = [
      { id:'h1', titulo:'Salada verde crocante', dataISO: iso(new Date(agora.getTime()- 1*60*60*1000)), receitaId:'r101', foto:'', duracaoMin:15, porcoes:2, tags:['rápida','fit'], favorito:false },
      { id:'h2', titulo:'Panqueca de aveia',      dataISO: iso(new Date(agora.getTime()- 26*60*60*1000)), receitaId:'r102', foto:'', duracaoMin:20, porcoes:1, tags:['café','leve'], favorito:true },
      { id:'h3', titulo:'Frango grelhado',        dataISO: iso(new Date(agora.getTime()- 3*24*60*60*1000)),  receitaId:'r103', foto:'', duracaoMin:30, porcoes:3, tags:['proteína'], favorito:false },
      { id:'h4', titulo:'Massa com pesto',        dataISO: iso(new Date(agora.getTime()- 10*24*60*60*1000)), receitaId:'r104', foto:'', duracaoMin:25, porcoes:2, tags:['rápida'], favorito:false },
      { id:'h5', titulo:'Sopa de legumes',        dataISO: iso(new Date(agora.getTime()- 34*24*60*60*1000)), receitaId:'r105', foto:'', duracaoMin:40, porcoes:4, tags:['caseira'], favorito:false },
      { id:'h6', titulo:'Omelete de queijo',      dataISO: iso(new Date(agora.getTime()- 60*24*60*60*1000)), receitaId:'r106', foto:'', duracaoMin:10, porcoes:1, tags:['rápida','prática'], favorito:false }
    ];
    lsSet(LS_ITENS, exemplos);
  }

  // ===== Estado de filtros (busca + período + dia selecionado)
  let filtros = lsGet(LS_FILTROS, { busca:'', periodo:'todos', dataSelecionada:null });

  const toYMD = (date)=>{
    const y = date.getFullYear();
    const m = String(date.getMonth()+1).padStart(2,'0');
    const d = String(date.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  };
  const isSameDayISO = (iso, ymd)=> toYMD(new Date(iso)) === ymd;

  function dentroDoPeriodo(iso, periodo){
    if (filtros.dataSelecionada) return isSameDayISO(iso, filtros.dataSelecionada);
    if (periodo==='todos') return true;
    if (periodo==='hoje') return new Date(iso).toDateString() === new Date().toDateString();
    const dias = Number(periodo)||0;
    return new Date(iso).getTime() >= (Date.now() - dias*24*60*60*1000);
  }

  // ===== Render dos CARDS (estrutura idêntica ao seu meuhistorico.js)
  function render(){
    const itens = lsGet(LS_ITENS, []);
    const busca = (filtros.busca||'').trim().toLowerCase();
    const filtrados = itens
      .filter(it => (!busca || (it.titulo||'').toLowerCase().includes(busca)))
      .filter(it => dentroDoPeriodo(it.dataISO, filtros.periodo))
      .sort((a,b)=> new Date(b.dataISO) - new Date(a.dataISO));

    // Título do bloco
    if(filtros.dataSelecionada){
      const [y,m,d] = filtros.dataSelecionada.split('-');
      tituloDia.textContent = `Receitas de ${[d,m,y].join('/')}`;
    }else{
      const label = (filtros.periodo==='todos') ? 'Todos os dias'
                   : (filtros.periodo==='hoje') ? 'Hoje'
                   : `Últimos ${filtros.periodo} dias`;
      tituloDia.textContent = label;
    }

    grid.innerHTML = '';
    if(filtrados.length === 0){
      grid.innerHTML = '<p>Nenhuma receita encontrada.</p>';
      pintarCalendarioDias(itens);
      return;
    }

    filtrados.forEach(r=>{
      // CARD
      const card = document.createElement('div');
      card.classList.add('card');

      // Imagem com borda roxa (10px)
      const imagemContainer = document.createElement('div');
      imagemContainer.classList.add('imagem-container');

      const img = document.createElement('img');
      img.classList.add('imagem-receita');
      img.src = r.foto && r.foto.trim() !== '' ? r.foto : 'receita_exemplo.png';
      img.alt = r.titulo || 'Receita';
      imagemContainer.appendChild(img);

      // Bloco inferior verde (título + tempo + emojis)
      const blocoInferior = document.createElement('div');
      blocoInferior.classList.add('bloco-inferior');

      const titulo = document.createElement('h2');
      titulo.textContent = r.titulo || 'Receita sem nome';
      blocoInferior.appendChild(titulo);

      const tempo = document.createElement('p');
      tempo.textContent = `⏱️ ${r.duracaoMin ? `${r.duracaoMin} min` : '---'}`;
      blocoInferior.appendChild(tempo);

      const emojis = document.createElement('div');
      emojis.classList.add('emojis');
      emojis.textContent = r.favorito ? '⭐' : '🙂';
      blocoInferior.appendChild(emojis);

      card.appendChild(imagemContainer);
      card.appendChild(blocoInferior);
      grid.appendChild(card);

      // Clique no card abre a receita (mantém comportamento)
      card.addEventListener('click', ()=>{
        // compatibilidade com seu fluxo
        localStorage.setItem('receita_temp', JSON.stringify({
          nome: r.titulo, tempo: r.duracaoMin ? `${r.duracaoMin} min` : '---',
          humor: r.favorito ? '⭐' : '🙂', imagem: r.foto || ''
        }));
        // rota placeholder (ajuste depois)
        window.location.href = '../visualizar/index.html?receitaId=' + encodeURIComponent(r.receitaId||'');
      });
    });

    // Atualiza destaques no calendário
    pintarCalendarioDias(itens);
  }

  // ===== Calendário (igual ao seu padrão)
  let hoje = new Date();
  let mesAtual = hoje.getMonth();
  let anoAtual = hoje.getFullYear();

  function gerarCalendario(mes, ano){
    diasContainer.innerHTML = "";
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const ultimoDia   = new Date(ano, mes+1, 0).getDate();
    mesAno.textContent = `${new Date(ano, mes).toLocaleString('pt-BR', { month:'long' })} ${ano}`;

    // espaços antes do 1º
    for (let i=0;i<primeiroDia;i++){
      const vazio = document.createElement('div');
      diasContainer.appendChild(vazio);
    }

    // dias do mês
    const itens = lsGet(LS_ITENS, []);
    const diasComItens = new Set(itens.map(it => toYMD(new Date(it.dataISO))));

    for (let dia=1; dia<=ultimoDia; dia++){
      const divDia = document.createElement('div');
      divDia.textContent = String(dia);
      const ymd = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;
      if(diasComItens.has(ymd)){ divDia.classList.add('ativo'); }
      divDia.addEventListener('click', ()=>{
        filtros.dataSelecionada = ymd;
        lsSet(LS_FILTROS, filtros);
        render();
      });
      diasContainer.appendChild(divDia);
    }
  }

  function pintarCalendarioDias(){ gerarCalendario(mesAtual, anoAtual); }
  btnMesAnterior?.addEventListener('click', ()=>{
    mesAtual--; if(mesAtual<0){ mesAtual=11; anoAtual--; } gerarCalendario(mesAtual, anoAtual);
  });
  btnMesProximo?.addEventListener('click', ()=>{
    mesAtual++; if(mesAtual>11){ mesAtual=0; anoAtual++; } gerarCalendario(mesAtual, anoAtual);
  });
  btnLimparDia?.addEventListener('click', ()=>{
    filtros.dataSelecionada = null; lsSet(LS_FILTROS, filtros); render();
  });

  // ===== Controles
  inpBusca.addEventListener('input', ()=>{
    filtros.busca = inpBusca.value || '';
    lsSet(LS_FILTROS, filtros);
    render();
  });
  btnLimparBusca.addEventListener('click', ()=>{
    inpBusca.value = '';
    filtros.busca = '';
    lsSet(LS_FILTROS, filtros);
    render();
    inpBusca.focus();
  });
  chipsPeriodo.forEach(chip=>{
    chip.addEventListener('click', ()=>{
      chipsPeriodo.forEach(c=>{ c.classList.remove('ativo'); c.setAttribute('aria-pressed','false'); });
      chip.classList.add('ativo'); chip.setAttribute('aria-pressed','true');
      filtros.periodo = chip.dataset.periodo;
      filtros.dataSelecionada = null; // prioridade para período quando limpar o dia
      lsSet(LS_FILTROS, filtros);
      render();
    });
  });

  // ===== Init
  function init(){
    seedIfEmpty(); // remova se não quiser exemplos locais
    gerarCalendario(mesAtual, anoAtual);
    render();
  }
  init();
})();
