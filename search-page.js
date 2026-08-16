document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(location.search);
  const q = params.get('q') || '';
  document.getElementById('searchTitle').textContent = q ? `Results for "${q}"` : 'Search Watches';
  const input = document.getElementById('searchInput');
  if (input) input.value = q;

  const grid = document.getElementById('searchGrid');
  const summary = document.getElementById('searchSummary');

  if (!q.trim()) {
    summary.textContent = 'Type a brand, category or keyword above to search our full catalog.';
    grid.innerHTML = '';
    return;
  }

  summary.textContent = 'Searching…';
  const { data, count } = await NWG.fetchProducts({ search: q, limit: 48 });
  summary.textContent = `${count} watch${count === 1 ? '' : 'es'} found for "${q}"`;
  grid.innerHTML = data.length ? data.map(p => NWG.productCardHTML(p)).join('')
    : `<p class="empty-state">No watches found for "${NWG.escapeHtml(q)}". Try a different brand or keyword.</p>`;
  window.dispatchEvent(new CustomEvent('nwg:content-loaded'));
});
