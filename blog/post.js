// /blog/post.js
(function(){
'use strict';

/* ===== BARRA DE PROGRESSO ===== */
function initReadProgress(){
  const progressBar=document.querySelector('.read-progress');
  const percentage=document.querySelector('.progress-percentage');
  const fill=document.querySelector('.progress-bar-fill');
  
  if(!progressBar) return;
  
  function updateProgress(){
    const scrollHeight=document.documentElement.scrollHeight-window.innerHeight;
    const scrolled=window.scrollY;
    const progress=(scrolled/scrollHeight)*100;
    
    progressBar.style.width=Math.min(progress,100)+'%';
    
    if(fill){
      fill.style.height=Math.min(progress,100)+'%';
    }
    if(percentage){
      percentage.textContent=Math.round(progress)+'%';
    }
  }
  
  window.addEventListener('scroll',updateProgress,{passive:true});
  updateProgress();
}

/* ===== HEADER STICKY SHADOW ===== */
function initHeaderScroll(){
  const header=document.querySelector('.post-header');
  if(!header) return;
  
  window.addEventListener('scroll',()=>{
    if(window.scrollY>10){
      header.classList.add('scrolled');
    }else{
      header.classList.remove('scrolled');
    }
  },{passive:true});
}

/* ===== MENU MOBILE ===== */
function initMobileMenu(){
  const toggle=document.querySelector('.post-header-toggle');
  const nav=document.querySelector('.post-header-nav');
  
  if(!toggle||!nav) return;
  
  toggle.addEventListener('click',()=>{
    toggle.classList.toggle('active');
    nav.classList.toggle('active');
  });
  
  nav.querySelectorAll('a').forEach(link=>{
    link.addEventListener('click',()=>{
      toggle.classList.remove('active');
      nav.classList.remove('active');
    });
  });
}

/* ===== SHARE BUTTONS ===== */
function initShare(){
  const shareButtons=document.querySelectorAll('.share-sidebar-btn');
  const pageUrl=encodeURIComponent(window.location.href);
  const pageTitle=encodeURIComponent(document.title);
  
  shareButtons.forEach(btn=>{
    btn.addEventListener('click',function(){
      const platform=this.dataset.platform;
      let shareUrl='';
      
      if(platform==='facebook'){
        shareUrl=`https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
      }else if(platform==='twitter'){
        shareUrl=`https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
      }else if(platform==='whatsapp'){
        shareUrl=`https://wa.me/?text=${pageTitle}%20${pageUrl}`;
      }else if(platform==='copy'){
        navigator.clipboard.writeText(window.location.href).then(()=>{
          showToast('Link copiado! ✓');
        }).catch(()=>{
          showToast('Erro ao copiar link');
        });
        return;
      }
      
      if(shareUrl){
        window.open(shareUrl,'_blank','width=600,height=400');
      }
    });
  });
}

/* ===== SMOOTH SCROLL PARA ÂNCORAS ===== */
function initSmoothScroll(){
  document.querySelectorAll('a[href^="#"]').forEach(link=>{
    link.addEventListener('click',function(e){
      const href=this.getAttribute('href');
      if(href==='#') return;
      
      const target=document.querySelector(href);
      if(!target) return;
      
      e.preventDefault();
      
      const headerHeight=document.querySelector('.post-header')?.offsetHeight||0;
      const targetPos=target.getBoundingClientRect().top+window.scrollY-headerHeight-20;
      
      window.scrollTo({
        top:targetPos,
        behavior:'smooth'
      });
    });
  });
}

/* ===== TOAST ===== */
function showToast(message){
  const existing=document.querySelector('.toast');
  if(existing) existing.remove();
  
  const toast=document.createElement('div');
  toast.className='toast';
  toast.textContent=message;
  toast.style.cssText=`
    position:fixed;
    bottom:32px;
    right:32px;
    background:linear-gradient(135deg,var(--roxo2),var(--roxo));
    color:#fff;
    padding:16px 24px;
    border-radius:12px;
    box-shadow:0 8px 24px rgba(0,0,0,.2);
    font-weight:600;
    font-size:15px;
    z-index:9999;
    animation:toastIn .3s ease;
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(()=>{
    toast.style.animation='toastOut .3s ease';
    setTimeout(()=>toast.remove(),300);
  },3000);
}

/* ===== NEWSLETTER FORM ===== */
function initNewsletter(){
  const form=document.querySelector('.footer-newsletter form');
  if(!form) return;
  
  form.addEventListener('submit',e=>{
    e.preventDefault();
    const email=form.querySelector('input[type="email"]').value;
    
    if(!email||!email.includes('@')){
      showToast('Por favor, insira um email válido');
      return;
    }
    
    showToast('Obrigado por se inscrever! 💚');
    form.reset();
  });
}

/* ===== LAZY LOADING ===== */
function initLazyLoad(){
  const images=document.querySelectorAll('img[loading="lazy"]');
  
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          const img=entry.target;
          if(img.dataset.src){
            img.src=img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    });
    
    images.forEach(img=>observer.observe(img));
  }
}

/* ===== INIT ===== */
function init(){
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',init);
    return;
  }
  
  initReadProgress();
  initHeaderScroll();
  initMobileMenu();
  initShare();
  initSmoothScroll();
  initNewsletter();
  initLazyLoad();
  
  if(!document.getElementById('toast-styles')){
    const style=document.createElement('style');
    style.id='toast-styles';
    style.textContent=`
      @keyframes toastIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      @keyframes toastOut{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(20px)}}
    `;
    document.head.appendChild(style);
  }
}

init();

})();
```
