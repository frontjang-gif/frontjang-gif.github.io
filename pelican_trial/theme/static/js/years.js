(() => {
  const storageKey = 'pelican-movie-year-mode';
  let mode = '10';
  try { if (localStorage.getItem(storageKey) === '1') mode = '1'; } catch (_) {}
  function apply(value) {
    mode = value;
    document.querySelectorAll('[data-year-view]').forEach(view => { view.hidden = view.dataset.yearView !== mode; });
    document.querySelectorAll('[data-year-mode]').forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.yearMode === mode));
    });
  }
  document.querySelectorAll('[data-year-mode]').forEach(button => {
    button.addEventListener('click', () => {
      apply(button.dataset.yearMode);
      try { localStorage.setItem(storageKey, mode); } catch (_) {}
    });
  });
  apply(mode);
})();
