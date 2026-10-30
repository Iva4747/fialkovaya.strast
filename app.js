'use strict';
// Keep links from the previous single-page version usable.
if(/(?:\/|index\.html)$/.test(location.pathname)){
 const legacy={collection:'collection.html',articles:'articles.html',reviews:'about.html#reviews',contacts:'about.html#contacts'};
 const destination=legacy[location.hash.slice(1)];
 if(destination)location.replace(destination);
}

const menu=document.querySelector('.menu-toggle');
const nav=document.querySelector('#navigation');
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){menu.setAttribute('aria-expanded','false');nav.classList.remove('open');menu.focus()}});
let favorites=[];
try{const stored=JSON.parse(localStorage.getItem('favorites')||'[]');if(Array.isArray(stored))favorites=stored.filter(x=>typeof x==='string')}catch{}
function updateFavorites(){document.querySelectorAll('[data-favorite]').forEach(button=>{const active=favorites.includes(button.dataset.favorite);button.setAttribute('aria-pressed',String(active));if(button.classList.contains('favorite')){button.textContent=active?'♥':'♡';button.setAttribute('aria-label',`${active?'Убрать из избранного':'В избранное'}: ${button.dataset.favorite}`)}else button.textContent=active?'♥ В избранном':'♡ В избранное'})}
document.querySelectorAll('[data-favorite]').forEach(button=>button.addEventListener('click',()=>{const name=button.dataset.favorite;favorites=favorites.includes(name)?favorites.filter(x=>x!==name):[...favorites,name];try{localStorage.setItem('favorites',JSON.stringify(favorites))}catch{}updateFavorites();if(archive)filterArchive()}));
updateFavorites();
const archive=document.querySelector('[data-archive]');
let category='all',plantFilter='all';
const params=new URLSearchParams(location.search);
const normalize=value=>value.toLocaleLowerCase('ru').replaceAll('ё','е');
if(archive){
 const input=archive.querySelector('input[type=search]');
 category=params.get('category')||'all';
 if(![...archive.querySelectorAll('[data-category-filter]')].some(b=>b.dataset.categoryFilter===category))category='all';
 plantFilter=params.get('view')==='favorites'?'favorites':'all';
 input.value=params.get('q')||'';
 input.addEventListener('input',()=>filterArchive(true));
 archive.querySelectorAll('[data-category-filter]').forEach(button=>button.addEventListener('click',()=>{category=button.dataset.categoryFilter;filterArchive(true)}));
 archive.querySelectorAll('[data-plant-filter]').forEach(button=>button.addEventListener('click',()=>{plantFilter=button.dataset.plantFilter;filterArchive(true)}));
 archive.querySelector('.reset')?.addEventListener('click',()=>{category='all';plantFilter='all';input.value='';filterArchive(true);input.focus()});
 filterArchive();
 addEventListener('popstate',()=>{const p=new URLSearchParams(location.search);category=p.get('category')||'all';plantFilter=p.get('view')||'all';input.value=p.get('q')||'';filterArchive()});
}
function filterArchive(updateUrl=false){
 if(!archive)return;
 const input=archive.querySelector('input[type=search]');
 const query=normalize(input.value.trim());
 const terms=query.split(/\s+/).filter(Boolean);
 const cards=[...archive.querySelectorAll('.article-card,.plant-card')];
 let visible=0;
 cards.forEach(card=>{const match=terms.every(term=>normalize(card.dataset.search).includes(term))&&(category==='all'||card.dataset.category===category)&&(plantFilter==='all'||favorites.includes(card.dataset.name));card.hidden=!match;if(match)visible++});
 archive.querySelectorAll('[data-category-filter]').forEach(button=>{const selected=button.dataset.categoryFilter===category;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected))});
 archive.querySelectorAll('[data-plant-filter]').forEach(button=>{const selected=button.dataset.plantFilter===plantFilter;button.classList.toggle('active',selected);button.setAttribute('aria-pressed',String(selected))});
 archive.querySelector('#result-count').textContent=`${archive.dataset.archive==='articles'?'Найдено статей':'Найдено сортов'}: ${visible}`;
 archive.querySelector('.empty').hidden=visible!==0;
 if(updateUrl){const url=new URL(location.href);url.search='';if(category!=='all')url.searchParams.set('category',category);if(input.value.trim())url.searchParams.set('q',input.value.trim());if(plantFilter!=='all')url.searchParams.set('view',plantFilter);history.replaceState(null,'',url)}
}
const share=document.querySelector('#share-article');
share?.addEventListener('click',async()=>{const status=document.querySelector('.share-status');try{await navigator.clipboard.writeText(location.href);status.textContent='Ссылка скопирована. Ею можно поделиться.'}catch{status.textContent='Скопируйте адрес статьи из адресной строки браузера.'}});
const progress=document.querySelector('.reading-progress span');
if(progress){const update=()=>{const max=document.documentElement.scrollHeight-innerHeight;progress.style.width=`${max>0?Math.min(100,scrollY/max*100):100}%`};addEventListener('scroll',update,{passive:true});addEventListener('resize',update);update()}
