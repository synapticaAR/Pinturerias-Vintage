
/* ====== Datos ====== */
const FREE_SHIP_THRESHOLD = 180000;
const INSTALLMENTS = 6;

const categories = ["Látex","Impermeabilizantes","Membranas","Revestimientos","Madera","Piletas"];
const products = [
  {id:1, brand:"Sinteplast", cat:"Látex", title:"Látex Interior/Exterior 20 L", price:74900, old:84500, disc:11, rating:4.7, img:"assets/products/p1-1.webp", desc:"Alta cobertura para interiores y exteriores. Secado rápido y excelente rendimiento.", imgs:["assets/products/p1-1","assets/products/p1-2","assets/products/p1-3"]},
  {id:2, brand:"Sinteplast", cat:"Látex", title:"Recuplast Interior Mate 20 L", price:133000, old:142000, disc:6, rating:4.8, img:"assets/products/p2-1.webp", desc:"Premium interior mate, máxima lavabilidad y duración. Terminación profesional.", imgs:["assets/products/p2-1","assets/products/p2-2","assets/products/p2-3"]},
  {id:3, brand:"Sherwin-Williams", cat:"Látex", title:"Látex Interior Mate Z10 20 L", price:156000, old:176800, disc:12, rating:4.6, img:"assets/products/p3-1.webp", desc:"Excelente cubritivo y resistencia para interiores exigentes.", imgs:["assets/products/p3-1","assets/products/p3-2","assets/products/p3-3"]},
  {id:4, brand:"Sinteplast", cat:"Impermeabilizantes", title:"Membrana Líquida 20 L Recuplast", price:184200, old:199900, disc:8, rating:4.9, img:"assets/products/p4-1.webp", desc:"Protección elástica y duradera para techos y terrazas.", imgs:["assets/products/p4-1","assets/products/p4-2","assets/products/p4-3"]},
  {id:5, brand:"Tersuave", cat:"Revestimientos", title:"Revestimiento Acrílico Texturado 15 L", price:122500, old:136000, disc:10, rating:4.5, img:"assets/products/p5-1.webp", desc:"Terminación texturada resistente a la intemperie.", imgs:["assets/products/p5-1","assets/products/p5-2","assets/products/p5-3"]},
  {id:6, brand:"Sinteplast", cat:"Madera", title:"Barniz Marino Poliuretánico 4 L", price:93500, old:106000, disc:12, rating:4.4, img:"assets/products/p6-1.webp", desc:"Protección máxima UV y resistencia a rayones.", imgs:["assets/products/p6-1","assets/products/p6-2","assets/products/p6-3"]},
  {id:7, brand:"3M", cat:"Membranas", title:"Cinta Asfáltica Autoadhesiva 10 m", price:48900, old:54500, disc:10, rating:4.3, img:"assets/products/p7-1.webp", desc:"Sellado instantáneo de filtraciones y juntas.", imgs:["assets/products/p7-1","assets/products/p7-2","assets/products/p7-3"]},
  {id:8, brand:"Sinteplast", cat:"Piletas", title:"Pintura para Piletas 20 L", price:152000, old:171000, disc:11, rating:4.7, img:"assets/products/p8-1.webp", desc:"Color intenso, alta resistencia al cloro y rayos UV.", imgs:["assets/products/p8-1","assets/products/p8-2","assets/products/p8-3"]}
];

/* ====== Helpers ====== */
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);
const fmt = n => new Intl.NumberFormat('es-AR',{style:'currency',currency:'ARS',maximumFractionDigits:0}).format(n);
const byId = id => products.find(p=>p.id===id);
const monthFee = n => fmt(Math.round(n / INSTALLMENTS));

const grid = $('#grid'), badge = $('#cartBadge');
const cartEl = $('#cart'), slidesEl = $('#slides'), dots = $('#dots');
const sugg = $('#sugg');
let cart = JSON.parse(localStorage.getItem('pv_cart')||'[]');
let wishlist = JSON.parse(localStorage.getItem('pv_wish')||'[]');
let session = JSON.parse(localStorage.getItem('pv_user')||'null');
let current = 0;
let currentList = [...products];

function toast(msg){
  const t=$('#toast'); t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),1600);
}

/* ====== Categorías ====== */
const catsRow = $('#catsRow');
function buildCats(){
  catsRow.innerHTML='';
  categories.forEach((c,i)=>{
    const b=document.createElement('button');
    b.className='chip'+(i===0?' active':'');
    b.textContent=c;
    b.onclick=()=>{
      [...catsRow.children].forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      filterByCategory(c);
    }
    catsRow.appendChild(b);
  });
}

