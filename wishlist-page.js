document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('wishlistGrid');
  const slugs = NWG.getWishlist();
  if (!slugs.length) {
    grid.innerHTML = '<div class="wishlist-empty">Your wishlist is empty. <a href="products.html">Browse watches →</a></div>';
    return;
  }
  const results = await Promise.all(slugs.map(s => NWG.fetchProductBySlug(s)));
  const products = results.filter(Boolean);
  if (!products.length) {
    grid.innerHTML = '<div class="wishlist-empty">Your saved watches are no longer available. <a href="products.html">Browse watches →</a></div>';
    return;
  }
  grid.innerHTML = products.map(p => NWG.productCardHTML(p)).join('');
  window.addEventListener('nwg:wishlist-changed', () => location.reload());
  window.dispatchEvent(new CustomEvent('nwg:content-loaded'));
});
