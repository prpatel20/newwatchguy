/**
 * NewWatchGuy — Admin Dashboard logic.
 * Full CRUD against Supabase: products, categories, brands, settings,
 * profile, image upload to Storage. Real Supabase Auth guards this page.
 */

let CURRENT_USER = null;
let CATEGORIES = [];
let BRANDS = [];
let EDIT_MODE = false;

document.addEventListener('DOMContentLoaded', async () => {
  const authResult = await AdminAuth.requireAuthOrRedirect();
  if (!authResult) return; // already redirected to login

  CURRENT_USER = authResult;
  document.getElementById('authGate').hidden = true;
  document.getElementById('app').hidden = false;

  await loadLookups();
  wireNav();
  wireLogout();
  wireProductForm();
  wireCategoryForm();
  wireBrandForm();
  wireSettingsForm();
  wireProfileForms();
  wireMediaLibrary();

  document.getElementById('quickAdd').addEventListener('click', () => showView('addProduct'));

  await showView('dashboard');
});

// ---------------------------------------------------------------------
// NAVIGATION
// ---------------------------------------------------------------------
function wireNav() {
  document.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', () => showView(btn.dataset.view));
  });
}

async function showView(view) {
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === view));
  document.querySelectorAll('.view').forEach(v => v.hidden = true);
  const titles = {
    dashboard: 'Overview', products: 'Products', addProduct: EDIT_MODE ? 'Edit Product' : 'Add Product',
    categories: 'Categories', brands: 'Brands', affiliate: 'Affiliate Links',
    media: 'Media Library', settings: 'Settings', profile: 'Admin Profile'
  };
  document.getElementById('viewTitle').textContent = titles[view] || view;

  const map = {
    dashboard: 'dashboardView', products: 'productsView', addProduct: 'addProductView',
    categories: 'categoriesView', brands: 'brandsView', affiliate: 'affiliateView',
    media: 'mediaView', settings: 'settingsView', profile: 'profileView'
  };
  const el = document.getElementById(map[view]);
  if (el) el.hidden = false;

  if (view === 'addProduct' && !EDIT_MODE) resetProductForm();
  if (view === 'dashboard') await loadDashboard();
  if (view === 'products') await loadProductsTable();
  if (view === 'categories') await loadCategoriesTable();
  if (view === 'brands') await loadBrandsTable();
  if (view === 'affiliate') await loadAffiliateTable();
  if (view === 'media') await loadMediaGrid();
  if (view === 'settings') await loadSettingsForm();
  if (view === 'profile') await loadProfileForm();
}

function wireLogout() {
  document.getElementById('logout').addEventListener('click', () => AdminAuth.signOut());
}

// ---------------------------------------------------------------------
// LOOKUPS (categories + brands, reused across product form + filters)
// ---------------------------------------------------------------------
async function loadLookups() {
  const [{ data: cats }, { data: brds }] = await Promise.all([
    window.db.from('categories').select('*').order('name'),
    window.db.from('brands').select('*').order('name')
  ]);
  CATEGORIES = cats || [];
  BRANDS = brds || [];
  const catSelect = document.getElementById('category');
  const brandSelect = document.getElementById('brand');
  catSelect.innerHTML = '<option value="">Select category</option>' + CATEGORIES.map(c => `<option value="${c.id}">${esc(c.name)}</option>`).join('');
  brandSelect.innerHTML = '<option value="">Select brand</option>' + BRANDS.map(b => `<option value="${b.id}">${esc(b.name)}</option>`).join('');
}

// ---------------------------------------------------------------------
// OVERVIEW / DASHBOARD
// ---------------------------------------------------------------------
async function loadDashboard() {
  const [total, published, drafts, cats, brands, clicks, recent] = await Promise.all([
    countOf('products'),
    countOf('products', q => q.eq('status', 'published')),
    countOf('products', q => q.eq('status', 'draft')),
    countOf('categories'),
    countOf('brands'),
    countOf('product_clicks'),
    window.db.from('products').select('*, brands(name)').order('created_at', { ascending: false }).limit(5)
  ]);
  document.getElementById('statProducts').textContent = total;
  document.getElementById('statPublished').textContent = published;
  document.getElementById('statDrafts').textContent = drafts;
  document.getElementById('statCategories').textContent = cats;
  document.getElementById('statBrands').textContent = brands;
  document.getElementById('statClicks').textContent = clicks;

  const rows = recent.data || [];
  document.getElementById('recentProducts').innerHTML = rows.length ? adminTable(rows, true) : emptyRow('No products yet. Click "Add Product" to create your first one.');
  attachRowActions();
}

