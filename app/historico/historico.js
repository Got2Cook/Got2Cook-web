/* Histórico – calendário normal + lista com mais respiro
   Ações:
   - 👁️ Ver (abre a receita)
   - ⭐ Favoritar (salva em "Minhas Receitas" e marca o item)
   - 🗑️ Lixo (remove do histórico)
   Persistência:
   - got2cook_historico_itens
   - got2cook_minhas_receitas (novo)
*/
(function(){
  "use strict";

  // ----- Seletores
  const ul = document.getElementById('listaHistorico');
  const skeleton = document.getElementById('skeleton');
  const vazio = document.getElementById('estadoVazio');
  const btnCarregarMais = document.getElementById('btnCarregarMais');

  const inpBusca = document.getElementById('inpBusca');
  const btnLimparBusca = document.getElementById('btnLimparBusca');
  const chipsPeriodo = Array.from(document.querySelectorAll('.chip'));

  // Calendário
  const diasContainer = document.getElementById('dias');
  const mesAno = document.getElementById('mesAno');
  const btnMesAnterior = document.getElementById('mesAnterior');
  const btnMesProximo = document.getElementById('mesProximo');
  const btnLimparDia = document.getElementById('btnLimparDia');

  // Rodapé (placeholders)
  document.getElementById('btnVoltar')?.addEventListener('click', ()=> {
    window.location.href = '../home/index.html';
  });
  document.getElementById('btnLogo')?.addEventListener('click', ()=> {
    window.location.href = '../minhas-receitas/index.html';
  });
  document.getElementById('btnGeladeira')?.addEventListener('click', ()=> {
    window.location.href = '../geladeira/index.html';
  });

  // ----- LocalStorage
  const LS_ITENS   = 'got2cook_historico_itens';
  const LS_FILTROS = 'got2cook_historico_filtros';
  const LS_MINHAS  = 'got2cook_minhas_receitas';

  const lsGet = (k,f)=>{ try{ return JSON.parse(localStorage.getItem(k)) ?? f; }catch{ return f; } };
  const lsSet = (k,v)=> localStorage.setItem(k, JSON.stringify(v));

  // Seed exemplo se vazio (somente local)
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
  let filtros = lsGet(LS_FILTROS, { busca:'', periodo:'todos', dataSelecionada:null });

  function syncControlesFromState(){
    inpBusca.value = filtros.busca || '';
    chipsPeriodo.forEach(c=>{
      const ativo = String(c.dataset.periodo) === String(filtros.periodo);
      c.setAttribute('aria-pressed', ativo ? 'true' : 'false');
      c.classList.toggle('ativo', ativo);
    });
  }

  // Utils de data
  function toYMD(date){
    const y = date.getFullYear();
    const m = String(date.getMonth()+1).padStart(2,'0');
    const d = String(date.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  }
  function isSameDayISO(iso, ymd){ return toYMD(new Date(iso)) === ymd; }

  // Período
  function dentroDoPeriodo(iso, periodo){
    if (filtros.dataSelecionada) return isSameDayISO(iso, filtros.dataSelecionada);
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

  // Filtra + ordena (recente -> antigo)
  function aplicaFiltrosEOrdenacao(data){
    const busca = (filtros.busca||'').trim().toLowerCase();
    let arr = data.filter(it => {
      const okBusca = !busca || (it.titulo||'').toLowerCase().includes(busca);
      const okPeriodo = dentroDoPeriodo(it.dataISO, filtros.periodo);
      return okBusca && okPeriodo;
    });
    arr.sort((a,b)=> new Date(b.dataISO) - new Date(a.dataISO));
    return arr;
  }

  // Agrupar por data
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

  // Paginação
  const PAGE_SIZE = 10;
  let pagina = 1;
  let cacheFiltradoOrdenado = [];
  function resetPaginacao(){ pagina = 1; }
  function slicePaginado(arr){ return arr.slice(0, PAGE_SIZE * pagina); }

  // ====== MINHAS RECEITAS (persistência) ======
  function getMinhas(){ return lsGet(LS_MINHAS, []); }
  function setMinhas(arr){ lsSet(LS_MINHAS, arr); }
  function jaEstaEmMinhas(receitaId){
    if(!receitaId) return false;
    const arr = getMinhas();
    return !!arr.find(r => r.receitaId === receitaId);
  }
  function salvarEmMinhasReceitas(item){
    const arr = getMinhas();
    if(item.receitaId && arr.some(r => r.receitaId === item.receitaId)){
      return false; // já existe
    }
    const salvo = {
      id: 'm_' + (item.id || Math.random().toString(36).slice(2)),
      receitaId: item.receitaId || null,
      titulo: item.titulo || 'Receita',
      foto: item.foto || '',
      duracaoMin: item.duracaoMin || null,
      porcoes: item.porcoes || null,
      tags: Array.isArray(item.tags) ? item.tags.slice(0) : [],
      dataSalvoISO: new Date().toISOString()
    };
    arr.push(salvo);
    setMinhas(arr);
    return true;
  }

  // Render
  function render(){
    skeleton.hidden = true;
    const itens = lsGet(LS_ITENS, []);
    cacheFiltradoOrdenado = aplicaFiltrosEOrdenacao(itens);

    if(cacheFiltradoOrdenado.length === 0){
      ul.innerHTML = '';
      vazio.hidden = false;
      btnCarregarMais.disabled = true;
      pintarCalendarioDias(itens);
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
        const salvo = jaEstaEmMinhas(it.receitaId);
        li.className = 'item' + (salvo ? ' salvo' : '');
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
        // 👁️ Ver
        const btnVer = document.createElement('button');
        btnVer.type='button'; btnVer.className='icon-btn btn-ver';
        btnVer.setAttribute('aria-label','Visualizar receita'); btnVer.title='Visualizar';
        btnVer.textContent='👁️';

        // ⭐ Favoritar (salva em Minhas Receitas)
        const btnFavAdd = document.createElement('button');
        btnFavAdd.type='button'; btnFavAdd.className='icon-btn btn-fav' + (salvo ? ' fav-ativo' : '');
        btnFavAdd.setAttribute('aria-label', salvo?'Salva em Minhas Receitas':'Salvar em Minhas Receitas');
        btnFavAdd.title = salvo ? 'Já em Minhas Receitas' : 'Adicionar a Minhas Receitas';
        btnFavAdd.textContent='⭐';

        // 🗑️ Lixo
        const btnDel = document.createElement('button');
        btnDel.type='button'; btnDel.className='icon-btn btn-trash';
        btnDel.setAttribute('aria-label','Remover do histórico'); btnDel.title='Remover';
        btnDel.textContent='🗑️';

        acoes.append(btnVer, btnFavAdd, btnDel);

        li.append(thumb, bloco, acoes);
        ul.appendChild(li);

        // Ações
        function abrir(){
          window.location.href = '../visualizar/index.html?receitaId=' + encodeURIComponent(it.receitaId||'');
        }
        li.addEventListener('click', abrir);
        li.addEventListener('keydown', (ev)=>{ if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); abrir(); }});
        btnVer.addEventListener('click', (ev)=>{ ev.stopPropagation(); abrir(); });

        btnFavAdd.addEventListener('click', (ev)=>{
          ev.stopPropagation();
          const adicionado = salvarEmMinhasReceitas(it);
          // Marca visualmente e atualiza label
          if(adicionado){
            li.classList.add('salvo');
            btnFavAdd.classList.add('fav-ativo');
            btnFavAdd.setAttribute('aria-label','Salva em Minhas Receitas');
            btnFavAdd.title = 'Já em Minhas Receitas';
            // também marca este item como favorito local
            const all = lsGet(LS_ITENS, []);
            const idx = all.findIndex(x=>x.id===it.id);
            if(idx>-1){ all[idx].favorito = true; lsSet(LS_ITENS, all); }
          }else{
            // já existia: apenas dá um feedback sutil
            btnFavAdd.animate([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}], {duration:200});
          }
        });

        btnDel.addEventListener('click', (ev)=>{
          ev.stopPropagation();
          removerItem(it.id);
        });
      });
    });

    const temMais = cacheFiltradoOrdenado.length > visiveis.length;
    btnCarregarMais.disabled = !temMais;

    // Atualiza destaques do calendário
    pintarCalendarioDias(lsGet(LS_ITENS, []));
  }

  function removerItem(id){
    const ok = confirm('Remover este item do histórico?');
    if(!ok) return;
    let itens = lsGet(LS_ITENS, []);
    itens = itens.filter(x=>x.id !== id);
    lsSet(LS_ITENS, itens);
    render();
  }

  // Controles
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
      // ao escolher período, limpamos dia específico
      filtros.dataSelecionada = null;
      lsSet(LS_FILTROS, filtros);
      resetPaginacao();
      render();
    });
  });

  // ===== Calendário =====
  let hoje = new Date();
  let mesAtual = hoje.getMonth();
  let anoAtual = hoje.getFullYear();

  function toYMDstr(y,m,d){ return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`; }

  function pintarCalendarioDias(itens){ gerarCalendario(mesAtual, anoAtual, itens); }

  function gerarCalendario(mes, ano, itensParam){
    diasContainer.innerHTML = "";
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    mesAno.textContent = `${new Date(ano, mes).toLocaleString('pt-BR', { month: 'long' })} ${ano}`;

    const itens = Array.isArray(itensParam) ? itensParam : lsGet(LS_ITENS, []);
    const diasComItens = new Set();
    itens.forEach(it=>{ try{ diasComItens.add(toYMD(new Date(it.dataISO))); }catch{} });

    // espaços antes do 1º dia
    for (let i = 0; i < primeiroDia; i++){
      const vazio = document.createElement('div');
      vazio.setAttribute('aria-hidden','true');
      diasContainer.appendChild(vazio);
    }

    for (let dia = 1; dia <= ultimoDia; dia++){
      const divDia = document.createElement('div');
      divDia.textContent = String(dia);
      const ymd = toYMDstr(ano, mes, dia);

      if(diasComItens.has(ymd)){
        divDia.classList.add('ativo');
        divDia.setAttribute('title','Há receitas neste dia');
      }
      if(filtros.dataSelecionada === ymd){
        divDia.classList.add('selecionado');
      }

      divDia.addEventListener('click', ()=>{
        filtros.dataSelecionada = (filtros.dataSelecionada === ymd) ? null : ymd;
        lsSet(LS_FILTROS, filtros);
        resetPaginacao();
        render();
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

  btnLimparDia?.addEventListener('click', ()=>{
    filtros.dataSelecionada = null;
    lsSet(LS_FILTROS, filtros);
    resetPaginacao();
    render();
  });

  // Paginação
  btnCarregarMais.addEventListener('click', ()=>{
    pagina++;
    render();
  });

  // Init
  function init(){
    seedIfEmpty(); // remova esta linha se não quiser exemplos locais
    syncControlesFromState();
    skeleton.hidden = false;
    gerarCalendario(mesAtual, anoAtual);
    setTimeout(()=>{ resetPaginacao(); render(); }, 200);
  }
  init();
})();
