// /app/plano/plano.js
(function(){
  const STORAGE_KEY = 'got2cook_plano';

  const qs = (sel, el=document)=>el.querySelector(sel);
  const qsa = (sel, el=document)=>[...el.querySelectorAll(sel)];

  const meuPlanoIcone = qs('#meuPlanoIcone');
  const meuPlanoNome  = qs('#meuPlanoNome');
  const meuPlanoStatus= qs('#meuPlanoStatus');
  const btnConfirmar  = qs('#btnConfirmar');

  const radios = qsa('.radio-plano');
  const btnAlterar = qs('#btnAlterar');
  const btnCancelar= qs('#btnCancelar');
  const btnHistorico=qs('#btnHistorico');

  // Rodapé (navegação)
  const btnVoltar = qs('#btnVoltar');
  const btnLogo = qs('#btnLogo');
  const btnGeladeira = qs('#btnGeladeira');

  btnVoltar.addEventListener('click', ()=>{ window.location.href = '../config/index.html'; });
  btnLogo.addEventListener('click', ()=>{ window.location.href = '../minhas-receitas/index.html'; });
  btnGeladeira.addEventListener('click', ()=>{ window.location.href = '../geladeira/index.html'; });

  // Helpers
  function addDays(baseDate, days){
    const d = new Date(baseDate);
    d.setDate(d.getDate()+days);
    return d;
  }
  function formatBR(d){
    const dd = String(d.getDate()).padStart(2,'0');
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  function setPlanoAtualUI(nomePlano){
    meuPlanoNome.textContent = nomePlano;
    meuPlanoIcone.textContent = (nomePlano === 'Premium') ? '👑' : '🥗';

    const renov = addDays(new Date(), 30);
    meuPlanoStatus.textContent = `Válido até ${formatBR(renov)}`;
    meuPlanoStatus.setAttribute('aria-live','polite');

    // CTA texto
    btnConfirmar.textContent = (nomePlano === 'Premium') ? 'Continuar' : 'Assinar Premium';
  }
  function salvarPlano(nomePlano){
    localStorage.setItem(STORAGE_KEY, nomePlano);
    setPlanoAtualUI(nomePlano);
  }
  function carregarPlano(){
    return localStorage.getItem(STORAGE_KEY) || 'Gratuito';
  }
  function selecionarRadiosDePlano(plano){
    // Marca o grupo correto (mobile/desktop)
    qsa(`.radio-plano[value="${plano}"]`).forEach(r=>{ r.checked = true; });
    // Destaques visuais acontecem via :has(input:checked) no CSS
  }
  function planoSelecionadoAtual(){
    const r = radios.find(x=>x.checked);
    return r ? r.value : null;
  }

  // Eventos de seleção (tanto mobile quanto desktop)
  radios.forEach(radio=>{
    // clique na label inteira
    const label = radio.closest('label');
    if(label){
      label.addEventListener('click', (e)=>{
        // Permite seleção via clique na área do card/coluna
        radio.checked = true;
        atualizarCTA();
      });
      label.addEventListener('keydown',(e)=>{
        if(e.key==='Enter' || e.key===' '){
          e.preventDefault();
          radio.checked = true;
          atualizarCTA();
        }
      });
    }
    // mudança direta no radio
    radio.addEventListener('change', atualizarCTA);
  });

  function atualizarCTA(){
    const plano = planoSelecionadoAtual() || carregarPlano();
    btnConfirmar.textContent = (plano === 'Premium') ? 'Continuar' : 'Assinar Premium';
  }

  // CTA confirma (salva no localStorage e atualiza "meu plano")
  btnConfirmar.addEventListener('click', ()=>{
    const plano = planoSelecionadoAtual() || carregarPlano();

    // Se usuário está no Gratuito e clica "Assinar Premium", força Premium
    const alvo = (btnConfirmar.textContent.includes('Assinar')) ? 'Premium' : plano;

    salvarPlano(alvo);

    // Feedback simples
    alert(`Plano definido como: ${alvo}`);
    selecionarRadiosDePlano(alvo);
    atualizarCTA();
  });

  // Botões extras
  btnAlterar.addEventListener('click', ()=>alert('Tela de alteração de plano (em breve).'));
  btnCancelar.addEventListener('click', ()=>alert('Cancelar assinatura (simulação).'));
  btnHistorico.addEventListener('click', ()=>alert('Histórico de pagamentos (simulação).'));

  // Inicialização
  const planoInicial = carregarPlano();
  setPlanoAtualUI(planoInicial);
  selecionarRadiosDePlano(planoInicial);
  atualizarCTA();
})();

// /app/plano/plano.js — OPCIONAL: focar acessibilidade nas vantagens (cole ao final)
document.querySelectorAll('.vant-item').forEach(item=>{
  // permite foco pelo teclado no bloco todo
  item.setAttribute('tabindex','0');
});
