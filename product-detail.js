/**
 * NewWatchGuy — Product detail page (product.html?slug=...)
 */
document.addEventListener('DOMContentLoaded', async () => {
  const root = document.getElementById('productDetailRoot');
  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');

  if (!slug) {
    root.innerHTML = notFoundHTML();
    return;
  }

  const p = await NWG.fetchProductBySlug(slug);
  if (!p) {
    root.innerHTML = notFoundHTML();
    return;
  }

  document.title = `${p.seo_title || p.name} — NewWatchGuy`;
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.setAttribute('content', p.seo_description || p.short_description || '');

  // Structured data (Product schema)
  const ld = document.createElement('script');
  ld.type = 'application/ld+json';
  ld.textContent = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.name,
    image: p.main_image,
    description: p.short_description || '',
    brand: { '@type': 'Brand', name: p.brands?.name || '' },
    offers: {
      '@type': 'Offer',
      price: p.price,
      priceCurrency: p.currency || 'INR',
      url: location.href,
      availability: 'https://schema.org/InStock'
    },
    ...(p.rating ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.rating_count || 1 } } : {})
  });
  document.head.appendChild(ld);

  const images = [p.main_image, ...(p.product_images || []).sort((a, b) => a.sort_order - b.sort_order).map(i => i.image_url)].filter(Boolean);

  const specs = [
    ['Watch Type', p.watch_type], ['Movement', p.movement], ['Case Material', p.case_material],
    ['Strap Material', p.strap_material], ['Dial Color', p.dial_color], ['Case Size', p.case_size],
    ['Water Resistance', p.water_resistance], ['Gender', p.gender], ['Style', p.style], ['Occasion', p.occasion]
  ].filter(([, v]) => v);

  const wished = NWG.isWishlisted(p.slug);
  const disclosure = p.affiliate_disclosure || 'NewWatchGuy may earn a commission when you purchase through this link, at no additional cost to you.';

  root.innerHTML = `
  <div class="product-detail">
    <div class="pd-gallery">
      <img class="pd-gallery-main" id="pdMainImg" src="${NWG.escapeHtml(images[0] || 'images/watch-mens.jpg')}" alt="${NWG.escapeHtml(p.image_alt || p.name)}">
      ${images.length > 1 ? `<div class="pd-thumbs">${images.map((img, i) => `<img src="${NWG.escapeHtml(img)}" class="${i === 0 ? 'active' : ''}" data-full="${NWG.escapeHtml(img)}">`).join('')}</div>` : ''}
    </div>
    <div class="pd-info">
      <div class="breadcrumbs"><a href="index.html">Home</a> / <a href="products.html">Watches</a> / ${NWG.escapeHtml(p.name)}</div>
      <span class="pd-brand">${NWG.escapeHtml(p.brands?.name || '')}</span>
      <h1 class="pd-name">${NWG.escapeHtml(p.name)}</h1>
      ${p.rating ? `<div class="pd-rating"><span class="stars">${NWG.starString(p.rating)}</span><span class="rating-count">(${p.rating_count || 0} ratings)</span></div>` : ''}
      <div class="pd-price">
        <span class="price-current">${NWG.formatPrice(p.price, p.currency)}</span>
        ${p.original_price ? `<span class="price-original">${NWG.formatPrice(p.original_price, p.currency)}</span>` : ''}
        ${p.discount_percent > 0 ? `<span class="price-discount">${Math.round(p.discount_percent)}% off</span>` : ''}
      </div>
      <div id="pdDesc" class="pd-desc collapsed">${NWG.escapeHtml(p.description || p.short_description || '')}</div>
      <button class="pd-see-more" id="pdSeeMore">See more</button>
      ${specs.length ? `<div class="pd-specs">${specs.map(([k, v]) => `<div><span>${k}</span><span>${NWG.escapeHtml(v)}</span></div>`).join('')}</div>` : ''}
      <div class="pd-cta-row">
        <a href="${NWG.escapeHtml(p.affiliate_url || '#')}" target="_blank" rel="nofollow sponsored noopener" class="btn btn-primary" id="pdCheckPrice">CHECK PRICE ${p.retailer ? 'ON ' + NWG.escapeHtml(p.retailer.toUpperCase()) : ''}</a>
        <button class="btn btn-outline" id="pdWishlistBtn" data-wishlist="${NWG.escapeHtml(p.slug)}">${wished ? '♥ WISHLISTED' : '♡ ADD TO WISHLIST'}</button>
      </div>
      <p class="pd-disclosure">${NWG.escapeHtml(disclosure)}</p>
    </div>
  </div>`;

  // See more / see less
  const descEl = document.getElementById('pdDesc');
  const seeMoreBtn = document.getElementById('pdSeeMore');
  if (descEl.scrollHeight <= 100) seeMoreBtn.style.display = 'none';
  seeMoreBtn.addEventListener('click', () => {
    const collapsed = descEl.classList.toggle('collapsed');
    seeMoreBtn.textContent = collapsed ? 'See more' : 'See less';
  });

  // Gallery thumbs
  document.querySelectorAll('.pd-thumbs img').forEach(img => {
    img.addEventListener('click', () => {
      document.getElementById('pdMainImg').src = img.dataset.full;
      document.querySelectorAll('.pd-thumbs img').forEach(t => t.classList.remove('active'));
      img.classList.add('active');
    });
  });

  // Wishlist button
  document.getElementById('pdWishlistBtn').addEventListener('click', function () {
    const active = NWG.toggleWishlist(p.slug);
    this.textContent = active ? '♥ WISHLISTED' : '♡ ADD TO WISHLIST';
  });

  // Affiliate click tracking (fire-and-forget, never blocks navigation)
  document.getElementById('pdCheckPrice').addEventListener('click', () => {
    NWG.logClick(p.id, p.retailer, 'product-detail');
  });

  // Related products
  const related = await NWG.fetchRelated(p, 4);
  if (related.length) {
    document.getElementById('relatedGrid').innerHTML = related.map(r => NWG.productCardHTML(r)).join('');
    document.getElementById('relatedSection').hidden = false;
  }

  window.dispatchEvent(new CustomEvent('nwg:content-loaded'));

  function notFoundHTML() {
    return `<div class="page-header"><h1>Watch Not Found</h1><p>This product may have been unpublished or removed. <a href="products.html" style="color:var(--color-gold)">Browse all watches →</a></p></div>`;
  }
});
