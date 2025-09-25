// /app/gerenciar-plano/plano.js
(function(){
  'use strict';
  
  // Chave padrão do projeto conforme especificação
  const STORAGE_KEY = 'got2cook_premium_status';

  const $ = (s,el=document) => el.querySelector(s);
  const $$ = (s,el=document) => [...el.querySelectorAll(s)];

  // Elements
  const meuPlanoIcone = $('#meuPlanoIcone');
  const meuPlanoNome = $('#meuPlanoNome');
  const meuPlanoStatus = $('#meuPlanoStatus');
  const btnCancelar = $('#btnCancelar');
  const btnHistorico = $('#btnHistorico');
  const btnConfirmar = $('#btnConfirmar');
  const ctaWrap = $('#ctaWrap');

  // Modal
  const modal = $('#modal');
  const modalTitle = $('#modalTitle');
  const modalDesc = $('#modalDesc');
  const modalOk = $('#modalOk');
  const modalCancel = $('#modalCancel');
  const modalClose = $('#modalClose');

  // Navegação rodapé
  $('#btnVoltar').addEventListener('click', () => location.href = '../config/index.html');
  $('#btnLogo').addEventListener('click', () => location.href = '../minhas-receitas/index.html');
  $('#btnGeladeira').addEventListener('click', () => location.href = '../minha-geladeira/index.html');

  // Helpers de data
  function addDays(date, days){ 
    const d = new Date(date); 
    d.setDate(d.getDate() + days); 
    return d; 
  }
  
  function formatBR(date){ 
    const dd = String(date.getDate()).padStart(2,'0');
    const mm = String(date.getMonth() + 1).padStart(2,'0');
    return `${dd}/${mm}/${date.getFullYear()}`;
  }

  // Gestão de status Premium seguindo especificação do projeto
  function getPremiumStatus(){
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Criar status padrão conforme especificação
        const defaultStatus = {
          isPremium: false,
          plano: 'free',
          desde: null
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultStatus));
        return defaultStatus;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.warn('Erro ao ler premium status:', e);
      return { isPremium: false, plano: 'free', desde: null };
    }
  }

  function setPremiumStatus(status){
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
    } catch (e) {
      console.warn('Erro ao salvar premium status:', e);
    }
  }

  // Modal helper
  let lastFocusEl = null;
  
  function openModal({title, desc, confirm = false, warn = false, onOk = null}){
    lastFocusEl = document.activeElement;
    modalTitle.textContent = title || 'Aviso';
    modalDesc.textContent = desc || '';
    modal.classList.add('is-open');
    modal.classList.toggle('modal--warn', !!warn);
    modal.setAttribute('aria-hidden', 'false');

    // Mostrar/esconder botão Cancelar baseado no tipo
    modalCancel.style.display = confirm ? '' : 'none';
    modalOk.textContent = confirm ? 'Confirmar' : 'OK';

    function closeModal(){
      modal.classList.remove('is-open', 'modal--warn');
      modal.setAttribute('aria-hidden', 'true');
      modalOk.onclick = null;
      modalCancel.onclick = null;
      
      // Re-sync UI ao fechar modal
      updateUI();
      
      if(lastFocusEl) {
        lastFocusEl.focus({preventScroll: true});
      }
    }

    modalOk.onclick = () => {
      if(onOk) onOk();
      closeModal();
    };
    modalCancel.onclick = closeModal;
    modalClose.onclick = closeModal;
    
    // Fechar ao clicar no backdrop
    const handleBackdropClick = (e) => {
      if(e.target.dataset.close) {
        closeModal();
      }
    };
    modal.addEventListener('click', handleBackdropClick, {once: true});

    // Foco inicial
    modalOk.focus({preventScroll: true});
  }

  // Atualização central da UI
  function updateUI(){
    const status = getPremiumStatus();
    const isPremium = status.isPremium;
    
    // Header do plano atual
    meuPlanoNome.textContent = isPremium ? 'Premium' : 'Gratuito';
    meuPlanoIcone.textContent = isPremium ? '👑' : '🥗';
    
    // Data de validade
    if(isPremium && status.desde) {
      const validUntil = addDays(new Date(status.desde), 30);
      meuPlanoStatus.textContent = `Válido até ${formatBR(validUntil)}`;
    } else {
      meuPlanoStatus.textContent = 'Válido até —';
    }

    // CTA: só aparece no FREE com animação de pulso
    if(isPremium) {
      ctaWrap.classList.add('hidden');
    } else {
      ctaWrap.classList.remove('hidden');
      btnConfirmar.textContent = 'Assinar Premium';
    }

    // Botões de ação
    btnCancelar.style.display = isPremium ? '' : 'none';
  }

  // Handlers dos cards
  $$('.card--click').forEach(card => {
    card.addEventListener('click', () => {
      const targetPlan = card.dataset.plano; // 'free' ou 'premium'
      const currentStatus = getPremiumStatus();
      
      if(targetPlan === 'premium') {
        // Card Premium: direcionar para CTA
        if(!currentStatus.isPremium) {
          ctaWrap.classList.remove('hidden');
          btnConfirmar.focus({preventScroll: false});
          // Scroll suave até o CTA
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
          });
        } else {
          // Já é Premium
          openModal({
            title: 'Plano Premium Ativo',
            desc: 'Você já possui o plano Premium ativo.'
          });
        }
        return;
      }

      // Card Gratuito
      if(targetPlan === 'free') {
        if(!currentStatus.isPremium) {
          openModal({
            title: 'Plano Gratuito',
            desc: 'O plano Gratuito já está ativo.'
          });
        } else {
          openModal({
            title: 'Alterar para Gratuito?',
            desc: 'Você possui o Premium ativo. Deseja realmente alterar para o plano Gratuito?',
            confirm: true,
            warn: true,
            onOk: () => {
              setPremiumStatus({
                isPremium: false,
                plano: 'free',
                desde: null
              });
              updateUI();
            }
          });
        }
      }
    });

    // Acessibilidade - Enter/Space
    card.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });

  // Cancelar assinatura
  btnCancelar.addEventListener('click', () => {
    const status = getPremiumStatus();
    
    if(!status.isPremium) {
      openModal({
        title: 'Sem Assinatura Ativa',
        desc: 'Você não possui uma assinatura Premium ativa no momento.'
      });
      return;
    }

    openModal({
      title: 'Cancelar Assinatura',
      desc: 'Tem certeza de que deseja cancelar o Premium? Você retornará ao plano Gratuito.',
      confirm: true,
      warn: true,
      onOk: () => {
        setPremiumStatus({
          isPremium: false,
          plano: 'free',
          desde: null
        });
        updateUI();
      }
    });
  });

  // Histórico de pagamentos
  btnHistorico.addEventListener('click', () => {
    // Futura página de histórico
    openModal({
      title: 'Histórico de Pagamentos',
      desc: 'Funcionalidade em desenvolvimento. Em breve você poderá consultar todo seu histórico de pagamentos.'
    });
  });

  // CTA - Assinar Premium
  btnConfirmar.addEventListener('click', () => {
    const now = new Date().toISOString();
    
    setPremiumStatus({
      isPremium: true,
      plano: 'premium',
      desde: now
    });

    openModal({
      title: 'Bem-vindo ao Premium! ✨',
      desc: 'Parabéns! Sua assinatura Premium foi ativada com sucesso. Aproveite todos os benefícios exclusivos!'
    });
  });

  // Migração de dados legados (compatibilidade)
  function migrateLegacyData(){
    const oldKey = 'got2cook_plano';
    const oldValue = localStorage.getItem(oldKey);
    
    if(oldValue && !localStorage.getItem(STORAGE_KEY)) {
      const isPremium = (oldValue === 'Premium');
      setPremiumStatus({
        isPremium,
        plano: isPremium ? 'premium' : 'free',
        desde: isPremium ? new Date().toISOString() : null
      });
      
      // Remover chave antiga
      localStorage.removeItem(oldKey);
      console.log('Migração de dados concluída:', oldValue, '→', getPremiumStatus());
    }
  }

  // Inicialização
  function init(){
    migrateLegacyData();
    updateUI();
    
    // Validar integridade dos dados
    const status = getPremiumStatus();
    if(status.isPremium && !status.desde) {
      // Corrigir dados inconsistentes
      setPremiumStatus({
        ...status,
        desde: new Date().toISOString()
      });
    }
  }

  // Start
  init();

})();