async function countOf(table, filterFn) {
  let q = window.db.from(table).select('*', { count: 'exact', head: true });
  if (filterFn) q = filterFn(q);
  const { count, error } = await q;
  if (error) { console.error(error); return 0; }
  return count || 0;
}

// ---------------------------------------------------------------------
// PRODUCTS TABLE
// ---------------------------------------------------------------------
async function loadProductsTable() {
  const searchInput = document.getElementById('productSearch');
  const statusFilter = document.getElementById('statusFilter');
  searchInput.oninput = debounce(renderProductsTable, 300);
  statusFilter.onchange = renderProductsTable;
  await renderProductsTable();
}

async function renderProductsTable() {
  const search = document.getElementById('productSearch').value.trim();
  const status = document.getElementById('statusFilter').value;
  let q = window.db.from('products').select('*, brands(name), categories(name)').order('created_at', { ascending: false });
  if (status !== 'all') q = q.eq('status', status);
  if (search) q = q.ilike('name', `%${search}%`);
  const { data, error } = await q;
  if (error) { console.error(error); return; }
  document.getElementById('productsTable').innerHTML = data.length ? adminTable(data, false) : emptyRow('No products found.');
  attachRowActions();
}

function adminTable(rows, compact) {
  return `<table class="admin-table"><thead><tr>
    <th>Image</th><th>Product</th><th>Brand</th><th>Category</th><th>Price</th><th>Status</th>
    ${!compact ? '<th>Deal</th><th>Featured</th>' : ''}<th>Created</th><th>Actions</th>
  </tr></thead><tbody>
  ${rows.map(p => `
    <tr data-id="${p.id}">
      <td><img class="thumb-sm" src="${esc(p.main_image || '../images/watch-mens.jpg')}" alt=""></td>
      <td>${esc(p.name)}</td>
      <td>${esc(p.brands?.name || '—')}</td>
      <td>${esc(p.categories?.name || '—')}</td>
      <td>₹${Number(p.price || 0).toLocaleString('en-IN')}</td>
      <td><span class="status-badge ${p.status}">${p.status}</span></td>
      ${!compact ? `<td>${p.is_deal ? '✓' : '—'}</td><td>${p.is_featured ? '✓' : '—'}</td>` : ''}
      <td>${new Date(p.created_at).toLocaleDateString('en-IN')}</td>
      <td class="row-actions">
        <button data-action="edit" data-id="${p.id}">Edit</button>
        <button data-action="toggle" data-id="${p.id}" data-status="${p.status}">${p.status === 'published' ? 'Unpublish' : 'Publish'}</button>
        <button data-action="delete" data-id="${p.id}" class="danger">Delete</button>
      </td>
    </tr>`).join('')}
  </tbody></table>`;
}

function emptyRow(msg) { return `<div class="empty-row">${esc(msg)}</div>`; }

function attachRowActions() {
  document.querySelectorAll('[data-action="edit"]').forEach(btn => btn.onclick = () => editProduct(btn.dataset.id));
  document.querySelectorAll('[data-action="toggle"]').forEach(btn => btn.onclick = () => togglePublish(btn.dataset.id, btn.dataset.status));
  document.querySelectorAll('[data-action="delete"]').forEach(btn => btn.onclick = () => deleteProduct(btn.dataset.id));
}

async function togglePublish(id, currentStatus) {
  const newStatus = currentStatus === 'published' ? 'draft' : 'published';
  const { error } = await window.db.from('products').update({ status: newStatus }).eq('id', id);
  if (error) return alert('Unable to update status: ' + error.message);
  await refreshCurrentView();
}

async function deleteProduct(id) {
  if (!confirm('Delete this product permanently? This cannot be undone.')) return;
  const { error } = await window.db.from('products').delete().eq('id', id);
  if (error) return alert('Unable to delete: ' + error.message);
  await refreshCurrentView();
}

async function refreshCurrentView() {
  const active = document.querySelector('.nav-item.active')?.dataset.view || 'dashboard';
  await showView(active);
}

