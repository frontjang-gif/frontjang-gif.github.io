(() => {
  const key = 'pelican-catalog-preferences';
  let preferences = {};
  try { preferences = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch (_) {}
  document.querySelectorAll('.catalog').forEach(catalog => {
    const items = [...catalog.querySelectorAll('.catalog-items > .card')];
    const count = catalog.querySelector('.item-count');
    const pagination = catalog.querySelector('.catalog-pagination');
    const previous = catalog.querySelector('.previous');
    const next = catalog.querySelector('.next');
    const buttons = catalog.querySelectorAll('[data-view]');
    let page = 0;
    count.value = ['5', '10', '20', 'all'].includes(preferences.count) ? preferences.count : '20';
    catalog.dataset.view = ['text', 'preview', 'tiles'].includes(preferences.view) ? preferences.view : 'preview';
    function render() {
      const size = count.value === 'all' ? Math.max(items.length, 1) : Number(count.value);
      const pages = Math.max(1, Math.ceil(items.length / size));
      page = Math.max(0, Math.min(page, pages - 1));
      items.forEach((item, index) => { item.hidden = index < page * size || index >= (page + 1) * size; });
      pagination.querySelector('[role="status"]').textContent = `${items.length} items · ${page + 1} / ${pages}`;
      previous.disabled = page === 0;
      next.disabled = page >= pages - 1;
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.view === catalog.dataset.view)));
    }
    function save() {
      try { localStorage.setItem(key, JSON.stringify({count: count.value, view: catalog.dataset.view})); } catch (_) {}
    }
    count.addEventListener('change', () => { page = 0; render(); save(); });
    buttons.forEach(button => button.addEventListener('click', () => { catalog.dataset.view = button.dataset.view; render(); save(); }));
    previous.addEventListener('click', () => { page--; render(); catalog.scrollIntoView({block: 'start'}); });
    next.addEventListener('click', () => { page++; render(); catalog.scrollIntoView({block: 'start'}); });
    catalog.querySelector('.catalog-controls').hidden = false;
    pagination.hidden = false;
    render();
  });
})();