/* ====== Filtro marcas ====== */
const brands = [...new Set(products.map(p=>p.brand))];
const brandFilter = $('#brandFilter');
function buildBrandFilter(){
  brands.forEach(b=>{
    const o=document.createElement('option'); o.value=b; o.textContent=b; brandFilter.appendChild(o);
  });
}

/* ====== Render productos ====== */
function productCard(p){
  const disc = Math.max(0, Math.round((1 - (p.price/p.old))*100) || p.disc || 0);
  const freeShip = p.price >= FREE_SHIP_THRESHOLD;
  return `
  <div class="card">
    <div class="thumb">
      ${freeShip?`<div class="badge-flag">🚚 Envío GRATIS</div>`:''}
      ${disc?`<div class="badge-disc">-${disc}%</div>`:''}
      <picture><source srcset="${(p.imgs?p.imgs[0]:p.img)}.webp" type="image/webp"><img src="${(p.imgs?p.imgs[0]:p.img)}.png" alt="${p.title}" loading="lazy"></picture>
    </div>
    <div class="brandline">${p.brand} · ${p.cat}</div>
    <div class="title">${p.title}</div>
    <div class="rating">${"★".repeat(Math.round(p.rating))}${"☆".repeat(5-Math.round(p.rating))} <span class="muted">(${p.rating.toFixed(1)})</span></div>
    <div class="price-row"><span class="old">${fmt(p.old)}</span> <span class="price">${fmt(p.price)}</span></div>
    <div class="install">${INSTALLMENTS} cuotas de <b>${monthFee(p.price)}</b> sin interés</div>
    <div class="buyrow">
      <button class="btn" onclick="openProduct(${p.id})">Ver detalle</button>
      <button class="btn ghost" onclick="add(${p.id})">Agregar</button>
      <button class="btn wishlist" onclick="toggleWish(${p.id})">${wishlist.includes(p.id)?'♥':'♡'}</button>
    </div>
  </div>`;
}

function renderProducts(list=products){
  currentList = [...list];
  grid.innerHTML='';
  list.forEach(p=>{
    const col=document.createElement('div'); col.className='col';
    col.innerHTML = productCard(p);
    grid.appendChild(col);
  });
  $('#resultsCount').textContent = `${list.length} resultado${list.length!==1?'s':''}`;
}

function filterByCategory(c){
  const list = products.filter(p=>p.cat===c);
  applyFilters(list.length?list:products);
  scrollToProducts();
}
window.filterByCategory = filterByCategory;

function applyFilters(baseList){
  let list = [...baseList];
  // brand
  const bf = brandFilter.value;
  if(bf) list = list.filter(p=>p.brand===bf);
  // price
  const maxPrice = parseInt($('#priceRange').value || '0', 10);
  if(maxPrice>0) list = list.filter(p=>p.price <= maxPrice);
  // sort
  const s = $('#sort').value;
  if(s==='menor') list.sort((a,b)=>a.price-b.price);
  if(s==='mayor') list.sort((a,b)=>b.price-a.price);
  if(s==='descuento') list.sort((a,b)=>((1-a.price/a.old)-(1-b.price/b.old)));
  renderProducts(list);
}

/* ====== Buscador + sugerencias ====== */
const input = $('#q');
input.addEventListener('input',e=>{
  const q=e.target.value.trim().toLowerCase();
  if(!q){ sugg.classList.add('hidden'); renderProducts(products); return; }
  const found=products.filter(p=>(p.title+p.brand+p.cat).toLowerCase().includes(q));
  applyFilters(found);
  sugg.innerHTML = found.slice(0,6).map(p=>`<div style="padding:10px;border-top:1px solid #f3f5f8;cursor:pointer" onclick="openProduct(${p.id});sugg.classList.add('hidden')">${p.title} · <span class="muted">${p.brand}</span></div>`).join('');
  sugg.classList.toggle('hidden', !found.length);
});
document.addEventListener('click', (e)=>{ if(!sugg.contains(e.target) && e.target!==input) sugg.classList.add('hidden'); });

/* ====== Modal Producto ====== */
let selected=null;
function openProduct(id){
  selected=byId(id);
  buildModalMedia(selected);
  $('#m_brand').textContent=selected.brand+' · '+selected.cat;
  $('#m_title').textContent=selected.title;
  $('#m_desc').textContent=selected.desc;
  $('#m_old').textContent=fmt(selected.old);
  $('#m_price').textContent=fmt(selected.price);
  $('#m_install').innerHTML=`${INSTALLMENTS} cuotas de <b>${monthFee(selected.price)}</b> sin interés`;
  $('#addBtn').onclick=()=>{ add(selected.id); toggleModal(false); };
  $('#wishBtn').onclick=()=>{ toggleWish(selected.id); };
  toggleModal(true);
}
function toggleModal(show){
  const m=$('#productModal'); m.classList.toggle('show',!!show);
  m.setAttribute('aria-hidden', show?'false':'true');
}
$('#productModal .backdrop').onclick=()=>toggleModal(false);