// ---------------------------------------------------------------------
// PRODUCT FORM (Add / Edit)
// ---------------------------------------------------------------------
const productFields = [
  'name', 'brand', 'category', 'subcategory', 'shortDescription', 'description',
  'price', 'originalPrice', 'currency', 'watchType', 'movement', 'strapMaterial',
  'caseMaterial', 'dialColor', 'caseSize', 'waterResistance', 'gender', 'style', 'occasion',
  'rating', 'ratingCount', 'retailer', 'affiliateNetwork', 'affiliateUrl', 'affiliateDisclosure',
  'mainImage', 'imageAlt', 'status', 'seoTitle', 'seoDescription', 'keywords'
];

function resetProductForm() {
  EDIT_MODE = false;
  document.getElementById('productForm').reset();
  document.getElementById('productId').value = '';
  document.getElementById('mainImagePreview').hidden = true;
  document.getElementById('extraImagesPreview').innerHTML = '';
  document.getElementById('mainImageStatus').textContent = '';
  document.getElementById('productFormError').textContent = '';
  document.getElementById('saveProductBtn').textContent = 'Save Product';
}

async function editProduct(id) {
  const { data: p, error } = await window.db.from('products').select('*, product_images(*)').eq('id', id).maybeSingle();
  if (error || !p) return alert('Unable to load product.');
  EDIT_MODE = true;
  await showView('addProduct');

  document.getElementById('productId').value = p.id;
  document.getElementById('name').value = p.name || '';
  document.getElementById('brand').value = p.brand_id || '';
  document.getElementById('category').value = p.category_id || '';
  document.getElementById('subcategory').value = p.subcategory || '';
  document.getElementById('shortDescription').value = p.short_description || '';
  document.getElementById('description').value = p.description || '';
  document.getElementById('price').value = p.price ?? '';
  document.getElementById('originalPrice').value = p.original_price ?? '';
  document.getElementById('currency').value = p.currency || 'INR';
  document.getElementById('watchType').value = p.watch_type || '';
  document.getElementById('movement').value = p.movement || '';
  document.getElementById('strapMaterial').value = p.strap_material || '';
  document.getElementById('caseMaterial').value = p.case_material || '';
  document.getElementById('dialColor').value = p.dial_color || '';
  document.getElementById('caseSize').value = p.case_size || '';
  document.getElementById('waterResistance').value = p.water_resistance || '';
  document.getElementById('gender').value = p.gender || '';
  document.getElementById('style').value = p.style || '';
  document.getElementById('occasion').value = p.occasion || '';
  document.getElementById('rating').value = p.rating ?? '';
  document.getElementById('ratingCount').value = p.rating_count ?? '';
  document.getElementById('retailer').value = p.retailer || '';
  document.getElementById('affiliateNetwork').value = p.affiliate_network || '';
  document.getElementById('affiliateUrl').value = p.affiliate_url || '';
  document.getElementById('affiliateDisclosure').value = p.affiliate_disclosure || '';
  document.getElementById('mainImage').value = p.main_image || '';
  document.getElementById('imageAlt').value = p.image_alt || '';
  document.getElementById('status').value = p.status || 'draft';
  document.getElementById('isFeatured').checked = !!p.is_featured;
  document.getElementById('isDeal').checked = !!p.is_deal;
  document.getElementById('isEditorPick').checked = !!p.is_editor_pick;
  document.getElementById('seoTitle').value = p.seo_title || '';
  document.getElementById('seoDescription').value = p.seo_description || '';
  document.getElementById('keywords').value = p.keywords || '';

  if (p.main_image) {
    const preview = document.getElementById('mainImagePreview');
    preview.src = p.main_image; preview.hidden = false;
  }
  renderExtraImagePreviews(p.product_images || []);
  document.getElementById('saveProductBtn').textContent = 'Update Product';
}

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function wireProductForm() {
  document.getElementById('cancelProductForm').addEventListener('click', () => showView('products'));

  document.getElementById('mainImageFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await uploadImage(file, (url) => {
      document.getElementById('mainImage').value = url;
      const preview = document.getElementById('mainImagePreview');
      preview.src = url; preview.hidden = false;
    }, 'mainImageStatus');
  });

  document.getElementById('extraImageFile').addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    const statusEl = document.getElementById('extraImageStatus');
    for (const file of files) {
      await uploadImage(file, (url) => {
        const productId = document.getElementById('productId').value;
        addExtraImagePreview(url, productId);
      }, 'extraImageStatus');
    }
    statusEl.textContent = files.length ? `${files.length} image(s) uploaded.` : '';
  });

  document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('productFormError');
    errorEl.textContent = '';

    const name = document.getElementById('name').value.trim();
    const mainImage = document.getElementById('mainImage').value;
    if (!mainImage) { errorEl.textContent = 'Please upload a main product image before saving.'; return; }

    const id = document.getElementById('productId').value;
    const payload = {
      name,
      slug: slugify(name) + (id ? '' : '-' + Date.now().toString(36)),
      brand_id: document.getElementById('brand').value || null,
      category_id: document.getElementById('category').value || null,
      subcategory: document.getElementById('subcategory').value || null,
      short_description: document.getElementById('shortDescription').value || null,
      description: document.getElementById('description').value || null,
      price: numOrNull(document.getElementById('price').value),
      original_price: numOrNull(document.getElementById('originalPrice').value),
      currency: document.getElementById('currency').value,
      watch_type: document.getElementById('watchType').value || null,
      movement: document.getElementById('movement').value || null,
      strap_material: document.getElementById('strapMaterial').value || null,
      case_material: document.getElementById('caseMaterial').value || null,
      dial_color: document.getElementById('dialColor').value || null,
      case_size: document.getElementById('caseSize').value || null,
      water_resistance: document.getElementById('waterResistance').value || null,
      gender: document.getElementById('gender').value || null,
      style: document.getElementById('style').value || null,
      occasion: document.getElementById('occasion').value || null,
      rating: numOrNull(document.getElementById('rating').value),
      rating_count: numOrNull(document.getElementById('ratingCount').value),
      retailer: document.getElementById('retailer').value || null,
      affiliate_network: document.getElementById('affiliateNetwork').value || null,
      affiliate_url: document.getElementById('affiliateUrl').value || null,
      affiliate_disclosure: document.getElementById('affiliateDisclosure').value || null,
      main_image: mainImage,
      image_alt: document.getElementById('imageAlt').value || name,
      status: document.getElementById('status').value,
      is_featured: document.getElementById('isFeatured').checked,
      is_deal: document.getElementById('isDeal').checked,
      is_editor_pick: document.getElementById('isEditorPick').checked,
      seo_title: document.getElementById('seoTitle').value || name,
      seo_description: document.getElementById('seoDescription').value || document.getElementById('shortDescription').value || null,
      keywords: document.getElementById('keywords').value || null
    };
    if (!id) payload.created_by = CURRENT_USER.session.user.id;
    if (id) delete payload.slug; // never change the slug of an existing product (keeps URLs stable)

    const saveBtn = document.getElementById('saveProductBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Saving…';

    const { error } = id
      ? await window.db.from('products').update(payload).eq('id', id)
      : await window.db.from('products').insert(payload);

    saveBtn.disabled = false;
    saveBtn.textContent = id ? 'Update Product' : 'Save Product';

    if (error) { errorEl.textContent = 'Unable to save product: ' + error.message; return; }

    EDIT_MODE = false;
    await showView('products');
  });
}

