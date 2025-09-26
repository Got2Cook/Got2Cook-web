// assets/main.js

// Ano automático no rodapé
document.getElementById('year').textContent = new Date().getFullYear();

// Scroll suave para âncoras internas (fallback para browsers sem CSS smooth)
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href');
    if(id.length>1){
      const el = document.querySelector(id);
      if(el){
        e.preventDefault();
        el.scrollIntoView({behavior:'smooth', block:'start'});
        // Move focus para acessibilidade
        setTimeout(()=>{ el.setAttribute('tabindex','-1'); el.focus(); }, 500);
      }
    }
  });
});

// Revelar elementos ao rolar (aplique .reveal nas seções/cards que quiser)
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
},{threshold:.12});

document.querySelectorAll('.section, .feature, .blog-card, .plano-card, .card')
  .forEach(el=>{
    el.classList.add('reveal');
    observer.observe(el);
  });
