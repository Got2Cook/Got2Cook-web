// /blog/post.js
(function(){
'use strict';

/* ===== BARRA DE PROGRESSO (CORRIGIDA) ===== */
function initReadProgress(){
  const progressBar=document.querySelector('.read-progress');
  const percentage=document.querySelector('.progress-percentage');
  const fill=document.querySelector('.progress-bar-fill');
  
  if(!progressBar) return;
  
  function updateProgress(){
    const doc=document.documentElement;
    const scrollTop=window.scrollY;
    const docHeight=doc.scrollHeight-window.innerHeight;
    const scrolled=docHeight>0?(scrollTop/docHeight)*100:0;
    
    progressBar.style.width=Math.min(Math.max(scrolled,0),100)+'%';
    
    if(fill){
      fill.style.height=Math.min(Math.max(scrolled,0),100)+'%';
    }
    if(percentage){
      percentage.textContent=Math.round(Math.min(Math.max(scrolled,0),100))+'%';
    }
  }
  
  window.addEventListener('scroll',updateProgress,{passive:true});
  window.addEventListener('resize',updateProgress,{passive:true});
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
  
  document.addEventListener('click',(e)=>{
    if(!nav.contains(e.target)&&!toggle.contains(e.target)){
      nav.classList.remove('active');
      toggle.classList.remove('active');
    }
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
      
      if(history.pushState){
        history.pushState(null,null,href);
      }
    });
  });
}

/* ===== TOAST NOTIFICATIONS ===== */
function showToast(message){
  const existing=document.querySelector('.toast');
  if(existing) existing.remove();
  
  const toast=document.createElement('div');
  toast.className='toast';
  toast.setAttribute('role','alert');
  toast.setAttribute('aria-live','polite');
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
    max-width:300px;
    word-wrap:break-word;
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
    const email=form.querySelector('input[type="email"]').value.trim();
    
    if(!email){
      showToast('Por favor, insira um email');
      return;
    }
    
    if(!email.includes('@')||!email.includes('.')){
      showToast('Email inválido');
      return;
    }
    
    showToast('Obrigado por se inscrever! 💚');
    form.reset();
  });
}

/* ===== LAZY LOADING DE IMAGENS ===== */
function initLazyLoad(){
  const images=document.querySelectorAll('img[loading="lazy"]');
  
  if('IntersectionObserver' in window){
    const imageObserver=new IntersectionObserver((entries,observer)=>{
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
    },{rootMargin:'50px'});
    
    images.forEach(img=>imageObserver.observe(img));
  }
}

/* ===== TABLE OF CONTENTS HIGHLIGHT ===== */
function initTocHighlight(){
  const headings=Array.from(document.querySelectorAll('.post-content h2[id], .post-content h3[id]'));
  
  if(headings.length===0) return;
  
  function updateActiveHeading(){
    const scrollPos=window.scrollY+100;
    
    let currentHeading=null;
    for(let heading of headings){
      if(heading.offsetTop<=scrollPos){
        currentHeading=heading;
      }else{
        break;
      }
    }
    
    headings.forEach(h=>{
      h.style.color=h===currentHeading?'var(--roxo2)':'var(--roxo2)';
    });
  }
  
  window.addEventListener('scroll',updateActiveHeading,{passive:true});
}

/* ===== SCROLL TO TOP BUTTON ===== */
function initScrollToTop(){
  const scrollBtn=document.createElement('button');
  scrollBtn.className='scroll-to-top';
  scrollBtn.innerHTML='↑';
  scrollBtn.setAttribute('aria-label','Voltar ao topo');
  scrollBtn.style.cssText=`
    position:fixed;
    bottom:32px;
    right:32px;
    width:50px;
    height:50px;
    background:linear-gradient(135deg,var(--verde),var(--verde-dark));
    color:#fff;
    border:none;
    border-radius:50%;
    font-size:24px;
    font-weight:700;
    cursor:pointer;
    opacity:0;
    visibility:hidden;
    transition:all .3s;
    z-index:49;
    box-shadow:0 4px 16px rgba(0,0,0,.15);
  `;
  
  document.body.appendChild(scrollBtn);
  
  window.addEventListener('scroll',()=>{
    if(window.scrollY>300){
      scrollBtn.style.opacity='1';
      scrollBtn.style.visibility='visible';
    }else{
      scrollBtn.style.opacity='0';
      scrollBtn.style.visibility='hidden';
    }
  },{passive:true});
  
  scrollBtn.addEventListener('click',()=>{
    window.scrollTo({
      top:0,
      behavior:'smooth'
    });
  });
}

/* ===== IMAGE ZOOM ===== */
function initImageZoom(){
  const figures=document.querySelectorAll('.post-content .figure');
  
  figures.forEach(figure=>{
    figure.addEventListener('click',function(){
      const img=this.querySelector('img');
      if(!img) return;
      
      const modal=document.createElement('div');
      modal.className='image-modal';
      modal.style.cssText=`
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.9);
        display:flex;
        align-items:center;
        justify-content:center;
        z-index:10000;
        animation:fadeIn .3s;
      `;
      
      const imgClone=img.cloneNode();
      imgClone.style.cssText=`
        max-width:90vw;
        max-height:90vh;
        object-fit:contain;
        border-radius:8px;
        cursor:pointer;
      `;
      
      modal.appendChild(imgClone);
      
      modal.addEventListener('click',()=>{
        modal.style.animation='fadeOut .3s';
        setTimeout(()=>modal.remove(),300);
      });
      
      document.body.appendChild(modal);
    });
    figure.style.cursor='pointer';
  });
}

/* ===== ANALYTICS TRACKING (STUB) ===== */
function trackEvent(event,data={}){
  if(window.gtag){
    window.gtag('event',event,data);
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
  initTocHighlight();
  initScrollToTop();
  initImageZoom();
  
  addAnimationStyles();
  
  trackEvent('page_view',{
    page_title:document.title,
    page_path:window.location.pathname
  });
  
  console.log('✓ Got2Cook Blog Post - Scripts inicializados com sucesso');
}

/* ===== ADICIONAR ESTILOS DE ANIMAÇÃO ===== */
function addAnimationStyles(){
  if(!document.getElementById('post-animations')){
    const style=document.createElement('style');
    style.id='post-animations';
    style.textContent=`
      @keyframes toastIn{
        from{opacity:0;transform:translateY(20px)}
        to{opacity:1;transform:translateY(0)}
      }
      @keyframes toastOut{
        from{opacity:1;transform:translateY(0)}
        to{opacity:0;transform:translateY(20px)}
      }
      @keyframes fadeIn{
        from{opacity:0}
        to{opacity:1}
      }
      @keyframes fadeOut{
        from{opacity:1}
        to{opacity:0}
      }
    `;
    document.head.appendChild(style);
  }
}

init();

})();