function numOrNull(v) { return v === '' || v === null || v === undefined ? null : Number(v); }

async function uploadImage(file, onSuccess, statusElId) {
  const statusEl = document.getElementById(statusElId);
  statusEl.textContent = 'Uploading…';
  statusEl.className = 'upload-status uploading';
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
  const { error } = await window.db.storage.from('product-images').upload(path, file, { cacheControl: '3600', upsert: false });
  if (error) {
    statusEl.textContent = 'Upload failed: ' + error.message;
    statusEl.className = 'upload-status error';
    return;
  }
  const { data } = window.db.storage.from('product-images').getPublicUrl(path);
  statusEl.textContent = 'Uploaded.';
  statusEl.className = 'upload-status success';
  onSuccess(data.publicUrl);
}

function addExtraImagePreview(url, productId) {
  const container = document.getElementById('extraImagesPreview');
  const div = document.createElement('div');
  div.className = 'thumb';
  div.innerHTML = `<img src="${esc(url)}"><button type="button" title="Remove">×</button>`;
  div.querySelector('button').addEventListener('click', async () => {
    div.remove();
    if (productId) await window.db.from('product_images').delete().eq('product_id', productId).eq('image_url', url);
  });
  container.appendChild(div);
  if (productId) window.db.from('product_images').insert({ product_id: productId, image_url: url });
}

