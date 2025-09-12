/* Histórico – sem paginação (“Carregar mais” removido).
   Datas como texto, itens mais espaçados. Calendário com folha direcional. */
(function(){
  "use strict";

  // ----- Seletores
  const ul = document.getElementById('listaHistorico');
  const skeleton = document.getElementById('skeleton');
  const vazio = document.getElementById('estadoVazio');

  const inpBusca = document.getElementById('inpBusca');
  const btnLimparBusca = document.getElementById('btnLimparBusca');
  const chipsPeriodo = Array.from(document.querySelectorAll('.chip'));

  // Calendário
  const calPage = document.getElementById('calPage');    // base (novo mês)
  const tearStage = document.getElementById('tearStage'); // palco da folha (clone)
  const diasContainer = document.getElementById('dias');
  const mesAno = document.getElementById('mesAno');
  const btnMesAnterior = document.getElementById('mesAnterior');
  const btnMesProximo = document.getElementById('mesProximo');
  const btnLimparDia = document.getElementById('btnLimparDia');

  // Rodapé (rotas placeholder)
  document.getElementById('btnVoltar')?.addEventListener('click', ()=> window.location.href = '../home/index.html');
  document.getElementById('btnLogo')?.addEventListener('click',  ()=> window.location.href = '../minhas-receitas/index.html');
  document.getElementById('btnGeladeira')?.addEventListener('click', ()=> window.location.href = '../geladeira/index.html');

  // ----- LocalStorage
  const LS_ITENS   = 'got2cook_historico_itens';
  const LS_FILTROS = 'got2cook_historico_filtros';
  const LS_MINHAS  = 'got2cook_minhas_receitas';

  const lsGet = (k,f)=>{ try{ return JSON.parse(localStorage.getItem(k)) ?? f; }catch{ return f; } };
  const lsSet = (k,v)=> localStorage.setItem(k, JSON.stringify(v));

  // Seed exemplo se vazio (local)
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
  const toYMD = (date)=>{
    const y = date.getFullYear();
    const m = String(date.getMonth()+1).padStart(2,'0');
    const d = String(date.getDate()).padStart(2,'0');
    return `${y}-${m}-${d}`;
  };
  const isSameDayISO = (iso, ymd)=> toYMD(new Date(iso)) === ymd;

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

  // Filtra + ordena (recente → antigo)
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

  // ====== MINHAS RECEITAS ======
  const getMinhas = ()=> lsGet(LS_MINHAS, []);
  const setMinhas = (arr)=> lsSet(LS_MINHAS, arr);
  const jaEstaEmMinhas = (item)=>{
    const arr = getMinhas();
    return !!arr.find(r => (item.receitaId && r.receitaId===item.receitaId) || (item.id && r.originId===item.id));
  };
  const adicionarEmMinhas = (item)=>{
    if(jaEstaEmMinhas(item)) return false;
    const arr = getMinhas();
    arr.push({
      id: 'm_' + (item.id || Math.random().toString(36).slice(2)),
      originId: item.id || null,
      receitaId: item.receitaId || null,
      titulo: item.titulo || 'Receita',
      foto: item.foto || '',
      duracaoMin: item.duracaoMin || null,
      porcoes: item.porcoes || null,
      tags: Array.isArray(item.tags) ? item.tags.slice(0) : [],
      dataSalvoISO: new Date().toISOString()
    });
    setMinhas(arr);
    return true;
  };
  const removerDeMinhas = (item)=>{
    let arr = getMinhas();
    const before = arr.length;
    arr = arr.filter(r => !((item.receitaId && r.receitaId===item.receitaId) || (item.id && r.originId===item.id)));
    setMinhas(arr);
    return arr.length !== before;
  };

  // Micro interação
  const pulse = (el)=>{ el.classList.add('pulse'); el.addEventListener('animationend', ()=> el.classList.remove('pulse'), {once:true}); };

  // Render (SEM paginação)
  function render(){
    skeleton.hidden = true;
    const itens = lsGet(LS_ITENS, []);
    const filtrado = aplicaFiltrosEOrdenacao(itens);

    if(filtrado.length === 0){
      ul.innerHTML = '';
      vazio.hidden = false;
      pintarCalendarioDias(itens);
      return;
    }
    vazio.hidden = true;

    const grupos = agrupaPorData(filtrado);
    ul.innerHTML = '';

    let idxAnim = 0;
    grupos.forEach((lista, tituloData)=>{
      const liData = document.createElement('li');
      liData.className = 'li-data';
      liData.textContent = tituloData; // apenas texto
      ul.appendChild(liData);

      lista.forEach(it=>{
        const salvo = jaEstaEmMinhas(it);

        const li = document.createElement('li');
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
        const btnVer = document.createElement('button');
        btnVer.type='button'; btnVer.className='icon-btn btn-ver';
        btnVer.setAttribute('aria-label','Visualizar receita'); btnVer.title='Visualizar';
        btnVer.textContent='👁️';

        const btnHeart = document.createElement('button');
        btnHeart.type='button'; btnHeart.className='icon-btn btn-heart';
        btnHeart.setAttribute('aria-pressed', salvo ? 'true' : 'false');
        btnHeart.classList.toggle('heart-ativo', !!salvo);
        btnHeart.title = salvo ? 'Remover de Minhas Receitas' : 'Adicionar a Minhas Receitas';
        btnHeart.textContent = salvo ? '❤️' : '🤍';

        const btnDel = document.createElement('button');
        btnDel.type='button'; btnDel.className='icon-btn btn-trash';
        btnDel.setAttribute('aria-label','Remover do histórico'); btnDel.title='Remover';
        btnDel.textContent='🗑️';

        acoes.append(btnVer, btnHeart, btnDel);
        li.append(thumb, bloco, acoes);
        ul.appendChild(li);

        // animação de entrada em cascata
        requestAnimationFrame(()=> {
          setTimeout(()=> li.classList.add('aparecer'), 30 * (idxAnim++));
        });

        // Ações
        function abrir(){
          window.location.href = '../visualizar/index.html?receitaId=' + encodeURIComponent(it.receitaId||'');
        }
        li.addEventListener('click', abrir);
        li.addEventListener('keydown', (ev)=>{ if(ev.key==='Enter'||ev.key===' '){ ev.preventDefault(); abrir(); }});
        btnVer.addEventListener('click', (ev)=>{ ev.stopPropagation(); pulse(btnVer); abrir(); });

        btnHeart.addEventListener('click', (ev)=>{
          ev.stopPropagation(); pulse(btnHeart);
          const ja = btnHeart.getAttribute('aria-pressed') === 'true';
          if(ja){
            if(removerDeMinhas(it)){
              btnHeart.setAttribute('aria-pressed','false');
              btnHeart.classList.remove('heart-ativo');
              btnHeart.textContent = '🤍';
              btnHeart.title = 'Adicionar a Minhas Receitas';
              li.classList.remove('salvo');
              const all = lsGet(LS_ITENS, []);
              const idx = all.findIndex(x=>x.id===it.id);
              if(idx>-1){ all[idx].favorito = false; lsSet(LS_ITENS, all); }
            }
          }else{
            if(adicionarEmMinhas(it)){
              btnHeart.setAttribute('aria-pressed','true');
              btnHeart.classList.add('heart-ativo');
              btnHeart.textContent = '❤️';
              btnHeart.title = 'Remover de Minhas Receitas';
              li.classList.add('salvo');
              const all = lsGet(LS_ITENS, []);
              const idx = all.findIndex(x=>x.id===it.id);
              if(idx>-1){ all[idx].favorito = true; lsSet(LS_ITENS, all); }
            }
          }
        });

        btnDel.addEventListener('click', (ev)=>{
          ev.stopPropagation(); pulse(btnDel);
          removerItem(it.id);
        });
      });
    });

    // Destaques do calendário
    pintarCalendarioDias(lsGet(LS_ITENS, []));
  }

  function removerItem(id){
    if(!confirm('Remover este item do histórico?')) return;
    let itens = lsGet(LS_ITENS, []);
    itens = itens.filter(x=>x.id !== id);
    lsSet(LS_ITENS, itens);
    render();
  }

  // Controles
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
      filtros.dataSelecionada = null;
      lsSet(LS_FILTROS, filtros);
      render();
    });
  });

  // ===== Calendário =====
  let hoje = new Date();
  let mesAtual = hoje.getMonth();
  let anoAtual = hoje.getFullYear();

  const toYMDstr = (y,m,d)=> `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

  function pintarCalendarioDias(itens){ gerarCalendario(mesAtual, anoAtual, itens); }

  function gerarCalendario(mes, ano, itensParam){
    diasContainer.innerHTML = "";
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    mesAno.textContent = `${new Date(ano, mes).toLocaleString('pt-BR', { month: 'long' })} ${ano}`;

    const itens = Array.isArray(itensParam) ? itensParam : lsGet(LS_ITENS, []);
    const diasComItens = new Set();
    itens.forEach(it=>{ try{ diasComItens.add(toYMD(new Date(it.dataISO))); }catch{} });

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
      if(filtros.dataSelecionada === ymd){ divDia.classList.add('selecionado'); }

      divDia.addEventListener('click', ()=>{
        divDia.animate([{transform:'scale(1)'},{transform:'scale(.96)'},{transform:'scale(1)'}], {duration:120, easing:'ease-out'});
        filtros.dataSelecionada = (filtros.dataSelecionada === ymd) ? null : ymd;
        lsSet(LS_FILTROS, filtros);
        render();
        document.getElementById('listaHistorico')?.scrollIntoView({behavior:'smooth', block:'start'});
      });

      diasContainer.appendChild(divDia);
    }
  }

  // ---- Folha direcional (sobe/ desce) com novo mês já visível
  let mesAnimando = false;
  function removerIdsDoClone(el){ el.removeAttribute('id'); el.querySelectorAll('[id]').forEach(n=> n.removeAttribute('id')); }
  function criarFolhaClone(direcao){
    const clone = calPage.cloneNode(true);
    removerIdsDoClone(clone);
    clone.classList.add('tear-page', direcao === 'next' ? 'anim-up' : 'anim-down');
    return clone;
  }
  function limparFolha(){ tearStage.innerHTML = ''; }

  function changeMonthInstant(direcao){
    if(direcao === 'prev'){ mesAtual--; if(mesAtual<0){ mesAtual=11; anoAtual--; } }
    else { mesAtual++; if(mesAtual>11){ mesAtual=0; anoAtual++; } }
    gerarCalendario(mesAtual, anoAtual); // novo mês já visível
  }

  function tearAndChangeMonth(direcao){
    if(mesAnimando) return;
    mesAnimando = true;

    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){
      changeMonthInstant(direcao);
      mesAnimando = false; return;
    }

    const folha = criarFolhaClone(direcao);
    tearStage.appendChild(folha);
    changeMonthInstant(direcao);

    folha.addEventListener('animationend', ()=>{
      limparFolha(); mesAnimando = false;
    }, {once:true});
  }

  btnMesAnterior?.addEventListener('click', ()=> tearAndChangeMonth('prev'));
  btnMesProximo?.addEventListener('click', ()=> tearAndChangeMonth('next'));

  btnLimparDia?.addEventListener('click', ()=>{
    pulse(btnLimparDia);
    filtros.dataSelecionada = null; lsSet(LS_FILTROS, filtros);
    render();
  });

  // Init
  function init(){
    seedIfEmpty();
    syncControlesFromState();
    skeleton.hidden = false;
    gerarCalendario(mesAtual, anoAtual);
    setTimeout(render, 150);
  }
  init();
})();
