/* NewWatchGuy Admin Panel — local demo storage. Replace with Supabase auth/database for production. */
const STORAGE_KEY='nwg_products_v1';
const SESSION_KEY='nwg_admin_session';
const DEMO_PASSWORD='ChangeMe123!'; // CHANGE THIS for local testing; do NOT treat this as production security.

const $=s=>document.querySelector(s); const $$=s=>[...document.querySelectorAll(s)];
const getProducts=()=>{try{return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]')}catch{return[]}};
const saveProducts=p=>{localStorage.setItem(STORAGE_KEY,JSON.stringify(p)); window.dispatchEvent(new StorageEvent('storage',{key:STORAGE_KEY})); renderAll();};
const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const money=v=>Number(v||0).toLocaleString('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0});

function showApp(){ $('#loginScreen').hidden=true; $('#app').hidden=false; renderAll(); }
if(sessionStorage.getItem(SESSION_KEY)==='1') showApp();
$('#loginForm').addEventListener('submit',e=>{e.preventDefault(); if($('#password').value===DEMO_PASSWORD){sessionStorage.setItem(SESSION_KEY,'1');showApp()}else $('#loginError').textContent='Incorrect password.'});
$('#logout').addEventListener('click',()=>{sessionStorage.removeItem(SESSION_KEY);location.reload()});

function openModal(product){
 $('#productModal').hidden=false; $('#modalTitle').textContent=product?'Edit Product':'Add Product';
 const fields=['productId','name','brand','category','retailer','price','originalPrice','rating','status','image','affiliateUrl','description','movement','caseSize','strap','waterResistance'];
 fields.forEach(id=>{const el=$('#'+id); const key=id==='productId'?'id':id; el.value=product?.[key]??(id==='status'?'published':'')});
}
function closeModal(){$('#productModal').hidden=true}
$('#quickAdd').onclick=()=>openModal(); $('#closeModal').onclick=closeModal; $('#cancelModal').onclick=closeModal;

$('#productForm').addEventListener('submit',e=>{e.preventDefault(); const id=$('#productId').value||crypto.randomUUID(); const products=getProducts(); const data={id,name:$('#name').value.trim(),brand:$('#brand').value.trim(),category:$('#category').value,retailer:$('#retailer').value.trim(),price:$('#price').value,originalPrice:$('#originalPrice').value,rating:$('#rating').value.trim(),status:$('#status').value,image:$('#image').value.trim(),affiliateUrl:$('#affiliateUrl').value.trim(),description:$('#description').value.trim(),movement:$('#movement').value.trim(),caseSize:$('#caseSize').value.trim(),strap:$('#strap').value.trim(),waterResistance:$('#waterResistance').value.trim(),updatedAt:new Date().toISOString(),clicks:0}; const i=products.findIndex(p=>p.id===id); if(i>=0){data.clicks=products[i].clicks||0;products[i]=data}else products.unshift({...data,createdAt:new Date().toISOString()}); saveProducts(products);closeModal();go('products')});

function renderProducts(){const q=($('#productSearch')?.value||'').toLowerCase();const status=$('#statusFilter')?.value||'all';const ps=getProducts().filter(p=>(status==='all'||p.status===status)&&(`${p.name} ${p.brand} ${p.category}`).toLowerCase().includes(q));const box=$('#productsTable');if(!ps.length){box.innerHTML='<div class="empty">No products found. Click + Add Product to create your first product.</div>';return}box.innerHTML=`<table class="table"><thead><tr><th>Product</th><th>Brand</th><th>Price</th><th>Retailer</th><th>Status</th><th>Clicks</th><th>Actions</th></tr></thead><tbody>${ps.map(p=>`<tr><td><div style="display:flex;gap:10px;align-items:center"><img class="thumb" src="${esc(p.image)}" alt=""><div><strong>${esc(p.name)}</strong><div style="color:#777;font-size:11px">${esc(p.category)}</div></div></div></td><td>${esc(p.brand)}</td><td>${money(p.price)}</td><td>${esc(p.retailer||'—')}</td><td><span class="status ${esc(p.status)}">${esc(p.status)}</span></td><td>${p.clicks||0}</td><td><div class="actions"><button class="mini edit" data-id="${esc(p.id)}">Edit</button><button class="mini delete" data-id="${esc(p.id)}">Delete</button></div></td></tr>`).join('')}</tbody></table>`}

function renderRecent(){const ps=getProducts().slice(0,5);$('#recentProducts').innerHTML=ps.length?`<table class="table"><thead><tr><th>Product</th><th>Price</th><th>Status</th><th></th></tr></thead><tbody>${ps.map(p=>`<tr><td>${esc(p.name)}</td><td>${money(p.price)}</td><td><span class="status ${esc(p.status)}">${esc(p.status)}</span></td><td><button class="mini edit" data-id="${esc(p.id)}">Edit</button></td></tr>`).join('')}</tbody></table>`:'<div class="empty">No products yet.</div>'}
function renderStats(){const p=getProducts();$('#statProducts').textContent=p.length;$('#statPublished').textContent=p.filter(x=>x.status==='published').length;$('#statDrafts').textContent=p.filter(x=>x.status==='draft').length;$('#statClicks').textContent=p.reduce((a,x)=>a+Number(x.clicks||0),0)}
function renderLists(){const brands=[...new Set(getProducts().map(p=>p.brand).filter(Boolean))];const cats=[...new Set(getProducts().map(p=>p.category).filter(Boolean))];$('#brandList').innerHTML=brands.map(x=>`<span class="chip">${esc(x)}</span>`).join('')||'<span class="empty">Brands appear here after products are added.</span>';$('#categoryList').innerHTML=cats.map(x=>`<span class="chip">${esc(x)}</span>`).join('')||'<span class="empty">Categories appear here after products are added.</span>'}
function renderAll(){renderStats();renderRecent();renderProducts();renderLists()}

$('#productsTable').addEventListener('click',e=>{const id=e.target.dataset.id;if(!id)return;const p=getProducts().find(x=>x.id===id);if(e.target.classList.contains('edit'))openModal(p);if(e.target.classList.contains('delete')&&confirm(`Delete ${p.name}?`)){saveProducts(getProducts().filter(x=>x.id!==id))}});
$('#recentProducts').addEventListener('click',e=>{const id=e.target.dataset.id;if(id)openModal(getProducts().find(x=>x.id===id))});
$('#productSearch').addEventListener('input',renderProducts);$('#statusFilter').addEventListener('change',renderProducts);

$('#exportProducts').onclick=()=>{const blob=new Blob([JSON.stringify(getProducts(),null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='newwatchguy-products.json';a.click();URL.revokeObjectURL(a.href)};
$('#importProducts').addEventListener('change',e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=()=>{try{const data=JSON.parse(r.result);if(!Array.isArray(data))throw Error();saveProducts(data);alert('Products imported successfully.')}catch{alert('Invalid JSON file.')}};r.readAsText(f)});
$('#clearData').onclick=()=>{if(confirm('Delete ALL locally stored product data?')){localStorage.removeItem(STORAGE_KEY);renderAll()}};

function go(view){$$('.view').forEach(v=>v.hidden=v.id!==view+'View');$$('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===view));$('#viewTitle').textContent=view[0].toUpperCase()+view.slice(1);if(view==='products')renderProducts()}
$$('.nav-item').forEach(b=>b.onclick=()=>go(b.dataset.view));$$('[data-view="products"]').forEach(b=>b.onclick=()=>go('products'));

// Seed is intentionally empty. Existing static demo cards remain on the public homepage; admin products appear in the LATEST PICKS section.
