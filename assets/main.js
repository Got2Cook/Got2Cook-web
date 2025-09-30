// Landing Page Got2Cook - JavaScript
(function() {
  'use strict';

  // Emojis clicáveis com animação de chuva
  const emojiButtons = document.querySelectorAll('.emoji-clickable');
  
  emojiButtons.forEach(btn => {
    btn.addEventListener('click', function(e) {
      const emoji = this;
      const emojiType = emoji.dataset.emoji;
      const emojiChar = emoji.textContent;
      
      // Adicionar classe de animação no botão
      emoji.classList.add('clicked');
      
      // Criar chuva de emojis
      createEmojiRain(emoji, emojiChar);
      
      // Vibração no mobile (se suportado)
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
      
      // Remover classe após animação
      setTimeout(() => {
        emoji.classList.remove('clicked');
      }, 500);
      
      // Log para tracking
      trackEvent('Emoji', 'click', emojiType);
      
      // Mostrar mensagem
      showEmojiMessage(emojiType, emoji);
    });
  });
  
  // Criar efeito de chuva de emojis
  function createEmojiRain(element, emojiChar) {
    const phoneScreen = element.parentElement;
    const screenRect = phoneScreen.getBoundingClientRect();
    const rainCount = 15; // Quantidade de emojis na chuva
    
    for (let i = 0; i < rainCount; i++) {
      const rainEmoji = document.createElement('div');
      rainEmoji.classList.add('emoji-rain');
      rainEmoji.textContent = emojiChar;
      
      // Posição inicial aleatória no topo da tela
      const startX = Math.random() * 100;
      rainEmoji.style.left = startX + '%';
      rainEmoji.style.top = '-50px';
      
      // Duração variada para efeito mais natural
      const duration = 1.5 + Math.random() * 1;
      rainEmoji.style.animationDuration = duration + 's';
      
      // Delay escalonado para efeito cascata
      rainEmoji.style.animationDelay = (i * 0.08) + 's';
      
      phoneScreen.appendChild(rainEmoji);
      
      // Remover após animação
      setTimeout(() => {
        rainEmoji.remove();
      }, (duration + (i * 0.08)) * 1000);
    }
  }
  
  // Mostrar mensagem temporária
  function showEmojiMessage(emojiType, element) {
    const messages = {
      'feliz': 'Que ótimo! Vamos preparar algo delicioso! 🎉',
      'apaixonado': 'Perfeito! Receitas românticas chegando! 💕',
      'animado': 'Show! Bora cozinhar algo incrível! 🚀'
    };
    
    const message = messages[emojiType] || 'Vamos cozinhar!';
    const mockupText = element.parentElement.querySelector('.mockup-text');
    
    if (mockupText) {
      const originalText = mockupText.textContent;
      mockupText.textContent = message;
      mockupText.style.color = 'var(--roxo)';
      mockupText.style.fontWeight = '700';
      mockupText.style.transform = 'scale(1.05)';
      mockupText.style.transition = 'all 0.3s ease';
      
      setTimeout(() => {
        mockupText.textContent = originalText;
        mockupText.style.color = '';
        mockupText.style.fontWeight = '';
        mockupText.style.transform = '';
      }, 2500);
    }
  }
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      
      // Ignorar se for apenas "#"
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      
      if (target) {
        const headerOffset = 80;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // Header com efeito ao scroll
  const header = document.querySelector('.header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;

    if (currentScroll > 100) {
      header.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
    } else {
      header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
    }

    lastScroll = currentScroll;
  });

  // Animação de entrada dos elementos ao scroll
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, observerOptions);

  // Elementos para animar
  const animateElements = document.querySelectorAll('.step, .feature, .pricing-card, .faq-item');
  
  animateElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });

  // FAQ - Expandir/Colapsar (caso queira adicionar funcionalidade)
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    
    if (question && answer) {
      // Opcional: adicionar comportamento de expandir/colapsar
      question.style.cursor = 'pointer';
      
      question.addEventListener('click', () => {
        const isExpanded = answer.style.display !== 'none';
        answer.style.display = isExpanded ? 'none' : 'block';
      });
    }
  });

  // Tracking de conversão (placeholder para Google Analytics, etc)
  function trackEvent(category, action, label) {
    // TODO: Implementar tracking real quando tiver GA/analytics configurado
    console.log('Event:', category, action, label);
    
    // Exemplo para Google Analytics (quando configurado):
    // if (typeof gtag !== 'undefined') {
    //   gtag('event', action, {
    //     'event_category': category,
    //     'event_label': label
    //   });
    // }
  }

  // Track cliques nos CTAs principais
  document.querySelectorAll('.btn-primary').forEach(btn => {
    btn.addEventListener('click', () => {
      trackEvent('CTA', 'click', btn.textContent.trim());
    });
  });

  // Track cliques no plano Premium
  const premiumBtn = document.querySelector('.pricing-card-premium .btn');
  if (premiumBtn) {
    premiumBtn.addEventListener('click', () => {
      trackEvent('Pricing', 'click', 'Premium Plan');
    });
  }

  // Mobile menu (caso adicione no futuro)
  // TODO: Implementar menu hamburger para mobile se necessário

  // Lazy loading de imagens (se adicionar imagens reais)
  if ('loading' in HTMLImageElement.prototype) {
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      img.src = img.dataset.src;
    });
  } else {
    // Fallback para navegadores que não suportam lazy loading nativo
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lazysizes/5.3.2/lazysizes.min.js';
    document.body.appendChild(script);
  }

  // Detectar se usuário está voltando do app
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('from') === 'app') {
    // Mostrar mensagem de boas-vindas ou algo similar
    console.log('Usuário retornou do app');
  }

  // Performance: Preload de recursos críticos do app
  const preloadLinks = [
    './app/login/index.html',
    './app/humor/index.html'
  ];

  preloadLinks.forEach(href => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = href;
    document.head.appendChild(link);
  });

  console.log('Landing page Got2Cook carregada com sucesso! 🍳');

  // Newsletter form
  const newsletterForm = document.getElementById('newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const email = this.querySelector('input[type="email"]').value;
      
      // TODO: Integrar com serviço de email marketing (Mailchimp, SendGrid, etc)
      console.log('Email inscrito:', email);
      
      // Feedback visual
      const btn = this.querySelector('button');
      const originalText = btn.textContent;
      btn.textContent = '✓ Inscrito!';
      btn.disabled = true;
      btn.style.background = '#4CAF50';
      
      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        btn.style.background = '';
        this.reset();
      }, 3000);
      
      trackEvent('Newsletter', 'subscribe', email);
    });
  }

})();