function renderExtraImagePreviews(images) {
  const container = document.getElementById('extraImagesPreview');
  container.innerHTML = '';
  images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).forEach(img => addExtraImagePreviewExisting(img.image_url));
}
function addExtraImagePreviewExisting(url) {
  const container = document.getElementById('extraImagesPreview');
  const div = document.createElement('div');
  div.className = 'thumb';
  div.innerHTML = `<img src="${esc(url)}"><button type="button" title="Remove">×</button>`;
  div.querySelector('button').addEventListener('click', async () => {
    div.remove();
    const productId = document.getElementById('productId').value;
    if (productId) await window.db.from('product_images').delete().eq('product_id', productId).eq('image_url', url);
  });
  container.appendChild(div);
}

// ---------------------------------------------------------------------
// CATEGORIES
// ---------------------------------------------------------------------
function wireCategoryForm() {
  document.getElementById('categoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('categoryName');
    const name = input.value.trim();
    if (!name) return;
    const { error } = await window.db.from('categories').insert({ name, slug: slugify(name) });
    if (error) return alert('Unable to add category: ' + error.message);
    input.value = '';
    await loadLookups();
    await loadCategoriesTable();
  });
}

async function loadCategoriesTable() {
  const { data, error } = await window.db.from('categories').select('*, products(count)').order('name');
  if (error) { console.error(error); return; }
  document.getElementById('categoriesTable').innerHTML = data.length ? `
    <table class="admin-table"><thead><tr><th>Name</th><th>Slug</th><th>Products</th><th>Actions</th></tr></thead><tbody>
    ${data.map(c => `<tr><td>${esc(c.name)}</td><td>${esc(c.slug)}</td><td>${c.products?.[0]?.count ?? 0}</td>
      <td class="row-actions"><button class="danger" data-del-cat="${c.id}">Delete</button></td></tr>`).join('')}
    </tbody></table>` : emptyRow('No categories yet.');
  document.querySelectorAll('[data-del-cat]').forEach(btn => btn.onclick = async () => {
    if (!confirm('Delete this category? Products in it will keep their data but lose the category link.')) return;
    await window.db.from('categories').delete().eq('id', btn.dataset.delCat);
    await loadLookups();
    await loadCategoriesTable();
  });
}

// ---------------------------------------------------------------------
// BRANDS
// ---------------------------------------------------------------------
function wireBrandForm() {
  document.getElementById('brandForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = document.getElementById('brandName');
    const name = input.value.trim();
    if (!name) return;
    const { error } = await window.db.from('brands').insert({ name, slug: slugify(name) });
    if (error) return alert('Unable to add brand: ' + error.message);
    input.value = '';
    await loadLookups();
    await loadBrandsTable();
  });
}

async function loadBrandsTable() {
  const { data, error } = await window.db.from('brands').select('*, products(count)').order('name');
  if (error) { console.error(error); return; }
  document.getElementById('brandsTable').innerHTML = data.length ? `
    <table class="admin-table"><thead><tr><th>Name</th><th>Slug</th><th>Products</th><th>Actions</th></tr></thead><tbody>
    ${data.map(b => `<tr><td>${esc(b.name)}</td><td>${esc(b.slug)}</td><td>${b.products?.[0]?.count ?? 0}</td>
      <td class="row-actions"><button class="danger" data-del-brand="${b.id}">Delete</button></td></tr>`).join('')}
    </tbody></table>` : emptyRow('No brands yet.');
  document.querySelectorAll('[data-del-brand]').forEach(btn => btn.onclick = async () => {
    if (!confirm('Delete this brand? Products with it will keep their data but lose the brand link.')) return;
    await window.db.from('brands').delete().eq('id', btn.dataset.delBrand);
    await loadLookups();
    await loadBrandsTable();
  });
}

// ---------------------------------------------------------------------
// AFFILIATE LINKS (read-only overview, sourced from products table)
// ---------------------------------------------------------------------
async function loadAffiliateTable() {
  const { data, error } = await window.db.from('products').select('name, retailer, affiliate_network, affiliate_url, status').not('affiliate_url', 'is', null).order('name');
  if (error) { console.error(error); return; }
  document.getElementById('affiliateTable').innerHTML = data.length ? `
    <table class="admin-table"><thead><tr><th>Product</th><th>Retailer</th><th>Network</th><th>URL</th><th>Status</th></tr></thead><tbody>
    ${data.map(p => `<tr><td>${esc(p.name)}</td><td>${esc(p.retailer || '—')}</td><td>${esc(p.affiliate_network || '—')}</td>
      <td style="max-width:260px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;"><a href="${esc(p.affiliate_url)}" target="_blank" style="color:var(--gold)">${esc(p.affiliate_url)}</a></td>
      <td><span class="status-badge ${p.status}">${p.status}</span></td></tr>`).join('')}
    </tbody></table>` : emptyRow('No affiliate links yet. Add one from a product\'s Add/Edit form.');
}