function buildModalMedia(prod){
  const main = document.querySelector('#m_main');
  const thumbs = document.querySelector('#m_thumbs');
  const imgs = (prod.imgs && prod.imgs.length ? prod.imgs : [prod.img.replace(/\.webp$|\.png$/,'')]);
  function mainHTML(base){ return `<picture id="m_pic"><source srcset="${base}.webp" type="image/webp"><img id="m_img" src="${base}.png" alt="${prod.title}" /></picture>`; }
  main.innerHTML = mainHTML(imgs[0]);
  thumbs.innerHTML = imgs.map((b,i)=>`<button class="thumb ${i===0?'active':''}" data-b="${b}"><picture><source srcset="${b}.webp" type="image/webp"><img src="${b}.png" alt="Vista ${i+1}" /></picture></button>`).join('');
  thumbs.querySelectorAll('.thumb').forEach(btn=>btn.onclick=()=>{
    thumbs.querySelectorAll('.thumb').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    main.innerHTML = mainHTML(btn.dataset.b);
  });
  main.onclick = ()=> openZoom(document.querySelector('#m_img').src);
}


/* ====== Wishlist ====== */
function toggleWish(id){
  const i = wishlist.indexOf(id);
  if(i>-1) wishlist.splice(i,1); else wishlist.push(id);
  localStorage.setItem('pv_wish', JSON.stringify(wishlist));
  renderProducts(currentList);
  if(selected && selected.id===id){
    $('#wishBtn').textContent = wishlist.includes(id)?'♥ Guardado':'♡ Guardar';
  }
  toast(wishlist.includes(id)?'Guardado en favoritos':'Quitado de favoritos');
}
window.toggleWish = toggleWish;

/* ====== Carrito ====== */
function add(id, qty=1){
  const p=byId(id);
  const idx = cart.findIndex(i=>i.id===id);
  if(idx>-1) cart[idx].qty += qty; else cart.push({id:p.id, price:p.price, title:p.title, brand:p.brand, img:p.img, qty});
  updateCart();
  toast('Agregado al carrito');
}
function removeIdx(i){ cart.splice(i,1); updateCart(); }
function setQty(i,delta){
  cart[i].qty = Math.max(1, cart[i].qty + delta);
  updateCart();
}
function updateCart(){
  const list=$('#cartItems'); list.innerHTML='';
  let sub=0;
  cart.forEach((it,i)=>{
    const line = it.price * it.qty; sub += line;
    const row=document.createElement('div'); row.className='row';
    row.innerHTML=`<img src="${it.img}" alt="">
      <div>
        <div class="muted" style="font-size:.85rem">${it.brand}</div>
        <div>${it.title}</div>
        <div class="muted" style="display:flex;align-items:center;gap:8px;margin-top:6px">
          <div class="qty">
            <button aria-label="Restar" onclick="setQty(${i},-1)">-</button>
            <span>${it.qty}</span>
            <button aria-label="Sumar" onclick="setQty(${i},1)">+</button>
          </div>
          <span>${fmt(line)}</span>
        </div>
      </div>
      <button class="icon-btn" aria-label="Quitar" onclick="removeIdx(${i})">✕</button>`;
    list.appendChild(row);
  });
  const ship = sub>=FREE_SHIP_THRESHOLD ? 0 : (sub>0? 3500: 0);
  $('#cartSubtotal').textContent=fmt(sub);
  $('#cartShip').textContent = sub? (ship? fmt(ship): 'GRATIS') : 'A calcular';
  $('#cartTotal').textContent=fmt(sub+ship);
  badge.style.display = cart.length? 'block':'none';
  badge.textContent = cart.reduce((a,b)=>a+b.qty,0);
  localStorage.setItem('pv_cart', JSON.stringify(cart));
}
window.removeItem = removeIdx;

$('#openCart').onclick=()=>cartEl.classList.add('open');
$('#closeCart').onclick=()=>cartEl.classList.remove('open');

/* ====== Login ====== */
const loginModal = $('#loginModal');
function toggleLogin(show){
  loginModal.classList.toggle('show',!!show);
  loginModal.setAttribute('aria-hidden', show?'false':'true');
}
$('#openLogin').onclick=()=>toggleLogin(true);
$('#loginModal .backdrop').onclick=()=>toggleLogin(false);
$('#loginBtn').onclick=()=>{
  const name = $('#inName').value.trim();
  const email = $('#inEmail').value.trim();
  if(!name || !email || !email.includes('@')){ alert('Completá nombre y email válidos'); return; }
  session = {name, email};
  localStorage.setItem('pv_user', JSON.stringify(session));
  toggleLogin(false);
  toast(`¡Hola ${name.split(' ')[0]}!`);
  $('#openLogin').textContent = '👤 ' + name.split(' ')[0];
}
if(session){ $('#openLogin').textContent = '👤 ' + session.name.split(' ')[0]; }

