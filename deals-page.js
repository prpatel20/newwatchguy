document.addEventListener('DOMContentLoaded', async () => {
  const grid = document.getElementById('dealsGridFull');
  const { data } = await NWG.fetchProducts({ isDeal: true, limit: 48, sort: 'discount' });
  grid.innerHTML = data.length ? data.map(p => NWG.productCardHTML(p, { dealCard: true, showDealBadge: true })).join('')
    : '<p class="empty-state">No active deals right now. Mark products as "Deal" in the Admin Panel to feature them here.</p>';
  window.dispatchEvent(new CustomEvent('nwg:content-loaded'));
});
