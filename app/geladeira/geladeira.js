// /app/geladeira/geladeira.js
const LS='geladeira';
let items=JSON.parse(localStorage.getItem(LS)||'[]');
let selected=[];
let curCat='';

const norm=t=>(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();

const fridge=document.getElementById('fridgeWrap'),closed=document.getElementById('fridgeClosed'),open=document.getElementById('fridgeOpen');
const search=document.getElementById('search'),grid=document.getElementById('itemsGrid'),add=document.getElementById('addBtn');
const modal=document.getElementById('modal'),backdrop=document.getElementById('backdrop'),close=document.getElementById('closeBtn');
const tabs=document.getElementById('tabs'),mSearch=document.getElementById('modalSearch'),gallery=document.getElementById('gallery');
const chips=document.getElementById('chips'),selectedWrap=document.getElementById('selectedChips'),selectedCount=document.getElementById('selectedCount');
const confirmBtn=document.getElementById('confirmBtn'),clearBtn=document.getElementById('clearBtn'),customBtn=document.getElementById('customBtn');

function buildCats(){
  const cats={};
  if(typeof INGREDIENTES!=='undefined'){
    const categorias=new Set(INGREDIENTES.map(i=>i.categoria));
    categorias.forEach(cat=>{
      cats[cat]=INGREDIENTES.filter(i=>i.categoria===cat);
    });
  }
  if(typeof INGREDIENTES_RESTOS!=='undefined'&&INGREDIENTES_RESTOS.length){
    cats['Restos Culinários']=INGREDIENTES_RESTOS;
  }
  return Object.freeze(cats);
}

const CATS=buildCats();
const catKeys=Object.keys(CATS);

function save(){localStorage.setItem(LS,JSON.stringify(items))}

function render(){
  const f=norm(search.value);
  grid.innerHTML=items.filter(i=>norm(i.nome).includes(f)).map((i,idx)=>`<div class="item-cell"><img src="${i.url}" alt="${i.nome}" onerror="this.style.display='none'"/><button class="item-remove" onclick="removeItem(${idx})" aria-label="Remover ${i.nome}">×</button></div>`).join('');
}

function openModal(){
  selected=[];
  if(!curCat||!CATS[curCat]){
    curCat=catKeys[0]||'';
  }
  tabs.innerHTML=catKeys.map(c=>`<button class="tab${c===curCat?' active':''}" onclick="switchTab('${c}')">${c}</button>`).join('');
  renderGallery();
  backdrop.hidden=false;
  modal.hidden=false;
  requestAnimationFrame(()=>modal.classList.add('active'));
}

function closeModal(){
  modal.classList.remove('active');
  setTimeout(()=>{
    modal.hidden=true;
    backdrop.hidden=true;
  },150);
}

function renderGallery(){
  const f=norm(mSearch.value);
  const list=(CATS[curCat]||[]).filter(i=>norm(i.nome).includes(f));
  gallery.innerHTML=list.map(i=>{
    const isSel=selected.some(s=>s.id===i.id);
    return `<div class="gallery-item${isSel?' selected':''}" onclick="toggleItem({id:'${i.id}',nome:'${i.nome.replace(/'/g,"\\'")}',url:'${i.url}',categoria:'${i.categoria||''}'})" role="button" tabindex="0"><img src="${i.url}" alt="${i.nome}" onerror="this.style.display='none'"/><span class="gallery-item-name">${i.nome}</span></div>`;
  }).join('');
  updateChips();
}

function toggleItem(item){
  const idx=selected.findIndex(s=>s.id===item.id);
  if(idx>=0){
    selected.splice(idx,1);
  }else{
    selected.push(item);
  }
  renderGallery();
}

function switchTab(cat){
  curCat=cat;
  tabs.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  event.target.classList.add('active');
  mSearch.value='';
  renderGallery();
}

function updateChips(){
  selectedWrap.hidden=!selected.length;
  selectedCount.textContent=selected.length;
  chips.innerHTML=selected.map((i,idx)=>`<div class="chip"><img src="${i.url}" alt="" onerror="this.style.display='none'"/><button class="chip-x" onclick="removeChip(${idx})" aria-label="Remover ${i.nome}">×</button></div>`).join('');
}

window.removeItem=function(i){
  items.splice(i,1);
  save();
  render();
};

window.removeChip=function(i){
  selected.splice(i,1);
  updateChips();
  renderGallery();
};

window.switchTab=function(c){
  curCat=c;
  tabs.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
  event.target.classList.add('active');
  mSearch.value='';
  renderGallery();
};

window.toggleItem=function(item){
  const idx=selected.findIndex(s=>s.id===item.id);
  if(idx>=0){
    selected.splice(idx,1);
  }else{
    selected.push(item);
  }
  renderGallery();
};

search.addEventListener('input',render);
closed.addEventListener('click',()=>fridge.classList.toggle('open'));
add.addEventListener('click',openModal);
close.addEventListener('click',closeModal);
backdrop.addEventListener('click',closeModal);
mSearch.addEventListener('input',renderGallery);
clearBtn.addEventListener('click',()=>{
  if(!selected.length)return;
  selected=[];
  updateChips();
  renderGallery();
});
confirmBtn.addEventListener('click',()=>{
  items.push(...selected);
  save();
  render();
  closeModal();
});
customBtn.addEventListener('click',()=>{
  const nome=prompt('Nome do ingrediente:');
  if(!nome)return;
  const url=prompt('URL da imagem:');
  if(!url)return;
  const id=norm(nome).replace(/\s+/g,'-').slice(0,40)||`item-${Date.now()}`;
  items.push({id,nome,url,categoria:'Customizado'});
  save();
  render();
});

document.getElementById('btnBack').addEventListener('click',()=>location.href='/app/humor/index.html');
document.getElementById('btnHome').addEventListener('click',()=>location.href='/app/home/index.html');
document.getElementById('btnFridge').addEventListener('click',()=>location.href='/app/geladeira/index.html');

if(catKeys.length>0){
  curCat=catKeys[0];
}
render();
