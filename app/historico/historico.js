/* Histórico de Receitas – Got2Cook
   Persistência:
   - got2cook_historico_itens: array de objetos
     { id, titulo, dataISO, receitaId, foto, duracaoMin, porcoes, tags:[], favorito:boolean }
   - got2cook_historico_filtros: { busca, periodo, ordenacao, dataSelecionada? }
*/

(function(){
  "use strict";

  // ----- Seletores principais
  const ul = document.getElementById('listaHistorico');
  const skeleton = document.getElementById('skeleton');
  const vazio = document.getElementById('estadoVazio');
  const btnCarregarMais = document.getElementById('btnCarregarMais');

  const inpBusca = document.getElementById('inpBusca');
  const btnLimparBusca = document.getElementById('btnLimparBusca');
  const chipsPeriodo = Array.from(document.querySelectorAll('.chip'));
  const selOrdenacao = document.getElementById('selOrdenacao');
  const btnLimparFiltros = document.getElementById('btnLimparFiltros');

  // ----- Calendário (mesmo comportamento do seu meuhistorico.js)
  // refs
  const diasContainer = document.getElementById('dias');
  const mesAno = document.getElementById('mesAno');
  const btnMesAnterior = document.getElementById('mesAnterior');
  const btnMesProximo = document.getElementById('mesProximo');

  // ----- Navegação rodapé (placeholders)
  document.getElementById('btnVoltar')?.addEventListener('click', ()=> {
    window.location.href = '../home/index.html';
  });
  document.getElementById('btnLogo')?.addEventListener('click', ()=> {
    window.location.href = '../minhas-receitas/index.html';
  });
  document.getElementById('btnGeladeira')?.addEventListener('click', ()=> {
    window.location.href = '../geladeira/index.html';
  });

  // ----- LocalStorage helpers
  const LS_ITENS = 'got2cook_historico_itens';
  const LS_FILTROS = 'got2cook_historico_filtros';

  function lsGet(key, fallback){
    try{ return JSON.parse(localStorage.getItem(key)) ?? fallback; }
    catch{ return fallback; }
  }
  function lsSet(key, val){
    localStorage.setItem(key, JSON.stringify(val));
  }

  // ----- Dados iniciais (se vazio)
  function seedIfEmpty(){
    let itens = lsGet(LS_ITENS, []);
    if(Array.isArray(itens) && itens.length) return;

    const agora = new Date();
    const iso = (d)=> d.toISOString();

    const exemplos = [
      { id:'h1', titulo:'Salada verde crocante', dataISO: iso(new Date(agora.getTime()- 1*60*60*1000)),
        receitaId:'r101', foto:'', duracaoMin:15, porcoes:2, tags:['rápida','fit'], favorito:false },
      { id:'h2', titulo:'Panqueca de aveia', dataISO: iso(new Date(agora.getTime()- 26*60*60*1000)),
        receitaId:'r102', foto:'', duracaoMin:20, porcoes:1, tags:['café','leve'], favorito:true },
      { id:'h3', titulo:'Frango grelhado', dataISO: iso(new Date(agora.getTime()- 3*24*60*60*1000)),
        receitaId:'r103', foto:'', duracaoMin:30, porcoes:3, tags:['proteína'], favorito:false },
      { id:'h4', titulo:'Massa com pesto', dataISO: iso(new Date(agora.getTime()- 10*24*60*60*1000)),
        receitaId:'r104', foto:'', duracaoMin:25, porcoes:2, tags:['rápida'], favorito:false },
      { id:'h5', titulo:'Sopa de legumes', dataISO: iso(new Date(agora.getTime()- 34*24*60*60*1000)),
        receitaId:'r105', foto:'', duracaoMin:40, porcoes:4, tags:['caseira'], favorito:false },
      { id:'h6', titulo:'Omelete de queijo', dataISO: iso(new Date(agora.getTime()- 60*24*60*60*1000)),
        receitaId:'r106', foto:'', duracaoMin:10, porcoes:1, tags:['rápida','prática'], favorito:false }
    ];
    lsSet(LS_ITENS, exemplos);
  }

  // ----- Estado de filtros
  let filtros = lsGet(LS_FILTROS, { busca:'', periodo:'todos', ordenacao:'recente', dataSelecionada:null });

  // UI -> estado inicial
  function syncControlesFromState(){
    inpBusca.value = filtros.busca || '';
    selOrdenacao.value = filtros.ordenacao || 'recente';
    chipsPeriodo.forEach(c=>{
      const ativo = String(c.dataset.periodo) === String(filtros.periodo);
      c.setAttribute('aria-pressed', ativo ? 'true' : 'false');
      c.classList.toggle('ativo', ativo);
    });
  }

  // Utilidades de data
  function toYMD(date){
    const y = date.getFullYear();
    const m = String(date.getMonth()+1).padStart(2,'0');
    const d = String(date.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  }
  function isSameDayISO(iso, ymd){
    const d = new Date(iso);
    return toYMD(d) === ymd;
  }

  // ----- Filtro/ordenador
  function dentroDoPeriodo(iso, periodo){
    if(filtros.dataSelecionada){ // prioridade quando selecionar no calendário
      return isSameDayISO(iso, filtros.dataSelecionada);
    }
    if(periodo === 'todos') return true;
    if(periodo === 'hoje'){
      const d = new Date(iso);
      const now = new Date();
      return d.toDateString() === now.toDateString();
    }
    const dias = Number(periodo)||0;
    const d = new Date(iso).getTime();
    const lim = Date.now() - (dias*24*60*60*1000);
    return d >= lim;
  }

  function aplicaFiltrosEOrdenacao(data){
    const busca = (filtros.busca||'').trim().toLowerCase();
    let arr = data.filter(it => {
      const okBusca = !busca || (it.titulo||'').toLowerCase().includes(busca);
      const okPeriodo = dentroDoPeriodo(it.dataISO, filtros.periodo);
      return okBusca && okPeriodo;
    });

    if(filtros.ordenacao === 'az'){
      arr.sort((a,b)=> (a.titulo||'').localeCompare(b.titulo||'', 'pt-BR', {sensitivity:'base'}));
    }else{ // recente
      arr.sort((a,b)=> new Date(b.dataISO) - new Date(a.dataISO));
    }
    return arr;
  }

  // ----- Agrupar por data
  function labelData(d){
    const hoje = new Date();
    const ontem = new Date(Date.now()-24*60*60*1000);
    if(d.toDateString() === hoje.toDateString()) return 'Hoje';
    if(d.toDateString() === ontem.toDateString()) return 'Ontem';
    return d.toLocaleDateString('pt-BR');
  }
  function agrupaPorData(arr){
    const grupos = new Map();
    arr.forEach(it=>{
      const d = new Date(it.dataISO);
      const lbl = labelData(d);
      if(!grupos.has(lbl)) grupos.set(lbl, []);
      grupos.get(lbl).push(it);
    });
    return grupos;
  }

  // ----- Paginação
  const PAGE_SIZE = 10;
  let pagina = 1;
  let cacheFiltradoOrdenado = [];
  function resetPaginacao(){ pagina = 1; }
  function slicePaginado(arr){ return arr.slice(0, PAGE_SIZE * pagina); }

  // ----- Render
  function render(){
    skeleton.hidden = true;
    const itens = lsGet(LS_ITENS, []);
    cacheFiltradoOrdenado = aplicaFiltrosEOrdenacao(itens);

    if(cacheFiltradoOrdenado.length === 0){
      ul.innerHTML = '';
      vazio.hidden = false;
      btnCarregarMais.disabled = true;
      pintarCalendarioDias(itens); // mantém destaque do calendário
      return;
    }
    vazio.hidden = true;

    const visiveis = slicePaginado(cacheFiltradoOrdenado);
    const grupos = agrupaPorData(visiveis);

    ul.innerHTML = '';
    grupos.forEach((lista, tituloData)=>{
      const liData = document.createElement('li');
      liData.className = 'li-data';
      liData.textContent = tituloData;
      ul.appendChild(liData);

      lista.forEach(it=>{
        const li = document.createElement('li');
        li.className = 'item';
        li.setAttribute('role','button');
        li.setAttribute('tabindex','0');
        li.dataset.id = it.id;

        const thumb = document.createElement('div');
        thumb.className = 'thumb';
        const img = document.createElement('img');
        img.src = (it.foto && it.foto.trim()) ? it.foto : 'receita_placeholder.png';
        img.alt = '';
        thumb.appendChild(img);

        const bloco = document.createElement('div');
        bloco.className = 'bloco';
        const h = document.createElement('div'); h.className='titulo'; h.textContent = it.titulo || 'Receita';
        const meta = document.createElement('div'); meta.className='meta';
        const d = new Date(it.dataISO);
        const hora = d.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
        meta.textContent = `${d.toLocaleDateString('pt-BR')} • ${hora} • ⏱ ${it.duracaoMin||'--'} min • 🍽 ${it.porcoes||'--'} porções`;
        const tags = document.createElement('div'); tags.className='tags';
        (it.tags||[]).forEach(t=>{ const s=document.createElement('span'); s.className='tag'; s.textContent=t; tags.appendChild(s); });
        bloco.append(h, meta, tags);

        const acoes = document.createElement('div'); acoes.className='acoes';
        const btnAbrir = document.createElement('button'); btnAbrir.type='button'; btnAbrir.className='icon-btn'; btnAbrir.setAttribute('aria-label','Abrir receita'); btnAbrir.innerHTML='🔗';
        const btnFav = document.createElement('button'); btnFav.type='button'; btnFav.className='icon-btn'; btnFav.setAttribute('aria-label', it.favorito?'Desfavoritar':'Favoritar'); btnFav.innerHTML=`<span class="estrela">${it.favorito?'★':'☆'}</span>`; if(it.favorito) btnFav.classList.add('fav-ativo');
        const btnDel = document.createElement('button'); btnDel.type='button'; btnDel.className='icon-btn'; btnDel.setAttribute('aria-label','Remover do histórico'); btnDel.innerHTML='🗑️';
        acoes.append(btnAbrir, btnFav, btnDel);

        li.append(thumb, bloco, acoes);
        ul.appendChild(li);

        function abrir(){
          window.location.href = '../visualizar/index.html?receitaId=' + encodeURIComponent(it.receitaId||'');
        }
        li.addEventListener('click', abrir);
        li.addEventListener('keydown', (ev)=>{ if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); abrir(); }});
        btnAbrir.addEventListener('click', (ev)=>{ ev.stopPropagation(); abrir(); });
        btnFav.addEventListener('click', (ev)=>{ ev.stopPropagation(); toggleFavorito(it.id, btnFav); });
        btnDel.addEventListener('click', (ev)=>{ ev.stopPropagation(); removerItem(it.id); });
      });
    });

    const temMais = cacheFiltradoOrdenado.length > visiveis.length;
    btnCarregarMais.disabled = !temMais;

    // Atualiza destaques do calendário conforme itens existentes
    pintarCalendarioDias(lsGet(LS_ITENS, []));
  }

  function toggleFavorito(id, btn){
    const itens = lsGet(LS_ITENS, []);
    const idx = itens.findIndex(x=>x.id===id);
    if(idx>-1){
      itens[idx].favorito = !itens[idx].favorito;
      lsSet(LS_ITENS, itens);
      const ativo = itens[idx].favorito;
      btn.classList.toggle('fav-ativo', ativo);
      btn.setAttribute('aria-label', ativo ? 'Desfavoritar' : 'Favoritar');
      btn.innerHTML = `<span class="estrela">${ativo ? '★' : '☆'}</span>`;
    }
  }

  function removerItem(id){
    const ok = confirm('Remover este item do histórico?');
    if(!ok) return;
    let itens = lsGet(LS_ITENS, []);
    itens = itens.filter(x=>x.id !== id);
    lsSet(LS_ITENS, itens);
    render();
  }

  // ----- Controles
  inpBusca.addEventListener('input', ()=>{
    filtros.busca = inpBusca.value || '';
    lsSet(LS_FILTROS, filtros);
    resetPaginacao();
    render();
  });

  btnLimparBusca.addEventListener('click', ()=>{
    inpBusca.value = '';
    filtros.busca = '';
    lsSet(LS_FILTROS, filtros);
    resetPaginacao();
    render();
    inpBusca.focus();
  });

  chipsPeriodo.forEach(chip=>{
    chip.addEventListener('click', ()=>{
      chipsPeriodo.forEach(c=>{ c.classList.remove('ativo'); c.setAttribute('aria-pressed','false'); });
      chip.classList.add('ativo'); chip.setAttribute('aria-pressed','true');
      filtros.periodo = chip.dataset.periodo;
      // ao escolher um período padrão, limpamos data específica do calendário
      filtros.dataSelecionada = null;
      lsSet(LS_FILTROS, filtros);
      resetPaginacao();
      render();
    });
  });

  selOrdenacao.addEventListener('change', ()=>{
    filtros.ordenacao = selOrdenacao.value;
    lsSet(LS_FILTROS, filtros);
    resetPaginacao();
    render();
  });

  btnLimparFiltros.addEventListener('click', ()=>{
    filtros = { busca:'', periodo:'todos', ordenacao:'recente', dataSelecionada:null };
    lsSet(LS_FILTROS, filtros);
    syncControlesFromState();
    resetPaginacao();
    render();
  });

  btnCarregarMais.addEventListener('click', ()=>{
    pagina++;
    render();
  });

  // ====== CALENDÁRIO (adaptado 1:1 do seu padrão) ======
  let hoje = new Date();
  let mesAtual = hoje.getMonth();
  let anoAtual = hoje.getFullYear();

  function pintarCalendarioDias(itens){
    // marca como "ativo" os dias que possuem itens
    // (regera a grade mantendo o mês atual)
    gerarCalendario(mesAtual, anoAtual, itens);
  }

  function gerarCalendario(mes, ano, itensParam){
    // se já existir grade, vamos recriar do zero
    diasContainer.innerHTML = "";
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    mesAno.textContent = `${new Date(ano, mes).toLocaleString('pt-BR', { month: 'long' })} ${ano}`;

    // colecao de itens para destacar dias
    const itens = Array.isArray(itensParam) ? itensParam : lsGet(LS_ITENS, []);

    // Pré-prepara um Set com YYYY-MM-DD que possuem itens
    const diasComItens = new Set();
    itens.forEach(it=>{
      try{
        const ymd = toYMD(new Date(it.dataISO));
        diasComItens.add(ymd);
      }catch{}
    });

    // Preenche dias vazios antes do 1º
    for (let i = 0; i < primeiroDia; i++){
      const vazio = document.createElement('div');
      vazio.setAttribute('aria-hidden','true');
      diasContainer.appendChild(vazio);
    }

    for (let dia = 1; dia <= ultimoDia; dia++){
      const divDia = document.createElement('div');
      divDia.textContent = String(dia);
      const ymd = `${ano}-${String(mes+1).padStart(2,'0')}-${String(dia).padStart(2,'0')}`;

      if(diasComItens.has(ymd)){
        divDia.classList.add('ativo');
        divDia.setAttribute('title','Há receitas neste dia');
      }

      divDia.addEventListener('click', ()=>{
        filtros.dataSelecionada = ymd;           // trava o filtro para o dia
        filtros.periodo = 'todos';               // mantém chips consistentes
        lsSet(LS_FILTROS, filtros);
        chipsPeriodo.forEach(c=>{ c.classList.remove('ativo'); c.setAttribute('aria-pressed','false'); });
        resetPaginacao();
        render();
        // rola até a lista para dar feedback
        document.getElementById('listaHistorico')?.scrollIntoView({behavior:'smooth', block:'start'});
      });

      diasContainer.appendChild(divDia);
    }
  }

  btnMesAnterior?.addEventListener('click', ()=>{
    mesAtual--;
    if (mesAtual < 0){ mesAtual = 11; anoAtual--; }
    gerarCalendario(mesAtual, anoAtual);
  });

  btnMesProximo?.addEventListener('click', ()=>{
    mesAtual++;
    if (mesAtual > 11){ mesAtual = 0; anoAtual++; }
    gerarCalendario(mesAtual, anoAtual);
  });

  // ----- Inicialização
  function init(){
    seedIfEmpty();
    syncControlesFromState();
    skeleton.hidden = false;
    // inicia calendário
    gerarCalendario(mesAtual, anoAtual);
    setTimeout(()=>{ resetPaginacao(); render(); }, 250);
  }

  init();
})();
