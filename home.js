/**
 * NewWatchGuy — homepage dynamic sections.
 * Populates categories, trending, editor's picks, brands and deals
 * from Supabase so the admin never has to edit this HTML file.
 */
document.addEventListener('DOMContentLoaded', async () => {
  const CATEGORY_IMAGES = {
    'mens-watches': 'images/watch-mens.jpg',
    'womens-watches': 'images/watch-womens.jpg',
    'luxury-watches': 'images/watch-chronograph.jpg',
    'automatic-watches': 'images/watch-automatic.jpg',
    'smart-watches': 'images/watch-smart.jpg',
    'chronograph': 'images/watch-chronograph.jpg',
    'dress-watches': 'images/watch-mens.jpg',
    'casual-watches': 'images/watch-womens.jpg',
    'budget-watches': 'images/watch-automatic.jpg'
  };

  const categoryGrid = document.getElementById('categoryGrid');
  const trendingGrid = document.getElementById('trendingGrid');
  const editorsGrid = document.getElementById('editorsGrid');
  const brandsGrid = document.getElementById('brandsGrid');
  const dealsGrid = document.getElementById('dealsGrid');

  function emptyState(el, msg) {
    if (el) el.innerHTML = `<p class="empty-state">${NWG.escapeHtml(msg)}</p>`;
  }

  try {
    if (categoryGrid) {
      const categories = await NWG.fetchCategories();
      categoryGrid.innerHTML = categories.length
        ? categories.map(c => NWG.categoryCardHTML(c, CATEGORY_IMAGES[c.slug] || 'images/watch-mens.jpg')).join('')
        : '';
      if (!categories.length) emptyState(categoryGrid, 'Categories will appear here once added in the Admin Panel.');
    }

    if (trendingGrid) {
      const { data } = await NWG.fetchProducts({ isFeatured: true, limit: 8 });
      const items = data.length ? data : (await NWG.fetchProducts({ limit: 8 })).data;
      trendingGrid.innerHTML = items.length
        ? items.map(p => NWG.productCardHTML(p)).join('')
        : '';
      if (!items.length) emptyState(trendingGrid, 'No products published yet. Add your first product from the Admin Panel.');
    }

    if (editorsGrid) {
      const { data } = await NWG.fetchProducts({ isEditorPick: true, limit: 4 });
      editorsGrid.innerHTML = data.length ? data.map(p => NWG.editorCardHTML(p)).join('') : '';
      if (!data.length) emptyState(editorsGrid, 'Mark products as "Editor\'s Pick" in the Admin Panel to feature them here.');
    }

    if (brandsGrid) {
      const brands = await NWG.fetchBrands();
      brandsGrid.innerHTML = brands.length ? brands.map(b => NWG.brandCardHTML(b)).join('') : '';
      if (!brands.length) emptyState(brandsGrid, 'Brands will appear here once added in the Admin Panel.');
    }

    if (dealsGrid) {
      const { data } = await NWG.fetchProducts({ isDeal: true, limit: 4, sort: 'discount' });
      dealsGrid.innerHTML = data.length ? data.map(p => NWG.productCardHTML(p, { dealCard: true, showDealBadge: true })).join('') : '';
      if (!data.length) emptyState(dealsGrid, 'Mark products as "Deal" in the Admin Panel to feature them here.');
    }

    window.dispatchEvent(new CustomEvent('nwg:content-loaded'));
  } catch (err) {
    console.error('NewWatchGuy: failed to load homepage content', err);
  }
});
