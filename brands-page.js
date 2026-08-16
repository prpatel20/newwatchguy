document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('brandsGridFull');
  const brands = await NWG.fetchBrands();
  grid.innerHTML = brands.length ? brands.map(b => NWG.brandCardHTML(b)).join('')
    : '<p class="empty-state">Brands will appear here once added in the Admin Panel.</p>';
  window.dispatchEvent(new CustomEvent('nwg:content-loaded'));
});