// ---------------------------------------------------------------------
// MEDIA LIBRARY
// ---------------------------------------------------------------------
function wireMediaLibrary() {
  document.getElementById('libraryUploadFile').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    await uploadImage(file, () => loadMediaGrid(), 'libraryUploadStatus');
  });
}

async function loadMediaGrid() {
  const { data, error } = await window.db.storage.from('product-images').list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
  const grid = document.getElementById('mediaGrid');
  if (error || !data || !data.length) { grid.innerHTML = emptyRow('No images uploaded yet.'); return; }
  grid.innerHTML = data.map(file => {
    const { data: pub } = window.db.storage.from('product-images').getPublicUrl(file.name);
    return `<div class="thumb" style="width:110px;height:110px;"><img src="${esc(pub.publicUrl)}" title="${esc(file.name)}"></div>`;
  }).join('');
}

// ---------------------------------------------------------------------
// SETTINGS
// ---------------------------------------------------------------------
async function loadSettingsForm() {
  const { data } = await window.db.from('site_settings').select('*').eq('id', 1).maybeSingle();
  if (!data) return;
  document.getElementById('setSiteName').value = data.site_name || '';
  document.getElementById('setContactEmail').value = data.contact_email || '';
  document.getElementById('setCurrency').value = data.default_currency || 'INR';
  document.getElementById('setInstagram').value = data.instagram_url || '';
  document.getElementById('setYoutube').value = data.youtube_url || '';
  document.getElementById('setFacebook').value = data.facebook_url || '';
  document.getElementById('setPinterest').value = data.pinterest_url || '';
  document.getElementById('setDisclosure').value = data.affiliate_disclosure || '';
}

function wireSettingsForm() {
  document.getElementById('settingsForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('settingsMessage');
    const payload = {
      site_name: document.getElementById('setSiteName').value || 'NewWatchGuy',
      contact_email: document.getElementById('setContactEmail').value || null,
      default_currency: document.getElementById('setCurrency').value,
      instagram_url: document.getElementById('setInstagram').value || null,
      youtube_url: document.getElementById('setYoutube').value || null,
      facebook_url: document.getElementById('setFacebook').value || null,
      pinterest_url: document.getElementById('setPinterest').value || null,
      affiliate_disclosure: document.getElementById('setDisclosure').value || null
    };
    const { error } = await window.db.from('site_settings').update(payload).eq('id', 1);
    msg.style.color = error ? '#ef7777' : '#6fbf73';
    msg.textContent = error ? 'Unable to save: ' + error.message : 'Settings saved.';
  });
}

// ---------------------------------------------------------------------
// PROFILE
// ---------------------------------------------------------------------
async function loadProfileForm() {
  document.getElementById('profileEmail').textContent = CURRENT_USER.session.user.email;
  document.getElementById('profileFullName').value = CURRENT_USER.profile.full_name || '';
}

function wireProfileForms() {
  document.getElementById('profileForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('profileFullName').value.trim();
    const { error } = await window.db.from('profiles').update({ full_name: fullName }).eq('id', CURRENT_USER.session.user.id);
    if (error) return alert('Unable to update profile: ' + error.message);
    CURRENT_USER.profile.full_name = fullName;
    alert('Profile updated.');
  });

  document.getElementById('passwordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = document.getElementById('passwordMessage');
    const newPassword = document.getElementById('newPassword').value;
    const { error } = await window.db.auth.updateUser({ password: newPassword });
    msg.style.color = error ? '#ef7777' : '#6fbf73';
    msg.textContent = error ? error.message : 'Password updated successfully.';
    if (!error) document.getElementById('passwordForm').reset();
  });
}

// ---------------------------------------------------------------------
// UTILITIES
// ---------------------------------------------------------------------
function esc(v) {
  return String(v ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
}
function debounce(fn, wait) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}