/* ====== Slider ====== */
function buildDots(){ dots.innerHTML=''; for(let i=0;i<3;i++){ const d=document.createElement('div'); d.className='dot'+(i===0?' active':''); d.onclick=()=>go(i); dots.appendChild(d);} }
buildDots();
function go(i){ current=i; slidesEl.style.transform=`translateX(-${i*100}%)`; [...dots.children].forEach((d,k)=>d.classList.toggle('active',k===i)); }
setInterval(()=>{ current=(current+1)%3; go(current); }, 5200);

function scrollToProducts(){ document.querySelector('#grid').scrollIntoView({behavior:'smooth'}); }
window.scrollToProducts = scrollToProducts;

/* ====== Newsletter ====== */
$('#nlBtn').onclick=()=>{
  const em = $('#nlEmail').value.trim();
  if(!em || !em.includes('@')){ alert('Ingresá un email válido'); return; }
  localStorage.setItem('pv_newsletter', em);
  toast('¡Gracias por suscribirte!');
  $('#nlEmail').value='';
}

/* ====== Mercado Pago (sandbox) ====== */
const mpReady = () => typeof MercadoPago!== 'undefined';
document.getElementById('payBtn').addEventListener('click', ()=>{
  if(!cart.length){ alert('Tu carrito está vacío'); return; }
  if(mpReady()){
    try{
      const mp = new MercadoPago('TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxx', { locale: 'es-AR' });
      mp.checkout({ preference:{ id:'sandbox-preference-id' }, render:{ container:'#wallet_container', label:'Pagar ahora' } });
    }catch(e){ fallbackPay(); }
  }else{ fallbackPay(); }
});
function fallbackPay(){
  const total = $('#cartTotal').textContent;
  alert('Simulación de pago. Total: '+ total + '\nLuego conectamos tu cuenta de Mercado Pago.');
}

/* ====== Init ====== */
function init(){
  buildCats();
  buildBrandFilter();
  renderProducts(products);
  updateCart();
  // filtros
  $('#sort').onchange=()=>applyFilters(products);
  $('#brandFilter').onchange=()=>applyFilters(products);
  const range = $('#priceRange'); const lbl = $('#priceLabel');
  range.value = 0; lbl.textContent = 'Hasta: sin límite';
  range.oninput = ()=>{ lbl.textContent = range.value>0 ? ('Hasta ' + fmt(parseInt(range.value,10))) : 'Hasta: sin límite'; applyFilters(products); }
  // PWA
  if('serviceWorker' in navigator){ navigator.serviceWorker.register('sw.js'); }
}
document.addEventListener('DOMContentLoaded', init);

/* ====== Zoom overlay ====== */
function openZoom(src){
  const z = document.querySelector('#zoomOverlay');
  const zi = document.querySelector('#zoomImg');
  z.classList.remove('hidden');
  zi.src = src;
  zi.style.transform = 'scale(1) translate(0px,0px)';
  let scale = 1, ox=0, oy=0, startX=0, startY=0, dragging=false;
  function setTransform(){ zi.style.transform = `scale(${scale}) translate(${ox}px,${oy}px)`; }
  document.querySelector('#zoomIn').onclick=()=>{ scale=Math.min(3,scale+0.3); setTransform(); };
  document.querySelector('#zoomOut').onclick=()=>{ scale=Math.max(1,scale-0.3); setTransform(); };
  document.querySelector('#zoomClose').onclick=()=>{ z.classList.add('hidden'); };
  zi.onmousedown = (e)=>{ dragging=true; startX=e.clientX; startY=e.clientY; };
  zi.onmouseup = ()=> dragging=false;
  zi.onmouseleave = ()=> dragging=false;
  zi.onmousemove = (e)=>{ if(!dragging||scale===1) return; ox += (e.clientX-startX)/scale; oy += (e.clientY-startY)/scale; startX=e.clientX; startY=e.clientY; setTransform(); };
  zi.ontouchstart = (e)=>{ if(e.touches.length===1){ dragging=true; startX=e.touches[0].clientX; startY=e.touches[0].clientY; } };
  zi.ontouchend = ()=> dragging=false;
  zi.ontouchmove = (e)=>{ if(!dragging||scale===1) return; const t=e.touches[0]; ox += (t.clientX-startX)/scale; oy += (t.clientY-startY)/scale; startX=t.clientX; startY=t.clientY; setTransform(); };
}
