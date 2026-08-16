/**
 * NewWatchGuy — Product listing page (products.html)
 * Handles filters, sorting, pagination and URL query params.
 */
document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('productListingGrid');
  const countEl = document.getElementById('listingCount');
  const paginationEl = document.getElementById('pagination');
  const catSelect = document.getElementById('filterCategory');
  const brandSelect = document.getElementById('filterBrand');
  const minPriceInput = document.getElementById('filterMinPrice');
  const maxPriceInput = document.getElementById('filterMaxPrice');
  const ratingSelect = document.getElementById('filterRating');
  const sortSelect = document.getElementById('sortSelect');
  const clearBtn = document.getElementById('filtersClear');
  const mobileToggle = document.getElementById('mobileFilterToggle');
  const filtersPanel = document.getElementById('filtersPanel');

  const PAGE_SIZE = 12;
  let currentPage = 1;
  let totalCount = 0;

  const params = new URLSearchParams(location.search);

  // Populate dropdowns
  const [categories, brands] = await Promise.all([NWG.fetchCategories(), NWG.fetchBrands()]);
  categories.forEach(c => catSelect.insertAdjacentHTML('beforeend', `<option value="${c.slug}">${NWG.escapeHtml(c.name)}</option>`));
  brands.forEach(b => brandSelect.insertAdjacentHTML('beforeend', `<option value="${b.slug}">${NWG.escapeHtml(b.name)}</option>`));

  // Pre-fill from URL params
  if (params.get('category')) catSelect.value = params.get('category');
  if (params.get('brand')) brandSelect.value = params.get('brand');
  if (params.get('minPrice')) minPriceInput.value = params.get('minPrice');
  if (params.get('maxPrice')) maxPriceInput.value = params.get('maxPrice');
  if (params.get('rating')) ratingSelect.value = params.get('rating');
  if (params.get('sort')) sortSelect.value = params.get('sort');

  updatePageHeader();

  function updatePageHeader() {
    const catSlug = catSelect.value;
    const cat = categories.find(c => c.slug === catSlug);
    const title = cat ? cat.name : 'All Watches';
    document.getElementById('pageHeaderTitle').textContent = title;
    document.getElementById('pageBreadcrumbLabel').textContent = title;
    document.title = `${title} — NewWatchGuy`;
  }

  function currentFilters() {
    return {
      categorySlug: catSelect.value || undefined,
      brandSlug: brandSelect.value || undefined,
      minPrice: minPriceInput.value || undefined,
      maxPrice: maxPriceInput.value || undefined,
      minRating: ratingSelect.value || undefined,
      sort: sortSelect.value,
      limit: PAGE_SIZE,
      offset: (currentPage - 1) * PAGE_SIZE
    };
  }

  async function load() {
    grid.innerHTML = '<p class="empty-state">Loading watches…</p>';
    const { data, count } = await NWG.fetchProducts(currentFilters());
    totalCount = count;
    if (!data.length) {
      grid.innerHTML = '<p class="empty-state">No watches match these filters. Try widening your search.</p>';
    } else {
      grid.innerHTML = data.map(p => NWG.productCardHTML(p, { showDealBadge: true })).join('');
    }
    countEl.textContent = totalCount > 0 ? `${totalCount} watch${totalCount === 1 ? '' : 'es'} found` : '0 watches found';
    renderPagination();
    window.dispatchEvent(new CustomEvent('nwg:content-loaded'));
  }

  function renderPagination() {
    const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
    let html = `<button ${currentPage === 1 ? 'disabled' : ''} data-page="${currentPage - 1}">‹</button>`;
    for (let i = 1; i <= totalPages; i++) {
      if (totalPages > 7 && Math.abs(i - currentPage) > 2 && i !== 1 && i !== totalPages) {
        if (i === 2 || i === totalPages - 1) html += `<span style="color:#666;padding:0 4px;">…</span>`;
        continue;
      }
      html += `<button class="${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
    }
    html += `<button ${currentPage === totalPages ? 'disabled' : ''} data-page="${currentPage + 1}">›</button>`;
    paginationEl.innerHTML = html;
    paginationEl.querySelectorAll('button[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        currentPage = Number(btn.dataset.page);
        load();
        window.scrollTo({ top: 300, behavior: 'smooth' });
      });
    });
  }

  [catSelect, brandSelect, ratingSelect, sortSelect].forEach(el => el.addEventListener('change', () => {
    currentPage = 1;
    updatePageHeader();
    load();
  }));
  [minPriceInput, maxPriceInput].forEach(el => el.addEventListener('change', () => { currentPage = 1; load(); }));

  clearBtn.addEventListener('click', () => {
    catSelect.value = ''; brandSelect.value = ''; minPriceInput.value = ''; maxPriceInput.value = '';
    ratingSelect.value = ''; sortSelect.value = 'newest';
    currentPage = 1;
    updatePageHeader();
    load();
  });

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => filtersPanel.classList.toggle('open'));
  }

  load();
});
