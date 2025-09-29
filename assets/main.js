// Ano no rodapé
document.getElementById('year').textContent = new Date().getFullYear();

// Scroll suave para âncoras + foco acessível
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click', e=>{
    const id = a.getAttribute('href');
    if(id.length>1){
      const el = document.querySelector(id);
      if(el){
        e.preventDefault();
        el.scrollIntoView({behavior:'smooth', block:'start'});
        setTimeout(()=>{ el.setAttribute('tabindex','-1'); el.focus(); }, 400);
      }
    }
  });
});

// Animação "reveal" ao rolar
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting){
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
},{threshold:.12});

document.querySelectorAll('.section, .feature, .blog-card, .card, .testimonial, .value')
  .forEach(el=>{
    el.classList.add('reveal');
    observer.observe(el);
  });

// Newsletter (mock)
const form = document.getElementById('form-newsletter');
if(form){
  form.addEventListener('submit', (e)=>{
    e.preventDefault();
    const email = (document.getElementById('news-email')?.value || '').trim();
    const fb = document.getElementById('news-feedback');
    if(!email || !/^\S+@\S+\.\S+$/.test(email)){
      fb.textContent = 'Informe um e-mail válido.';
      fb.classList.remove('success'); fb.classList.add('error');
      return;
    }
    fb.textContent = 'Inscrição registrada! Em breve você recebe novidades.';
    fb.classList.remove('error'); fb.classList.add('success');
    form.reset();
  });
}
