/**
 * NewWatchGuy — shared product data + rendering helpers.
 * Used by index.html, products.html, product.html, brands.html,
 * categories.html, deals.html, search.html, wishlist.html.
 * Requires js/config.js + js/supabase-client.js to be loaded first.
 */

const NWG = (function () {

  function escapeHtml(v) {
    return String(v ?? '').replace(/[&<>'"]/g, c => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[c]));
  }

  function formatPrice(n, currency) {
    if (n === null || n === undefined || n === '') return '';
    const symbol = currency === 'USD' ? '$' : '₹';
    return symbol + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 0 });
  }

  function starString(rating) {
    const r = Math.round(Number(rating) || 0);
    return '★★★★★'.slice(0, r) + '☆☆☆☆☆'.slice(0, 5 - r);
  }

  function productHref(p) {
    return `product.html?slug=${encodeURIComponent(p.slug)}`;
  }

  function isWishlisted(slug) {
    return getWishlist().includes(slug);
  }

  function getWishlist() {
    try { return JSON.parse(localStorage.getItem('nwg_wishlist') || '[]'); }
    catch { return []; }
  }

  function setWishlist(list) {
    localStorage.setItem('nwg_wishlist', JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('nwg:wishlist-changed'));
  }

  function toggleWishlist(slug) {
    let list = getWishlist();
    if (list.includes(slug)) list = list.filter(s => s !== slug);
    else list.push(slug);
    setWishlist(list);
    return list.includes(slug);
  }

  // ---- Card renderers (reuse the site's existing CSS classes) ----

  function productCardHTML(p, opts = {}) {
    const brandName = p.brands?.name || p.brand_name || '';
    const spec = [p.case_material, p.movement, p.water_resistance].filter(Boolean).join(' · ');
    const wished = isWishlisted(p.slug);
    const dealBadge = (opts.showDealBadge && p.is_deal && p.discount_percent > 0)
      ? `<span class="deal-badge">${Math.round(p.discount_percent)}% OFF</span>` : '';
    return `
    <div class="product-card${opts.dealCard ? ' deal-card' : ''} reveal">
      <a href="${productHref(p)}" class="product-img-wrap" aria-label="${escapeHtml(p.name)}">
        <img src="${escapeHtml(p.main_image || 'images/watch-mens.jpg')}" alt="${escapeHtml(p.image_alt || p.name)}" loading="lazy" width="400" height="400">
        ${dealBadge}
        <button class="product-wishlist${wished ? ' active' : ''}" aria-label="Add to wishlist" data-wishlist="${escapeHtml(p.slug)}" onclick="event.preventDefault();NWG.handleWishlistClick(this)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
        </button>
      </a>
      <div class="product-info">
        <span class="product-brand">${escapeHtml(brandName)}</span>
        <h3 class="product-name"><a href="${productHref(p)}">${escapeHtml(p.name)}</a></h3>
        ${p.rating ? `<div class="product-rating"><span class="stars">${starString(p.rating)}</span><span class="rating-count">(${p.rating_count || 0})</span></div>` : ''}
        ${spec ? `<p class="product-spec">${escapeHtml(spec)}</p>` : ''}
        <div class="product-price">
          <span class="price-current">${formatPrice(p.price, p.currency)}</span>
          ${p.original_price ? `<span class="price-original">${formatPrice(p.original_price, p.currency)}</span>` : ''}
          ${p.discount_percent > 0 ? `<span class="price-discount">${Math.round(p.discount_percent)}% off</span>` : ''}
        </div>
        ${opts.dealCard ? `<span class="deal-retailer">via ${escapeHtml(p.retailer || 'Retailer')}</span>` : ''}
        <a href="${productHref(p)}" class="btn ${opts.dealCard ? 'btn-primary-sm' : 'btn-outline-sm'}">${opts.dealCard ? 'Check Price' : 'View Watch'}</a>
      </div>
    </div>`;
  }

  function editorCardHTML(p) {
    return `
    <div class="editor-card reveal">
      <div class="editor-img-wrap">
        <a href="${productHref(p)}"><img src="${escapeHtml(p.main_image || 'images/watch-mens.jpg')}" alt="${escapeHtml(p.image_alt || p.name)}" loading="lazy" width="500" height="600"></a>
        <span class="editor-badge">Editor's Pick</span>
      </div>
      <div class="editor-info">
        <span class="editor-brand">${escapeHtml(p.brands?.name || '')}</span>
        <h3 class="editor-name">${escapeHtml(p.name)}</h3>
        <div class="editor-reason"><p>${escapeHtml(p.short_description || '')}</p></div>
        <div class="editor-meta">
          <span class="editor-price">${formatPrice(p.price, p.currency)}</span>
          <span class="editor-best-for">${escapeHtml(p.occasion || '')}</span>
        </div>
        <a href="${productHref(p)}" class="btn btn-outline-sm">View Details</a>
      </div>
    </div>`;
  }

  function brandCardHTML(b) {
    return `<a href="products.html?brand=${encodeURIComponent(b.slug)}" class="brand-card"><span class="brand-name-text">${escapeHtml(b.name.toUpperCase())}</span></a>`;
  }

  function categoryCardHTML(c, img) {
    return `
    <a href="products.html?category=${encodeURIComponent(c.slug)}" class="category-card reveal">
      <div class="category-img-wrap"><img src="${escapeHtml(img)}" alt="${escapeHtml(c.name)}" loading="lazy" width="400" height="533"></div>
      <div class="category-info">
        <h3 class="category-name">${escapeHtml(c.name)}</h3>
        <span class="category-cta">Explore <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></span>
      </div>
    </a>`;
  }

  function handleWishlistClick(btn) {
    const slug = btn.dataset.wishlist;
    const active = toggleWishlist(slug);
    btn.classList.toggle('active', active);
    document.querySelectorAll(`[data-wishlist="${CSS.escape(slug)}"]`).forEach(b => b.classList.toggle('active', active));
  }

  // ---- Data access (Supabase) ----

  async function fetchCategories() {
    const { data, error } = await window.db.from('categories').select('*').order('name');
    if (error) { console.error(error); return []; }
    return data || [];
  }

  async function fetchBrands() {
    const { data, error } = await window.db.from('brands').select('*').order('name');
    if (error) { console.error(error); return []; }
    return data || [];
  }

  async function fetchProducts(filters = {}) {
    let q = window.db.from('products').select('*, brands(name, slug), categories(name, slug)').eq('status', 'published');

    if (filters.categorySlug) q = q.eq('categories.slug', filters.categorySlug);
    if (filters.brandSlug) q = q.eq('brands.slug', filters.brandSlug);
    if (filters.isDeal) q = q.eq('is_deal', true);
    if (filters.isFeatured) q = q.eq('is_featured', true);
    if (filters.isEditorPick) q = q.eq('is_editor_pick', true);
    if (filters.search) {
      const s = filters.search.replace(/[%_]/g, '');
      q = q.or(`name.ilike.%${s}%,short_description.ilike.%${s}%,description.ilike.%${s}%,keywords.ilike.%${s}%`);
    }
    if (filters.minPrice) q = q.gte('price', filters.minPrice);
    if (filters.maxPrice) q = q.lte('price', filters.maxPrice);
    if (filters.minRating) q = q.gte('rating', filters.minRating);

    switch (filters.sort) {
      case 'price_asc': q = q.order('price', { ascending: true }); break;
      case 'price_desc': q = q.order('price', { ascending: false }); break;
      case 'rating': q = q.order('rating', { ascending: false }); break;
      case 'discount': q = q.order('discount_percent', { ascending: false }); break;
      case 'newest': q = q.order('created_at', { ascending: false }); break;
      default: q = q.order('created_at', { ascending: false });
    }

    const limit = filters.limit || 24;
    const offset = filters.offset || 0;
    q = q.range(offset, offset + limit - 1);

    const { data, error, count } = await q;
    if (error) { console.error(error); return { data: [], count: 0 }; }

    // categorySlug/brandSlug filters above use inner-join semantics via .eq on
    // the joined table only when Supabase treats it as a filter on the FK
    // relation; if the joined row is null (no match) filter it client-side too.
    let rows = data || [];
    if (filters.categorySlug) rows = rows.filter(r => r.categories?.slug === filters.categorySlug);
    if (filters.brandSlug) rows = rows.filter(r => r.brands?.slug === filters.brandSlug);

    return { data: rows, count: count ?? rows.length };
  }

  async function fetchProductBySlug(slug) {
    const { data, error } = await window.db
      .from('products')
      .select('*, brands(name, slug), categories(name, slug), product_images(image_url, alt_text, sort_order)')
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle();
    if (error) { console.error(error); return null; }
    return data;
  }

  async function fetchRelated(product, limit = 4) {
    if (!product) return [];
    let q = window.db.from('products').select('*, brands(name,slug)').eq('status', 'published').neq('id', product.id).limit(limit);
    if (product.category_id) q = q.eq('category_id', product.category_id);
    const { data, error } = await q;
    if (error) { console.error(error); return []; }
    return data || [];
  }

  async function logClick(productId, retailer, page) {
    try {
      await window.db.from('product_clicks').insert({ product_id: productId, retailer, page: page || location.pathname });
    } catch (e) { /* non-fatal */ }
  }

  async function subscribeNewsletter(email) {
    const { error } = await window.db.from('newsletter_subscribers').insert({ email });
    if (error) {
      if (error.code === '23505') return { ok: false, message: 'This email is already subscribed.' };
      console.error(error);
      return { ok: false, message: 'Something went wrong. Please try again.' };
    }
    return { ok: true, message: 'Thank you for subscribing! Check your inbox soon.' };
  }

  async function fetchSettings() {
    const { data, error } = await window.db.from('site_settings').select('*').eq('id', 1).maybeSingle();
    if (error) { console.error(error); return null; }
    return data;
  }

  return {
    escapeHtml, formatPrice, starString, productHref,
    getWishlist, setWishlist, toggleWishlist, isWishlisted, handleWishlistClick,
    productCardHTML, editorCardHTML, brandCardHTML, categoryCardHTML,
    fetchCategories, fetchBrands, fetchProducts, fetchProductBySlug, fetchRelated,
    logClick, subscribeNewsletter, fetchSettings
  };
})();
